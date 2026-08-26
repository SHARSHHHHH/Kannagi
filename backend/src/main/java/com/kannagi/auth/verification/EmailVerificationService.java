package com.kannagi.auth.verification;

import com.kannagi.auth.validation.EmailValidationService;
import com.kannagi.common.config.AppProperties;
import com.kannagi.common.exception.BadRequestException;
import com.kannagi.privacy.crypto.BlindIndexService;
import com.kannagi.privacy.crypto.TokenHasher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

/**
 * Sends a six-digit code and checks it back.
 *
 * This is what actually proves an address exists. The DNS check catches invented
 * domains; only a code someone reads proves the inbox is reachable and theirs.
 *
 * With no mail server configured the code is written to the application log and
 * returned in the API response, and the response says plainly that it is doing
 * so. A prototype that pretended to send mail would be worse than one that
 * admits it cannot.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {

    private static final Duration CODE_TTL = Duration.ofMinutes(10);
    /** How long a completed verification stays good for finishing registration. */
    private static final Duration VERIFIED_WINDOW = Duration.ofMinutes(60);

    private final EmailVerificationRepository repository;
    private final BlindIndexService blindIndexService;
    private final TokenHasher tokenHasher;
    private final EmailValidationService emailValidationService;
    private final Optional<JavaMailSender> mailSender;
    private final AppProperties props;

    private final SecureRandom random = new SecureRandom();

    public record SendResult(boolean sent, String message, String devCode) {}

    @Transactional
    public SendResult sendCode(String email) {
        EmailValidationService.Result check = emailValidationService.validate(email);
        if (!check.valid()) {
            throw new BadRequestException(check.message());
        }

        String code = String.format("%06d", random.nextInt(1_000_000));
        String emailIndex = blindIndexService.forEmail(email);

        repository.save(EmailVerification.builder()
                .emailIndex(emailIndex)
                .codeHash(tokenHasher.hash(code))
                .expiresAt(Instant.now().plus(CODE_TTL))
                .build());

        if (mailSender.isPresent()) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(email);
                message.setSubject(props.brand().displayName() + " verification code");
                message.setText("""
                        Your verification code is %s

                        It expires in 10 minutes.

                        If you did not ask for this, you can ignore this message —
                        no account has been created.
                        """.formatted(code));
                mailSender.get().send(message);

                return new SendResult(true,
                        "We sent a six-digit code to that address. It expires in 10 minutes.",
                        null);

            } catch (Exception e) {
                log.error("Could not send the verification email", e);
            }
        }

        // No mail server. Say so rather than showing a spinner that means nothing.
        log.warn("EMAIL VERIFICATION CODE for {}: {}  (no mail server configured)",
                email, code);

        return new SendResult(false,
                "No mail server is configured on this deployment, so the code is shown "
                + "here and written to the server log instead of being emailed.",
                code);
    }

    @Transactional
    public void verify(String email, String code) {
        String emailIndex = blindIndexService.forEmail(email);

        EmailVerification verification = repository
                .findFirstByEmailIndexOrderByCreatedAtDesc(emailIndex)
                .orElseThrow(() -> new BadRequestException(
                        "Ask for a code first."));

        if (!verification.isUsable()) {
            throw new BadRequestException(
                    "That code has expired or been tried too many times. Ask for a new one.");
        }

        verification.setAttempts(verification.getAttempts() + 1);

        if (!tokenHasher.hash(code.trim()).equals(verification.getCodeHash())) {
            repository.save(verification);
            throw new BadRequestException("That code is not correct.");
        }

        verification.setVerifiedAt(Instant.now());
        repository.save(verification);
    }

    /** Whether this address completed verification recently enough to register. */
    @Transactional(readOnly = true)
    public boolean isVerified(String email) {
        return repository
                .findFirstByEmailIndexAndVerifiedAtIsNotNullAndVerifiedAtAfterOrderByVerifiedAtDesc(
                        blindIndexService.forEmail(email),
                        Instant.now().minus(VERIFIED_WINDOW))
                .isPresent();
    }
}
