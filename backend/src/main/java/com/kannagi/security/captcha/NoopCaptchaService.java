package com.kannagi.security.captcha;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * Development stand-in. Accepts everything and says so loudly at startup, so a
 * deployment that reaches production with this active is obvious in the logs.
 */
@Service
@ConditionalOnProperty(name = "app.captcha.provider", havingValue = "noop", matchIfMissing = true)
@Slf4j
public class NoopCaptchaService implements CaptchaService {

    public NoopCaptchaService() {
        log.warn("CAPTCHA verification is DISABLED (app.captcha.provider=noop). "
                + "Set CAPTCHA_PROVIDER=turnstile before deploying.");
    }

    @Override
    public boolean verify(String token, String clientIp) {
        return true;
    }
}
