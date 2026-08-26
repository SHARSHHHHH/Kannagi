package com.kannagi.security;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Keeps the in-memory rate-limit map from growing without bound. */
@Component
@RequiredArgsConstructor
public class RateLimitMaintenance {

    private final RateLimitFilter rateLimitFilter;

    @Scheduled(fixedDelay = 3_600_000L)
    public void evict() {
        rateLimitFilter.evictStaleWindows();
    }
}
