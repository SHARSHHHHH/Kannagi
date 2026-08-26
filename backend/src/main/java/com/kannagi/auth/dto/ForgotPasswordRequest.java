package com.kannagi.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank @Email(message = "Enter a valid email address")
        String email,

        String captchaToken
) {}
