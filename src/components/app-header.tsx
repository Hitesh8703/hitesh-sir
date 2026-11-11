import { Logo } from "@/components/logo";
import { NavLinks } from "@/components/nav-links";
import { signOut } from "@/app/login/actions";

export function AppHeader({
  home,
  links,
  name,
  badge,
}: {
  home: string;
  links: { href: string; label: string; count?: number }[];
  name: string;
  badge?: string;
}) {
  const initials =
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-20 border-b border-ink-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Logo href={home} />
          {badge && (
            <span className="hidden rounded-full bg-ink-900 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-gold-300 uppercase sm:inline">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-right text-sm sm:block">
            <span className="block font-medium leading-tight">{name}</span>
          </span>
          <span className="grid size-9 place-items-center rounded-full bg-ink-100 text-sm font-semibold text-ink-700">
            {initials}
          </span>
          <form action={signOut}>
            <button type="submit" className="btn btn-outline btn-sm">
              Sign out
            </button>
          </form>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-2 sm:px-4">
        <NavLinks links={links} />
      </div>
    </header>
  );
}
