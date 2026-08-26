package com.kannagi.case_management.dto;

import jakarta.validation.constraints.NotBlank;

/** Reopening an anonymous case needs both halves: the reference and the key. */
public record ResumeCaseRequest(

        @NotBlank(message = "Enter your case reference")
        String reference,

        @NotBlank(message = "Enter your access key")
        String accessKey,

        String captchaToken
) {}
