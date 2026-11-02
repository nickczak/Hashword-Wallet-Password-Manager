import makeFetchCookie from "fetch-cookie";

// Unlike the browser, Node needs us to store and send session cookies.
// That's why this api exists for the cli application.

export interface Account { id: string; name: string }

const baseURL = process.env.HASHWORD_API_URL ?? "http://localhost:3000";
const origin = new URL(baseURL).origin;

// Store and send cookies automatically for this CLI session.
const cookieJar = new makeFetchCookie.toughCookie.CookieJar();
const apiFetch = makeFetchCookie(fetch, cookieJar);

// This function is used to make requests to the Hashword API. It handles cookies and errors.
async function request(path: string, body?: unknown) {
  const response = await apiFetch(`${origin}/api/auth/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Account request failed. Check your credentials and connection.");
  return response.json();
}

export async function getAccount(): Promise<Account | null> {
  const data = await request("get-session");
  if (!data) return null;
  if (typeof data.user?.id !== "string" || typeof data.user?.name !== "string") {
    throw new Error("Unable to verify your session.");
  }
  return { id: data.user.id, name: data.user.name };
}

export async function login(username: string, password: string): Promise<Account> {
  await cookieJar.removeAllCookies();
  try {
    await request("sign-in/username", { username, password });
    const account = await getAccount();
    if (!account) throw new Error("Unable to verify your session.");
    return account;
  } catch (error) {
    await cookieJar.removeAllCookies();
    throw error;
  }
}

export async function register(input: { name: string; email: string; username: string; password: string }): Promise<Account> {
  await cookieJar.removeAllCookies();
  try {
    const data = await request("sign-up/email", input);
    return { id: data.user.id, name: data.user.name };
  } catch (error) {
    await cookieJar.removeAllCookies();
    throw error;
  }
}

export async function logout(): Promise<void> {
  try { await request("sign-out", {}); }
  finally { await cookieJar.removeAllCookies(); }
}
