import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Hitesh is the only administrator. An account is treated as admin only when
 * BOTH are true:
 *   1. its database role is 'admin' (only one row may have it, enforced by the database), and
 *   2. its email matches the ADMIN_EMAIL server setting.
 */
export function isAdmin(profile: Pick<Profile, "role" | "email">): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return profile.role === "admin" && !!adminEmail && profile.email.toLowerCase() === adminEmail;
}

/** The logged-in user and their profile, or null. Cached for one request. */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, status, must_change_password, created_at")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) return null;
  return { user, profile };
});

/** Where a logged-in person should land. */
export function homeFor(profile: Profile): string {
  if (profile.must_change_password) return "/set-password";
  return profile.role === "admin" ? "/admin" : "/dashboard";
}

/** Any logged-in, active account (used by the set-password page). */
export async function requireUser() {
  const current = await getCurrentUser();
  if (!current) redirect("/login");
  if (current.profile.status !== "active") redirect("/login?error=suspended");
  return current;
}

/** Only Hitesh. Everyone else is redirected away. */
export async function requireAdmin() {
  const current = await requireUser();
  if (current.profile.must_change_password) redirect("/set-password");
  if (current.profile.role !== "admin") redirect("/dashboard");
  if (!isAdmin(current.profile)) {
    throw new Error(
      "Admin access is locked: the ADMIN_EMAIL setting is missing or does not match this account's email. Fix it in .env.local (or Vercel) — see SETUP.md.",
    );
  }
  return current;
}

/** Only approved, active students. */
export async function requireStudent() {
  const current = await requireUser();
  if (current.profile.must_change_password) redirect("/set-password");
  if (current.profile.role !== "student") redirect("/admin");
  return current;
}
