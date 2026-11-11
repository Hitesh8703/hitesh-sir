import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/form-bits";
import { EditSubjectForm, NewSubjectForm } from "./subject-forms";
import { deleteSubject } from "./actions";

export const metadata: Metadata = { title: "Subjects & PDFs" };

type Row = { id: string; name: string; description: string; papers: { count: number }[] };

export default async function AdminSubjectsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("subjects")
    .select("id, name, description, papers(count)")
    .order("name");
  const subjects = (data ?? []) as Row[];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Content"
        title="Subjects & PDFs"
        description="Create subjects, then open a subject to upload, replace or delete its PDF papers."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="order-2 lg:order-1">
          {subjects.length === 0 ? (
            <EmptyState title="No subjects yet">Add your first subject using the form.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {subjects.map((s) => {
                const count = s.papers?.[0]?.count ?? 0;
                return (
                  <li key={s.id} className="card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-lg font-semibold">{s.name}</p>
                        {s.description && <p className="text-sm text-ink-600">{s.description}</p>}
                        <p className="mt-1 text-xs text-ink-500">
                          {count} {count === 1 ? "PDF" : "PDFs"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/subjects/${s.id}`} className="btn btn-primary btn-sm">
                          Manage PDFs
                        </Link>
                        <form action={deleteSubject}>
                          <input type="hidden" name="id" value={s.id} />
                          <SubmitButton
                            className="btn btn-danger btn-sm"
                            pendingText="Deleting…"
                            confirmMessage={`Delete “${s.name}” and all ${count} of its PDFs? Student progress on these papers will also be removed. This cannot be undone.`}
                          >
                            Delete
                          </SubmitButton>
                        </form>
                      </div>
                    </div>
                    <EditSubjectForm id={s.id} name={s.name} description={s.description} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="order-1 lg:order-2">
          <NewSubjectForm />
        </div>
      </div>
    </div>
  );
}
