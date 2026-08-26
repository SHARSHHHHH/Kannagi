package com.kannagi.common.util;

import com.kannagi.common.config.AppProperties;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/**
 * Generates the short, human-readable case references shown to users and to
 * professionals in anonymous mode, e.g. {@code KN-83K9D2}.
 *
 * The prefix comes from configuration. Existing references are never rewritten
 * if the prefix later changes — a reference someone has written down must keep
 * working.
 *
 * The alphabet omits I, O, 0 and 1 so a reference read aloud over a phone call
 * or copied from a screenshot cannot be mistyped.
 */
@Component
public class ReferenceGenerator {

    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int LENGTH = 8;

    private final SecureRandom random = new SecureRandom();
    private final String prefix;

    public ReferenceGenerator(AppProperties props) {
        this.prefix = props.caseRef().referencePrefix();
    }

    public String generate() {
        StringBuilder sb = new StringBuilder(prefix).append('-');
        for (int i = 0; i < LENGTH; i++) {
            sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
