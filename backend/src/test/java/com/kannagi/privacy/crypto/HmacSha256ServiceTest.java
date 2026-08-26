package com.kannagi.privacy.crypto;

import com.kannagi.TestFixtures;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class HmacSha256ServiceTest {

    private final HmacSha256Service service = new HmacSha256Service(TestFixtures.props());

    @Test
    @DisplayName("the same input always produces the same HMAC, so forensic correlation works")
    void deterministic() {
        assertThat(service.index("192.168.1.1"))
                .isEqualTo(service.index("192.168.1.1"));
    }

    @Test
    @DisplayName("different inputs produce different digests")
    void distinct() {
        assertThat(service.index("192.168.1.1"))
                .isNotEqualTo(service.index("10.0.0.1"));
    }

    @Test
    @DisplayName("the digest reveals nothing about the input")
    void opaque() {
        String digest = service.index("192.168.1.1");
        assertThat(digest).doesNotContain("192").doesNotContain("168");
        assertThat(digest).hasSize(64).matches("[0-9a-f]+");
    }

    @Test
    @DisplayName("HMAC differs from a plain SHA-256 of the same input")
    void keyedVsUnkeyed() {
        String input = "192.168.1.1";
        String hmac = service.index(input);

        // plain SHA-256 of the same input
        String sha256;
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            sha256 = java.util.HexFormat.of().formatHex(
                    digest.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        assertThat(hmac).isNotEqualTo(sha256);
    }

    @Test
    @DisplayName("empty and blank inputs are still digested (caller decides whether to pass them)")
    void handlesBlank() {
        assertThat(service.index("")).hasSize(64);
        assertThat(service.index("  ")).hasSize(64);
    }
}
