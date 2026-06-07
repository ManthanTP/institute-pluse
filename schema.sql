-- ══════════════════════════════════════════════════════════════════
-- INSTITUTEPULSE DATABASE SCHEMA
-- Run this entire script in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- ENABLE EXTENSIONS
create extension if not exists "uuid-ossp";

-- ── 1. PROFILES ──
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  role text not null default 'student' check (role in ('student', 'driver', 'admin')),
  phone text,
  department text,
  avatar_url text,
  eco_points integer not null default 0,
  total_co2_kg numeric(10,3) not null default 0,
  logging_streak integer not null default 0,
  last_log_date date,
  notification_prefs jsonb default '{"eco":true,"bus":true,"order":true,"attendance":true,"challenge":true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── 2. CARBON LOGS ──
create table if not exists public.carbon_logs (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  log_date date not null,
  transport_kg numeric(8,3) not null default 0,
  electricity_kg numeric(8,3) not null default 0,
  food_kg numeric(8,3) not null default 0,
  water_kg numeric(8,3) not null default 0,
  waste_kg numeric(8,3) not null default 0,
  total_kg numeric(8,3) not null default 0,
  eco_score integer not null default 0 check (eco_score >= 0 and eco_score <= 100),
  eco_points_earned integer not null default 0,
  transport_mode text,
  transport_km numeric(6,2),
  transport_detail jsonb,
  meals_detail jsonb,
  devices_detail jsonb,
  water_detail jsonb,
  waste_detail jsonb,
  ai_tips jsonb,
  created_at timestamptz not null default now(),
  unique (student_id, log_date)
);

-- ── 3. ECO BADGES ──
create table if not exists public.eco_badges (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  badge_key text not null,
  earned_at timestamptz not null default now(),
  unique (student_id, badge_key)
);


-- ── 6. BUSES ──
create table if not exists public.buses (
  id uuid default uuid_generate_v4() primary key,
  bus_number text not null unique,
  route_name text not null,
  driver_id uuid references public.profiles(id),
  driver_name text,
  status text not null default 'stopped' check (status in ('on_route', 'delayed', 'stopped')),
  capacity integer not null default 40,
  created_at timestamptz not null default now()
);

-- ── 7. BUS LOCATIONS ──
create table if not exists public.bus_locations (
  id uuid default uuid_generate_v4() primary key,
  bus_id uuid references public.buses(id) on delete cascade not null unique,
  latitude numeric(10,7),
  longitude numeric(10,7),
  accuracy_m numeric(6,1),
  updated_at timestamptz not null default now()
);

-- ── 8. MENU ITEMS ──
create table if not exists public.menu_items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  category text not null check (category in ('breakfast', 'lunch', 'snacks', 'beverages', 'dinner')),
  price numeric(8,2) not null,
  carbon_kg numeric(6,3) not null default 0,
  is_vegetarian boolean not null default true,
  is_vegan boolean not null default false,
  available boolean not null default true,
  image_url text,
  created_at timestamptz not null default now()
);

-- ── 9. ORDERS ──
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  items jsonb not null,
  total_price numeric(10,2) not null,
  total_carbon_kg numeric(8,3) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
  token_number integer,
  qr_code text unique,
  special_instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── 10. ATTENDANCE SESSIONS ──
create table if not exists public.attendance_sessions (
  id uuid default uuid_generate_v4() primary key,
  teacher_id uuid references public.profiles(id),
  subject text not null,
  qr_code text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- ── 11. ATTENDANCE RECORDS ──
create table if not exists public.attendance_records (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.attendance_sessions(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  marked_at timestamptz not null default now(),
  unique (session_id, student_id)
);

-- ── 12. COMPLAINTS ──
create table if not exists public.complaints (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  category text not null,
  title text not null,
  description text not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  admin_response text,
  responded_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── 13. LOST & FOUND ──
create table if not exists public.lost_found_items (
  id uuid default uuid_generate_v4() primary key,
  reported_by uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('lost', 'found')),
  item_name text not null,
  description text not null,
  location_found text,
  image_url text,
  status text not null default 'open' check (status in ('open', 'claimed', 'closed')),
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── 14. CAMPUS LOCATIONS ──
create table if not exists public.campus_locations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null,
  building text,
  floor text,
  description text,
  lat numeric(10,7),
  lng numeric(10,7),
  created_at timestamptz not null default now()
);

-- ── 15. NOTIFICATIONS ──
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'general',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES
-- ══════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.carbon_logs enable row level security;
alter table public.eco_badges enable row level security;

alter table public.buses enable row level security;
alter table public.bus_locations enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.complaints enable row level security;
alter table public.lost_found_items enable row level security;
alter table public.campus_locations enable row level security;
alter table public.notifications enable row level security;

-- Helper function: is current user admin?
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper function: is current user driver?
create or replace function public.is_driver()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('driver', 'admin')
  );
$$;

-- PROFILES RLS
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
-- Allow leaderboard reads (points/name only) — admins can see all
create policy "profiles_select_leaderboard" on public.profiles for select using (true);

-- CARBON LOGS RLS
create policy "carbon_own_select" on public.carbon_logs for select using (student_id = auth.uid() or public.is_admin());
create policy "carbon_own_insert" on public.carbon_logs for insert with check (student_id = auth.uid());
create policy "carbon_own_update" on public.carbon_logs for update using (student_id = auth.uid() and (created_at > now() - interval '1 hour'));

-- ECO BADGES RLS
create policy "badges_own_select" on public.eco_badges for select using (student_id = auth.uid() or public.is_admin());
create policy "badges_system_insert" on public.eco_badges for insert with check (student_id = auth.uid() or public.is_admin());



-- BUSES RLS (public read)
create policy "buses_all_select" on public.buses for select using (true);
create policy "buses_admin_all" on public.buses for all using (public.is_admin());

-- BUS LOCATIONS RLS (public read, driver write)
create policy "bus_loc_all_select" on public.bus_locations for select using (true);
create policy "bus_loc_driver_upsert" on public.bus_locations for insert with check (public.is_driver());
create policy "bus_loc_driver_update" on public.bus_locations for update using (public.is_driver());

-- MENU ITEMS RLS (public read)
create policy "menu_all_select" on public.menu_items for select using (true);
create policy "menu_admin_all" on public.menu_items for all using (public.is_admin());

-- ORDERS RLS
create policy "orders_own_select" on public.orders for select using (student_id = auth.uid() or public.is_admin());
create policy "orders_own_insert" on public.orders for insert with check (student_id = auth.uid());
create policy "orders_admin_update" on public.orders for update using (public.is_admin());

-- COMPLAINTS RLS
create policy "complaints_own_select" on public.complaints for select using (student_id = auth.uid() or public.is_admin());
create policy "complaints_own_insert" on public.complaints for insert with check (student_id = auth.uid());
create policy "complaints_admin_update" on public.complaints for update using (public.is_admin());

-- LOST & FOUND RLS
create policy "lf_all_select" on public.lost_found_items for select using (true);
create policy "lf_own_insert" on public.lost_found_items for insert with check (reported_by = auth.uid());
create policy "lf_admin_update" on public.lost_found_items for update using (public.is_admin());

-- CAMPUS LOCATIONS (public read)
create policy "campus_all_select" on public.campus_locations for select using (true);
create policy "campus_admin_all" on public.campus_locations for all using (public.is_admin());

-- NOTIFICATIONS RLS
create policy "notif_own_select" on public.notifications for select using (user_id = auth.uid() or public.is_admin());
create policy "notif_own_update" on public.notifications for update using (user_id = auth.uid());
create policy "notif_admin_insert" on public.notifications for insert with check (public.is_admin() or auth.uid() is not null);

-- ATTENDANCE RLS
create policy "att_sessions_all" on public.attendance_sessions for select using (true);
create policy "att_records_own" on public.attendance_records for select using (student_id = auth.uid() or public.is_admin());
create policy "att_records_own_insert" on public.attendance_records for insert with check (student_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════
-- REALTIME SUBSCRIPTIONS (enable for live features)
-- ══════════════════════════════════════════════════════════════════
alter publication supabase_realtime add table public.bus_locations;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.notifications;

-- ══════════════════════════════════════════════════════════════════
-- SEED DATA (demo)
-- ══════════════════════════════════════════════════════════════════

-- Sample campus locations
insert into public.campus_locations (name, type, building, floor, description) values
  ('Main Library', 'office', 'Block A', 'G', 'Central library with study rooms'),
  ('CS Lab 1', 'lab', 'Block B', '1', '60 computer workstations'),
  ('Main Canteen', 'canteen', 'Block C', 'G', 'Open 8am-8pm'),
  ('Admin Office', 'office', 'Block A', 'G', 'Principal, registrar'),
  ('Seminar Hall', 'classroom', 'Block A', '3', 'Capacity 200 students'),
  ('Sports Ground', 'sports', 'Outdoor', 'G', 'Cricket, football, basketball')
on conflict do nothing;

-- Sample menu items
insert into public.menu_items (name, description, category, price, carbon_kg, is_vegetarian, is_vegan) values
  ('Masala Dosa', 'Crispy dosa with spicy potato filling', 'breakfast', 40, 0.5, true, false),
  ('Idli Sambar', 'Soft idlis with fresh sambar', 'breakfast', 30, 0.3, true, true),
  ('Veg Fried Rice', 'Stir-fried rice with vegetables', 'lunch', 60, 0.6, true, true),
  ('Chicken Biryani', 'Aromatic basmati with chicken', 'lunch', 90, 1.5, false, false),
  ('Fruit Salad', 'Fresh seasonal fruits', 'snacks', 35, 0.1, true, true),
  ('Samosa (2 pcs)', 'Crispy fried pastry', 'snacks', 20, 0.3, true, false),
  ('Masala Chai', 'Spiced Indian tea', 'beverages', 15, 0.1, true, false),
  ('Nimbu Pani', 'Fresh lime water', 'beverages', 20, 0.05, true, true)
on conflict do nothing;

-- Sample buses
insert into public.buses (bus_number, route_name, driver_name, status) values
  ('Bus 1', 'City Center Route', 'Ravi Kumar', 'on_route'),
  ('Bus 2', 'North Campus Route', 'Suresh Babu', 'on_route'),
  ('Bus 3', 'South Gate Route', 'Mohan Lal', 'on_route'),
  ('Bus 4', 'Tech Park Route', 'Prakash', 'stopped')
on conflict (bus_number) do nothing;


-- ══════════════════════════════════════════════════════════════════
-- FUNCTIONS FOR AUTO-PROFILE CREATION
-- ══════════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_role text;
  v_semester_id uuid;
  v_division_id uuid;
begin
  -- Determine role, default to 'student' if not provided or invalid
  v_role := coalesce(new.raw_user_meta_data->>'role', 'student');
  if v_role not in ('student', 'faculty', 'admin', 'driver', 'owner') then
    v_role := 'student';
  end if;

  -- Safely cast semester_id and division_id to UUID
  begin
    v_semester_id := (new.raw_user_meta_data->>'semester_id')::uuid;
  exception when others then
    v_semester_id := null;
  end;

  begin
    v_division_id := (new.raw_user_meta_data->>'division_id')::uuid;
  exception when others then
    v_division_id := null;
  end;

  insert into public.profiles (
    id, full_name, role, email, phone, department, usn,
    semester_id, division_id, eco_points
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    v_role,
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'department', ''),
    coalesce(new.raw_user_meta_data->>'usn', ''),
    v_semester_id,
    v_division_id,
    20 -- welcome bonus
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = excluded.role,
    email = excluded.email,
    phone = excluded.phone,
    department = excluded.department,
    usn = excluded.usn,
    semester_id = excluded.semester_id,
    division_id = excluded.division_id,
    updated_at = now();
  return new;
end;
$$;

-- Trigger to auto-create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
