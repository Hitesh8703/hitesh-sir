"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

const BUCKET = "papers";
const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

function refresh() {
  revalidatePath("/", "layout");
}

function readSubject(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) return { error: "Please enter a subject name." } as const;
  if (name.length > 120) return { error: "Subject name must be 120 characters or fewer." } as const;
  if (description.length > 500) return { error: "Description must be 500 characters or fewer." } as const;
  return { name, description } as const;
}

// ---------------- Subjects ----------------

export async function createSubject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const input = readSubject(formData);
  if ("error" in input) return { error: input.error };

  const supabase = await createClient();
  const { error } = await supabase.from("subjects").insert(input);
  if (error) return { error: `Could not create subject: ${error.message}` };
  refresh();
  return { success: `Subject “${input.name}” created.` };
}

export async function updateSubject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const input = readSubject(formData);
  if ("error" in input) return { error: input.error };

  const supabase = await createClient();
  const { error } = await supabase.from("subjects").update(input).eq("id", id);
  if (error) return { error: `Could not save: ${error.message}` };
  refresh();
  return { success: "Saved." };
}

export async function deleteSubject(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();

  const { data: papers } = await supabase.from("papers").select("file_path").eq("subject_id", id);
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) throw new Error(`Could not delete subject: ${error.message}`);

  const paths = (papers ?? []).map((p) => p.file_path as string);
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
  refresh();
}

// ---------------- Papers (PDFs) ----------------
// The PDF file itself is uploaded straight from Hitesh's browser to the
// private storage bucket (storage rules only allow the admin to do that).
// These actions then record / update / remove the paper in the database.

function validPath(path: string, subjectId: string) {
  return new RegExp(`^${subjectId}/${UUID}\\.pdf$`).test(path) && new RegExp(`^${UUID}$`).test(subjectId);
}

export async function createPaper(input: {
  subjectId: string;
  title: string;
  path: string;
  fileName: string;
  size: number;
}): Promise<ActionState> {
  await requireAdmin();
  const title = input.title.trim();
  if (!title || title.length > 200) return { error: "Please enter a title (up to 200 characters)." };
  if (!validPath(input.path, input.subjectId)) return { error: "Invalid file location." };

  const supabase = await createClient();
  const { error } = await supabase.from("papers").insert({
    subject_id: input.subjectId,
    title,
    file_path: input.path,
    file_name: input.fileName.slice(0, 255),
    file_size: Math.max(0, Math.floor(input.size)),
  });
  if (error) return { error: `Could not save paper: ${error.message}` };
  refresh();
  return { success: `“${title}” uploaded.` };
}

export async function replacePaperFile(input: {
  paperId: string;
  path: string;
  fileName: string;
  size: number;
}): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: paper } = await supabase
    .from("papers")
    .select("id, subject_id, file_path")
    .eq("id", input.paperId)
    .single();
  if (!paper) return { error: "Paper not found." };
  if (!validPath(input.path, paper.subject_id)) return { error: "Invalid file location." };

  const { error } = await supabase
    .from("papers")
    .update({
      file_path: input.path,
      file_name: input.fileName.slice(0, 255),
      file_size: Math.max(0, Math.floor(input.size)),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.paperId);
  if (error) return { error: `Could not replace file: ${error.message}` };

  await supabase.storage.from(BUCKET).remove([paper.file_path]);
  refresh();
  return { success: "PDF replaced. Student progress on this paper was kept." };
}

export async function renamePaper(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!title || title.length > 200) return { error: "Please enter a title (up to 200 characters)." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("papers")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  refresh();
  return { success: "Title saved." };
}

export async function deletePaper(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { data: paper } = await supabase.from("papers").select("file_path").eq("id", id).single();
  if (!paper) return;
  const { error } = await supabase.from("papers").delete().eq("id", id);
  if (error) throw new Error(`Could not delete paper: ${error.message}`);
  await supabase.storage.from(BUCKET).remove([paper.file_path]);
  refresh();
}
