-- Learning ROI calculator per-user isolation.
-- Safe to run multiple times. It does not delete production data.

CREATE TABLE IF NOT EXISTS public.learning_roi_inputs (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  relation text NOT NULL DEFAULT 'outside',
  level_id text NOT NULL DEFAULT 'explorer',
  lens text NOT NULL DEFAULT 'discover',
  outcome text NOT NULL DEFAULT 'enter',
  experience_months integer NOT NULL DEFAULT 0,
  current_salary numeric NOT NULL DEFAULT 0,
  application_level integer NOT NULL DEFAULT 0,
  market_context text NOT NULL DEFAULT 'balanced',
  use_actual_progress boolean NOT NULL DEFAULT true,
  scenario_days integer NOT NULL DEFAULT 0,
  has_user_input boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT learning_roi_experience_months_range CHECK (experience_months BETWEEN 0 AND 720),
  CONSTRAINT learning_roi_current_salary_nonnegative CHECK (current_salary >= 0),
  CONSTRAINT learning_roi_application_level_range CHECK (application_level BETWEEN 0 AND 5),
  CONSTRAINT learning_roi_scenario_days_nonnegative CHECK (scenario_days >= 0)
);

ALTER TABLE public.learning_roi_inputs
  ADD COLUMN IF NOT EXISTS relation text NOT NULL DEFAULT 'outside',
  ADD COLUMN IF NOT EXISTS level_id text NOT NULL DEFAULT 'explorer',
  ADD COLUMN IF NOT EXISTS lens text NOT NULL DEFAULT 'discover',
  ADD COLUMN IF NOT EXISTS outcome text NOT NULL DEFAULT 'enter',
  ADD COLUMN IF NOT EXISTS experience_months integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_salary numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS application_level integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS market_context text NOT NULL DEFAULT 'balanced',
  ADD COLUMN IF NOT EXISTS use_actual_progress boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS scenario_days integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS has_user_input boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'learning_roi_inputs'
      AND column_name = 'experience_years'
  ) THEN
    EXECUTE '
      UPDATE public.learning_roi_inputs
      SET experience_months = COALESCE(experience_months, experience_years * 12, 0)
      WHERE experience_months = 0
        AND experience_years IS NOT NULL
    ';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.set_learning_roi_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_learning_roi_inputs_updated_at ON public.learning_roi_inputs;
CREATE TRIGGER trg_learning_roi_inputs_updated_at
BEFORE UPDATE ON public.learning_roi_inputs
FOR EACH ROW EXECUTE FUNCTION public.set_learning_roi_updated_at();

ALTER TABLE public.learning_roi_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_roi_inputs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own ROI inputs" ON public.learning_roi_inputs;
CREATE POLICY "Users can view their own ROI inputs"
ON public.learning_roi_inputs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own ROI inputs" ON public.learning_roi_inputs;
CREATE POLICY "Users can insert their own ROI inputs"
ON public.learning_roi_inputs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own ROI inputs" ON public.learning_roi_inputs;
CREATE POLICY "Users can update their own ROI inputs"
ON public.learning_roi_inputs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own ROI inputs" ON public.learning_roi_inputs;
CREATE POLICY "Users can delete their own ROI inputs"
ON public.learning_roi_inputs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

REVOKE ALL ON public.learning_roi_inputs FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_roi_inputs TO authenticated;
