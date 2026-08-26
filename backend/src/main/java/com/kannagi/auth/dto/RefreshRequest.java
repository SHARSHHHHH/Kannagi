package com.kannagi.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(
        @NotBlank(message = "A refresh token is required")
        String refreshToken
) {}
