-- ─────────────────────────────────────────────────────────────
-- V6: community, moderation, consent
-- ─────────────────────────────────────────────────────────────

CREATE TABLE community_posts (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    author_user_id    UUID,
    anonymous         BOOLEAN      NOT NULL DEFAULT TRUE,
    title             VARCHAR(200) NOT NULL,
    content           TEXT         NOT NULL,
    category          VARCHAR(64)  NOT NULL,
    moderation_status VARCHAR(24)  NOT NULL DEFAULT 'PENDING',
    moderation_note   VARCHAR(500),
    helpful_count     INT          NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ,

    CONSTRAINT fk_community_posts_author FOREIGN KEY (author_user_id)
        REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT ck_community_posts_moderation CHECK (moderation_status IN (
        'PENDING','APPROVED','FLAGGED','HIDDEN'
    ))
);

CREATE INDEX idx_community_posts_status ON community_posts (moderation_status, created_at DESC);

CREATE TABLE community_comments (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id           UUID        NOT NULL,
    author_user_id    UUID,
    anonymous         BOOLEAN     NOT NULL DEFAULT TRUE,
    content           TEXT        NOT NULL,
    moderation_status VARCHAR(24) NOT NULL DEFAULT 'PENDING',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at        TIMESTAMPTZ,

    CONSTRAINT fk_community_comments_post FOREIGN KEY (post_id)
        REFERENCES community_posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_community_comments_author FOREIGN KEY (author_user_id)
        REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT ck_community_comments_moderation CHECK (moderation_status IN (
        'PENDING','APPROVED','FLAGGED','HIDDEN'
    ))
);

CREATE INDEX idx_community_comments_post ON community_comments (post_id, created_at);

CREATE TABLE content_reports (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type  VARCHAR(32)  NOT NULL,
    resource_id    UUID         NOT NULL,
    reporter_user_id UUID,
    reason         VARCHAR(64)  NOT NULL,
    detail         VARCHAR(1000),
    status         VARCHAR(24)  NOT NULL DEFAULT 'OPEN',
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    resolved_at    TIMESTAMPTZ,
    resolved_by    UUID,

    CONSTRAINT ck_content_reports_status CHECK (status IN ('OPEN','REVIEWING','RESOLVED','DISMISSED'))
);

CREATE INDEX idx_content_reports_status ON content_reports (status, created_at DESC);

CREATE TABLE consents (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID,
    case_id        UUID,
    consent_type   VARCHAR(48)  NOT NULL,
    granted        BOOLEAN      NOT NULL DEFAULT FALSE,
    granted_at     TIMESTAMPTZ,
    revoked_at     TIMESTAMPTZ,
    shared_with    VARCHAR(200),
    purpose        VARCHAR(500),
    policy_version VARCHAR(32)  NOT NULL DEFAULT 'v1',
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT fk_consents_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_consents_case FOREIGN KEY (case_id)
        REFERENCES cases (id) ON DELETE CASCADE,
    CONSTRAINT ck_consents_type CHECK (consent_type IN (
        'DATA_PROCESSING','LEGAL_SHARING','PSYCHOLOGICAL_SHARING',
        'CONTACT_SHARING','COMMUNITY_POSTING','AUDIO_STORAGE'
    ))
);

CREATE INDEX idx_consents_user ON consents (user_id);
CREATE INDEX idx_consents_case ON consents (case_id);
