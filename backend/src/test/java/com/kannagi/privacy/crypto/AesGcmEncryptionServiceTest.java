package com.kannagi.privacy.crypto;

import com.kannagi.TestFixtures;
import com.kannagi.common.config.AppProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Base64;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AesGcmEncryptionServiceTest {

    private final AesGcmEncryptionService service =
            new AesGcmEncryptionService(TestFixtures.props());

    @Test
    @DisplayName("a value survives a round trip unchanged")
    void roundTrip() {
        String plaintext = "My manager keeps messaging me after hours.";
        assertThat(service.decrypt(service.encrypt(plaintext))).isEqualTo(plaintext);
    }

    @Test
    @DisplayName("non-Latin scripts survive a round trip")
    void roundTripTamil() {
        String plaintext = "\u0BB5\u0BA3\u0B95\u0BCD\u0B95\u0BAE\u0BCD";
        assertThat(service.decrypt(service.encrypt(plaintext))).isEqualTo(plaintext);
    }

    @Test
    @DisplayName("the same input encrypts differently every time")
    void randomIvPerValue() {
        String plaintext = "same@example.com";
        assertThat(service.encrypt(plaintext)).isNotEqualTo(service.encrypt(plaintext));
    }

    @Test
    @DisplayName("ciphertext does not contain the plaintext")
    void ciphertextIsOpaque() {
        assertThat(service.encrypt("dowry harassment")).doesNotContain("dowry");
    }

    @Test
    @DisplayName("null passes through so optional fields stay optional")
    void nullSafe() {
        assertThat(service.encrypt(null)).isNull();
        assertThat(service.decrypt(null)).isNull();
    }

    @Test
    @DisplayName("a tampered ciphertext is rejected rather than silently decrypted")
    void tamperIsDetected() {
        String encrypted = service.encrypt("balance owed");
        String body = encrypted.substring(3);
        byte[] raw = Base64.getDecoder().decode(body);
        raw[raw.length - 1] ^= 0x01;
        String tampered = "v1:" + Base64.getEncoder().encodeToString(raw);

        assertThatThrownBy(() -> service.decrypt(tampered))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("startup fails fast on a wrong-sized key")
    void rejectsShortKey() {
        AppProperties good = TestFixtures.props();
        AppProperties bad = new AppProperties(
                good.brand(), good.caseRef(), good.security(), good.jwt(),
                new AppProperties.Crypto(TestFixtures.key(16, (byte) 1), good.crypto().blindIndexKey(), good.crypto().hmacSecret()),
                good.captcha(), good.rateLimit(), good.storage(), good.ai(), good.speech());

        assertThatThrownBy(() -> new AesGcmEncryptionService(bad))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("32 bytes");
    }
}
