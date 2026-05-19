create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_index integer not null check (month_index between 1 and 6),
  week_index integer not null check (week_index between 1 and 4),
  day_index integer not null check (day_index between 1 and 7),
  status text not null default 'started' check (status in ('started', 'completed')),
  completed_at timestamptz,
  last_opened_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month_index, week_index, day_index)
);

alter table public.user_progress enable row level security;

create policy "Students can read their own progress"
  on public.user_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Students can insert their own progress"
  on public.user_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Students can update their own progress"
  on public.user_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists user_progress_user_path_idx
  on public.user_progress (user_id, month_index, week_index, day_index);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_progress_updated_at on public.user_progress;

create trigger set_user_progress_updated_at
before update on public.user_progress
for each row
execute function public.set_updated_at();
