package com.kannagi.auth.validation;

import com.kannagi.common.config.AppProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.naming.Context;
import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Checks that an email domain can actually receive mail.
 *
 * Shape validation ({@code @Email}) cannot tell a real address from an invented
 * one — "someone@notarealdomain.com" is perfectly well formed. A DNS lookup for
 * MX records answers the different and more useful question of whether anything
 * is listening at that domain, which catches both invented domains and ordinary
 * typos such as "gmial.com".
 *
 * This is not proof of ownership. Only a confirmation link proves that, and that
 * arrives with notifications in Phase 8. This is the cheap check that removes
 * most bad addresses at the point of entry.
 *
 * On a DNS failure the check passes. A user in a shelter on poor connectivity
 * must not be blocked from creating an account because a lookup timed out; a
 * definitive "this domain has no mail server" is a rejection, an inconclusive
 * answer is not.
 */
@Service
@Slf4j
public class EmailValidationService {

    private static final int DNS_TIMEOUT_MS = 3000;

    /**
     * Throwaway-address providers. Not a moral judgement — someone with reason to
     * avoid a traceable address is exactly who this product is for. But these
     * inboxes expire within the hour, which would silently break password reset
     * and appointment reminders. Anyone wanting distance from their own identity
     * has a better option here: use the service anonymously, with no account.
     */
    private static final Set<String> DISPOSABLE_DOMAINS = Set.of(
            "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
            "throwawaymail.com", "yopmail.com", "trashmail.com", "sharklasers.com",
            "getnada.com", "temp-mail.org", "fakeinbox.com", "maildrop.cc",
            "dispostable.com", "mintemail.com", "emailondeck.com"
    );

    /** Domains resolve to the same answer for everyone, so the result is cached. */
    private final ConcurrentHashMap<String, Boolean> mxCache = new ConcurrentHashMap<>();
    private final boolean mxCheckEnabled;

    public EmailValidationService(AppProperties props) {
        this.mxCheckEnabled = props.security().verifyEmailDomain();
        if (!mxCheckEnabled) {
            log.warn("Email domain verification is disabled. Invented domains will be accepted.");
        }
    }

    public record Result(boolean valid, String message) {
        static Result ok() {
            return new Result(true, null);
        }

        static Result rejected(String message) {
            return new Result(false, message);
        }
    }

    public Result validate(String email) {
        if (email == null || !email.contains("@")) {
            return Result.rejected("Enter a valid email address.");
        }

        String domain = email.substring(email.lastIndexOf('@') + 1)
                .trim().toLowerCase(Locale.ROOT);

        if (domain.isBlank() || !domain.contains(".")) {
            return Result.rejected("Enter a valid email address.");
        }

        if (DISPOSABLE_DOMAINS.contains(domain)) {
            return Result.rejected(
                    "That looks like a temporary email address, which would stop you "
                    + "recovering your account later. Use an address you can reach, or "
                    + "continue without an account instead.");
        }

        if (!mxCheckEnabled) {
            return Result.ok();
        }

        if (!domainAcceptsMail(domain)) {
            return Result.rejected(
                    "We could not find a mail server for \"" + domain + "\". "
                    + "Check the address for a typo.");
        }

        return Result.ok();
    }

    private boolean domainAcceptsMail(String domain) {
        return mxCache.computeIfAbsent(domain, this::lookupMailServer);
    }

    private boolean lookupMailServer(String domain) {
        Hashtable<String, String> env = new Hashtable<>();
        env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.dns.DnsContextFactory");
        env.put("com.sun.jndi.dns.timeout.initial", String.valueOf(DNS_TIMEOUT_MS));
        env.put("com.sun.jndi.dns.timeout.retries", "1");

        InitialDirContext context = null;
        try {
            context = new InitialDirContext(env);

            Attributes records = context.getAttributes(domain, new String[]{"MX"});
            Attribute mx = records.get("MX");
            if (mx != null && mx.size() > 0) {
                return true;
            }

            // Some small domains publish only an A record and still accept mail.
            Attributes fallback = context.getAttributes(domain, new String[]{"A"});
            Attribute a = fallback.get("A");
            return a != null && a.size() > 0;

        } catch (NamingException e) {
            // Distinguish "this domain does not exist" from "DNS did not answer".
            String reason = String.valueOf(e.getMessage());
            if (reason.contains("NXDOMAIN") || reason.contains("Name not found")) {
                log.debug("Domain {} does not exist", domain);
                return false;
            }
            log.warn("DNS lookup for {} was inconclusive; accepting the address", domain);
            return true;

        } catch (Exception e) {
            log.warn("DNS lookup for {} failed; accepting the address", domain);
            return true;

        } finally {
            if (context != null) {
                try {
                    context.close();
                } catch (NamingException ignored) {
                    // Nothing useful to do here.
                }
            }
        }
    }
}
