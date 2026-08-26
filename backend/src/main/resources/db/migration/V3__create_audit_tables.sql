-- ─────────────────────────────────────────────────────────────
-- V3: audit logs and security events
--
-- Audit rows record WHO did WHAT to WHICH resource — never the
-- contents of a private message, transcript or case description.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id      UUID,
    actor_role    VARCHAR(32),
    action        VARCHAR(64) NOT NULL,
    resource_type VARCHAR(64),
    resource_id   VARCHAR(64),
    success       BOOLEAN     NOT NULL DEFAULT TRUE,
    occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata      JSONB
);

CREATE INDEX idx_audit_logs_actor    ON audit_logs (actor_id);
CREATE INDEX idx_audit_logs_action   ON audit_logs (action);
CREATE INDEX idx_audit_logs_occurred ON audit_logs (occurred_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs (resource_type, resource_id);

CREATE TABLE security_events (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type   VARCHAR(64) NOT NULL,
    severity     VARCHAR(16) NOT NULL DEFAULT 'INFO',
    actor_id     UUID,
    ip_hash      VARCHAR(64),
    user_agent   VARCHAR(255),
    detail       VARCHAR(500),
    occurred_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT ck_security_events_severity CHECK (severity IN ('INFO','WARN','CRITICAL'))
);

CREATE INDEX idx_security_events_type     ON security_events (event_type);
CREATE INDEX idx_security_events_occurred ON security_events (occurred_at DESC);
