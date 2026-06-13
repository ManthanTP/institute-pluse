-- ══════════════════════════════════════════════════════════════════
-- INSTITUTEPULSE — CAMPUS GREEN COVER & CO2 NEUTRALIZATION TRACKER
-- Run this entire script in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- TABLE 1: Campus Green Cover entries
CREATE TABLE IF NOT EXISTS public.campus_green_cover (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text NOT NULL,
  type            text NOT NULL CHECK (type IN (
                    'large_tree', 'medium_tree', 'small_tree',
                    'large_shrub', 'small_plant', 'indoor_plant', 'lawn'
                  )),
  count           integer DEFAULT 1,
  area_sqm        float DEFAULT NULL,
  zone            text NOT NULL DEFAULT 'General',
  latitude        float DEFAULT NULL,
  longitude       float DEFAULT NULL,
  date_planted    date DEFAULT NULL,
  co2_factor_kg_day float NOT NULL DEFAULT 0.040,
  notes           text DEFAULT NULL,
  added_by        uuid REFERENCES public.profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- TABLE 2: Daily snapshots for charts and history
CREATE TABLE IF NOT EXISTS public.green_cover_snapshots (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date         date NOT NULL UNIQUE,
  total_large_trees     integer DEFAULT 0,
  total_medium_trees    integer DEFAULT 0,
  total_small_trees     integer DEFAULT 0,
  total_shrubs          integer DEFAULT 0,
  total_plants          integer DEFAULT 0,
  total_indoor_plants   integer DEFAULT 0,
  total_lawn_sqm        float DEFAULT 0,
  total_trees_count     integer DEFAULT 0,
  total_plants_count    integer DEFAULT 0,
  total_co2_absorbed_kg float DEFAULT 0,
  total_student_co2_kg  float DEFAULT 0,
  net_carbon_kg         float DEFAULT 0,
  is_carbon_neutral     boolean DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.campus_green_cover ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.green_cover_snapshots ENABLE ROW LEVEL SECURITY;

-- Students can read green cover data
DROP POLICY IF EXISTS "green_cover_select_authenticated" ON public.campus_green_cover;
CREATE POLICY "green_cover_select_authenticated"
  ON public.campus_green_cover FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "green_snapshots_select_authenticated" ON public.green_cover_snapshots;
CREATE POLICY "green_snapshots_select_authenticated"
  ON public.green_cover_snapshots FOR SELECT
  TO authenticated USING (true);

-- Only admin can insert / update / delete green cover
DROP POLICY IF EXISTS "green_cover_admin_all" ON public.campus_green_cover;
CREATE POLICY "green_cover_admin_all"
  ON public.campus_green_cover FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "green_snapshots_admin_all" ON public.green_cover_snapshots;
CREATE POLICY "green_snapshots_admin_all"
  ON public.green_cover_snapshots FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── SEED DEMO DATA (remove in production) ──
INSERT INTO public.campus_green_cover (name, type, count, area_sqm, zone, co2_factor_kg_day, notes)
VALUES
  ('Mango Trees — Main Block', 'large_tree', 18, NULL, 'Main Block', 0.060, 'Old mango trees near entrance'),
  ('Neem Trees — Hostel Quad', 'large_tree', 12, NULL, 'Hostel Area', 0.060, 'Provides shade for hostel block'),
  ('Gulmohar Row — Library Path', 'medium_tree', 24, NULL, 'Library Garden', 0.040, 'Decorative gulmohar row'),
  ('Ashoka Trees — Admin Block', 'medium_tree', 8, NULL, 'Admin Block', 0.040, NULL),
  ('Coconut Palms — Sports Ground', 'small_tree', 15, NULL, 'Sports Area', 0.025, NULL),
  ('Shrubs — Entrance Garden', 'large_shrub', 45, NULL, 'Main Entrance', 0.010, 'Mixed ornamental shrubs'),
  ('Potted Plants — All Corridors', 'indoor_plant', 120, NULL, 'Corridors', 0.001, 'Distributed across all floors'),
  ('Front Lawn', 'lawn', NULL, 800, 'Main Entrance', 0.002, 'Primary lawn area'),
  ('Quad Garden Lawn', 'lawn', NULL, 400, 'Central Quad', 0.002, NULL),
  ('Saplings — Tree Plantation Drive', 'small_plant', 80, NULL, 'Campus Boundary', 0.003, 'Planted in 2024 drive')
ON CONFLICT DO NOTHING;
