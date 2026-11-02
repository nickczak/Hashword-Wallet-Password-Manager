<div align="center">
  <img src="hashword_logo.png" alt="Hashword logo" width="400">
</div>

# Hashword

A wallet and password manager in development, with a React/Ink terminal preview
and a Next.js browser companion.

## What works today

| Part | Current behavior |
| --- | --- |
| Browser accounts | Register, sign in with a username and account password, restore the session, and sign out |
| Backend | Better Auth runs inside Next.js and stores accounts and sessions in Neon PostgreSQL |
| CLI | Signs in through the web API, verifies the session, and opens the account vault screen |
| Vault storage | Not implemented; neither app currently saves or restores vault entries |

There is no SQLite storage, separate Fastify server, or Supabase integration.
The vault screen is a placeholder until backend vault storage exists.

![Earlier Hashword terminal interface demonstration](showcase-desktop.gif)

The GIF shows an earlier interface preview with illustrative records, not current
vault contents.

## Architecture

```text
Browser → Next.js auth routes → Neon PostgreSQL
CLI     → Next.js auth routes → Neon PostgreSQL
```

The browser uses plain HTTP requests and an HttpOnly session cookie. Database
credentials and the server auth secret stay in the Next.js environment.

The CLI uses the same username and account password as the website. It keeps its
session cookie in memory and sends requests to the web API. Vault storage and
access control belong in the backend; no separate master password or local
vault encryption module is used.

## Run the website

Use Node.js 22 or newer. From the repository root:

```sh
cd web
npm ci
```

Copy `web/.env.example` to `web/.env.local` if that file does not already exist.
Set the Neon `DATABASE_URL`, a random `BETTER_AUTH_SECRET`, and
`BETTER_AUTH_URL=http://localhost:3000`. Generate a secret with:

```sh
openssl rand -base64 32
```

Then, from `web/`:

```sh
npx auth@latest migrate --config ./auth.ts
npm run dev
```

Open http://localhost:3000 and choose Register. Keep `.env.local` private.
See [website setup and troubleshooting](web/README.md) for the complete flow.

## Run the CLI

From the repository root:

```sh
cd cli
npm ci
npm run dev
```

Run the website first. The CLI defaults to `http://localhost:3000`; set
`HASHWORD_API_URL` to the deployed website's HTTPS origin when needed.
Enter your username and account password. `Tab` switches fields, `Enter` advances
or submits, `L` signs out from the vault screen, and `Ctrl+Q` exits. To install the local command:

```sh
npm run build
npm link
hashword
```

## Checks

Root scripts target the CLI:

```sh
npm test
npm run typecheck
npm run build
```

Run website checks separately:

```sh
npm --prefix web test
npm --prefix web run typecheck
npm --prefix web run lint
npm --prefix web run build
```

## Next steps

Implement authenticated vault storage in the web backend, then connect both
interfaces to the same vault API. The CLI should only handle input, API requests,
and displaying results. See the [current implementation plan](docs/neon-implementation-plan.md).
