"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateTempPassword } from "@/lib/password";
import type { ActionState, Application } from "@/lib/types";

export async function approveApplication(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  const { data: app } = await supabase
    .from("applications")
    .select("id, full_name, email, status")
    .eq("id", id)
    .single<Pick<Application, "id" | "full_name" | "email" | "status">>();

  if (!app) return { error: "Application not found." };
  if (app.status !== "pending") return { error: "This application has already been reviewed." };

  // Mark it as approved FIRST so a double-click can't create two accounts.
  const { data: claimed } = await supabase
    .from("applications")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending")
    .select("id");
  if (!claimed?.length) return { error: "This application has already been reviewed." };

  const admin = createAdminClient();
  const tempPassword = generateTempPassword();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: app.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: app.full_name },
  });

  if (createError || !created.user) {
    // Put it back to pending so it can be retried.
    await supabase.from("applications").update({ status: "pending", reviewed_at: null }).eq("id", id);
    const exists = createError?.code === "email_exists" || /already/i.test(createError?.message ?? "");
    return {
      error: exists
        ? "An account with this email already exists. Check the Students page."
        : `Could not create the account: ${createError?.message ?? "unknown error"}`,
    };
  }

  // Make sure the new profile is a student who must change the password.
  await admin
    .from("profiles")
    .update({ full_name: app.full_name, must_change_password: true, status: "active" })
    .eq("id", created.user.id);
  await supabase.from("applications").update({ student_id: created.user.id }).eq("id", id);

  revalidatePath("/admin", "layout");

  // The temporary password is returned to the admin's screen ONCE and is never stored.
  // Hitesh sends it to the student privately; they must change it at first login.
  return {
    success: `Approved. ${app.full_name}'s account is ready.`,
    credentials: { name: app.full_name, email: app.email, password: tempPassword },
  };
}

export async function rejectApplication(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .update({ status: "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending")
    .select("id");
  if (error) return { error: error.message };
  if (!data?.length) return { error: "This application has already been reviewed." };
  revalidatePath("/admin", "layout");
  return { success: "Application rejected." };
}

export async function deleteApplication(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("applications").delete().eq("id", id).neq("status", "pending");
  revalidatePath("/admin", "layout");
}
