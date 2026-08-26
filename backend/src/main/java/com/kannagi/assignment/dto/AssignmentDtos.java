package com.kannagi.assignment.dto;

import com.kannagi.assignment.domain.AssignmentStatus;
import com.kannagi.assignment.domain.AssignmentType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public final class AssignmentDtos {

    private AssignmentDtos() {}

    /** Request to offer a named professional (found through a directory) to a case. */
    public record RequestAssignmentRequest(
            @NotNull UUID professionalId,
            @NotNull AssignmentType assignmentType,
            @Size(max = 1000) String noteToProfessional
    ) {}

    public record RespondRequest(
            @NotNull AssignmentStatus decision,   // ACCEPTED or REJECTED
            @Size(max = 1000) String note
    ) {}

    public record AssignmentResponse(
            UUID id,
            UUID caseId,
            String caseReference,
            UUID professionalId,
            String professionalName,
            AssignmentType assignmentType,
            AssignmentStatus status,
            Instant offeredAt,
            Instant respondedAt,
            Instant noticeDeadline,
            boolean escalated,
            boolean caseAnonymous,
            String caseTitle,
            String caseConcernSummary
    ) {}

    /** What the professional sees for one case waiting on their decision, or accepted. */
    public record CaseFileView(
            UUID caseId,
            String caseReference,
            boolean anonymous,
            String title,
            String summary,
            String legalPathway,
            String primaryLanguage,
            java.util.List<MessageView> messages
    ) {}

    public record MessageView(UUID id, String senderType, String content, Instant createdAt) {}

    public record ContactInfoResponse(
            boolean shared,
            String displayName,
            String phone,
            String note
    ) {}

    public record SendMessageRequest(
            @jakarta.validation.constraints.NotBlank
            @Size(max = 2000) String content
    ) {}

    /** Admin view of a case that has stalled and needs a public assignment. */
    public record EscalatedCaseResponse(
            UUID caseId,
            String caseReference,
            String legalPathway,
            UUID lastAssignmentId,
            String lastProfessionalName,
            AssignmentType lastAssignmentType,
            Instant escalatedAt
    ) {}

    public record AdminAssignRequest(
            @NotNull UUID professionalId
    ) {}
}
