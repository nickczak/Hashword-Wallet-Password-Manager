import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAccount, login, logout, register } from "./auth-client";

const mocks = vi.hoisted(() => ({ login: vi.fn(), register: vi.fn(), logout: vi.fn(), session: vi.fn() }));
vi.mock("better-auth/client", () => ({ createAuthClient: () => ({
  signIn: { username: mocks.login }, signUp: { email: mocks.register }, signOut: mocks.logout, getSession: mocks.session,
}) }));
vi.mock("better-auth/client/plugins", () => ({ usernameClient: () => ({}) }));

beforeEach(() => { vi.resetAllMocks(); });

describe("account API", () => {
  it("returns only public account fields after username login", async () => {
    mocks.login.mockResolvedValue({ data: { user: { id: "a", name: "Alice", email: "private@example.com" }, token: "private" }, error: null });
    expect(await login("alice", "account password")).toEqual({ id: "a", name: "Alice" });
    expect(mocks.login).toHaveBeenCalledWith({ username: "alice", password: "account password" });
  });
  it("surfaces authentication failures", async () => {
    mocks.login.mockResolvedValue({ data: null, error: { message: "Invalid credentials." } });
    await expect(login("alice", "wrong")).rejects.toThrow("Invalid credentials.");
  });
  it("registers with the same account contract", async () => {
    const input = { username: "alice", name: "Alice", email: "alice@example.com", password: "account password" };
    mocks.register.mockResolvedValue({ data: { user: { id: "a", name: "Alice" } }, error: null });
    expect(await register(input)).toEqual({ id: "a", name: "Alice" });
    expect(mocks.register).toHaveBeenCalledWith(input);
  });
  it("distinguishes signed out from a service failure", async () => {
    mocks.session.mockResolvedValueOnce({ data: null, error: null });
    expect(await getAccount()).toBeNull();
    mocks.session.mockResolvedValueOnce({ data: null, error: { message: "Service unavailable." } });
    await expect(getAccount()).rejects.toThrow("Service unavailable.");
  });
  it("does not report logout success when the server fails", async () => {
    mocks.logout.mockResolvedValueOnce({ error: { message: "Try again." } });
    await expect(logout()).rejects.toThrow("Try again.");
  });
});
