import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader, ProgressBar } from "@/components/ui";
import { formatDate, percent } from "@/lib/format";
import type { Profile } from "@/lib/types";
import { StudentActions } from "./student-actions";

export const metadata: Metadata = { title: "Students" };

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const supabase = await createClient();

  const [{ data: profileRows }, { data: progressRows }, { count: paperCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, role, status, must_change_password, created_at")
      .eq("role", "student")
      .order("created_at", { ascending: false }),
    supabase.from("paper_progress").select("student_id, status"),
    supabase.from("papers").select("id", { count: "exact", head: true }),
  ]);

  const totals = new Map<string, { viewed: number; completed: number }>();
  for (const row of (progressRows ?? []) as { student_id: string; status: string }[]) {
    const t = totals.get(row.student_id) ?? { viewed: 0, completed: 0 };
    t.viewed += 1;
    if (row.status === "completed") t.completed += 1;
    totals.set(row.student_id, t);
  }

  const all = (profileRows ?? []) as Profile[];
  const students = query
    ? all.filter((s) => s.full_name.toLowerCase().includes(query) || s.email.includes(query))
    : all;
  const papers = paperCount ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="People"
        title="Students"
        description={`${all.filter((s) => s.status === "active").length} active · ${all.filter((s) => s.status === "suspended").length} suspended`}
        actions={
          <form className="flex gap-2" action="/admin/students">
            <input name="q" defaultValue={q} placeholder="Search name or email" className="input sm:w-64" aria-label="Search students" />
            <button className="btn btn-outline" type="submit">
              Search
            </button>
          </form>
        }
      />

      {students.length === 0 ? (
        <EmptyState title={query ? "No students match your search" : "No students yet"}>
          {query ? null : "Approve an application to create the first student account."}
        </EmptyState>
      ) : (
        <ul className="card divide-y divide-ink-100">
          {students.map((s) => {
            const t = totals.get(s.id) ?? { viewed: 0, completed: 0 };
            const rate = percent(t.completed, papers);
            return (
              <li key={s.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 lg:w-1/3">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {s.full_name || "Unnamed"}
                    {s.status === "suspended" && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 ring-1 ring-red-200">Suspended</span>
                    )}
                    {s.must_change_password && s.status === "active" && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200">Awaiting first login</span>
                    )}
                  </p>
                  <p className="truncate text-sm text-ink-600">{s.email}</p>
                  <p className="text-xs text-ink-500">Joined {formatDate(s.created_at)}</p>
                </div>
                <div className="lg:w-1/4">
                  <div className="mb-1.5 flex justify-between text-xs text-ink-600">
                    <span>
                      {t.completed}/{papers} completed
                    </span>
                    <span>{rate}%</span>
                  </div>
                  <ProgressBar value={rate} tone="green" />
                  <p className="mt-1 text-xs text-ink-500">{t.viewed} papers opened</p>
                </div>
                <StudentActions id={s.id} name={s.full_name || s.email} status={s.status} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
