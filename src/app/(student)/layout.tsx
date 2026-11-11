import { AppHeader } from "@/components/app-header";
import { requireStudent } from "@/lib/auth";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireStudent();

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader
        home="/dashboard"
        name={profile.full_name || profile.email}
        links={[{ href: "/dashboard", label: "Dashboard" }, { href: "/subjects", label: "Subjects" }]}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
