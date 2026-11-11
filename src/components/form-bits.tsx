"use client";

import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/types";

/** A submit button that shows a "working…" label while the form is sending. */
export function SubmitButton({
  children,
  pendingText = "Please wait…",
  className = "btn btn-primary",
  confirmMessage,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  confirmMessage?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {pending ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** Shows the success / warning / error message returned by a form action. */
export function FormAlert({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.error)
    return (
      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {state.error}
      </p>
    );
  if (state.warning)
    return (
      <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        {state.warning}
      </p>
    );
  if (state.success)
    return (
      <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        {state.success}
      </p>
    );
  return null;
}

