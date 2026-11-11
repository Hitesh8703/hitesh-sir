"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks({ links }: { links: { href: string; label: string; count?: number }[] }) {
  const pathname = usePathname();
  const base = links[0]?.href;

  return (
    <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Main">
      {links.map((link) => {
        const active =
          link.href === base ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "border-gold-500 text-ink-900"
                : "border-transparent text-ink-500 hover:text-ink-800"
            }`}
          >
            {link.label}
            {!!link.count && (
              <span className="rounded-full bg-gold-500 px-1.5 py-0.5 text-[11px] leading-none font-bold text-ink-950">
                {link.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
