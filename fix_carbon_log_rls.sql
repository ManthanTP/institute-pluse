-- ══════════════════════════════════════════════════════════════════
-- FIX: Carbon Log RLS & Missing Columns
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- 1. Fix the UPDATE policy — remove the 1-hour restriction so students
--    can correct their log any time on the same day
DROP POLICY IF EXISTS "carbon_own_update" ON public.carbon_logs;

CREATE POLICY "carbon_own_update" ON public.carbon_logs
  FOR UPDATE
  USING (student_id = auth.uid());

-- 2. Widen the INSERT policy to allow any authenticated student 
--    (remove any date-lock if anti_cheat_migration was run partially)
DROP POLICY IF EXISTS "carbon_own_insert" ON public.carbon_logs;

CREATE POLICY "carbon_own_insert" ON public.carbon_logs
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- 3. (Optional, run only if anti_cheat_migration.sql was applied)
--    Make sure the status column exists for future use. 
--    This is safe to run even if it already exists.
ALTER TABLE public.carbon_logs
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved'
  CHECK (status IN ('approved', 'pending', 'quarantined', 'rejected'));
