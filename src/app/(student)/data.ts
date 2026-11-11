import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PaperStat, ProgressStatus } from "@/lib/types";

export type StudentPaper = {
  id: string;
  subject_id: string;
  subject_name: string;
  title: string;
  file_size: number;
  created_at: string;
  status: ProgressStatus | null;
  viewed: number;
  completed: number;
};

export type StudentSubject = {
  id: string;
  name: string;
  description: string;
  papers: StudentPaper[];
};

/** Everything a student dashboard needs, computed live from the database. */
export async function loadStudentData(userId: string) {
  const supabase = await createClient();

  const [{ data: subjectRows }, { data: progressRows }, { data: statRows }, { data: studentCount }] =
    await Promise.all([
      supabase
        .from("subjects")
        .select("id, name, description, papers(id, subject_id, title, file_size, created_at)")
        .order("name"),
      supabase.from("paper_progress").select("paper_id, status").eq("student_id", userId),
      supabase.rpc("get_paper_stats"),
      supabase.rpc("get_student_count"),
    ]);

  const myProgress = new Map(
    ((progressRows ?? []) as { paper_id: string; status: ProgressStatus }[]).map((r) => [r.paper_id, r.status]),
  );
  const stats = new Map(((statRows ?? []) as PaperStat[]).map((s) => [s.paper_id, s]));

  type Row = {
    id: string;
    name: string;
    description: string;
    papers: { id: string; subject_id: string; title: string; file_size: number; created_at: string }[];
  };

  const subjects: StudentSubject[] = ((subjectRows ?? []) as Row[]).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    papers: [...(s.papers ?? [])]
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }))
      .map((p) => ({
        ...p,
        subject_name: s.name,
        status: myProgress.get(p.id) ?? null,
        viewed: stats.get(p.id)?.viewed_count ?? 0,
        completed: stats.get(p.id)?.completed_count ?? 0,
      })),
  }));

  const allPapers = subjects.flatMap((s) => s.papers);
  const summary = {
    students: (studentCount as number | null) ?? 0,
    total: allPapers.length,
    completed: allPapers.filter((p) => p.status === "completed").length,
    inProgress: allPapers.filter((p) => p.status === "in_progress").length,
  };

  return { subjects, allPapers, summary };
}
