package com.kannagi.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Root of all application configuration. Every user-visible string that
 * names the product is sourced from {@link Brand} — never hard-coded.
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Brand brand,
        CaseRef caseRef,
        Security security,
        Jwt jwt,
        Crypto crypto,
        Captcha captcha,
        RateLimit rateLimit,
        Storage storage,
        Ai ai,
        Speech speech,
        Assignment assignment
) {
    public record Brand(String name, String displayName, String tagline, String supportEmail) {}

    /** Prefix for user-facing case references, e.g. KN-83K9D2. */
    public record CaseRef(String referencePrefix) {}

    public record Security(List<String> corsAllowedOrigins, int maxFailedLogins,
                           int lockoutMinutes, boolean verifyEmailDomain) {}

    public record Jwt(String issuer, String secret, String refreshSecret,
                      long accessTtlSeconds, long refreshTtlSeconds) {}

    public record Crypto(String encryptionKey, String blindIndexKey, String hmacSecret) {}

    public record Captcha(String provider, String secret, String verifyUrl) {}

    public record RateLimit(boolean enabled, int authRequestsPerMinute, int generalRequestsPerMinute) {}

    public record Storage(String path) {}

    public record Ai(String provider, String apiKey, String baseUrl, String model) {}

    public record Speech(String provider, String apiKey, String baseUrl) {}

    /** How long a professional has to accept or reject an offered case before it is eligible for escalation to a public assignment. */
    public record Assignment(int noticePeriodHours) {}
}
