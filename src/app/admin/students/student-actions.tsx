"use client";

import { useActionState } from "react";
import { useShowCredentials } from "@/components/credentials";
import { studentAction } from "./actions";
import type { ActionState } from "@/lib/types";
import { FormAlert, SubmitButton } from "@/components/form-bits";

export function StudentActions({
  id,
  name,
  status,
}: {
  id: string;
  name: string;
  status: "active" | "suspended";
}) {
  const showCredentials = useShowCredentials();
  const [state, formAction] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await studentAction(prev, formData);
    if (result?.credentials) showCredentials(result.credentials);
    return result;
  }, null);

  const button = (intent: string, label: string, className: string, confirmMessage: string) => (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="intent" value={intent} />
      <SubmitButton className={className} pendingText="Working…" confirmMessage={confirmMessage}>
        {label}
      </SubmitButton>
    </form>
  );

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2 sm:justify-end">
        {button(
          "reset",
          "New password",
          "btn btn-outline btn-sm",
          `Create a new temporary password for ${name}? Their current password will stop working, and you will need to send them the new one.`,
        )}
        {status === "active"
          ? button("suspend", "Suspend", "btn btn-outline btn-sm", `Suspend ${name}? They will not be able to log in until reactivated.`)
          : button("reactivate", "Reactivate", "btn btn-success btn-sm", `Reactivate ${name}'s account?`)}
        {button(
          "delete",
          "Delete",
          "btn btn-danger btn-sm",
          `Permanently delete ${name}'s account and all their progress? This cannot be undone.`,
        )}
      </div>
      {state && (
        <div className="max-w-sm">
          <FormAlert state={state} />
        </div>
      )}
    </div>
  );
}
