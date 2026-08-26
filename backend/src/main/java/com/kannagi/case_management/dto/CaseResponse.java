package com.kannagi.case_management.dto;

import com.kannagi.case_management.domain.CaseStatus;
import com.kannagi.case_management.domain.LegalPathway;
import com.kannagi.case_management.domain.PrivacyMode;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CaseResponse(
        UUID id,
        String reference,
        PrivacyMode privacyMode,
        CaseStatus status,
        LegalPathway legalPathway,
        String title,
        String summary,
        String primaryLanguage,
        List<CaseMessageResponse> messages,
        Instant lastActivityAt,
        Instant createdAt
) {}
