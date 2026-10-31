# Hashword browser companion

The website and its backend run as one Next.js application. Better Auth handles
accounts and browser sessions; Neon PostgreSQL stores authentication data.

## Current behavior

The terminal tab offers registration, username/password sign-in, session restore,
and sign-out. Registration collects a username, email, and account password of
at least 12 characters; the username is also used as the display name.

After login, the page confirms the signed-in account. It does not unlock a vault.
There is no browser vault editor, vault table, or vault API route yet. The API tab
lists current auth routes and the proposed vault contract. The README tab explains
both the website and terminal preview.

## How frontend and backend fit together

The home page is a Server Component. It renders the documentation and footer on
the server and passes the rendered documentation into `HomeTabs`. Only tab
switching, the terminal animation, and account controls need browser JavaScript.

```text
Login.tsx → lib/auth-client.ts → /api/auth/* → server/auth.ts → Neon
```

| File | Responsibility |
| --- | --- |
| `src/app/page.tsx` | Composes the page on the server |
| `src/components/HomeTabs.tsx` | Tab selection and terminal introduction in the browser |
| `src/components/Login.tsx` | Account form, loading/errors, session restore, and sign-out |
| `src/lib/auth-client.ts` | Small wrapper around Better Auth's browser SDK |
| `src/server/auth.ts` | Backend auth configuration and shared PostgreSQL connection pool |
| `src/app/api/auth/[...all]/route.ts` | Next.js GET/POST handlers for Better Auth |
| `auth.ts` | Loads environment settings for the migration CLI |

The browser SDK manages the HttpOnly session cookie. It does not store a bearer
token in local storage. The backend currently enables Better Auth's username
plugin and database-backed rate limiting; CLI bearer login is not implemented.

## Local setup

Use Node.js 22 or newer. From the repository root:

```sh
cd web
npm ci
```

If `.env.local` does not exist, copy `.env.example` to `.env.local`. Fill in:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
BETTER_AUTH_SECRET="YOUR_RANDOM_SECRET"
BETTER_AUTH_URL="http://localhost:3000"
```

Use the full connection string from your Neon project's Connect dialog, preserving
its TLS parameters. Generate your own secret with `openssl rand -base64 32`.
It must contain at least 32 characters. Never commit `.env.local` or prefix these
server settings with `NEXT_PUBLIC_`.

Create the authentication tables, then start the app:

```sh
npx auth@latest migrate --config ./auth.ts
npm run dev
```

The migration creates Better Auth's `user`, `session`, `account`, `verification`,
and `rateLimit` tables for this configuration. Run it for each new database and
review migrations again after changing auth plugins or schema configuration.
Existing configured databases may already have these tables.

Open http://localhost:3000. Register a test account, sign out, sign back in, and
reload to check session restoration. Account-password reset and email-verification
delivery are not configured in the app.

## Troubleshooting 503 responses

The route returns a generic 503 if authentication initialization or request
handling throws. Check that:

1. All three settings are present in `web/.env.local` and the secret is long enough.
2. The connection string points to the intended Neon database and is reachable.
3. The auth migration has run against that same database. Setting a database URL
   alone does not create tables.
4. The dev server was restarted after changing its environment.

A signed-out `GET /api/auth/get-session` normally returns `200` with `null`.
Invalid credentials return an authentication error, not a successful account.
Never paste connection strings, passwords, cookies, or server secrets into logs
or bug reports.

## Deployment and checks

Deploy the Next.js server runtime and configure the same three environment
variables on the host. Use an HTTPS `BETTER_AUTH_URL` matching the deployed origin.
No separate API server or static export is needed.

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

Tests exercise the account API wrapper. Successful tests/builds do not substitute
for registering and signing in against a configured database.

Vault encryption, storage, and the master-password screen are the next work item.
The Node.js encryption module lives in `../hashword/src/lib/vaultCrypto.ts` and
cannot be imported directly into a browser bundle because it uses `node:crypto`.
