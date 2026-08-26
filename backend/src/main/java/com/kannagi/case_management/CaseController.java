package com.kannagi.case_management;

import com.kannagi.case_management.dto.*;
import com.kannagi.common.web.ApiResponse;
import com.kannagi.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Cases.
 *
 * Most endpoints here accept both a signed-in caller and an anonymous one
 * holding an access key, which is why authorisation is delegated to
 * {@link CaseAccessGuard} rather than expressed as a role rule.
 *
 * The access key travels in a header, not the query string, so it does not end
 * up in browser history, server logs or a Referer header.
 */
@RestController
@RequestMapping("/api/cases")
@RequiredArgsConstructor
@Tag(name = "Cases")
public class CaseController {

    private static final String ACCESS_KEY_HEADER = "X-Case-Access-Key";

    private final CaseService caseService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Start a case, anonymously or under an account")
    public ApiResponse<CaseCreatedResponse> create(
            @Valid @RequestBody CreateCaseRequest request,
            @AuthenticationPrincipal CurrentUser currentUser,
            HttpServletRequest http) {
        return ApiResponse.ok(caseService.create(request, currentUser, clientIp(http)));
    }

    @PostMapping("/resume")
    @Operation(summary = "Reopen an anonymous case using its reference and access key")
    public ApiResponse<CaseResponse> resume(@Valid @RequestBody ResumeCaseRequest request,
                                            HttpServletRequest http) {
        return ApiResponse.ok(caseService.resume(request, clientIp(http)));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List the signed-in user's own cases")
    public ApiResponse<Page<CaseSummaryResponse>> listMine(
            @AuthenticationPrincipal CurrentUser currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(
                caseService.listMine(currentUser, PageRequest.of(page, Math.min(size, 50))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Open one case")
    public ApiResponse<CaseResponse> get(
            @PathVariable UUID id,
            @AuthenticationPrincipal CurrentUser currentUser,
            @Parameter(description = "Required for anonymous cases")
            @RequestHeader(value = ACCESS_KEY_HEADER, required = false) String accessKey) {
        return ApiResponse.ok(caseService.get(id, currentUser, accessKey));
    }

    @PostMapping("/{id}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add a message to a case")
    public ApiResponse<CaseMessageResponse> addMessage(
            @PathVariable UUID id,
            @Valid @RequestBody AddMessageRequest request,
            @AuthenticationPrincipal CurrentUser currentUser,
            @RequestHeader(value = ACCESS_KEY_HEADER, required = false) String accessKey) {
        return ApiResponse.ok(caseService.addMessage(id, request, currentUser, accessKey));
    }

    @PatchMapping("/{id}/legal-pathway")
    @Operation(summary = "Record whether she wants legal aid or a private lawyer")
    public ApiResponse<CaseResponse> setLegalPathway(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateLegalPathwayRequest request,
            @AuthenticationPrincipal CurrentUser currentUser,
            @RequestHeader(value = ACCESS_KEY_HEADER, required = false) String accessKey) {
        return ApiResponse.ok(caseService.setLegalPathway(id, request, currentUser, accessKey));
    }

    @PostMapping("/{id}/close")
    @Operation(summary = "Close a case")
    public ResponseEntity<Void> close(
            @PathVariable UUID id,
            @AuthenticationPrincipal CurrentUser currentUser,
            @RequestHeader(value = ACCESS_KEY_HEADER, required = false) String accessKey) {
        caseService.close(id, currentUser, accessKey);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a case and clear its messages")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal CurrentUser currentUser,
            @RequestHeader(value = ACCESS_KEY_HEADER, required = false) String accessKey) {
        caseService.delete(id, currentUser, accessKey);
        return ResponseEntity.noContent().build();
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
