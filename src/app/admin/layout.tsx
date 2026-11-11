import { AppHeader } from "@/components/app-header";
import { CredentialsProvider } from "@/components/credentials";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();
  const supabase = await createClient();
  const { count: pending } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader
        home="/admin"
        name={profile.full_name || "Hitesh"}
        badge="Administrator"
        links={[
          { href: "/admin", label: "Overview" },
          { href: "/admin/applications", label: "Applications", count: pending ?? 0 },
          { href: "/admin/subjects", label: "Subjects & PDFs" },
          { href: "/admin/students", label: "Students" },
        ]}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <CredentialsProvider>{children}</CredentialsProvider>
      </main>
    </div>
  );
}
