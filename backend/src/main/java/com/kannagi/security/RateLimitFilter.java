package com.kannagi.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kannagi.common.config.AppProperties;
import com.kannagi.common.web.ErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Fixed-window rate limiting, in memory.
 *
 * Auth endpoints get a much tighter budget than the rest of the API because
 * they are what a credential-stuffing attempt targets.
 *
 * In-memory means the limit is per-instance. That is fine for a single
 * deployment; running more than one replica needs a shared store such as Redis,
 * and the counter map below is the only thing that would change.
 *
 * Two things this filter has to get right because it runs before Spring
 * Security's CORS handling:
 *
 * - Browser preflight OPTIONS requests are skipped. They are not user actions,
 *   and counting them would consume the request budget unnecessarily.
 *
 * - A 429 written here carries its own CORS headers. Without them the browser
 *   discards the response before JavaScript sees it, and the interface reports
 *   a network failure instead of "you are going too fast".
 */
@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    private record Window(AtomicInteger count, long startedAtEpochMinute) {}

    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final AppProperties props;
    private final ObjectMapper objectMapper;

    public RateLimitFilter(AppProperties props, ObjectMapper objectMapper) {
        this.props = props;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        AppProperties.RateLimit config = props.rateLimit();

        // Preflight is the browser asking permission, not somebody doing something.
        if (!config.enabled() || "OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();

        boolean isAuthEndpoint = path.startsWith("/api/auth/");

        int limit = isAuthEndpoint
                ? config.authRequestsPerMinute()
                : config.generalRequestsPerMinute();

        String key = (isAuthEndpoint ? "auth:" : "gen:") + clientIp(request);

        long currentMinute = Instant.now().getEpochSecond() / 60;

        Window window = windows.compute(key, (k, existing) -> {
            if (existing == null
                    || existing.startedAtEpochMinute() != currentMinute) {

                return new Window(
                        new AtomicInteger(0),
                        currentMinute
                );
            }

            return existing;
        });

        if (window.count().incrementAndGet() > limit) {

            // 429 = Too Many Requests.
            // SC_TOO_MANY_REQUESTS is not available in the servlet API
            // version used by this project.
            response.setStatus(429);

            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            response.setHeader("Retry-After", "60");

            applyCorsHeaders(request, response);

            objectMapper.writeValue(
                    response.getOutputStream(),
                    ErrorResponse.of(
                            "RATE_LIMITED",
                            "Too many requests. Wait a minute and try again."
                    )
            );

            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Echoes the origin when it is one we allow, so a rejected request still
     * reaches the browser's JavaScript as a readable error.
     */
    private void applyCorsHeaders(
            HttpServletRequest request,
            HttpServletResponse response) {

        String origin = request.getHeader("Origin");

        if (origin != null
                && props.security().corsAllowedOrigins().contains(origin)) {

            response.setHeader(
                    "Access-Control-Allow-Origin",
                    origin
            );

            response.setHeader(
                    "Access-Control-Allow-Credentials",
                    "true"
            );

            response.setHeader(
                    "Vary",
                    "Origin"
            );
        }
    }

    /**
     * Clears counters for windows that have rolled over.
     * Called hourly.
     */
    public void evictStaleWindows() {

        long currentMinute =
                Instant.now().getEpochSecond() / 60;

        windows.entrySet().removeIf(
                e -> e.getValue().startedAtEpochMinute()
                        < currentMinute - 5
        );
    }

    private String clientIp(HttpServletRequest request) {

        String forwarded =
                request.getHeader("X-Forwarded-For");

        if (forwarded != null && !forwarded.isBlank()) {

            return forwarded
                    .split(",")[0]
                    .trim();
        }

        return request.getRemoteAddr();
    }
}