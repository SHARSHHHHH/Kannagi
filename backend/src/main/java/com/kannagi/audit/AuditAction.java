package com.kannagi.audit;

/**
 * The vocabulary of the audit trail.
 *
 * These name actions, not content. An audit row says that a case was viewed,
 * never what the case said.
 */
public enum AuditAction {
    // Account
    USER_REGISTERED,
    LOGIN_SUCCEEDED,
    LOGIN_FAILED,
    LOGOUT,
    TOKEN_REFRESHED,
    PASSWORD_RESET_REQUESTED,
    PASSWORD_RESET_COMPLETED,
    PROFILE_UPDATED,
    ACCOUNT_LOCKED,

    // Cases (Phase 2)
    CASE_CREATED,
    CASE_VIEWED,
    CASE_SHARED,
    CASE_DELETED,

    // Consent (Phase 8)
    CONSENT_GRANTED,
    CONSENT_REVOKED,

    // Data rights
    DATA_EXPORTED,
    DATA_DELETED,

    // Administration
    ADMIN_ACCESS,
    MODERATION_ACTION
}
