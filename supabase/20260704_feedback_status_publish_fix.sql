-- Fix journey feedback moderation/publication constraints.
-- Run this once in Supabase SQL Editor.

ALTER TABLE public.journey_feedback
  DROP CONSTRAINT IF EXISTS journey_feedback_status_check;

ALTER TABLE public.journey_feedback
  ADD CONSTRAINT journey_feedback_status_check
  CHECK (status = ANY (ARRAY[
    'pending',
    'published',
    'approved',
    'rejected',
    'hidden'
  ]));

UPDATE public.journey_feedback
SET
  status = 'published',
  is_public = true,
  publish_consent = true,
  published_at = COALESCE(published_at, moderated_at, submitted_at, now()),
  updated_at = now()
WHERE status = 'approved';

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
DECLARE
  normalized_action text := lower(coalesce(moderation_action, ''));
  should_publish boolean := publish OR normalized_action IN ('publish', 'published', 'approve', 'approved');
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  UPDATE public.journey_feedback
  SET
    status = CASE
      WHEN should_publish THEN 'published'
      WHEN normalized_action IN ('reject', 'rejected') THEN 'rejected'
      WHEN normalized_action IN ('hide', 'hidden') THEN 'hidden'
      ELSE status
    END,
    is_public = CASE
      WHEN should_publish THEN true
      WHEN normalized_action IN ('reject', 'rejected', 'hide', 'hidden') THEN false
      ELSE is_public
    END,
    publish_consent = CASE
      WHEN should_publish THEN true
      ELSE publish_consent
    END,
    admin_note = note,
    moderated_at = now(),
    published_at = CASE
      WHEN should_publish THEN COALESCE(published_at, now())
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
  RETURN public.moderate_feedback(
    feedback_id_input,
    next_status,
    admin_note_input,
    lower(coalesce(next_status, '')) IN ('publish', 'published', 'approve', 'approved')
  );
END;
$$;

DROP FUNCTION IF EXISTS public.get_public_testimonials(integer);
CREATE OR REPLACE FUNCTION public.get_public_testimonials(limit_count integer DEFAULT 6)
RETURNS TABLE (
  id uuid,
  reviewer_name text,
  reviewer_meta text,
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
    CASE
      WHEN journey_feedback.display_name_preference = 'full_name'
        THEN COALESCE(user_profiles.certificate_name, user_profiles.full_name, 'متدرب في منسقة')
      WHEN journey_feedback.display_name_preference = 'first_name'
        THEN split_part(COALESCE(user_profiles.certificate_name, user_profiles.full_name, 'متدرب'), ' ', 1)
      ELSE 'متدرب في منسقة'
    END AS reviewer_name,
    CASE journey_feedback.stage
      WHEN 'month_1' THEN 'بعد الشهر الأول'
      WHEN 'month_2' THEN 'بعد الشهر الثاني'
      WHEN 'month_3' THEN 'منتصف الرحلة'
      WHEN 'month_4' THEN 'بعد الشهر الرابع'
      WHEN 'month_5' THEN 'بعد الشهر الخامس'
      WHEN 'month_6' THEN 'أكمل الرحلة'
      ELSE 'تقييم متدرب'
    END AS reviewer_meta,
    journey_feedback.testimonial_text,
    COALESCE(journey_feedback.overall_rating, journey_feedback.clarity_rating, 5) AS rating,
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
  LIMIT LEAST(GREATEST(COALESCE(limit_count, 6), 1), 80);
$$;

GRANT EXECUTE ON FUNCTION public.moderate_feedback(uuid, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.moderate_journey_feedback(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_testimonials(integer) TO anon, authenticated;
