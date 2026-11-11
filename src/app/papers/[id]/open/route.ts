import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";

/**
 * Opens (or, with ?download=1, downloads) a paper.
 * 1. Checks the visitor is an approved, active student (or Hitesh).
 * 2. Records "Viewed / In Progress" for students (never downgrades "Completed").
 * 3. Redirects to a private signed link that expires after 10 minutes.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const download = request.nextUrl.searchParams.get("download") === "1";

  const current = await getCurrentUser();
  if (!current || current.profile.status !== "active") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (current.profile.must_change_password) {
    return NextResponse.redirect(new URL("/set-password", request.url));
  }

  const supabase = await createClient();
  // Row Level Security only returns the paper if this person may see it.
  const { data: paper } = await supabase
    .from("papers")
    .select("id, title, file_path")
    .eq("id", id)
    .maybeSingle();
  if (!paper) {
    return new NextResponse("Paper not found or you don't have access to it.", { status: 404 });
  }

  if (!isAdmin(current.profile)) {
    await supabase.from("paper_progress").upsert(
      { student_id: current.user.id, paper_id: paper.id, status: "in_progress" },
      { onConflict: "student_id,paper_id", ignoreDuplicates: true },
    );
  }

  const safeName = `${paper.title.replace(/[^\w\- ]+/g, "").trim() || "paper"}.pdf`;
  const { data: signed, error } = await supabase.storage
    .from("papers")
    .createSignedUrl(paper.file_path, 600, download ? { download: safeName } : undefined);

  if (error || !signed) {
    return new NextResponse("This PDF could not be opened right now. Please try again.", { status: 500 });
  }
  return NextResponse.redirect(signed.signedUrl, 303);
}
