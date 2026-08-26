package com.kannagi.case_management.dto;

import com.kannagi.case_management.domain.PrivacyMode;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateCaseRequest(

        @NotNull(message = "Choose how you would like to continue")
        PrivacyMode privacyMode,

        @Size(max = 200, message = "Keep the title under 200 characters")
        String title,

        /** The first thing she wants to say. Optional — a case can start empty. */
        @Size(max = 10000, message = "That is longer than we can accept in one message")
        String firstMessage,

        @Pattern(regexp = "^(en|ta|hi|te|ml|kn)$", message = "Choose a supported language")
        String language,

        String captchaToken
) {}
