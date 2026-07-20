-- 60_admin_live_dashboard.sql
-- الهدف: ضمان عمل "المتصلون الآن" و"آخر ظهور فعلي" للمتدربين في لوحة الإدارة.
-- آمن للتشغيل عدة مرات (idempotent). لا يحذف بيانات ولا يغيّر أي محتوى.
-- شغّله مرة واحدة في Supabase SQL Editor إن كانت اللوحة لا تعرض المتصلين
-- أو لا يتغيّر تاريخ آخر ظهور.

-- 1) التأكد من وجود عمود آخر ظهور.
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- 2) دالة تحديث آخر ظهور — يستدعيها الموقع تلقائيًا لكل مستخدم مسجّل دخوله.
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

GRANT EXECUTE ON FUNCTION public.touch_user_activity() TO authenticated;

-- 3) نظرة عامة للوحة الإدارة — active_now = النشطون خلال آخر 10 دقائق.
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

GRANT EXECUTE ON FUNCTION public.get_admin_overview() TO authenticated;

-- 4) قائمة المتدربين مع آخر ظهور فعلي، مرتّبة بالأحدث ظهورًا أولًا.
DROP FUNCTION IF EXISTS public.get_admin_recent_learners(integer);
CREATE OR REPLACE FUNCTION public.get_admin_recent_learners(limit_count integer DEFAULT 20)
RETURNS TABLE (
  user_id uuid,
  email text,
  display_name text,
  created_at timestamptz,
  last_seen_at timestamptz,
  total_seconds bigint,
  completed_days integer
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
    p.id AS user_id,
    p.email,
    COALESCE(p.certificate_name, p.full_name, p.email, 'متدرب') AS display_name,
    p.created_at,
    p.last_seen_at,
    COALESCE(p.total_learning_seconds, 0)::bigint AS total_seconds,
    COALESCE(progress.completed_days, 0)::integer AS completed_days
  FROM public.user_profiles p
  LEFT JOIN LATERAL (
    SELECT count(*)::integer AS completed_days
    FROM public.user_progress up
    WHERE up.user_id = p.id
      AND (up.completed = true OR up.status = 'completed')
  ) progress ON true
  ORDER BY COALESCE(p.last_seen_at, p.created_at) DESC NULLS LAST
  LIMIT LEAST(GREATEST(COALESCE(limit_count, 20), 1), 100);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_recent_learners(integer) TO authenticated;
