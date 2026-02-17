# Recruiter Dashboard Features & Overhaul Tracker

This document tracks the features within the Recruiter Dashboard and their implementation status regarding UI/UX excellence and non-technical clarity.

## 1. Intelligence Dashboard (Main Hub)
- **Status**: ✅ **UI/UX Completed (Premium Standard)**
- **Design Philosophy**: High-contrast Slate/Indigo theme with glassmorphism components and ultra-rounded (`3rem`) geometry.

### Core Systems & Terminology:
1.  **Presence Authenticity Shield**: 
    - **Concept**: A visual circular gauge representing the company's trust level on the platform.
    - **Logic**: Moves away from "Profile Completion Percentage" to "Presence Authenticity."
    - **UI**: 360-degree SVG progress tracker with indigo/purple gradients and backdrop blur centers.

2.  **Signal Momentum (Recruitment Lifecycle)**:
    - **Concept**: Replaces the technical "Hiring Funnel."
    - **Stages**:
        - *Interest Captured* (Applied)
        - *Verified Matches* (Shortlisted)
        - *Active Dialogues* (Interviewed)
        - *Success Secured* (Hired)
    - **UI**: Horizontal momentum grid with directional connectors and hover-state glows.

3.  **Optimization Roadmap**:
    - **Concept**: Actionable tasks to improve recruitment outcomes.
    - **Key Terms**: "Signal Power" (replaces Completion Score), "Branding" (replaces DNA), "Governance" (replaces Admin Controls).
    - **UI**: Integrated checklist with success-state badges and "Fix/Optimize" trigger links.

4.  **Executive Metric Bar**:
    - **Concept**: High-level status indicators for rapid scanning.
    - **KPIs**: Active Roles, Talent Reach (Market Awareness), Success Rate (Conversion), V-Rank (Algorithmic Standing).
    - **UI**: Horizontal ultra-rounded panels with micro-interactions and "Hover Reveal" descriptions.

## 2. Communication Hub (Transmit)
*Located in:* [dashboard/recruiter/messaging](apps/web/src/app/dashboard/recruiter/messaging/page.tsx)

*   **Real-time Interaction:** Instant messaging layer powered by Supabase Realtime for candidate-recruiter synchronization.
*   **Context-Aware Dialog:** Integrated view showing candidate skill match data and application history alongside the chat.
*   **Status Indicators:** Live online/offline tracking and delivery confirmation using semantic terminology ("Send" instead of "Transmit").

---

## 3. Hiring Hub: Post a Role (Smart Role Architect)
*Located in:* [dashboard/recruiter/hiring/jobs/new](apps/web/src/app/dashboard/recruiter/hiring/jobs/new/page.tsx)

The Job Creation suite has been transformed from a standard utility into a high-fidelity "Executive Suite" experience, featuring the **Smart Role Architect**.

### Core Architecture
*   **Vertical Section Design:** Moving away from standard 2-column layouts to a premium, vertical flow that groups information into logical "Mission-Critical" blocks:
    *   **Role Architecture:** Focuses on identity, seniority (Fresher to Leadership), and engagement type.
    *   **Mission & Impact:** A deep-dive into the role's purpose rather than just listing tasks.
    *   **Signal Alignment:** Structured capture of core requirements and technical skill signatures.
    *   **Market Logistics:** Location mapping and opening tracking.
*   **Executive Aesthetics:** Utilizes `rounded-4xl` containers, high-contrast Slate-900 typography, and Indigo-600 accents.

### AI Integration: Smart Role Architect
*   **Multi-Model Intelligence:** Uses a fallback chain of Gemini (2.0 Flash/1.5 Flash) and Gemma (3-27b/4b) to ensure 100% availability for role generation.
*   **Contextual Expansion:** Takes a minimal user prompt (e.g., "Senior React Engineer") and automatically synthesizes:
    *   An industry-standard high-impact job title.
    *   A 300-word professional mission narrative.
    *   Experience-aligned core requirements.
    *   Technical skill tags and market-accurate salary ranges.
*   **Seamless Injection:** The generated JSON is instantly injected into the form state, allowing recruiters to review and edit before publishing.

### UI Innovations
*   **Sticky Command Bar:** A glassmorphism-style header (`backdrop-blur-md`) that keeps critical actions (AI Architect, Publish) always accessible.
*   **Floating AI Assistant:** An overlay interface that allows recruiters to "describe the mission" while the AI handles the metadata mapping in the background.

---

## 4. Hiring Hub: Job Inventory & Pipeline
*Located in:* [dashboard/recruiter/hiring/jobs](apps/web/src/app/dashboard/recruiter/hiring/jobs/page.tsx) & [dashboard/recruiter/hiring/applications](apps/web/src/app/dashboard/recruiter/hiring/applications/page.tsx)

### Jobs Posted (Inventory)
*   **Live Metrics:** Every job card feature a live "Activity Ping" for active roles and real-time view/application tracking.
*   **Status Indicators:** Visual cues for `Active`, `Draft`, and `Closed` statuses across the inventory.

### Applied (Acquisition Pipeline)
*   **Grouped Visualization:** Applications are automatically grouped by job title, providing a cleaner overview of different hiring pipelines.
*   **Elite Match System:** Visual badges highlighting "Elite Match" candidates based on backend scoring algorithms.
*   **Workflow Navigation:** Deep-links to Candidate Profiles and real-time messaging directly from the pipeline view.
```