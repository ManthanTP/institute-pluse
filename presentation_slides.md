# InstitutePulse - Campus Presentation Slides

This document is a slide-by-slide guide for presenting **InstitutePulse** at Jain College of Engineering (2026). It is written in simple English. Each slide tells you exactly what image to use, where to place it, and what to say during the presentation.

---

## 🎨 Presentation Theme and Design Tips
*   **Slide Colors**: Use a dark background (Slate-950 or Slate-900) for a modern, clean look. 
*   **Text Colors**: Use white for main text, green for student/eco points, and blue for teacher/admin features.
*   **Fonts**: Use simple, clean fonts like Inter, Outfit, or Arial.
*   **Image Styling**: Give all images rounded corners and a thin border to make them look neat.

---

## Slide 1: Title Slide
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Place in the center-left or as a clean header.
*   **What**: The official logo of Jain College of Engineering on the left, and the glowing green logo of **InstitutePulse** on the right.
*   **Visual Style**: Keep the logos clean, and use a dark slate background with a soft green glow in the center.

### 📝 Slide Content
*   **Project Name**: **InstitutePulse**
*   **Subtitle**: *A Smart Campus App for Green Habits and Student Life*
*   **Purpose**: A single app for college students and staff to track carbon footprint, record attendance, order food, and view events.
*   **College**: Jain College of Engineering (Department of Computer Science & Engineering)
*   **Presenter**: Manthan Patel (CSE Student)
*   **App Status**: Version 1.0.0 (Works on Web browsers and Android phones)

### 🎙️ Speaker Notes
> "Good morning, teachers and guides. I am presenting my project, **InstitutePulse**. This is a single mobile and web app made for our campus. It helps students and teachers in their daily life. It replaces slow paper forms. It helps students track their daily carbon footprint, records attendance securely with QR codes, and manages cafeteria orders. Let us look at the problems it solves."

---

## Slide 2: The Problems in College Life
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Put this on the right side of the slide, taking up 40% of the screen width.
*   **What**: A vertical split image. The top half shows a messy pile of old paper registers with a red cross mark (❌). The bottom half shows plastic cups and food waste in a trash bin with a red text label that says "High Carbon!".
*   **Visual Style**: Give the image rounded corners and a thin red border to show it is a problem.

### 📝 Slide Content
*   **No Green Awareness**: Students do not know how much carbon dioxide is made by their travel, food choices, or device usage.
*   **Attendance Cheating (Proxy)**: Paper registers are slow. Students can easily sign attendance for their absent friends.
*   **Split Services**: Canteen ordering, complaints, and event registries are done in different places. This is slow and confusing.
*   **No Motivation**: Students have no rewards or points system to encourage eco-friendly habits like walking or saving energy.
*   **No Live Admin Reports**: College management cannot see live summaries of student attendance or green scores.

### 🎙️ Speaker Notes
> "Right now, students do not know how much carbon their daily habits produce. Paper attendance lists are slow and open to cheating. Also, services like canteen ordering and registering complaints are split across different systems. There is no reward for saving energy, and college admins cannot see live progress reports."

---

## Slide 3: The Proposed Solution
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Place three small mobile screenshots side-by-side at the bottom of the slide.
*   **What**: 
    1. Screen 1: The student dashboard showing the green Eco Score wheel.
    2. Screen 2: The attendance page showing a scanning QR code.
    3. Screen 3: The canteen food menu with green carbon labels.
*   **Visual Style**: Put the screenshots inside clean smartphone mockups with glowing green and blue borders.

### 📝 Slide Content
*   **Carbon Tracker**: Log travel, electricity, food, water, and waste. The system calculates carbon footprint instantly.
*   **Rewards**: Earn XP points, keep daily logging streaks, unlock 16 badges, and compete on the college leaderboard.
*   **Secure QR Attendance**: Quick scans connected to class timetable. It checks student batch and stops proxy attendance.
*   **All-in-One Service Hub**: Order food with carbon labels, write complaints, report lost items, and view campus maps.
*   **Local Study Tools**: Add study tasks, use Pomodoro focus timers, and get green tips directly on the device.
*   **Four Login Portals**: Dashboards for Students, Teachers, Canteen Owners, and Admin.

### 🎙️ Speaker Notes
> "InstitutePulse solves these issues with a single app. It tracks daily carbon footprints, rewards green habits with XP, secures attendance using timed QR codes, lets students order food, and includes a study planner with Pomodoro timers. Next, let us see the system design."

---

## Slide 4: System Architecture (How it Works)
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Place this diagram on the right half of the slide.
*   **What**: A simple flowchart showing how the parts connect:
    1. **User App (Vite React + Capacitor)** at the top.
    2. An arrow pointing down to **Supabase Database & Backend** in the middle.
    3. A database icon on the left showing tables like Profiles, Logs, and Events.
    4. A security shield icon on the right showing RLS (Row Level Security).
*   **Visual Style**: Clean blocks with bright borders on a dark slate background.

### 📝 Slide Content
*   **Front-End**: Built with React and Tailwind CSS. The app runs fast on web browsers.
*   **Mobile Shell**: Wrapped in a Capacitor shell to run as a native Android app.
*   **Database**: Supabase database holds all tables. It handles email login and updates lists in real-time.
*   **Security Policies**: Row Level Security (RLS) protects data so users can only view their own records.
*   **Local Logic**: Simple local rules organize study planner tasks and suggest carbon-saving tips without using external servers.

### 🎙️ Speaker Notes
> "Our system architecture is clean. We use React for the web app, and Tailwind CSS for styling. We use Capacitor to bundle this code into a native Android app. The database is hosted on Supabase, which keeps data safe and updates the UI instantly using WebSockets."

---

## Slide 5: Carbon Footprint Tracker
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Place this image on the left half of the slide.
*   **What**: A screenshot of the Carbon Log Form in the app. Show input fields for travel distance, device hours, and meal choices, along with a glowing green circular chart showing "Eco Score: 85/100".
*   **Visual Style**: Real app screenshot with rounded corners, a green border, and dark mode theme.

### 📝 Slide Content
*   **Daily Log Options**:
    *   *Travel*: Input travel distance and mode (bike, bus, walk).
    *   *Electricity*: Input hours of device usage.
    *   *Food/Water*: Log meal types (veg, vegan) and water usage.
    *   *Waste*: Input waste type and weight.
*   **Standard Math Factors**: Uses official factors (for example, electricity uses Indian grid factor of **0.82 kg CO₂/kWh**).
*   **Eco Score Calculation**: Starts at 100 points. Points drop based on daily emissions compared to a 5.0 kg carbon limit:
    $$\text{Eco Score} = \max\left(0, \text{round}\left(100 - \frac{\text{Emissions (kg)}}{5.0} \times 100\right)\right)$$

### 🎙️ Speaker Notes
> "The carbon tracker lets students log travel, electricity, food, water, and waste. The app applies standard carbon factors. For electricity, it uses the Indian grid factor of 0.82 kg of CO2 per unit. The score starts at 100 and drops if emissions cross the daily 5 kilogram limit."

---

## Slide 6: XP Rewards, Streaks & Badges
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Place on the right side of the slide, taking up 45% of the width.
*   **What**: A collage showing three features:
    1. Gold badge icon for "Eco Warrior".
    2. Green badge icon for "Pedal Power".
    3. A leaderboard list showing "Rank 1: Rahul (540 XP)" with a small gold trophy icon.
*   **Visual Style**: Sleek badge icons with a soft glow and glassmorphic background container.

### 📝 Slide Content
*   **Earn XP Points**:
    *   Log Daily Habits: **+10 XP**
    *   High Eco Score: Perfect Score (**+60 XP**), Score $\ge 90$ (**+40 XP**), Score $\ge 70$ (**+20 XP**)
    *   Green Commute (Walk/Bicycle): **+15 XP**
    *   Green Diet: Vegan Meal (**+15 XP**), Veg Meal (**+10 XP**)
*   **Logging Streaks**: Keep logging for 3 days (**+30 XP**), 7 days (**+75 XP**), or 30 days (**+200 XP**) to get bonus points.
*   **Unlock Badges**: 16 badges are unlocked automatically when targets are met.

### 🎙️ Speaker Notes
> "To make the app fun, students earn XP points. They get points for logging daily habits, walking or cycling, and choosing veg or vegan meals. Maintaining daily streaks gives extra XP. These points help them unlock 16 special badges and move up the college leaderboard."

---

## Slide 7: Anti-Cheat Controls (Safe Data)
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Place this image in the center-right of the slide.
*   **What**: A simple flowchart showing: 
    "Student Logs Travel: 180 km" $\rightarrow$ "Checks Limit (150 km)" $\rightarrow$ "Rejects and shows Red Alert: Value too high!".
*   **Visual Style**: Use warning colors (yellow and red) with a clear layout.

### 📝 Slide Content
*   **1. Log for Yesterday Only**: Students can only log details for yesterday. They cannot enter logs for future dates.
*   **2. Cross-Check with Canteen**: If a student claims they skipped a meal but canteen records show they bought food, the system flags it.
*   **3. Normal Value Limits**: 
    *   *Immediate Reject*: Commute distance > 150 km, phone usage > 16 hours, or waste > 10 kg.
    *   *Flag for Review*: Zero emissions log, or perfect score logged more than 3 days in a row.
*   **4. Admin Action**: Flagged entries are checked by an admin. Multiple fake logs will lock the student out of the leaderboard.

### 🎙️ Speaker Notes
> "To stop students from entering fake data to win on the leaderboard, we built four safety checks. The app locks the logging date, checks canteen purchases, rejects impossible values like commuting 200 kilometers, and flags suspicious streaks for admin review."

---

## Slide 8: Class Timetable & QR Attendance
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Place side-by-side images on the right half of the slide.
*   **What**: 
    1. Left mockup: A phone showing the ticking QR code with a circular timer overlay.
    2. Right mockup: A laptop showing the teacher's screen with list of present students.
*   **Visual Style**: Clean frames with bright blue borders to match the teacher portal colors.

### 📝 Slide Content
*   **Batch-Specific QR Codes**: QR codes are linked to the class timetable (divided by semesters, sections, or lab batches like A1, A2).
*   **Anti-Proxy System**: QR codes change or expire in 10 minutes. It checks location and allows only one scan per device.
*   **Teacher Control Screen**:
    *   Confirm scans in real-time.
    *   Reject fake scans or mark students present manually.
    *   Extend QR timer by 5 or 10 minutes, set substitute teachers, or reschedule the class.

### 🎙️ Speaker Notes
> "For attendance, teachers generate a QR code from their timetable. The code is active for 10 minutes. It locks to the student's location and device to stop proxy scans. Teachers can see active scans on their screens, extend timers, or mark students present manually."

---

## Slide 9: Green Cover & Campus Offset
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Place this image on the left half of the slide.
*   **What**: A widget showing the Campus Green status: 
    - "Total Trees: 245"
    - "Daily CO₂ Absorbed: 12.8 kg"
    - "Today's Emissions: 10.2 kg"
    - A bright green badge that says "Neutral! 🌳"
*   **Visual Style**: Forest green tones, simple circular meters, clean tree icons.

### 📝 Slide Content
*   **Campus Green Inventory**: The database tracks tree counts and green spaces on campus.
*   **Daily Tree CO₂ Absorption**:
    *   Large Trees (Neem/Mango): **0.060 kg/day**
    *   Medium Trees (Ashoka/Gulmohar): **0.040 kg/day**
    *   Small Trees/Palms: **0.025 kg/day**
    *   Grass Lawns (per square meter): **0.002 kg/day**
*   **Carbon Neutral Goal**: The app subtracts tree absorption from total student emissions. If it is 0 or less, the campus dashboard shows the green "Carbon Neutral" alert.

### 🎙️ Speaker Notes
> "We also built a Green Cover tracker. We entered JCE's tree count and lawns into the database. The system calculates how much carbon the plants absorb daily. If the plants absorb more carbon than the students produce, the dashboard shows the campus is Carbon Neutral."

---

## Slide 10: Eco-Cafeteria System
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Place this screenshot on the right half of the slide.
*   **What**: The Checkout page in the app showing food items in the cart (like "Veg Pulav"), their prices, and their carbon footprint numbers (like "0.5 kg CO₂") with an amber "Place Order" button.
*   **Visual Style**: Warm amber borders, bold labels, clean pricing tags.

### 📝 Slide Content
*   **Green Menu Labels**: Food items show price alongside their carbon weight (such as Idli: 0.3kg, Egg Rice: 1.0kg).
*   **Cart Calculations**: The checkout screen shows total price and total carbon footprint.
*   **QR Order Slips**: Placed orders create a unique receipt code and order QR.
*   **Owner Scanner**: Canteen owners use their phone camera to scan order slips, updating status in real-time.

### 🎙️ Speaker Notes
> "In the Eco-Cafeteria, food items are labeled with their carbon footprint. Students can see their total carbon impact before checkout. When they place an order, it creates a QR receipt. The canteen owner scans this receipt to complete the order, updating the status instantly."

---

## Slide 11: Events, Teams & Modals (Updated!)
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Place a large smartphone mockup on the right side of the slide.
*   **What**: The Event details page showing the team name, classmate search input, invite buttons, and the active chat room stretching across the full screen width.
*   **Visual Style**: Sleek dark mode UI with a glowing green registration status badge at the top.

### 📝 Slide Content
*   **Event Formats**: College events support Solo, Duo, Trio, Squad, or custom size settings.
*   **Invite Classmates**: Students register for team events by naming their team, searching for classmates, and sending invites.
*   **Full-Width Layout**: Updated layout on mobile and desktop screens fixes squeezed pages. Roster tables, search boxes, and chats now use the full screen width.
*   **Leader-Only Chat Room**: Only the team leader can send messages in the event chat room. Other team members can only read messages, keeping discussions clean.

### 🎙️ Speaker Notes
> "Events support team sizes like Duo or Squad. A student creates a team and searches for classmates to invite. The classmates can accept or decline the invite. We updated the layout to be full-width on mobile and web so forms are easy to read. To make coordination organized, only the team leader can write in the chat."

---

## Slide 12: Study Planner & Pomodoro Timers
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Place this image on the left half of the slide.
*   **What**: A smartphone screen showing a circular Pomodoro focus timer ticking down from "25:00" with a green tip card at the bottom: "💡 Walk to college tomorrow to save 0.4 kg CO₂!"
*   **Visual Style**: Clean red/green clock display, flat modern buttons.

### 📝 Slide Content
*   **Simple Study Task List**: Students add study topics. The local system helps structure sessions into time-bounded task lists.
*   **Pomodoro Focus Timers**: Set timers for 15, 25, or 50 minutes. Keeps the mobile screen on and plays alerts when finished.
*   **Local Carbon Mentorship**: Displays tips on how to save carbon. For example, if travel carbon is high, it suggests walking or carpooling.

### 🎙️ Speaker Notes
> "The app includes a Study Planner and local Carbon Mentorship. Students can schedule study sessions and use Pomodoro focus timers. Based on their logged activities, the app displays helpful carbon-saving tips locally without requiring internet APIs."

---

## Slide 13: Login Portals & Security
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Place this diagram on the right half of the slide.
*   **What**: A diagram showing a login window dividing into four portals: Student (Green), Teacher (Blue), Owner (Orange), and Admin (Red). A lock icon is shown on the database table layer.
*   **Visual Style**: Use 4 distinct colored arrows representing the routing flow.

### 📝 Slide Content
*   **Automatic Dashboard Routing**: The system checks the user's role and redirects them to the correct dashboard page.
*   **Hidden Admin Path**: The admin link is hidden using a secret URL path (`/12345678/admin/...`).
*   **Brute Force Lockout**: Blocks login attempts after 3 failures for 60 seconds, and asks for a secondary 2FA pin.
*   **Database Row Level Security (RLS)**: PostgreSQL policies prevent users from editing or viewing other users' private database rows.

### 🎙️ Speaker Notes
> "Security is key in a multi-portal campus app. We redirect users to their correct dashboard upon login. The admin URL is hidden. The admin login has a 3-attempt lockout policy, and the database uses Row Level Security to protect student and teacher data."

---

## Slide 14: Data Downloads & CMS Tools
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Place in the center-bottom of the slide.
*   **What**: A laptop screen mockup showing the Landing Page CMS editor on the left (text fields for FAQs and Banners), and download buttons for Excel spreadsheet rosters on the right.
*   **Visual Style**: Sleek web browser mockup with bold green and blue labels.

### 📝 Slide Content
*   **Landing Page CMS**: Admins can edit text, FAQs, and main website banners directly in the browser without writing code.
*   **Excel Spreadsheets**: Teachers and Admins can download student registries grouped by teams, departments, and roles.
*   **PDF Manifests**: Generates clean printable PDF files with verification QR codes for events and classes.

### 🎙️ Speaker Notes
> "For administrative tasks, we created a CMS editor to update website content instantly. We also added export tools. Teachers and admins can download rosters as Excel sheets grouped by team status or print PDF files with verification QR codes."

---

## Slide 15: Optimizations & Android Compilation (New!)
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Place a developer flow diagram on the left half of the slide.
*   **What**: A vertical build pipeline showing: 
    `Vite Web Build` $\rightarrow$ `Capacitor Sync` $\rightarrow$ `Android Gradle JDK 21 Compiler` $\rightarrow$ `Output APK (38.17 MB)`.
*   **Visual Style**: Blue terminal blocks with white text, and a glowing green Android robot icon next to the final APK.

### 📝 Slide Content
*   **Persistent Subscriptions**: Redesigned notifications logic. WebSockets and data fetches are cached and kept active on page transitions, preventing double fetches.
*   **Direct Trophy Alerts**: Faculty members can now award XP points directly. The student receives an instant push notification with a trophy icon in the student portal.
*   **Native Build Target**: Synced all frontend assets into the Android native capacitor project.
*   **Compact Output**: Compiled debug binaries using Gradle with JDK 21, creating a fast, optimized app bundle (`InstitutePulse.apk` ~38MB) copied to root, `public/`, and `dist/` folders.

### 🎙️ Speaker Notes
> "We optimized the database listener logic to prevent double notifications on page transitions, saving network usage. Faculty can now award XP points directly, triggering trophy notifications for students. We sync web code to Android using Capacitor, compiling a 38 megabyte native APK using JDK 21."

---

## Slide 16: Future Work & Global Goals
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Place this image on the right half of the slide.
*   **What**: A grid of the four official United Nations SDG badges met by the app: Goal 4 (Quality Education), Goal 11 (Sustainable Cities), Goal 12 (Responsible Consumption), and Goal 13 (Climate Action).
*   **Visual Style**: Bright, high-quality SDG tiles on a dark background with green checkmark circles.

### 📝 Slide Content
*   **Future Upgrades**:
    *   *Face Recognition*: Use face scans to confirm classroom attendance.
    *   *Geofencing*: Lock attendance scans within the coordinates of the classroom.
    *   *NFC Card Reading*: Scan student ID cards directly on teacher devices.
    *   *Smart IoT Meters*: Connect college electricity meters to auto-update footprints.
*   **UN Global Goals Met by App**:
    *   **Goal 4**: Quality Education (study planner & tasks).
    *   **Goal 11**: Sustainable Cities (eco commuting).
    *   **Goal 12**: Responsible Consumption (canteen & waste caps).
    *   **Goal 13**: Climate Action (daily carbon audits).

### 🎙️ Speaker Notes
> "In the future, we plan to add face recognition and geofencing to prevent all attendance cheating. We also want to link smart energy meters. Finally, our app matches the United Nations Global Goals by helping students with education, green commuting, and direct climate action."

---

## Slide 17: Feature Slide: Campus Services Hub (Complaints, Lost & Found)
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Place this image on the right side of the slide, taking up 45% of the slide width.
*   **What**: A split smartphone mockup screen. The left screen shows the "File a Complaint" form with dropdowns (Category: Infrastructure, Priority: High) and active status pills. The right screen shows the Lost & Found listing showing "Found Keys near Library".
*   **Visual Style**: Clean glassmorphic cards with red, yellow, and green status pill badges.

### 📝 Slide Content
*   **Complaint Box**: Students can file complaints with priority tags (Low, Medium, High, Urgent). Teachers and Admins can respond and update status.
*   **Lost & Found System**: Report lost items or list found keys/books. Other students can browse and claim items securely.
*   **Safety Checks**: All posts are checked by college administrators before they appear on the public page.

### 🎙️ Speaker Notes
> "Let us talk about the Campus Services features. We built a unified Complaint system where students file issues with priority tags like High or Urgent. Teachers and Admins can review, reply, and update statuses. We also included a Lost & Found system to help students find misplaced keys or books with admin safety checks."

---

## Slide 18: Feature Slide: Interactive Campus Navigation & Live Broadcasts
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Place this image on the left side of the slide, taking up 45% of the slide width.
*   **What**: A laptop screen mockup showing the campus Leaflet.js map with active markers on buildings (Library, Canteen, Admin Office), and a bright red notification banner at the top showing "🚨 Urgent: Holiday declared for second-semester lab batches tomorrow".
*   **Visual Style**: Custom map overlay with glowing blue location pins and a pulsing red warning bar.

### 📝 Slide Content
*   **Leaflet Map**: Interactive college map showing classrooms, labs, offices, and canteen locations. Includes direct search.
*   **Real-Time Broadcasts**: Admins and Faculty can send instant campus-wide announcements.
*   **Priority Banners**: Announcements flash on the dashboard using priority colors: Urgent (pulsing red), Warning (yellow), and Info (orange).

### 🎙️ Speaker Notes
> "Next, we have the Campus Navigation and Broadcast features. The app has an interactive Leaflet map that shows building rooms, labs, and office locations with a quick search bar. We also built a Live Broadcast system. When teachers send an urgent notification, it instantly flashes at the top of the student dashboard as a pulsing red alert banner."

---

## Slide 19: Feature Slide: Faculty Controls & Academic Resource Hub
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Place this image on the right side of the slide, taking up 45% of the slide width.
*   **What**: A screen mockup of the Faculty dashboard showing control buttons (like "Cancel Class", "Change Classroom", "Assign Substitute") alongside a folder list of uploaded materials showing a file icon named "Applied Chemistry - Unit 2.pdf".
*   **Visual Style**: Sleek blue-themed web card matching the Faculty portal style.

### 📝 Slide Content
*   **Class Overrides**: Teachers can cancel classes with reason codes, assign substitute teachers, change classrooms, or extend QR timer slots instantly.
*   **Digital Resource Sharing**: Faculty upload study guides, syllabus sheets, video links, and reference papers directly grouped by subject name.
*   **Category Search**: Students browse and download files filtered by type (PDFs, Documents, Videos, Links) or search by keywords.

### 🎙️ Speaker Notes
> "Let us look at the Faculty portal features. Teachers have full control over their classes. They can cancel sessions, set substitute teachers, or change classrooms, which instantly notifies the students. Faculty can also upload study materials like PDFs, videos, and links to the Digital Resource Hub so students can download them easily."

---

## Slide 20: Thank You / Conclusion
### 📸 Photo Idea (Where & What to Put)
*   **Where**: Center of the slide, below the main title.
*   **What**: A large circular badge showing the green **InstitutePulse** leaf logo with the text "Jain College of Engineering - CSE 2026" written around it in a glowing circle. Below it, show links to the developer's portfolio and GitHub.
*   **Visual Style**: Clean centered text with glowing green highlights.

### 📝 Slide Content
*   **Special Thanks**: Jain College of Engineering, CSE Department, Panel Members, and Project Guides.
*   **App Status**: Native Android APK and Web portal are fully functional and ready for deployment.
*   **Contact & Portfolio**:
    *   *Developer*: Manthan Patel
    *   *Portfolio*: https://manthantp-portfolio.vercel.app/
    *   *GitHub*: github.com/ManthanTP
    *   *Email*: manthantp.work@gmail.com

### 🎙️ Speaker Notes
> "That brings us to the end of my presentation. I want to say a big thank you to the Computer Science department, my project guides, and the evaluation panel for their valuable time and support. I am now open to any questions or feedback you have. Thank you."



