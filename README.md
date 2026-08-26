# Kannagi

**Speak safely. Know what's possible. Decide what happens next.**

A confidential platform where a woman can describe what she is going through in
her own words and her own language, understand which protections and support may
apply, and decide for herself what to do next.

The name comes from the *Silappadikaram* — a woman who was not believed until she
produced proof, then stood before a king and was finally heard. The product's job
is the same sequence, with the last step always belonging to her.

---

## Current status

Phase 1 of 10 is implemented and building. The rest is scaffolded but not yet
written — see [Roadmap](#roadmap).

| | |
|---|---|
| Frontend build | ✅ `npm run build` passes clean |
| Backend compile | ⚠️ Not verified — needs `mvn clean verify` on your machine |
| Database | ✅ Migrations V1–V3 written |
| Tests | ✅ 20 unit tests written (crypto, JWT, password hashing, references) |

**The backend has not been compiled.** It was written in an environment without
Maven or Maven Central access, so run `mvn clean verify` before your first demo
and expect to fix a small number of import or signature issues. Everything else
in this README has been verified.

---

## Running it

### Prerequisites

- Java 21, Maven 3.9+
- Node 20+
- PostgreSQL 16 (or Docker)

### 1. Environment

```bash
cp .env.example .env
```

Generate real secrets — the defaults in `application.yml` are development
placeholders and will not do:

```bash
echo "JWT_SECRET=$(openssl rand -base64 48)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 48)"
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)"
echo "BLIND_INDEX_KEY=$(openssl rand -base64 32)"
```

Paste those into `.env`.

> **Keep `ENCRYPTION_KEY` and `BLIND_INDEX_KEY` safe.** Losing the encryption key
> makes every stored email, name and phone number permanently unreadable. Losing
> the blind-index key makes it impossible to look up any account. There is no
> recovery path, by design.

### 2. Everything at once

```bash
docker compose up --build
```

- Frontend → http://localhost:5173
- API → http://localhost:8080
- Swagger → http://localhost:8080/swagger-ui/index.html

### 3. Or run the pieces separately

```bash
# Database
docker compose up db

# Backend
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 4. Verify

```bash
cd backend  && mvn clean verify   # compiles, runs migrations check, runs tests
cd frontend && npm run build      # typechecks and builds
```

---

## What Phase 1 gives you

**Working end to end**

- Register → JWT issued → dashboard loads → refresh on 401 → sign out
- BCrypt cost 12, per-account lockout after 5 failed attempts
- Rotating refresh tokens with reuse detection
- Password reset request and completion (token generated; email delivery is Phase 8)

**Privacy built into the schema, not bolted on**

- Email stored twice: AES-256-GCM ciphertext plus an HMAC blind index. The
  application never queries a plaintext email, so the database has no searchable
  personal data.
- Names and phone numbers encrypted via a JPA converter, so an entity cannot
  accidentally store them in the clear.
- Location is city/district/state. No coordinates, no full addresses, no Aadhaar.
- Audit log records actions and resource ids, never message contents.
- IP addresses in security events are hashed.

**Security**

- Deny-by-default authorisation plus `@PreAuthorize` on each endpoint
- Per-IP rate limiting, tighter on `/api/auth/*`
- CAPTCHA behind an interface; `noop` in dev, Turnstile in deployment, fails closed
- Global exception handler that never returns a stack trace
- HSTS, `X-Frame-Options: DENY`, `nosniff`, `no-referrer`

**Interface**

- Landing page, sign in, register, dashboard
- **Quick exit** — click, or press Escape three times, to wipe the session and
  leave for a neutral page
- Registration asks for two fields; everything else is behind an optional section
- Tokens in `sessionStorage`, not `localStorage`: closing the tab ends the session

---

## Renaming the product

The product name appears in exactly five places. Nowhere else in the codebase
contains the literal string.

| File | Setting |
|---|---|
| `backend/src/main/resources/application.yml` | `app.brand.*` defaults |
| `.env` | `APP_BRAND_NAME`, `APP_BRAND_DISPLAY_NAME`, `APP_BRAND_TAGLINE` |
| `frontend/.env` | `VITE_APP_NAME`, `VITE_APP_TAGLINE` |
| `frontend/src/config/brand.ts` | fallback values only |
| `frontend/public/favicon.svg` | the mark |

To rename:

1. Set `APP_BRAND_NAME` and `APP_BRAND_DISPLAY_NAME` in the backend environment
2. Set `VITE_APP_NAME` in the frontend environment and rebuild
3. Optionally change `APP_CASE_REF_PREFIX` (default `KN`)
4. Replace `frontend/public/favicon.svg`

No source changes. `GET /api/config/brand` serves the name at runtime for anything
that needs it without a rebuild.

**Two things do not rename:**

- **The Java package `com.kannagi`.** Renaming it means touching every import in
  the project. It is internal and invisible to users — leave it.
- **Existing case references.** A reference someone wrote down keeps working.
  Only new ones use a changed prefix.

---

## Architecture

```
backend/src/main/java/com/kannagi/
├── auth/            registration, sign-in, tokens, password reset, email checks
├── user/            accounts and profiles
├── case_management/ cases, messages, privacy modes, access control
├── security/    JWT, filters, rate limiting, CAPTCHA, authorisation
├── privacy/     encryption, blind index, token hashing
├── audit/       audit log and security events
└── common/      config, error handling, shared web types
```

Package-by-feature. Each package owns its controller, service, repository, DTOs
and entities. Later phases (`case_management`, `chatbot`, `ai`, `speech`, `legal`,
`lawyer`, `psychologist`, `appointment`, `community`, `moderation`) slot in
alongside these without touching them.

### Decisions worth knowing about

**Refresh tokens are not JWTs.** A JWT cannot be revoked before it expires.
Refresh tokens are opaque random strings, stored as SHA-256 hashes, so a stolen
database cannot be replayed and any session can be cut immediately. Presenting an
already-revoked token revokes every session for that account and raises a
`CRITICAL` security event.

**Sign-in takes the same time whether or not the account exists.** A dummy BCrypt
verification runs when no account is found. Without it, response timing tells an
attacker which addresses are registered.

**Password reset always reports success.** Confirming that an address is
registered would make the endpoint an account-enumeration tool.

**CAPTCHA fails closed.** If the provider cannot be reached, the check did not
pass. `NoopCaptchaService` logs a warning at startup so a deployment that reaches
production with verification disabled is obvious in the logs.

**An anonymous case has no owner column set at all.** Not an owner the code
agrees not to look at — the link is never recorded. Access is proved by holding
the reference plus an access key, stored only as a SHA-256 hash. Losing both
means the case is unrecoverable by anyone, including an administrator with
database access. The interface states that cost before she chooses, and blocks
the case behind a confirmation until she says she has saved the key.

**Refusing access says "not found", never "forbidden".** A 403 confirms the case
is real, which makes references worth guessing at. A wrong reference and a wrong
key produce the same response.

**Legal aid and private counsel are a fork, not a filter.** They are different
systems: one is applied for through a statutory body at no cost, the other is
chosen and paid for. A single merged lawyer list would bury the only route open
to someone with no money. Neither option is preselected or recommended, and the
choice is recorded only after she makes it.

**Email domains are checked by DNS at registration.** `@Email` validates shape,
which accepts `someone@notarealdomain.com`. An MX lookup asks whether anything
is actually listening at that domain, catching invented domains and typos like
`gmial.com`. It is not proof of ownership — that needs a confirmation link, which
arrives in Phase 8. A DNS timeout accepts the address rather than blocking
registration on a poor connection. Set `VERIFY_EMAIL_DOMAIN=false` if your
network blocks outbound DNS.

**Audit writes run in their own transaction.** A failure to record never rolls
back the user's actual work — and a failed action still leaves a trace.

---

## API

Full documentation at `/swagger-ui/index.html` in the `dev` profile. Disabled in
`prod`.

| Method | Path | Auth |
|---|---|---|
| `POST` | `/api/auth/register` | public |
| `POST` | `/api/auth/login` | public |
| `POST` | `/api/auth/refresh` | public |
| `POST` | `/api/auth/logout` | public |
| `POST` | `/api/auth/forgot-password` | public |
| `POST` | `/api/auth/reset-password` | public |
| `GET` | `/api/users/me` | bearer |
| `PATCH` | `/api/users/me` | bearer |
| `DELETE` | `/api/users/me` | bearer |
| `GET` | `/api/config/brand` | public |
| `POST` | `/api/cases` | optional |
| `POST` | `/api/cases/resume` | public |
| `GET` | `/api/cases` | bearer |
| `GET` | `/api/cases/{id}` | owner or access key |
| `POST` | `/api/cases/{id}/messages` | owner or access key |
| `PATCH` | `/api/cases/{id}/legal-pathway` | owner or access key |
| `DELETE` | `/api/cases/{id}` | owner or access key |

Every response uses the same envelope:

```json
{ "success": true, "data": { }, "timestamp": "2026-08-08T10:00:00Z" }
```

```json
{ "success": false, "code": "VALIDATION_ERROR", "message": "Some fields need attention.",
  "fieldErrors": [{ "field": "email", "message": "Enter a valid email address" }] }
```

---

## Design

**Palette.** Deep indigo (`#2B3A67`) for authority, muted jade (`#2F7D72`) for
anything meaning *safe* or *this worked*, cool mist for surfaces, brass
(`#BE9B4B`) for the one accent. Red is reserved for genuine safety warnings and
appears nowhere else — a product about harm cannot spend red on form validation.

**Type.** Noto Serif Tamil for display, Noto Sans for body. One family covers all
six launch languages with consistent metrics, which is a product constraint here
rather than a style preference.

**The anklet rule.** A hairline punctuated by three small brass beads, after the
*silambu* whose gemstones were the evidence that got Kannagi believed. It divides
sections and appears nowhere else. It is the only ornament in the interface, and
staying rare is what keeps it meaning anything.

---

## Roadmap

| Phase | Scope | Status |
|---|---|---|
| 1 | Auth, JWT, RBAC, encryption, audit, dashboard | ✅ Done |
| 2 | Cases, anonymous / confidential / identified modes | ✅ Done |
| 3 | Chatbot, AI abstraction, issue classification, concern levels | Next |
| 4 | Voice recording, speech-to-text, transcript confirmation | |
| 5 | Legal knowledge base, lawyer directory, legal aid | |
| 6 | Psychologist directory, psychology chat, appointments | |
| 7 | Community and moderation | |
| 8 | Privacy centre, consent management, data export and deletion | |
| 9 | Admin, lawyer and psychologist dashboards | |
| 10 | Security hardening, demo data, UI polish | |

---

## Boundaries this product keeps

These are enforced in code and in copy, not just documented.

The system **does not** diagnose a mental-health condition, decide that a crime
occurred, determine guilt, give definitive legal advice, contact any authority on
a user's behalf, or take an action she did not choose.

It **does** identify possible concern areas, surface distress indicators, explain
verified legal information with its source and verification date, suggest support,
and then stop and ask.

Wording follows from that. *"What you have described may relate to…"*, never
*"You have…"*. A previous case summary is labelled as a summary that does not
predict any outcome. Nothing claims to be secure; the claim is that the system is
built with encryption, access control, consent management and privacy by design.
