package com.kannagi.auth.validation;

import com.kannagi.TestFixtures;
import com.kannagi.common.config.AppProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class EmailValidationServiceTest {

    private static AppProperties withMxCheck(boolean enabled) {
        AppProperties base = TestFixtures.props();
        return new AppProperties(
                base.brand(), base.caseRef(),
                new AppProperties.Security(List.of("http://localhost:5173"), 5, 15, enabled),
                base.jwt(), base.crypto(), base.captcha(), base.rateLimit(), base.storage(), base.ai(), base.speech());
    }

    private final EmailValidationService offline =
            new EmailValidationService(withMxCheck(false));

    @Test
    @DisplayName("a throwaway inbox is refused, because password reset would break")
    void rejectsDisposableDomains() {
        EmailValidationService.Result result = offline.validate("someone@mailinator.com");

        assertThat(result.valid()).isFalse();
        assertThat(result.message()).contains("temporary");
    }

    @Test
    @DisplayName("the refusal points to using the service without an account")
    void disposableMessageOffersAnAlternative() {
        assertThat(offline.validate("x@yopmail.com").message())
                .contains("without an account");
    }

    @Test
    @DisplayName("a domain with no dot is not an address")
    void rejectsMalformedDomain() {
        assertThat(offline.validate("someone@localhost").valid()).isFalse();
        assertThat(offline.validate("no-at-sign").valid()).isFalse();
        assertThat(offline.validate(null).valid()).isFalse();
    }

    @Test
    @DisplayName("ordinary providers pass")
    void acceptsRealDomains() {
        assertThat(offline.validate("asha@gmail.com").valid()).isTrue();
        assertThat(offline.validate("asha@university.edu.in").valid()).isTrue();
    }

    @Test
    @DisplayName("the domain is read from the last @, so plus-addressing works")
    void handlesPlusAddressing() {
        assertThat(offline.validate("asha+support@gmail.com").valid()).isTrue();
    }

    /**
     * Needs working DNS, so it is opt-in: run with -Ddns.tests=true.
     * Excluded by default because a hackathon venue's network should not be able
     * to fail the build.
     */
    @Test
    @EnabledIfSystemProperty(named = "dns.tests", matches = "true")
    @DisplayName("an invented domain is rejected when DNS is available")
    void rejectsInventedDomain() {
        EmailValidationService online = new EmailValidationService(withMxCheck(true));

        assertThat(online.validate("shru@haahah.com").valid()).isFalse();
        assertThat(online.validate("asha@gmail.com").valid()).isTrue();
    }
}
