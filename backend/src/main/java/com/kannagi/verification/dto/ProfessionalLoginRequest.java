package com.kannagi.verification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ProfessionalLoginRequest(
        @NotBlank @Email(message = "Enter a valid email address")
        String email,

        @NotBlank(message = "Enter your password")
        String password,

        String captchaToken
) {}
