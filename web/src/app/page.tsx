"use client";

import ApiDocs from "@/components/ApiDocs";
import Readme from "@/components/Readme";
import Login from "@/components/Login";
import Vault from "@/components/Vault";
import Footer from "@/components/Footer";

import { useEffect, useState } from "react";

const sections = ["terminal", "api", "readme"] as const;
type Section = (typeof sections)[number];
const command = "hashword";

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>("terminal");
  const [typed, setTyped] = useState(0);
  const [started, setStarted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setInterval(() => {
      setTyped((current) => Math.min(current + 1, command.length));
    }, reducedMotion ? 1 : 85);
    const launch = window.setTimeout(() => {
      window.clearInterval(timer);
      setTyped(command.length);
      setStarted(true);
    }, reducedMotion ? 1 : 1000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(launch);
    };
  }, []);


  return (
    <main className="flex min-h-dvh flex-col bg-black font-mono text-sm leading-relaxed text-terminal-accent">
      <header className="flex w-full flex-wrap items-center gap-x-6 gap-y-4 border-b border-neutral-800 px-5 py-4 sm:px-8">
        <nav aria-label="Main navigation" className="flex gap-7">
          {sections.map((section) => (
            <button
              key={section}
              type="button"
              aria-pressed={activeSection === section}
              aria-controls="main-content"
              onClick={() => {
                setActiveSection(section);
                if (section !== activeSection) setUnlocked(false);
              }}
              className={`cursor-pointer underline-offset-4 hover:text-terminal-accent focus-visible:outline focus-visible:outline-offset-4 ${activeSection === section ? "text-terminal-accent underline" : "text-neutral-500"}`}
            >{section}</button>
          ))}
        </nav>
        <nav aria-label="Project links" className="ml-auto flex items-center gap-2">
          <a
            href="https://github.com/nickczak/Hashword-Wallet-Password-Manager"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm border border-terminal-accent/40 bg-terminal-accent/5 px-3 py-1 text-xs text-terminal-accent transition-colors hover:bg-terminal-accent hover:text-black focus-visible:outline focus-visible:outline-offset-4"
            aria-label="Hashword repository on GitHub (opens in a new tab)"
          >repo <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <section id="main-content" aria-label={`Hashword ${activeSection}`} className="relative w-full px-5 py-6 sm:px-8">
        {activeSection === "terminal" ? (
          <>
            <p>$ echo &quot;Hello from nickczak&quot;</p>
            <p>Hello from nickczak</p>
            <p aria-label="Run hashword" className="flex items-center gap-[1ch]">
              <span aria-hidden="true" className="inline-flex items-center gap-[1ch]">{!started && <span className="absolute left-0 h-[1em] w-[3px] bg-terminal-accent" />}$</span>
              <span aria-hidden="true">{command.slice(0, typed)}{!started && <span className="terminal-cursor inline-block align-middle" />}</span>
            </p>
            {started && (unlocked ? (
              <Vault onLock={() => setUnlocked(false)} />
            ) : (
              <Login />
            ))}
          </>
        ) : activeSection === "api" ? (
          <ApiDocs />
        ) : (
          <Readme />
        )}
      </section>
      <Footer />
    </main>
  );
}
