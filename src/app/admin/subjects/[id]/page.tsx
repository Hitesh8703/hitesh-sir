import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/form-bits";
import { formatBytes, formatDate } from "@/lib/format";
import type { Paper, PaperStat, Subject } from "@/lib/types";
import { deletePaper } from "../actions";
import { PaperUploader, RenamePaperForm, ReplaceFileButton } from "./paper-tools";

export const metadata: Metadata = { title: "Manage PDFs" };

export default async function AdminSubjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: subject } = await supabase
    .from("subjects")
    .select("id, name, description, created_at")
    .eq("id", id)
    .maybeSingle<Subject>();
  if (!subject) notFound();

  const [{ data: paperRows }, { data: statRows }] = await Promise.all([
    supabase
      .from("papers")
      .select("id, subject_id, title, file_path, file_name, file_size, created_at, updated_at")
      .eq("subject_id", id)
      .order("created_at", { ascending: false }),
    supabase.rpc("get_paper_stats"),
  ]);
  const papers = (paperRows ?? []) as Paper[];
  const stats = new Map(((statRows ?? []) as PaperStat[]).map((s) => [s.paper_id, s]));

  return (
    <div className="space-y-8">
      <Link href="/admin/subjects" className="text-sm font-medium text-ink-600 hover:text-ink-900">
        ← All subjects
      </Link>
      <PageHeader eyebrow="Subject" title={subject.name} description={subject.description || undefined} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="order-2 lg:order-1">
          {papers.length === 0 ? (
            <EmptyState title="No PDFs in this subject yet">Upload the first paper using the form.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {papers.map((p) => {
                const s = stats.get(p.id);
                return (
                  <li key={p.id} className="card p-5">
                    <div className="flex items-start gap-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-[11px] font-bold text-red-700 ring-1 ring-red-100">
                        PDF
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{p.title}</p>
                        <p className="truncate text-xs text-ink-500">
                          {p.file_name} · {formatBytes(p.file_size)} · updated {formatDate(p.updated_at)}
                        </p>
                        <p className="mt-1 text-xs text-ink-600">
                          {s?.viewed_count ?? 0} viewed · {s?.completed_count ?? 0} completed
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a href={`/papers/${p.id}/open`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                        Preview
                      </a>
                      <RenamePaperForm id={p.id} title={p.title} />
                      <ReplaceFileButton paperId={p.id} subjectId={subject.id} />
                      <form action={deletePaper}>
                        <input type="hidden" name="id" value={p.id} />
                        <SubmitButton
                          className="btn btn-danger btn-sm"
                          pendingText="Deleting…"
                          confirmMessage={`Delete “${p.title}”? The PDF and all student progress on it will be removed. This cannot be undone.`}
                        >
                          Delete
                        </SubmitButton>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="order-1 lg:order-2">
          <PaperUploader subjectId={subject.id} />
        </div>
      </div>
    </div>
  );
}
