package com.kannagi.lawyer.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * A lawyer, psychologist or support worker.
 *
 * One table for all three because the listing, filtering and booking behaviour
 * is identical; only the vocabulary differs.
 *
 * isDemo is not decoration. Seeded profiles are fictional, and the interface
 * badges every one of them, so nobody can mistake a demo listing for a real
 * practitioner they might actually contact.
 */
@Entity
@Table(name = "professionals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Professional {

    public enum Kind { LAWYER, PSYCHOLOGIST, SUPPORT_WORKER }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private Kind kind;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(length = 300)
    private String qualification;

    @Column(name = "registration_info", length = 300)
    private String registrationInfo;

    @Column(columnDefinition = "text")
    private String bio;

    @Column(name = "practice_areas", nullable = false, columnDefinition = "text")
    @Builder.Default
    private String practiceAreas = "";

    @Column(nullable = false, columnDefinition = "text")
    @Builder.Default
    private String specialisations = "";

    @Column(nullable = false, columnDefinition = "text")
    @Builder.Default
    private String languages = "en";

    @Column(length = 120)
    private String city;

    @Column(length = 120)
    private String state;

    @Column(name = "years_experience", nullable = false)
    @Builder.Default
    private int yearsExperience = 0;

    @Column(precision = 2, scale = 1)
    private BigDecimal rating;

    @Column(name = "review_count", nullable = false)
    @Builder.Default
    private int reviewCount = 0;

    @Column(name = "offers_online", nullable = false)
    @Builder.Default
    private boolean offersOnline = true;

    @Column(name = "offers_in_person", nullable = false)
    @Builder.Default
    private boolean offersInPerson = true;

    /** Whether this practitioner takes legal-aid referrals. Drives the pathway fork. */
    @Column(name = "accepts_legal_aid", nullable = false)
    @Builder.Default
    private boolean acceptsLegalAid = false;

    @Column(name = "consultation_fee_info", length = 200)
    private String consultationFeeInfo;

    @Column(nullable = false)
    @Builder.Default
    private boolean verified = false;

    @Column(name = "accepting_clients", nullable = false)
    @Builder.Default
    private boolean acceptingClients = true;

    @Column(name = "is_demo", nullable = false)
    @Builder.Default
    private boolean isDemo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public List<String> languageList() {
        return split(languages);
    }

    public List<String> practiceAreaList() {
        return split(practiceAreas);
    }

    public List<String> specialisationList() {
        return split(specialisations);
    }

    private List<String> split(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(",")).map(String::trim)
                .filter(item -> !item.isEmpty()).toList();
    }
}
