package com.kannagi.case_management.domain;

public enum SenderType {
    USER,
    ASSISTANT,
    PROFESSIONAL,
    /** Platform notices: mode changed, request sent, consent granted. */
    SYSTEM
}
