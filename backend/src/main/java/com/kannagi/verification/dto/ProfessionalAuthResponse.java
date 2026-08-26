package com.kannagi.verification.dto;

import com.kannagi.verification.domain.VerificationStatus;
import com.kannagi.user.dto.UserResponse;

/**
 * Returned from professional registration. When verification is not
 * immediate, no session tokens are issued — accessToken/refreshToken are
 * null and the message explains what happens next. This mirrors how
 * password reset never confirms account existence: the response shape does
 * not accidentally leak whether login would succeed.
 */
public record ProfessionalAuthResponse(
        VerificationStatus verificationStatus,
        String message,
        String accessToken,
        String refreshToken,
        Long expiresInSeconds,
        UserResponse user
) {
    public static ProfessionalAuthResponse pending(VerificationStatus status, String message) {
        return new ProfessionalAuthResponse(status, message, null, null, null, null);
    }

    public static ProfessionalAuthResponse signedIn(
            String message, String accessToken, String refreshToken,
            long expiresInSeconds, UserResponse user) {
        return new ProfessionalAuthResponse(
                VerificationStatus.VERIFIED, message, accessToken, refreshToken,
                expiresInSeconds, user);
    }
}
