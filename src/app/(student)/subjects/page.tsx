import type { Metadata } from "next";
import Link from "next/link";
import { requireStudent } from "@/lib/auth";
import { EmptyState, PageHeader, ProgressBar } from "@/components/ui";
import { percent } from "@/lib/format";
import { loadStudentData } from "../data";

export const metadata: Metadata = { title: "Subjects" };

export default async function SubjectsPage() {
  const { user } = await requireStudent();
  const { subjects } = await loadStudentData(user.id);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Library" title="All subjects" description="Open a subject to see its papers." />
      {subjects.length === 0 ? (
        <EmptyState title="No subjects yet">Check back soon.</EmptyState>
      ) : (
        <ul className="card divide-y divide-ink-100">
          {subjects.map((s) => {
            const done = s.papers.filter((p) => p.status === "completed").length;
            const rate = percent(done, s.papers.length);
            return (
              <li key={s.id}>
                <Link href={`/subjects/${s.id}`} className="flex flex-col gap-3 p-5 hover:bg-paper sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-display text-lg font-semibold">{s.name}</p>
                    <p className="text-sm text-ink-600">
                      {s.papers.length} {s.papers.length === 1 ? "paper" : "papers"}
                      {s.description ? ` · ${s.description}` : ""}
                    </p>
                  </div>
                  <div className="sm:w-56">
                    <div className="mb-1.5 flex justify-between text-xs text-ink-600">
                      <span>{done} completed</span>
                      <span>{rate}%</span>
                    </div>
                    <ProgressBar value={rate} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
