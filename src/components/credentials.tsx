"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ActionState } from "@/lib/types";

type Credentials = NonNullable<NonNullable<ActionState>["credentials"]>;

const ShowCredentials = createContext<(c: Credentials) => void>(() => {});

/** Lets admin buttons show a new temporary password. */
export const useShowCredentials = () => useContext(ShowCredentials);

/**
 * Wraps the admin area. New temporary passwords appear at the top of the page and stay
 * there (even when the application leaves the Pending list) until Hitesh hides them.
 * They live only in this browser tab's memory: never saved anywhere, gone on refresh.
 */
export function CredentialsProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Credentials[]>([]);
  const show = useCallback(
    (c: Credentials) => {
      setList((prev) => [c, ...prev.filter((p) => p.email !== c.email)]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [],
  );
  const hide = (email: string) => setList((prev) => prev.filter((p) => p.email !== email));

  return (
    <ShowCredentials.Provider value={show}>
      {list.length > 0 && (
        <div className="mb-8 space-y-3">
          {list.map((c) => (
            <CredentialsCard key={c.email + c.password} credentials={c} onHide={() => hide(c.email)} />
          ))}
        </div>
      )}
      {children}
    </ShowCredentials.Provider>
  );
}

function CredentialsCard({ credentials, onHide }: { credentials: Credentials; onHide: () => void }) {
  const [copied, setCopied] = useState(false);

  const message = [
    `Hi ${credentials.name}, you're approved for Hitesh Sir's portal!`,
    ``,
    `Website: ${window.location.origin}/login`,
    `Email: ${credentials.email}`,
    `Temporary password: ${credentials.password}`,
    ``,
    `You'll be asked to choose your own password the first time you log in.`,
  ].join("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      window.prompt("Copy this message:", message);
    }
  }

  return (
    <div role="status" className="rounded-2xl border border-gold-300 bg-gold-200/40 p-5 text-sm text-ink-900">
      <p className="font-semibold">Send these login details to {credentials.name} privately</p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="text-ink-600">Email</dt>
        <dd className="break-all">{credentials.email}</dd>
        <dt className="text-ink-600">Temporary password</dt>
        <dd className="font-mono text-base tracking-wide break-all select-all">{credentials.password}</dd>
      </dl>
      <p className="mt-3 text-xs text-ink-600">
        Shown only once and never saved. If you lose it, use <strong>New password</strong> on the Students page.
        They must choose their own password at first login.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={copy} className="btn btn-primary btn-sm">
          {copied ? "Copied ✓" : "Copy message"}
        </button>
        <button type="button" onClick={onHide} className="btn btn-ghost btn-sm">
          Done, hide it
        </button>
      </div>
    </div>
  );
}
