package com.kannagi.privacy.crypto;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Refresh tokens and password-reset tokens are high-entropy random strings, so
 * a plain SHA-256 is enough to store them safely — the point is that a stolen
 * database dump cannot be replayed against the API.
 *
 * User passwords are a different problem and use BCrypt instead.
 */
@Service
public class TokenHasher {

    private static final int TOKEN_BYTES = 32;
    private final SecureRandom random = new SecureRandom();

    /** @return a URL-safe random token to hand to the client, once. */
    public String newToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Token hashing failed", e);
        }
    }
}
