import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client with the SECRET key. It bypasses Row Level Security, so it is
 * only ever used on the server, and only after the caller has been verified
 * (for example with requireAdmin()). The "server-only" import above makes the
 * build fail if this file is ever imported into browser code.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error(
      "SUPABASE_SECRET_KEY is missing. Add it to .env.local (and to Vercel) — see SETUP.md.",
    );
  }
  return createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
