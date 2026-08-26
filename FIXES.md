# What changed in this build

## Redeploy first

```powershell
cd backend
mvn clean verify
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"

cd ..\frontend
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
npm install
npm run dev
```

Migration **V7** is new. Watch for it in the log.

---

## Fixed

**The invisible white button.** `bg-white` and the button's own `bg-dusk-600`
were both applied; Tailwind resolves that by stylesheet order, not class order,
so the text stayed white on white. There is now an `onDark` variant instead of
utility overrides.

**Lawyers and psychologists showing "Something went wrong".** The query used
`:legalAid is null or ...` with a null `Boolean`, and PostgreSQL cannot infer the
type of a bare null bind — it threw before returning anything. Filtering now
happens in the service. At twenty rows the difference is unmeasurable and it
cannot fail this way again.

**Empty legal page and empty community.** The seeder only ran when
`app.seed.enabled` was explicitly true, and one failing section silently killed
the rest. It now runs unless disabled, each section is independent, and startup
logs the actual counts:

```
Seed complete — users:6 professionals:20 legal:6 posts:8
```

If any number is zero, the error above it says why.

---

## New

**Email verification with a real code.** Registration is now three steps: confirm
the address, set a password, then optional details. A six-digit code is
generated, stored hashed, expires in ten minutes and allows five attempts.

Without SMTP configured the code appears on screen in a box labelled
*Development mode* and is written to the server log. It does not pretend to send
mail. To send properly, set `MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD` in
`.env`.

This is what finally closes the fake-email hole. `haahah.com` fails at the DNS
step; a real domain you cannot read fails at the code step.

**Real voice recording.** Now uses the browser's own speech recognition, so words
appear on screen as you speak, in Tamil, Hindi, Telugu, Malayalam, Kannada or
English. No API key, and the audio never leaves the machine — a better privacy
answer than uploading, not just a cheaper one.

Works in **Chrome and Edge**. Firefox and Safari fall back to server upload,
which still returns the labelled demo transcript. Demo in Chrome.

**Type your issue, get the law.** `/legal` has a search box. Describe the
situation, and the classifier picks which verified rows to show — it never writes
what they say. The concern panel appears above the results so you can see why
those provisions were chosen. Six provisions are seeded, each with an India Code
link and a verification date.

**Laws appear in chat too.** After analysis, matching provisions render inline
under the concern panel rather than only as a link.

**Interface translation.** A language selector sits in the header on every
screen and switches navigation, headings, buttons and prompts. Tamil and Hindi
are complete; Telugu, Malayalam and Kannada cover the main screens and fall back
to English elsewhere.

> These translations have not been checked by a native speaker. For strings that
> carry the safety promise — "nothing is shared without your consent" — that
> check matters before anyone real uses this. Worth saying to judges yourself
> rather than being asked.

**Marital status** is now on the registration form, since some protections
differ by it.

---

## Aadhaar — not implemented, deliberately

Your specification says twice not to collect it (§11 data minimisation, §40
"Do not require Aadhaar"), and that was the right call.

- Under the Aadhaar Act a private platform generally cannot demand it without a
  statutory basis. Storing it creates real compliance obligations.
- For a woman hiding from someone, it is the most traceable number she has. A
  database of abuse reports indexed by national ID is the worst-case artefact
  here.
- "Why does a confidential abuse-support app need Aadhaar?" has no good answer
  in a judging room.

The verified account you wanted is the OTP, and that is now built. If you still
want the field, say so and I will add it as optional and clearly marked — but I
would not make it required.
