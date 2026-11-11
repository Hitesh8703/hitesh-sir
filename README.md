# Hitesh Sir — Academic Portal

Private student portal: applications & approvals, subjects and PDF papers,
progress tracking and analytics.

**Start here → [SETUP.md](SETUP.md)** (step-by-step, beginner friendly).

Tech: Next.js 16 · TypeScript · Tailwind CSS · Supabase (Auth, Postgres + RLS, Storage) · Vercel.

```
npm install     # first time only
npm run dev     # http://localhost:3000
```

Key folders:
- `src/app` — pages (`/`, `/login`, `/apply`, `/set-password`, `/dashboard`, `/subjects`, `/admin/...`)
- `src/lib` — Supabase clients, auth checks, helpers
- `supabase/schema.sql` — database tables, Row Level Security, storage bucket
- `supabase/make-admin.sql` — makes Hitesh the single administrator
