package com.kannagi.auth.verification;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * A one-time code proving someone can read the inbox they claimed.
 *
 * Stored hashed, single use, short-lived, and attempt-limited — an unlimited
 * six-digit code is a four-hour brute force.
 */
@Entity
@Table(name = "email_verifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** Blind index of the address, so no plaintext email sits here either. */
    @Column(name = "email_index", nullable = false, length = 64)
    private String emailIndex;

    @Column(name = "code_hash", nullable = false, length = 64)
    private String codeHash;

    @Column(nullable = false)
    @Builder.Default
    private int attempts = 0;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public boolean isUsable() {
        return verifiedAt == null && attempts < 5 && expiresAt.isAfter(Instant.now());
    }
}
