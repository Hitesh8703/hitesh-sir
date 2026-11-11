import type { ProgressStatus } from "@/lib/types";
import { PROGRESS_LABEL } from "@/lib/format";

export function StatCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-2xl bg-ink-900 p-5 text-white shadow-lg shadow-ink-900/10"
          : "card p-5"
      }
    >
      <p className={`text-sm ${accent ? "text-ink-300" : "text-ink-500"}`}>{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold tracking-tight">{value}</p>
      {hint && <p className={`mt-1 text-xs ${accent ? "text-gold-300" : "text-ink-500"}`}>{hint}</p>}
    </div>
  );
}

export function ProgressBadge({ status }: { status: ProgressStatus | null }) {
  const key = status ?? "not_started";
  const styles = {
    not_started: "bg-ink-100 text-ink-600 ring-ink-200",
    in_progress: "bg-amber-50 text-amber-800 ring-amber-200",
    completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  }[key];
  const dot = {
    not_started: "bg-ink-400",
    in_progress: "bg-amber-500",
    completed: "bg-emerald-600",
  }[key];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${styles}`}
    >
      <span className={`size-1.5 rounded-full ${dot}`} />
      {PROGRESS_LABEL[key]}
    </span>
  );
}

export function ProgressBar({ value, tone = "gold" }: { value: number; tone?: "gold" | "green" | "ink" }) {
  const color = { gold: "bg-gold-500", green: "bg-emerald-600", ink: "bg-ink-800" }[tone];
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${color}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-300 bg-white/60 px-6 py-12 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-ink-600">{children}</div>}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-ink-600">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
