"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

const banner = String.raw`▄▄   ▄▄      ▄▄                                 ▄▄             ▄▄▄  ▄▄▄
██   ██      ██                                 ██            █▀██  ██               █▄                           █▄
██   ██▄███▄ ██  ▄███▄ ▄███▄ ██▄██▄█▄ ▄███▄    ████▄▄███▄       ██  ██               ██                   ▄       ██
██▄█▄████▄▄█ ██  ██    ██ ██ ██ ██ ██ ██▄▄█     ██  ██ ██       ██████   ▄▀▀█▄ ▄██▀█ ████▄▀█▄ █▄ ██▀▄███▄ ████▄▄████
██▀█▀████    ██  ██    ██ ██ ██ ██ ██ ██        ██  ██ ██       ██  ██   ▄█▀██ ▀███▄ ██ ██ ██▄██▄██ ██ ██ ██   ██ ██
▀█   █▀▀███▀ ▀██▄▀███▀ ▀███▀ ██ ██ ██ ▀███▀     ▀██▄▀███▀     ▀██▀  ▀██▄▄▀█▄███▄▄██▀▄██ ██  ▀██▀██▀▄▀███▀▄█▀  ▄█▀███`;

export default function Login() {
  const [masterKey, setMasterKey] = useState("");
  const [cursor, setCursor] = useState({ position: 0, scroll: 0 });
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMasterKey("");
    setCursor({ position: 0, scroll: 0 });
    setMessage("Vault unlocking is unavailable until authentication and encryption are connected.");
    inputRef.current?.focus();
  }

  return (
    <div>
      <pre aria-hidden="true" className="my-5 whitespace-pre font-mono text-[clamp(3px,0.85vw,14px)] leading-[1.2]">{banner}</pre>
      <h1 className="sr-only">Welcome to Hashword</h1>
                <form onSubmit={handleUnlock} className="group/prompt flex flex-wrap items-center gap-x-[1ch] gap-y-2">
                  <span aria-hidden="true" className="inline-flex items-center gap-[1ch]"><span className="absolute left-0 hidden h-[1em] w-[3px] bg-terminal-accent group-focus-within/prompt:block" />$</span>
                  <label htmlFor="master-key">Master key:</label>
                  <div className="group relative h-[1.6em] w-[24ch] max-w-full overflow-hidden text-base leading-[1.6]">
                    <input
                      ref={inputRef}
                      id="master-key"
                      type="password"
                      value={masterKey}
                      onChange={(event) => setMasterKey(event.target.value)}
                      onSelect={(event) => setCursor({ position: event.currentTarget.selectionEnd ?? 0, scroll: event.currentTarget.scrollLeft })}
                      onScroll={(event) => setCursor((current) => ({ ...current, scroll: event.currentTarget.scrollLeft }))}
                      required
                      autoComplete="off"
                      spellCheck={false}
                      aria-describedby={message ? "login-status" : undefined}
                      className="absolute inset-0 h-full w-full bg-transparent font-mono text-transparent caret-transparent outline-none selection:bg-neutral-700"
                    />
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 whitespace-pre" style={{ transform: `translateX(-${cursor.scroll}px)` }}>{"•".repeat(masterKey.length)}</span>
                    <span aria-hidden="true" className="terminal-cursor pointer-events-none absolute top-[0.15em] hidden group-focus-within:block" style={{ left: `calc(${cursor.position}ch - ${cursor.scroll}px)` }} />
                  </div>
                  <button type="submit" className="sr-only focus:not-sr-only focus:outline focus:outline-offset-4">Unlock</button>
                </form>
                {message && <p id="login-status" role="status" className="mt-3 text-neutral-400"># {message}</p>}
    </div>
  );
}
