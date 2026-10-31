import { createAuthClient } from "better-auth/client";
import { usernameClient } from "better-auth/client/plugins";
export type Account = { id: string; name: string };

const auth = createAuthClient({ plugins: [usernameClient()] });

function account(user: Account): Account {
  return { id: user.id, name: user.name };
}

// These functions use your account password, never your vault master password.
// Better Auth manages the browser session cookie automatically.
export async function login(username: string, password: string): Promise<Account> {
  const { data, error } = await auth.signIn.username({ username, password });
  if (error) throw new Error(error.message ?? "Unable to sign in.");
  return account(data.user);
}

export async function register(input: { name: string; email: string; username: string; password: string }): Promise<Account> {
  const { data, error } = await auth.signUp.email(input);
  if (error) throw new Error(error.message ?? "Unable to create your account.");
  return account(data.user);
}

export async function logout(): Promise<void> {
  const { error } = await auth.signOut();
  if (error) throw new Error(error.message ?? "Unable to sign out.");
}

export async function getAccount(): Promise<Account | null> {
  const { data, error } = await auth.getSession();
  if (error) throw new Error(error.message ?? "Unable to check your session.");
  return data ? account(data.user) : null;
}
