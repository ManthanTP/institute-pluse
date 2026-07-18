-- ══════════════════════════════════════════════════════════════════
-- LANDING SECTIONS SCHEMA & SEED DATA FOR DB: dctrlbxftgvfeqbkatgr
-- Run this script in the Supabase SQL Editor for your active project:
-- https://supabase.com/dashboard/project/dctrlbxftgvfeqbkatgr/sql/new
-- ══════════════════════════════════════════════════════════════════

-- 1. Create landing_sections table
CREATE TABLE IF NOT EXISTS public.landing_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.landing_sections ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
DROP POLICY IF EXISTS "Anyone can read landing sections" ON public.landing_sections;
CREATE POLICY "Anyone can read landing sections" 
  ON public.landing_sections FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Admins can insert landing sections" ON public.landing_sections;
CREATE POLICY "Admins can insert landing sections" 
  ON public.landing_sections FOR INSERT 
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update landing sections" ON public.landing_sections;
CREATE POLICY "Admins can update landing sections" 
  ON public.landing_sections FOR UPDATE 
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete landing sections" ON public.landing_sections;
CREATE POLICY "Admins can delete landing sections" 
  ON public.landing_sections FOR DELETE 
  USING (public.is_admin());

-- 4. Seed Seed Data
INSERT INTO public.landing_sections (section_key, content, is_visible, sort_order) VALUES
('hero', '{"badge": "Live • The Smart Campus OS", "heading": "YOUR CAMPUS.", "ctaPrimary": "Get Started Free", "description": "Next-Gen Campus Intelligence. Decarbonizing Education, Automating Timetables, and Rewarding Sustainable Actions.", "ctaSecondary": "Explore Features", "headingAccent": "SUSTAINABLE. INTELLIGENT. UNIFIED.", "ctaPrimaryLoggedIn": "Go to Dashboard"}', true, 0),
('features', '{"cards": [{"title": "Smart Attendance", "description": "Fast QR check-ins synced to your class timetable. Log present states instantly and view automated attendance statistics without paper."}, {"title": "Eco Track", "description": "Log daily choices, track saved carbon margins, and earn leaderboard points to climb the campus sustainability scoreboards."}, {"title": "Study Planner", "description": "Organize focus sessions, set customized alarms, partition revision by subject codes, and coordinate with peer logs."}, {"title": "Floor Maps", "description": "Navigate buildings room by room. Filter floor maps instantly to locate faculty offices, lecture rooms, and labs."}, {"title": "Events", "description": "Join organized campaigns, support ecological challenges, earn badges, and build credentials."}, {"title": "Smart Cafeteria", "description": "Browse the digital campus menu, pre-order meals, track nutritional info, and view real-time item availability — all from your phone."}, {"title": "Carbon Analytics", "description": "Visualize dynamic emission charts and reductions by transport, food, energy, and waste categories."}, {"title": "Leaderboards", "description": "Check real-time standings, compare weekly XP totals, and compete for top green badges across departments."}, {"title": "Grievance Hub", "description": "File complaints, request maintenance, and track resolution statuses with real-time ticketing."}, {"title": "Lost & Found", "description": "Report lost campus belongings or claim found valuables directly through the automated catalog feed."}, {"title": "Announcements", "description": "Receive instant notifications, timetable modifications, and sustainable guidelines from administrators."}], "sectionLabel": "Features Bento", "sectionTitle": "Designed for smart campus ecosystems."}', true, 1),
('impact', '{"ctaText": "Start Your Journey", "description": "Log your daily commute, meals, and energy usage. Watch your eco-score grow. Compete with peers on the leaderboard. Together, we build a greener campus.", "sectionLabel": "Make An Impact", "sectionTitle": "Every action counts."}', true, 2),
('tech_stack', '{"cards": [{"title": "Core Frontend Stack", "description": "Powered by React and Vite to ensure instant page render speeds, lightweight asset bundles, and fully hardware-accelerated interface transition layers."}, {"title": "Secure Identity Linking", "description": "Utilizes AES verification and time-based expiration values inside QR payloads, effectively blocking roll-call fraud and sync tampering."}, {"title": "Real-time Data Sync", "description": "Direct Supabase backend connection facilitating instantaneous eco-points logging, realtime leaderboard refreshes, and instant food canteen alerts."}], "sectionLabel": "Architecture", "sectionTitle": "Built for speed, security, and scalability."}', true, 3),
('milestones', '{"sectionLabel": "How It Works", "sectionTitle": "Get started in 3 easy steps.", "steps": [{"number": "01", "title": "Create Your Account", "description": "Sign up with your college email. Your eco-profile, timetable, and campus map sync automatically."}, {"number": "02", "title": "Track Your Impact", "description": "Log daily commutes, meals, and energy usage. Watch your carbon score drop and eco-points rise."}, {"number": "03", "title": "Earn & Compete", "description": "Climb the leaderboard, unlock green badges, and join sustainability challenges across departments."}]}', true, 4),
('faq', '{"items": [{"answer": "Instructors generate a time-restricted check-in QR code on the lecture hall screen. Students scan the QR code via their Attendance page. The system checks location validity and student identity to log the attendance record instantly.", "question": "How does QR Smart Attendance work?"}, {"answer": "Eco Points are rewarded for green actions like ridesharing, selecting vegetarian canteen meals, and recycling items. Point values are defined in the sustainability guidelines (e.g. +20 pts for canteen veg selection).", "question": "What are Eco Points and how are they calculated?"}, {"answer": "Yes. All authentication and data transfers are protected under Supabase security protocols, and student records are kept private and accessible only to authorized administrators and the student themselves.", "question": "Is my personal study and logging data secure?"}, {"answer": "Yes, the core system is modularized and can be configured with semester tables, location maps, bus routes, and cafeteria items for any educational institute.", "question": "Can other colleges adopt the InstitutePLUSE platform?"}], "sectionLabel": "FAQ", "sectionTitle": "Frequently Asked Questions"}', true, 5),
('cta', '{"heading": "Ready to go green?", "buttonText": "Create Free Account", "description": "Join thousands of students and faculty making their campus sustainable, one action at a time.", "buttonTextLoggedIn": "Open Dashboard"}', true, 6),
('footer', '{"github": "https://github.com/manthantp", "tagline": "The complete campus ecosystem for modern education. Sustainable, intelligent, and built for everyone.", "linkedin": "https://linkedin.com/in/manthantp", "copyright": "© 2026 InstitutePLUSE. Built for Jain College of Engineering.", "collegeName": "Jain College of Engineering", "contactEmail": "manthantp.work@gmail.com"}', true, 7),
('creator', '{"name": "Manthan Patel", "stats": [{"icon": "Code2", "link": "https://manthantp-portfolio.vercel.app/#projects", "color": "#00f5ff", "label": "Projects", "value": "20+"}, {"icon": "Cpu", "link": "https://manthantp-portfolio.vercel.app/", "color": "#8b5cf6", "label": "Skills", "value": "15+"}, {"icon": "BookOpen", "link": "https://manthantp-portfolio.vercel.app/", "color": "#00f5ff", "label": "Blogs", "value": "10+"}, {"icon": "Trophy", "link": "https://manthantp-portfolio.vercel.app/", "color": "#8b5cf6", "label": "Achievement Unlocks", "value": "12+"}], "skills": ["React", "Next.js", "Supabase", "Tailwind CSS", "TypeScript", "AI Systems", "UI/UX", "Vite"], "githubUrl": "https://github.com/ManthanTP", "connectUrl": "https://manthantp-portfolio.vercel.app/#contact", "description": "Passionate Full Stack Developer focused on AI-powered systems, futuristic UI/UX, and smart campus innovation platforms.", "portfolioUrl": "https://manthantp-portfolio.vercel.app/", "sectionLabel": "The Creator", "sectionTitle": "About The Creator"}', true, 8),
('privacy', '{"sectionTitle": "Privacy Policy", "items": [{"title": "1. Data Collection", "content": "InstitutePLUSE securely logs carbon saving records (commute distances, vehicle modes, energy logs, and canteen meal choices) as well as class QR code check-ins."}, {"title": "2. Secure Encryption", "content": "All student and administrative data is transmitted via Secure Sockets Layer (SSL) and stored securely in our cloud database system, protected by row-level security (RLS)."}, {"title": "3. Data Ownership", "content": "We do not share your campus logs with third-party service providers. All logged records remain property of Jain College of Engineering."}]}', true, 9),
('terms', '{"sectionTitle": "Terms of Service", "items": [{"title": "1. Usage License", "content": "Students and faculty members of Jain College of Engineering are granted permission to access InstitutePLUSE for academic, sustainability tracking, and coordination activities."}, {"title": "2. Accurate Reporting", "content": "Users agree to log genuine, authentic commute methods and attendance sessions. Fraudulent logging of carbon logs or check-in credentials may result in account suspension."}, {"title": "3. Service Access", "content": "While we target 99.9% operational uptime, access to dashboard features may occasionally be paused for system enhancements and database maintenance."}]}', true, 10)
ON CONFLICT (section_key) DO UPDATE 
SET content = EXCLUDED.content, is_visible = EXCLUDED.is_visible, sort_order = EXCLUDED.sort_order;

