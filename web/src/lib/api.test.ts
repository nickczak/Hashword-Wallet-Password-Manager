import { afterEach, expect, it, vi } from "vitest";
import { getAccount, login, logout, register } from "./api";

afterEach(() => vi.unstubAllGlobals());

it("posts credentials to the shared login route and returns public account fields", async () => {
  const fetch = vi.fn().mockResolvedValue(Response.json({
    user: { id: "a", name: "Alice", email: "private@example.com" }, token: "private",
  }));
  vi.stubGlobal("fetch", fetch);
  expect(await login("alice", "password")).toEqual({ id: "a", name: "Alice" });
  expect(fetch.mock.calls[0][0]).toBe("/api/auth/sign-in/username");
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ username: "alice", password: "password" });
  expect(fetch.mock.calls[0][1].credentials).toBe("same-origin");
});

it("registers through the email signup route", async () => {
  const fetch = vi.fn().mockResolvedValue(Response.json({ user: { id: "a", name: "Alice" } }));
  vi.stubGlobal("fetch", fetch);
  const input = { name: "Alice", email: "alice@example.com", username: "alice", password: "account password" };
  expect(await register(input)).toEqual({ id: "a", name: "Alice" });
  expect(fetch.mock.calls[0][0]).toBe("/api/auth/sign-up/email");
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(input);
});

it("restores an account and treats a missing session as signed out", async () => {
  const fetch = vi.fn().mockResolvedValueOnce(Response.json({ user: { id: "a", name: "Alice" } }))
    .mockResolvedValueOnce(Response.json(null));
  vi.stubGlobal("fetch", fetch);
  expect(await getAccount()).toEqual({ id: "a", name: "Alice" });
  expect(await getAccount()).toBeNull();
  expect(fetch.mock.calls[0][0]).toBe("/api/auth/get-session");
  expect(fetch.mock.calls[0][1].method).toBe("GET");
  expect(fetch.mock.calls[0][1].cache).toBe("no-store");
});

it("signs out using POST", async () => {
  const fetch = vi.fn().mockResolvedValue(Response.json({ success: true }));
  vi.stubGlobal("fetch", fetch);
  await logout();
  expect(fetch.mock.calls[0][0]).toBe("/api/auth/sign-out");
  expect(fetch.mock.calls[0][1].method).toBe("POST");
});

it("rejects failed login, session checks, and logout without leaking server details", async () => {
  vi.stubGlobal("fetch", vi.fn().mockImplementation(() => Response.json({ secret: "internal" }, { status: 401 })));
  await expect(login("alice", "wrong")).rejects.toThrow("Account request failed");
  await expect(getAccount()).rejects.toThrow("Account request failed");
  await expect(logout()).rejects.toThrow("Account request failed");
});

it("rejects connection failures", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
  await expect(getAccount()).rejects.toThrow();
});
