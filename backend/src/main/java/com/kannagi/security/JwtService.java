package com.kannagi.security;

import com.kannagi.common.config.AppProperties;
import com.kannagi.user.domain.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

/**
 * Issues and validates access tokens.
 *
 * A token carries the subject, the role, and the timestamps — nothing else. No
 * email, no name, no case identifiers. A JWT is signed, not encrypted, so
 * anyone holding one can read its contents.
 *
 * Refresh tokens are deliberately NOT JWTs: they are opaque random strings
 * stored hashed in the database, which is what makes them revocable.
 */
@Service
@Slf4j
public class JwtService {

    private static final String CLAIM_ROLE = "role";

    private final SecretKey accessKey;
    private final String issuer;
    private final long accessTtlSeconds;

    public JwtService(AppProperties props) {
        AppProperties.Jwt jwt = props.jwt();
        byte[] secret = Base64.getDecoder().decode(jwt.secret());
        if (secret.length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must decode to at least 32 bytes. "
                    + "Generate one with: openssl rand -base64 48");
        }
        this.accessKey = Keys.hmacShaKeyFor(secret);
        this.issuer = jwt.issuer();
        this.accessTtlSeconds = jwt.accessTtlSeconds();
    }

    public String issueAccessToken(UUID userId, Role role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId.toString())
                .claim(CLAIM_ROLE, role.name())
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessTtlSeconds)))
                .signWith(accessKey)
                .compact();
    }

    /** @return the principal if the token is valid, otherwise empty. */
    public Optional<CurrentUser> parse(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(accessKey)
                    .requireIssuer(issuer)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            UUID id = UUID.fromString(claims.getSubject());
            Role role = Role.valueOf(claims.get(CLAIM_ROLE, String.class));
            return Optional.of(new CurrentUser(id, role));

        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Rejected token: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public long accessTtlSeconds() {
        return accessTtlSeconds;
    }
}
