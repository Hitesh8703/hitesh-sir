"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateTempPassword } from "@/lib/password";
import type { ActionState, Profile } from "@/lib/types";

/** Loads a STUDENT account. Refuses to touch the admin account. */
async function loadStudent(id: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, email, full_name, role, status")
    .eq("id", id)
    .single<Pick<Profile, "id" | "email" | "full_name" | "role" | "status">>();
  if (!data || data.role !== "student") return { admin, student: null };
  return { admin, student: data };
}

export async function studentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const intent = String(formData.get("intent") ?? "");
  const { admin, student } = await loadStudent(id);
  if (!student) return { error: "Student not found." };

  if (intent === "suspend") {
    const { error } = await admin.auth.admin.updateUserById(id, { ban_duration: "876000h" });
    if (error) return { error: error.message };
    await admin.from("profiles").update({ status: "suspended" }).eq("id", id);
    revalidatePath("/admin", "layout");
    return { success: `${student.full_name} is suspended and can no longer log in.` };
  }

  if (intent === "reactivate") {
    const { error } = await admin.auth.admin.updateUserById(id, { ban_duration: "none" });
    if (error) return { error: error.message };
    await admin.from("profiles").update({ status: "active" }).eq("id", id);
    revalidatePath("/admin", "layout");
    return { success: `${student.full_name} is active again.` };
  }

  if (intent === "reset") {
    const tempPassword = generateTempPassword();
    const { error } = await admin.auth.admin.updateUserById(id, { password: tempPassword });
    if (error) return { error: error.message };
    await admin.from("profiles").update({ must_change_password: true }).eq("id", id);
    revalidatePath("/admin", "layout");
    return {
      success: `New temporary password created. ${student.full_name}'s old password no longer works.`,
      credentials: { name: student.full_name, email: student.email, password: tempPassword },
    };
  }

  if (intent === "delete") {
    // Deleting the login also deletes the profile and all progress rows.
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return { error: error.message };
    revalidatePath("/admin", "layout");
    return { success: `${student.full_name}'s account was deleted.` };
  }

  return { error: "Unknown action." };
}
