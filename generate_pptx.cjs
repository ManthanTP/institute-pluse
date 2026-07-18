const PptxGenJS = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// ── Config ──
const SCREENSHOT_DIR = path.join(__dirname, "screenshoot");
const OUTPUT = path.join(__dirname, "InstitutePulse_Presentation.pptx");

// ── Colors (hex without #) ──
const BG      = "020617";
const CARD_BG = "0F172A";
const WHITE   = "F8FAFC";
const GREEN   = "22C55E";
const BLUE    = "3B82F6";
const AMBER   = "F59E0B";
const GRAY    = "94A3B8";
const PURPLE  = "8B5CF6";
const CYAN    = "06B6D4";
const DIM     = "64748B";

// ── Create presentation ──
const pptx = new PptxGenJS();
pptx.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
pptx.layout = "WIDE";

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

function addBg(slide) {
  slide.background = { color: BG };
}

function topAccent(slide, color = GREEN) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.333, h: 0.05,
    fill: { color }, line: { width: 0 }
  });
}

function bottomAccent(slide, color = BLUE) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.45, w: 13.333, h: 0.05,
    fill: { color }, line: { width: 0 }
  });
}

function addBar(slide, x, y, w, h, color) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h, fill: { color }, line: { width: 0 }
  });
}

function addCard(slide, x, y, w, h, color = CARD_BG) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color },
    line: { width: 0 },
    rectRadius: 0.1
  });
}

function addText(slide, text, opts) {
  slide.addText(text, {
    fontFace: "Calibri",
    color: WHITE,
    fontSize: 14,
    bold: false,
    align: "left",
    valign: "top",
    wrap: true,
    ...opts
  });
}

function slideNum(slide, num) {
  addText(slide, `${num}/13`, {
    x: 11.8, y: 7.05, w: 1.3, h: 0.35,
    fontSize: 9, color: DIM, align: "right"
  });
}

// ═══════════════════════════════════════════════════════
// SLIDE 1 — TITLE
// ═══════════════════════════════════════════════════════
function slide1() {
  const s = pptx.addSlide();
  addBg(s);
  topAccent(s, GREEN);
  bottomAccent(s, BLUE);

  // Side accent bars
  addBar(s, 0, 0, 0.04, 7.5, GREEN);
  addBar(s, 13.293, 0, 0.04, 7.5, BLUE);

  // App Name
  addText(s, "InstitutePLUSE", {
    x: 0.5, y: 0.5, w: 12.3, h: 0.9,
    fontSize: 48, color: GREEN, bold: true, align: "center"
  });

  // Tagline
  addText(s, "Platform for Learning, Utility, Sustainability & Engagement", {
    x: 1, y: 1.35, w: 11.3, h: 0.5,
    fontSize: 18, color: GRAY, align: "center"
  });

  // Divider
  addBar(s, 5.5, 2.0, 2.333, 0.03, BLUE);

  // Subject info
  addText(s, "Subject Code: 1BPRJ258", {
    x: 1, y: 2.15, w: 11.3, h: 0.35,
    fontSize: 14, color: BLUE, bold: true, align: "center"
  });
  addText(s, "Interdisciplinary Project-Based Learning  |  Week 15–16", {
    x: 1, y: 2.5, w: 11.3, h: 0.35,
    fontSize: 13, color: AMBER, align: "center"
  });

  // ── Team Members Card ──
  addCard(s, 0.8, 3.15, 5.8, 3.6);
  addBar(s, 0.8, 3.15, 5.8, 0.04, GREEN);

  addText(s, "TEAM MEMBERS", {
    x: 1.1, y: 3.3, w: 5.2, h: 0.4,
    fontSize: 14, color: GREEN, bold: true
  });

  const members = [
    { name: "Mallikarjun B Chikkabasur  —  CS",  dot: GREEN },
    { name: "Manoj G Raikar  —  CS",              dot: GREEN },
    { name: "Manthan T Patel  —  CS",             dot: GREEN },
    { name: "Bheemappa Talawar  —  AIML",         dot: PURPLE },
    { name: "Kasirayagouda Umannavar  —  E&C",    dot: AMBER },
    { name: "Premkumar S Koppal  —  ME",          dot: CYAN },
  ];

  members.forEach((m, i) => {
    addBar(s, 1.2, 3.85 + i * 0.45, 0.08, 0.08, m.dot);
    addText(s, m.name, {
      x: 1.45, y: 3.78 + i * 0.45, w: 4.8, h: 0.35,
      fontSize: 12, color: WHITE
    });
  });

  // ── Guide Card ──
  addCard(s, 6.8, 3.15, 5.8, 3.6);
  addBar(s, 6.8, 3.15, 5.8, 0.04, BLUE);

  addText(s, "UNDER THE GUIDANCE OF", {
    x: 7.1, y: 3.3, w: 5.2, h: 0.4,
    fontSize: 14, color: BLUE, bold: true
  });

  addText(s, "Prof. Somashekar T M", {
    x: 7.1, y: 3.9, w: 5.2, h: 0.5,
    fontSize: 22, color: WHITE, bold: true
  });

  addText(s, "Assistant Professor", {
    x: 7.1, y: 4.5, w: 5.2, h: 0.3,
    fontSize: 13, color: GRAY
  });

  addText(s, "Department of ME", {
    x: 7.1, y: 4.85, w: 5.2, h: 0.3,
    fontSize: 13, color: GRAY
  });

  addBar(s, 7.1, 5.4, 4, 0.02, DIM);

  addText(s, "Jain College of Engineering, Belagavi", {
    x: 7.1, y: 5.55, w: 5.2, h: 0.3,
    fontSize: 12, color: DIM
  });

  slideNum(s, 1);
}

// ═══════════════════════════════════════════════════════
// CONTENT SLIDE BUILDER
// ═══════════════════════════════════════════════════════

function contentSlide(num, title, subtitle, bullets, imgFile, accent, twoImgs) {
  const s = pptx.addSlide();
  addBg(s);
  topAccent(s, accent);
  bottomAccent(s, accent);

  // Header accent dot
  addBar(s, 0.6, 0.45, 0.12, 0.35, accent);

  // Title
  addText(s, title, {
    x: 0.9, y: 0.35, w: 5.5, h: 0.6,
    fontSize: 28, color: WHITE, bold: true
  });

  // Subtitle
  addText(s, subtitle, {
    x: 0.9, y: 0.95, w: 5.5, h: 0.4,
    fontSize: 11, color: GRAY
  });

  // Bullet points
  bullets.forEach((b, i) => {
    addBar(s, 1.0, 1.55 + i * 0.58 + 0.07, 0.07, 0.07, accent);
    addText(s, b, {
      x: 1.25, y: 1.48 + i * 0.58, w: 4.8, h: 0.5,
      fontSize: 11, color: WHITE
    });
  });

  // Images
  if (twoImgs) {
    const img1 = path.join(SCREENSHOT_DIR, twoImgs[0]);
    const img2 = path.join(SCREENSHOT_DIR, twoImgs[1]);

    // Card backgrounds for images
    addCard(s, 6.2, 0.3, 3.3, 6.8, CARD_BG);
    addCard(s, 9.7, 0.3, 3.3, 6.8, CARD_BG);

    if (fs.existsSync(img1)) {
      s.addImage({
        path: img1,
        x: 6.35, y: 0.5,
        w: 3.0, h: 6.4,
        sizing: { type: "contain", w: 3.0, h: 6.4 },
        rounding: true
      });
    }
    if (fs.existsSync(img2)) {
      s.addImage({
        path: img2,
        x: 9.85, y: 0.5,
        w: 3.0, h: 6.4,
        sizing: { type: "contain", w: 3.0, h: 6.4 },
        rounding: true
      });
    }
  } else if (imgFile) {
    const imgPath = path.join(SCREENSHOT_DIR, imgFile);

    // Card background for image
    addCard(s, 6.2, 0.3, 6.8, 6.8, CARD_BG);

    if (fs.existsSync(imgPath)) {
      s.addImage({
        path: imgPath,
        x: 6.4, y: 0.5,
        w: 6.4, h: 6.4,
        sizing: { type: "contain", w: 6.4, h: 6.4 },
        rounding: true
      });
    }
  }

  slideNum(s, num);
}

// ═══════════════════════════════════════════════════════
// SLIDE 2 — BRAND MEANING
// ═══════════════════════════════════════════════════════

function slideBrandMeaning() {
  const s = pptx.addSlide();
  addBg(s);
  topAccent(s, GREEN);
  bottomAccent(s, BLUE);

  // Header accent dot
  addBar(s, 0.6, 0.45, 0.12, 0.35, GREEN);

  // Title
  addText(s, "Brand Identity & Vision", {
    x: 0.9, y: 0.35, w: 11.5, h: 0.6,
    fontSize: 28, color: WHITE, bold: true
  });

  // Subtitle
  addText(s, "InstitutePLUSE: Building Smarter, Greener & More Connected Campuses.", {
    x: 0.9, y: 0.95, w: 11.5, h: 0.4,
    fontSize: 12, color: GREEN, bold: true
  });

  const cards = [
    { letter: "P", name: "Platform", color: GREEN, desc: "A unified SaaS-grade portal connecting all students, faculty, and administrators." },
    { letter: "L", name: "Learning", color: BLUE, desc: "Promoting educational growth with Focus Timers, Study Alarms, and Resource Hubs." },
    { letter: "U", name: "Utility", color: AMBER, desc: "Simplifying campus life with QR Attendance, digital Canteen, and interactive maps." },
    { letter: "S", name: "Sustainability", color: GREEN, desc: "Log carbon footprints, track campus green covers, and earn eco-points." },
    { letter: "E", name: "Engagement", color: PURPLE, desc: "Motivating communities through team challenges, events, and live leaderboards." }
  ];

  const w = 2.2;
  const h = 4.2;
  const y = 1.8;
  const spacing = 0.283;

  cards.forEach((c, idx) => {
    const x = 0.6 + idx * (w + spacing);
    addCard(s, x, y, w, h, CARD_BG);
    addBar(s, x, y, w, 0.05, c.color);

    // Large letter
    addText(s, c.letter, {
      x: x + 0.1, y: y + 0.3, w: w - 0.2, h: 1.0,
      fontSize: 54, color: c.color, bold: true, align: "center"
    });

    // Name
    addText(s, c.name, {
      x: x + 0.1, y: y + 1.4, w: w - 0.2, h: 0.4,
      fontSize: 16, color: WHITE, bold: true, align: "center"
    });

    // Description
    addText(s, c.desc, {
      x: x + 0.15, y: y + 2.0, w: w - 0.3, h: 2.0,
      fontSize: 11, color: GRAY, align: "center"
    });
  });

  slideNum(s, 2);
}

// ═══════════════════════════════════════════════════════
// SLIDE 13 — THANK YOU
// ═══════════════════════════════════════════════════════

function slide13() {
  const s = pptx.addSlide();
  addBg(s);
  topAccent(s, GREEN);
  bottomAccent(s, BLUE);

  addBar(s, 0, 0, 0.04, 7.5, GREEN);
  addBar(s, 13.293, 0, 0.04, 7.5, BLUE);

  // Thank You
  addText(s, "Thank You!", {
    x: 1, y: 1.6, w: 11.3, h: 1.2,
    fontSize: 56, color: WHITE, bold: true, align: "center"
  });

  // Tagline
  addText(s, "InstitutePLUSE — Building Smarter, Greener & More Connected Campuses.", {
    x: 1, y: 2.9, w: 11.3, h: 0.5,
    fontSize: 20, color: GREEN, align: "center"
  });

  // Divider
  addBar(s, 5, 3.6, 3.333, 0.03, DIM);

  // Tech stack
  addText(s, "React + Vite  •  Tailwind CSS v4  •  Supabase  •  Capacitor  •  Framer Motion", {
    x: 1, y: 3.85, w: 11.3, h: 0.4,
    fontSize: 12, color: GRAY, align: "center"
  });

  // SDGs
  addText(s, "🎯 UN SDG: Goal 4 (Education)  •  Goal 11 (Sustainable Cities)  •  Goal 12 (Responsible Consumption)  •  Goal 13 (Climate Action)", {
    x: 1, y: 4.35, w: 11.3, h: 0.4,
    fontSize: 11, color: AMBER, align: "center"
  });

  // Bottom card
  addCard(s, 3.5, 5.1, 6.333, 1.7);
  addBar(s, 3.5, 5.1, 6.333, 0.03, GREEN);

  addText(s, "Subject: 1BPRJ258 — Interdisciplinary Project-Based Learning", {
    x: 3.7, y: 5.2, w: 5.9, h: 0.3,
    fontSize: 11, color: BLUE, bold: true, align: "center"
  });
  addText(s, "Guide: Prof. Somashekar T M  |  Dept. of ME", {
    x: 3.7, y: 5.55, w: 5.9, h: 0.3,
    fontSize: 11, color: WHITE, align: "center"
  });
  addText(s, "Jain College of Engineering, Belagavi", {
    x: 3.7, y: 5.85, w: 5.9, h: 0.3,
    fontSize: 11, color: GRAY, align: "center"
  });
  addText(s, "Week 15–16  |  2025–26", {
    x: 3.7, y: 6.2, w: 5.9, h: 0.3,
    fontSize: 10, color: DIM, align: "center"
  });

  slideNum(s, 13);
}

// ═══════════════════════════════════════════════════════
// BUILD ALL 13 SLIDES
// ═══════════════════════════════════════════════════════

// Slide 1: Title
slide1();

// Slide 2: Brand Meaning
slideBrandMeaning();

// Slide 3: Landing Page
contentSlide(3,
  "Landing Page",
  "The first impression — a premium, responsive web experience",
  [
    "Dark futuristic design with gradient accents",
    "App download (Android APK) with one click",
    "Feature showcase with animated sections",
    "Role-based login: Student, Faculty, Admin, Owner",
    "Real-time campus statistics counter",
    "Interactive navigation with smooth scrolling",
    "UN SDG alignment badges displayed",
    "Fully responsive — mobile & desktop",
  ],
  "landing page IP.png", BLUE
);

// Slide 4: Authentication (2 images)
contentSlide(4,
  "Authentication System",
  "Secure role-based sign-in & sign-up with brute-force protection",
  [
    "Role-based routing: Student / Faculty / Admin / Owner",
    "Supabase Auth with PostgreSQL RLS security",
    "Brute-force lockout — 3 attempts → 60s block",
    "Hidden admin URL path for extra security",
    "Batch & department selection on sign-up",
    "Profile avatar upload with real-time preview",
    "Email validation & password strength check",
    "Auto-redirect based on authenticated role",
  ],
  null, PURPLE,
  ["Signin Page IP.png", "Signup Page IP.png"]
);

// Slide 5: Student Dashboard
contentSlide(5,
  "Student Dashboard",
  "A personalized command center for every student",
  [
    "Real-time XP level & progress bar",
    "Eco Score gauge with daily insights",
    "Attendance percentage tracker",
    "Quick-action cards: Log Carbon, Scan QR, Events",
    "Streak counter & badge showcase",
    "Upcoming classes & assignment reminders",
    "Campus broadcast alert banners",
    "Leaderboard ranking preview",
  ],
  "Student Dashboard.png", GREEN
);

// Slide 6: Carbon Footprint Tracker
contentSlide(6,
  "Carbon Footprint Tracker",
  "IPCC-standard daily carbon logging with gamified rewards",
  [
    "Log travel: Car, Bike, Bus, Walk (per-km CO₂ factors)",
    "Electricity: Indian Grid factor 0.82 kg CO₂/kWh",
    "Meals: Veg / Vegan / Non-Veg carbon values",
    "Water usage & waste generation tracking",
    "Eco Score = max(0, 100 − (Emissions/5.0) × 100)",
    "XP rewards: +10 base, +60 perfect, +15 walk/vegan",
    "Streaks: 3-day (+30), 7-day (+75), 30-day (+200 XP)",
    "Anti-cheat: yesterday-only, hard limits, cross-check",
  ],
  "carbon sycn IP.png", GREEN
);

// Slide 7: QR Attendance
contentSlide(7,
  "Timed QR Attendance",
  "Anti-proxy attendance with GPS verification & real-time tracking",
  [
    "Batch-specific QR codes tied to class timetable",
    "QR codes cycle every 10 seconds",
    "GPS geolocation verification — campus fence",
    "One scan per device — prevents proxy sharing",
    "Faculty: real-time present/absent list",
    "Extend timers, assign substitutes, cancel classes",
    "Attendance analytics with date-range filtering",
    "Export to Excel/PDF with verification QR codes",
  ],
  "Attendence IP.png", BLUE
);

// Slide 8: Faculty Dashboard
contentSlide(8,
  "Faculty Dashboard",
  "Complete class management & academic resource hub",
  [
    "Manage classes: cancel, reschedule, swap rooms",
    "Assign substitute faculty with one click",
    "Academic Resource Hub: upload PDFs, links, videos",
    "Subject-wise resource organization",
    "Award XP trophies directly to students",
    "Push notifications to student devices",
    "Attendance history & analytics per batch",
    "Quick actions for day-to-day operations",
  ],
  "faculty dashboard IP.png", BLUE
);

// Slide 9: Eco-Cafeteria
contentSlide(9,
  "Eco-Cafeteria Hub",
  "Digital canteen ordering with carbon labels per menu item",
  [
    "Full digital menu with pricing & carbon weight",
    "Carbon labels: Idli (0.3 kg), Egg Rice (1.0 kg CO₂)",
    "Cart shows cumulative price + CO₂ impact",
    "QR receipt generation for pickup",
    "Real-time order status: Pending → Ready → Done",
    "Canteen owner scanner for instant fulfillment",
    "Anti-cheat cross-reference with carbon logs",
    "Category-wise filtering & search",
  ],
  "Cafeteria Hub Manage IP.png", AMBER
);

// Slide 10: Events (2 images)
contentSlide(10,
  "Events & Team Registration",
  "Solo / Duo / Trio / Squad event registration with invite system",
  [
    "Multiple team formats: Solo, Duo, Trio, Squad",
    "Classmate search & invite system",
    "Leader-only chat rooms for coordination",
    "Full-width responsive roster tables",
    "Excel & PDF export with verification QR codes",
    "Event countdown timers & reminders",
    "Registration status tracking dashboard",
    "Admin event creation & management panel",
  ],
  null, AMBER,
  ["Mange Event IP.png", "invaition of event IP.png"]
);

// Slide 11: Owner Dashboard
contentSlide(11,
  "Canteen Owner Dashboard",
  "Real-time order management & menu control panel",
  [
    "Live order queue with status management",
    "QR code scanner for order verification",
    "Menu item CRUD: add, edit, price, carbon label",
    "Daily sales analytics & revenue tracking",
    "Order history with date-range filter",
    "Inventory & availability toggle per item",
    "Push notifications for new orders",
    "Carbon impact summary across all orders",
  ],
  "owner dasjboard IP.png", CYAN
);

// Slide 12: Admin Dashboard
contentSlide(12,
  "Admin Dashboard",
  "Campus-wide control center with real-time metrics & CMS",
  [
    "Real-time campus sustainability metrics",
    "Landing page CMS editor — live updates",
    "Student & faculty user management",
    "Anti-cheat quarantine panel — ban cheaters",
    "Green Cover inventory: trees, grass, absorption",
    "Sustainability audit logs with export",
    "Broadcast system: urgent/warning/info alerts",
    "Lost & Found + complaint moderation",
  ],
  "Admin dashboard IP.png", PURPLE
);

// Slide 13: Thank You
slide13();

// ═══════════════════════════════════════════════════════
// SAVE
// ═══════════════════════════════════════════════════════
pptx.writeFile({ fileName: OUTPUT })
  .then(() => {
    console.log(`\n✅ Presentation saved to: ${OUTPUT}`);
    console.log(`   13 slides generated with all screenshots!`);
  })
  .catch(err => {
    console.error("❌ Error:", err);
  });
