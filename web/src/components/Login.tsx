"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getAccount, login, logout, register, type Account } from "@/lib/auth-client";

const banner = String.raw`▄▄   ▄▄      ▄▄                                 ▄▄             ▄▄▄  ▄▄▄
██   ██      ██                                 ██            █▀██  ██               █▄                           █▄
██   ██▄███▄ ██  ▄███▄ ▄███▄ ██▄██▄█▄ ▄███▄    ████▄▄███▄       ██  ██               ██                   ▄       ██
██▄█▄████▄▄█ ██  ██    ██ ██ ██ ██ ██ ██▄▄█     ██  ██ ██       ██████   ▄▀▀█▄ ▄██▀█ ████▄▀█▄ █▄ ██▀▄███▄ ████▄▄████
██▀█▀████    ██  ██    ██ ██ ██ ██ ██ ██        ██  ██ ██       ██  ██   ▄█▀██ ▀███▄ ██ ██ ██▄██▄██ ██ ██ ██   ██ ██
▀█   █▀▀███▀ ▀██▄▀███▀ ▀███▀ ██ ██ ██ ▀███▀     ▀██▄▀███▀     ▀██▀  ▀██▄▄▀█▄███▄▄██▀▄██ ██  ▀██▀██▀▄▀███▀▄█▀  ▄█▀███`;

export default function Login() {
  const [account, setAccount] = useState<Account | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, setPending] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    getAccount()
      .then((value) => { if (active) setAccount(value); })
      .catch((error: unknown) => { if (active) setMessage(error instanceof Error ? error.message : "Unable to check your session."); })
      .finally(() => { if (active) setPending(false); });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const username = String(fields.get("username") ?? "");
    const password = String(fields.get("password") ?? "");
    setPending(true);
    setMessage("");
    try {
      const result = creating
        ? await register({ name: username, username, email: String(fields.get("email") ?? ""), password })
        : await login(username, password);
      setAccount(result);
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      const passwordInput = form.elements.namedItem("password");
      if (passwordInput instanceof HTMLInputElement) passwordInput.value = "";
      setPending(false);
    }
  }

  async function signOut() {
    setPending(true);
    setMessage("");
    try { await logout(); setAccount(null); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to sign out."); }
    finally { setPending(false); }
  }

  const inputClass = "terminal-input w-full border-b border-neutral-700 bg-transparent px-1 py-1 text-terminal-accent outline-none focus:border-terminal-accent";
  const buttonClass = "cursor-pointer underline underline-offset-4 disabled:cursor-wait disabled:opacity-50 focus-visible:outline focus-visible:outline-offset-4";

  return (
    <div>
      <pre aria-hidden="true" className="my-5 whitespace-pre font-mono text-[clamp(3px,0.85vw,14px)] leading-[1.2]">{banner}</pre>
      <h1 className="sr-only">Hashword account</h1>
      {account ? (
        <div className="space-y-3">
          <p>Signed in as {account.name}.</p>
          <p className="text-neutral-400"># Your account is connected. Encrypted vault setup is the next step.</p>
          <button type="button" disabled={pending} onClick={signOut} className={buttonClass}>Sign out</button>
        </div>
      ) : (
        <form onSubmit={submit} className="max-w-sm space-y-4" aria-busy={pending}>
          <p>$ {creating ? "create account" : "sign in"}</p>
          <fieldset disabled={pending} className="space-y-4 disabled:opacity-50">
            <label className="block">Username
              <input name="username" autoComplete="username" required minLength={3} maxLength={30} className={inputClass} />
            </label>
            {creating && <label className="block">Email
              <input name="email" type="email" autoComplete="email" required className={inputClass} />
            </label>}
            <label className="block">Account password
              <input name="password" type="password" autoComplete={creating ? "new-password" : "current-password"} required minLength={12} maxLength={128} className={inputClass} />
            </label>
            <p className="text-xs text-neutral-400">This signs you into your account. Your vault master password is separate.</p>
            <div className="flex gap-5">
              <button type="submit" className={buttonClass}>{creating ? "Create account" : "Sign in"}</button>
              <button type="button" onClick={() => { setCreating(!creating); setMessage(""); }} className={buttonClass}>
                {creating ? "Use existing account" : "Register"}
              </button>
            </div>
          </fieldset>
        </form>
      )}
      {pending && <p role="status" className="mt-3 text-neutral-400"># Please wait…</p>}
      {message && <p role="alert" className="mt-3 text-neutral-400"># {message}</p>}
    </div>
  );
}
