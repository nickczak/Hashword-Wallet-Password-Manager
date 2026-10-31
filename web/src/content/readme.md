Hashword is a wallet and password manager in development, with a React/Ink terminal preview and a Next.js browser companion.

![Earlier Hashword terminal demonstration](/showcase-desktop.gif)

The GIF shows an earlier interface preview with illustrative records. It does not show current stored vault contents.

## What works now

The browser companion supports account registration, username/password sign-in, session restoration, and sign-out. The terminal tab contains these account controls. The API tab documents current authentication routes and a proposed vault interface.

The website and backend run in one Next.js service. Better Auth manages credentials and browser session cookies, with account data stored in Neon PostgreSQL. Database credentials stay on the server.

Signing in does not unlock a vault yet. There is no browser vault editor or persistent vault storage. The installed CLI has a tested Node.js encryption module, but its master-key prompt is still blocked until the UI and storage are connected. There is no SQLite storage.

## Account password versus master password

An account password signs you in through Better Auth. A separate master password will decrypt your vault locally. Saved passwords and wallet secrets will be encrypted before upload; the database will hold their encrypted envelope. The encryption module already implements this format, but the complete saving/unlocking flow is still being built.

## Run the website locally

Use Node.js 22 or newer. From the repository root:

```sh
cd web
npm ci
```

Copy `.env.example` to `.env.local` if it does not exist. Set the Neon `DATABASE_URL`, a random `BETTER_AUTH_SECRET` of at least 32 characters, and `BETTER_AUTH_URL=http://localhost:3000`. Generate the secret with `openssl rand -base64 32`. Keep the file private.

From `web/`, create the authentication tables and start Next.js:

```sh
npx auth@latest migrate --config ./auth.ts
npm run dev
```

Open http://localhost:3000 and choose Register. Create a test account, sign out, sign in, and reload to verify the session. A fresh database needs the auth migration; setting its URL alone is not enough. Restart the dev server after editing environment settings.

## Run the terminal preview

From the repository root:

```sh
cd hashword
npm ci
npm run dev
```

The CLI opens to a master-key prompt. `Enter` submits it and reports that unlocking is unavailable; `Ctrl+Q` exits. Vault navigation remains inaccessible until unlocking is implemented.

To install the local command, run these from `hashword/`:

```sh
npm run build
npm link
hashword
```

## SSH and future work

No public SSH service or connection hostname is available. The browser's terminal appearance is a web interface, not an SSH connection. A future SSH-hosted UI would run and decrypt secrets on the SSH server, unlike a locally installed client.

Next is browser encryption, master-password setup, and one authenticated vault route backed by one database table. CLI account access, offline caching, recovery, and SSH hosting are later work. Account-password reset and email-verification delivery are not configured yet.

## Development checks

Root `npm test`, `npm run typecheck`, and `npm run build` target the CLI. Run the website's `test`, `typecheck`, `lint`, and `build` scripts from `web/`. Passing module tests does not verify a complete encrypted-vault storage flow.
