package com.kannagi.assignment;

import com.kannagi.assignment.domain.AssignmentStatus;
import com.kannagi.assignment.domain.AssignmentType;
import com.kannagi.assignment.domain.CaseAssignment;
import com.kannagi.assignment.dto.AssignmentDtos.*;
import com.kannagi.case_management.CaseMessageRepository;
import com.kannagi.case_management.CaseRepository;
import com.kannagi.case_management.domain.Case;
import com.kannagi.case_management.domain.CaseMessage;
import com.kannagi.case_management.domain.CaseStatus;
import com.kannagi.case_management.domain.SenderType;
import com.kannagi.common.config.AppProperties;
import com.kannagi.common.exception.BadRequestException;
import com.kannagi.common.exception.ForbiddenException;
import com.kannagi.common.exception.NotFoundException;
import com.kannagi.lawyer.ProfessionalRepository;
import com.kannagi.lawyer.domain.Professional;
import com.kannagi.notification.AdminNotificationService;
import com.kannagi.privacy.consent.Consent;
import com.kannagi.privacy.consent.ConsentRepository;
import com.kannagi.security.CurrentUser;
import com.kannagi.user.UserRepository;
import com.kannagi.user.domain.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Offering a professional to a case, and what happens when they accept,
 * reject, or simply do not answer in time.
 *
 * The escalation path this models: a private request that is rejected, or
 * that sits unanswered past its notice period, makes the case eligible for
 * a PUBLIC assignment. That does not happen automatically — it raises an
 * {@link AdminNotificationService} entry, and an admin picks the next
 * professional. Nothing here reassigns a case on its own; a human decides
 * who a woman's case goes to next, every time.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CaseAssignmentService {

    private final CaseAssignmentRepository assignmentRepository;
    private final CaseRepository caseRepository;
    private final CaseMessageRepository caseMessageRepository;
    private final ProfessionalRepository professionalRepository;
    private final ConsentRepository consentRepository;
    private final UserRepository userRepository;
    private final AdminNotificationService adminNotificationService;
    private final AppProperties props;

    // ── Offering ────────────────────────────────────────────────────

    @Transactional
    public AssignmentResponse offer(UUID caseId, RequestAssignmentRequest request,
                                    CurrentUser currentUser, String accessKey) {
        Case caseEntity = caseRepository.findByIdAndDeletedAtIsNull(caseId)
                .orElseThrow(() -> new NotFoundException("We could not find that case."));

        Professional professional = professionalRepository.findById(request.professionalId())
                .orElseThrow(() -> new NotFoundException("We could not find that professional."));

        if (!professional.isVerified() || !professional.isAcceptingClients()) {
            throw new BadRequestException(
                    "That professional is not currently able to take new cases.");
        }

        if (assignmentRepository.existsByCaseIdAndProfessionalIdAndStatus(
                caseId, professional.getId(), AssignmentStatus.OFFERED)) {
            throw new BadRequestException("You already have an open request with this person.");
        }

        Instant deadline = Instant.now().plus(Duration.ofHours(props.assignment().noticePeriodHours()));

        CaseAssignment assignment = assignmentRepository.save(CaseAssignment.builder()
                .caseId(caseId)
                .professionalId(professional.getId())
                .assignmentType(request.assignmentType())
                .status(AssignmentStatus.OFFERED)
                .noticeDeadline(deadline)
                .build());

        caseEntity.setStatus(CaseStatus.AWAITING_SUPPORT);
        caseEntity.touch();
        caseRepository.save(caseEntity);

        if (request.noteToProfessional() != null && !request.noteToProfessional().isBlank()) {
            persistSystemMessage(caseEntity,
                    "A note was included with this request: " + request.noteToProfessional().trim());
        }
        persistSystemMessage(caseEntity, "Request sent to " + professional.getFullName() + ".");

        return toResponse(assignment, caseEntity, professional);
    }

    // ── The professional's queue ───────────────────────────────────

    @Transactional(readOnly = true)
    public List<AssignmentResponse> myOffers(UUID professionalUserId) {
        Professional professional = requireProfessional(professionalUserId);
        return assignmentRepository
                .findByProfessionalIdAndStatusOrderByOfferedAtDesc(
                        professional.getId(), AssignmentStatus.OFFERED)
                .stream().map(a -> toResponse(a, professional)).toList();
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> myAccepted(UUID professionalUserId) {
        Professional professional = requireProfessional(professionalUserId);
        return assignmentRepository
                .findByProfessionalIdAndStatusOrderByOfferedAtDesc(
                        professional.getId(), AssignmentStatus.ACCEPTED)
                .stream().map(a -> toResponse(a, professional)).toList();
    }

    @Transactional
    public AssignmentResponse respond(UUID assignmentId, RespondRequest request, UUID professionalUserId) {
        Professional professional = requireProfessional(professionalUserId);
        CaseAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new NotFoundException("We could not find that request."));

        if (!assignment.getProfessionalId().equals(professional.getId())) {
            throw new ForbiddenException("That request does not belong to you.");
        }
        if (assignment.getStatus() != AssignmentStatus.OFFERED) {
            throw new BadRequestException("This request has already been responded to.");
        }
        if (request.decision() != AssignmentStatus.ACCEPTED && request.decision() != AssignmentStatus.REJECTED) {
            throw new BadRequestException("Respond with either ACCEPTED or REJECTED.");
        }

        assignment.setStatus(request.decision());
        assignment.setRespondedAt(Instant.now());
        assignment.setResponseNote(request.note());
        assignmentRepository.save(assignment);

        Case caseEntity = caseRepository.findByIdAndDeletedAtIsNull(assignment.getCaseId())
                .orElseThrow(() -> new NotFoundException("We could not find that case."));

        if (request.decision() == AssignmentStatus.ACCEPTED) {
            caseEntity.setStatus(CaseStatus.SUPPORTED);
            caseEntity.touch();
            caseRepository.save(caseEntity);
            persistSystemMessage(caseEntity, professional.getFullName() + " accepted this case.");
        } else {
            persistSystemMessage(caseEntity, professional.getFullName() + " was unable to take this case.");
            escalateIfPrivate(assignment, caseEntity);
        }

        return toResponse(assignment, caseEntity, professional);
    }

    // ── Escalation ──────────────────────────────────────────────────

    private void escalateIfPrivate(CaseAssignment assignment, Case caseEntity) {
        if (assignment.getAssignmentType() == AssignmentType.PUBLIC) {
            // Already the public path — nothing further to escalate to.
            return;
        }
        markEscalated(assignment);
        adminNotificationService.raise(
                "CASE_ESCALATED_NEEDS_PUBLIC_ASSIGNMENT", "Case", caseEntity.getId(),
                "Case " + caseEntity.getReference() + " needs a public assignment — "
                + "the private request was not accepted.", "WARN");
    }

    private void markEscalated(CaseAssignment assignment) {
        assignment.setEscalated(true);
        assignment.setEscalatedAt(Instant.now());
        if (assignment.getStatus() == AssignmentStatus.OFFERED) {
            assignment.setStatus(AssignmentStatus.EXPIRED);
        }
        assignmentRepository.save(assignment);
    }

    /**
     * Finds every private offer whose notice period has passed with no answer,
     * and escalates it. Runs every fifteen minutes — frequent enough that a
     * demo with a short notice period behaves the way the slide describes,
     * without needing a person to click anything.
     */
    @Scheduled(fixedDelay = 900_000L)
    @Transactional
    public void sweepExpiredOffers() {
        List<CaseAssignment> overdue = assignmentRepository
                .findByStatusAndNoticeDeadlineBefore(AssignmentStatus.OFFERED, Instant.now());

        for (CaseAssignment assignment : overdue) {
            caseRepository.findByIdAndDeletedAtIsNull(assignment.getCaseId()).ifPresent(caseEntity -> {
                persistSystemMessage(caseEntity, "The notice period for this request passed "
                        + "without a response.");
                escalateIfPrivate(assignment, caseEntity);
            });
        }
        if (!overdue.isEmpty()) {
            log.info("Escalation sweep processed {} overdue assignment(s)", overdue.size());
        }
    }

    // ── Admin: escalation queue and public assignment ────────────────

    @Transactional(readOnly = true)
    public List<EscalatedCaseResponse> escalatedCases() {
        return assignmentRepository.findAll().stream()
                .filter(CaseAssignment::isEscalated)
                .filter(a -> !hasLaterAssignment(a))
                .map(this::toEscalatedResponse)
                .toList();
    }

    private boolean hasLaterAssignment(CaseAssignment assignment) {
        return assignmentRepository.findByCaseIdOrderByCreatedAtDesc(assignment.getCaseId())
                .stream()
                .anyMatch(other -> other.getSupersededAssignmentId() != null
                        && other.getSupersededAssignmentId().equals(assignment.getId()));
    }

    @Transactional
    public AssignmentResponse adminAssignPublic(UUID caseId, AdminAssignRequest request, UUID adminUserId) {
        Case caseEntity = caseRepository.findByIdAndDeletedAtIsNull(caseId)
                .orElseThrow(() -> new NotFoundException("We could not find that case."));
        Professional professional = professionalRepository.findById(request.professionalId())
                .orElseThrow(() -> new NotFoundException("We could not find that professional."));

        CaseAssignment previous = assignmentRepository
                .findFirstByCaseIdOrderByCreatedAtDesc(caseId).orElse(null);

        Instant deadline = Instant.now().plus(Duration.ofHours(props.assignment().noticePeriodHours()));

        CaseAssignment assignment = assignmentRepository.save(CaseAssignment.builder()
                .caseId(caseId)
                .professionalId(professional.getId())
                .assignmentType(AssignmentType.PUBLIC)
                .status(AssignmentStatus.OFFERED)
                .noticeDeadline(deadline)
                .supersededAssignmentId(previous == null ? null : previous.getId())
                .build());

        persistSystemMessage(caseEntity,
                "A public " + (professional.getKind() == Professional.Kind.LAWYER ? "lawyer" : "professional")
                + " has been assigned by an administrator.");

        return toResponse(assignment, caseEntity, professional);
    }

    // ── Messaging into a case the professional has accepted ──────────

    @Transactional
    public void sendMessageToCase(UUID caseId, SendMessageRequest request, UUID professionalUserId) {
        Professional professional = requireProfessional(professionalUserId);
        requireAcceptedAssignment(caseId, professional.getId());

        Case caseEntity = caseRepository.findByIdAndDeletedAtIsNull(caseId)
                .orElseThrow(() -> new NotFoundException("We could not find that case."));

        // Anonymous or not, the message never records which professional user
        // sent it as a joinable identity here — the case_messages table already
        // treats PROFESSIONAL as a sender type without a name attached, and the
        // professional's own dashboard (not this table) is where their name lives.
        caseMessageRepository.save(CaseMessage.builder()
                .caseEntity(caseEntity)
                .senderType(SenderType.PROFESSIONAL)
                .content(request.content().trim())
                .language(caseEntity.getPrimaryLanguage())
                .build());

        caseEntity.touch();
        caseRepository.save(caseEntity);
    }

    // ── Contact reveal (non-anonymous cases only, consent-gated) ─────

    @Transactional(readOnly = true)
    public ContactInfoResponse contactInfo(UUID caseId, UUID professionalUserId) {
        Professional professional = requireProfessional(professionalUserId);
        requireAcceptedAssignment(caseId, professional.getId());

        Case caseEntity = caseRepository.findByIdAndDeletedAtIsNull(caseId)
                .orElseThrow(() -> new NotFoundException("We could not find that case."));

        if (caseEntity.isAnonymous()) {
            return new ContactInfoResponse(false, null, null,
                    "This is an anonymous case. Send a message through the case instead — "
                    + "it reaches her only through her reference and key.");
        }

        Optional<Consent> consent = consentRepository.findByCaseIdAndConsentTypeAndRevokedAtIsNull(
                caseId, Consent.Type.CONTACT_SHARING);

        if (consent.isEmpty() || !consent.get().isCurrentlyActive()) {
            return new ContactInfoResponse(false, null, null,
                    "She has not shared her contact details for this case yet. "
                    + "Send a message through the case in the meantime.");
        }

        User owner = caseEntity.getOwner();
        if (owner == null || owner.getProfile() == null) {
            return new ContactInfoResponse(false, null, null, "No contact details are on file.");
        }

        return new ContactInfoResponse(true,
                owner.getProfile().getDisplayName(), owner.getProfile().getPhone(),
                "Shared with your consent record on file.");
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private void requireAcceptedAssignment(UUID caseId, UUID professionalId) {
        assignmentRepository.findFirstByCaseIdAndProfessionalIdAndStatus(
                        caseId, professionalId, AssignmentStatus.ACCEPTED)
                .orElseThrow(() -> new ForbiddenException(
                        "You do not have an accepted assignment on this case."));
    }

    private Professional requireProfessional(UUID userId) {
        return professionalRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("No professional profile is on file for this account."));
    }

    private void persistSystemMessage(Case caseEntity, String content) {
        caseMessageRepository.save(CaseMessage.builder()
                .caseEntity(caseEntity)
                .senderType(SenderType.SYSTEM)
                .content(content)
                .language(caseEntity.getPrimaryLanguage())
                .build());
    }

    private AssignmentResponse toResponse(CaseAssignment assignment, Professional professional) {
        Case caseEntity = caseRepository.findByIdAndDeletedAtIsNull(assignment.getCaseId()).orElse(null);
        return toResponse(assignment, caseEntity, professional);
    }

    private AssignmentResponse toResponse(CaseAssignment assignment, Case caseEntity, Professional professional) {
        return new AssignmentResponse(
                assignment.getId(), assignment.getCaseId(),
                caseEntity == null ? null : caseEntity.getReference(),
                assignment.getProfessionalId(), professional == null ? null : professional.getFullName(),
                assignment.getAssignmentType(), assignment.getStatus(),
                assignment.getOfferedAt(), assignment.getRespondedAt(), assignment.getNoticeDeadline(),
                assignment.isEscalated(),
                caseEntity != null && caseEntity.isAnonymous(),
                caseEntity == null ? null : caseEntity.getTitle(),
                caseEntity == null ? null : caseEntity.getSummary());
    }

    private EscalatedCaseResponse toEscalatedResponse(CaseAssignment assignment) {
        Case caseEntity = caseRepository.findByIdAndDeletedAtIsNull(assignment.getCaseId()).orElse(null);
        Professional professional = professionalRepository.findById(assignment.getProfessionalId()).orElse(null);
        return new EscalatedCaseResponse(
                assignment.getCaseId(), caseEntity == null ? null : caseEntity.getReference(),
                caseEntity == null ? null : caseEntity.getLegalPathway().name(),
                assignment.getId(), professional == null ? null : professional.getFullName(),
                assignment.getAssignmentType(), assignment.getEscalatedAt());
    }
}
