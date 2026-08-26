package com.kannagi.case_management.domain;

import com.kannagi.privacy.crypto.EncryptedStringConverter;
import com.kannagi.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * One situation a person is working through.
 *
 * The owner is nullable on purpose: an anonymous case has no owner at all,
 * rather than an owner that the application politely agrees not to look at.
 * There is nothing to leak because the link was never recorded.
 */
@Entity
@Table(name = "cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Case {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /** The short code a person can write down, e.g. KN-83K9D2QM. */
    @Column(name = "reference", nullable = false, unique = true, length = 24)
    private String reference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id")
    private User owner;

    @Enumerated(EnumType.STRING)
    @Column(name = "privacy_mode", nullable = false, length = 16)
    private PrivacyMode privacyMode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 24)
    @Builder.Default
    private CaseStatus status = CaseStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(name = "legal_pathway", nullable = false, length = 24)
    @Builder.Default
    private LegalPathway legalPathway = LegalPathway.UNDECIDED;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "title_enc", columnDefinition = "text")
    private String title;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "summary_enc", columnDefinition = "text")
    private String summary;

    @Column(name = "primary_language", nullable = false, length = 8)
    @Builder.Default
    private String primaryLanguage = "en";

    /** SHA-256 of the access key. Only ever set on anonymous cases. */
    @Column(name = "access_key_hash", length = 64)
    private String accessKeyHash;

    @Column(name = "last_activity_at", nullable = false)
    private Instant lastActivityAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (lastActivityAt == null) {
            lastActivityAt = now;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public boolean isAnonymous() {
        return privacyMode == PrivacyMode.ANONYMOUS;
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public void touch() {
        lastActivityAt = Instant.now();
    }
}
