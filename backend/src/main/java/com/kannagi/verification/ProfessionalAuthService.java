package com.kannagi.verification;

import com.kannagi.audit.AuditAction;
import com.kannagi.audit.AuditService;
import com.kannagi.auth.RefreshTokenRepository;
import com.kannagi.auth.domain.RefreshToken;
import com.kannagi.auth.validation.EmailValidationService;
import com.kannagi.auth.verification.EmailVerificationService;
import com.kannagi.common.config.AppProperties;
import com.kannagi.common.exception.BadRequestException;
import com.kannagi.common.exception.ConflictException;
import com.kannagi.common.exception.UnauthorizedException;
import com.kannagi.lawyer.ProfessionalRepository;
import com.kannagi.lawyer.domain.Professional;
import com.kannagi.notification.AdminNotificationService;
import com.kannagi.privacy.crypto.BlindIndexService;
import com.kannagi.privacy.crypto.TokenHasher;
import com.kannagi.security.JwtService;
import com.kannagi.security.captcha.CaptchaService;
import com.kannagi.user.UserMapper;
import com.kannagi.user.UserRepository;
import com.kannagi.user.domain.Role;
import com.kannagi.user.domain.User;
import com.kannagi.user.domain.UserStatus;
import com.kannagi.verification.domain.CredentialKind;
import com.kannagi.verification.domain.ProfessionalCredential;
import com.kannagi.verification.domain.VerificationStatus;
import com.kannagi.verification.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Registration and sign-in for lawyers and therapists.
 *
 * The account (a {@code User} row) is always created — a person should not
 * lose their typed-out registration form because a mock registry did not
 * recognise their number. What is gated is LOGIN: a professional whose
 * credential has not reached VERIFIED cannot sign in, and is told exactly
 * why, in plain terms, every time they try.
 *
 * This deliberately does not touch {@code UserStatus} or the existing
 * {@code AuthService} — verification lives entirely in
 * {@code professional_credentials}, so the account model that Phase 1 built,
 * and its tests, are untouched.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProfessionalAuthService {

    private final UserRepository userRepository;
    private final ProfessionalRepository professionalRepository;
    private final ProfessionalCredentialRepository credentialRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenHasher tokenHasher;
    private final BlindIndexService blindIndexService;
    private final CaptchaService captchaService;
    private final EmailValidationService emailValidationService;
    private final EmailVerificationService emailVerificationService;
    private final MockRegistryService registryService;
    private final AdminNotificationService adminNotificationService;
    private final AuditService auditService;
    private final UserMapper userMapper;
    private final AppProperties props;

    // ── Lawyer registration ─────────────────────────────────────────

    @Transactional
    public ProfessionalAuthResponse registerLawyer(LawyerRegisterRequest request, String clientIp) {
        requireCaptcha(request.captchaToken(), clientIp);
        String email = requireVerifiedEmail(request.email());

        User user = createAccount(email, request.password(), Role.LAWYER);

        String stateCode = request.barStateCode().trim().toUpperCase();
        if (!registryService.isKnownStateCode(stateCode)) {
            throw new BadRequestException(
                    "\"" + stateCode + "\" is not a state bar code we recognise. "
                    + "Examples: D (Delhi), UP (Uttar Pradesh), MAH (Maharashtra & Goa), "
                    + "MS (Tamil Nadu), P&H (Punjab & Haryana).");
        }

        Professional professional = professionalRepository.save(Professional.builder()
                .userId(user.getId())
                .kind(Professional.Kind.LAWYER)
                .fullName(request.fullName().trim())
                .qualification(blankToNull(request.qualification()))
                .practiceAreas(request.practiceAreas() == null ? "" : request.practiceAreas())
                .city(blankToNull(request.city()))
                .state(blankToNull(request.state()))
                .languages(request.languages() == null || request.languages().isBlank()
                        ? "en" : request.languages())
                .verified(false)
                .acceptingClients(false)   // opens once verified
                .isDemo(false)
                .build());

        MockRegistryService.LookupResult lookup = registryService.checkBarEnrollment(
                stateCode, request.barSerialNumber().trim(), request.barEnrollmentYear());

        ProfessionalCredential credential = ProfessionalCredential.builder()
                .professionalId(professional.getId())
                .userId(user.getId())
                .credentialKind(CredentialKind.LAWYER)
                .barStateCode(stateCode)
                .barEnrollmentNumber(request.barSerialNumber().trim())
                .barEnrollmentYear(request.barEnrollmentYear())
                .certificateOfPractice(request.certificateOfPractice())
                .build();

        return finishVerification(credential, professional, lookup,
                CredentialKind.LAWYER, credential.formattedBarNumber());
    }

    // ── Therapist registration ──────────────────────────────────────

    @Transactional
    public ProfessionalAuthResponse registerTherapist(TherapistRegisterRequest request, String clientIp) {
        requireCaptcha(request.captchaToken(), clientIp);
        String email = requireVerifiedEmail(request.email());

        if (request.credentialKind() == CredentialKind.LAWYER) {
            throw new BadRequestException("Choose either clinical psychologist or psychiatrist.");
        }

        User user = createAccount(email, request.password(), Role.PSYCHOLOGIST);

        Professional professional = professionalRepository.save(Professional.builder()
                .userId(user.getId())
                .kind(Professional.Kind.PSYCHOLOGIST)
                .fullName(request.registeredFullName().trim())
                .qualification(blankToNull(request.qualification()))
                .specialisations(request.specialisations() == null ? "" : request.specialisations())
                .city(blankToNull(request.city()))
                .state(blankToNull(request.state()))
                .languages(request.languages() == null || request.languages().isBlank()
                        ? "en" : request.languages())
                .verified(false)
                .acceptingClients(false)
                .isDemo(false)
                .build());

        MockRegistryService.LookupResult lookup = request.credentialKind() == CredentialKind.PSYCHIATRIST
                ? registryService.checkNmcRegistration(
                        request.licenseNumber().trim(), request.registeredFullName())
                : registryService.checkRciRegistration(
                        request.licenseNumber().trim(), request.registeredFullName());

        ProfessionalCredential credential = ProfessionalCredential.builder()
                .professionalId(professional.getId())
                .userId(user.getId())
                .credentialKind(request.credentialKind())
                .licenseBody(request.credentialKind() == CredentialKind.PSYCHIATRIST ? "NMC" : "RCI")
                .licenseNumber(request.licenseNumber().trim())
                .registeredFullName(request.registeredFullName().trim())
                .build();

        return finishVerification(credential, professional, lookup,
                request.credentialKind(), request.licenseNumber().trim());
    }

    private ProfessionalAuthResponse finishVerification(
            ProfessionalCredential credential, Professional professional,
            MockRegistryService.LookupResult lookup, CredentialKind kind, String displayId) {

        if (lookup.matched()) {
            credential.setVerificationStatus(VerificationStatus.VERIFIED);
            credential.setVerificationMethod("MOCK_REGISTRY");
            credential.setVerificationNotes(lookup.notes());
            credential.setVerifiedAt(Instant.now());
            professional.setVerified(true);
            professional.setAcceptingClients(true);
        } else {
            credential.setVerificationStatus(VerificationStatus.NEEDS_REVIEW);
            credential.setVerificationMethod("MOCK_REGISTRY");
            credential.setVerificationNotes(lookup.notes());
        }

        credentialRepository.save(credential);
        professionalRepository.save(professional);

        auditService.record(credential.getUserId(),
                kind == CredentialKind.LAWYER ? Role.LAWYER : Role.PSYCHOLOGIST,
                AuditAction.USER_REGISTERED, "ProfessionalCredential",
                credential.getId().toString(), lookup.matched());

        if (lookup.matched()) {
            User user = userRepository.findByIdAndDeletedAtIsNull(credential.getUserId()).orElseThrow();
            return issueSession(user,
                    "Your " + displayId + " enrolment matched our records. You're signed in.");
        }

        adminNotificationService.raise(
                "PROFESSIONAL_NEEDS_REVIEW", "ProfessionalCredential", credential.getId(),
                kind + " credential " + displayId + " did not match the automated registry "
                + "and needs manual review.", "WARN");

        return ProfessionalAuthResponse.pending(VerificationStatus.NEEDS_REVIEW,
                "We could not automatically match " + displayId + " against our registry. "
                + "Your account has been created and a moderator will review it — this is "
                + "normal and does not mean anything is wrong with your enrolment. "
                + "Demo numbers that verify instantly: " + registryService.demoNumbersFor(kind));
    }

    // ── Sign in ─────────────────────────────────────────────────────

    @Transactional
    public ProfessionalAuthResponse login(ProfessionalLoginRequest request, String clientIp) {
        if (!captchaService.verify(request.captchaToken(), clientIp)) {
            throw new BadRequestException(
                    "We could not confirm that request came from a person. Try again.");
        }

        String emailIndex = blindIndexService.forEmail(request.email());
        User user = userRepository.findByEmailIndexAndDeletedAtIsNull(emailIndex)
                .filter(u -> u.getRole() == Role.LAWYER || u.getRole() == Role.PSYCHOLOGIST)
                .orElseThrow(() -> new UnauthorizedException("That email or password is not correct."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("That email or password is not correct.");
        }

        ProfessionalCredential credential = credentialRepository.findByUserId(user.getId())
                .orElseThrow(() -> new UnauthorizedException(
                        "No professional credential is on file for this account."));

        if (credential.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new UnauthorizedException(switch (credential.getVerificationStatus()) {
                case NEEDS_REVIEW -> "Your credentials are still being reviewed by a moderator. "
                        + "You'll be able to sign in as soon as that's complete.";
                case REJECTED -> "Verification for this account was declined. "
                        + "Contact support if you believe this is a mistake.";
                default -> "Your credentials have not been verified yet.";
            });
        }

        return issueSession(user, "Welcome back.");
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private User createAccount(String email, String password, Role role) {
        String emailIndex = blindIndexService.forEmail(email);
        if (userRepository.existsByEmailIndexAndDeletedAtIsNull(emailIndex)) {
            throw new ConflictException("An account already exists for that email address.");
        }
        return userRepository.save(User.builder()
                .emailIndex(emailIndex)
                .email(email.trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(password))
                .role(role)
                .status(UserStatus.ACTIVE)
                .build());
    }

    private String requireVerifiedEmail(String email) {
        EmailValidationService.Result check = emailValidationService.validate(email);
        if (!check.valid()) {
            throw new BadRequestException(check.message());
        }
        if (!emailVerificationService.isVerified(email)) {
            throw new BadRequestException(
                    "Confirm your email address first — we sent you a six-digit code.");
        }
        return email;
    }

    private ProfessionalAuthResponse issueSession(User user, String message) {
        String accessToken = jwtService.issueAccessToken(user.getId(), user.getRole());
        String rawRefresh = tokenHasher.newToken();

        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHasher.hash(rawRefresh))
                .expiresAt(Instant.now().plusSeconds(props.jwt().refreshTtlSeconds()))
                .build());

        return ProfessionalAuthResponse.signedIn(message, accessToken, rawRefresh,
                jwtService.accessTtlSeconds(), userMapper.toResponse(user));
    }

    private void requireCaptcha(String token, String clientIp) {
        if (!captchaService.verify(token, clientIp)) {
            throw new BadRequestException(
                    "We could not confirm that request came from a person. Try again.");
        }
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    // ── Status lookup, used by the professional's own dashboard ──────

    @Transactional(readOnly = true)
    public CredentialStatusResponse myStatus(java.util.UUID userId) {
        ProfessionalCredential credential = credentialRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("No credential on file."));
        return toStatusResponse(credential);
    }

    public CredentialStatusResponse toStatusResponse(ProfessionalCredential credential) {
        String displayId = credential.getCredentialKind() == CredentialKind.LAWYER
                ? credential.formattedBarNumber()
                : credential.getLicenseBody() + "-" + credential.getLicenseNumber();

        return new CredentialStatusResponse(
                credential.getId(), credential.getProfessionalId(), credential.getCredentialKind(),
                displayId, credential.getVerificationStatus(), credential.getVerificationMethod(),
                credential.getVerificationNotes(), credential.getSubmittedAt(), credential.getVerifiedAt());
    }
}
