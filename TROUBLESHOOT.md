# "We could not reach the server"

That message means the request got **no response at all** — not a 4xx, not a
5xx, nothing. There are three causes and they are quick to tell apart.

Work down the list. Stop at the first thing that fails.

---

## 1. Is the backend running?

Open this in a browser tab:

```
http://localhost:8080/actuator/health
```

**Expected:** `{"status":"UP"}`

**Nothing loads** → the backend is not running, or it crashed at startup. Look at
the terminal where you ran `mvn spring-boot:run`. A stack trace there is the real
problem; everything else on this page is a distraction until it is fixed.

A likely one after this build: `spring-boot-starter-mail` is a new dependency. If
Maven Central rate-limited you again it will not resolve and the app will not
start. Fix by re-running `mvn clean verify`, or remove the mail dependency from
`pom.xml` — the OTP still works without it and shows the code on screen.

---

## 2. Is it the rate limiter? (this was the actual bug)

**Fixed in this build.** Worth understanding because the symptom was so
misleading.

The rate limiter ran before Spring Security's CORS handling and counted browser
preflight `OPTIONS` requests. Every form submission from a browser is two
requests, not one, so the ten-per-minute auth budget was really five actions.
Once exceeded it returned 429 — with no CORS headers, so the browser threw the
response away before JavaScript could read it, and the interface reported a
network failure.

Now: preflight is skipped, the 429 carries CORS headers, the limit is 40/minute,
and going too fast says *"Too many attempts in a short time."*

If you were testing repeatedly before updating, that is almost certainly what you
hit. Wait sixty seconds and it clears on its own.

---

## 3. Is it CORS?

Press **F12 → Console**. A CORS problem says so explicitly:

```
Access to XMLHttpRequest at 'http://localhost:8080/api/auth/send-code'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

If your frontend runs on a port other than 5173, set it in `.env`:

```
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

and restart the backend.

---

## Reading the Network tab

**F12 → Network → click the failed request.**

| What you see | What it means |
|---|---|
| `(failed)` / `net::ERR_CONNECTION_REFUSED` | Backend is down — go to step 1 |
| Status `429` | Rate limited — wait a minute |
| Status `200` but the page still errors | Frontend bug, send me the response body |
| Status `403` | Endpoint is not public — send me the URL |
| Status `500` | Send me the backend stack trace |

---

## After updating

```powershell
cd backend
mvn clean verify
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Wait for this line before touching the browser:

```
Started KannagiApplication in X seconds
```

Then in a second terminal:

```powershell
cd frontend
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
npm run dev
```

Hard-refresh with **Ctrl+Shift+R**.

---

## Fastest test that skips the browser

```powershell
curl -X POST http://localhost:8080/api/auth/send-code `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"erenyeager230904@gmail.com\"}'
```

A JSON response means the backend is fine and the problem is browser-side —
CORS or cache. No response means the backend is down.

The verification code is also printed in the backend log:

```
EMAIL VERIFICATION CODE for erenyeager230904@gmail.com: 384512
```
