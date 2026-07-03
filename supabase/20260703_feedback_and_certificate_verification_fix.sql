-- Fix feedback monthly stages and public certificate verification for the 168-day journey.
-- Run this once in Supabase SQL Editor if production still rejects feedback or verification links.

BEGIN;

ALTER TABLE public.journey_feedback
  DROP CONSTRAINT IF EXISTS journey_feedback_stage_check;

ALTER TABLE public.journey_feedback
  ADD CONSTRAINT journey_feedback_stage_check
  CHECK (
    stage IN (
      'general',
      'month_1', 'month_2', 'month_3', 'month_4', 'month_5', 'month_6',
      'month1', 'month2', 'month3', 'month4', 'month5', 'month6',
      'first_month', 'second_month', 'third_month', 'fourth_month', 'fifth_month', 'sixth_month',
      'mid_journey', 'final', 'completion', 'journey_complete'
    )
  );

ALTER TABLE public.monthly_certificates
  ADD COLUMN IF NOT EXISTS verification_slug text,
  ADD COLUMN IF NOT EXISTS verification_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS public_note text;

ALTER TABLE public.mastery_certificates
  ADD COLUMN IF NOT EXISTS verification_slug text,
  ADD COLUMN IF NOT EXISTS verification_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS public_note text;

UPDATE public.monthly_certificates
SET verification_slug = COALESCE(verification_slug, certificate_slug, certificate_code),
    verification_enabled = true,
    public_enabled = true
WHERE status = 'issued';

UPDATE public.mastery_certificates
SET verification_slug = COALESCE(verification_slug, certificate_slug, certificate_code),
    verification_enabled = true,
    public_enabled = true,
    total_days = 168
WHERE status = 'issued';

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
  WHERE COALESCE(verification_enabled, public_enabled, true) = true
    AND status = 'issued'
    AND (
      certificate_code = slug_or_code
      OR certificate_slug = slug_or_code
      OR verification_slug = slug_or_code
    )

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
  WHERE COALESCE(verification_enabled, public_enabled, true) = true
    AND status = 'issued'
    AND (
      certificate_code = slug_or_code
      OR certificate_slug = slug_or_code
      OR verification_slug = slug_or_code
    )
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.verify_mastery_certificate(text) TO anon, authenticated;

COMMIT;
