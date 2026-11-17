"use client";

import { useRouter } from "next/navigation";

/**
 * Opens the PDF in a new tab. Opening records the paper as "Viewed / In Progress",
 * so after a moment we refresh this page to reveal the "Mark as completed" button.
 */
export function OpenPaperButton({ paperId, opened }: { paperId: string; opened: boolean }) {
  const router = useRouter();
  return (
    <a
      href={`/papers/${paperId}/open`}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-primary btn-sm"
      onClick={() => {
        if (!opened) setTimeout(() => router.refresh(), 1500);
      }}
    >
      Open
    </a>
  );
}
