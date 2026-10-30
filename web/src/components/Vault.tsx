"use client";

import { useEffect, useState } from "react";
import { createEmptyVault } from "@/lib/vaultData";

const sections = ["passwords", "wallets", "account"] as const;
const buttonStyle = "cursor-pointer text-terminal-accent hover:underline focus-visible:outline focus-visible:outline-offset-4";

export default function Vault({ onLock }: { onLock: () => void }) {
  const [section, setSection] = useState<(typeof sections)[number]>("passwords");
  const [entries, setEntries] = useState(createEmptyVault);
  const [selected, setSelected] = useState(0);
  const [revealed, setRevealed] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");
  const entry = entries[section][selected];

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.ctrlKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        onLock();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onLock]);

  function clearFieldState() {
    setRevealed(null);
    setEditing(null);
    setDraft("");
    setMessage("");
  }

  function saveField() {
    if (editing === null) return;
    setEntries((current) => ({
      ...current,
      [section]: current[section].map((item, index) => index === selected ? {
        ...item,
        fields: item.fields.map((field, index) => index === editing ? { ...field, value: draft } : field),
      } : item),
    }));
    setEditing(null);
    setDraft("");
    setRevealed(null);
    setMessage("Updated in memory. Changes reset when the vault locks or the page reloads.");
  }

  return (
    <div className="mt-6 max-w-[1100px] space-y-5">
      <div className="flex flex-wrap items-center gap-6 border-b border-neutral-800 pb-4">
        <h1 className="font-semibold">hashword / unlocked</h1>
        <button type="button" onClick={onLock} className={buttonStyle}>[ lock ]</button>
      </div>
      <p className="text-xs text-neutral-500"># Vault storage is not connected.</p>
      <nav aria-label="Vault sections" className="flex flex-wrap gap-6">
        {sections.map((tab) => (
          <button key={tab} type="button" aria-pressed={section === tab} onClick={() => {
            setSection(tab);
            setSelected(0);
            clearFieldState();
          }} className={`${buttonStyle} ${section === tab ? "underline underline-offset-4" : "text-neutral-500"}`}>{tab}</button>
        ))}
      </nav>
      <div className="grid gap-6 border-y border-neutral-800 py-5 md:grid-cols-[260px_minmax(0,1fr)]">
        <nav aria-label={`${section} entries`}>
          {entries[section].length === 0 && <p className="text-neutral-500">No entries in this section.</p>}
          <ul className="space-y-2">
            {entries[section].map((item, index) => (
              <li key={item.name}>
                <button type="button" aria-pressed={selected === index} onClick={() => {
                  setSelected(index);
                  clearFieldState();
                }} className={`${buttonStyle} w-full py-1 text-left ${selected === index ? "text-terminal-accent" : "text-neutral-500"}`}>
                  <span aria-hidden="true">{selected === index ? "> " : "  "}</span>{item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <section aria-labelledby="entry-heading" className="min-w-0 md:border-l md:border-neutral-800 md:pl-6">
          <h2 id="entry-heading" className="mb-5">{entry?.name ?? "No entry selected"}</h2>
          <dl className="space-y-5">
            {entry?.fields.map((field, index) => (
              <div key={field.label} className="space-y-1">
                <dt className="text-xs text-neutral-500">{field.label}</dt>
                <dd>
                  {editing === index ? (
                    <form onSubmit={(event) => { event.preventDefault(); saveField(); }} className="flex flex-wrap items-center gap-3">
                      <label className="sr-only" htmlFor={`field-${index}`}>{field.label}</label>
                      <input id={`field-${index}`} type={field.sensitive ? "password" : "text"} value={draft} onChange={(event) => setDraft(event.target.value)} autoComplete="off" onKeyDown={(event) => {
                        if (event.key === "Escape") { setEditing(null); setDraft(""); }
                      }} className="min-w-0 flex-1 border border-neutral-700 bg-black px-2 py-1 text-base caret-terminal-accent focus:border-terminal-accent focus:outline-none" />
                      <button type="submit" className={buttonStyle}>save</button>
                      <button type="button" onClick={() => { setEditing(null); setDraft(""); }} className={buttonStyle}>cancel</button>
                    </form>
                  ) : (
                    <div className="flex flex-wrap items-start gap-3">
                      <span className="min-w-0 flex-1 break-all whitespace-pre-wrap">{field.value ? field.sensitive && revealed !== index ? "••••••••••••" : field.value : "—"}</span>
                      {field.sensitive && field.value && <button type="button" aria-label={`${revealed === index ? "Hide" : "Reveal"} ${field.label}`} onClick={() => setRevealed(revealed === index ? null : index)} className={buttonStyle}>{revealed === index ? "hide" : "reveal"}</button>}
                      <button type="button" aria-label={`Edit ${field.label}`} onClick={() => { setEditing(index); setDraft(field.value); setRevealed(null); }} className={buttonStyle}>edit</button>
                    </div>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <p role="status" className="text-xs text-neutral-500"># {message || "Ctrl+L locks the vault."}</p>
    </div>
  );
}
