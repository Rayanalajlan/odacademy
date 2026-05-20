-- ملف جدول تقدم الطلاب في منصة OD Academy
-- هذا الملف آمن للتشغيل أكثر من مرة.
-- الهدف:
-- 1) إنشاء جدول user_progress إذا لم يكن موجودًا.
-- 2) تعديل الجدول القديم إن كان يستخدم started / last_opened_at.
-- 3) تفعيل RLS حتى يرى كل طالب تقدمه فقط.
-- 4) جعل الكود متوافقًا مع progressService.js.

create extension if not exists pgcrypto;

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  month_index integer not null check (month_index between 1 and 6),
  week_index integer not null check (week_index between 1 and 4),
  day_index integer not null check (day_index between 1 and 7),

  -- مهم:
  -- الكود في React يستخدم opened و completed، وليس started.
  status text not null default 'opened',

  opened_at timestamptz default now(),
  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, month_index, week_index, day_index)
);

-- إضافة الأعمدة المطلوبة لو كان الجدول قديمًا.
-- IF NOT EXISTS يمنع الخطأ إذا كان العمود موجودًا مسبقًا.
alter table public.user_progress
  add column if not exists opened_at timestamptz;

alter table public.user_progress
  add column if not exists completed_at timestamptz;

alter table public.user_progress
  add column if not exists created_at timestamptz not null default now();

alter table public.user_progress
  add column if not exists updated_at timestamptz not null default now();

-- لو كان عندك العمود القديم last_opened_at، ننقل قيمته إلى opened_at بدون حذف القديم.
-- لا نحذف last_opened_at حتى لا نخاطر بفقدان بيانات قديمة.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_progress'
      and column_name = 'last_opened_at'
  ) then
    update public.user_progress
    set opened_at = coalesce(opened_at, last_opened_at, created_at, updated_at, now())
    where opened_at is null;
  else
    update public.user_progress
    set opened_at = coalesce(opened_at, created_at, updated_at, now())
    where opened_at is null;
  end if;
end $$;

-- إزالة أي شرط قديم على status لأنه غالبًا يسمح بـ started فقط.
do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'public.user_progress'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format(
      'alter table public.user_progress drop constraint if exists %I',
      constraint_record.conname
    );
  end loop;
end $$;

-- تحويل الحالة القديمة started إلى opened حتى تتوافق مع الكود الجديد.
update public.user_progress
set status = 'opened'
where status is null
   or status = 'started';

-- تأكد أن الأيام المكتملة لها وقت اكتمال.
update public.user_progress
set completed_at = coalesce(completed_at, updated_at, now())
where status = 'completed'
  and completed_at is null;

-- ضبط القيم الافتراضية والقيود بعد تنظيف البيانات.
alter table public.user_progress
  alter column status set default 'opened';

alter table public.user_progress
  alter column status set not null;

alter table public.user_progress
  alter column opened_at set default now();

alter table public.user_progress
  alter column updated_at set default now();

alter table public.user_progress
  add constraint user_progress_status_check
  check (status in ('opened', 'completed'));

-- تأكد من وجود قيد فريد يدعم upsert في الكود:
-- onConflict: user_id,month_index,week_index,day_index
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user_progress'::regclass
      and contype = 'u'
      and conname = 'user_progress_unique_student_day'
  ) then
    begin
      alter table public.user_progress
        add constraint user_progress_unique_student_day
        unique (user_id, month_index, week_index, day_index);
    exception
      when duplicate_table then null;
      when duplicate_object then null;
    end;
  end if;
end $$;

-- تفعيل Row Level Security.
alter table public.user_progress enable row level security;

-- حذف السياسات القديمة ثم إعادة إنشائها بشكل واضح.
drop policy if exists "Students can read their own progress" on public.user_progress;
drop policy if exists "Students can insert their own progress" on public.user_progress;
drop policy if exists "Students can update their own progress" on public.user_progress;

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

-- صلاحيات أساسية للدور authenticated.
-- RLS ما زالت هي التي تمنع أي طالب من رؤية بيانات غيره.
grant select, insert, update on public.user_progress to authenticated;

-- فهرس لتحسين سرعة تحميل تقدم الطالب.
create index if not exists user_progress_user_path_idx
  on public.user_progress (user_id, month_index, week_index, day_index);

-- دالة تحديث updated_at تلقائيًا عند تعديل السجل.
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