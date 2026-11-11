import Link from "next/link";
import { Logo } from "@/components/logo";

const features = [
  {
    title: "Curated papers",
    body: "Every subject and question paper is chosen and uploaded by Hitesh Sir — open online or download as PDF.",
    icon: (
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm7 0v5h5M9 13h6M9 17h6" />
    ),
  },
  {
    title: "Your progress, tracked",
    body: "Each paper shows Not Started, In Progress or Completed, so you always know what to attempt next.",
    icon: <path d="M4 12.5 9 17.5 20 6.5" />,
  },
  {
    title: "Learn alongside classmates",
    body: "See how many classmates have viewed and completed each paper — without anyone's personal details.",
    icon: (
      <path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm13 9v-1a4 4 0 0 0-3-3.87M16 4.13a3 3 0 0 1 0 5.74" />
    ),
  },
];

const steps = [
  { n: "01", title: "Apply", body: "Send your full name and email address." },
  { n: "02", title: "Get approved", body: "Hitesh Sir personally reviews every application." },
  { n: "03", title: "Get your login", body: "Hitesh Sir sends you a private, one-time password." },
  { n: "04", title: "Start learning", body: "Set your own password and open your papers." },
];

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-ink-200/60 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost btn-sm sm:px-4 sm:py-2 sm:text-sm">
              Login
            </Link>
            <Link href="/apply" className="btn btn-primary btn-sm sm:px-4 sm:py-2 sm:text-sm">
              Apply
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-[420px] max-w-4xl rounded-full bg-gold-300/25 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 sm:px-6 sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
            <div>
              <p className="eyebrow">Private academic portal</p>
              <h1 className="mt-4 font-display text-[2.6rem] leading-[1.08] font-semibold tracking-tight text-ink-950 sm:text-6xl">
                Study smarter with <span className="italic text-gold-600">Hitesh Sir</span>.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">
                One calm, focused place for every subject, every question paper and every step of
                your progress — reserved for approved students.
              </p>

              <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap">
                <Link href="/login" className="btn btn-primary btn-lg">
                  Login
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
                <Link href="/apply" className="btn btn-gold btn-lg">
                  Apply for access
                </Link>
              </div>
              <p className="mt-4 text-sm text-ink-500">
                Already a student? Log in. New here? Apply — accounts are created only after approval.
              </p>
            </div>

            {/* Preview card */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute -inset-3 -rotate-2 rounded-[28px] bg-ink-900/5" />
              <div className="card relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-ink-500">Your progress</p>
                    <p className="font-display text-2xl font-semibold">Physics</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
                    64% complete
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full w-[64%] rounded-full bg-gold-500" />
                </div>
                <ul className="mt-6 space-y-3">
                  {[
                    ["Mechanics — Paper 1", "Completed", "bg-emerald-600"],
                    ["Thermodynamics — Paper 2", "In Progress", "bg-amber-500"],
                    ["Optics — Paper 3", "Not Started", "bg-ink-300"],
                  ].map(([title, status, dot]) => (
                    <li key={title} className="flex items-center justify-between rounded-xl border border-ink-100 bg-paper/60 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-lg bg-white text-[10px] font-bold text-red-700 ring-1 ring-ink-200">
                          PDF
                        </span>
                        <span className="text-sm font-medium">{title}</span>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs text-ink-600">
                        <span className={`size-1.5 rounded-full ${dot}`} />
                        {status}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-xs text-ink-500">Example preview — your real papers appear after login.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-y border-ink-200/60 bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.title}>
                <span className="grid size-11 place-items-center rounded-xl bg-ink-900 text-gold-400">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {f.icon}
                  </svg>
                </span>
                <h2 className="mt-4 font-display text-xl font-semibold">{f.title}</h2>
                <p className="mt-2 leading-relaxed text-ink-600">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="eyebrow">How to join</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Four simple steps
          </h2>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <li key={s.n} className="card p-6">
                <p className="font-display text-sm font-semibold text-gold-600">{s.n}</p>
                <p className="mt-3 text-lg font-semibold">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">{s.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-3xl bg-ink-900 p-8 text-white sm:flex-row sm:items-center sm:p-10">
            <div>
              <p className="font-display text-2xl font-semibold">Ready to begin?</p>
              <p className="mt-1 text-ink-300">Applications are reviewed personally by Hitesh Sir.</p>
            </div>
            <div className="flex w-full gap-3 sm:w-auto">
              <Link href="/login" className="btn flex-1 border border-white/20 text-white hover:bg-white/10 sm:flex-none">
                Login
              </Link>
              <Link href="/apply" className="btn btn-gold flex-1 sm:flex-none">
                Apply
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-200/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-ink-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Hitesh Sir. All rights reserved.</p>
          <p>Private portal for approved students.</p>
        </div>
      </footer>
    </div>
  );
}
