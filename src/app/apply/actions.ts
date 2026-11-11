"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { EMAIL_PATTERN } from "@/lib/format";
import type { ActionState } from "@/lib/types";

/**
 * Public application form. This NEVER creates an account — it only records a
 * pending application for Hitesh Sir to review. The database does not allow
 * the public to write to the applications table directly; only this server
 * code (after validation) can.
 */
export async function submitApplication(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Hidden "honeypot" field: real people leave it empty, spam bots fill it in.
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { success: "Thank you! Your application has been received." };
  }

  const fullName = String(formData.get("full_name") ?? "").trim().replace(/\s+/g, " ");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (fullName.length < 2 || fullName.length > 120)
    return { error: "Please enter your full name (2–120 characters)." };
  if (!EMAIL_PATTERN.test(email) || email.length > 254)
    return { error: "Please enter a valid email address." };
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SECRET_KEY)
    return { error: "Applications are not open yet — the portal is still being set up." };

  const admin = createAdminClient();

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existingProfile)
    return { error: "This email already has a student account. Please log in instead." };

  const { data: pending } = await admin
    .from("applications")
    .select("id")
    .eq("email", email)
    .eq("status", "pending")
    .maybeSingle();
  if (pending)
    return { error: "You have already applied with this email. Hitesh Sir will review it soon." };

  const { error } = await admin.from("applications").insert({ full_name: fullName, email });
  if (error) {
    if (error.code === "23505")
      return { error: "You have already applied with this email. Hitesh Sir will review it soon." };
    console.error("Application insert failed:", error.message);
    return { error: "Something went wrong while sending your application. Please try again." };
  }

  return {
    success:
      "Thank you! Your application has been received. If it is approved, Hitesh Sir will send you your login details personally.",
  };
}
