import { describe, expect, it } from "vitest";
import { argon2idAsync } from "@noble/hashes/argon2.js";
import { createVault, parseVaultEnvelope, unlockVault } from "../src/lib/vaultCrypto.js";

const owner = { vaultId: "test-vault", ownerId: "test-user" };
const password = "a long test-only master passphrase";
const document = { passwords: [{ name: "Email 🔐", fields: [{ label: "password", value: "secret-ö", sensitive: true }, { label: "note", value: "" }] }], wallets: [], account: [] };

describe("encrypted vault", () => {
  it("matches the RFC 9106 section 5.3 Argon2id vector", async () => {
    const key = await argon2idAsync(new Uint8Array(32).fill(1), new Uint8Array(16).fill(2), {
      p: 4, m: 32, t: 3, dkLen: 32, key: new Uint8Array(8).fill(3), personalization: new Uint8Array(12).fill(4),
    });
    expect(Buffer.from(key).toString("hex")).toBe("0d640df58d78766c08c037a34a8b53c9d01ef0452d75b65eb52520e96b01e659");
  });

  it("round trips through JSON storage and clears the session on lock", async () => {
    const created = await createVault(password, owner, document);
    const stored = JSON.stringify(created.envelope);
    expect(stored).not.toContain("secret-ö");
    expect(stored).not.toContain("Email");
    expect(stored).not.toContain(password);
    const restored = await unlockVault(password, JSON.parse(stored), owner);
    expect(restored.document).toEqual(document);
    expect(await restored.session.verifyMasterPassword(password)).toBe(true);
    expect(await restored.session.verifyMasterPassword("wrong")).toBe(false);
    const saved = restored.session.save({ ...document, wallets: [{ name: "new wallet" }] });
    expect(saved.document.nonce).not.toBe(created.envelope.document.nonce);
    const reopened = await unlockVault(password, saved, owner);
    expect(reopened.document).toEqual({ ...document, wallets: [{ name: "new wallet" }] });
    created.session.lock();
    restored.session.lock();
    reopened.session.lock();
    expect(() => restored.session.save(document)).toThrow("locked");
    expect(await restored.session.verifyMasterPassword(password)).toBe(false);
  }, 30000);

  it("rejects wrong passwords, damaged payloads, and swapped vault identity", async () => {
    const { envelope, session } = await createVault(password, owner, document);
    session.lock();
    await expect(unlockVault("wrong", envelope, owner)).rejects.toThrow("Unable to unlock");
    for (const section of ["document", "wrappedKey"] as const) {
      const changed = structuredClone(envelope);
      const data = Buffer.from(changed[section].ciphertext, "base64");
      data[0] ^= 1;
      changed[section].ciphertext = data.toString("base64");
      await expect(unlockVault(password, changed, owner)).rejects.toThrow("Unable to unlock");
    }
    const swapped = { ...envelope, ownerId: "other-user" };
    await expect(unlockVault(password, swapped, owner)).rejects.toThrow("mismatched owner");
    await expect(unlockVault(password, swapped, { ...owner, ownerId: "other-user" })).rejects.toThrow("Unable to unlock");
  }, 30000);

  it("rejects hostile metadata before key derivation", async () => {
    const { envelope, session } = await createVault(password, owner, {});
    session.lock();
    expect(() => parseVaultEnvelope({ ...envelope, version: 2 }, owner)).toThrow();
    expect(() => parseVaultEnvelope({ ...envelope, kdf: { ...envelope.kdf, memoryKiB: 2 ** 32 } }, owner)).toThrow();
    expect(() => parseVaultEnvelope({ ...envelope, kdf: { ...envelope.kdf, salt: "bad" } }, owner)).toThrow();
    expect(() => parseVaultEnvelope({ ...envelope, document: { ...envelope.document, tag: "" } }, owner)).toThrow();
  }, 30000);
});
