package com.kannagi.user.domain;

/**
 * Roles are checked server-side via Spring Security. The frontend hides UI for
 * roles a user does not hold, but that is presentation only — every protected
 * endpoint enforces its own rule.
 */
public enum Role {
    USER,
    LAWYER,
    PSYCHOLOGIST,
    SUPPORT_WORKER,
    MODERATOR,
    ADMIN;

    /** Spring Security expects the ROLE_ prefix on authorities. */
    public String authority() {
        return "ROLE_" + name();
    }
}
