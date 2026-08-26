package com.kannagi.verification.domain;

public enum VerificationStatus {
    /** Submitted, not yet checked. */
    PENDING,
    /** Matched the registry (mock or, later, real). Can sign in. */
    VERIFIED,
    /** Did not match automatically. Waiting on an admin to look at it. */
    NEEDS_REVIEW,
    /** An admin looked and declined it. */
    REJECTED
}
