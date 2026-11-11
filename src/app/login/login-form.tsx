"use client";

import { useActionState, useState } from "react";
import { signIn } from "./actions";
import { FormAlert, SubmitButton } from "@/components/form-bits";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, formAction] = useActionState(signIn, notice ? { error: notice } : null);
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <FormAlert state={state} />
      <div>
        <label htmlFor="email" className="label">
          Email address
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" placeholder="you@example.com" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="label">
            Password
          </label>
          <button type="button" onClick={() => setShow((s) => !s)} className="mb-1.5 text-xs font-medium text-ink-500 hover:text-ink-800">
            {show ? "Hide" : "Show"}
          </button>
        </div>
        <input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          autoComplete="current-password"
          required
          className="input"
          placeholder="Your password"
        />
        <p className="mt-2 text-xs text-ink-500">
          First time? Use the temporary password Hitesh Sir sent you.
        </p>
      </div>
      <SubmitButton className="btn btn-primary btn-lg w-full" pendingText="Signing in…">
        Log in
      </SubmitButton>
    </form>
  );
}
