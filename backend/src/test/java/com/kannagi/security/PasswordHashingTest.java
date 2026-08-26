package com.kannagi.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

class PasswordHashingTest {

    private final PasswordEncoder encoder = new BCryptPasswordEncoder(12);

    @Test
    @DisplayName("a password is never stored in a recoverable form")
    void hashIsNotThePassword() {
        String raw = "correct horse battery staple";
        String hash = encoder.encode(raw);

        assertThat(hash).isNotEqualTo(raw).doesNotContain(raw);
        assertThat(encoder.matches(raw, hash)).isTrue();
    }

    @Test
    @DisplayName("the same password hashes differently for different accounts")
    void saltedPerHash() {
        assertThat(encoder.encode("shared-password"))
                .isNotEqualTo(encoder.encode("shared-password"));
    }

    @Test
    @DisplayName("a wrong password does not verify")
    void rejectsWrongPassword() {
        String hash = encoder.encode("the-real-password");
        assertThat(encoder.matches("the-wrong-password", hash)).isFalse();
    }

    @Test
    @DisplayName("hashing uses cost factor 12")
    void usesConfiguredCost() {
        assertThat(encoder.encode("anything")).startsWith("$2a$12$");
    }
}
