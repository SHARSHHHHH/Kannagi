package com.kannagi.case_management.dto;

import com.kannagi.case_management.domain.CaseStatus;
import com.kannagi.case_management.domain.LegalPathway;
import com.kannagi.case_management.domain.PrivacyMode;

import java.time.Instant;
import java.util.UUID;

/** The list view. No message bodies — those are loaded only when a case is opened. */
public record CaseSummaryResponse(
        UUID id,
        String reference,
        PrivacyMode privacyMode,
        CaseStatus status,
        LegalPathway legalPathway,
        String title,
        long messageCount,
        Instant lastActivityAt,
        Instant createdAt
) {}
