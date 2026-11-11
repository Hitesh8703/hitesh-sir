import type { Metadata } from "next";
import Link from "next/link";
import { requireStudent } from "@/lib/auth";
import { EmptyState, PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { percent } from "@/lib/format";
import { loadStudentData } from "../data";
import { PaperCard } from "../paper-card";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { user, profile } = await requireStudent();
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const { subjects, allPapers, summary } = await loadStudentData(user.id);
  const classmates = Math.max(0, summary.students - 1);

  const results = query
    ? allPapers.filter(
        (p) => p.title.toLowerCase().includes(query) || p.subject_name.toLowerCase().includes(query),
      )
    : [];

  const continueWith = allPapers.filter((p) => p.status === "in_progress").slice(0, 3);
  const myRate = percent(summary.completed, summary.total);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Student dashboard"
        title={`Hello, ${profile.full_name.split(" ")[0] || "there"}`}
        description="Pick up where you left off, or start a new paper."
      />

      {/* Search */}
      <form action="/dashboard" className="flex gap-2" role="search">
        <div className="relative flex-1">
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-ink-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input name="q" defaultValue={q} placeholder="Search papers or subjects…" className="input pl-11" aria-label="Search documents" />
        </div>
        <button type="submit" className="btn btn-primary">
          Search
        </button>
        {query && (
          <Link href="/dashboard" className="btn btn-ghost">
            Clear
          </Link>
        )}
      </form>

      {query ? (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold">
            {results.length} {results.length === 1 ? "result" : "results"} for “{q}”
          </h2>
          {results.length === 0 ? (
            <EmptyState title="No documents found">Try a different word, or browse subjects below.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {results.map((p) => (
                <PaperCard key={p.id} paper={p} classmates={classmates} showSubject />
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Approved students" value={summary.students} accent hint="In Hitesh Sir's class" />
            <StatCard label="Completed" value={`${summary.completed}/${summary.total}`} hint={`${myRate}% of all papers`} />
            <StatCard label="In progress" value={summary.inProgress} />
            <StatCard label="Not started" value={summary.total - summary.completed - summary.inProgress} />
          </section>

          <section className="card p-6">
            <div className="mb-3 flex items-end justify-between">
              <h2 className="font-display text-xl font-semibold">Your overall progress</h2>
              <span className="font-display text-2xl font-semibold">{myRate}%</span>
            </div>
            <ProgressBar value={myRate} tone="green" />
          </section>

          {continueWith.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-xl font-semibold">Continue where you left off</h2>
              <ul className="space-y-3">
                {continueWith.map((p) => (
                  <PaperCard key={p.id} paper={p} classmates={classmates} showSubject />
                ))}
              </ul>
            </section>
          )}

          <section className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Subjects</h2>
            {subjects.length === 0 ? (
              <EmptyState title="No subjects yet">Hitesh Sir hasn&apos;t published any subjects yet. Check back soon.</EmptyState>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((s) => {
                  const done = s.papers.filter((p) => p.status === "completed").length;
                  const rate = percent(done, s.papers.length);
                  return (
                    <li key={s.id}>
                      <Link href={`/subjects/${s.id}`} className="card group block h-full p-5 transition hover:-translate-y-0.5 hover:border-gold-400">
                        <p className="font-display text-lg font-semibold group-hover:text-gold-700">{s.name}</p>
                        {s.description && <p className="mt-1 line-clamp-2 text-sm text-ink-600">{s.description}</p>}
                        <div className="mt-4 mb-1.5 flex justify-between text-xs text-ink-600">
                          <span>
                            {done}/{s.papers.length} completed
                          </span>
                          <span>{rate}%</span>
                        </div>
                        <ProgressBar value={rate} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
