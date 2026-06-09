-- OD Academy security hardening migration.
-- Run after 40_full_supabase_policy_repair.sql.

BEGIN;

ALTER TABLE public.privacy_requests
  ADD COLUMN IF NOT EXISTS requester_name text,
  ADD COLUMN IF NOT EXISTS requester_email text,
  ADD COLUMN IF NOT EXISTS preferred_contact text,
  ADD COLUMN IF NOT EXISTS message text,
  ADD COLUMN IF NOT EXISTS source_path text,
  ADD COLUMN IF NOT EXISTS user_agent text;

UPDATE public.privacy_requests
SET email = COALESCE(email, requester_email),
    requester_email = COALESCE(requester_email, email),
    details = COALESCE(details, message),
    message = COALESCE(message, details)
WHERE email IS NULL
   OR requester_email IS NULL
   OR details IS NULL
   OR message IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'privacy_requests_type_valid'
  ) THEN
    ALTER TABLE public.privacy_requests
      ADD CONSTRAINT privacy_requests_type_valid
      CHECK (request_type = ANY (ARRAY[
        'delete_data',
        'correct_data',
        'export_data',
        'withdraw_consent',
        'other'
      ])) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'privacy_requests_email_valid'
  ) THEN
    ALTER TABLE public.privacy_requests
      ADD CONSTRAINT privacy_requests_email_valid
      CHECK (
        char_length(COALESCE(email, requester_email, '')) BETWEEN 5 AND 254
        AND COALESCE(email, requester_email, '') ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
      ) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'privacy_requests_text_size_valid'
  ) THEN
    ALTER TABLE public.privacy_requests
      ADD CONSTRAINT privacy_requests_text_size_valid
      CHECK (
        char_length(COALESCE(requester_name, '')) <= 200
        AND char_length(COALESCE(details, message, '')) <= 4000
        AND char_length(COALESCE(source_path, '')) <= 1024
        AND char_length(COALESCE(user_agent, '')) <= 512
      ) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'privacy_requests_status_valid'
  ) THEN
    ALTER TABLE public.privacy_requests
      ADD CONSTRAINT privacy_requests_status_valid
      CHECK (status = ANY (ARRAY[
        'new',
        'pending',
        'in_review',
        'completed',
        'rejected',
        'cancelled'
      ])) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'journey_feedback_scores_valid'
  ) THEN
    ALTER TABLE public.journey_feedback
      ADD CONSTRAINT journey_feedback_scores_valid
      CHECK (
        (clarity_rating IS NULL OR clarity_rating BETWEEN 1 AND 5)
        AND (od_depth_rating IS NULL OR od_depth_rating BETWEEN 1 AND 5)
        AND (overall_rating IS NULL OR overall_rating BETWEEN 1 AND 5)
        AND (capability_rating IS NULL OR capability_rating BETWEEN 1 AND 5)
        AND completed_days BETWEEN 0 AND 180
        AND completed_percent BETWEEN 0 AND 100
        AND char_length(COALESCE(most_helpful_section, '')) <= 2000
        AND char_length(COALESCE(improvement_text, '')) <= 4000
        AND char_length(COALESCE(transformation_text, '')) <= 4000
        AND char_length(COALESCE(testimonial_text, '')) <= 2000
      ) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'visitor_testimonials_public_valid'
  ) THEN
    ALTER TABLE public.visitor_testimonials
      ADD CONSTRAINT visitor_testimonials_public_valid
      CHECK (
        status = ANY (ARRAY['draft', 'published', 'hidden', 'rejected'])
        AND (rating IS NULL OR rating BETWEEN 1 AND 5)
        AND char_length(COALESCE(display_name, '')) BETWEEN 1 AND 120
        AND char_length(COALESCE(role_title, '')) <= 180
        AND char_length(COALESCE(testimonial_text, '')) BETWEEN 1 AND 2000
      ) NOT VALID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_profiles_last_seen
ON public.user_profiles(last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_progress_completion_lookup
ON public.user_progress(user_id, completed, status);

CREATE INDEX IF NOT EXISTS idx_journey_feedback_status_submitted
ON public.journey_feedback(status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_visitor_testimonials_public_order
ON public.visitor_testimonials(status, display_order, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_privacy_requests_status_created
ON public.privacy_requests(status, created_at DESC);

CREATE OR REPLACE FUNCTION public.get_completed_learning_days(target_user_id uuid DEFAULT auth.uid())
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  completed_count integer := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 0;
  END IF;

  IF target_user_id IS DISTINCT FROM auth.uid() AND NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not_allowed' USING ERRCODE = '42501';
  END IF;

  SELECT count(*)::integer
  INTO completed_count
  FROM (
    SELECT DISTINCT
      COALESCE(month_index, month_no) AS month_value,
      COALESCE(week_index, week_no) AS week_value,
      COALESCE(day_index, day_no) AS day_value
    FROM public.user_progress
    WHERE user_id = target_user_id
      AND (completed = true OR status = 'completed')
      AND COALESCE(month_index, month_no) BETWEEN 1 AND 6
      AND COALESCE(week_index, week_no) BETWEEN 1 AND 5
      AND COALESCE(day_index, day_no) BETWEEN 1 AND 31
  ) completed_days;

  RETURN LEAST(GREATEST(COALESCE(completed_count, 0), 0), 180);
END;
$$;

CREATE OR REPLACE FUNCTION public.issue_monthly_certificates(certificate_name_input text DEFAULT NULL)
RETURNS SETOF public.monthly_certificates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  completed_count integer;
  month_number_value integer;
  required_days_value integer;
  clean_certificate_name text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required' USING ERRCODE = '42501';
  END IF;

  completed_count := public.get_completed_learning_days(auth.uid());
  clean_certificate_name := left(
    COALESCE(NULLIF(btrim(certificate_name_input), ''), auth.jwt() ->> 'email', 'Learner'),
    120
  );

  FOR month_number_value IN 1..6 LOOP
    required_days_value := month_number_value * 30;

    IF completed_count >= required_days_value THEN
      INSERT INTO public.monthly_certificates (
        user_id,
        month_number,
        required_days,
        completed_days,
        total_days,
        certificate_name,
        status,
        public_enabled,
        verification_enabled,
        issued_at,
        public_note
      )
      VALUES (
        auth.uid(),
        month_number_value,
        required_days_value,
        completed_count,
        180,
        clean_certificate_name,
        'issued',
        true,
        true,
        now(),
        'Issued after verified platform progress.'
      )
      ON CONFLICT (user_id, month_number) DO UPDATE
      SET required_days = EXCLUDED.required_days,
          completed_days = GREATEST(public.monthly_certificates.completed_days, EXCLUDED.completed_days),
          total_days = EXCLUDED.total_days,
          certificate_name = EXCLUDED.certificate_name,
          status = 'issued',
          public_enabled = true,
          verification_enabled = true,
          issued_at = COALESCE(public.monthly_certificates.issued_at, EXCLUDED.issued_at),
          updated_at = now();
    END IF;
  END LOOP;

  RETURN QUERY
  SELECT *
  FROM public.monthly_certificates
  WHERE user_id = auth.uid()
  ORDER BY month_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.issue_mastery_certificate(certificate_name_input text DEFAULT NULL)
RETURNS public.mastery_certificates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  completed_count integer;
  clean_certificate_name text;
  issued_certificate public.mastery_certificates;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required' USING ERRCODE = '42501';
  END IF;

  completed_count := public.get_completed_learning_days(auth.uid());

  IF completed_count < 180 THEN
    SELECT *
    INTO issued_certificate
    FROM public.mastery_certificates
    WHERE user_id = auth.uid();

    RETURN issued_certificate;
  END IF;

  clean_certificate_name := left(
    COALESCE(NULLIF(btrim(certificate_name_input), ''), auth.jwt() ->> 'email', 'Learner'),
    120
  );

  INSERT INTO public.mastery_certificates (
    user_id,
    certificate_name,
    completed_days,
    total_days,
    status,
    public_enabled,
    verification_enabled,
    issued_at,
    public_note
  )
  VALUES (
    auth.uid(),
    clean_certificate_name,
    completed_count,
    180,
    'issued',
    true,
    true,
    now(),
    'Issued after verified platform progress.'
  )
  ON CONFLICT (user_id) DO UPDATE
  SET certificate_name = EXCLUDED.certificate_name,
      completed_days = GREATEST(public.mastery_certificates.completed_days, EXCLUDED.completed_days),
      total_days = EXCLUDED.total_days,
      status = 'issued',
      public_enabled = true,
      verification_enabled = true,
      issued_at = COALESCE(public.mastery_certificates.issued_at, EXCLUDED.issued_at),
      updated_at = now()
  RETURNING * INTO issued_certificate;

  RETURN issued_certificate;
END;
$$;

DROP POLICY IF EXISTS "Users read own monthly certificates" ON public.monthly_certificates;
DROP POLICY IF EXISTS "Users manage own monthly certificates" ON public.monthly_certificates;
DROP POLICY IF EXISTS "Users update own monthly certificates" ON public.monthly_certificates;
DROP POLICY IF EXISTS "Admins manage monthly certificates" ON public.monthly_certificates;

CREATE POLICY "Users read own monthly certificates"
ON public.monthly_certificates
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_platform_admin());

CREATE POLICY "Admins manage monthly certificates"
ON public.monthly_certificates
FOR ALL
TO authenticated
USING (public.is_platform_admin())
WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "Users read own mastery certificates" ON public.mastery_certificates;
DROP POLICY IF EXISTS "Users manage own mastery certificates" ON public.mastery_certificates;
DROP POLICY IF EXISTS "Users update own mastery certificates" ON public.mastery_certificates;
DROP POLICY IF EXISTS "Admins manage mastery certificates" ON public.mastery_certificates;

CREATE POLICY "Users read own mastery certificates"
ON public.mastery_certificates
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_platform_admin());

CREATE POLICY "Admins manage mastery certificates"
ON public.mastery_certificates
FOR ALL
TO authenticated
USING (public.is_platform_admin())
WITH CHECK (public.is_platform_admin());

GRANT EXECUTE ON FUNCTION public.get_completed_learning_days(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.issue_monthly_certificates(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.issue_mastery_certificate(text) TO authenticated;

COMMIT;
