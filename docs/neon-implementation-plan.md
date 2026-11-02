# Shared web and CLI API plan

## Current behavior

Better Auth handles accounts and sessions in the Next.js backend using Neon.
The CLI sends username/password login requests to that backend, verifies the
session, and opens a placeholder vault screen. Cookies stay in memory.
Local vault encryption and the separate master password have been removed.

## Remaining vault work

1. Choose backend protection for stored secrets using a maintained service or library.
2. Add vault storage in the backend, scoped to the authenticated account.
3. Add authenticated vault read/write routes. Derive ownership from the session,
   never a client-supplied account ID.
4. Connect the browser and CLI to those same routes to display and edit entries.
5. Verify account isolation, expired sessions, failed saves, and sign-out.

Until those routes exist, neither interface can save or restore vault entries.
