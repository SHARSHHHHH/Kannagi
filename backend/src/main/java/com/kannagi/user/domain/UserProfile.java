package com.kannagi.user.domain;

import com.kannagi.privacy.crypto.EncryptedStringConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Optional detail about a user. Every field here is optional by design — an
 * account works with nothing but an email and a password.
 *
 * Location is city/district/state. Exact addresses and coordinates are not
 * collected, and there is deliberately no national-ID field.
 */
@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "display_name_enc", columnDefinition = "text")
    private String displayName;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "phone_enc", columnDefinition = "text")
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 32)
    private Gender gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "marital_status", length = 32)
    private MaritalStatus maritalStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "occupation_status", length = 32)
    private OccupationStatus occupationStatus;

    @Column(name = "city", length = 120)
    private String city;

    @Column(name = "district", length = 120)
    private String district;

    @Column(name = "state", length = 120)
    private String state;

    @Column(name = "preferred_language", nullable = false, length = 8)
    @Builder.Default
    private String preferredLanguage = "en";

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
