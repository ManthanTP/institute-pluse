-- ══════════════════════════════════════════════════════════════════
-- FIX: Carbon Log RLS — COMPREHENSIVE (handles both original schema
-- AND anti_cheat_migration.sql if it was already applied)
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- 1. Fix INSERT policy — remove the date lock entirely
--    Students should be able to log at any point during the day
DROP POLICY IF EXISTS "carbon_own_insert" ON public.carbon_logs;
CREATE POLICY "carbon_own_insert" ON public.carbon_logs
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- 2. Fix UPDATE policy — remove the 2-hour restriction
--    Students should be able to correct their log the same day
DROP POLICY IF EXISTS "carbon_own_update" ON public.carbon_logs;
DROP POLICY IF EXISTS "carbon_admin_update" ON public.carbon_logs;
CREATE POLICY "carbon_own_update" ON public.carbon_logs
  FOR UPDATE
  USING (student_id = auth.uid() OR public.is_admin());

-- 3. Ensure SELECT policy covers all students (safe no-op if already correct)
DROP POLICY IF EXISTS "carbon_own_select" ON public.carbon_logs;
CREATE POLICY "carbon_own_select" ON public.carbon_logs
  FOR SELECT
  USING (student_id = auth.uid() OR public.is_admin());

-- 4. Allow admin to delete logs (for moderation)
DROP POLICY IF EXISTS "carbon_admin_delete" ON public.carbon_logs;
CREATE POLICY "carbon_admin_delete" ON public.carbon_logs
  FOR DELETE
  USING (public.is_admin());

-- 5. Add log_status column (from anti_cheat_migration) if not exists
ALTER TABLE public.carbon_logs
  ADD COLUMN IF NOT EXISTS log_status text NOT NULL DEFAULT 'approved'
  CHECK (log_status IN ('approved', 'quarantined', 'rejected'));

-- 6. Add flagged columns if not exists (from anti_cheat_migration)
ALTER TABLE public.carbon_logs
  ADD COLUMN IF NOT EXISTS flagged boolean NOT NULL DEFAULT false;

ALTER TABLE public.carbon_logs
  ADD COLUMN IF NOT EXISTS flag_type text[];

ALTER TABLE public.carbon_logs
  ADD COLUMN IF NOT EXISTS flag_details jsonb;
