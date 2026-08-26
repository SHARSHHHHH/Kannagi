package com.kannagi.audit.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Security-relevant occurrences worth surfacing to an administrator: repeated
 * failed logins, rate-limit trips, rejected CAPTCHA, token reuse.
 *
 * IP addresses are stored hashed. An operator can tell that a burst of attempts
 * came from one source without the table becoming a log of who was online.
 */
@Entity
@Table(name = "security_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityEvent {

    public enum Severity { INFO, WARN, CRITICAL }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "event_type", nullable = false, length = 64)
    private String eventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 16)
    @Builder.Default
    private Severity severity = Severity.INFO;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "ip_hash", length = 64)
    private String ipHash;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @Column(name = "detail", length = 500)
    private String detail;

    @Column(name = "occurred_at", nullable = false, updatable = false)
    private Instant occurredAt;

    @PrePersist
    void onCreate() {
        occurredAt = Instant.now();
    }
}
