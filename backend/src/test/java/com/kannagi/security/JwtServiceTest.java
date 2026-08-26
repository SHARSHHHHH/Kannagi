package com.kannagi.security;

import com.kannagi.TestFixtures;
import com.kannagi.common.config.AppProperties;
import com.kannagi.user.domain.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private final JwtService service = new JwtService(TestFixtures.props());

    @Test
    @DisplayName("a freshly issued token parses back to the same user and role")
    void issueAndParse() {
        UUID userId = UUID.randomUUID();
        String token = service.issueAccessToken(userId, Role.LAWYER);

        assertThat(service.parse(token)).hasValueSatisfying(user -> {
            assertThat(user.id()).isEqualTo(userId);
            assertThat(user.role()).isEqualTo(Role.LAWYER);
        });
    }

    @Test
    @DisplayName("a token signed with a different secret is rejected")
    void rejectsForeignSignature() {
        AppProperties good = TestFixtures.props();
        AppProperties other = new AppProperties(
                good.brand(), good.caseRef(), good.security(),
                new AppProperties.Jwt("test-issuer", TestFixtures.key(48, (byte) 42),
                        good.jwt().refreshSecret(), 900, 1209600),
                good.crypto(), good.captcha(), good.rateLimit(), good.storage(), good.ai(), good.speech());

        String foreign = new JwtService(other)
                .issueAccessToken(UUID.randomUUID(), Role.ADMIN);

        assertThat(service.parse(foreign)).isEmpty();
    }

    @Test
    @DisplayName("a token from another issuer is rejected")
    void rejectsForeignIssuer() {
        AppProperties good = TestFixtures.props();
        AppProperties other = new AppProperties(
                good.brand(), good.caseRef(), good.security(),
                new AppProperties.Jwt("someone-else", good.jwt().secret(),
                        good.jwt().refreshSecret(), 900, 1209600),
                good.crypto(), good.captcha(), good.rateLimit(), good.storage(), good.ai(), good.speech());

        String foreign = new JwtService(other)
                .issueAccessToken(UUID.randomUUID(), Role.USER);

        assertThat(service.parse(foreign)).isEmpty();
    }

    @Test
    @DisplayName("garbage is rejected without throwing")
    void rejectsGarbage() {
        assertThat(service.parse("not-a-token")).isEmpty();
        assertThat(service.parse("")).isEmpty();
    }

    @Test
    @DisplayName("the payload carries no personal data")
    void payloadIsMinimal() {
        String token = service.issueAccessToken(UUID.randomUUID(), Role.USER);
        String payload = new String(
                Base64.getUrlDecoder().decode(token.split("\\.")[1]), StandardCharsets.UTF_8);

        assertThat(payload)
                .contains("sub").contains("role").contains("iat").contains("exp")
                .doesNotContain("email").doesNotContain("phone").doesNotContain("name");
    }
}
