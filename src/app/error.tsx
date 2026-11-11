"use client";

import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const notConnected = error.message?.includes("not connected") || error.message?.includes("is missing") || error.message?.includes("ADMIN_EMAIL");
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
      <h1 className="font-display text-3xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-ink-600">
        {notConnected
          ? error.message
          : "An unexpected error occurred. Please try again. If it keeps happening, contact Hitesh Sir."}
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-outline">
          Home
        </Link>
      </div>
    </div>
  );
}
