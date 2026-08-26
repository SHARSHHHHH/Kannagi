package com.kannagi.privacy;

import com.kannagi.appointment.AppointmentRepository;
import com.kannagi.audit.AuditAction;
import com.kannagi.audit.AuditService;
import com.kannagi.case_management.CaseRepository;
import com.kannagi.common.exception.NotFoundException;
import com.kannagi.common.web.ApiResponse;
import com.kannagi.privacy.consent.Consent;
import com.kannagi.privacy.consent.ConsentRepository;
import com.kannagi.security.CurrentUser;
import com.kannagi.user.UserService;
import com.kannagi.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * What is held, who can see it, and how to stop that.
 *
 * The sharing summary is computed from live consent rows rather than written as
 * static copy, so the page cannot drift out of step with what the system will
 * actually do.
 */
@RestController
@RequestMapping("/api/privacy")
@RequiredArgsConstructor
@Tag(name = "Privacy")
public class PrivacyController {

    private final ConsentRepository consentRepository;
    private final CaseRepository caseRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserService userService;
    private final AuditService auditService;

    public record SharingLine(String withWhom, String item, boolean shared) {}

    public record PrivacyOverview(
            long caseCount,
            long appointmentCount,
            List<Consent> consents,
            List<SharingLine> currentlySharing,
            String note) {}

    @GetMapping("/overview")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Everything held about the signed-in user, and what is shared")
    public ApiResponse<PrivacyOverview> overview(@AuthenticationPrincipal CurrentUser currentUser) {
        List<Consent> consents = consentRepository.findByUserId(currentUser.id());

        boolean legalSharing = hasActive(consents, Consent.Type.LEGAL_SHARING);
        boolean psychSharing = hasActive(consents, Consent.Type.PSYCHOLOGICAL_SHARING);
        boolean contactSharing = hasActive(consents, Consent.Type.CONTACT_SHARING);
        boolean audioStorage = hasActive(consents, Consent.Type.AUDIO_STORAGE);

        List<SharingLine> sharing = List.of(
                new SharingLine("Legal professional", "Case description", legalSharing),
                new SharingLine("Legal professional", "Your name", contactSharing),
                new SharingLine("Legal professional", "Your phone number", contactSharing),
                new SharingLine("Psychologist", "Conversation summary", psychSharing),
                new SharingLine("Psychologist", "Your name", contactSharing),
                new SharingLine("Psychologist", "Your phone number", contactSharing),
                new SharingLine("Us", "Recordings kept after transcription", audioStorage));

        return ApiResponse.ok(new PrivacyOverview(
                caseRepository.countByOwnerIdAndDeletedAtIsNull(currentUser.id()),
                appointmentRepository.findByRequesterUserIdOrderByScheduledAtDesc(
                        currentUser.id()).size(),
                consents,
                sharing,
                "Turning something off here stops future sharing. It cannot reach back "
                + "into a conversation somebody has already had with you."));
    }

    @GetMapping("/consents")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Consents on record")
    public ApiResponse<List<Consent>> consents(@AuthenticationPrincipal CurrentUser currentUser) {
        return ApiResponse.ok(consentRepository.findByUserId(currentUser.id()));
    }

    @PostMapping("/consents")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    @Operation(summary = "Grant a consent")
    public ApiResponse<Consent> grant(
            @AuthenticationPrincipal CurrentUser currentUser,
            @RequestParam Consent.Type type,
            @RequestParam(required = false) UUID caseId,
            @RequestParam(required = false) String sharedWith,
            @RequestParam(required = false) String purpose) {

        Consent consent = consentRepository.save(Consent.builder()
                .userId(currentUser.id())
                .caseId(caseId)
                .consentType(type)
                .granted(true)
                .grantedAt(Instant.now())
                .sharedWith(sharedWith)
                .purpose(purpose)
                .build());

        auditService.record(currentUser.id(), currentUser.role(),
                AuditAction.CONSENT_GRANTED, "Consent", consent.getId().toString(), true);

        return ApiResponse.ok(consent);
    }

    @DeleteMapping("/consents/{id}")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    @Operation(summary = "Revoke a consent. Stops all future sharing under it.")
    public ApiResponse<Consent> revoke(
            @AuthenticationPrincipal CurrentUser currentUser,
            @PathVariable UUID id) {

        Consent consent = consentRepository.findById(id)
                .filter(item -> currentUser.id().equals(item.getUserId()))
                .orElseThrow(() -> new NotFoundException("We could not find that consent."));

        consent.setGranted(false);
        consent.setRevokedAt(Instant.now());
        consentRepository.save(consent);

        auditService.record(currentUser.id(), currentUser.role(),
                AuditAction.CONSENT_REVOKED, "Consent", id.toString(), true);

        return ApiResponse.ok(consent);
    }

    @GetMapping("/export")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Download everything held about you")
    public ResponseEntity<Map<String, Object>> export(
            @AuthenticationPrincipal CurrentUser currentUser) {

        UserResponse user = userService.getById(currentUser.id());

        auditService.record(currentUser.id(), currentUser.role(),
                AuditAction.DATA_EXPORTED, "User", currentUser.id().toString(), true);

        Map<String, Object> export = Map.of(
                "exportedAt", Instant.now().toString(),
                "account", user,
                "cases", caseRepository
                        .findByOwnerIdAndDeletedAtIsNullOrderByLastActivityAtDesc(
                                currentUser.id(), PageRequest.of(0, 100)).getContent(),
                "appointments", appointmentRepository
                        .findByRequesterUserIdOrderByScheduledAtDesc(currentUser.id()),
                "consents", consentRepository.findByUserId(currentUser.id()),
                "note", "Anonymous cases are not listed here. They were never linked to "
                      + "your account, so we cannot find them from it.");

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"my-data.json\"")
                .body(export);
    }

    @DeleteMapping("/data")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    @Operation(summary = "Delete the account and everything attached to it")
    public ResponseEntity<Void> deleteEverything(
            @AuthenticationPrincipal CurrentUser currentUser) {
        userService.deleteAccount(currentUser.id());
        return ResponseEntity.noContent().build();
    }

    private boolean hasActive(List<Consent> consents, Consent.Type type) {
        return consents.stream()
                .anyMatch(consent -> consent.getConsentType() == type && consent.isCurrentlyActive());
    }
}
