package com.kannagi.case_management.domain;

/**
 * Which route to legal help a person has chosen, once legal information has
 * been shown to her.
 *
 * The fork exists because the two routes are genuinely different products: free
 * legal aid is applied for through a statutory body, while private counsel is
 * chosen and paid for directly. Showing one combined list of lawyers would hide
 * that difference, and it is the difference that decides whether someone with no
 * money can act at all.
 *
 * Nothing is chosen for her. The default stays UNDECIDED until she picks.
 */
public enum LegalPathway {
    UNDECIDED,
    LEGAL_AID,
    PRIVATE_COUNSEL,
    NOT_SEEKING_LEGAL
}
