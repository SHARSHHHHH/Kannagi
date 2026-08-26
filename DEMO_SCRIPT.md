# Demo script

Run through this once before you present. It follows the five scenarios in the
specification and takes about six minutes.

---

## Before you start

```powershell
# 1. Database
docker compose up db

# 2. Backend — clean matters, and dev profile loads the seed data
cd backend
mvn clean verify
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"

# 3. Frontend
cd ..\frontend
npm install
npm run dev
```

Watch the backend log for these lines. If they are missing, something is wrong:

```
Migrating schema "public" to version "6 - create community and consent"
AI provider: offline rule-based analysis (no API key required).
Seeded 20 DEMO professional profiles (all fictional).
Demo data ready. Sign in with user@kannagi.demo / DemoPass!2026
```

**No API key is needed.** The analyser runs offline. If the venue wifi dies
mid-demo, everything except the landing page fonts still works.

---

## Scenario 1 — Workplace harassment (the main one)

1. Landing page → **Talk anonymously**
2. Choose **Anonymously** → Continue
3. Save the reference and key when the modal appears — judges notice that this
   blocks you until you tick the box
4. Type, or paste:

   > My manager keeps sending me inappropriate messages and says my promotion
   > depends on meeting him privately.

5. You will get:

   ```
   Workplace sexual harassment    HIGH
   Abuse of authority             HIGH
   ```

   Each with the phrase from your own sentence that triggered it. **Say this
   part out loud** — the explanation is the thing that distinguishes this from
   a black box.

6. → **Understand my legal options** → the 2013 workplace harassment Act, with
   its India Code link and verification date
7. → **Find legal support** → filter language **தமிழ்** → **Contact anonymously**
8. In the dialog, point at the line that says exactly what the lawyer will see

**For voice instead:** on `/chat`, press **Speak instead**, record, and show the
transcript review step. Without a speech key the transcript is a labelled demo
sample — say so rather than glossing over it. The reviewable-before-analysis flow
is the point, and it is real.

---

## Scenario 2 — Domestic

On `/chat`:

> My in-laws constantly demand money from my parents and threaten me. I can't
> sleep and I'm scared.

Gives dowry-related harassment HIGH, in-laws abuse MODERATE, emotional abuse
MODERATE, psychological distress MODERATE.

→ **Find psychological support** → book an **anonymous** session.

---

## Scenario 3 — Tamil

On `/chat`, set language to **தமிழ்** and paste Tamil text. The language detector
reads the Unicode block, so it identifies Tamil instantly with no model call.

---

## Scenario 4 — Community

1. `/community` → **Share something**
2. Post normally → held for review
3. Then post one containing `9876543210` → held **and** flagged with the reason

Point out that neither is deleted. An automated classifier flags for a human; it
never decides on its own that a woman's account of her life gets removed.

---

## Scenario 5 — Privacy

Sign in as `user@kannagi.demo` / `DemoPass!2026` → `/privacy`.

Shows what is shared with whom, read from live consent rows rather than written
as static copy. Withdraw one and watch the line flip to **Not shared**.

---

## Three things worth saying to judges

**Anonymous means no owner column is set.** Not an owner we agree not to look at
— the link is never recorded. Losing the reference and key means nobody can
recover the case, including an administrator with database access. The interface
says so before she chooses.

**Every legal row carries its source and verification date.** The model never
generates law; it retrieves rows a person checked. The seeded rows are marked
`PROTOTYPE SEED — CONFIRM BEFORE RELYING ON THIS`, and the case-summaries table
ships almost empty on purpose, because inventing case names would defeat the one
thing that module exists for.

**Nothing is reported to any authority.** Even at the highest safety level, the
system offers options and stops. That is a deliberate constraint, not a missing
feature.

---

## If something breaks

Skip it and move on. The five scenarios do not depend on each other.

Most likely failure is a slow first analysis while the JVM warms up — click
through the chat once before you present and it will be instant afterwards.
