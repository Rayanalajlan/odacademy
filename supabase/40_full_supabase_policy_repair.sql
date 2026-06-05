-- OD Academy full Supabase repair script
-- Run this file once in the Supabase SQL editor after reviewing the admin email below.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.platform_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  display_name text,
  certificate_name text,
  avatar_url text,
  professional_goal text,
  professional_track text,
  experience_level text,
  city text,
  country text,
  role text NOT NULL DEFAULT 'learner',
  onboarding_completed boolean NOT NULL DEFAULT false,
  current_month integer NOT NULL DEFAULT 1,
  current_week integer NOT NULL DEFAULT 1,
  current_day integer NOT NULL DEFAULT 1,
  completed_days integer NOT NULL DEFAULT 0,
  total_learning_seconds integer NOT NULL DEFAULT 0,
  profile_completed_at timestamptz,
  welcome_email_sent_at timestamptz,
  welcome_email_status text,
  welcome_email_error text,
  welcome_email_last_attempt_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_onboarding (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_no integer NOT NULL,
  week_no integer NOT NULL,
  day_no integer NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  completed boolean NOT NULL DEFAULT true,
  completed_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, month_no, week_no, day_no)
);

CREATE TABLE IF NOT EXISTS public.lesson_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_no integer,
  week_no integer,
  day_no integer,
  lesson_id text,
  title text,
  content text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lesson_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_no integer,
  week_no integer,
  day_no integer,
  lesson_id text,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.weekly_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_no integer,
  week_no integer,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, month_no, week_no)
);

CREATE TABLE IF NOT EXISTS public.radar_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type text NOT NULL DEFAULT 'performance_radar',
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.radar_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.simulation_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_id text,
  score integer,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_mentor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_learning_time (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_name text NOT NULL DEFAULT 'unknown',
  entity_type text,
  entity_id text,
  month_no integer,
  week_no integer,
  day_no integer,
  seconds_spent integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, page_name, entity_type, entity_id, month_no, week_no, day_no)
);

CREATE TABLE IF NOT EXISTS public.user_learning_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_title text,
  event_description text,
  entity_type text,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.badges (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  icon text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id text NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.monthly_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_number integer NOT NULL,
  month_title text,
  certificate_code text UNIQUE NOT NULL DEFAULT upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10)),
  certificate_slug text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  certificate_name text,
  completed_days integer NOT NULL DEFAULT 0,
  total_days integer NOT NULL DEFAULT 30,
  status text NOT NULL DEFAULT 'issued',
  public_enabled boolean NOT NULL DEFAULT true,
  issued_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, month_number)
);

CREATE TABLE IF NOT EXISTS public.mastery_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_code text UNIQUE NOT NULL DEFAULT upper(substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
  certificate_slug text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(14), 'hex'),
  certificate_name text,
  completed_days integer NOT NULL DEFAULT 0,
  total_days integer NOT NULL DEFAULT 180,
  status text NOT NULL DEFAULT 'issued',
  public_enabled boolean NOT NULL DEFAULT true,
  issued_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.journey_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  stage text NOT NULL DEFAULT 'general',
  clarity_rating integer,
  od_depth_rating integer,
  overall_rating integer,
  capability_rating integer,
  recommend boolean,
  most_helpful_section text,
  improvement_text text,
  transformation_text text,
  testimonial_text text,
  consent_to_publish boolean NOT NULL DEFAULT false,
  publish_consent boolean NOT NULL DEFAULT false,
  display_name_preference text NOT NULL DEFAULT 'anonymous',
  is_public boolean NOT NULL DEFAULT false,
  completed_days integer NOT NULL DEFAULT 0,
  completed_percent integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  moderated_at timestamptz,
  published_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.visitor_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  role_title text,
  testimonial_text text NOT NULL,
  rating integer,
  status text NOT NULL DEFAULT 'published',
  display_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.privacy_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  request_type text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS certificate_name text,
  ADD COLUMN IF NOT EXISTS professional_goal text,
  ADD COLUMN IF NOT EXISTS professional_track text,
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS profile_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS welcome_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS welcome_email_status text,
  ADD COLUMN IF NOT EXISTS welcome_email_error text,
  ADD COLUMN IF NOT EXISTS welcome_email_last_attempt_at timestamptz;

ALTER TABLE public.journey_feedback
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS clarity_rating integer,
  ADD COLUMN IF NOT EXISTS od_depth_rating integer,
  ADD COLUMN IF NOT EXISTS overall_rating integer,
  ADD COLUMN IF NOT EXISTS capability_rating integer,
  ADD COLUMN IF NOT EXISTS recommend boolean,
  ADD COLUMN IF NOT EXISTS most_helpful_section text,
  ADD COLUMN IF NOT EXISTS improvement_text text,
  ADD COLUMN IF NOT EXISTS transformation_text text,
  ADD COLUMN IF NOT EXISTS testimonial_text text,
  ADD COLUMN IF NOT EXISTS consent_to_publish boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS publish_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_name_preference text NOT NULL DEFAULT 'anonymous',
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS completed_days integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_percent integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS admin_note text,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS moderated_at timestamptz,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS body text,
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'info',
  ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS read_at timestamptz;

ALTER TABLE public.visitor_testimonials
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS role_title text,
  ADD COLUMN IF NOT EXISTS testimonial_text text,
  ADD COLUMN IF NOT EXISTS rating integer,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.privacy_requests
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS request_type text,
  ADD COLUMN IF NOT EXISTS details text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS admin_note text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS month_no integer,
  ADD COLUMN IF NOT EXISTS week_no integer,
  ADD COLUMN IF NOT EXISTS day_no integer,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.lesson_notes
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS month_no integer,
  ADD COLUMN IF NOT EXISTS week_no integer,
  ADD COLUMN IF NOT EXISTS day_no integer,
  ADD COLUMN IF NOT EXISTS lesson_id text,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS content text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.lesson_bookmarks
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS month_no integer,
  ADD COLUMN IF NOT EXISTS week_no integer,
  ADD COLUMN IF NOT EXISTS day_no integer,
  ADD COLUMN IF NOT EXISTS lesson_id text,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.weekly_reflections
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS month_no integer,
  ADD COLUMN IF NOT EXISTS week_no integer,
  ADD COLUMN IF NOT EXISTS responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.radar_assessments
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS assessment_type text NOT NULL DEFAULT 'performance_radar',
  ADD COLUMN IF NOT EXISTS scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS result jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.radar_attempts
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS result jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.simulation_attempts
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS simulation_id text,
  ADD COLUMN IF NOT EXISTS score integer,
  ADD COLUMN IF NOT EXISTS result jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.ai_mentor_sessions
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.user_learning_time
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS page_name text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS entity_type text,
  ADD COLUMN IF NOT EXISTS entity_id text,
  ADD COLUMN IF NOT EXISTS month_no integer,
  ADD COLUMN IF NOT EXISTS week_no integer,
  ADD COLUMN IF NOT EXISTS day_no integer,
  ADD COLUMN IF NOT EXISTS seconds_spent integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.user_learning_events
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS event_type text,
  ADD COLUMN IF NOT EXISTS event_title text,
  ADD COLUMN IF NOT EXISTS event_description text,
  ADD COLUMN IF NOT EXISTS entity_type text,
  ADD COLUMN IF NOT EXISTS entity_id text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.badges
  ADD COLUMN IF NOT EXISTS id text,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.user_badges
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS badge_id text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS awarded_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.monthly_certificates
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS month_number integer,
  ADD COLUMN IF NOT EXISTS month_title text,
  ADD COLUMN IF NOT EXISTS certificate_code text,
  ADD COLUMN IF NOT EXISTS certificate_slug text,
  ADD COLUMN IF NOT EXISTS certificate_name text,
  ADD COLUMN IF NOT EXISTS completed_days integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_days integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'issued',
  ADD COLUMN IF NOT EXISTS public_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS issued_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.mastery_certificates
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS certificate_code text,
  ADD COLUMN IF NOT EXISTS certificate_slug text,
  ADD COLUMN IF NOT EXISTS certificate_name text,
  ADD COLUMN IF NOT EXISTS completed_days integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_days integer NOT NULL DEFAULT 180,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'issued',
  ADD COLUMN IF NOT EXISTS public_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS issued_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.user_profiles
SET display_name = COALESCE(display_name, full_name),
    certificate_name = COALESCE(certificate_name, full_name)
WHERE full_name IS NOT NULL
  AND (display_name IS NULL OR certificate_name IS NULL);

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_user ON public.lesson_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reflections_user ON public.weekly_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_radar_assessments_user ON public.radar_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_learning_events_user_created ON public.user_learning_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journey_feedback_status ON public.journey_feedback(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_journey_feedback_user_stage ON public.journey_feedback(user_id, stage);
CREATE INDEX IF NOT EXISTS idx_mastery_certificates_lookup ON public.mastery_certificates(certificate_code, certificate_slug);
CREATE INDEX IF NOT EXISTS idx_monthly_certificates_lookup ON public.monthly_certificates(certificate_code, certificate_slug);

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'user_profiles',
    'user_onboarding',
    'user_progress',
    'lesson_notes',
    'weekly_reflections',
    'ai_mentor_sessions',
    'user_learning_time',
    'badges',
    'monthly_certificates',
    'mastery_certificates',
    'journey_feedback',
    'visitor_testimonials',
    'privacy_requests'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', table_name, table_name);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      table_name,
      table_name
    );
  END LOOP;
END;
$$;

ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radar_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radar_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_time ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_admins admin
    WHERE admin.user_id = auth.uid()
      OR (
        admin.email IS NOT NULL
        AND lower(admin.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_site_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT public.is_platform_admin();
$$;

DROP POLICY IF EXISTS "Admins manage platform admins" ON public.platform_admins;
CREATE POLICY "Admins manage platform admins"
ON public.platform_admins
FOR ALL
TO authenticated
USING (public.is_platform_admin())
WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "Users read own profile" ON public.user_profiles;
CREATE POLICY "Users read own profile" ON public.user_profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_platform_admin());
DROP POLICY IF EXISTS "Users update own profile" ON public.user_profiles;
CREATE POLICY "Users update own profile" ON public.user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users insert own profile" ON public.user_profiles;
CREATE POLICY "Users insert own profile" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users manage own onboarding" ON public.user_onboarding;
CREATE POLICY "Users manage own onboarding" ON public.user_onboarding FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin()) WITH CHECK (auth.uid() = user_id OR public.is_platform_admin());

DROP POLICY IF EXISTS "Users manage own progress" ON public.user_progress;
CREATE POLICY "Users manage own progress" ON public.user_progress FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin()) WITH CHECK (auth.uid() = user_id OR public.is_platform_admin());

DROP POLICY IF EXISTS "Users manage own lesson notes" ON public.lesson_notes;
CREATE POLICY "Users manage own lesson notes" ON public.lesson_notes FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin()) WITH CHECK (auth.uid() = user_id OR public.is_platform_admin());

DROP POLICY IF EXISTS "Users manage own bookmarks" ON public.lesson_bookmarks;
CREATE POLICY "Users manage own bookmarks" ON public.lesson_bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin()) WITH CHECK (auth.uid() = user_id OR public.is_platform_admin());

DROP POLICY IF EXISTS "Users manage own weekly reflections" ON public.weekly_reflections;
CREATE POLICY "Users manage own weekly reflections" ON public.weekly_reflections FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin()) WITH CHECK (auth.uid() = user_id OR public.is_platform_admin());

DROP POLICY IF EXISTS "Users read own radar assessments" ON public.radar_assessments;
CREATE POLICY "Users read own radar assessments" ON public.radar_assessments FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin());
DROP POLICY IF EXISTS "User inserts own radar assessments" ON public.radar_assessments;
CREATE POLICY "User inserts own radar assessments" ON public.radar_assessments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_platform_admin());

DROP POLICY IF EXISTS "Users manage own radar attempts" ON public.radar_attempts;
CREATE POLICY "Users manage own radar attempts" ON public.radar_attempts FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin()) WITH CHECK (auth.uid() = user_id OR public.is_platform_admin());

DROP POLICY IF EXISTS "Users manage own simulation attempts" ON public.simulation_attempts;
CREATE POLICY "Users manage own simulation attempts" ON public.simulation_attempts FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin()) WITH CHECK (auth.uid() = user_id OR public.is_platform_admin());

DROP POLICY IF EXISTS "Users manage own mentor sessions" ON public.ai_mentor_sessions;
CREATE POLICY "Users manage own mentor sessions" ON public.ai_mentor_sessions FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin()) WITH CHECK (auth.uid() = user_id OR public.is_platform_admin());

DROP POLICY IF EXISTS "Users manage own learning time" ON public.user_learning_time;
CREATE POLICY "Users manage own learning time" ON public.user_learning_time FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin()) WITH CHECK (auth.uid() = user_id OR public.is_platform_admin());

DROP POLICY IF EXISTS "Users manage own learning events" ON public.user_learning_events;
CREATE POLICY "Users manage own learning events" ON public.user_learning_events FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin()) WITH CHECK (auth.uid() = user_id OR public.is_platform_admin());

DROP POLICY IF EXISTS "Users manage own notifications" ON public.notifications;
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin()) WITH CHECK (auth.uid() = user_id OR public.is_platform_admin());

DROP POLICY IF EXISTS "Anyone reads badges" ON public.badges;
CREATE POLICY "Anyone reads badges" ON public.badges FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage badges" ON public.badges;
CREATE POLICY "Admins manage badges" ON public.badges FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "Users read own badges" ON public.user_badges;
CREATE POLICY "Users read own badges" ON public.user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin());
DROP POLICY IF EXISTS "Users insert own badges" ON public.user_badges;
CREATE POLICY "Users insert own badges" ON public.user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_platform_admin());

DROP POLICY IF EXISTS "Users read own monthly certificates" ON public.monthly_certificates;
CREATE POLICY "Users read own monthly certificates" ON public.monthly_certificates FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin());
DROP POLICY IF EXISTS "Users manage own monthly certificates" ON public.monthly_certificates;
CREATE POLICY "Users manage own monthly certificates" ON public.monthly_certificates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_platform_admin());
DROP POLICY IF EXISTS "Users update own monthly certificates" ON public.monthly_certificates;
CREATE POLICY "Users update own monthly certificates" ON public.monthly_certificates FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin()) WITH CHECK (auth.uid() = user_id OR public.is_platform_admin());

DROP POLICY IF EXISTS "Users read own mastery certificates" ON public.mastery_certificates;
CREATE POLICY "Users read own mastery certificates" ON public.mastery_certificates FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin());
DROP POLICY IF EXISTS "Users manage own mastery certificates" ON public.mastery_certificates;
CREATE POLICY "Users manage own mastery certificates" ON public.mastery_certificates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_platform_admin());
DROP POLICY IF EXISTS "Users update own mastery certificates" ON public.mastery_certificates;
CREATE POLICY "Users update own mastery certificates" ON public.mastery_certificates FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin()) WITH CHECK (auth.uid() = user_id OR public.is_platform_admin());

DROP POLICY IF EXISTS "Users submit and read own feedback" ON public.journey_feedback;
CREATE POLICY "Users submit and read own feedback" ON public.journey_feedback FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_platform_admin()) WITH CHECK (auth.uid() = user_id OR public.is_platform_admin());

DROP POLICY IF EXISTS "Anyone reads published visitor testimonials" ON public.visitor_testimonials;
CREATE POLICY "Anyone reads published visitor testimonials" ON public.visitor_testimonials FOR SELECT TO anon, authenticated USING (status = 'published');
DROP POLICY IF EXISTS "Admins manage visitor testimonials" ON public.visitor_testimonials;
CREATE POLICY "Admins manage visitor testimonials" ON public.visitor_testimonials FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "Anyone creates privacy requests" ON public.privacy_requests;
CREATE POLICY "Anyone creates privacy requests" ON public.privacy_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Admins manage privacy requests" ON public.privacy_requests;
CREATE POLICY "Admins manage privacy requests" ON public.privacy_requests FOR ALL TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, last_seen_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(public.user_profiles.full_name, EXCLUDED.full_name),
      updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

DROP FUNCTION IF EXISTS public.touch_user_activity();
CREATE OR REPLACE FUNCTION public.touch_user_activity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.user_profiles (id, email, last_seen_at)
  VALUES (auth.uid(), auth.jwt() ->> 'email', now())
  ON CONFLICT (id) DO UPDATE
  SET last_seen_at = now(),
      email = COALESCE(public.user_profiles.email, EXCLUDED.email),
      updated_at = now();
END;
$$;

DROP FUNCTION IF EXISTS public.get_public_platform_stats();
CREATE OR REPLACE FUNCTION public.get_public_platform_stats()
RETURNS TABLE (
  total_learners bigint,
  active_now bigint,
  completed_learners bigint,
  remaining_seats integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH completed AS (
    SELECT user_id
    FROM public.user_progress
    WHERE completed = true
    GROUP BY user_id
    HAVING count(*) >= 168
  )
  SELECT
    (SELECT count(*) FROM public.user_profiles)::bigint,
    (SELECT count(*) FROM public.user_profiles WHERE last_seen_at > now() - interval '10 minutes')::bigint,
    (SELECT count(*) FROM completed)::bigint,
    GREATEST(250 - (SELECT count(*) FROM public.user_profiles), 0)::integer;
$$;

DROP FUNCTION IF EXISTS public.record_learning_time(integer, text, text, text, integer, integer, integer, jsonb);
CREATE OR REPLACE FUNCTION public.record_learning_time(
  seconds_spent integer,
  page_name text DEFAULT 'unknown',
  entity_type_text text DEFAULT NULL,
  entity_id_text text DEFAULT NULL,
  month_no integer DEFAULT NULL,
  week_no integer DEFAULT NULL,
  day_no integer DEFAULT NULL,
  event_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL OR COALESCE(seconds_spent, 0) <= 0 THEN
    RETURN;
  END IF;

  INSERT INTO public.user_learning_time (
    user_id, page_name, entity_type, entity_id, month_no, week_no, day_no, seconds_spent, metadata
  )
  VALUES (
    auth.uid(),
    COALESCE(page_name, 'unknown'),
    entity_type_text,
    entity_id_text,
    month_no,
    week_no,
    day_no,
    seconds_spent,
    COALESCE(event_metadata, '{}'::jsonb)
  )
  ON CONFLICT (user_id, page_name, entity_type, entity_id, month_no, week_no, day_no)
  DO UPDATE
  SET seconds_spent = public.user_learning_time.seconds_spent + EXCLUDED.seconds_spent,
      metadata = public.user_learning_time.metadata || EXCLUDED.metadata,
      updated_at = now();

  INSERT INTO public.user_learning_events (
    user_id, event_type, event_title, event_description, entity_type, entity_id, metadata
  )
  VALUES (
    auth.uid(),
    'learning_time',
    page_name,
    concat(seconds_spent::text, ' seconds'),
    entity_type_text,
    entity_id_text,
    COALESCE(event_metadata, '{}'::jsonb)
  );

  UPDATE public.user_profiles
  SET total_learning_seconds = COALESCE(total_learning_seconds, 0) + seconds_spent,
      last_seen_at = now(),
      updated_at = now()
  WHERE id = auth.uid();
END;
$$;

DROP FUNCTION IF EXISTS public.log_learning_event(text, text, text, text, text, jsonb);
CREATE OR REPLACE FUNCTION public.log_learning_event(
  event_type_text text,
  event_title text DEFAULT NULL,
  event_description text DEFAULT NULL,
  entity_type_text text DEFAULT NULL,
  entity_id_text text DEFAULT NULL,
  event_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  new_event_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.user_learning_events (
    user_id, event_type, event_title, event_description, entity_type, entity_id, metadata
  )
  VALUES (
    auth.uid(),
    COALESCE(event_type_text, 'event'),
    event_title,
    event_description,
    entity_type_text,
    entity_id_text,
    COALESCE(event_metadata, '{}'::jsonb)
  )
  RETURNING id INTO new_event_id;

  PERFORM public.touch_user_activity();
  RETURN new_event_id;
END;
$$;

DROP FUNCTION IF EXISTS public.award_badge_if_missing(text, jsonb);
CREATE OR REPLACE FUNCTION public.award_badge_if_missing(
  target_badge_id text,
  badge_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL OR target_badge_id IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_badges (user_id, badge_id, metadata)
  VALUES (auth.uid(), target_badge_id, COALESCE(badge_metadata, '{}'::jsonb))
  ON CONFLICT (user_id, badge_id) DO NOTHING;

  RETURN true;
END;
$$;

DROP FUNCTION IF EXISTS public.mark_notification_read(uuid);
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true,
      read_at = COALESCE(read_at, now())
  WHERE id = notification_id
    AND user_id = auth.uid();
END;
$$;

DROP FUNCTION IF EXISTS public.verify_mastery_certificate(text);
CREATE OR REPLACE FUNCTION public.verify_mastery_certificate(slug_or_code text)
RETURNS TABLE (
  certificate_type text,
  month_number integer,
  month_title text,
  certificate_code text,
  certificate_name text,
  completed_days integer,
  total_days integer,
  issued_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    'mastery'::text AS certificate_type,
    NULL::integer AS month_number,
    NULL::text AS month_title,
    certificate_code,
    certificate_name,
    completed_days,
    total_days,
    issued_at
  FROM public.mastery_certificates
  WHERE public_enabled = true
    AND status = 'issued'
    AND (certificate_code = slug_or_code OR certificate_slug = slug_or_code)

  UNION ALL

  SELECT
    'monthly'::text AS certificate_type,
    month_number,
    month_title,
    certificate_code,
    certificate_name,
    completed_days,
    total_days,
    issued_at
  FROM public.monthly_certificates
  WHERE public_enabled = true
    AND status = 'issued'
    AND (certificate_code = slug_or_code OR certificate_slug = slug_or_code)
  LIMIT 1;
$$;

DROP FUNCTION IF EXISTS public.get_public_testimonials(integer);
CREATE OR REPLACE FUNCTION public.get_public_testimonials(limit_count integer DEFAULT 6)
RETURNS TABLE (
  id uuid,
  display_name text,
  role_title text,
  testimonial_text text,
  rating integer,
  source text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    visitor_testimonials.id,
    visitor_testimonials.display_name,
    visitor_testimonials.role_title,
    visitor_testimonials.testimonial_text,
    visitor_testimonials.rating,
    'visitor'::text AS source,
    visitor_testimonials.created_at
  FROM public.visitor_testimonials
  WHERE visitor_testimonials.status = 'published'

  UNION ALL

  SELECT
    journey_feedback.id,
    CASE
      WHEN journey_feedback.display_name_preference = 'full_name'
        THEN COALESCE(user_profiles.display_name, user_profiles.certificate_name, user_profiles.full_name, 'متعلم في OD Academy')
      ELSE 'متعلم في OD Academy'
    END AS display_name,
    NULL::text AS role_title,
    journey_feedback.testimonial_text,
    journey_feedback.overall_rating AS rating,
    'learner'::text AS source,
    journey_feedback.created_at
  FROM public.journey_feedback
  LEFT JOIN public.user_profiles ON user_profiles.id = journey_feedback.user_id
  WHERE journey_feedback.status = 'published'
    AND (
      journey_feedback.publish_consent = true
      OR journey_feedback.consent_to_publish = true
      OR journey_feedback.is_public = true
    )
    AND journey_feedback.testimonial_text IS NOT NULL
  ORDER BY created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(limit_count, 6), 1), 24);
$$;

DROP FUNCTION IF EXISTS public.moderate_feedback(uuid, text, text, boolean);
CREATE OR REPLACE FUNCTION public.moderate_feedback(
  feedback_id uuid,
  moderation_action text,
  note text DEFAULT NULL,
  publish boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  UPDATE public.journey_feedback
  SET status = CASE
      WHEN publish OR moderation_action IN ('publish', 'published', 'approve', 'approved') THEN 'published'
      WHEN moderation_action IN ('reject', 'rejected') THEN 'rejected'
      ELSE COALESCE(moderation_action, status)
    END,
    is_public = CASE
      WHEN publish OR moderation_action IN ('publish', 'published', 'approve', 'approved') THEN true
      WHEN moderation_action IN ('reject', 'rejected') THEN false
      ELSE is_public
    END,
    admin_note = note,
    moderated_at = now(),
    published_at = CASE
      WHEN publish OR moderation_action IN ('publish', 'published', 'approve', 'approved')
        THEN COALESCE(published_at, now())
      ELSE published_at
    END,
    updated_at = now()
  WHERE id = feedback_id;

  RETURN FOUND;
END;
$$;

DROP FUNCTION IF EXISTS public.moderate_journey_feedback(uuid, text, text);
CREATE OR REPLACE FUNCTION public.moderate_journey_feedback(
  feedback_id_input uuid,
  next_status text,
  admin_note_input text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.moderate_feedback(feedback_id_input, next_status, admin_note_input, next_status = 'published');
END;
$$;

DROP FUNCTION IF EXISTS public.get_admin_overview();
CREATE OR REPLACE FUNCTION public.get_admin_overview()
RETURNS TABLE (
  total_learners bigint,
  active_now bigint,
  completed_learners bigint,
  pending_feedback bigint,
  total_notes bigint,
  issued_certificates bigint,
  total_learning_seconds bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT count(*) FROM public.user_profiles)::bigint,
    (SELECT count(*) FROM public.user_profiles WHERE last_seen_at > now() - interval '10 minutes')::bigint,
    (SELECT count(DISTINCT user_id) FROM public.user_progress WHERE completed = true)::bigint,
    (SELECT count(*) FROM public.journey_feedback WHERE status = 'pending')::bigint,
    (SELECT count(*) FROM public.lesson_notes)::bigint,
    (
      (SELECT count(*) FROM public.monthly_certificates WHERE status = 'issued') +
      (SELECT count(*) FROM public.mastery_certificates WHERE status = 'issued')
    )::bigint,
    (SELECT COALESCE(sum(total_learning_seconds), 0) FROM public.user_profiles)::bigint;
END;
$$;

DROP FUNCTION IF EXISTS public.get_admin_feedback_queue(integer);
CREATE OR REPLACE FUNCTION public.get_admin_feedback_queue(limit_count integer DEFAULT 20)
RETURNS SETOF public.journey_feedback
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  RETURN QUERY
  SELECT *
  FROM public.journey_feedback
  ORDER BY
    CASE WHEN status = 'pending' THEN 0 ELSE 1 END,
    created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(limit_count, 20), 1), 100);
END;
$$;

DROP FUNCTION IF EXISTS public.get_admin_recent_learners(integer);
CREATE OR REPLACE FUNCTION public.get_admin_recent_learners(limit_count integer DEFAULT 20)
RETURNS SETOF public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  RETURN QUERY
  SELECT *
  FROM public.user_profiles
  ORDER BY COALESCE(last_seen_at, created_at) DESC
  LIMIT LEAST(GREATEST(COALESCE(limit_count, 20), 1), 100);
END;
$$;

DROP FUNCTION IF EXISTS public.get_admin_recent_notes(integer);
CREATE OR REPLACE FUNCTION public.get_admin_recent_notes(limit_count integer DEFAULT 20)
RETURNS SETOF public.lesson_notes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  RETURN QUERY
  SELECT *
  FROM public.lesson_notes
  ORDER BY updated_at DESC
  LIMIT LEAST(GREATEST(COALESCE(limit_count, 20), 1), 100);
END;
$$;

DROP FUNCTION IF EXISTS public.get_admin_recent_certificates(integer);
CREATE OR REPLACE FUNCTION public.get_admin_recent_certificates(limit_count integer DEFAULT 20)
RETURNS TABLE (
  id uuid,
  certificate_type text,
  user_id uuid,
  certificate_code text,
  certificate_name text,
  status text,
  completed_days integer,
  total_days integer,
  issued_at timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  RETURN QUERY
  SELECT
    monthly_certificates.id,
    'monthly'::text,
    monthly_certificates.user_id,
    monthly_certificates.certificate_code,
    monthly_certificates.certificate_name,
    monthly_certificates.status,
    monthly_certificates.completed_days,
    monthly_certificates.total_days,
    monthly_certificates.issued_at,
    monthly_certificates.created_at
  FROM public.monthly_certificates

  UNION ALL

  SELECT
    mastery_certificates.id,
    'mastery'::text,
    mastery_certificates.user_id,
    mastery_certificates.certificate_code,
    mastery_certificates.certificate_name,
    mastery_certificates.status,
    mastery_certificates.completed_days,
    mastery_certificates.total_days,
    mastery_certificates.issued_at,
    mastery_certificates.created_at
  FROM public.mastery_certificates
  ORDER BY issued_at DESC
  LIMIT LEAST(GREATEST(COALESCE(limit_count, 20), 1), 100);
END;
$$;

INSERT INTO public.badges (id, title, description, icon)
VALUES
  ('od_explorer', 'مستكشف التطوير التنظيمي', 'إكمال أول خطوة في رحلة OD Academy.', 'compass'),
  ('system_reader', 'قارئ النظام', 'إظهار تقدم واضح في فهم المنظمة كنظام.', 'radar'),
  ('diagnostic_thinker', 'مفكر تشخيصي', 'استخدام أدوات التشخيص وربطها بسياق العمل.', 'activity'),
  ('intervention_designer', 'مصمم تدخلات', 'بناء تدخلات عملية قابلة للتطبيق.', 'layers'),
  ('change_leader', 'قائد تغيير', 'إكمال مراحل متقدمة في قيادة التغيير.', 'flag'),
  ('impact_practitioner', 'ممارس أثر', 'ربط التعلم بأثر عملي قابل للقياس.', 'target'),
  ('od_mastery', 'وثيقة الإتقان', 'إكمال رحلة الإتقان في OD Academy.', 'award')
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    updated_at = now();

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.badges TO anon, authenticated;
GRANT SELECT ON public.visitor_testimonials TO anon, authenticated;
GRANT INSERT ON public.privacy_requests TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_site_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.touch_user_activity() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_platform_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_learning_time(integer, text, text, text, integer, integer, integer, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_learning_event(text, text, text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_badge_if_missing(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notification_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_mastery_certificate(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_testimonials(integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.moderate_feedback(uuid, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.moderate_journey_feedback(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_feedback_queue(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_recent_learners(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_recent_notes(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_recent_certificates(integer) TO authenticated;

-- Optional: add the owner email after creating the account in Supabase Auth.
-- INSERT INTO public.platform_admins (email) VALUES ('owner@example.com') ON CONFLICT DO NOTHING;
