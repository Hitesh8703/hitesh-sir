"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { homeFor } from "@/lib/auth";
import type { ActionState, Profile } from "@/lib/types";

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Please enter your email and password." };
  if (!isSupabaseConfigured())
    return { error: "The portal is not connected to its database yet. Please try again later." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    if (error?.code === "user_banned")
      return { error: "Your account is currently suspended. Please contact Hitesh Sir." };
    return { error: "Incorrect email or password." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, status, must_change_password, created_at")
    .eq("id", data.user.id)
    .single<Profile>();

  if (!profile || profile.status !== "active") {
    await supabase.auth.signOut();
    return { error: "Your account is not active. Please contact Hitesh Sir." };
  }

  redirect(homeFor(profile));
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
