-- public_stats.sql
-- شغّل هذا الملف مرة واحدة داخل Supabase SQL Editor.
-- الهدف: جعل عدادات الواجهة العامة حقيقية ومقروءة من قاعدة البيانات بدون كشف جدول auth.users للواجهة.

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.user_profiles;
create policy "Users can read their own profile"
  on public.user_profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can update their own activity" on public.user_profiles;
create policy "Users can update their own activity"
  on public.user_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.user_profiles (id, email, full_name, created_at, last_seen_at)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.created_at, now()),
    now()
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(public.user_profiles.full_name, ''), excluded.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
after insert on auth.users
for each row
execute function public.handle_new_user_profile();

insert into public.user_profiles (id, email, full_name, created_at, last_seen_at)
select
  u.id,
  lower(u.email),
  coalesce(u.raw_user_meta_data->>'full_name', ''),
  coalesce(u.created_at, now()),
  now()
from auth.users u
on conflict (id) do nothing;

create or replace function public.touch_user_activity()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  update public.user_profiles
     set last_seen_at = now()
   where id = auth.uid();
end;
$$;

grant execute on function public.touch_user_activity() to authenticated;

create or replace function public.get_public_platform_stats()
returns table (
  total_joined integer,
  active_now integer,
  completed_count integer,
  remaining_seats integer
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  batch_capacity integer := 250;
begin
  return query
  with total_users as (
    select count(*)::integer as total
    from public.user_profiles
  ),
  active_users as (
    select count(*)::integer as active
    from public.user_profiles
    where last_seen_at >= now() - interval '10 minutes'
  ),
  completed_users as (
    select count(*)::integer as completed
    from (
      select user_id
      from public.user_progress
      where status = 'completed'
      group by user_id
      having count(*) >= 168
    ) x
  )
  select
    total_users.total,
    active_users.active,
    completed_users.completed,
    greatest(batch_capacity - total_users.total, 0)
  from total_users, active_users, completed_users;
end;
$$;

grant execute on function public.get_public_platform_stats() to anon, authenticated;
