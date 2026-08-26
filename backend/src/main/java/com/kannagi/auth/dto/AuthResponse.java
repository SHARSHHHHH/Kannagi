package com.kannagi.auth.dto;

import com.kannagi.user.dto.UserResponse;

/**
 * Issued on sign-in and on refresh.
 *
 * The refresh token is returned once, here, and only its hash is kept
 * server-side — it cannot be recovered later.
 */
public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresInSeconds,
        UserResponse user
) {
    public static AuthResponse of(String accessToken, String refreshToken,
                                  long expiresIn, UserResponse user) {
        return new AuthResponse(accessToken, refreshToken, "Bearer", expiresIn, user);
    }
}
