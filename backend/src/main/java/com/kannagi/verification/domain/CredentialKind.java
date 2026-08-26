package com.kannagi.verification.domain;

/**
 * The three professional identities this platform can verify, each against a
 * different real-world register.
 */
public enum CredentialKind {
    /** Advocates Act, 1961 — enrolled with a State Bar Council. */
    LAWYER,
    /** Rehabilitation Council of India — CRR number. */
    CLINICAL_PSYCHOLOGIST,
    /** National Medical Commission — MBBS + MD/DNB Psychiatry. */
    PSYCHIATRIST
}
