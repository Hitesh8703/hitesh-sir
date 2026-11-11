import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { EmptyState, PageHeader, ProgressBar } from "@/components/ui";
import { percent } from "@/lib/format";
import { loadStudentData } from "../../data";
import { PaperCard } from "../../paper-card";

export const metadata: Metadata = { title: "Subject" };

export default async function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await requireStudent();
  const { id } = await params;
  const { subjects, summary } = await loadStudentData(user.id);
  const subject = subjects.find((s) => s.id === id);
  if (!subject) notFound();

  const classmates = Math.max(0, summary.students - 1);
  const done = subject.papers.filter((p) => p.status === "completed").length;
  const rate = percent(done, subject.papers.length);

  return (
    <div className="space-y-8">
      <Link href="/dashboard" className="text-sm font-medium text-ink-600 hover:text-ink-900">
        ← Dashboard
      </Link>
      <PageHeader eyebrow="Subject" title={subject.name} description={subject.description || undefined} />

      <div className="card p-5">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium">
            {done} of {subject.papers.length} papers completed
          </span>
          <span className="text-ink-600">{rate}%</span>
        </div>
        <ProgressBar value={rate} tone="green" />
      </div>

      {subject.papers.length === 0 ? (
        <EmptyState title="No papers yet">Hitesh Sir will add papers to this subject soon.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {subject.papers.map((p) => (
            <PaperCard key={p.id} paper={p} classmates={classmates} />
          ))}
        </ul>
      )}
    </div>
  );
}
