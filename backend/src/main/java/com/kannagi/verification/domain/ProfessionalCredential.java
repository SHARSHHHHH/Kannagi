package com.kannagi.verification.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * What a lawyer or therapist submitted to prove they are who they say they
 * are, and what happened when it was checked.
 *
 * This table intentionally does not store uploaded documents (mark sheets,
 * certificates, photographs). Building real document storage and a genuine
 * DigiLocker integration is a separate, much larger piece of work; what is
 * modelled here is the identifier-based check — enrollment number, CRR
 * number, NMC number — which is the part a hackathon prototype can honestly
 * demonstrate. verificationMethod says MOCK_REGISTRY plainly rather than
 * pretending otherwise.
 */
@Entity
@Table(name = "professional_credentials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfessionalCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "professional_id", nullable = false, unique = true)
    private UUID professionalId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "credential_kind", nullable = false, length = 32)
    private CredentialKind credentialKind;

    // ── Lawyer ──────────────────────────────────────────────────
    @Column(name = "bar_state_code", length = 12)
    private String barStateCode;

    @Column(name = "bar_enrollment_number", length = 64)
    private String barEnrollmentNumber;

    @Column(name = "bar_enrollment_year")
    private Integer barEnrollmentYear;

    @Column(name = "certificate_of_practice", nullable = false)
    @Builder.Default
    private boolean certificateOfPractice = false;

    // ── Therapist ───────────────────────────────────────────────
    /** RCI or NMC. */
    @Column(name = "license_body", length = 16)
    private String licenseBody;

    @Column(name = "license_number", length = 64)
    private String licenseNumber;

    @Column(name = "registered_full_name", length = 200)
    private String registeredFullName;

    // ── Outcome ─────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 24)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "verification_method", length = 24)
    private String verificationMethod;

    @Column(name = "verification_notes", length = 1000)
    private String verificationNotes;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "verified_by")
    private UUID verifiedBy;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private Instant submittedAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        submittedAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    /** The bar enrolment number in its standard StateCode/Serial/Year form. */
    public String formattedBarNumber() {
        if (barStateCode == null || barEnrollmentNumber == null) {
            return null;
        }
        return barStateCode + "/" + barEnrollmentNumber
                + (barEnrollmentYear != null ? "/" + barEnrollmentYear : "");
    }
}
