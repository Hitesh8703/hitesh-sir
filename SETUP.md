# Hitesh Sir — Setup Guide (for beginners)

Follow these steps **in order**. Each one says exactly where to click.
You never paste secret keys into code files — only into `.env.local`
(on your computer) and Vercel's settings (online). Both are private.

---

## ✅ Already done for you

- The website code is in this folder (Next.js + TypeScript + Tailwind).
- Homepage, Login, Apply, Set-password, Student dashboard, Admin dashboard,
  applications, subjects & PDFs, students, progress tracking, analytics.
- The database design with Row Level Security: `supabase/schema.sql`.

---

## Step 1 — Create a Supabase account and project

1. Go to **https://supabase.com** → click **Start your project** → sign up
   (signing in with GitHub or Google is easiest).
2. Click **New project**.
3. Fill in:
   - **Name:** `hitesh-sir`
   - **Database Password:** click **Generate a password**, then save it somewhere
     safe (a password manager). You won't need to give it to anyone, including me.
   - **Region:** choose the one closest to your students (e.g. *Mumbai* for India).
4. Click **Create new project** and wait ~2 minutes until it says it's ready.

## Step 2 — Build the database

1. In your Supabase project, click **SQL Editor** in the left sidebar.
2. Click **+ New query**.
3. On your computer, open the file `supabase/schema.sql` from this folder
   (right-click → Open with → Notepad), select everything (**Ctrl+A**), copy (**Ctrl+C**).
4. Paste it into the Supabase SQL editor (**Ctrl+V**) and click **Run**.
5. You should see **"Success. No rows returned"**. If you see a red error, copy
   the error text and send it to me (the error text is not secret).

## Step 3 — Turn OFF public sign-ups (important for security)

1. Left sidebar → **Authentication** → **Sign In / Providers**
   (on some versions: **Authentication → Providers**, or **Settings**).
2. Find **"Allow new users to sign up"** and switch it **OFF**. Click **Save**.

This guarantees nobody can create an account on their own. Accounts are only
created when you approve an application.

## Step 4 — Create your admin login (Hitesh)

1. Left sidebar → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter **your email** and a **strong password** (this is your admin password —
   keep it private). Tick **Auto Confirm User**. Click **Create user**.
3. Go to **SQL Editor** → **+ New query**. Open `supabase/make-admin.sql`,
   copy it, paste it in, and **replace both** `REPLACE-WITH-YOUR-EMAIL@example.com`
   with your email. Click **Run**.
4. The result at the bottom should show **one row** with `role = admin`.

## Step 5 — Connect the website to Supabase (your private `.env.local` file)

1. In this project folder, make a copy of `.env.example` and name the copy
   **`.env.local`** (exactly that name).
   *Tip:* in VS Code, right-click `.env.example` → Copy, then Paste, then rename.
2. In Supabase: click the **gear icon (Project Settings)** at the bottom of the left sidebar.
   - **Data API** (or **API**) → copy the **Project URL** → paste after
     `NEXT_PUBLIC_SUPABASE_URL=` in `.env.local`.
   - **API Keys** → copy the **Publishable key** (starts with `sb_publishable_`)
     → paste after `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=`.
     *(Older projects call this the `anon` `public` key — that works too.)*
   - **API Keys** → **Secret keys** → reveal and copy the secret key
     (starts with `sb_secret_`) → paste after `SUPABASE_SECRET_KEY=`.
     *(Older projects call this `service_role` — that works too.)*
     ⚠️ This key is like a master key. Never share it, never paste it in chat,
     never rename it to start with `NEXT_PUBLIC_`.
3. Set `ADMIN_EMAIL=` to the same email you used in Step 4.
4. Save the file.

`.env.local` is automatically excluded from GitHub, so it stays on your computer.

## Step 6 — How students get their login (no email service needed)

There is no email service. When you click **Approve** on an application:

1. The student's account is created.
2. A card appears at the top of the page with their **email** and a
   **temporary password**, plus a **Copy message** button that copies a
   ready-made message (website link, email, password).
3. Send that message to the student **privately** (WhatsApp, Instagram DM, etc.).
4. When they first log in, they **must** choose their own password.

The temporary password is shown **only once** and is never saved anywhere.
If you lose it, or a student forgets their password, go to **Students** →
**New password** to make a fresh one.

## Step 7 — Run the website on your computer

1. Open the project in VS Code, then open a terminal: menu **Terminal → New Terminal**.
2. Type this and press Enter:
   ```
   npm run dev
   ```
3. Open **http://localhost:3000** in your browser.
4. (If you changed `.env.local` while it was running: click in the terminal,
   press **Ctrl+C**, then run `npm run dev` again.)

## Step 8 — Test everything (checklist)

Do these in order and tick them off:

- [ ] Log in at `/login` with your admin email/password → you land on **/admin**.
- [ ] **Subjects & PDFs** → add a subject → **Manage PDFs** → upload a PDF.
- [ ] In a **private/incognito window**, go to `/apply` and apply with a test email
      (it can be any address you can type, e.g. a second email of yours).
- [ ] Back in admin → **Applications** → **Approve** → a card shows the
      temporary password → click **Copy message**.
- [ ] In the incognito window → log in with that email and temporary password → you are asked to
      set a permanent password.
- [ ] As the student: open a PDF (status becomes **Viewed / In Progress**),
      download it, **Mark as completed**, search for it.
- [ ] Admin **Overview** shows the student, the views and completions.
- [ ] Try visiting `/admin` as the student → you are sent back to the dashboard.

## Step 9 — Deploy to Vercel (go live)

1. Create a free **GitHub** account at https://github.com if you don't have one.
2. Create a free **Vercel** account at https://vercel.com → **Sign up with GitHub**.
3. Tell me when you're ready and I'll walk you through pushing the code to
   GitHub and importing it into Vercel, including adding each setting from
   `.env.local` under **Vercel → Project → Settings → Environment Variables**.

---

### Security summary

| Protection | How |
|---|---|
| Only Hitesh is admin | Database allows only one `admin` row **and** the email must match `ADMIN_EMAIL` |
| Students can't change roles | No update permission on profiles + a database trigger blocks role changes |
| No self-registration | Sign-ups disabled in Supabase; accounts created only by the approve action |
| Temporary passwords | Random 14-character password, shown once to the admin, never stored, must be changed at first login |
| Applications can't create accounts | The public form only inserts a *pending* row, via server code |
| Row Level Security | Enabled on every table; students only see/edit their own progress |
| Private PDFs | Private storage bucket; students get 10-minute signed links after a check |
| Admin routes protected | Proxy + server check on every admin page and every admin action |
| Secret keys hidden | Secret keys are only read in `server-only` files, never sent to browsers |
