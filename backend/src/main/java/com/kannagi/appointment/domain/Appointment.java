package com.kannagi.appointment.domain;

import com.kannagi.privacy.crypto.EncryptedStringConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    public enum Status { REQUESTED, ACCEPTED, REJECTED, CANCELLED, COMPLETED }

    public enum Mode { ONLINE, IN_PERSON }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 24)
    private String reference;

    @Column(name = "case_id")
    private UUID caseId;

    @Column(name = "professional_id", nullable = false)
    private UUID professionalId;

    /** Null for an anonymous booking. Nothing links it back to an account. */
    @Column(name = "requester_user_id")
    private UUID requesterUserId;

    @Column(nullable = false)
    @Builder.Default
    private boolean anonymous = true;

    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @Column(name = "duration_minutes", nullable = false)
    @Builder.Default
    private int durationMinutes = 45;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private Mode mode = Mode.ONLINE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    @Builder.Default
    private Status status = Status.REQUESTED;

    /** What she chose to tell the professional in advance. Encrypted. */
    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "note_enc", columnDefinition = "text")
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
