import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/form-bits";
import { formatDate } from "@/lib/format";
import type { Application, ApplicationStatus } from "@/lib/types";
import { ApplicationActions } from "./application-actions";
import { deleteApplication } from "./actions";

export const metadata: Metadata = { title: "Applications" };

const TABS: { key: ApplicationStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status: raw } = await searchParams;
  const status: ApplicationStatus = TABS.some((t) => t.key === raw) ? (raw as ApplicationStatus) : "pending";

  const supabase = await createClient();
  const { data } = await supabase
    .from("applications")
    .select("id, full_name, email, status, created_at, reviewed_at")
    .eq("status", status)
    .order("created_at", { ascending: status === "pending" });
  const applications = (data ?? []) as Application[];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admissions"
        title="Applications"
        description="Approve to create a student account. You'll get a temporary password to send them privately. Reject to decline."
      />

      <div className="inline-flex rounded-xl border border-ink-200 bg-white p-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/applications?status=${t.key}`}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium ${
              status === t.key ? "bg-ink-900 text-white" : "text-ink-600 hover:text-ink-900"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {applications.length === 0 ? (
        <EmptyState title={`No ${status} applications`}>
          {status === "pending" ? "New applications from the Apply page will appear here." : null}
        </EmptyState>
      ) : (
        <ul className="card divide-y divide-ink-100">
          {applications.map((a) => (
            <li key={a.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold">{a.full_name}</p>
                <p className="truncate text-sm text-ink-600">{a.email}</p>
                <p className="mt-1 text-xs text-ink-500">
                  Applied {formatDate(a.created_at)}
                  {a.reviewed_at && ` · Reviewed ${formatDate(a.reviewed_at)}`}
                </p>
              </div>
              {a.status === "pending" ? (
                <ApplicationActions id={a.id} name={a.full_name} />
              ) : (
                <form action={deleteApplication}>
                  <input type="hidden" name="id" value={a.id} />
                  <SubmitButton className="btn btn-ghost btn-sm" pendingText="Removing…" confirmMessage="Remove this record from the list? (This does not affect any student account.)">
                    Remove record
                  </SubmitButton>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
