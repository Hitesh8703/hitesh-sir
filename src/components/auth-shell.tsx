import Link from "next/link";
import { Logo } from "@/components/logo";

/** Two-column layout shared by the Login, Apply and Set-password pages. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-ink-900 p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-gold-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -left-24 size-[420px] rounded-full bg-ink-600/40 blur-3xl" />
        <Logo tone="light" />
        <div className="relative mt-auto max-w-md">
          <p className="eyebrow text-gold-300">Private academic portal</p>
          <blockquote className="mt-5 font-display text-3xl leading-snug">
            “Hehehe Skill Issue”
          </blockquote>
          <p className="mt-4 text-ink-300">— Hitesh Sir</p>
        </div>
        <div className="relative mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-8 text-sm text-ink-300">
          <div>
            <p className="font-display text-2xl text-white">Curated</p>
            <p>question papers</p>
          </div>
          <div>
            <p className="font-display text-2xl text-white">Tracked</p>
            <p>personal progress</p>
          </div>
          <div>
            <p className="font-display text-2xl text-white">Private</p>
            <p>approved students only</p>
          </div>
        </div>
      </aside>

      <main className="flex flex-col px-4 py-8 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between lg:justify-end">
          <span className="lg:hidden">
            <Logo />
          </span>
          <Link href="/" className="text-sm font-medium text-ink-600 hover:text-ink-900">
            ← Home
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-ink-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-sm text-ink-600">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
