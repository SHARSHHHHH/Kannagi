package com.kannagi.privacy.consent;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "consents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consent {

    public enum Type {
        DATA_PROCESSING,
        LEGAL_SHARING,
        PSYCHOLOGICAL_SHARING,
        CONTACT_SHARING,
        COMMUNITY_POSTING,
        AUDIO_STORAGE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "case_id")
    private UUID caseId;

    @Enumerated(EnumType.STRING)
    @Column(name = "consent_type", nullable = false, length = 48)
    private Type consentType;

    @Column(nullable = false)
    @Builder.Default
    private boolean granted = false;

    @Column(name = "granted_at")
    private Instant grantedAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "shared_with", length = 200)
    private String sharedWith;

    @Column(length = 500)
    private String purpose;

    @Column(name = "policy_version", nullable = false, length = 32)
    @Builder.Default
    private String policyVersion = "v1";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    /** Granted and not since revoked. Both conditions, every time it is checked. */
    public boolean isCurrentlyActive() {
        return granted && revokedAt == null;
    }
}
