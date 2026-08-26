package com.kannagi.auth;

import com.kannagi.auth.dto.*;
import com.kannagi.auth.verification.EmailVerificationService;
import com.kannagi.common.web.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;

    public record SendCodeRequest(
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Email(message = "Enter a valid email address")
            String email) {}

    public record VerifyCodeRequest(
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Email(message = "Enter a valid email address")
            String email,
            @jakarta.validation.constraints.NotBlank(message = "Enter the code")
            String code) {}

    @PostMapping("/send-code")
    @Operation(summary = "Send a six-digit verification code to an email address")
    public ApiResponse<EmailVerificationService.SendResult> sendCode(
            @Valid @RequestBody SendCodeRequest request) {
        return ApiResponse.ok(emailVerificationService.sendCode(request.email()));
    }

    @PostMapping("/verify-code")
    @Operation(summary = "Check a verification code")
    public ApiResponse<MessageResponse> verifyCode(
            @Valid @RequestBody VerifyCodeRequest request) {
        emailVerificationService.verify(request.email(), request.code());
        return ApiResponse.ok(new MessageResponse(
                "Address confirmed. You can finish creating your account."));
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an account")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                                              HttpServletRequest http) {
        return ApiResponse.ok(
                authService.register(request, clientIp(http), userAgent(http)));
    }

    @PostMapping("/login")
    @Operation(summary = "Sign in")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                           HttpServletRequest http) {
        return ApiResponse.ok(
                authService.login(request, clientIp(http), userAgent(http)));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Exchange a refresh token for a new access token")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request,
                                             HttpServletRequest http) {
        return ApiResponse.ok(
                authService.refresh(request.refreshToken(), userAgent(http)));
    }

    @PostMapping("/logout")
    @Operation(summary = "Revoke the current refresh token")
    public ApiResponse<MessageResponse> logout(@Valid @RequestBody RefreshRequest request) {
        authService.logout(request.refreshToken());
        return ApiResponse.ok(new MessageResponse("Signed out."));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a password reset link")
    public ApiResponse<MessageResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest http) {
        authService.requestPasswordReset(request, clientIp(http));
        return ApiResponse.ok(new MessageResponse(
                "If an account exists for that address, a reset link is on its way."));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Set a new password using a reset token")
    public ApiResponse<MessageResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.ok(new MessageResponse(
                "Password updated. You have been signed out everywhere else."));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String userAgent(HttpServletRequest request) {
        return request.getHeader("User-Agent");
    }
}
