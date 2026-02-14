## 1. High-Level System Architecture

TalentFlow follows a **3-layer architecture** with an integrated AI Evaluation Engine:

1.  **Frontend (Next.js Thin Client)**: Conversational UI, Voice Input, and Event Tracking.
2.  **Backend (FastAPI Trust & Logic Layer)**: Orchestrates business rules, security, AI evaluation, and **Document Intelligence**.
3.  **Intelligence Layer (LLM Ensemble)**:
    - **Google Gemini 1.5 Flash**: Performance-optimized Multi-dimensional qualitative assessment scoring and dynamic question generation.
    - **Groq (Llama 3.3 70B)**: Real-time high-throughput resume parsing and data extraction.
4.  **Data Layer (Supabase)**: Persistent storage for profiles, sessions, authentication, and **Binary Assets (PDFs)**.
5.  **Synchronization Layer (Supabase Realtime)**: Event-driven updates for high-stakes messaging and instant notification delivery.

## 2. Frontend Architecture (Client Layer)

The Frontend is a **stateless thin client** designed for high engagement and accessibility.

### Technology Stack

- **Next.js (App Router)** & TypeScript
- **Tailwind CSS 4.0**
- **Web Speech API**: Hands-free voice-to-text input.
- **Lucide Icons**

### Responsibilities

- **Conversational UI**: Renders chat-based flows for onboarding and assessments.
- **Interactive Resume Builder**: Sequential data collection for candidates without a PDF.
- **Integrity Guards**: Monitoring for tab switches, copy-paste, and timers.
- **Micro-interactivity**: Handling mic-states, voice visualizations, and real-time UI feedback.

### 2.1 Unified UI Architecture (Matrix Design System)

TalentFlow implements a modular layout system to enforce design consistency across both recruiter and candidate portals:

- **Component Abstraction**: Key UI elements like the Sidebar are abstracted into shared components (`RecruiterSidebar.tsx` and `CandidateSidebar.tsx`) to prevent UI drift.
- **Role-Based Theme**:
  - **Recruiter**: Blue-themed accents for professional, authoritative signaling.
  - **Candidate**: Indigo-themed accents for talent-focused engagement.
- **Verification Hub**: A unified sidebar widget that monitors and displays assessment status in real-time, serving as the central "call-to-action" for incomplete profiles.
- **Standardized Navigation**: Consistent application of typography, spacing (`ml-64` responsive layout), and naming conventions (e.g., specific Dashboard, Feed, and Profile routes).

### Trust Level

**Untrusted**: The frontend never computes scores or decides the "next step" in a workflow. It acts strictly as a display and input capture layer.

## 3. Backend Architecture (The "Brain")

FastAPI serves as the single source of truth for all logic and security.

### Core Responsibilities

- **AI Orchestration**: Sanitizing and routing data to Gemini/Groq for scoring.
- **Adaptive Assessment Engine**: Dynamically selecting questions based on the "Priority Pipeline" (Resume -> Skills -> Traits).
- **Unbiased Evaluation**: Implementing "Semantic Intent Matching" to eliminate linguistic and cultural bias in scoring.
- **Document Intelligence**: Extracting structured intent from raw resume text (Career Gaps, Skill Entropy, Role Clarity).
- **Security Handshake**: Verifying session integrity via `/auth/post-login` and auto-initializing missing profile records.
- **Messaging & Notifications**: Async handling of real-time message persistence and cross-role notification triggers.
- **Unified Trust Matrix**: Generating high-signal metrics for recruiters to bypass resume-level bias.

### Authentication & API Security

- **JWT Verification**: Validating Supabase-issued tokens on every request.
- **Service Role Bypass**: FastAPI uses the Supabase Service Role Key to perform admin-level operations (e.g., updating scores) while keeping user-facing APIs restricted via RLS.

## 4. Assessment & Intelligence Logic

### 4.1 Seniority-Based Assessment Budgets

The assessment dynamically scales question counts and component weighting based on the candidate's experience band to ensure high-signal evaluation:

| Band           | Total Count | Resume Deep Dive | Skill Case Study | Behavioral | Psychometric |
| :------------- | :---------- | :--------------- | :--------------- | :--------- | :----------- |
| **Fresher**    | 8 Qs        | 20%              | 10%              | 35%        | 35%          |
| **Mid-Level**  | 10 Qs       | 20%              | 20%              | 30%        | 30%          |
| **Senior**     | 13 Qs       | 20%              | 30%              | 25%        | 25%          |
| **Leadership** | 16 Qs       | 25%              | 35%              | 20%        | 20%          |

### 4.2 Unbiased Scoring (The AI Auditor)

Using **Gemini 1.5 Flash** with **Neutrality Guardrails**:

- **Semantic Scoring (0-6)**: Evaluation focuses on Resilience, Communication, Growth Potential, and Ownership.
- **Dimensional Grading**: Relevance, Specificity, Clarity, and Ownership are graded independently.
- **Trust Score Matrix**: A masked public score provided to recruiters, calculated as $(Psychometric \times 0.6) + (Behavioral \times 0.4)$. Raw psychological text is never sent to the recruiter frontend.

### 4.3 Strategic Recruiter Assessment (Company DNA)

The Recruiter Assessment evaluates the "Hiring Intent" and "Organizational Vision" through a dedicated engine:

- **Pool**: 125 dynamic questions spread across 5 pillars (Strategic Intent, ICP, Ethics, CVP, Ownership).
- **Selection**: 1 random question per pillar per session.
- **Company Profile Score (CPS)**: A normalized percentage (0-100%) stored at the company level.
- **Competitive Progress Logic**: Implements `MAX(old_score, new_score)` for multiple recruiters from the same company, allowing for continuous quality improvement without penalizing existing benchmarks.

## 5. Data Layer (Supabase Stack)

### 5.1 Supabase Auth

- **Identity Provider**: Manages Email OTP/Password login and JWT issuance.

### 5.2 Supabase Database (Postgres + RLS)

- **Relational Schema**: Stores `users`, `candidate_profiles`, `recruiter_profiles`, `assessment_sessions`, etc.
- **Row Level Security (RLS)**: Enforces data isolation between users.

### 5.3 Supabase Storage

- **`resumes`**: Private bucket for storing/retrieving raw and AI-generated PDF resumes.
- **`documents`**: Secure private bucket for government-issued ID documents (DL, Passport, etc.) for verification.
- **`profile_photos`**: Public-facing user avatars.

## 6. Security Principles

### Nuclear Ban

Terminal-level security via the `blocked_users` table that prevents API access for sanctioned IDs.

### Integrity Handshake

To prevent "Onboarding Loops," the `/auth/post-login` endpoint automatically verifies and repairs missing profile data before allowing a user to see the dashboard.

### Security

- Zero trust frontend
- RLS + service role
- No raw sensitive text stored

### Maintainability

- Python for business logic
- Clear separation of concerns
- Easy to evolve ML later

### Future Proof

- Flutter frontend compatible
- ML services can be added later
- Supabase can remain backend-of-record

## 10. Final Stack Summary (Corrected)

| Layer       | Technology                          |
| ----------- | ----------------------------------- |
| Frontend    | Next.js + Tailwind + Web Speech API |
| Backend     | **FastAPI (Python)**                |
| Auth        | Supabase Auth                       |
| Database    | Supabase Postgres (RLS)             |
| Storage     | Supabase Storage                    |
| Admin       | FastAPI + Service Role              |
| ML (Future) | Separate Python services            |

## ✅ Correction Summary (Important)

- ❌ Node.js backend → **NOT USED**
- ✅ **FastAPI backend → SOURCE OF TRUTH**
- Supabase is a **platform service**, not business logic
- All rules live in FastAPI
