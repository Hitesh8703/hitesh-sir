"use client";

import { useActionState } from "react";
import { useShowCredentials } from "@/components/credentials";
import { approveApplication, rejectApplication } from "./actions";
import type { ActionState } from "@/lib/types";
import { FormAlert, SubmitButton } from "@/components/form-bits";

export function ApplicationActions({ id, name }: { id: string; name: string }) {
  const showCredentials = useShowCredentials();
  const [approveState, approve] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await approveApplication(prev, formData);
    if (result?.credentials) showCredentials(result.credentials);
    return result;
  }, null);
  const [rejectState, reject] = useActionState(rejectApplication, null);
  const state = approveState ?? rejectState;

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <div className="flex gap-2">
        <form action={reject}>
          <input type="hidden" name="id" value={id} />
          <SubmitButton className="btn btn-danger btn-sm" pendingText="Rejecting…" confirmMessage={`Reject the application from ${name}?`}>
            Reject
          </SubmitButton>
        </form>
        <form action={approve}>
          <input type="hidden" name="id" value={id} />
          <SubmitButton className="btn btn-success btn-sm" pendingText="Approving…" confirmMessage={`Approve ${name}? This creates their student account and shows you a temporary password to send them.`}>
            Approve
          </SubmitButton>
        </form>
      </div>
      {state && (
        <div className="max-w-sm text-left">
          <FormAlert state={state} />
        </div>
      )}
    </div>
  );
}
