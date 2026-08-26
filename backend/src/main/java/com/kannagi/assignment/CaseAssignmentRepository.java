package com.kannagi.assignment;

import com.kannagi.assignment.domain.AssignmentStatus;
import com.kannagi.assignment.domain.CaseAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CaseAssignmentRepository extends JpaRepository<CaseAssignment, UUID> {

    List<CaseAssignment> findByCaseIdOrderByCreatedAtDesc(UUID caseId);

    List<CaseAssignment> findByProfessionalIdAndStatusOrderByOfferedAtDesc(
            UUID professionalId, AssignmentStatus status);

    List<CaseAssignment> findByProfessionalIdAndStatusInOrderByOfferedAtDesc(
            UUID professionalId, List<AssignmentStatus> statuses);

    boolean existsByCaseIdAndProfessionalIdAndStatus(
            UUID caseId, UUID professionalId, AssignmentStatus status);

    /** Whether this professional currently holds an accepted assignment on this case. */
    Optional<CaseAssignment> findFirstByCaseIdAndProfessionalIdAndStatus(
            UUID caseId, UUID professionalId, AssignmentStatus status);

    List<CaseAssignment> findByStatusAndNoticeDeadlineBefore(
            AssignmentStatus status, Instant cutoff);

    Optional<CaseAssignment> findFirstByCaseIdOrderByCreatedAtDesc(UUID caseId);
}
