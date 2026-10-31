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
| CLI | Opens a terminal interface; master-password unlocking is deliberately blocked |
| Encryption module | Creates, encrypts, decrypts, and locks vault sessions in Node.js; tested separately from the interface |
| Vault storage | Not implemented; neither app currently saves or restores vault entries |

There is no SQLite storage, separate Fastify server, Supabase integration, or live
SSH service. Signing into an account does not unlock a vault yet.

![Earlier Hashword terminal interface demonstration](showcase-desktop.gif)

The GIF shows an earlier interface preview with illustrative records, not current
vault contents.

## Architecture

```text
Browser → Next.js auth routes → Neon PostgreSQL
CLI     → terminal preview (not connected to account login or storage)
```

The browser uses Better Auth's SDK and an HttpOnly session cookie. Database
credentials and the server auth secret stay in the Next.js environment.

An account password signs you in and is processed by Better Auth. A separate
vault master password will unlock encrypted vault contents locally. The existing
CLI encryption module implements that cryptography, but browser encryption and
UI/storage integration are still pending. See [encryption details](docs/vault-encryption.md).

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

## Run the terminal preview

From the repository root:

```sh
cd hashword
npm ci
npm run dev
```

The master-key prompt cannot unlock a vault yet. `Enter` submits the prompt and
`Ctrl+Q` exits. To install the local command:

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

Add browser encryption and master-password setup, then one authenticated vault
route and one database table for encrypted envelopes. Connect saving, loading,
and locking before adding CLI account access or more advanced features.
See the [current implementation plan](docs/neon-implementation-plan.md).
