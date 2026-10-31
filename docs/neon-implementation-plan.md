# Hashword implementation plan

## Current implementation

One Next.js application serves the browser UI and backend. Better Auth handles
accounts using its username plugin and browser session cookies. A shared `pg`
connection pool connects the backend to Neon PostgreSQL. No separate Fastify
service, managed external auth service, or CLI bearer plugin is used.

The configured development database has had the Better Auth migration applied.
Fresh databases still need that migration; see [website setup](../web/README.md).
Database settings remain in the private environment file, not this document.

Browser registration, sign-in, session restoration, and sign-out are connected.
The installed CLI still blocks master-key submission. Its encryption module is
implemented and tested, but is not connected to either UI or persistent storage.

## Smallest next milestone

A browser user can register, create an empty encrypted vault, add an entry, save,
sign out, and later sign in and unlock the same data with a separate master password.
Keep the backend inside Next.js.

### 1. Browser encryption and master-password screens

Adapt the existing [Node encryption format](vault-encryption.md) using browser
cryptography. Do not bundle `node:crypto` into the frontend or send the master
password to a server. Add a versioned decrypted-document schema and validate
before rendering. Confirm the master password when creating a vault.

### 2. One table and one route

Add a `vaults` table with a stable ID, unique authenticated owner ID, encrypted
`envelope` JSONB, integer `revision`, and timestamps. Add these proposed handlers
at `web/src/app/api/vault/route.ts`:

| Method | Planned behavior |
| --- | --- |
| POST | Create the owner's vault once; refuse replacement |
| GET | Return the owner's encrypted envelope and revision |
| PUT | Update only when owner, vault ID, and expected revision match |

These handlers and the vault table do not exist yet. Use Better Auth to verify
every request and derive ownership from the session. Validate envelope shape,
size, encoding, and supported encryption settings. Protect cookie-authenticated
writes against cross-origin requests and keep sensitive responses uncached.

### 3. Save, reload, and lock

Encrypt the whole document locally before saving. Show success only after the
server acknowledges it. Preserve drafts on failures. Reject concurrent updates
with a conflict instead of overwriting another device's data. On lock/sign-out,
clear decrypted UI state and call the encryption session's lock method. Pending
operations must not restore secrets after locking.

If account registration succeeds but vault creation fails, let the same account
resume vault setup without recreating the account or overwriting existing data.

### 4. Verify the complete flow

Test create → edit → save → sign out → sign in → unlock. Verify that two accounts
cannot read or overwrite each other's data, wrong passwords and modified ciphertext
fail, conflicting writes are rejected, and plaintext never enters vault requests
or logs. Test browser/CLI format compatibility before adding CLI synchronization.

## Deferred work

CLI account login and synchronization, offline caching, automatic merging,
password-reset/email delivery, master-password changes, recovery keys, encrypted
export/import, and SSH hosting are separate later tasks. No SSH hostname or
production API base URL is published in this repository.

Account-password reset would restore account access only. It must not claim to
recover a forgotten vault master password. An SSH-hosted UI would decrypt on the
SSH server; that has a different trust boundary from local browser/CLI decryption.
