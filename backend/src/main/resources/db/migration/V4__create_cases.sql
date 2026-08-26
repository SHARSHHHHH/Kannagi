-- ─────────────────────────────────────────────────────────────
-- V4: cases and case messages
--
-- A case is the container for one situation a person is dealing with.
--
-- Privacy modes:
--   ANONYMOUS     owner_user_id is NULL. Nobody, including an administrator,
--                 can link the case to an account. Access is proved by holding
--                 the reference plus an access key, whose hash is stored here.
--   CONFIDENTIAL  owner_user_id is set. The platform knows who this is; no
--                 professional does until consent is granted.
--   IDENTIFIED    owner_user_id is set and identity may be shared.
--
-- Everything a person actually wrote lives in an encrypted column. The
-- unencrypted columns are structural only: status, timestamps, mode.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE cases (
    id                     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    reference              VARCHAR(24)  NOT NULL,
    owner_user_id          UUID,
    privacy_mode           VARCHAR(16)  NOT NULL,
    status                 VARCHAR(24)  NOT NULL DEFAULT 'OPEN',
    legal_pathway          VARCHAR(24)  NOT NULL DEFAULT 'UNDECIDED',
    title_enc              TEXT,
    summary_enc            TEXT,
    primary_language       VARCHAR(8)   NOT NULL DEFAULT 'en',

    -- Anonymous cases are reopened with reference + access key. Only the hash
    -- is kept, so the database cannot be used to open somebody else's case.
    access_key_hash        VARCHAR(64),

    last_activity_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    created_at             TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ  NOT NULL DEFAULT now(),
    closed_at              TIMESTAMPTZ,
    deleted_at             TIMESTAMPTZ,

    CONSTRAINT uq_cases_reference UNIQUE (reference),
    CONSTRAINT fk_cases_owner FOREIGN KEY (owner_user_id)
        REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT ck_cases_privacy_mode CHECK (privacy_mode IN (
        'ANONYMOUS','CONFIDENTIAL','IDENTIFIED'
    )),
    CONSTRAINT ck_cases_status CHECK (status IN (
        'OPEN','AWAITING_SUPPORT','SUPPORTED','CLOSED'
    )),
    CONSTRAINT ck_cases_legal_pathway CHECK (legal_pathway IN (
        'UNDECIDED','LEGAL_AID','PRIVATE_COUNSEL','NOT_SEEKING_LEGAL'
    )),
    CONSTRAINT ck_cases_language CHECK (primary_language IN (
        'en','ta','hi','te','ml','kn'
    )),
    -- An anonymous case has no owner and must carry an access key.
    -- An owned case has an owner and needs no key.
    CONSTRAINT ck_cases_ownership CHECK (
        (privacy_mode = 'ANONYMOUS' AND owner_user_id IS NULL AND access_key_hash IS NOT NULL)
        OR
        (privacy_mode <> 'ANONYMOUS' AND owner_user_id IS NOT NULL)
    )
);

CREATE INDEX idx_cases_owner        ON cases (owner_user_id);
CREATE INDEX idx_cases_status       ON cases (status);
CREATE INDEX idx_cases_activity     ON cases (last_activity_at DESC);
CREATE INDEX idx_cases_deleted_at   ON cases (deleted_at);

CREATE TABLE case_messages (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id         UUID         NOT NULL,
    sender_type     VARCHAR(24)  NOT NULL,
    sender_user_id  UUID,
    content_enc     TEXT         NOT NULL,
    language        VARCHAR(8)   NOT NULL DEFAULT 'en',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,

    CONSTRAINT fk_case_messages_case FOREIGN KEY (case_id)
        REFERENCES cases (id) ON DELETE CASCADE,
    CONSTRAINT fk_case_messages_sender FOREIGN KEY (sender_user_id)
        REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT ck_case_messages_sender_type CHECK (sender_type IN (
        'USER','ASSISTANT','PROFESSIONAL','SYSTEM'
    ))
);

CREATE INDEX idx_case_messages_case    ON case_messages (case_id, created_at);
CREATE INDEX idx_case_messages_deleted ON case_messages (deleted_at);
