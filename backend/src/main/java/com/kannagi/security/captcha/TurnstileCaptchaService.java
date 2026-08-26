package com.kannagi.security.captcha;

import com.kannagi.common.config.AppProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Cloudflare Turnstile.
 *
 * The secret is read from the environment and never leaves the server. A
 * network failure to the provider fails closed: if the check cannot be
 * performed, it did not pass.
 */
@Service
@ConditionalOnProperty(name = "app.captcha.provider", havingValue = "turnstile")
@Slf4j
public class TurnstileCaptchaService implements CaptchaService {

    private final RestTemplate restTemplate;
    private final String secret;
    private final String verifyUrl;

    public TurnstileCaptchaService(RestTemplate restTemplate, AppProperties props) {
        this.restTemplate = restTemplate;
        this.secret = props.captcha().secret();
        this.verifyUrl = props.captcha().verifyUrl();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "CAPTCHA_SECRET must be set when CAPTCHA_PROVIDER=turnstile");
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public boolean verify(String token, String clientIp) {
        if (token == null || token.isBlank()) {
            return false;
        }
        try {
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("secret", secret);
            form.add("response", token);
            if (clientIp != null && !clientIp.isBlank()) {
                form.add("remoteip", clientIp);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            Map<String, Object> body = restTemplate.postForObject(
                    verifyUrl, new HttpEntity<>(form, headers), Map.class);

            return body != null && Boolean.TRUE.equals(body.get("success"));

        } catch (Exception e) {
            log.error("CAPTCHA verification could not be completed", e);
            return false;
        }
    }
}
