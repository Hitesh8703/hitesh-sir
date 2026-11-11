import Link from "next/link";

export function Logo({ href = "/", tone = "dark" }: { href?: string; tone?: "dark" | "light" }) {
  const text = tone === "light" ? "text-white" : "text-ink-900";
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5" aria-label="Hitesh Sir home">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 font-display text-base font-semibold text-ink-950 shadow-sm ring-1 ring-gold-700/20">
        HS
      </span>
      <span className={`font-display text-xl font-semibold tracking-tight ${text}`}>
        Hitesh <span className="text-gold-500">Sir</span>
      </span>
    </Link>
  );
}
