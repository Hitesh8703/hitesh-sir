"use server";

import { revalidatePath } from "next/cache";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Students update ONLY their own progress. Row Level Security in the
 * database enforces this too (student_id must equal the logged-in user).
 */
export async function setPaperProgress(formData: FormData) {
  const { user } = await requireStudent();
  const paperId = String(formData.get("paperId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (status !== "completed" && status !== "in_progress") return;

  const supabase = await createClient();
  // UPDATE only (never insert): the row is created when the student opens the paper,
  // so a paper can't be marked completed without having been opened first.
  await supabase
    .from("paper_progress")
    .update({ status, completed_at: status === "completed" ? new Date().toISOString() : null })
    .eq("student_id", user.id)
    .eq("paper_id", paperId);
  revalidatePath("/", "layout");
}
