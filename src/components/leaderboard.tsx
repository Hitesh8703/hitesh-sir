import type { LeaderboardRow, RecentCompletion } from "@/lib/leaderboard";

const MEDALS = ["🥇", "🥈", "🥉"];

function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

/** "Papers completed" leaderboard plus a feed of who completed what recently. */
export function Leaderboard({
  rows,
  recent,
  totalPapers,
  currentUserId,
}: {
  rows: LeaderboardRow[];
  recent: RecentCompletion[];
  totalPapers: number;
  currentUserId?: string;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="card p-6">
        <h2 className="font-display text-xl font-semibold">Papers completed leaderboard</h2>
        <p className="text-sm text-ink-600">Out of {totalPapers} papers in total.</p>
        {rows.length === 0 ? (
          <p className="mt-4 text-sm text-ink-600">No students yet.</p>
        ) : (
          <ol className="mt-5 space-y-2">
            {rows.map((r, i) => {
              const me = r.id === currentUserId;
              const medal = r.completed > 0 ? MEDALS[i] : undefined;
              return (
                <li
                  key={r.id}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 ${me ? "bg-gold-200/40 ring-1 ring-gold-300" : ""}`}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink-100 text-sm font-semibold text-ink-700">
                    {medal ?? i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {r.name}
                    {me && <span className="ml-1.5 text-xs font-semibold text-gold-700">(you)</span>}
                  </span>
                  <span className="shrink-0 text-sm text-ink-600">
                    <span className="font-display text-lg font-semibold text-emerald-700">{r.completed}</span> completed
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-display text-xl font-semibold">Recently completed</h2>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-ink-600">Nobody has completed a paper yet. Be the first!</p>
        ) : (
          <ul className="mt-5 space-y-4">
            {recent.map((c, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald-500" />
                <div className="min-w-0">
                  <p>
                    <span className="font-semibold">{c.studentName}</span> completed{" "}
                    <span className="font-medium">{c.paperTitle}</span>
                  </p>
                  <p className="text-xs text-ink-500">
                    {c.subjectName && `${c.subjectName} · `}
                    {timeAgo(c.completedAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
