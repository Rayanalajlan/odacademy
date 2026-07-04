-- إصلاح آمن بدون حذف بيانات:
-- 1) يحصر مراحل تقييم الرحلة في ثلاث محطات جديدة مع قبول القيم القديمة حتى لا تنكسر السجلات السابقة.
-- 2) يثبت حالات الاعتماد والنشر.
-- 3) يعيد دوال الاعتماد والعرض العام بتسميات المراحل الثلاث.

DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.journey_feedback'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%stage%'
  LOOP
    EXECUTE format('ALTER TABLE public.journey_feedback DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END LOOP;
END $$;

ALTER TABLE public.journey_feedback
  ADD CONSTRAINT journey_feedback_stage_check
  CHECK (
    stage IS NULL OR stage IN (
      'month_1',
      'month_3',
      'month_6',
      'first_month',
      'month_one',
      'm1',
      'mid_journey',
      'third_month',
      'month_three',
      'm3',
      'final',
      'completion',
      'journey_complete',
      'sixth_month',
      'month_six',
      'm6',
      'general'
    )
  );

DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.journey_feedback'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.journey_feedback DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END LOOP;
END $$;

ALTER TABLE public.journey_feedback
  ADD CONSTRAINT journey_feedback_status_check
  CHECK (status IN ('pending', 'published', 'approved', 'rejected', 'hidden'));

UPDATE public.journey_feedback
SET status = 'published',
    is_public = true,
    publish_consent = true,
    moderated_at = COALESCE(moderated_at, now()),
    published_at = COALESCE(published_at, now())
WHERE status = 'approved';

CREATE OR REPLACE FUNCTION public.moderate_feedback(
  feedback_id uuid,
  moderation_action text,
  note text DEFAULT '',
  publish boolean DEFAULT null
)
RETURNS public.journey_feedback
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_action text := lower(coalesce(moderation_action, ''));
  next_status text;
  updated_row public.journey_feedback;
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  next_status := CASE
    WHEN normalized_action IN ('approve', 'approved', 'publish', 'published') THEN 'published'
    WHEN normalized_action IN ('reject', 'rejected') THEN 'rejected'
    WHEN normalized_action IN ('hide', 'hidden') THEN 'hidden'
    ELSE normalized_action
  END;

  IF next_status NOT IN ('published', 'rejected', 'hidden', 'pending') THEN
    RAISE EXCEPTION 'invalid_feedback_status: %', moderation_action;
  END IF;

  UPDATE public.journey_feedback
  SET status = next_status,
      admin_note = nullif(note, ''),
      is_public = CASE
        WHEN next_status = 'published' THEN true
        WHEN next_status IN ('rejected', 'hidden') THEN false
        ELSE COALESCE(publish, is_public, false)
      END,
      publish_consent = CASE
        WHEN next_status = 'published' THEN true
        ELSE publish_consent
      END,
      moderated_at = now(),
      published_at = CASE
        WHEN next_status = 'published' THEN COALESCE(published_at, now())
        ELSE published_at
      END
  WHERE id = feedback_id
  RETURNING * INTO updated_row;

  IF updated_row.id IS NULL THEN
    RAISE EXCEPTION 'feedback_not_found';
  END IF;

  RETURN updated_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.moderate_journey_feedback(
  feedback_id_input uuid,
  next_status text,
  admin_note_input text DEFAULT ''
)
RETURNS public.journey_feedback
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.moderate_feedback(
    feedback_id_input,
    next_status,
    admin_note_input,
    next_status IN ('published', 'approved', 'approve')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_testimonials(limit_count integer DEFAULT 12)
RETURNS TABLE (
  id uuid,
  display_name text,
  badge_label text,
  testimonial_text text,
  rating integer,
  submitted_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    journey_feedback.id,
    CASE journey_feedback.display_name_preference
      WHEN 'full_name' THEN COALESCE(user_profiles.certificate_name, user_profiles.full_name, 'متدرب في منسقة')
      WHEN 'first_name' THEN split_part(COALESCE(user_profiles.certificate_name, user_profiles.full_name, 'متدرب'), ' ', 1)
      ELSE 'متدرب في منسقة'
    END AS display_name,
    CASE journey_feedback.stage
      WHEN 'month_1' THEN 'بعد الشهر الأول'
      WHEN 'first_month' THEN 'بعد الشهر الأول'
      WHEN 'month_one' THEN 'بعد الشهر الأول'
      WHEN 'm1' THEN 'بعد الشهر الأول'
      WHEN 'month_3' THEN 'منتصف الرحلة'
      WHEN 'mid_journey' THEN 'منتصف الرحلة'
      WHEN 'third_month' THEN 'منتصف الرحلة'
      WHEN 'month_three' THEN 'منتصف الرحلة'
      WHEN 'm3' THEN 'منتصف الرحلة'
      WHEN 'month_6' THEN 'بعد إتمام الرحلة'
      WHEN 'final' THEN 'بعد إتمام الرحلة'
      WHEN 'completion' THEN 'بعد إتمام الرحلة'
      WHEN 'journey_complete' THEN 'بعد إتمام الرحلة'
      WHEN 'sixth_month' THEN 'بعد إتمام الرحلة'
      WHEN 'month_six' THEN 'بعد إتمام الرحلة'
      WHEN 'm6' THEN 'بعد إتمام الرحلة'
      ELSE 'تقييم متدرب'
    END AS badge_label,
    journey_feedback.testimonial_text,
    COALESCE(journey_feedback.overall_rating, journey_feedback.clarity_rating, 5)::integer AS rating,
    COALESCE(journey_feedback.published_at, journey_feedback.submitted_at, journey_feedback.created_at) AS submitted_at
  FROM public.journey_feedback
  LEFT JOIN public.user_profiles ON user_profiles.id = journey_feedback.user_id
  WHERE journey_feedback.status = 'published'
    AND journey_feedback.is_public = true
    AND (
      journey_feedback.publish_consent = true
      OR journey_feedback.consent_to_publish = true
    )
    AND journey_feedback.testimonial_text IS NOT NULL
    AND length(trim(journey_feedback.testimonial_text)) > 0
  ORDER BY COALESCE(journey_feedback.published_at, journey_feedback.submitted_at, journey_feedback.created_at) DESC
  LIMIT LEAST(GREATEST(COALESCE(limit_count, 12), 1), 48);
$$;

GRANT EXECUTE ON FUNCTION public.moderate_feedback(uuid, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.moderate_journey_feedback(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_testimonials(integer) TO anon, authenticated;
