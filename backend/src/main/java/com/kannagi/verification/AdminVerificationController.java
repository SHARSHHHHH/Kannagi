package com.kannagi.verification;

import com.kannagi.assignment.CaseAssignmentService;
import com.kannagi.assignment.dto.AssignmentDtos.AdminAssignRequest;
import com.kannagi.assignment.dto.AssignmentDtos.AssignmentResponse;
import com.kannagi.assignment.dto.AssignmentDtos.EscalatedCaseResponse;
import com.kannagi.audit.AuditAction;
import com.kannagi.audit.AuditService;
import com.kannagi.common.exception.NotFoundException;
import com.kannagi.common.web.ApiResponse;
import com.kannagi.lawyer.ProfessionalRepository;
import com.kannagi.lawyer.domain.Professional;
import com.kannagi.notification.AdminNotification;
import com.kannagi.notification.AdminNotificationService;
import com.kannagi.security.CurrentUser;
import com.kannagi.verification.domain.ProfessionalCredential;
import com.kannagi.verification.domain.VerificationStatus;
import com.kannagi.verification.dto.CredentialStatusResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * The two queues this feature adds to the admin portal: professionals whose
 * mock verification did not match automatically, and cases whose private
 * request stalled and need a public assignment.
 *
 * Everything here requires ADMIN — enforced both by
 * {@code SecurityConfig}'s blanket rule on {@code /api/admin/**} and by the
 * {@code @PreAuthorize} on each method, matching how the rest of the
 * codebase treats authorisation as belt-and-braces rather than one gate.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin — Verification & Escalation")
@PreAuthorize("hasRole('ADMIN')")
public class AdminVerificationController {

    private final ProfessionalCredentialRepository credentialRepository;
    private final ProfessionalRepository professionalRepository;
    private final CaseAssignmentService assignmentService;
    private final AdminNotificationService notificationService;
    private final AuditService auditService;

    public record PendingCredentialResponse(
            CredentialStatusResponse credential, String professionalName, String professionalKind) {}

    public record ReviewDecisionRequest(boolean approve, String note) {}

    // ── Notifications feed ────────────────────────────────────────

    @GetMapping("/notifications")
    @Operation(summary = "Everything currently waiting on an admin")
    public ApiResponse<List<AdminNotification>> notifications() {
        return ApiResponse.ok(notificationService.unresolved());
    }

    // ── Professional verification queue ───────────────────────────

    @GetMapping("/professionals/pending-verification")
    @Operation(summary = "Professionals whose credential did not auto-verify")
    public ApiResponse<List<PendingCredentialResponse>> pendingVerification() {
        List<ProfessionalCredential> pending = credentialRepository
                .findByVerificationStatusInOrderBySubmittedAtAsc(
                        List.of(VerificationStatus.NEEDS_REVIEW, VerificationStatus.PENDING));

        return ApiResponse.ok(pending.stream().map(credential -> {
            Professional professional = professionalRepository.findById(credential.getProfessionalId())
                    .orElse(null);
            return new PendingCredentialResponse(
                    toStatus(credential),
                    professional == null ? "Unknown" : professional.getFullName(),
                    professional == null ? null : professional.getKind().name());
        }).toList());
    }

    @PostMapping("/professionals/credentials/{credentialId}/review")
    @Operation(summary = "Approve or reject a credential a mock lookup could not match")
    public ApiResponse<CredentialStatusResponse> review(
            @PathVariable UUID credentialId,
            @RequestBody ReviewDecisionRequest request,
            @AuthenticationPrincipal CurrentUser currentUser) {

        ProfessionalCredential credential = credentialRepository.findById(credentialId)
                .orElseThrow(() -> new NotFoundException("We could not find that credential."));

        credential.setVerificationStatus(
                request.approve() ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED);
        credential.setVerificationMethod("ADMIN_OVERRIDE");
        credential.setVerificationNotes(request.note());
        credential.setVerifiedAt(Instant.now());
        credential.setVerifiedBy(currentUser.id());
        credentialRepository.save(credential);

        professionalRepository.findById(credential.getProfessionalId()).ifPresent(professional -> {
            professional.setVerified(request.approve());
            professional.setAcceptingClients(request.approve());
            professionalRepository.save(professional);
        });

        auditService.record(currentUser.id(), currentUser.role(), AuditAction.ADMIN_ACCESS,
                "ProfessionalCredential", credentialId.toString(), true);

        return ApiResponse.ok(toStatus(credential));
    }

    // ── Escalated cases ────────────────────────────────────────────

    @GetMapping("/cases/escalated")
    @Operation(summary = "Cases whose private request stalled and need a public assignment")
    public ApiResponse<List<EscalatedCaseResponse>> escalated() {
        return ApiResponse.ok(assignmentService.escalatedCases());
    }

    @PostMapping("/cases/{caseId}/assign-public")
    @Operation(summary = "Assign a public professional to an escalated case")
    public ApiResponse<AssignmentResponse> assignPublic(
            @PathVariable UUID caseId,
            @Valid @RequestBody AdminAssignRequest request,
            @AuthenticationPrincipal CurrentUser currentUser) {
        AssignmentResponse response = assignmentService.adminAssignPublic(caseId, request, currentUser.id());
        auditService.record(currentUser.id(), currentUser.role(), AuditAction.ADMIN_ACCESS,
                "Case", caseId.toString(), true);
        return ApiResponse.ok(response);
    }

    private CredentialStatusResponse toStatus(ProfessionalCredential credential) {
        String displayId = credential.getCredentialKind().name().equals("LAWYER")
                ? credential.formattedBarNumber()
                : credential.getLicenseBody() + "-" + credential.getLicenseNumber();
        return new CredentialStatusResponse(
                credential.getId(), credential.getProfessionalId(), credential.getCredentialKind(),
                displayId, credential.getVerificationStatus(), credential.getVerificationMethod(),
                credential.getVerificationNotes(), credential.getSubmittedAt(), credential.getVerifiedAt());
    }
}
