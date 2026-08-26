package com.kannagi.common.util;

import com.kannagi.TestFixtures;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class ReferenceGeneratorTest {

    private final ReferenceGenerator generator = new ReferenceGenerator(TestFixtures.props());

    @Test
    @DisplayName("references use the configured prefix")
    void usesConfiguredPrefix() {
        assertThat(generator.generate()).startsWith("KN-");
    }

    @Test
    @DisplayName("references avoid characters that are easy to misread aloud")
    void avoidsAmbiguousCharacters() {
        String body = generator.generate().substring(3);
        assertThat(body).hasSize(8).doesNotContain("I", "O", "0", "1");
    }

    @Test
    @DisplayName("references do not collide in ordinary use")
    void isUnique() {
        Set<String> seen = new HashSet<>();
        for (int i = 0; i < 5000; i++) {
            seen.add(generator.generate());
        }
        assertThat(seen).hasSize(5000);
    }
}
