# What changed, and how to actually see it

If the app looks identical, the new code is on disk but not running. Both
servers cache aggressively. Follow this in order.

---

## Redeploy

**1. Extract the new zip over your project folder**, replacing files when asked.

**2. Backend — the database needs the new migration**

```powershell
cd C:\Users\SHARUMITHA\Documents\kannagi\kannagi\kannagi\backend
mvn clean verify
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

`clean` matters. Without it Maven reuses the old compiled classes and none of
the new code runs.

On startup, Flyway applies `V4__create_cases.sql`. Watch for:

```
Migrating schema "public" to version "4 - create cases"
```

If that line does not appear, the backend is running old code.

**3. Frontend — stop the dev server first**

```powershell
cd ..\frontend
npm install
npm run dev
```

Vite keeps a cache that survives file replacement. If the page still looks old:

```powershell
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
```

Then hard-refresh the browser: **Ctrl+Shift+R**.

---

## How to confirm each fix

### Email check

Register with `shru@haahah.com`.

Expected: *"We could not find a mail server for haahah.com. Check the address
for a typo."*

Still accepted? Check your terminal for:

```
Email domain verification is disabled
```

That means `VERIFY_EMAIL_DOMAIN=false` is set somewhere. Remove it. If instead
you see *"DNS lookup was inconclusive; accepting the address"*, your network is
blocking outbound DNS — the check deliberately lets people through rather than
locking them out on a bad connection.

### Button contrast

Landing page hero. "Create an account" now has a solid indigo fill and a
full-strength border, instead of a transparent box with a faint outline.

### The case flow

This is the part that was genuinely unreachable before — nothing linked to it.

1. Landing page → **Talk anonymously** (previously went to `/chat` and 404'd)
2. Choose **Anonymously**, **Confidentially** or **With my identity**
3. Continue → a modal shows your reference and access key, and will not let you
   past until you tick that you have saved them
4. Write a message → it saves encrypted
5. After your first message, the **legal aid vs private lawyer** choice appears

Signed in, the dashboard now has **Talk to someone** and **Your cases** as live
cards. The other five still say "Not built yet" because they are — those are
Phases 3 to 8.

### Reopening an anonymous case

Landing page → *Reopen it with your reference*, or go to `/resume`. Enter the
reference and key from step 3. A wrong key and a wrong reference give the same
error on purpose, so nobody can confirm a case exists by guessing.

---

## Still stuck?

Send me:

- The backend startup log from `Started KannagiApplication` upward
- Whatever the browser console shows on the page that looks wrong
- The exact URL in the address bar

Those three usually identify it immediately.
