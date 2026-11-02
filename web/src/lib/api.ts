export type Account = { id: string; name: string };

// Helper function to make requests to the server-side auth API. 
async function request(path: string, body?: unknown) {
  const response = await fetch(`/api/auth/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    credentials: "same-origin",
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Account request failed. Check your credentials and connection.");
  return response.json();
}

function account(user: Account): Account {
  return { id: user.id, name: user.name };
}

export async function login(username: string, password: string): Promise<Account> {
  const data = await request("sign-in/username", { username, password });
  return account(data.user);
}

export async function register(input: { name: string; email: string; username: string; password: string }): Promise<Account> {
  const data = await request("sign-up/email", input);
  return account(data.user);
}

export async function getAccount(): Promise<Account | null> {
  const data = await request("get-session");
  return data ? account(data.user) : null;
}

export async function logout(): Promise<void> {
  await request("sign-out", {});
}
