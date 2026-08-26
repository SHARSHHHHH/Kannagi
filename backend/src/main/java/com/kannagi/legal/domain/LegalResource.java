package com.kannagi.legal.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * One piece of verified legal material.
 *
 * Source, verifier and verification date are all mandatory. A row that cannot
 * say where it came from and when someone last checked it does not belong in a
 * product whose main promise is that it will not invent law.
 */
@Entity
@Table(name = "legal_resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LegalResource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "law_name", nullable = false, length = 300)
    private String lawName;

    @Column(name = "section", length = 120)
    private String section;

    @Column(nullable = false, length = 120)
    @Builder.Default
    private String jurisdiction = "India";

    @Column(nullable = false, columnDefinition = "text")
    private String description;

    @Column(name = "plain_language_explanation", nullable = false, columnDefinition = "text")
    private String plainLanguageExplanation;

    @Column(name = "what_it_may_cover", columnDefinition = "text")
    private String whatItMayCover;

    @Column(name = "possible_next_steps", columnDefinition = "text")
    private String possibleNextSteps;

    /** Comma-separated IssueCategory names. Kept simple and greppable. */
    @Column(name = "issue_categories", nullable = false, columnDefinition = "text")
    private String issueCategories;

    @Column(name = "source_url", nullable = false, length = 600)
    private String sourceUrl;

    @Column(name = "source_name", nullable = false, length = 300)
    private String sourceName;

    @Column(name = "last_verified_at", nullable = false)
    private LocalDate lastVerifiedAt;

    @Column(name = "verified_by", nullable = false, length = 200)
    private String verifiedBy;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public List<String> categoryList() {
        return Arrays.stream(issueCategories.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .toList();
    }
}
