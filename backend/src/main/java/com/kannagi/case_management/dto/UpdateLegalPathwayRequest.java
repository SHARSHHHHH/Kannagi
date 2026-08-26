package com.kannagi.case_management.dto;

import com.kannagi.case_management.domain.LegalPathway;
import jakarta.validation.constraints.NotNull;

public record UpdateLegalPathwayRequest(
        @NotNull(message = "Choose which kind of legal help you want to look at")
        LegalPathway legalPathway
) {}
