package com.kannagi.auth;

import com.kannagi.audit.AuditAction;
import com.kannagi.audit.AuditService;
import com.kannagi.audit.domain.SecurityEvent;
import com.kannagi.auth.domain.PasswordResetToken;
import com.kannagi.auth.domain.RefreshToken;
import com.kannagi.auth.dto.*;
import com.kannagi.auth.validation.EmailValidationService;
import com.kannagi.auth.verification.EmailVerificationService;
import com.kannagi.common.config.AppProperties;
import com.kannagi.common.exception.BadRequestException;
import com.kannagi.common.exception.ConflictException;
import com.kannagi.common.exception.UnauthorizedException;
import com.kannagi.privacy.crypto.BlindIndexService;
import com.kannagi.privacy.crypto.TokenHasher;
import com.kannagi.security.JwtService;
import com.kannagi.security.captcha.CaptchaService;
import com.kannagi.user.UserMapper;
import com.kannagi.user.UserRepository;
import com.kannagi.user.domain.Role;
import com.kannagi.user.domain.User;
import com.kannagi.user.domain.UserProfile;
import com.kannagi.user.domain.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private static final Duration RESET_TOKEN_TTL = Duration.ofMinutes(30);

    /**
     * A dummy hash to verify against when no account exists, so that sign-in
     * takes the same amount of time whether or not the address is registered.
     * Without this, response timing tells an attacker which emails have accounts.
     */
    private static final String DUMMY_HASH =
            "$2a$12$C6UzMDM.H6dfI/f/IKcEe.7VbHRXHKxLkQBSNfIzDdNKC5aQK0Cve";

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenHasher tokenHasher;
    private final BlindIndexService blindIndexService;
    private final CaptchaService captchaService;
    private final EmailValidationService emailValidationService;
    private final EmailVerificationService emailVerificationService;
    private final AuditService auditService;
    private final UserMapper userMapper;
    private final AppProperties props;

    // ── Registration ────────────────────────────────────────────────

    @Transactional
    public AuthResponse register(RegisterRequest request, String clientIp, String userAgent) {
        requireCaptcha(request.captchaToken(), clientIp);

        EmailValidationService.Result emailCheck =
                emailValidationService.validate(request.email());
        if (!emailCheck.valid()) {
            throw new BadRequestException(emailCheck.message());
        }

        // The DNS check proves the domain can receive mail. Only the code proves
        // this particular inbox exists and she can read it.
        if (!emailVerificationService.isVerified(request.email())) {
            throw new BadRequestException(
                    "Confirm your email address first — we sent you a six-digit code.");
        }

        String emailIndex = blindIndexService.forEmail(request.email());

        if (userRepository.existsByEmailIndexAndDeletedAtIsNull(emailIndex)) {
            throw new ConflictException("An account already exists for that email address.");
        }

        User user = User.builder()
                .emailIndex(emailIndex)
                .email(request.email().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();

        UserProfile profile = UserProfile.builder()
                .user(user)
                .displayName(trimToNull(request.displayName()))
                .phone(trimToNull(request.phone()))
                .gender(request.gender())
                .dateOfBirth(request.dateOfBirth())
                .maritalStatus(request.maritalStatus())
                .occupationStatus(request.occupationStatus())
                .city(trimToNull(request.city()))
                .district(trimToNull(request.district()))
                .state(trimToNull(request.state()))
                .preferredLanguage(request.preferredLanguage() == null
                        ? "en" : request.preferredLanguage())
                .build();

        user.setProfile(profile);
        userRepository.save(user);

        auditService.record(user.getId(), user.getRole(), AuditAction.USER_REGISTERED,
                "User", user.getId().toString(), true);

        return issueTokens(user, userAgent);
    }

    // ── Sign in ─────────────────────────────────────────────────────

    @Transactional
    public AuthResponse login(LoginRequest request, String clientIp, String userAgent) {
        requireCaptcha(request.captchaToken(), clientIp);

        String emailIndex = blindIndexService.forEmail(request.email());
        Optional<User> found = userRepository.findByEmailIndexAndDeletedAtIsNull(emailIndex);

        if (found.isEmpty()) {
            // Spend the same time as a real check before failing.
            passwordEncoder.matches(request.password(), DUMMY_HASH);
            auditService.recordSecurityEvent("LOGIN_FAILED_UNKNOWN_ACCOUNT",
                    SecurityEvent.Severity.INFO, null, clientIp, userAgent, null);
            throw new UnauthorizedException("That email or password is not correct.");
        }

        User user = found.get();

        if (user.isCurrentlyLocked()) {
            auditService.recordSecurityEvent("LOGIN_BLOCKED_LOCKED_ACCOUNT",
                    SecurityEvent.Severity.WARN, user.getId(), clientIp, userAgent, null);
            throw new UnauthorizedException(
                    "This account is temporarily locked after several failed attempts. "
                    + "Try again in a few minutes.");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new UnauthorizedException(
                    "This account is suspended. Contact support for help.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            registerFailedAttempt(user, clientIp, userAgent);
            throw new UnauthorizedException("That email or password is not correct.");
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        auditService.record(user.getId(), user.getRole(), AuditAction.LOGIN_SUCCEEDED,
                "User", user.getId().toString(), true);

        return issueTokens(user, userAgent);
    }

    private void registerFailedAttempt(User user, String clientIp, String userAgent) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);

        if (attempts >= props.security().maxFailedLogins()) {
            user.setLockedUntil(Instant.now().plus(
                    Duration.ofMinutes(props.security().lockoutMinutes())));
            user.setFailedLoginAttempts(0);

            auditService.record(user.getId(), user.getRole(), AuditAction.ACCOUNT_LOCKED,
                    "User", user.getId().toString(), true);
            auditService.recordSecurityEvent("ACCOUNT_LOCKED",
                    SecurityEvent.Severity.WARN, user.getId(), clientIp, userAgent,
                    "Locked after repeated failed sign-in attempts");
        }

        userRepository.save(user);
        auditService.record(user.getId(), user.getRole(), AuditAction.LOGIN_FAILED,
                "User", user.getId().toString(), false);
    }

    // ── Refresh ─────────────────────────────────────────────────────

    @Transactional
    public AuthResponse refresh(String presentedToken, String userAgent) {
        RefreshToken stored = refreshTokenRepository
                .findByTokenHash(tokenHasher.hash(presentedToken))
                .orElseThrow(() -> new UnauthorizedException("Your session has expired. Sign in again."));

        if (!stored.isUsable()) {
            // A revoked token being presented again suggests it was captured.
            // Cut every session for this account rather than guess.
            refreshTokenRepository.revokeAllForUser(stored.getUser().getId(), Instant.now());
            auditService.recordSecurityEvent("REFRESH_TOKEN_REUSE",
                    SecurityEvent.Severity.CRITICAL, stored.getUser().getId(), null, userAgent,
                    "A revoked or expired refresh token was presented; all sessions revoked");
            throw new UnauthorizedException("Your session has expired. Sign in again.");
        }

        User user = stored.getUser();
        if (!user.isActive()) {
            throw new UnauthorizedException("This account is no longer active.");
        }

        stored.setRevokedAt(Instant.now());

        AuthResponse response = issueTokens(user, userAgent);
        auditService.record(user.getId(), user.getRole(), AuditAction.TOKEN_REFRESHED,
                "RefreshToken", stored.getId().toString(), true);

        return response;
    }

    // ── Sign out ────────────────────────────────────────────────────

    @Transactional
    public void logout(String presentedToken) {
        refreshTokenRepository.findByTokenHash(tokenHasher.hash(presentedToken))
                .ifPresent(token -> {
                    token.setRevokedAt(Instant.now());
                    auditService.record(token.getUser().getId(), token.getUser().getRole(),
                            AuditAction.LOGOUT, "RefreshToken", token.getId().toString(), true);
                });
        // Silent on an unknown token: signing out should always appear to work.
    }

    // ── Password reset ──────────────────────────────────────────────

    /**
     * Always reports success. Telling the caller whether an address is
     * registered would turn this endpoint into an account-enumeration tool.
     */
    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request, String clientIp) {
        requireCaptcha(request.captchaToken(), clientIp);

        String emailIndex = blindIndexService.forEmail(request.email());
        userRepository.findByEmailIndexAndDeletedAtIsNull(emailIndex).ifPresent(user -> {
            String rawToken = tokenHasher.newToken();

            passwordResetTokenRepository.save(PasswordResetToken.builder()
                    .user(user)
                    .tokenHash(tokenHasher.hash(rawToken))
                    .expiresAt(Instant.now().plus(RESET_TOKEN_TTL))
                    .build());

            auditService.record(user.getId(), user.getRole(),
                    AuditAction.PASSWORD_RESET_REQUESTED, "User", user.getId().toString(), true);

            // Phase 8 wires this into NotificationService. Until then the token
            // is logged in development only so the flow can be exercised.
            log.info("Password reset token issued for user {} (delivery not yet wired)",
                    user.getId());
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = passwordResetTokenRepository
                .findByTokenHash(tokenHasher.hash(request.token()))
                .orElseThrow(() -> new BadRequestException(
                        "This reset link is not valid. Request a new one."));

        if (!token.isUsable()) {
            throw new BadRequestException("This reset link has expired. Request a new one.");
        }

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        token.setUsedAt(Instant.now());

        // Changing a password ends every existing session.
        refreshTokenRepository.revokeAllForUser(user.getId(), Instant.now());

        auditService.record(user.getId(), user.getRole(),
                AuditAction.PASSWORD_RESET_COMPLETED, "User", user.getId().toString(), true);
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private AuthResponse issueTokens(User user, String userAgent) {
        String accessToken = jwtService.issueAccessToken(user.getId(), user.getRole());
        String rawRefresh = tokenHasher.newToken();

        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHasher.hash(rawRefresh))
                .expiresAt(Instant.now().plusSeconds(props.jwt().refreshTtlSeconds()))
                .userAgent(userAgent == null ? null
                        : userAgent.substring(0, Math.min(userAgent.length(), 255)))
                .build());

        return AuthResponse.of(accessToken, rawRefresh,
                jwtService.accessTtlSeconds(), userMapper.toResponse(user));
    }

    private void requireCaptcha(String token, String clientIp) {
        if (!captchaService.verify(token, clientIp)) {
            auditService.recordSecurityEvent("CAPTCHA_FAILED",
                    SecurityEvent.Severity.WARN, null, clientIp, null, null);
            throw new BadRequestException(
                    "We could not confirm that request came from a person. Try again.");
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
