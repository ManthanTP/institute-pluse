-- ══════════════════════════════════════════════════════════════════
-- INSTITUTEPULSE — CARBON LOG INTEGRITY & ANTI-CHEAT SYSTEM
-- Run this entire script in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- ── PHASE 1: Add anti-cheat columns to carbon_logs ──
ALTER TABLE public.carbon_logs
  ADD COLUMN IF NOT EXISTS log_status text NOT NULL DEFAULT 'approved'
    CHECK (log_status IN ('approved','quarantined','rejected')),
  ADD COLUMN IF NOT EXISTS flagged boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS flag_type text[],
  ADD COLUMN IF NOT EXISTS flag_details jsonb,
  ADD COLUMN IF NOT EXISTS student_explanation text,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- ── PHASE 2: Add suspension columns to profiles ──
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS rejection_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sustainability_restricted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS restriction_reason text,
  ADD COLUMN IF NOT EXISTS restricted_at timestamptz,
  ADD COLUMN IF NOT EXISTS restricted_by uuid REFERENCES public.profiles(id);

-- ── PHASE 3: Create carbon_log_thresholds table ──
CREATE TABLE IF NOT EXISTS public.carbon_log_thresholds (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  transport_max_km float NOT NULL DEFAULT 80,
  walk_quarantine_km float NOT NULL DEFAULT 15,
  cycle_quarantine_km float NOT NULL DEFAULT 40,
  total_km_quarantine float NOT NULL DEFAULT 60,
  ac_quarantine_hours float NOT NULL DEFAULT 12,
  laptop_quarantine_hrs float NOT NULL DEFAULT 16,
  device_hard_max_hrs float NOT NULL DEFAULT 24,
  shower_hard_max_min float NOT NULL DEFAULT 60,
  shower_quarantine_min float NOT NULL DEFAULT 30,
  waste_hard_max_kg float NOT NULL DEFAULT 10,
  waste_quarantine_kg float NOT NULL DEFAULT 5,
  updated_by uuid REFERENCES public.profiles(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed one default row (campus-wide config)
INSERT INTO public.carbon_log_thresholds (id)
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- RLS for thresholds
ALTER TABLE public.carbon_log_thresholds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "thresholds_select_all" ON public.carbon_log_thresholds;
CREATE POLICY "thresholds_select_all" ON public.carbon_log_thresholds FOR SELECT USING (true);
DROP POLICY IF EXISTS "thresholds_admin_all" ON public.carbon_log_thresholds;
CREATE POLICY "thresholds_admin_all" ON public.carbon_log_thresholds FOR ALL USING (public.is_admin());

-- ── PHASE 4: Update carbon_logs RLS policies ──
-- Drop existing insert policy and replace with yesterday-date-lock
DROP POLICY IF EXISTS "carbon_own_insert" ON public.carbon_logs;
CREATE POLICY "carbon_own_insert" ON public.carbon_logs FOR INSERT
  WITH CHECK (
    student_id = auth.uid()
    AND log_date = CURRENT_DATE - INTERVAL '1 day'
  );

-- Update policy: allow admin to update (for moderation) OR student within 2 hours
DROP POLICY IF EXISTS "carbon_own_update" ON public.carbon_logs;
DROP POLICY IF EXISTS "carbon_admin_update" ON public.carbon_logs;
CREATE POLICY "carbon_own_update" ON public.carbon_logs FOR UPDATE
  USING (
    (student_id = auth.uid() AND created_at > now() - interval '2 hours')
    OR public.is_admin()
  );

-- ── PHASE 5: Helper function for moderation stats ──
CREATE OR REPLACE FUNCTION public.get_moderation_stats()
RETURNS json LANGUAGE sql SECURITY DEFINER AS $$
  SELECT json_build_object(
    'pending', (SELECT COUNT(*) FROM public.carbon_logs WHERE log_status = 'quarantined' AND reviewed_at IS NULL),
    'approved_today', (SELECT COUNT(*) FROM public.carbon_logs WHERE log_status = 'approved' AND reviewed_at::date = CURRENT_DATE),
    'rejected_today', (SELECT COUNT(*) FROM public.carbon_logs WHERE log_status = 'rejected' AND reviewed_at::date = CURRENT_DATE),
    'suspended', (SELECT COUNT(*) FROM public.profiles WHERE sustainability_restricted = true)
  );
$$;

-- Grant execute to authenticated users (admin check done client-side)
GRANT EXECUTE ON FUNCTION public.get_moderation_stats() TO authenticated;
