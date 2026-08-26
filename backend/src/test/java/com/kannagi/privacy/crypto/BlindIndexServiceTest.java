package com.kannagi.privacy.crypto;

import com.kannagi.TestFixtures;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class BlindIndexServiceTest {

    private final BlindIndexService service = new BlindIndexService(TestFixtures.props());

    @Test
    @DisplayName("the same address always produces the same index, so lookup works")
    void deterministic() {
        assertThat(service.forEmail("asha@example.com"))
                .isEqualTo(service.forEmail("asha@example.com"));
    }

    @Test
    @DisplayName("case and surrounding whitespace are ignored")
    void normalises() {
        String expected = service.forEmail("asha@example.com");
        assertThat(service.forEmail("  ASHA@Example.COM  ")).isEqualTo(expected);
    }

    @Test
    @DisplayName("different addresses produce different indexes")
    void distinct() {
        assertThat(service.forEmail("asha@example.com"))
                .isNotEqualTo(service.forEmail("meera@example.com"));
    }

    @Test
    @DisplayName("the index reveals nothing about the address")
    void opaque() {
        String index = service.forEmail("asha@example.com");
        assertThat(index).doesNotContain("asha").doesNotContain("example");
        assertThat(index).hasSize(64).matches("[0-9a-f]+");
    }
}
