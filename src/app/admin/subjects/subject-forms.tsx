"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createSubject, updateSubject } from "./actions";
import { FormAlert, SubmitButton } from "@/components/form-bits";
import type { ActionState } from "@/lib/types";

export function NewSubjectForm() {
  const [state, formAction] = useActionState(createSubject, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="card space-y-4 p-5">
      <p className="font-display text-lg font-semibold">Add a subject</p>
      <div>
        <label htmlFor="new-name" className="label">
          Subject name
        </label>
        <input id="new-name" name="name" required maxLength={120} className="input" placeholder="e.g. Statistics" />
      </div>
      <div>
        <label htmlFor="new-desc" className="label">
          Short description <span className="font-normal text-ink-400">(optional)</span>
        </label>
        <textarea id="new-desc" name="description" maxLength={500} rows={2} className="input" placeholder="e.g. Class 12 board exam practice papers" />
      </div>
      <FormAlert state={state} />
      <SubmitButton className="btn btn-primary w-full" pendingText="Adding…">
        Add subject
      </SubmitButton>
    </form>
  );
}

export function EditSubjectForm({
  id,
  name,
  description,
}: {
  id: string;
  name: string;
  description: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(async (prev: ActionState, fd: FormData) => {
    const result = await updateSubject(prev, fd);
    if (result?.success) setOpen(false);
    return result;
  }, null);

  if (!open)
    return (
      <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(true)}>
        Edit
      </button>
    );

  return (
    <form action={formAction} className="mt-3 w-full space-y-3">
      <input type="hidden" name="id" value={id} />
      <input name="name" defaultValue={name} required maxLength={120} className="input" aria-label="Subject name" />
      <textarea name="description" defaultValue={description} maxLength={500} rows={2} className="input" aria-label="Description" />
      <FormAlert state={state} />
      <div className="flex gap-2">
        <SubmitButton className="btn btn-primary btn-sm" pendingText="Saving…">
          Save
        </SubmitButton>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
