package com.kannagi.assignment.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * One offer of a professional to a case. Separate from an
 * {@code Appointment} (which books a single session): an assignment is
 * about who is handling the case at all, and it has exactly one live path —
 * offered, then accepted or rejected.
 *
 * When a private offer is rejected, or times out unanswered, escalation
 * creates a *new* row of type PUBLIC with {@code supersededAssignmentId}
 * pointing back at this one, rather than mutating this row further. The
 * chain of who was tried, and in what order, stays intact.
 */
@Entity
@Table(name = "case_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "case_id", nullable = false)
    private UUID caseId;

    @Column(name = "professional_id", nullable = false)
    private UUID professionalId;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_type", nullable = false, length = 16)
    @Builder.Default
    private AssignmentType assignmentType = AssignmentType.PRIVATE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    @Builder.Default
    private AssignmentStatus status = AssignmentStatus.OFFERED;

    @Column(name = "offered_at", nullable = false)
    private Instant offeredAt;

    @Column(name = "responded_at")
    private Instant respondedAt;

    @Column(name = "response_note", length = 1000)
    private String responseNote;

    @Column(name = "notice_deadline", nullable = false)
    private Instant noticeDeadline;

    @Column(nullable = false)
    @Builder.Default
    private boolean escalated = false;

    @Column(name = "escalated_at")
    private Instant escalatedAt;

    @Column(name = "superseded_assignment_id")
    private UUID supersededAssignmentId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (offeredAt == null) {
            offeredAt = now;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public boolean isPastDeadline() {
        return status == AssignmentStatus.OFFERED && noticeDeadline.isBefore(Instant.now());
    }
}
