package com.kannagi.case_management.domain;

/**
 * How much of herself a person attaches to a case. Chosen at the start and
 * shown in plain words, because it is the first real decision the product asks
 * anyone to make.
 */
public enum PrivacyMode {

    /**
     * No account, no link to any identity. Reopened with a reference and an
     * access key. If both are lost the case cannot be recovered by anyone,
     * which is the cost of it being genuinely anonymous.
     */
    ANONYMOUS,

    /** The platform knows who this is. No professional does, without consent. */
    CONFIDENTIAL,

    /** Identity may be shared with professionals the user chooses. */
    IDENTIFIED;

    public boolean requiresAccount() {
        return this != ANONYMOUS;
    }
}
