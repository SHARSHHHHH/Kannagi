package com.kannagi.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Data retention for authentication tokens: expired rows are deleted rather
 * than kept indefinitely.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TokenMaintenance {

    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Scheduled(cron = "0 30 3 * * *")
    @Transactional
    public void purgeExpiredTokens() {
        Instant cutoff = Instant.now();
        int refresh = refreshTokenRepository.deleteExpired(cutoff);
        int reset = passwordResetTokenRepository.deleteExpired(cutoff);
        log.info("Retention sweep removed {} refresh tokens and {} reset tokens", refresh, reset);
    }
}
