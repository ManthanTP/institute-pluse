-- ══════════════════════════════════════════════════════════════════
-- INSTITUTEPULSE — CARBON LOG SAVE FIX
-- Copy ALL of this and paste into Supabase → SQL Editor → Run
-- ══════════════════════════════════════════════════════════════════

-- Step 1: Fix INSERT policy (removes date restriction)
DROP POLICY IF EXISTS "carbon_own_insert" ON public.carbon_logs;
CREATE POLICY "carbon_own_insert" ON public.carbon_logs
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Step 2: Fix UPDATE policy (removes 2-hour window restriction)
DROP POLICY IF EXISTS "carbon_own_update" ON public.carbon_logs;
DROP POLICY IF EXISTS "carbon_admin_update" ON public.carbon_logs;
CREATE POLICY "carbon_own_update" ON public.carbon_logs
  FOR UPDATE USING (student_id = auth.uid() OR public.is_admin());

-- Step 3: Fix SELECT policy (ensure students can read their own logs)
DROP POLICY IF EXISTS "carbon_own_select" ON public.carbon_logs;
CREATE POLICY "carbon_own_select" ON public.carbon_logs
  FOR SELECT USING (student_id = auth.uid() OR public.is_admin());

-- Step 4: Add missing columns safely (no error if already exist)
ALTER TABLE public.carbon_logs
  ADD COLUMN IF NOT EXISTS log_status text DEFAULT 'approved';

ALTER TABLE public.carbon_logs
  ADD COLUMN IF NOT EXISTS flagged boolean DEFAULT false;

ALTER TABLE public.carbon_logs
  ADD COLUMN IF NOT EXISTS flag_type text[];

ALTER TABLE public.carbon_logs
  ADD COLUMN IF NOT EXISTS flag_details jsonb;

-- Step 5: Add constraint on log_status only if column was just added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'carbon_logs_log_status_check'
  ) THEN
    ALTER TABLE public.carbon_logs
      ADD CONSTRAINT carbon_logs_log_status_check
      CHECK (log_status IN ('approved', 'quarantined', 'rejected'));
  END IF;
END $$;

-- Verify: count your logs (should return a number ≥ 0)
SELECT COUNT(*) AS total_logs FROM public.carbon_logs;
