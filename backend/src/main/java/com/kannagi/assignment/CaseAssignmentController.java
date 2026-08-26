package com.kannagi.assignment;

import com.kannagi.assignment.dto.AssignmentDtos.*;
import com.kannagi.common.web.ApiResponse;
import com.kannagi.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Case Assignments")
public class CaseAssignmentController {

    private static final String ACCESS_KEY_HEADER = "X-Case-Access-Key";

    private final CaseAssignmentService service;

    /** Requesting a named professional for a case — she does this from the case itself. */
    @PostMapping("/api/cases/{caseId}/assignments")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Request a lawyer or therapist for this case")
    public ApiResponse<AssignmentResponse> requestAssignment(
            @PathVariable UUID caseId,
            @Valid @RequestBody RequestAssignmentRequest request,
            @AuthenticationPrincipal CurrentUser currentUser,
            @RequestHeader(value = ACCESS_KEY_HEADER, required = false) String accessKey) {
        return ApiResponse.ok(service.offer(caseId, request, currentUser, accessKey));
    }

    @GetMapping("/api/professional/assignments/offered")
    @PreAuthorize("hasAnyRole('LAWYER','PSYCHOLOGIST','SUPPORT_WORKER')")
    @Operation(summary = "Cases offered to the signed-in professional, awaiting a decision")
    public ApiResponse<List<AssignmentResponse>> myOffers(@AuthenticationPrincipal CurrentUser currentUser) {
        return ApiResponse.ok(service.myOffers(currentUser.id()));
    }

    @GetMapping("/api/professional/assignments/accepted")
    @PreAuthorize("hasAnyRole('LAWYER','PSYCHOLOGIST','SUPPORT_WORKER')")
    @Operation(summary = "Cases the signed-in professional has accepted")
    public ApiResponse<List<AssignmentResponse>> myAccepted(@AuthenticationPrincipal CurrentUser currentUser) {
        return ApiResponse.ok(service.myAccepted(currentUser.id()));
    }

    @PostMapping("/api/professional/assignments/{assignmentId}/respond")
    @PreAuthorize("hasAnyRole('LAWYER','PSYCHOLOGIST','SUPPORT_WORKER')")
    @Operation(summary = "Accept or reject an offered case")
    public ApiResponse<AssignmentResponse> respond(
            @PathVariable UUID assignmentId,
            @Valid @RequestBody RespondRequest request,
            @AuthenticationPrincipal CurrentUser currentUser) {
        return ApiResponse.ok(service.respond(assignmentId, request, currentUser.id()));
    }

    @PostMapping("/api/professional/cases/{caseId}/messages")
    @PreAuthorize("hasAnyRole('LAWYER','PSYCHOLOGIST','SUPPORT_WORKER')")
    @Operation(summary = "Message into a case you have accepted — reaches her via the case itself")
    public ResponseEntity<Void> sendMessage(
            @PathVariable UUID caseId,
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal CurrentUser currentUser) {
        service.sendMessageToCase(caseId, request, currentUser.id());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/professional/cases/{caseId}/contact")
    @PreAuthorize("hasAnyRole('LAWYER','PSYCHOLOGIST','SUPPORT_WORKER')")
    @Operation(summary = "Her contact details, if this case is not anonymous and she has consented")
    public ApiResponse<ContactInfoResponse> contact(
            @PathVariable UUID caseId, @AuthenticationPrincipal CurrentUser currentUser) {
        return ApiResponse.ok(service.contactInfo(caseId, currentUser.id()));
    }
}
