package com.kannagi.case_management.dto;

import com.kannagi.case_management.domain.SenderType;

import java.time.Instant;
import java.util.UUID;

public record CaseMessageResponse(
        UUID id,
        SenderType senderType,
        String content,
        String language,
        Instant createdAt
) {}
