import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type LeaderboardRow = { id: string; name: string; completed: number };
export type RecentCompletion = { studentName: string; paperTitle: string; subjectName: string; completedAt: string };

/**
 * Papers-completed leaderboard, shown on the admin Overview and every student dashboard.
 *
 * Only call this AFTER requireAdmin() or requireStudent() has verified the visitor.
 * It uses the server-only secret key, but returns nothing beyond names, completed
 * counts and recently completed paper titles: no emails or other account details.
 */
export async function loadLeaderboard() {
  const admin = createAdminClient();
  const [{ data: studentRows }, { data: progressRows }] = await Promise.all([
    admin.from("profiles").select("id, full_name").eq("role", "student").eq("status", "active"),
    admin
      .from("paper_progress")
      .select("student_id, completed_at, papers(title, subjects(name))")
      .eq("status", "completed")
      .order("completed_at", { ascending: false }),
  ]);

  const students = (studentRows ?? []) as { id: string; full_name: string }[];
  const completions = (progressRows ?? []) as unknown as {
    student_id: string;
    completed_at: string;
    papers: { title: string; subjects: { name: string } | null } | null;
  }[];

  const names = new Map(students.map((s) => [s.id, s.full_name || "Student"]));
  const counts = new Map<string, number>();
  // When two people have the same count, whoever got there first ranks higher.
  const lastDone = new Map<string, string>();
  for (const c of completions) {
    if (!names.has(c.student_id)) continue; // suspended or removed students
    counts.set(c.student_id, (counts.get(c.student_id) ?? 0) + 1);
    if (!lastDone.has(c.student_id)) lastDone.set(c.student_id, c.completed_at);
  }

  const rows: LeaderboardRow[] = students
    .map((s) => ({ id: s.id, name: names.get(s.id)!, completed: counts.get(s.id) ?? 0 }))
    .sort(
      (a, b) =>
        b.completed - a.completed ||
        (lastDone.get(a.id) ?? "").localeCompare(lastDone.get(b.id) ?? "") ||
        a.name.localeCompare(b.name),
    );

  const recent: RecentCompletion[] = completions
    .filter((c) => names.has(c.student_id) && c.papers)
    .slice(0, 6)
    .map((c) => ({
      studentName: names.get(c.student_id)!,
      paperTitle: c.papers!.title,
      subjectName: c.papers!.subjects?.name ?? "",
      completedAt: c.completed_at,
    }));

  return { rows, recent };
}
