package com.kannagi.assignment.domain;

public enum AssignmentType {
    /** She chose and requested this named professional herself. */
    PRIVATE,
    /** An admin assigned this professional after a private request stalled. */
    PUBLIC,
    /** Routed through the free legal-aid pathway. */
    LEGAL_AID
}
