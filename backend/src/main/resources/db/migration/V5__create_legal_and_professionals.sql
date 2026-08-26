-- ─────────────────────────────────────────────────────────────
-- V5: verified legal material, professionals, appointments
--
-- Legal rows carry their source and the date a person last checked them.
-- Anything without both is not shown, because the whole point of a legal
-- knowledge base here is that a model cannot invent into it.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE legal_resources (
    id                            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    law_name                      VARCHAR(300) NOT NULL,
    section                       VARCHAR(120),
    jurisdiction                  VARCHAR(120) NOT NULL DEFAULT 'India',
    description                   TEXT         NOT NULL,
    plain_language_explanation    TEXT         NOT NULL,
    what_it_may_cover             TEXT,
    possible_next_steps           TEXT,
    issue_categories              TEXT         NOT NULL,
    source_url                    VARCHAR(600) NOT NULL,
    source_name                   VARCHAR(300) NOT NULL,
    last_verified_at              DATE         NOT NULL,
    verified_by                   VARCHAR(200) NOT NULL,
    active                        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at                    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_legal_resources_active ON legal_resources (active);

CREATE TABLE legal_cases (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    case_name      VARCHAR(400) NOT NULL,
    court          VARCHAR(200) NOT NULL,
    year           INT          NOT NULL,
    summary        TEXT         NOT NULL,
    issue_category VARCHAR(64)  NOT NULL,
    outcome        TEXT,
    source_url     VARCHAR(600) NOT NULL,
    verified_at    DATE         NOT NULL,
    active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_legal_cases_category ON legal_cases (issue_category);

-- Professionals. is_demo marks seeded, fictional profiles; the interface shows
-- a DEMO PROFILE badge for every row where this is true.
CREATE TABLE professionals (
    id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID,
    kind                 VARCHAR(24)  NOT NULL,
    full_name            VARCHAR(200) NOT NULL,
    qualification        VARCHAR(300),
    registration_info    VARCHAR(300),
    bio                  TEXT,
    practice_areas       TEXT         NOT NULL DEFAULT '',
    specialisations      TEXT         NOT NULL DEFAULT '',
    languages            TEXT         NOT NULL DEFAULT 'en',
    city                 VARCHAR(120),
    state                VARCHAR(120),
    years_experience     INT          NOT NULL DEFAULT 0,
    rating               NUMERIC(2,1),
    review_count         INT          NOT NULL DEFAULT 0,
    offers_online        BOOLEAN      NOT NULL DEFAULT TRUE,
    offers_in_person     BOOLEAN      NOT NULL DEFAULT TRUE,
    accepts_legal_aid    BOOLEAN      NOT NULL DEFAULT FALSE,
    consultation_fee_info VARCHAR(200),
    verified             BOOLEAN      NOT NULL DEFAULT FALSE,
    accepting_clients    BOOLEAN      NOT NULL DEFAULT TRUE,
    is_demo              BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT fk_professionals_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT ck_professionals_kind CHECK (kind IN ('LAWYER','PSYCHOLOGIST','SUPPORT_WORKER'))
);

CREATE INDEX idx_professionals_kind  ON professionals (kind);
CREATE INDEX idx_professionals_state ON professionals (state);

CREATE TABLE appointments (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    reference         VARCHAR(24)  NOT NULL,
    case_id           UUID,
    professional_id   UUID         NOT NULL,
    requester_user_id UUID,
    anonymous         BOOLEAN      NOT NULL DEFAULT TRUE,
    scheduled_at      TIMESTAMPTZ  NOT NULL,
    duration_minutes  INT          NOT NULL DEFAULT 45,
    mode              VARCHAR(16)  NOT NULL DEFAULT 'ONLINE',
    status            VARCHAR(24)  NOT NULL DEFAULT 'REQUESTED',
    note_enc          TEXT,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT uq_appointments_reference UNIQUE (reference),
    -- Prevents double booking at the database level, not merely in service code.
    CONSTRAINT uq_appointments_slot UNIQUE (professional_id, scheduled_at),
    CONSTRAINT fk_appointments_case FOREIGN KEY (case_id)
        REFERENCES cases (id) ON DELETE SET NULL,
    CONSTRAINT fk_appointments_professional FOREIGN KEY (professional_id)
        REFERENCES professionals (id) ON DELETE CASCADE,
    CONSTRAINT fk_appointments_requester FOREIGN KEY (requester_user_id)
        REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT ck_appointments_status CHECK (status IN (
        'REQUESTED','ACCEPTED','REJECTED','CANCELLED','COMPLETED'
    )),
    CONSTRAINT ck_appointments_mode CHECK (mode IN ('ONLINE','IN_PERSON'))
);

CREATE INDEX idx_appointments_professional ON appointments (professional_id, scheduled_at);
CREATE INDEX idx_appointments_requester    ON appointments (requester_user_id);
