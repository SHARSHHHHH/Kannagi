package com.kannagi.case_management.dto;

/**
 * Returned once, at creation.
 *
 * For an anonymous case the access key appears here and nowhere else, ever
 * again — the server keeps only its hash. The interface has to make that
 * consequence unmistakable before the person navigates away.
 */
public record CaseCreatedResponse(
        CaseResponse caseDetail,
        String accessKey,
        String accessKeyNotice
) {}
