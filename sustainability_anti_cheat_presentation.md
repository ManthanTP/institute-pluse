# Anti-Abuse Carbon Tracking System

This document outlines the architecture and security layers of the Carbon Tracking and Gamification Anti-Cheat Suite. You can use this guide and infographic to present the feature to your college administration ("Sir").

---

## System Architecture Infographic

![Anti-Cheat System Architecture](C:/Users/dp862/.gemini/antigravity-ide/brain/231033c9-56ee-4142-a221-16919127a389/anti_cheat_exact_infographic_1780862609449.png)

---

## Key Talking Points for Your Presentation

When explaining this feature to your management or faculty guides, highlight these four core security pillars:

### 1. Yesterday-Aligned Timelines (Prevention of Empty Logs)
*   **The Issue**: Students could log clean, empty records in the morning (claiming they walked everywhere, didn't use devices, and skipped all meals) before the day actually happened.
*   **The Solution**: The logging wizard is restricted to **Yesterday’s date**. A student cannot log today's activities until the day is fully complete, forcing them to log past real behavior.

### 2. Canteen Order Cross-Referencing
*   **The Issue**: Students claiming they skipped meals to farm "low-emission" eco-points.
*   **The Solution**: The system queries the canteen order database for **Yesterday**.
    *   **Skipped Meal Contradiction**: If a student claims they "skipped breakfast" but the database shows a purchase matching the breakfast slot yesterday, the entry is flagged.
    *   **Vegan/Dairy Inconsistency**: Since the canteen is fully vegetarian, if a student claims a "vegan breakfast" but ordered a dairy-heavy item (like Masala Dosa with ghee or filter coffee with milk), the entry is flagged.

### 3. Smart Validation Limits (Suspicion Thresholds)
*   **The Issue**: Logging unrealistic data (e.g., walking 40 km, or studying on a laptop for 20 hours).
*   **The Solution**: Administrators can configure two tiers of thresholds:
    *   **Hard Limits**: Immediate rejection of impossible inputs (e.g., walking >30 km).
    *   **Suspicious Limits**: Automatically routes the log to a **"Pending Quarantine"** state for review if values are high but possible.

### 4. Moderation & Suspension Enforcement
*   **The Action**: Auditing dashboard for Administrators and Faculty to review quarantined logs.
    *   **Approved**: Student is credited with points.
    *   **Rejected**: The student's current logging streak is instantly reset to **0**.
    *   **Suspension**: If a student accumulates a high number of rejections (configurable, default is **2**), they are flagged as `sustainability_restricted` and **permanently excluded** from campus-wide leaderboards.
