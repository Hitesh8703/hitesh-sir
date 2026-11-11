import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "./login-form";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser, homeFor } from "@/lib/auth";

export const metadata: Metadata = { title: "Login" };

const NOTICES: Record<string, string> = {
  suspended: "Your account is not active. Please contact Hitesh Sir.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  // Already logged in? Go straight to the right place.
  if (isSupabaseConfigured() && !error) {
    const current = await getCurrentUser();
    if (current && current.profile.status === "active") redirect(homeFor(current.profile));
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your Hitesh Sir student account."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/apply" className="font-semibold text-ink-900 underline decoration-gold-500 underline-offset-4">
            Apply for access
          </Link>
          <p className="mt-3 text-ink-500">
            Forgot your password? Ask Hitesh Sir to send you new login details.
          </p>
        </>
      }
    >
      <LoginForm notice={error ? NOTICES[error] : undefined} />
    </AuthShell>
  );
}
