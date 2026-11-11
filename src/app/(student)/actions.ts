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
  await supabase.from("paper_progress").upsert(
    {
      student_id: user.id,
      paper_id: paperId,
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    },
    { onConflict: "student_id,paper_id" },
  );
  revalidatePath("/", "layout");
}
