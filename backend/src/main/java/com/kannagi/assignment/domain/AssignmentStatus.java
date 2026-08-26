package com.kannagi.assignment.domain;

public enum AssignmentStatus {
    OFFERED,
    ACCEPTED,
    REJECTED,
    /** Notice period passed with no response. Eligible for escalation. */
    EXPIRED,
    COMPLETED
}
