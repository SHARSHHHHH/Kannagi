-- ─────────────────────────────────────────────────────────────
-- V1: users and profiles
--
-- Privacy notes:
--  * Email is stored ENCRYPTED (email_enc, AES-GCM) and is looked up
--    via email_index, a deterministic HMAC-SHA256 blind index. The
--    application never queries by plaintext email.
--  * Phone and display name are encrypted; they are never searched.
--  * Location is stored as city/district/state only. No GPS.
--  * Aadhaar or any national ID is deliberately NOT modelled.
-- ─────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id                     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email_index            VARCHAR(64)  NOT NULL,
    email_enc              TEXT         NOT NULL,
    password_hash          VARCHAR(100) NOT NULL,
    role                   VARCHAR(32)  NOT NULL,
    status                 VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    failed_login_attempts  INT          NOT NULL DEFAULT 0,
    locked_until           TIMESTAMPTZ,
    last_login_at          TIMESTAMPTZ,
    created_at             TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at             TIMESTAMPTZ,

    CONSTRAINT uq_users_email_index UNIQUE (email_index),
    CONSTRAINT ck_users_role CHECK (role IN (
        'USER','LAWYER','PSYCHOLOGIST','SUPPORT_WORKER','MODERATOR','ADMIN'
    )),
    CONSTRAINT ck_users_status CHECK (status IN (
        'ACTIVE','LOCKED','SUSPENDED','DEACTIVATED'
    ))
);

CREATE INDEX idx_users_role       ON users (role);
CREATE INDEX idx_users_status     ON users (status);
CREATE INDEX idx_users_deleted_at ON users (deleted_at);

CREATE TABLE user_profiles (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL,
    display_name_enc    TEXT,
    phone_enc           TEXT,
    gender              VARCHAR(32),
    date_of_birth       DATE,
    marital_status      VARCHAR(32),
    occupation_status   VARCHAR(32),
    city                VARCHAR(120),
    district            VARCHAR(120),
    state               VARCHAR(120),
    preferred_language  VARCHAR(8)  NOT NULL DEFAULT 'en',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_user_profiles_user UNIQUE (user_id),
    CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_user_profiles_gender CHECK (gender IS NULL OR gender IN (
        'WOMAN','TRANS_WOMAN','PREFER_NOT_TO_SAY'
    )),
    CONSTRAINT ck_user_profiles_marital CHECK (marital_status IS NULL OR marital_status IN (
        'SINGLE','MARRIED','SEPARATED','DIVORCED','WIDOWED','PREFER_NOT_TO_SAY'
    )),
    CONSTRAINT ck_user_profiles_occupation CHECK (occupation_status IS NULL OR occupation_status IN (
        'STUDENT','EMPLOYED','SELF_EMPLOYED','HOMEMAKER','UNEMPLOYED','PREFER_NOT_TO_SAY'
    )),
    CONSTRAINT ck_user_profiles_language CHECK (preferred_language IN (
        'en','ta','hi','te','ml','kn'
    ))
);
