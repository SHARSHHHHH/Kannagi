package com.kannagi.case_management;

import com.kannagi.audit.AuditAction;
import com.kannagi.audit.AuditService;
import com.kannagi.case_management.domain.Case;
import com.kannagi.common.exception.NotFoundException;
import com.kannagi.privacy.crypto.TokenHasher;
import com.kannagi.security.CurrentUser;
import com.kannagi.user.domain.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * The single place that decides whether someone may open a case.
 *
 * Every read and write goes through here rather than each service writing its
 * own check, because scattered authorisation is how the one forgotten check
 * happens.
 *
 * A caller who is not entitled to a case is told it does not exist, not that
 * access was denied. A 403 confirms the case is real, which turns case
 * references into something worth guessing at.
 */
@Component
@RequiredArgsConstructor
public class CaseAccessGuard {

    private final TokenHasher tokenHasher;
    private final AuditService auditService;

    /**
     * @param caseEntity the case being opened
     * @param currentUser the signed-in principal, or null when anonymous
     * @param accessKey the key presented for an anonymous case, or null
     */
    public void requireAccess(Case caseEntity, CurrentUser currentUser, String accessKey) {
        if (caseEntity == null || caseEntity.isDeleted()) {
            throw notFound();
        }

        boolean permitted = caseEntity.isAnonymous()
                ? holdsValidAccessKey(caseEntity, accessKey)
                : isOwner(caseEntity, currentUser);

        if (!permitted) {
            // Recorded as a failure so that repeated probing is visible, with
            // the case id but never its contents.
            auditService.record(
                    currentUser == null ? null : currentUser.id(),
                    currentUser == null ? null : currentUser.role(),
                    AuditAction.CASE_VIEWED, "Case", caseEntity.getId().toString(), false);
            throw notFound();
        }
    }

    private boolean isOwner(Case caseEntity, CurrentUser currentUser) {
        if (currentUser == null || caseEntity.getOwner() == null) {
            return false;
        }
        // An administrator is not an owner. Reaching someone's case from an
        // admin account is a separate, audited path, not a side effect of role.
        return Objects.equals(caseEntity.getOwner().getId(), currentUser.id());
    }

    private boolean holdsValidAccessKey(Case caseEntity, String accessKey) {
        if (accessKey == null || accessKey.isBlank() || caseEntity.getAccessKeyHash() == null) {
            return false;
        }
        return constantTimeEquals(
                caseEntity.getAccessKeyHash(), tokenHasher.hash(accessKey));
    }

    /** Comparison that does not leak how many characters matched. */
    private boolean constantTimeEquals(String expected, String presented) {
        if (expected.length() != presented.length()) {
            return false;
        }
        int difference = 0;
        for (int i = 0; i < expected.length(); i++) {
            difference |= expected.charAt(i) ^ presented.charAt(i);
        }
        return difference == 0;
    }

    /**
     * Whether a professional may see this case at all. Consent is Phase 8; until
     * then no professional route exists and this returns false for everyone.
     */
    public boolean professionalMayAccess(Case caseEntity, CurrentUser currentUser) {
        if (currentUser == null) {
            return false;
        }
        Role role = currentUser.role();
        boolean isProfessional = role == Role.LAWYER
                || role == Role.PSYCHOLOGIST
                || role == Role.SUPPORT_WORKER;

        // Deliberately false until a consent record can be checked. A
        // professional seeing a case before Phase 8 would be a bug, not a
        // convenience.
        return isProfessional && false;
    }

    private NotFoundException notFound() {
        return new NotFoundException("We could not find that case.");
    }
}
