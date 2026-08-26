package com.kannagi.case_management;

import com.kannagi.audit.AuditAction;
import com.kannagi.audit.AuditService;
import com.kannagi.case_management.domain.*;
import com.kannagi.case_management.dto.*;
import com.kannagi.common.exception.BadRequestException;
import com.kannagi.common.exception.NotFoundException;
import com.kannagi.common.util.ReferenceGenerator;
import com.kannagi.privacy.crypto.TokenHasher;
import com.kannagi.security.CurrentUser;
import com.kannagi.security.captcha.CaptchaService;
import com.kannagi.user.UserRepository;
import com.kannagi.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CaseService {

    private static final String ACCESS_KEY_NOTICE =
            "Write this down before you leave this page. It is shown once and we do "
            + "not keep a copy. Without it, nobody — including us — can reopen this case.";

    private final CaseRepository caseRepository;
    private final CaseMessageRepository caseMessageRepository;
    private final CaseAccessGuard accessGuard;
    private final CaseMapper caseMapper;
    private final UserRepository userRepository;
    private final ReferenceGenerator referenceGenerator;
    private final TokenHasher tokenHasher;
    private final CaptchaService captchaService;
    private final AuditService auditService;

    // ── Creating ────────────────────────────────────────────────────

    @Transactional
    public CaseCreatedResponse create(CreateCaseRequest request,
                                      CurrentUser currentUser,
                                      String clientIp) {
        if (request.privacyMode().requiresAccount() && currentUser == null) {
            throw new BadRequestException(
                    "That option needs an account. Continue anonymously, or sign in first.");
        }

        // Anonymous creation is an unauthenticated endpoint, so it needs the
        // human check that a signed-in request already implies.
        if (currentUser == null && !captchaService.verify(request.captchaToken(), clientIp)) {
            throw new BadRequestException(
                    "We could not confirm that request came from a person. Try again.");
        }

        Case caseEntity = Case.builder()
                .reference(uniqueReference())
                .privacyMode(request.privacyMode())
                .status(CaseStatus.OPEN)
                .legalPathway(LegalPathway.UNDECIDED)
                .title(blankToNull(request.title()))
                .primaryLanguage(request.language() == null ? "en" : request.language())
                .build();

        String accessKey = null;

        if (request.privacyMode() == PrivacyMode.ANONYMOUS) {
            accessKey = tokenHasher.newToken();
            caseEntity.setAccessKeyHash(tokenHasher.hash(accessKey));
            // Owner stays null. There is no link to erase later because none is made.
        } else {
            User owner = userRepository.findByIdAndDeletedAtIsNull(currentUser.id())
                    .orElseThrow(() -> new NotFoundException("We could not find that account."));
            caseEntity.setOwner(owner);
        }

        caseRepository.save(caseEntity);

        if (request.firstMessage() != null && !request.firstMessage().isBlank()) {
            persistMessage(caseEntity, SenderType.USER, request.firstMessage(),
                    caseEntity.getPrimaryLanguage(), currentUser);
        }

        auditService.record(
                currentUser == null ? null : currentUser.id(),
                currentUser == null ? null : currentUser.role(),
                AuditAction.CASE_CREATED, "Case", caseEntity.getId().toString(), true);

        List<CaseMessage> messages = caseMessageRepository
                .findByCaseEntityIdAndDeletedAtIsNullOrderByCreatedAtAsc(caseEntity.getId());

        return new CaseCreatedResponse(
                caseMapper.toResponse(caseEntity, messages),
                accessKey,
                accessKey == null ? null : ACCESS_KEY_NOTICE);
    }

    // ── Reading ─────────────────────────────────────────────────────

    @Transactional
    public CaseResponse get(UUID caseId, CurrentUser currentUser, String accessKey) {
        Case caseEntity = caseRepository.findByIdAndDeletedAtIsNull(caseId).orElse(null);
        accessGuard.requireAccess(caseEntity, currentUser, accessKey);

        auditService.record(
                currentUser == null ? null : currentUser.id(),
                currentUser == null ? null : currentUser.role(),
                AuditAction.CASE_VIEWED, "Case", caseId.toString(), true);

        return caseMapper.toResponse(caseEntity, caseMessageRepository
                .findByCaseEntityIdAndDeletedAtIsNullOrderByCreatedAtAsc(caseId));
    }

    /** Reopening an anonymous case from the reference and access key. */
    @Transactional
    public CaseResponse resume(ResumeCaseRequest request, String clientIp) {
        if (!captchaService.verify(request.captchaToken(), clientIp)) {
            throw new BadRequestException(
                    "We could not confirm that request came from a person. Try again.");
        }

        Case caseEntity = caseRepository
                .findByReferenceAndDeletedAtIsNull(request.reference().trim().toUpperCase())
                .orElse(null);

        // requireAccess reports "not found" either way, so a wrong reference and
        // a wrong key are indistinguishable from outside.
        accessGuard.requireAccess(caseEntity, null, request.accessKey().trim());

        auditService.record(null, null, AuditAction.CASE_VIEWED,
                "Case", caseEntity.getId().toString(), true);

        return caseMapper.toResponse(caseEntity, caseMessageRepository
                .findByCaseEntityIdAndDeletedAtIsNullOrderByCreatedAtAsc(caseEntity.getId()));
    }

    @Transactional(readOnly = true)
    public Page<CaseSummaryResponse> listMine(CurrentUser currentUser, Pageable pageable) {
        return caseRepository
                .findByOwnerIdAndDeletedAtIsNullOrderByLastActivityAtDesc(
                        currentUser.id(), pageable)
                .map(entity -> caseMapper.toSummary(entity,
                        caseMessageRepository
                                .countByCaseEntityIdAndDeletedAtIsNull(entity.getId())));
    }

    // ── Writing ─────────────────────────────────────────────────────

    @Transactional
    public CaseMessageResponse addMessage(UUID caseId, AddMessageRequest request,
                                          CurrentUser currentUser, String accessKey) {
        Case caseEntity = caseRepository.findByIdAndDeletedAtIsNull(caseId).orElse(null);
        accessGuard.requireAccess(caseEntity, currentUser, accessKey);

        if (caseEntity.getStatus() == CaseStatus.CLOSED) {
            throw new BadRequestException(
                    "This case is closed. Open a new one to carry on.");
        }

        CaseMessage message = persistMessage(caseEntity, SenderType.USER,
                request.content(),
                request.language() == null ? caseEntity.getPrimaryLanguage() : request.language(),
                currentUser);

        return caseMapper.toMessageResponse(message);
    }

    /**
     * Records which route to legal help she chose.
     *
     * Nothing is inferred from what she wrote — the choice is only ever recorded
     * after she makes it, and it can be changed at any time.
     */
    @Transactional
    public CaseResponse setLegalPathway(UUID caseId, UpdateLegalPathwayRequest request,
                                        CurrentUser currentUser, String accessKey) {
        Case caseEntity = caseRepository.findByIdAndDeletedAtIsNull(caseId).orElse(null);
        accessGuard.requireAccess(caseEntity, currentUser, accessKey);

        caseEntity.setLegalPathway(request.legalPathway());
        caseEntity.touch();
        caseRepository.save(caseEntity);

        persistMessage(caseEntity, SenderType.SYSTEM,
                switch (request.legalPathway()) {
                    case LEGAL_AID -> "You chose to look at free legal aid.";
                    case PRIVATE_COUNSEL -> "You chose to look at private lawyers.";
                    case NOT_SEEKING_LEGAL -> "You chose not to look at legal help for now.";
                    case UNDECIDED -> "You reset your choice about legal help.";
                },
                caseEntity.getPrimaryLanguage(), currentUser);

        return caseMapper.toResponse(caseEntity, caseMessageRepository
                .findByCaseEntityIdAndDeletedAtIsNullOrderByCreatedAtAsc(caseId));
    }

    @Transactional
    public void close(UUID caseId, CurrentUser currentUser, String accessKey) {
        Case caseEntity = caseRepository.findByIdAndDeletedAtIsNull(caseId).orElse(null);
        accessGuard.requireAccess(caseEntity, currentUser, accessKey);

        caseEntity.setStatus(CaseStatus.CLOSED);
        caseEntity.setClosedAt(Instant.now());
        caseRepository.save(caseEntity);
    }

    /**
     * Deletes a case at the owner's request.
     *
     * Messages are cleared immediately rather than merely flagged, so the
     * sensitive content is gone from the moment she asks. The row itself is
     * kept, tombstoned, until the retention sweep removes it.
     */
    @Transactional
    public void delete(UUID caseId, CurrentUser currentUser, String accessKey) {
        Case caseEntity = caseRepository.findByIdAndDeletedAtIsNull(caseId).orElse(null);
        accessGuard.requireAccess(caseEntity, currentUser, accessKey);

        Instant now = Instant.now();

        List<CaseMessage> messages = caseMessageRepository
                .findByCaseEntityIdAndDeletedAtIsNullOrderByCreatedAtAsc(caseId);
        messages.forEach(message -> {
            message.setContent("");
            message.setDeletedAt(now);
        });
        caseMessageRepository.saveAll(messages);

        caseEntity.setTitle(null);
        caseEntity.setSummary(null);
        caseEntity.setDeletedAt(now);
        caseRepository.save(caseEntity);

        auditService.record(
                currentUser == null ? null : currentUser.id(),
                currentUser == null ? null : currentUser.role(),
                AuditAction.CASE_DELETED, "Case", caseId.toString(), true);
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private CaseMessage persistMessage(Case caseEntity, SenderType senderType,
                                       String content, String language,
                                       CurrentUser currentUser) {
        // An anonymous case never records who sent a message, even if the request
        // happened to arrive with a session attached.
        User sender = (currentUser != null && !caseEntity.isAnonymous())
                ? userRepository.getReferenceById(currentUser.id())
                : null;

        CaseMessage message = caseMessageRepository.save(CaseMessage.builder()
                .caseEntity(caseEntity)
                .senderType(senderType)
                .senderUser(senderType == SenderType.USER ? sender : null)
                .content(content.trim())
                .language(language)
                .build());

        caseEntity.touch();
        caseRepository.save(caseEntity);

        return message;
    }

    private String uniqueReference() {
        for (int attempt = 0; attempt < 5; attempt++) {
            String candidate = referenceGenerator.generate();
            if (!caseRepository.existsByReference(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Could not generate a unique case reference");
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
