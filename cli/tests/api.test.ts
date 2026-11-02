import { afterEach, beforeEach, expect, it, vi } from "vitest";
let api: typeof import("../src/lib/api.js");
const fetchMock = vi.fn();

beforeEach(async () => {
  vi.resetModules();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", async (url: string, options: RequestInit) => {
    const response = await fetchMock(url, options);
    // Real fetch responses include the URL; constructed test responses do not.
    Object.defineProperty(response, "url", { value: url, configurable: true });
    return response;
  });
  api = await import("../src/lib/api.js");
});

afterEach(() => vi.unstubAllGlobals());

it("uses the web auth routes and carries the session cookie through verification and logout", async () => {
  const fetch = fetchMock
    .mockResolvedValueOnce(new Response('{}', { headers: { 'set-cookie': 'session=abc; HttpOnly; Path=/' } }))
    .mockResolvedValueOnce(Response.json({ user: { id: '1', name: 'Nick' } }))
    .mockResolvedValueOnce(Response.json({ success: true }));
  await expect(api.login('nick', 'password')).resolves.toEqual({ id: '1', name: 'Nick' });
  expect(fetch.mock.calls[0][0]).toBe('http://localhost:3000/api/auth/sign-in/username');
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ username: 'nick', password: 'password' });
  expect(fetch.mock.calls[1][1].headers.cookie).toBe('session=abc');
  await api.logout();
  expect(fetch.mock.calls[2][0]).toBe('http://localhost:3000/api/auth/sign-out');
  expect(fetch.mock.calls[2][1].headers.cookie).toBe('session=abc');
});

it("rejects incorrect credentials without exposing server error data", async () => {
  fetchMock.mockResolvedValue(Response.json({ secret: 'internal' }, { status: 401 }));
  await expect(api.login('nick', 'bad')).rejects.toThrow('Check your credentials');
});

it("requires a verified session before entering the vault screen", async () => {
  fetchMock.mockResolvedValueOnce(Response.json({})).mockResolvedValueOnce(Response.json(null));
  await expect(api.login('nick', 'password')).rejects.toThrow('verify your session');
});

it("handles unreachable servers", async () => {
  fetchMock.mockRejectedValue(new TypeError('fetch failed'));
  await expect(api.login('nick', 'password')).rejects.toThrow();
});

it("clears local cookies even if server sign-out fails", async () => {
  const fetch = fetchMock
    .mockResolvedValueOnce(new Response('{}', { headers: { 'set-cookie': 'session=abc; Path=/' } }))
    .mockResolvedValueOnce(Response.json({ user: { id: '1', name: 'Nick' } }))
    .mockResolvedValueOnce(new Response('', { status: 503 }))
    .mockResolvedValueOnce(Response.json(null));
  await api.login('nick', 'password');
  await expect(api.logout()).rejects.toThrow();
  expect(await api.getAccount()).toBeNull();
  expect(fetch.mock.calls[3][1].headers.cookie).toBeUndefined();
});

it("honors cookie deletion from the server", async () => {
  fetchMock
    .mockResolvedValueOnce(new Response('{}', { headers: { 'set-cookie': 'session=abc; Path=/' } }))
    .mockResolvedValueOnce(Response.json({ user: { id: '1', name: 'Nick' } }))
    .mockResolvedValueOnce(new Response('null', { headers: { 'set-cookie': 'session=; Max-Age=0; Path=/' } }))
    .mockResolvedValueOnce(Response.json(null));
  await api.login('nick', 'password');
  await api.getAccount();
  await api.getAccount();
  expect(fetchMock.mock.calls[2][1].headers.cookie).toBe('session=abc');
  expect(fetchMock.mock.calls[3][1].headers.cookie).toBeUndefined();
});

it("registers with the same endpoint and payload as the website and retains the session", async () => {
  const input = { name: 'Nick', email: 'nick@example.com', username: 'nick', password: 'account password' };
  fetchMock
    .mockResolvedValueOnce(new Response(JSON.stringify({ user: { id: '1', name: 'Nick', email: input.email }, token: 'private' }), {
      headers: { 'set-cookie': 'session=new; HttpOnly; Path=/' },
    }))
    .mockResolvedValueOnce(Response.json({ user: { id: '1', name: 'Nick' } }));
  await expect(api.register(input)).resolves.toEqual({ id: '1', name: 'Nick' });
  expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3000/api/auth/sign-up/email');
  expect(fetchMock.mock.calls[0][1].method).toBe('POST');
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(input);
  await api.getAccount();
  expect(fetchMock.mock.calls[1][1].headers.cookie).toBe('session=new');
});

it("clears cookies after failed registration", async () => {
  fetchMock
    .mockResolvedValueOnce(new Response('{}', { status: 400, headers: { 'set-cookie': 'session=invalid; Path=/' } }))
    .mockResolvedValueOnce(Response.json(null));
  await expect(api.register({ name: 'Nick', email: 'nick@example.com', username: 'nick', password: 'bad' })).rejects.toThrow('Account request failed');
  expect(await api.getAccount()).toBeNull();
  expect(fetchMock.mock.calls[1][1].headers.cookie).toBeUndefined();
});
