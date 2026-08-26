-- V7: one-time email verification codes.
-- Codes are stored hashed and are attempt-limited; the address itself is held
-- only as a blind index, matching how the users table stores it.

CREATE TABLE email_verifications (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email_index VARCHAR(64) NOT NULL,
    code_hash   VARCHAR(64) NOT NULL,
    attempts    INT         NOT NULL DEFAULT 0,
    verified_at TIMESTAMPTZ,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_verifications_lookup ON email_verifications (email_index, created_at DESC);
