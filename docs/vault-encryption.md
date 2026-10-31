# Vault encryption module

`hashword/src/lib/vaultCrypto.ts` implements encryption for Node.js. The CLI UI
still blocks unlocking, and neither the website nor CLI persists vault entries.
Browser account login already works separately through Better Auth.

## Account password and master password

The account password is sent to Better Auth to authenticate the account. Better
Auth manages its credential hashes and sessions in Neon. It is separate from the
vault master password, which is intended to remain on the client.

The encryption module never includes the master password or a separate verifier
hash in its envelope. Saved secrets are encrypted rather than hashed so the
correct key can recover their original values.

## Encryption format

1. Generate a random 256-bit data key.
2. Derive a 32-byte wrapping key from the master password with Argon2id, a random
   16-byte salt, 64 MiB memory, three passes, and one lane.
3. Encrypt the data key with AES-256-GCM under the wrapping key.
4. Encrypt the entire JSON document under the data key, including names, labels,
   and values. Each encryption uses a fresh random 12-byte nonce and 16-byte tag.

The version-1 envelope contains `version`, `vaultId`, `ownerId`, `kdf`, `wrappedKey`,
and `document`. Binary values are base64 strings. Owner/vault IDs and encryption
purpose are authenticated as additional data. The only accepted KDF profile is
the one above, preventing remote metadata from requesting unbounded work.
The plaintext document limit is 4 MiB. Benchmark the profile on supported devices
before release.

## Module API

| Export/method | Behavior |
| --- | --- |
| `createVault(password, identity, document)` | Returns an encrypted envelope and unlocked session |
| `unlockVault(password, envelope, identity)` | Returns decrypted `document` and an unlocked session |
| `parseVaultEnvelope(value, identity)` | Validates untrusted envelope structure and expected identity |
| `session.save(document)` | Encrypts a new snapshot and returns its envelope; does not persist it |
| `session.verifyMasterPassword(password)` | Asynchronously checks the supplied master password locally |
| `session.lock()` | Overwrites the mutable data-key buffer and prevents further session saves |

`identity` contains stable `ownerId` and `vaultId` strings. A future backend must
independently verify ownership from its account session; authenticated encryption
does not replace access control.

`unlockVault` returns an unknown JSON document. Callers must validate its application
schema before rendering. Wrong passwords and damaged encrypted data fail to unlock.
Re-entering a master password for reveal/edit is a UI confirmation, not protection
against a compromised process that already holds decrypted data.

## Integration still needed

Browser-compatible encryption, master-password screens, one Next.js vault route,
and a vault database table are planned. No `getVault`, `saveVault`, or `createVault`
network helpers exist in the website's current account API wrapper. The module's
`createVault` function is a local cryptographic operation, not an HTTP endpoint.

After a future upload succeeds, track the server's revision. Keep drafts on failed
saves and reject conflicting writes. On lock or logout, clear decrypted React
state, drafts, reveals, and password inputs as well as locking the crypto session.

The module uses `node:crypto` and cannot run directly in a browser. Preserve the
envelope format and add compatibility tests when implementing browser encryption.
No recovery or master-password-change feature is currently exposed. JavaScript
cannot guarantee erasure of strings or garbage-collected copies; mutable buffers
are overwritten where possible.

## Checks

From the repository root:

```sh
npm test
npm run typecheck
```

Tests cover the RFC 9106 Argon2id vector, JSON round trips, Unicode/empty values,
wrong passwords, tampering, identity swaps, hostile metadata, fresh save nonces,
and locked-session rejection. These verify the module, not a complete storage flow.
