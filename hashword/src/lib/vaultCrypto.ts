import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from "node:crypto";
import { argon2idAsync } from "@noble/hashes/argon2.js";

// Only this profile is accepted: remote metadata cannot request unbounded work.
const PROFILE = { name: "argon2id", memoryKiB: 65536, passes: 3, parallelism: 1 } as const;
const MAX_BYTES = 4 * 1024 * 1024;
type Sealed = { nonce: string; ciphertext: string; tag: string };
export interface VaultEnvelope {
  version: 1;
  vaultId: string;
  ownerId: string;
  kdf: typeof PROFILE & { salt: string };
  wrappedKey: Sealed;
  document: Sealed;
}
export interface VaultIdentity { vaultId: string; ownerId: string }

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid vault format.");
  return value as Record<string, unknown>;
}
function bytes(value: unknown, length?: number): Buffer {
  if (typeof value !== "string" || value.length > Math.ceil(MAX_BYTES / 3) * 4) throw new Error("Invalid vault encoding.");
  const result = Buffer.from(value, "base64");
  if (result.toString("base64") !== value || result.length > MAX_BYTES || (length !== undefined && result.length !== length)) {
    throw new Error("Invalid vault encoding.");
  }
  return result;
}
function sealed(value: unknown, length?: number): Sealed {
  const item = record(value);
  bytes(item.nonce, 12);
  bytes(item.tag, 16);
  bytes(item.ciphertext, length);
  return { nonce: item.nonce as string, tag: item.tag as string, ciphertext: item.ciphertext as string };
}
function identity(value: VaultIdentity) {
  for (const item of [value.vaultId, value.ownerId]) {
    if (typeof item !== "string" || !item.length || item.length > 128) throw new Error("Invalid vault identity.");
  }
}

/** Validate untrusted storage responses before allocating KDF resources. */
export function parseVaultEnvelope(value: unknown, expected: VaultIdentity): VaultEnvelope {
  identity(expected);
  const item = record(value);
  const kdf = record(item.kdf);
  if (item.version !== 1 || item.vaultId !== expected.vaultId || item.ownerId !== expected.ownerId
    || kdf.name !== PROFILE.name || kdf.memoryKiB !== PROFILE.memoryKiB
    || kdf.passes !== PROFILE.passes || kdf.parallelism !== PROFILE.parallelism) {
    throw new Error("Unsupported vault format or mismatched owner.");
  }
  bytes(kdf.salt, 16);
  return {
    version: 1, ...expected, kdf: { ...PROFILE, salt: kdf.salt as string },
    wrappedKey: sealed(item.wrappedKey, 32), document: sealed(item.document),
  };
}

function aad(envelope: VaultEnvelope, purpose: "key" | "document") {
  return Buffer.from(JSON.stringify(["hashword", envelope.version, envelope.vaultId, envelope.ownerId, purpose]));
}
async function derive(password: string, salt: string) {
  if (!password.length || Buffer.byteLength(password) > 1024) throw new Error("Master password must contain 1–1024 bytes.");
  const input = Buffer.from(password, "utf8");
  try {
    return await argon2idAsync(input, bytes(salt, 16), {
      m: PROFILE.memoryKiB, t: PROFILE.passes, p: PROFILE.parallelism, dkLen: 32,
    });
  } finally { input.fill(0); }
}
function encrypt(key: Uint8Array, plaintext: Buffer, associatedData: Buffer): Sealed {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce, { authTagLength: 16 });
  cipher.setAAD(associatedData);
  return {
    nonce: nonce.toString("base64"),
    ciphertext: Buffer.concat([cipher.update(plaintext), cipher.final()]).toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
}
function decrypt(key: Uint8Array, value: Sealed, associatedData: Buffer) {
  const cipher = createDecipheriv("aes-256-gcm", key, bytes(value.nonce, 12), { authTagLength: 16 });
  cipher.setAAD(associatedData);
  cipher.setAuthTag(bytes(value.tag, 16));
  const partial = cipher.update(bytes(value.ciphertext));
  try { return Buffer.concat([partial, cipher.final()]); }
  finally { partial.fill(0); }
}
function encryptDocument(envelope: VaultEnvelope, key: Buffer, document: unknown): VaultEnvelope {
  const json = JSON.stringify(document);
  if (json === undefined || Buffer.byteLength(json) > MAX_BYTES) throw new Error("Invalid or oversized vault document.");
  const plaintext = Buffer.from(json);
  try { return { ...envelope, document: encrypt(key, plaintext, aad(envelope, "document")) }; }
  finally { plaintext.fill(0); }
}

/** Keep this object in memory only. lock() invalidates it and overwrites its key. */
export class UnlockedVault {
  private key: Buffer | undefined;
  constructor(key: Buffer, private envelope: VaultEnvelope) { this.key = Buffer.from(key); }
  save(document: unknown): VaultEnvelope {
    if (!this.key) throw new Error("Vault is locked.");
    this.envelope = encryptDocument(this.envelope, this.key, document);
    return structuredClone(this.envelope);
  }
  async verifyMasterPassword(password: string): Promise<boolean> {
    if (!this.key) return false;
    let wrappingKey: Uint8Array | undefined;
    let candidate: Buffer | undefined;
    try {
      wrappingKey = await derive(password, this.envelope.kdf.salt);
      candidate = decrypt(wrappingKey, this.envelope.wrappedKey, aad(this.envelope, "key"));
      return !!this.key && candidate.length === this.key.length && timingSafeEqual(candidate, this.key);
    } catch { return false; }
    finally { wrappingKey?.fill(0); candidate?.fill(0); }
  }
  lock() { this.key?.fill(0); this.key = undefined; }
}

export async function createVault(password: string, owner: VaultIdentity, document: unknown) {
  identity(owner);
  const envelope: VaultEnvelope = {
    version: 1, ...owner, kdf: { ...PROFILE, salt: randomBytes(16).toString("base64") },
    wrappedKey: { nonce: "", ciphertext: "", tag: "" }, document: { nonce: "", ciphertext: "", tag: "" },
  };
  const key = randomBytes(32);
  let wrappingKey: Uint8Array | undefined;
  try {
    wrappingKey = await derive(password, envelope.kdf.salt);
    envelope.wrappedKey = encrypt(wrappingKey, key, aad(envelope, "key"));
    const result = encryptDocument(envelope, key, document);
    return { envelope: result, session: new UnlockedVault(key, result) };
  } finally { key.fill(0); wrappingKey?.fill(0); }
}

export async function unlockVault(password: string, value: unknown, expected: VaultIdentity) {
  const envelope = parseVaultEnvelope(value, expected);
  let wrappingKey: Uint8Array | undefined;
  let key: Buffer | undefined;
  let plaintext: Buffer | undefined;
  try {
    wrappingKey = await derive(password, envelope.kdf.salt);
    key = decrypt(wrappingKey, envelope.wrappedKey, aad(envelope, "key"));
    plaintext = decrypt(key, envelope.document, aad(envelope, "document"));
    const document: unknown = JSON.parse(plaintext.toString("utf8"));
    return { document, session: new UnlockedVault(key, envelope) };
  } catch { throw new Error("Unable to unlock vault: incorrect master password or damaged data."); }
  finally { wrappingKey?.fill(0); key?.fill(0); plaintext?.fill(0); }
}
