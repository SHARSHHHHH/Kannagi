package com.kannagi;

import com.kannagi.common.config.AppProperties;

import java.util.Base64;
import java.util.List;

/** Deterministic, test-only configuration. These keys are not used anywhere else. */
public final class TestFixtures {

    private TestFixtures() {}

    public static String key(int bytes, byte fill) {
        byte[] raw = new byte[bytes];
        java.util.Arrays.fill(raw, fill);
        return Base64.getEncoder().encodeToString(raw);
    }

    public static AppProperties props() {
        return new AppProperties(
                new AppProperties.Brand("TestBrand", "TestBrand", "A tagline", "support@example.com"),
                new AppProperties.CaseRef("KN"),
                new AppProperties.Security(List.of("http://localhost:5173"), 5, 15, false),
                new AppProperties.Jwt("test-issuer", key(48, (byte) 7), key(48, (byte) 9), 900, 1209600),
                new AppProperties.Crypto(key(32, (byte) 1), key(32, (byte) 2), key(32, (byte) 3)),
                new AppProperties.Captcha("noop", "", "https://example.invalid"),
                new AppProperties.RateLimit(false, 10, 120),
                new AppProperties.Storage("./storage"),
                new AppProperties.Ai("mock", "", "https://example.invalid", "test-model"),
                new AppProperties.Speech("mock", "", "https://example.invalid")
        );
    }
}
