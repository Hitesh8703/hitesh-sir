import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { ApplyForm } from "./apply-form";

export const metadata: Metadata = { title: "Apply" };

export default function ApplyPage() {
  return (
    <AuthShell
      title="Apply for access"
      subtitle="Hitesh Sir reviews every application personally. If approved, he'll send you your login details personally."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-ink-900 underline decoration-gold-500 underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <ApplyForm />
    </AuthShell>
  );
}
