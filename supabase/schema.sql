-- =====================================================================
--  HITESH SIR — DATABASE SETUP
--  Run this ONCE in Supabase: Dashboard → SQL Editor → New query →
--  paste this whole file → Run.
--  It is safe to run again: it drops and recreates policies/functions,
--  but it does NOT delete your data.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------

-- One row per login account (Hitesh + every approved student).
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  email                text not null unique,
  full_name            text not null default '',
  role                 text not null default 'student' check (role in ('admin', 'student')),
  status               text not null default 'active'  check (status in ('active', 'suspended')),
  must_change_password boolean not null default true,
  created_at           timestamptz not null default now()
);

-- The database itself guarantees there can only ever be ONE admin.
create unique index if not exists profiles_single_admin
  on public.profiles (role) where role = 'admin';

-- Applications submitted from the public "Apply" page.
create table if not exists public.applications (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null check (char_length(full_name) between 2 and 120),
  email       text not null check (char_length(email) between 3 and 254),
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz,
  student_id  uuid references public.profiles(id) on delete set null
);

-- Only one pending application per email address.
create unique index if not exists applications_one_pending_per_email
  on public.applications (lower(email)) where status = 'pending';

create table if not exists public.subjects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  description text not null default '' check (char_length(description) <= 500),
  created_at  timestamptz not null default now()
);

create table if not exists public.papers (
  id         uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 200),
  file_path  text not null unique,
  file_name  text not null,
  file_size  bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists papers_subject_idx on public.papers (subject_id);

-- One row per (student, paper) once the student has opened it.
-- No row = "Not Started".
create table if not exists public.paper_progress (
  student_id      uuid not null references public.profiles(id) on delete cascade,
  paper_id        uuid not null references public.papers(id) on delete cascade,
  status          text not null check (status in ('in_progress', 'completed')),
  first_viewed_at timestamptz not null default now(),
  completed_at    timestamptz,
  updated_at      timestamptz not null default now(),
  primary key (student_id, paper_id)
);
create index if not exists paper_progress_paper_idx on public.paper_progress (paper_id);

-- ---------------------------------------------------------------------
-- 2. HELPER FUNCTIONS
-- ---------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

create or replace function public.is_active_student()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'student' and status = 'active'
      and must_change_password = false
  );
$$;

-- Creates a profile automatically whenever an account is created.
-- The role is ALWAYS 'student' here; nothing a user sends can change that.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, lower(new.email), coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Blocks logged-in users from ever changing a role or email through the API,
-- even if a policy were misconfigured later. (Trusted server code and the
-- SQL editor are unaffected.)
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if new.role is distinct from old.role then
      raise exception 'Changing roles is not allowed.';
    end if;
    if new.email is distinct from old.email then
      raise exception 'Changing email here is not allowed.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_fields on public.profiles;
create trigger protect_profile_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- Students may only set their progress to valid values with sane timestamps.
create or replace function public.touch_progress()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if new.status = 'completed' and new.completed_at is null then
    new.completed_at := now();
  elsif new.status = 'in_progress' then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists touch_progress on public.paper_progress;
create trigger touch_progress
  before insert or update on public.paper_progress
  for each row execute function public.touch_progress();

-- ---------------------------------------------------------------------
-- 3. AGGREGATE STATISTICS (no personal data is exposed)
-- ---------------------------------------------------------------------

-- Number of approved, active students.
create or replace function public.get_student_count()
returns integer
language sql stable security definer set search_path = ''
as $$
  select case
    when public.is_admin() or public.is_active_student() then
      (select count(*)::int from public.profiles where role = 'student' and status = 'active')
    else 0
  end;
$$;

-- For each paper: how many active students viewed it and how many completed it.
create or replace function public.get_paper_stats()
returns table (paper_id uuid, viewed_count integer, completed_count integer)
language sql stable security definer set search_path = ''
as $$
  select
    p.id,
    count(pr.id)::int,
    (count(pr.id) filter (where pp.status = 'completed'))::int
  from public.papers p
  left join public.paper_progress pp on pp.paper_id = p.id
  left join public.profiles pr
    on pr.id = pp.student_id and pr.role = 'student' and pr.status = 'active'
  where public.is_admin() or public.is_active_student()
  group by p.id;
$$;

revoke execute on function public.get_student_count() from public, anon;
revoke execute on function public.get_paper_stats()   from public, anon;
grant  execute on function public.get_student_count() to authenticated;
grant  execute on function public.get_paper_stats()   to authenticated;

-- ---------------------------------------------------------------------
-- 4. TABLE PERMISSIONS
-- ---------------------------------------------------------------------

revoke all on public.profiles, public.applications, public.subjects,
              public.papers, public.paper_progress from anon;

grant select                         on public.profiles       to authenticated;
grant select, update, delete         on public.applications   to authenticated;
grant select, insert, update, delete on public.subjects       to authenticated;
grant select, insert, update, delete on public.papers         to authenticated;
grant select, insert, update         on public.paper_progress to authenticated;

grant all on public.profiles, public.applications, public.subjects,
             public.papers, public.paper_progress to service_role;

-- ---------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------

alter table public.profiles       enable row level security;
alter table public.applications   enable row level security;
alter table public.subjects       enable row level security;
alter table public.papers         enable row level security;
alter table public.paper_progress enable row level security;

-- PROFILES: you can read your own row; Hitesh can read all.
-- Nobody can insert/update/delete through the API (no policy = denied).
drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

-- APPLICATIONS: only Hitesh can see and manage them.
-- The public cannot read or write this table directly at all.
drop policy if exists "applications: admin read"   on public.applications;
drop policy if exists "applications: admin update" on public.applications;
drop policy if exists "applications: admin delete" on public.applications;
create policy "applications: admin read" on public.applications
  for select to authenticated using ((select public.is_admin()));
create policy "applications: admin update" on public.applications
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "applications: admin delete" on public.applications
  for delete to authenticated using ((select public.is_admin()));

-- SUBJECTS: active students + Hitesh can read; only Hitesh can change.
drop policy if exists "subjects: read"         on public.subjects;
drop policy if exists "subjects: admin insert" on public.subjects;
drop policy if exists "subjects: admin update" on public.subjects;
drop policy if exists "subjects: admin delete" on public.subjects;
create policy "subjects: read" on public.subjects
  for select to authenticated
  using ((select public.is_admin()) or (select public.is_active_student()));
create policy "subjects: admin insert" on public.subjects
  for insert to authenticated with check ((select public.is_admin()));
create policy "subjects: admin update" on public.subjects
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "subjects: admin delete" on public.subjects
  for delete to authenticated using ((select public.is_admin()));

-- PAPERS: same rules as subjects.
drop policy if exists "papers: read"         on public.papers;
drop policy if exists "papers: admin insert" on public.papers;
drop policy if exists "papers: admin update" on public.papers;
drop policy if exists "papers: admin delete" on public.papers;
create policy "papers: read" on public.papers
  for select to authenticated
  using ((select public.is_admin()) or (select public.is_active_student()));
create policy "papers: admin insert" on public.papers
  for insert to authenticated with check ((select public.is_admin()));
create policy "papers: admin update" on public.papers
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "papers: admin delete" on public.papers
  for delete to authenticated using ((select public.is_admin()));

-- PROGRESS: a student reads/writes ONLY their own rows; Hitesh can read all.
drop policy if exists "progress: read own or admin" on public.paper_progress;
drop policy if exists "progress: insert own"        on public.paper_progress;
drop policy if exists "progress: update own"        on public.paper_progress;
create policy "progress: read own or admin" on public.paper_progress
  for select to authenticated
  using (student_id = (select auth.uid()) or (select public.is_admin()));
create policy "progress: insert own" on public.paper_progress
  for insert to authenticated
  with check (student_id = (select auth.uid()) and (select public.is_active_student()));
create policy "progress: update own" on public.paper_progress
  for update to authenticated
  using (student_id = (select auth.uid()) and (select public.is_active_student()))
  with check (student_id = (select auth.uid()) and (select public.is_active_student()));

-- ---------------------------------------------------------------------
-- 6. PRIVATE PDF STORAGE
-- ---------------------------------------------------------------------

-- Private bucket: files are never publicly reachable. Students get a
-- short-lived signed link only after the server checks they're approved.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('papers', 'papers', false, 52428800, array['application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "papers bucket: admin manage"   on storage.objects;
drop policy if exists "papers bucket: students read"  on storage.objects;

create policy "papers bucket: admin manage" on storage.objects
  for all to authenticated
  using (bucket_id = 'papers' and (select public.is_admin()))
  with check (bucket_id = 'papers' and (select public.is_admin()));

create policy "papers bucket: students read" on storage.objects
  for select to authenticated
  using (bucket_id = 'papers' and (select public.is_active_student()));
