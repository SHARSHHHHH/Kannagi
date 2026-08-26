package com.kannagi.case_management.domain;

public enum CaseStatus {
    /** Being written or talked through. */
    OPEN,
    /** A request has gone to a professional and is waiting on them. */
    AWAITING_SUPPORT,
    /** A professional has taken it on. */
    SUPPORTED,
    /** Closed by the person it belongs to. Never closed automatically. */
    CLOSED
}
