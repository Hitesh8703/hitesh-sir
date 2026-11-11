import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { SetPasswordForm } from "./set-password-form";
import { homeFor, requireUser } from "@/lib/auth";
import { signOut } from "@/app/login/actions";

export const metadata: Metadata = { title: "Set your password" };

export default async function SetPasswordPage() {
  const { profile } = await requireUser();
  if (!profile.must_change_password) redirect(homeFor(profile));

  return (
    <AuthShell
      title="Choose your password"
      subtitle={`Welcome${profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}! For your security, replace the temporary password with one only you know.`}
      footer={
        <form action={signOut}>
          <button type="submit" className="font-medium text-ink-600 underline underline-offset-4 hover:text-ink-900">
            Sign out
          </button>
        </form>
      }
    >
      <SetPasswordForm />
    </AuthShell>
  );
}
