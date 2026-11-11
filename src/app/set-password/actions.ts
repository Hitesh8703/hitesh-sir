"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { homeFor, requireUser } from "@/lib/auth";
import type { ActionState } from "@/lib/types";

export async function setPermanentPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user, profile } = await requireUser();

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) return { error: "Your password must be at least 8 characters long." };
  if (password.length > 72) return { error: "Your password must be 72 characters or fewer." };
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password))
    return { error: "Use at least one letter and one number." };
  if (password !== confirm) return { error: "The two passwords do not match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password")
      return { error: "Please choose a new password, different from the temporary one." };
    if (error.code === "weak_password")
      return { error: "That password is too weak. Please choose a stronger one." };
    return { error: `Could not save your password: ${error.message}` };
  }

  // Students cannot edit their own profile row (Row Level Security), so this
  // flag is cleared by trusted server code, for this user only.
  const admin = createAdminClient();
  const { error: flagError } = await admin
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", user.id);
  if (flagError) return { error: "Password saved, but your account could not be updated. Please try again." };

  redirect(homeFor({ ...profile, must_change_password: false }));
}
