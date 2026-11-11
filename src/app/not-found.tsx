import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <div>
        <p className="font-display text-6xl font-semibold text-gold-500">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-ink-600">This page doesn&apos;t exist, or you don&apos;t have access to it.</p>
      </div>
      <Link href="/" className="btn btn-primary">
        Back to home
      </Link>
    </div>
  );
}
