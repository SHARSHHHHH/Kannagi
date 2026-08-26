package com.kannagi.legal.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * A summary of a decided case.
 *
 * Shown with an explicit statement that it does not predict any outcome. People
 * read precedent as prophecy, and in this context that would be cruel.
 */
@Entity
@Table(name = "legal_cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LegalCaseSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "case_name", nullable = false, length = 400)
    private String caseName;

    @Column(nullable = false, length = 200)
    private String court;

    @Column(nullable = false)
    private int year;

    @Column(nullable = false, columnDefinition = "text")
    private String summary;

    @Column(name = "issue_category", nullable = false, length = 64)
    private String issueCategory;

    @Column(columnDefinition = "text")
    private String outcome;

    @Column(name = "source_url", nullable = false, length = 600)
    private String sourceUrl;

    @Column(name = "verified_at", nullable = false)
    private LocalDate verifiedAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
