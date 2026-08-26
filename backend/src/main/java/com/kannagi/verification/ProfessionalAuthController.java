package com.kannagi.verification;

import com.kannagi.common.web.ApiResponse;
import com.kannagi.security.CurrentUser;
import com.kannagi.verification.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/professional-auth")
@RequiredArgsConstructor
@Tag(name = "Professional Authentication")
public class ProfessionalAuthController {

    private final ProfessionalAuthService service;

    @PostMapping("/lawyer/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register as a lawyer — verified against a Bar Council enrolment number")
    public ApiResponse<ProfessionalAuthResponse> registerLawyer(
            @Valid @RequestBody LawyerRegisterRequest request, HttpServletRequest http) {
        return ApiResponse.ok(service.registerLawyer(request, clientIp(http)));
    }

    @PostMapping("/therapist/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register as a clinical psychologist (RCI) or psychiatrist (NMC)")
    public ApiResponse<ProfessionalAuthResponse> registerTherapist(
            @Valid @RequestBody TherapistRegisterRequest request, HttpServletRequest http) {
        return ApiResponse.ok(service.registerTherapist(request, clientIp(http)));
    }

    @PostMapping("/login")
    @Operation(summary = "Sign in as a verified lawyer or therapist")
    public ApiResponse<ProfessionalAuthResponse> login(
            @Valid @RequestBody ProfessionalLoginRequest request, HttpServletRequest http) {
        return ApiResponse.ok(service.login(request, clientIp(http)));
    }

    @GetMapping("/me/credential")
    @PreAuthorize("hasAnyRole('LAWYER','PSYCHOLOGIST')")
    @Operation(summary = "The signed-in professional's own verification status")
    public ApiResponse<CredentialStatusResponse> myCredential(
            @AuthenticationPrincipal CurrentUser currentUser) {
        return ApiResponse.ok(service.myStatus(currentUser.id()));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return (forwarded != null && !forwarded.isBlank())
                ? forwarded.split(",")[0].trim() : request.getRemoteAddr();
    }
}
