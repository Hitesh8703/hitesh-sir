"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * "Open" / "Download" link for a paper. Opening or downloading records the paper as
 * "Viewed / In Progress" on the server. Once that has happened we refresh this page,
 * which reveals the "Mark as completed" button:
 *  - when the student comes back to this tab (after reading the PDF), and
 *  - as a backup, a few seconds after clicking (for downloads that stay on this tab).
 */
export function PaperLink({
  paperId,
  opened,
  download = false,
  className,
  children,
}: {
  paperId: string;
  opened: boolean;
  download?: boolean;
  className: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const waiting = useRef(false);

  useEffect(() => {
    if (opened) return;
    const refreshIfWaiting = () => {
      if (waiting.current && document.visibilityState === "visible") {
        waiting.current = false;
        router.refresh();
      }
    };
    document.addEventListener("visibilitychange", refreshIfWaiting);
    window.addEventListener("focus", refreshIfWaiting);
    return () => {
      document.removeEventListener("visibilitychange", refreshIfWaiting);
      window.removeEventListener("focus", refreshIfWaiting);
    };
  }, [opened, router]);

  return (
    <a
      href={`/papers/${paperId}/open${download ? "?download=1" : ""}`}
      {...(download ? {} : { target: "_blank", rel: "noopener noreferrer" })}
      className={className}
      onClick={() => {
        if (opened) return;
        waiting.current = true;
        setTimeout(() => {
          if (waiting.current) router.refresh();
        }, 4000);
      }}
    >
      {children}
    </a>
  );
}
