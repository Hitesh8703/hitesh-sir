"use client";

import { useActionState, useState } from "react";
import { setPermanentPassword } from "./actions";
import { FormAlert, SubmitButton } from "@/components/form-bits";

export function SetPasswordForm() {
  const [state, formAction] = useActionState(setPermanentPassword, null);
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <FormAlert state={state} />
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="label">
            New password
          </label>
          <button type="button" onClick={() => setShow((s) => !s)} className="mb-1.5 text-xs font-medium text-ink-500 hover:text-ink-800">
            {show ? "Hide" : "Show"}
          </button>
        </div>
        <input id="password" name="password" type={show ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={72} className="input" />
        <p className="mt-2 text-xs text-ink-500">At least 8 characters, with at least one letter and one number.</p>
      </div>
      <div>
        <label htmlFor="confirm" className="label">
          Confirm new password
        </label>
        <input id="confirm" name="confirm" type={show ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={72} className="input" />
      </div>
      <SubmitButton className="btn btn-primary btn-lg w-full" pendingText="Saving…">
        Save password and continue
      </SubmitButton>
    </form>
  );
}
