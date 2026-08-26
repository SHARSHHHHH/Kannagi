package com.kannagi.case_management.domain;

import com.kannagi.privacy.crypto.EncryptedStringConverter;
import com.kannagi.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * A single message in a case: what she wrote, what the assistant replied, or a
 * note from the platform.
 *
 * The body is always encrypted. This is the most sensitive column in the
 * database and the one an audit log must never quote.
 */
@Entity
@Table(name = "case_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "case_id", nullable = false)
    private Case caseEntity;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender_type", nullable = false, length = 24)
    private SenderType senderType;

    /** Null for anonymous cases and for assistant or system messages. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_user_id")
    private User senderUser;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "content_enc", nullable = false, columnDefinition = "text")
    private String content;

    @Column(name = "language", nullable = false, length = 8)
    @Builder.Default
    private String language = "en";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
