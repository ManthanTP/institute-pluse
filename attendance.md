Create a COMPLETE SMART TIMETABLE + QR ATTENDANCE MANAGEMENT SYSTEM for “InstitutePulse” using Supabase realtime backend.

IMPORTANT:
The system must support:
- Semester selection
- Division selection
- Weekly recurring timetable
- Theory classes
- Lab batch classes
- Automatic QR attendance generation
- Manual faculty verification
- Realtime attendance tracking

The entire system must be MOBILE-FIRST and production-ready.

====================================================
ACADEMIC STRUCTURE FLOW
====================================================

Hierarchy:
Semester
   ↓
Division
   ↓
Batch (for labs)
   ↓
Weekly Timetable
   ↓
Attendance Session
   ↓
QR Attendance

====================================================
SEMESTER & DIVISION STRUCTURE
====================================================

Create:
Semester:
- 2nd Semester

Division:
- A

Classroom:
- A-113

Lab Batches:
- A1
- A2
- A3

====================================================
COMPLETE WEEKLY TIMETABLE
====================================================

SEMESTER:
2nd Semester

DIVISION:
A

CLASSROOM:
A-113

----------------------------------------------------
MONDAY
----------------------------------------------------

8:30–9:30
1BMATS201
Numerical Methods

9:30–10:30
1BCHES202
Applied Chemistry for Smart Systems

10:30–10:45
Tea Break

10:45–11:45
1BPLC205B
Python Programming

11:45–12:45
1BESC204A
Building Science & Mechanics

12:45–1:30
Lunch Break

1:30–2:20
1BAIA203
Introduction to AI and Applications

2:20–3:10
1BESC204A
Building Science & Mechanics

3:10–4:00
1BENG206
Communication Skills

----------------------------------------------------
TUESDAY
----------------------------------------------------

8:30–9:30
1BCHES202
Applied Chemistry

9:30–10:30
1BMATS201
Numerical Methods

10:30–10:45
Tea Break

10:45–11:45
1BAIA203
Introduction to AI

11:45–12:45
1BPLC205B
Python Programming

12:45–1:30
Lunch Break

1:30–4:00
LAB SESSION

A1 → Applied Chemistry Lab
A2 → Python Programming Lab
A3 → Alternate/Project Session

----------------------------------------------------
WEDNESDAY
----------------------------------------------------

8:30–9:30
1BAIA203
Introduction to AI

9:30–10:30
Free Hour

10:30–10:45
Tea Break

10:45–12:45
LAB SESSION

A1 → Python Programming Lab
A2 → Applied Chemistry Lab
A3 → Numerical Methods Practice

12:45–1:30
Lunch Break

1:30–3:10
1BMATS201-LAB
Numerical Methods Lab

3:10–4:00
Free Hour

----------------------------------------------------
THURSDAY
----------------------------------------------------

8:30–9:30
1BPLC205B
Python Programming

9:30–10:30
1BMATS201
Numerical Methods

10:30–10:45
Tea Break

10:45–11:45
1BESC204A
Building Science & Mechanics

11:45–12:45
1BCHES202
Applied Chemistry

12:45–1:30
Lunch Break

1:30–4:00
LAB SESSION

A1 → Python Programming Lab
A2 → Applied Chemistry Lab
A3 → Alternate Practical Session

----------------------------------------------------
FRIDAY
----------------------------------------------------

8:30–9:30
1BCHES202
Applied Chemistry

9:30–10:30
1BPLC205B
Python Programming

10:30–10:45
Tea Break

10:45–11:45
1BAIA203
Introduction to AI

11:45–12:45
1BMATS201
Numerical Methods

12:45–1:30
Lunch Break

1:30–2:20
1BESC204A
Building Science & Mechanics

2:20–3:10
1BICO207
Indian Constitution & Engineering Ethics

3:10–4:00
Tutorial Session

----------------------------------------------------
SATURDAY
----------------------------------------------------

Skill Lab / Project Work

====================================================
TIMETABLE LOGIC
====================================================

The timetable must repeat automatically every week.

Flow:
Current Day + Current Time
   ↓
Match Timetable Slot
   ↓
Automatically Generate Attendance Session
   ↓
Generate QR Code
   ↓
Start 10-Minute Attendance Window
   ↓
Allow Student Scanning
   ↓
Faculty Manual Verification
   ↓
Attendance Finalized

====================================================
QR ATTENDANCE FLOW
====================================================

THEORY CLASSES:
- One QR for whole division

LAB CLASSES:
- Separate QR for:
   - A1
   - A2
   - A3

Example:
A1 QR ≠ A2 QR ≠ A3 QR

====================================================
STUDENT ATTENDANCE FLOW
====================================================

Student Login
   ↓
System Fetches:
- Semester
- Division
- Batch

Example:
Semester = 2
Division = A
Batch = A2

   ↓
Student Opens Attendance Scanner
   ↓
Scan QR
   ↓
System Validates:
- Correct semester
- Correct division
- Correct batch
- Correct session
- QR not expired
- Student not already marked

   ↓
Attendance Status:
Pending Verification

====================================================
FACULTY VERIFICATION FLOW
====================================================

Faculty Dashboard Shows:
- Current Subject
- Current Session
- Live QR
- Countdown Timer
- Student Scan Registry

Faculty must verify:
- Student Name
- USN/ID
- Roll Number
- Batch
- Physical Presence

Faculty Actions:
- Confirm Present
- Reject Proxy
- Mark Manual Attendance
- Mark Absent

After verification:
Pending → Present

====================================================
REALTIME FEATURES
====================================================

Use Supabase Realtime for:
- Live QR attendance
- Live student scans
- Live attendance counters
- Session countdown sync
- Faculty verification updates

====================================================
DATABASE REQUIREMENTS
====================================================

Create Tables:

1. semesters
2. divisions
3. lab_batches
4. classrooms
5. subjects
6. faculty
7. timetable
8. attendance_sessions
9. attendance_records

====================================================
TIMETABLE TABLE STRUCTURE
====================================================

timetable:
- id
- semester_id
- division_id
- batch_id nullable
- subject_id
- faculty_id
- classroom_id
- day_of_week
- start_time
- end_time
- session_type
   theory | lab | tutorial | project
- recurring_weekly boolean

====================================================
ATTENDANCE SESSION RULES
====================================================

Rules:
- QR valid only for 10 minutes
- One scan per student
- Wrong batch scan blocked
- Wrong division scan blocked
- Duplicate attendance blocked
- Faculty verification mandatory
- Session auto locks after timeout

====================================================
UI/UX REQUIREMENTS
====================================================

Student UI:
- Mobile-first QR scanner
- Attendance history
- Subject-wise attendance %
- Today's classes section

Faculty UI:
- Professional dashboard
- Live QR generator
- Batch selector
- Attendance registry
- Live counters
- Timetable view

Admin UI:
- Semester/division manager
- Timetable creator
- Batch management
- Attendance analytics
- Export attendance reports

====================================================
ADVANCED FEATURES
====================================================

Optional:
- GPS classroom validation
- Face verification
- NFC attendance
- AI proxy detection
- Offline attendance sync
- Auto attendance reminders
- Attendance heatmaps

====================================================
FINAL GOAL
====================================================

The system should behave like a complete smart institutional attendance ecosystem where:
- Timetable repeats weekly
- Sessions auto generate
- QR attendance is realtime
- Labs support A1/A2/A3 batches
- Faculty manually verifies attendance
- Students get secure mobile attendance access
- Everything is automated, scalable, and professional.

UPDATE THE SMART TIMETABLE + QR ATTENDANCE MANAGEMENT SYSTEM TO INCLUDE FACULTY CLASS OVERRIDE, SUBSTITUTE CLASS, AND SESSION CONTROL FEATURES.

IMPORTANT:
Faculty members must have full control to:
- Cancel scheduled classes
- Reschedule classes
- Take substitute classes
- Change classroom
- Extend attendance session timing
- Create manual attendance sessions
- Handle emergency timetable changes

These changes must automatically update:
- Student dashboards
- Notifications
- Attendance sessions
- Timetable schedules
- QR generation system

====================================================
FACULTY CLASS CONTROL FEATURES
====================================================

Faculty Dashboard must include:
- Today's timetable
- Upcoming classes
- Active attendance sessions
- Class control actions

Actions:
1. Cancel Class
2. Create Substitute Class
3. Change Subject
4. Change Classroom
5. Extend Session Time
6. Start Manual Session
7. End Session Early

====================================================
CLASS CANCELLATION FLOW
====================================================

Faculty Opens Current Scheduled Class
   ↓
Clicks “Cancel Class”
   ↓
Select Reason:
- Faculty unavailable
- Holiday
- Technical issue
- Emergency
- Other

   ↓
Confirm Cancellation
   ↓
System Updates:
- Timetable status
- Attendance session status
- Student dashboard
- Notifications

   ↓
Students Receive Notification:
“Today's 10:45 AM Python Programming class has been cancelled.”

====================================================
SUBSTITUTE / EXTRA CLASS FLOW
====================================================

Faculty Clicks:
“Create Substitute Class”

   ↓
Form Opens:
- Subject
- Semester
- Division
- Batch (optional)
- Classroom
- Start Time
- End Time
- Date
- Session Type
   theory | lab | tutorial

   ↓
Generate New Attendance Session
   ↓
Generate QR Code
   ↓
Notify Students
   ↓
Session Appears in Timetable

====================================================
SUBSTITUTE FACULTY FLOW
====================================================

Admin or Faculty can assign substitute faculty.

Flow:
Original Faculty Unavailable
   ↓
Assign Substitute Faculty
   ↓
Updated Timetable Published
   ↓
Students See:
“Substitute Faculty Assigned”

====================================================
MANUAL SESSION FLOW
====================================================

Faculty can manually create attendance sessions outside timetable.

Use Cases:
- Extra class
- Makeup class
- Workshop
- Seminar
- Guest lecture

Flow:
Faculty Clicks:
“Start Manual Session”

   ↓
Enter:
- Subject
- Semester
- Division
- Batch
- Room
- Duration

   ↓
Generate Temporary QR
   ↓
Attendance Starts

====================================================
SESSION EXTENSION FLOW
====================================================

During active attendance session:
Faculty can:
- Extend attendance time
- Add +5 mins
- Add +10 mins

System updates:
- QR validity
- Countdown timer
- Student access

====================================================
CHANGE CLASSROOM FLOW
====================================================

Faculty can update:
- Classroom
- Lab room
- Building

Students receive instant notification:
“AI Class shifted from A-113 to Lab Block 2.”

====================================================
TIMETABLE UPDATE LOGIC
====================================================

If faculty changes class:
- Update timetable entry
- Update attendance session
- Update realtime dashboard
- Push notifications to students
- Maintain audit history

====================================================
FACULTY DASHBOARD UPDATE
====================================================

Add New Controls:

Today's Session Card:
- Start Attendance
- Cancel Class
- Replace Faculty
- Change Room
- Start Extra Class
- Extend QR Time
- End Session

====================================================
STUDENT DASHBOARD UPDATE
====================================================

Students should see:
- Cancelled classes
- Rescheduled classes
- Extra classes
- Substitute faculty info
- Updated room numbers
- Attendance status

====================================================
DATABASE REQUIREMENTS
====================================================

Update timetable table:
Add:
- status
   active
   cancelled
   rescheduled
   substituted

- substitute_faculty_id nullable
- cancellation_reason
- updated_room
- updated_time

----------------------------------------------------

Create new table:
class_change_logs
- id
- timetable_id
- changed_by
- change_type
- old_value
- new_value
- reason
- created_at

====================================================
NOTIFICATION SYSTEM
====================================================

Realtime notifications for:
- Class cancelled
- Faculty changed
- Room changed
- Extra class added
- Session extended

====================================================
REALTIME FEATURES
====================================================

Use Supabase realtime for:
- Timetable updates
- Attendance session updates
- QR timing updates
- Faculty changes
- Live dashboard refresh

====================================================
SECURITY & VALIDATION
====================================================

Only:
- Assigned faculty
- Substitute faculty
- Admin

can modify class sessions.

All changes must:
- be logged
- be auditable
- preserve attendance integrity

====================================================
FINAL GOAL
====================================================

The attendance and timetable system should behave like a professional smart college ERP where faculty members can dynamically:
- cancel classes,
- conduct substitute sessions,
- create extra classes,
- manage realtime attendance,
- and update schedules instantly

while students automatically receive updated schedules and notifications in realtime.