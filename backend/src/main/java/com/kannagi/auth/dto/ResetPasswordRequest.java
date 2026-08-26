package com.kannagi.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(

        @NotBlank(message = "The reset link is incomplete")
        String token,

        @NotBlank(message = "Choose a new password")
        @Size(min = 10, max = 128, message = "Use at least 10 characters")
        String newPassword
) {}
