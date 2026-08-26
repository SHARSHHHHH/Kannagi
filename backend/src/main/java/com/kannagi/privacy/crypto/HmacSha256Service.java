package com.kannagi.privacy.crypto;

import com.kannagi.common.config.AppProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

/**
 * Keyed HMAC-SHA256 digests.
 *
 * Unlike a plain SHA-256 hash, HMAC requires a secret key to produce or
 * verify the digest. This means a stolen database dump alone cannot be used
 * to mount rainbow-table or brute-force attacks against the hashed values.
 *
 * Uses the {@code HMAC_SECRET} environment variable (base-64 encoded, ≥ 32
 * raw bytes). The key is loaded once at startup via {@link AppProperties.Crypto}.
 */
@Service
@Slf4j
public class HmacSha256Service {

    private static final String ALGORITHM = "HmacSHA256";
    private final SecretKeySpec keySpec;

    public HmacSha256Service(AppProperties props) {
        byte[] key = java.util.Base64.getDecoder().decode(props.crypto().hmacSecret());
        this.keySpec = new SecretKeySpec(key, ALGORITHM);
    }

    /**
     * Returns the lowercase hex-encoded HMAC-SHA256 digest of {@code value}.
     *
     * @param value the plaintext input (e.g. an IP address)
     * @return 64-character lowercase hex string
     */
    public String index(String value) {
        try {
            Mac mac = Mac.getInstance(ALGORITHM);
            mac.init(keySpec);
            byte[] digest = mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            log.error("HMAC-SHA256 computation failed", e);
            throw new IllegalStateException("HMAC-SHA256 computation failed", e);
        }
    }
}
