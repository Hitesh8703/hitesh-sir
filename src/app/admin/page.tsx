import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { percent } from "@/lib/format";
import type { PaperStat } from "@/lib/types";

export const metadata: Metadata = { title: "Admin overview" };

type PaperRow = { id: string; title: string; subject_id: string; subjects: { name: string } | null };

export default async function AdminOverviewPage() {
  const { profile } = await requireAdmin();
  const supabase = await createClient();

  const [students, pending, { data: subjectRows }, { data: paperRows }, { data: statRows }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student").eq("status", "active"),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("subjects").select("id, name").order("name"),
    supabase.from("papers").select("id, title, subject_id, subjects(name)"),
    supabase.rpc("get_paper_stats"),
  ]);

  const studentCount = students.count ?? 0;
  const pendingCount = pending.count ?? 0;
  const subjects = (subjectRows ?? []) as { id: string; name: string }[];
  const papers = (paperRows ?? []) as unknown as PaperRow[];
  const statMap = new Map(((statRows ?? []) as PaperStat[]).map((s) => [s.paper_id, s]));

  const rows = papers.map((p) => ({
    ...p,
    viewed: statMap.get(p.id)?.viewed_count ?? 0,
    completed: statMap.get(p.id)?.completed_count ?? 0,
  }));

  const mostViewed = [...rows].filter((r) => r.viewed > 0).sort((a, b) => b.viewed - a.viewed).slice(0, 5);
  const mostCompleted = [...rows].filter((r) => r.completed > 0).sort((a, b) => b.completed - a.completed).slice(0, 5);

  const totalCompleted = rows.reduce((n, r) => n + r.completed, 0);
  const totalViewed = rows.reduce((n, r) => n + r.viewed, 0);
  const possible = studentCount * papers.length;
  const overallRate = percent(totalCompleted, possible);
  const inProgress = totalViewed - totalCompleted;
  const notStarted = Math.max(0, possible - totalViewed);

  const bySubject = subjects.map((s) => {
    const subjectRowsList = rows.filter((r) => r.subject_id === s.id);
    const done = subjectRowsList.reduce((n, r) => n + r.completed, 0);
    return {
      ...s,
      papers: subjectRowsList.length,
      rate: percent(done, studentCount * subjectRowsList.length),
    };
  });

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Administrator"
        title={`Good to see you, ${profile.full_name.split(" ")[0] || "Hitesh"}`}
        description="A live overview of your students, content and progress."
        actions={
          pendingCount > 0 ? (
            <Link href="/admin/applications" className="btn btn-gold">
              Review {pendingCount} pending {pendingCount === 1 ? "application" : "applications"}
            </Link>
          ) : null
        }
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Approved students" value={studentCount} accent hint="Active accounts" />
        <StatCard label="Pending applications" value={pendingCount} hint={pendingCount ? "Waiting for your review" : "All caught up"} />
        <StatCard label="Subjects" value={subjects.length} />
        <StatCard label="PDFs" value={papers.length} />
      </section>

      <section className="card p-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-xl font-semibold">Overall completion</h2>
            <p className="text-sm text-ink-600">
              Completed papers out of every possible student × paper combination.
            </p>
          </div>
          <p className="font-display text-4xl font-semibold">{overallRate}%</p>
        </div>
        <div className="mt-4">
          <ProgressBar value={overallRate} tone="green" />
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-4 text-center sm:text-left">
          <div>
            <dt className="text-xs text-ink-500">Completed</dt>
            <dd className="font-display text-2xl font-semibold text-emerald-700">{totalCompleted}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-500">In progress</dt>
            <dd className="font-display text-2xl font-semibold text-amber-700">{inProgress}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-500">Not started</dt>
            <dd className="font-display text-2xl font-semibold text-ink-600">{notStarted}</dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <RankedList title="Most viewed papers" rows={mostViewed.map((r) => ({ id: r.id, title: r.title, subject: r.subjects?.name ?? "", value: r.viewed }))} unit="viewed" max={studentCount} tone="gold" />
        <RankedList title="Most completed papers" rows={mostCompleted.map((r) => ({ id: r.id, title: r.title, subject: r.subjects?.name ?? "", value: r.completed }))} unit="completed" max={studentCount} tone="green" />
      </section>

      <section className="card p-6">
        <h2 className="font-display text-xl font-semibold">Completion by subject</h2>
        {bySubject.length === 0 ? (
          <p className="mt-3 text-sm text-ink-600">
            No subjects yet. <Link href="/admin/subjects" className="font-medium underline">Add one</Link>.
          </p>
        ) : (
          <ul className="mt-5 space-y-4">
            {bySubject.map((s) => (
              <li key={s.id}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium">
                    {s.name} <span className="text-ink-500">· {s.papers} PDFs</span>
                  </span>
                  <span className="text-ink-600">{s.rate}%</span>
                </div>
                <ProgressBar value={s.rate} tone="ink" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function RankedList({
  title,
  rows,
  unit,
  max,
  tone,
}: {
  title: string;
  rows: { id: string; title: string; subject: string; value: number }[];
  unit: string;
  max: number;
  tone: "gold" | "green";
}) {
  return (
    <div className="card p-6">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No activity yet">Numbers appear once students start opening papers.</EmptyState>
        </div>
      ) : (
        <ol className="mt-5 space-y-4">
          {rows.map((r, i) => (
            <li key={r.id} className="flex items-center gap-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink-100 text-sm font-semibold text-ink-700">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{r.title}</span>
                  <span className="shrink-0 text-ink-600">
                    {r.value} {unit}
                  </span>
                </div>
                <p className="mb-1.5 text-xs text-ink-500">{r.subject}</p>
                <ProgressBar value={percent(r.value, max)} tone={tone} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
