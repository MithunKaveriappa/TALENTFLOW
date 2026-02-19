# TalentFlow Implementation Documentation

## 1. Project Overview

TalentFlow is a high-trust recruitment platform designed to verify candidate signals through AI-powered assessments and structured onboarding. It features distinct workflows for Candidates and Recruiters, each gated by mandatory assessments that generate "Trust Scores."

## 2. Technology Stack

- **Backend**: FastAPI (Python 3.11+)
- **Frontend**: Next.js 15+ (App Router), TypeScript, Tailwind CSS 4.0
- **Database**: Supabase (PostgreSQL)
- **Intelligence Layer (LLM Ensemble)**:
  - **Google Gemini 1.5 Flash**: Qualitative assessment scoring and dynamic question generation.
  - **Groq (Llama 3.3 70B)**: Real-time high-throughput resume parsing.
- **Document Generation**: `xhtml2pdf` + `Jinja2` for dynamic resume generation.
- **Authentication**: Supabase Auth (JWT-based)
- **Voice**: Web Speech API for voice-to-text input
- **Realtime**: Supabase Realtime (PostgreSQL Replication) for Messaging.
- **Local Development**: Explicit `127.0.0.1:8000` binding for API resilience on Windows environments.

## 3. Core Logic & Architecture

### 3.1 Authentication & The Security Handshake

- **Role Binding**: Users are assigned a role (`candidate` or `recruiter`) during signup. This is stored in the `public.users` table.
- **The Login Handshake**: To prevent redirection loops and orphaned records, the frontend calls `/auth/post-login` immediately after any login or signup.
- **Auto-Recovery**: If a user exists in Supabase Auth but is missing records in `public.users` or their respective profile table, the backend automatically initializes them based on their email domain type.
- **Onboarding Redirection**: The backend returns a specific `next_step` (e.g., `/onboarding/candidate` or `/dashboard/recruiter`), which the frontend follows blindly.

### 3.2 Candidate Implementation

#### A. Onboarding Flow (Conversational AI - 6 Steps)

1. **Experience Selection**: Candidates select an `experience_band` (Fresher, Mid, Senior, Leadership).
2. **Resume Intelligence (The Dual Path)**:
   - **Smart Upload**: Resumes are uploaded to Supabase Storage. The backend parses them using an LLM ensemble to extract roles, experience, and skills.
   - **Interactive Builder**: For users without a resume, a guided chatbot collects details (Bio, Education, Timeline).
3. **Skill Enrichment**: AI-driven confirmation of technical and soft skills (SaaS, Lead Gen, etc.).
4. **Identity Verification**: Candidates must provide Aadhaar or Passport for KYC.
5. **Terms & Conditions**: Final legal agreement to platform rules and data privacy.
6. **Onboarding Completion**: Marks profile as `COMPLETED`.

- **Strict Gating Logic**: Dashboards are locked behind a "Verification Gate" until the user has:
  1.  Completed the Assessment.
  2.  Verified Identity (Aadhaar).
  3.  Accepted Terms.
- **Persistence**: The flow uses `onboarding_step` to track progress. If a user exits mid-flow, they return to the exact step where they left.
- **Data Integrity**: Profile fields like `experience_band` and core skills are **LOCKED** after assessment completion to prevent manipulation of matching results.

#### B. Assessment Engine (AI-Driven)

- **Seniority-Based Budgets**: Total questions scale with experience (8 to 16).
- **Weighted Category Distribution**: Questions are balanced across Resume AI Deep Dive, Skill Case Studies, Behavioral, and Psychometric based on seniority.
- **0–6 Scoring**: Every answer is evaluated by Gemini based on Relevance, Specificity, Clarity, and Ownership.
- **Normalization**: Computed using `(Raw_Average / 6) * 100` and stored in a persistent `profile_scores` table.

#### C. Dashboard (Candidate View)

- **UI Architecture**: Standardized layout utilizing the shared `CandidateSidebar`.
- **High-Trust Job Board**: Implements a strict **5 applications per day** limit to enforce quality over quantity and prevent spam.
- **Application Tracking**: A functional lifecycle state machine (`applied` → `invited` → `shortlisted` → `interview_scheduled` → `offered`).
- **Performance Monitoring**: Candidates see their aggregate score and a detailed progress breakdown (Skill Progress, Identity, and Completion status).

#### D. Workflows: Take Later & Retakes

- **"Take Later"**: Allows candidates to skip the assessment during onboarding to browse the dashboard. Access remains restricted for high-value features.
- **Assessment Retakes**: Candidates can retake the assessment via settings.
- **Best Score Logic**: Implements `max(new_score, old_score)` logic.
- **Performance Reset**: Triggers a global reset of assessment data and **unlocks** experience bands for editing, allowing for genuine career updates.

### 3.3 Controlled Chat (Messaging Architecture)

- **Status**: **IMPLEMENTED**
- **Elite Constraint**: Only recruiters can initiate a chat, and only after a candidate has been shortlisted or if a specific invite is sent with a personal message.
- **No Cold Messaging**: Candidates cannot send messages to recruiters unless a thread has been opened by the recruiter.
- **Supabase Realtime**: Fully operational. Uses PostgreSQL replication to push messages instantly.
- **History Persistence**: Single-thread logic ensures a single source of truth between pairs.

### 3.4 Notifications (Signal Center)

- **Status**: **IMPLEMENTED / FULL FEATURE PARITY**
- **Hub Architecture**: A dedicated full-page "Signal Center" ([notifications/page.tsx](apps/web/src/app/dashboard/recruiter/notifications/page.tsx)) aggregating all platform activity.
- **Categorization Logic**:
  - **System Protocols**: Software updates and platform news.
  - **Candidate Activity**: New applications and interview updates.
  - **Security Alerts**: Login and account-specific changes.
- **Data Synchronization**: Powered by Supabase Realtime using PostgreSQL replication.
- **Interaction Model**:
  - **Mark All Read**: `PATCH /recruiter/notifications/read-all`.
  - **Delete All**: `DELETE /recruiter/notifications`.
  - **Action Context**: Every notification includes a `primary_action_url` for deep-linked dashboard transitions.

### 3.5 Account Settings (Executive Control Hub)

- **Status**: **IMPLEMENTED / REFACTORED**
- **UI Architecture**: A high-density, tabbed interface utilizing a left-aligned configuration sidebar.
- **Core Toggles**:
  - **Email Intelligence**: Manages summary report delivery.
  - **In-App Alerts**: Controls real-time web socket signals.
  - **Push Channels**: Manages mobile administrative signals.
- **Security Logic**:
  - **Password Reset**: Integrated email-based reset flow.
  - **2FA Deprecation**: Fully removed from the UI and backend schemas to streamline the recruiter experience.
- **API Optimization**: Uses the `RecruiterAccountSettingsUpdate` Pydantic model with `exclude_unset=True` to allow granular `PATCH` updates without database field collisions.
- **UI Standard**: Implements an "Executive Suite" aesthetic (reduced `p-8` padding, `9px` metadata tags, and `rounded-24px` containers).

### 3.6 Recruiter Implementation

#### A. Company Onboarding & Profile Sync

- **Validation**: Recruiters must provide a valid Company Registration Number (CIN or GSTIN) validated via Regex.
- **Auto-Bio Generation**:
  - The system scrapes the company website provided by the recruiter.
  - **Intelligence**: Gemini 1.5 Flash extracts a concise mission statement/bio from raw HTML.
  - **Validation Loop**: Post-onboarding, recruiters can use the "AI SUGGEST" engine in the Profile suite to re-synthesize this bio from their official website.
- **Dual-Scope Data Logic**:
  - **Individual Intent**: Professional details (LinkedIn, Job Title, Bio) are synchronized with the `recruiter_profiles` table.
  - **Organizational Identity**: Company details (Location, Industry, Sales Model, deal sizes) are synchronized with the `companies` table.
- **Profile Strength Scoring**:
  - Every update triggers a background task `sync_completion_score(user_id)`.
  - It calculates a weighted "Optimization Percentage" based on mandatory and value-add fields across both the recruiter and company records.

#### B. Recruitment Pipelines (Category A vs. B)

- **The Dual Strategy**:
  - **Pipeline A (Applied)**: Candidates grouped by job. Implements an automatic `is_skill_match` flag (≥40% skill alignment) to surfaces top talent within high-volume applications.
  - **Pipeline B (Recommended)**: Proactive talent discovery utilizing the **NeuralMatch** engine. It identifies talent through a **60% minimum threshold** based on a weighted Cultural Fit score (70% Psychometric / 30% Behavioral weighting).
- **Career GPS (Market Intelligence)**: Live market insights derived from pool data and job data. Implemented via the `get_market_insights` backend service, which calculates skill prevalence and competitive indices to define the `market_state` (High Demand vs. Balanced).
- **Global Pool**: A searchable index of all 100% verified identities on the platform with categorical seniority banding (Fresher to Executive).

#### C. Lifecycle Guardrails (The Golden Process)

To ensure process integrity, the system implements **Lifecycle Guardrails** at the database level:

1.  **State Machine Enforcement**: A PostgreSQL trigger `check_status_transition` prevents invalid jumps (e.g., Shortlisted -> Offered skipping Interview).
2.  **Audit Trail**: Every status change is logged in `job_application_status_history` with the recruiter's UUID and a timestamp.
3.  **Chat Restrictions**: The `ChatService.check_chat_permission` method enforces that a thread is only "active" if the candidate status is `shortlisted` or higher.
4.  **Bulk Workflow**: Recruiters can multi-select candidates in Pipeline A for bulk actions (Shortlist/Reject), significantly reducing manual overhead.

#### D. Virtual Interview Integration

- **Infrastructure**: Integration with Jitsi Meet (Open Source).
- **Logic**: When an interview is scheduled, a secure room link is generated: `https://meet.jit.si/TalentFlow-<application_id>`.
- **Automation**: Meeting links are automatically injected into both recruiter and candidate dashboards upon confirmation of the proposal.
- **Time Management**: All scheduling is done in **UTC** at the API layer, with frontend conversion to local timezone to prevent scheduling conflicts across regions.
  - **Confirmation Flow**: Users must approve the generated bio before it is persisted, maintaining a "Human-in-the-loop" pattern.
- **Teammate Hook**: Multiple recruiters can link to the same `company_id`.
- **Inheritance Logic**:
  - If a recruiter's company already has a **Company Profile Score (CPS)** from a colleague, the recruiter can **Skip & Use Existing** score to gain instant dashboard access.
  - Alternatively, they can choose to **Take Assessment & Improve**.

#### B. Recruiter Assessment (Company DNA Auditor)

- **Structure**: Exactly **5 questions** randomly selected from a bank of **125 validated prompts** (25 per category: Strategy, ICP, Ethics, CVP, Ownership).
- **The AI Auditor**: Uses Gemini 1.5 Flash to evaluate structural signals (Evidence-based answers vs. generic statements).
- **Scoring Logic**: $0$-$6$ scale per dimension. The total sum is normalized to a **0-100 Company Profile Score**.
- **Competitive Progress**: The company's public CPS is decided by $MAX(new\_score, existing\_score)$, ensuring institutional reputation only moves upwards.

#### C. Talent Marketplace (Recruiter View)

- **UI Architecture**: Standardized layout utilizing the shared `RecruiterSidebar`.
- **Navigation Flow**: Dashboard -> Post a Job -> My Jobs -> Candidate Pool -> Candidate Search -> Feed -> Profile -> Settings.
- **Verified Trust Matrix**: To protect raw candidate data, recruiters see a consolidated **Trust Score**:
  $$Trust Score = (Psychometric \times 0.6) + (Behavioral \times 0.4)$$
- **Visibility Gating**: Recruiters can only discover candidates with a `completed` assessment status.
- **Verification Hub**: Compact sidebar integration that facilitates the transition from "Locked" to "Active" states.
- **Dashboard UI**: Features a premium "Score Ring" visualizing the company's current trust standing.

### 3.4 Security & Anti-Cheat

- **Tab Switching (Anti-Cheat)**: Monitored via `visibilitychange`.
  - **1st Violation**: Warning.
  - **2nd Violation**: **The Nuclear Ban**. Immediate session termination, entry into `blocked_users` table, and permanent account lockout.
- **Copy-Paste Defense**: Frontend event listeners disable `onPaste` and `onContextMenu`.
- **Time Boxing**:
  - **Standard Questions**: **60 seconds** limit.
  - **Skill Case Studies**: **90-120 seconds** limit.
  - **Result**: Timeout leads to a 0.0 grade for that response.

### 3.10 Candidate Pool Discovery (Elite Talent Ecosystem)

- **Status**: **IMPLEMENTED / FULL FEATURE PARITY**
- **Discovery Architecture**: A high-signal talent sourcing engine that bypasses the need for active job postings.
- **Deep Hydration Logic**:
  - The pool initially loads lightweight candidate summaries for UI performance.
  - Clicking "View Profile" triggers `GET /recruiter/candidate/{user_id}`, which performs a multi-table join (profiles + resume_data + user_data) to hydrate the modal.
  - **Signed Resume URLs**: The system generates time-limited (3600s) signed URLs from the Supabase `resumes` bucket for candidates who have uploaded original PDFs.
- **Elite Invite & Ghost Roles**:
  - **Direct Invitation**: `POST /recruiter/candidate/{user_id}/invite` allows recruiters to bypass the standard application flow.
  - **Unlisted Role Support**: If a recruiter selects "Other / Unlisted Role", the system creates a private, unlisted `job` record with a `custom_role_title`.
  - **Thread Generation**: This creates an application record status of `invited` and immediately initializes a `chat_thread` to facilitate direct communication.
- **Discovery View Gating**:
  - The `CandidateProfileModal` implements an `isDiscovery` prop to prune job-specific tabs (Form Submissions, Application History, Interview Scheduler) when viewing candidates from the general pool.
- **UI Design**:
  - **High-Density Card Grid**: Specifically designed to fit 4 columns per row on standard desktop screens.
  - **Experience Banding**: Vertical segmentation of talent into Leadership, Senior, Mid, and Fresher bands for rapid scanning.
  - **Signal (Trust Score)**: Visual representation of the candidate's verified psychometric and behavioral alignment.

### 3.11 Job Lifecycle & Inventory (Jobs Posted)

- **Status**: **COMPLETE / FULL FEATURE PARITY**
- **Architecture**: A high-stakes recruitment command center utilizing centralized state for real-time orchestration.
- **Operational Controls**:
  - **Status Toggle**: Seamless switching between `active`, `paused`, and `closed` via `PATCH /recruiter/jobs/{job_id}`. Paused roles are preserved in the DB but hidden from public candidate discovery APIs.
  - **Hard Deletion**: Implemented `DELETE /recruiter/jobs/{job_id}` with strict owner-id verification to prevent unauthorized data removal.
  - **Architect Mode (Edit)**: A comprehensive editing suite enabling full-blueprint updates (title, mission, skills, logistics) via a dedicated UI route.
- **Search & Discovery**:
  - **Client-Side Filtering**: High-performance memoized filtering for job titles and status chips.
  - **Typography Normalization**: UI components use standardized tokenized styling (`text-lg` titles, `text-[8px]` sub-metadata) to maintain "Executive Suite" consistency.
- **Security & Authorization**:
  - **Locked View**: Global gating using the `LockedView` pattern—prevents job management if `profile_score` is 0.
  - **API Guardrails**: Every management operation validates the `company_id` of the requester against the job's owning entity.
- **UI Design**:
  - **Executive Card Matrix**: `rounded-4xl` containers with floating action menus.
  - **Compact Filters**: Minimalist search and status selection integrated into the header.

### 3.11 Acquisition Pipeline & Orchestration

- **Status**: **COMPLETE / FULL FEATURE PARITY**
- **Architecture**: A grouping-based state machine for cross-job candidate management.
- **Workflow Automation**:
  - **Chat Unlocking**: Transitioning to `shortlisted` or `invited` invokes `ChatService.get_or_create_thread`, granting messaging permissions.
  - **Thread Lock (Rejection)**: Transitioning to `rejected` updates `chat_threads.is_active` to `false`.
  - **Interview Integration**: The `InterviewScheduler` component triggers status transitions to `interview_scheduled` upon candidate confirmation, generating unique **Jitsi** URIs.
- **Frontend Intelligence**:
  - **Memoized Filtering**: Full-text search and status chip filtering implemented on the client-side for zero-latency inventory navigation.
  - **Skill Transparency**: Hover-triggered tooltips displaying the exact intersection of `candidate_profiles.skills` and `jobs.skills_required`.
- **Database Architecture**:
  - **Audit Log**: Utilizes `job_application_status_history` populated by the `trg_log_application_status` trigger.
  - **Lifecycle Guardrails**: PostgreSQL trigger `trg_validate_application_status` enforces the transition path: `applied` -> `shortlisted` -> `interview_scheduled` -> `offered`.
- **UI Design**:
  - **High-Fidelity Status Badges**: Detailed theme mapping for 6+ application states using the Tailwind 4.0 palette.
  - **Job-Centric Accordions**: Expandable/collapsible job sections using state-driven rendering.

### 3.12 Organization & Branding (Employer Identity)

- **Status**: **IMPLEMENTED / FULL FEATURE PARITY**
- **Architecture**: A non-technical, high-fidelity visual management suite.
- **Data Persistence**:
  - **Company Branding**: Stored in the `companies` table as `brand_colors` (JSONB: `primary`, `secondary`) and `brand_bio` (text).
  - **Culture Photos**: Stored as an array of URLs (`culture_photos`) in the `companies` table.
- **Storage Management (Supabase Buckets)**:
  - **`company-logos`**: Dedicated bucket for brand identity vectors/images.
  - **`company-assets`**: Dedicated bucket for "Life At [Company]" culture photos.
  - **Path Logic**: `[user_id]/[asset_type]-[timestamp]` for strict per-user ownership and cache busting.
- **Intelligence Hook**:
  - Updating branding assets (Logo, 3x Photos, or Primary Colors) triggers `recruiter_service.sync_completion_score`.
  - This background task recalculates the **Company Profile Score** to reflect profile hydration.
- **Frontend Design**:
  - **Non-Technical Language**: Terms like "Hex", "Nodes", and "DNA" were purged in favor of "Style" and "Color".
  - **Spectral Control**: Features 18 curated color presets plus a hidden `input type="color"` triggered via a visual "Spectral Selection" hub.

### 3.13 Community & Social Architecture (The Feed)

- **Status**: **IMPLEMENTED / FULL FEATURE PARITY**
- **Architecture**: A centralized social and professional synchronization layer.
- **REST Endpoints (`api/posts.py`)**:
  - `POST /posts`: Creation of broadcasts.
  - `GET /posts/feed`: Retrieves the 50 most recent posts with deep author hydration and persistent "Pinned" signals.
  - `PATCH /posts/{post_id}`: Ownership-verified content updates.
  - `DELETE /posts/{post_id}`: Ownership-verified post removal.
  - `POST /posts/follow` / `DELETE /posts/unfollow/{id}`: Relationship management.
  - `POST /posts/{id}/pin` / `DELETE /posts/{id}/unpin`: Persistent signal storage.
- **Data Hydration Logic**:
  - The feed engine performs a 4-table lookup: `posts` -> `users` -> `candidate_profiles` / `recruiter_profiles` -> `follows`.
  - Determines author roles (Candidate/Recruiter) and fetches corresponding metadata (Full Name, Photo).
  - Cross-references the `user_pinned_posts` junction table to identify saved signals for the current user.
- **Storage Management (Supabase Buckets)**:
  - **`community-media`**: Dedicated bucket for broadcast attachments.
  - **Path Logic**: `[user_id]/[random_filename].[ext]` for strict ownership and collision avoidance.
- **UI Architecture**:
  - **Component**: `CommunityFeed.tsx`.
  - **Pinned Side-Panel**: Dedicated "Pinned for You" tactical dashboard section featuring real-time state synchronization.
  - **Media Grid**: Dynamic 1-column vs. 2-column grid based on number of `media_urls`.
  - **Ownership Verification**: Frontend-side `currentUserId === post.user_id` check for rendering Edit/Delete controls.
- **Database Tables**:
  - `posts`: Base content, `user_id`, media URLs, and type.
  - `follows`: Map of `follower_id` to `following_id`.
  - `user_pinned_posts`: Persistent junction table for M:N user-post relationships.

### 3.14 Team Management & Roles (Multi-Recruiter)

- **Status**: **IMPLEMENTED / FULL FEATURE PARITY**
- **Architecture**: A hierarchical Multi-Recruiter system based on a shared `company_id`.
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Has full CRUD permissions for job posts and team members. Can promote/demote colleagues and remove them from the organization.
  - **Recruiter**: Limited-access persona. Can browse the dashboard and manage jobs but cannot access "Team Management" actions.
- **REST Endpoints (`api/recruiter.py`)**:
  - `GET /recruiter/team`: Fetches all profiles sharing the same `company_id` with a joined lookup on the `users` table for email addresses.
  - `POST /recruiter/invite`: Inserts a record into `team_invitations` for new recruiter onboarding.
  - `PATCH /recruiter/team/{id}/role`: Toggles the `is_admin` boolean for a teammate.
  - `DELETE /recruiter/team/{id}`: Detaches a member by setting their `company_id` to `null` and `is_admin` to `false`.
- **Administrative Guardrails**:
  - **Self-Operation Lock**: Backend `if member_id == user_id` checks prevent admins from demoting or removing themselves.
  - **Company-Isolation Validation**: Every management API call validates that the target `member_id` shares the same `company_id` as the authenticated requester.
- **Deployment Logic**:
  - Uses **Optimistic State Updates** for role changes and teardowns, ensuring the UI remains high-performance for executive users.
  - UI Component: `TeamManagementPage` ([page.tsx](apps/web/src/app/dashboard/recruiter/organization/team/page.tsx)).

## 4. Database Schema Summary

- `users`: Base identity and role tracking.
- `candidate_profiles` / `recruiter_profiles`: Role-specific metadata and onboarding progress.
- `companies`: Entity for recruiter association and profile scoring.
- `recruiter_assessment_questions`: Dedicated 125-question bank for recruiter DNA audits.
- `assessment_sessions`: Tracks live candidate assessment state.
- `assessment_responses`: Stores candidate AI-generated scores.
- `recruiter_assessment_responses`: Stores recruiter AI-generated scores.
- `profile_scores`: Persistent storage for highest achieved categorical and final scores.
- `blocked_users`: Security log for banned users (Nuclear Ban).
- `notifications`: Centralized event-driven alert system.
- `chat_threads`: 1-to-1 elite messaging channels.
- `chat_messages`: Audited real-time message logs.

### 3.7 Interview & Process Scheduling

- **Status**: **IMPLEMENTED (Hybrid Support)**
- **The "Propose" Workflow**: Recruiters do not "assign" times. They propose up to 3 available slots (UTC), and the candidate must confirm one.
- **Hybrid Support**:
  - **Virtual**: Integrated with **Jitsi Meet**. The system generates a secure, unique meeting room link upon candidate confirmation.
  - **Face-to-Face (On-site)**: Specific workflow for physical meetings including a dedicated `location` field for the physical address.
- **Trust-First Design**:
  - **Transparency**: Interviewer names are mandatory to build candidate trust.
  - **Audit Trail**: Cancellations require a reason and are logged in the process history.
- **Lifecycle Integration**: Automatically transitions application status from `Shortlisted` to `Interview Scheduled` upon confirmation.
- **Feedback Loop**: After an interview, recruiters are required to provide structured feedback to either mark as `Complete` (Next Round/Offer) or `Rejected`.

### 3.8 Recruiter "Do It Later" Locking System

- **Status**: **IMPLEMENTED**
- **The Friction Logic**: Recruiters can skip the DNA assessment during onboarding to browse the dashboard.
- **Hard Locks**: High-impact transmissions are locked until a `profile_score > 0` is achieved.
- **Restricted Features**:
  - **Talent Search (Career GPS)**: Market insights are hidden behind a `LockedView`.
  - **Job Management**: Recruiters cannot post or manage live jobs.
  - **Candidate Intelligence**: Full profile details and "Elite Pool" access are restricted.
  - **Messaging**: The communication channel remains dormant.
- **Unlocking**: Requires completion of the 5-question Cultural DNA assessment.

### 3.9 Advanced Hiring Funnel (Cumulative Analytics)

- **Status**: **IMPLEMENTED**
- **Logic**: Unlike independent counters, the funnel tracks **successful transitions** through the recruitment lifecycle.
- **Funnel Stages**: `Applied` → `Shortlisted` → `Interviewed` → `Hired`.
- **Pass-through Rates**: The system calculates the conversion efficiency from initial interest to final hire.
- **UI Architecture**: Visualized via the `HiringFunnel` component with real-time "Optimal/Sub-optimal" health indicators.

## 5. Scoring Math

- **Raw Dimension Score**: 0 to 6 (AI Generated).
- **Question Average**: Avg(Relevance, Specificity, Clarity, Ownership).
- **Normalization**: `(Average_Score / 6) * 100`.

## 6. Implementation Timeline (Current Progress)

- [x] Backend & Frontend Scaffold
- [x] Candidate Onboarding Chat
- [x] Recruiter Onboarding Chat
- [x] AI Resume Parsing & Skill Extraction
- [x] **Interactive Resume Builder & PDF Generation**
- [x] **Security Handshake (Session Recovery & Auto-Initialization)**
- [x] Security (Tab Switching & 2-Strike Ban)
- [x] Scoring Engine Implementation
- [x] Weighted Question Distribution (Seniority Scaling)
- [x] Retake Logic with "Best Score" Persistence
- [x] Aadhaar Verification persistence across retakes
- [x] "Take Later" / Dashboard Gating
- [x] Premium Dashboard UI for both roles
- [x] Feature 5: Controlled Chat (Architecture/DB/Impl)
- [x] Feature 6: Notifications Hub (Architecture/Impl)
- [x] Feature 7: Interview & Process Scheduling
- [x] **Feature 9: Pipeline A (Applied Candidates View)**
- [x] **Feature 10: Bulk Actions & Ethical Rejection Feedback**
- [x] **Feature 11: Lifecycle Guardrails & Audit Trail**
- [x] **Feature 12: Context-Aware Chat Restrictions**
- [x] Feature 8: Integrated Account Settings (Personal vs Profile)
- [x] API Connection Stability (127.0.0.1 alignment)
- [x] Feature 13: Recruiter "Do It Later" Gating & Hard Locks
- [x] Feature 14: Cumulative Hiring Funnel Analytics
- [x] Feature 3: Career GPS & Market Insights (UI Standardized)
- [x] Branding Enhancements (Lifestyle Photos & Employer DNA)
- [x] Automated Jitsi Video URIs
- [x] **Feature 15: Candidate Pool Discovery (High-Density & Deep Hydration)**
- [x] **Feature 16: Elite Invite & Ghost Role Supporting Recruitment**
- [x] TypeScript & Linting Build Fixes (100% Type Safe)
- [x] Feature 19: Tactical Signal Pinning (Post Persistence)
- [ ] Feature 17: Matching Algorithm Refinement (Next)
- [ ] Feature 18: Automated Candidate Screening AI (Planned)

```
taskkill /F /IM node.exe /T; taskkill /F /IM python.exe /T; taskkill /F /IM uvicorn.exe /T; Remove-Item -Path "apps/web/.next" -Recurse -Force -ErrorAction SilentlyContinue; Get-ChildItem -Path . -Filter "__pycache__" -Recurse | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
```
