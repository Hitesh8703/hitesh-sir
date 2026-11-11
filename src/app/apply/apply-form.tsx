"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitApplication } from "./actions";
import { FormAlert, SubmitButton } from "@/components/form-bits";

export function ApplyForm() {
  const [state, formAction] = useActionState(submitApplication, null);

  if (state?.success) {
    return (
      <div className="card p-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12.5 10 17.5 19 7" />
          </svg>
        </span>
        <p className="mt-4 font-display text-xl font-semibold">Application sent</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">{state.success}</p>
        <Link href="/" className="btn btn-outline mt-6">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <FormAlert state={state} />
      <div>
        <label htmlFor="full_name" className="label">
          Full name
        </label>
        <input id="full_name" name="full_name" type="text" autoComplete="name" required minLength={2} maxLength={120} className="input" placeholder="e.g. Priya Sharma" />
      </div>
      <div>
        <label htmlFor="email" className="label">
          Email address
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} className="input" placeholder="you@example.com" />
        <p className="mt-2 text-xs text-ink-500">Your login details will be sent here if you are approved.</p>
      </div>

      {/* Honeypot — hidden from people, catches spam bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <SubmitButton className="btn btn-gold btn-lg w-full" pendingText="Sending application…">
        Submit application
      </SubmitButton>
    </form>
  );
}
