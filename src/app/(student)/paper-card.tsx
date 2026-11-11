import { ProgressBadge } from "@/components/ui";
import { SubmitButton } from "@/components/form-bits";
import { formatBytes } from "@/lib/format";
import { setPaperProgress } from "./actions";
import type { StudentPaper } from "./data";

export function PaperCard({
  paper,
  classmates,
  showSubject = false,
}: {
  paper: StudentPaper;
  classmates: number;
  showSubject?: boolean;
}) {
  // Classmates = everyone except me.
  const mine = paper.status ? 1 : 0;
  const myDone = paper.status === "completed" ? 1 : 0;
  const othersViewed = Math.max(0, paper.viewed - mine);
  const othersDone = Math.max(0, paper.completed - myDone);

  return (
    <li className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-[11px] font-bold text-red-700 ring-1 ring-red-100">
          PDF
        </span>
        <div className="min-w-0">
          {showSubject && <p className="text-xs font-semibold tracking-wide text-gold-600 uppercase">{paper.subject_name}</p>}
          <p className="font-semibold">{paper.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <ProgressBadge status={paper.status} />
            <span className="text-xs text-ink-500">{formatBytes(paper.file_size)}</span>
          </div>
          <p className="mt-2 text-xs text-ink-600">
            <span className="font-medium text-ink-800">{othersViewed}</span> of {classmates} others viewed ·{" "}
            <span className="font-medium text-emerald-700">{othersDone}</span> completed
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        <a href={`/papers/${paper.id}/open`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
          Open
        </a>
        <a href={`/papers/${paper.id}/open?download=1`} className="btn btn-outline btn-sm">
          Download
        </a>
        <form action={setPaperProgress}>
          <input type="hidden" name="paperId" value={paper.id} />
          {paper.status === "completed" ? (
            <>
              <input type="hidden" name="status" value="in_progress" />
              <SubmitButton className="btn btn-ghost btn-sm" pendingText="Saving…">
                Undo completed
              </SubmitButton>
            </>
          ) : (
            <>
              <input type="hidden" name="status" value="completed" />
              <SubmitButton className="btn btn-success btn-sm" pendingText="Saving…">
                Mark as completed
              </SubmitButton>
            </>
          )}
        </form>
      </div>
    </li>
  );
}
