-- ─────────────────────────────────────────────────────────────
-- V8: professional identity verification, case assignment, and
--     the admin notification queue that connects them.
--
-- Design note on verification:
--
-- Nothing here calls the real Bar Council of India, RCI or NMC portals —
-- those have no public API, and BCI's own site is a manual "Advocate
-- Search" lookup, not a service this application can call. What this
-- migration models instead is the SHAPE of that verification: the
-- identifiers a real integration would check (enrollment number, state
-- bar code, CRR number, NMC registration number), a verification_method
-- column that honestly says MOCK_REGISTRY today, and a path for a human
-- admin to review anything the mock registry does not recognise.
--
-- Swapping MOCK_REGISTRY for a real BCI/RCI/NMC or DigiLocker integration
-- later means writing a new ProfessionalVerificationService and changing
-- nothing about this schema.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE professional_credentials (
    id                     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id        UUID         NOT NULL,
    user_id                UUID         NOT NULL,

    -- LAWYER | CLINICAL_PSYCHOLOGIST | PSYCHIATRIST
    credential_kind        VARCHAR(32)  NOT NULL,

    -- Lawyer fields (Advocates Act, 1961). Enrolment number format is
    -- StateCode/Serial/Year, e.g. D/2345/2023 — stored split so the state
    -- code can be validated and displayed without re-parsing the string.
    bar_state_code         VARCHAR(12),
    bar_enrollment_number  VARCHAR(64),
    bar_enrollment_year    INT,
    certificate_of_practice BOOLEAN     NOT NULL DEFAULT FALSE,

    -- Therapist fields. Clinical psychologists register with the
    -- Rehabilitation Council of India (CRR number); psychiatrists are
    -- medical doctors registered with the NMC or a State Medical Council.
    license_body           VARCHAR(16),   -- RCI | NMC
    license_number         VARCHAR(64),
    registered_full_name   VARCHAR(200),  -- name exactly as on the register

    -- Verification outcome. MOCK_REGISTRY means checked against the
    -- seeded demo registry below; ADMIN_OVERRIDE means a human decided.
    verification_status    VARCHAR(24)  NOT NULL DEFAULT 'PENDING',
    verification_method    VARCHAR(24),
    verification_notes     VARCHAR(1000),
    verified_at            TIMESTAMPTZ,
    verified_by            UUID,

    submitted_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_professional_credentials_professional UNIQUE (professional_id),
    CONSTRAINT fk_professional_credentials_professional FOREIGN KEY (professional_id)
        REFERENCES professionals (id) ON DELETE CASCADE,
    CONSTRAINT fk_professional_credentials_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_professional_credentials_kind CHECK (credential_kind IN (
        'LAWYER','CLINICAL_PSYCHOLOGIST','PSYCHIATRIST'
    )),
    CONSTRAINT ck_professional_credentials_status CHECK (verification_status IN (
        'PENDING','VERIFIED','NEEDS_REVIEW','REJECTED'
    )),
    CONSTRAINT ck_professional_credentials_license_body CHECK (
        license_body IS NULL OR license_body IN ('RCI','NMC')
    )
);

CREATE INDEX idx_professional_credentials_status ON professional_credentials (verification_status);
CREATE INDEX idx_professional_credentials_user ON professional_credentials (user_id);


-- Assigning a professional to actually handle a case — separate from
-- appointments, which book a single session. An assignment is offered,
-- and the professional accepts or rejects it.
CREATE TABLE case_assignments (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id           UUID         NOT NULL,
    professional_id   UUID         NOT NULL,

    -- PRIVATE: she chose and requested this named professional.
    -- PUBLIC: assigned by an admin after a private request stalled.
    -- LEGAL_AID: routed through the free legal-aid pathway.
    assignment_type   VARCHAR(16)  NOT NULL DEFAULT 'PRIVATE',

    status            VARCHAR(24)  NOT NULL DEFAULT 'OFFERED',
    offered_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    responded_at      TIMESTAMPTZ,
    response_note     VARCHAR(1000),

    -- The notice period: how long the professional has to accept or
    -- reject before the case is eligible for escalation to a public
    -- assignment. Set at offer time so it is visible without recomputing.
    notice_deadline   TIMESTAMPTZ  NOT NULL,
    escalated         BOOLEAN      NOT NULL DEFAULT FALSE,
    escalated_at      TIMESTAMPTZ,

    -- The assignment this one replaced, when escalation created a new
    -- offer. Lets the chain be reconstructed without extra tables.
    superseded_assignment_id UUID,

    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT fk_case_assignments_case FOREIGN KEY (case_id)
        REFERENCES cases (id) ON DELETE CASCADE,
    CONSTRAINT fk_case_assignments_professional FOREIGN KEY (professional_id)
        REFERENCES professionals (id) ON DELETE CASCADE,
    CONSTRAINT ck_case_assignments_type CHECK (assignment_type IN (
        'PRIVATE','PUBLIC','LEGAL_AID'
    )),
    CONSTRAINT ck_case_assignments_status CHECK (status IN (
        'OFFERED','ACCEPTED','REJECTED','EXPIRED','COMPLETED'
    ))
);

CREATE INDEX idx_case_assignments_case ON case_assignments (case_id);
CREATE INDEX idx_case_assignments_professional ON case_assignments (professional_id, status);
CREATE INDEX idx_case_assignments_pending ON case_assignments (status, notice_deadline)
    WHERE status = 'OFFERED';


-- What lands in the admin portal's notification feed. Deliberately generic
-- — a professional-verification queue and an escalated-case queue are both
-- "something needs a human's attention", and the admin UI reads this one
-- table rather than polling several.
CREATE TABLE admin_notifications (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    type          VARCHAR(48)  NOT NULL,
    resource_type VARCHAR(48)  NOT NULL,
    resource_id   UUID         NOT NULL,
    message       VARCHAR(500) NOT NULL,
    severity      VARCHAR(16)  NOT NULL DEFAULT 'INFO',
    read_at       TIMESTAMPTZ,
    resolved_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT ck_admin_notifications_type CHECK (type IN (
        'PROFESSIONAL_PENDING_VERIFICATION',
        'PROFESSIONAL_NEEDS_REVIEW',
        'CASE_ESCALATED_NEEDS_PUBLIC_ASSIGNMENT'
    )),
    CONSTRAINT ck_admin_notifications_severity CHECK (severity IN ('INFO','WARN','CRITICAL'))
);

CREATE INDEX idx_admin_notifications_unresolved ON admin_notifications (resolved_at, created_at DESC);
CREATE INDEX idx_admin_notifications_resource ON admin_notifications (resource_type, resource_id);
