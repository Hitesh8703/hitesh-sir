"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createPaper, renamePaper, replacePaperFile } from "../actions";
import { FormAlert, SubmitButton } from "@/components/form-bits";
import type { ActionState } from "@/lib/types";

const MAX_BYTES = 50 * 1024 * 1024;

function checkFile(file: File | null | undefined): string | null {
  if (!file) return "Please choose a PDF file.";
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Only PDF files can be uploaded.";
  if (file.size > MAX_BYTES) return "This PDF is larger than 50 MB. Please compress it first.";
  return null;
}

async function uploadToStorage(subjectId: string, file: File) {
  const supabase = createClient();
  const path = `${subjectId}/${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage
    .from("papers")
    .upload(path, file, { contentType: "application/pdf", upsert: false });
  return { supabase, path, error };
}

export function PaperUploader({ subjectId }: { subjectId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<ActionState>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    const problem = checkFile(file);
    if (problem || !file) return setState({ error: problem ?? "Please choose a PDF file." });

    const finalTitle = title.trim() || file.name.replace(/\.pdf$/i, "");
    setBusy(true);
    setState(null);

    const { supabase, path, error } = await uploadToStorage(subjectId, file);
    if (error) {
      setBusy(false);
      return setState({ error: `Upload failed: ${error.message}` });
    }

    const result = await createPaper({ subjectId, title: finalTitle, path, fileName: file.name, size: file.size });
    if (result?.error) await supabase.storage.from("papers").remove([path]);

    setBusy(false);
    setState(result);
    if (!result?.error) {
      setTitle("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5">
      <p className="font-display text-lg font-semibold">Upload a PDF</p>
      <div>
        <label htmlFor="paper-title" className="label">
          Paper title
        </label>
        <input
          id="paper-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="input"
          placeholder="e.g. 2024 Board Paper — Set A"
        />
        <p className="mt-1.5 text-xs text-ink-500">Leave empty to use the file name.</p>
      </div>
      <div>
        <label htmlFor="paper-file" className="label">
          PDF file <span className="font-normal text-ink-400">(max 50 MB)</span>
        </label>
        <input
          id="paper-file"
          ref={fileRef}
          type="file"
          accept="application/pdf,.pdf"
          className="block w-full text-sm text-ink-600 file:mr-3 file:rounded-lg file:border-0 file:bg-ink-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-ink-800"
        />
      </div>
      <FormAlert state={state} />
      <button type="submit" disabled={busy} className="btn btn-gold w-full">
        {busy ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
            Uploading…
          </>
        ) : (
          "Upload PDF"
        )}
      </button>
    </form>
  );
}

export function ReplaceFileButton({ paperId, subjectId }: { paperId: string; subjectId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<ActionState>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const problem = checkFile(file);
    if (problem || !file) return setState({ error: problem ?? "Please choose a PDF file." });
    if (!window.confirm(`Replace the current PDF with “${file.name}”?`)) return;

    setBusy(true);
    setState(null);
    const { supabase, path, error } = await uploadToStorage(subjectId, file);
    if (error) {
      setBusy(false);
      return setState({ error: `Upload failed: ${error.message}` });
    }
    const result = await replacePaperFile({ paperId, path, fileName: file.name, size: file.size });
    if (result?.error) await supabase.storage.from("papers").remove([path]);
    setBusy(false);
    setState(result);
    if (!result?.error) router.refresh();
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={onChange} />
      <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="btn btn-outline btn-sm">
        {busy ? "Replacing…" : "Replace PDF"}
      </button>
      {state && (
        <div className="basis-full">
          <FormAlert state={state} />
        </div>
      )}
    </>
  );
}

export function RenamePaperForm({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(async (prev: ActionState, fd: FormData) => {
    const result = await renamePaper(prev, fd);
    if (result?.success) setOpen(false);
    return result;
  }, null);

  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-outline btn-sm">
        Rename
      </button>
    );

  return (
    <form action={formAction} className="flex basis-full flex-col gap-2 sm:flex-row">
      <input type="hidden" name="id" value={id} />
      <input name="title" defaultValue={title} required maxLength={200} className="input" aria-label="Paper title" />
      <div className="flex gap-2">
        <SubmitButton className="btn btn-primary btn-sm" pendingText="Saving…">
          Save
        </SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost btn-sm">
          Cancel
        </button>
      </div>
      {state?.error && <FormAlert state={state} />}
    </form>
  );
}
