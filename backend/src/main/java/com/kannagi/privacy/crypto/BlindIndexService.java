package com.kannagi.privacy.crypto;

import com.kannagi.common.config.AppProperties;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

/**
 * Deterministic lookup keys for values that are encrypted at rest but still
 * need to be searchable — email addresses being the only case today.
 *
 * A plain hash would let anyone with the database run a dictionary attack over
 * common addresses, so this is an HMAC under a key that lives only in the
 * environment. Without that key the index column is inert.
 *
 * This key is separate from the encryption key: compromising one should not
 * compromise the other.
 */
@Service
public class BlindIndexService {

    private static final String ALGORITHM = "HmacSHA256";

    private final SecretKeySpec key;

    public BlindIndexService(AppProperties props) {
        byte[] raw = Base64.getDecoder().decode(props.crypto().blindIndexKey());
        if (raw.length != 32) {
            throw new IllegalStateException(
                    "BLIND_INDEX_KEY must decode to exactly 32 bytes. "
                    + "Generate one with: openssl rand -base64 32");
        }
        this.key = new SecretKeySpec(raw, ALGORITHM);
    }

    /** Normalises then indexes an email address. Case and padding are ignored. */
    public String forEmail(String email) {
        return index(email.trim().toLowerCase(Locale.ROOT));
    }

    public String index(String value) {
        try {
            Mac mac = Mac.getInstance(ALGORITHM);
            mac.init(key);
            return HexFormat.of().formatHex(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Blind index computation failed", e);
        }
    }
}
