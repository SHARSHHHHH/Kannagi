package com.kannagi.security.captcha;

/**
 * Human-verification check.
 *
 * Abstracted so the provider is a configuration choice: local development runs
 * against a no-op implementation, deployments run against Turnstile.
 */
public interface CaptchaService {

    /**
     * @param token    the response token produced by the widget in the browser
     * @param clientIp optional, improves the provider's scoring
     * @return true if the challenge was solved
     */
    boolean verify(String token, String clientIp);
}
