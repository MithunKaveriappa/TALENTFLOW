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
      - _Interest Captured_ (Applied)
      - _Verified Matches_ (Shortlisted)
      - _Active Dialogues_ (Interviewed)
      - _Success Secured_ (Hired)
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

_Located in:_ [dashboard/recruiter/messaging](apps/web/src/app/dashboard/recruiter/messaging/page.tsx)

- **Real-time Interaction:** Instant messaging layer powered by Supabase Realtime for candidate-recruiter synchronization.
- **Context-Aware Dialog:** Integrated view showing candidate skill match data and application history alongside the chat.
- **Status Indicators:** Live online/offline tracking and delivery confirmation using semantic terminology ("Send" instead of "Transmit").

---

## 3. Hiring Hub: Post a Role (Smart Role Architect)

_Located in:_ [dashboard/recruiter/hiring/jobs/new](apps/web/src/app/dashboard/recruiter/hiring/jobs/new/page.tsx)

The Job Creation suite has been transformed from a standard utility into a high-fidelity "Executive Suite" experience, featuring the **Smart Role Architect**.

### Core Architecture

- **Vertical Section Design:** Moving away from standard 2-column layouts to a premium, vertical flow that groups information into logical "Mission-Critical" blocks:
  - **Role Architecture:** Focuses on identity, seniority (Fresher to Leadership), and engagement type.
  - **Mission & Impact:** A deep-dive into the role's purpose rather than just listing tasks.
  - **Signal Alignment:** Structured capture of core requirements and technical skill signatures.
  - **Market Logistics:** Location mapping and opening tracking.
- **Executive Aesthetics:** Utilizes `rounded-4xl` containers, high-contrast Slate-900 typography, and Indigo-600 accents.

### AI Integration: Smart Role Architect

- **Multi-Model Intelligence:** Uses a fallback chain of Gemini (2.0 Flash/1.5 Flash) and Gemma (3-27b/4b) to ensure 100% availability for role generation.
- **Contextual Expansion:** Takes a minimal user prompt (e.g., "Senior React Engineer") and automatically synthesizes:
  - An industry-standard high-impact job title.
  - A 300-word professional mission narrative.
  - Experience-aligned core requirements.
  - Technical skill tags and market-accurate salary ranges.
- **Seamless Injection:** The generated JSON is instantly injected into the form state, allowing recruiters to review and edit before publishing.

### UI Innovations

- **Sticky Command Bar:** A glassmorphism-style header (`backdrop-blur-md`) that keeps critical actions (AI Architect, Publish) always accessible.
- **Floating AI Assistant:** An overlay interface that allows recruiters to "describe the mission" while the AI handles the metadata mapping in the background.

---

## 4. Hiring Hub: Job Inventory & Pipeline

_Located in:_ [dashboard/recruiter/hiring/jobs](apps/web/src/app/dashboard/recruiter/hiring/jobs/page.tsx) & [dashboard/recruiter/hiring/applications](apps/web/src/app/dashboard/recruiter/hiring/applications/page.tsx)

### Jobs Posted (Inventory Management)

The "Jobs Posted" inventory is the central command hub for a recruiter's active roles, optimized for rapid oversight and operational control.

- **Unified Search & Status Filtering**: A redesigned, compact search container that integrates real-time text searching with instant status chips (All, Active, Paused, Closed).
- **Executive Card Design**: High-density interface using normalized typography—`text-lg` for role titles and `text-[8px]` for metadata—maintaining a clean "Executive Suite" aesthetic across the dashboard.
- **Advanced Lifecycle Controls**:
  - **Active/Pause Toggle**: Instant switching of role availability to manage incoming application volume.
  - **Status Persistence**: Roles move seamlessly between `Active`, `Paused`, and `Closed` states with immediate UI feedback.
  - **Hard Delete**: Secured deletion with backend ownership verification to maintain inventory hygiene.
- **Architect Mode (Edit Functionality)**: A dedicated "Blueprint Architect" interface ([dashboard/recruiter/hiring/jobs/[id]/edit](apps/web/src/app/dashboard/recruiter/hiring/jobs/[id]/edit/page.tsx)) for refining role specifications, requirements, and assessment criteria.
- **Real-Time Indicators**: Functional counters for "Slots Open" and "Total Applications" displayed with high-visibility iconography.

### Acquisition Pipeline (Candidate Orchestration)

The Acquisition Pipeline follows a high-fidelity "Openings & Talent" layout that prioritizes rapid status oversight and role-based tracking.

#### Core Tracking Architecture & Interaction

---

## 5. Profile & Organizational Identity (Identity Hub)

_Located in:_ [dashboard/recruiter/account/profile](apps/web/src/app/dashboard/recruiter/account/profile/page.tsx)

The Profile suite serves as the "Command Center" for a recruiter's professional digital footprint and their company's marketplace positioning.

### 5.1 Dual-Scope Architecture

The system bifurcates information into two critical blocks to ensure clean identity management:

- **Profile:** Manages individual professional identifiers (Full Name, Job Title, LinkedIn, and Professional Pitch).
- **Company Profile:** Focuses on organizational intelligence (HQ Location, Website, Industry, Sales Model, and Average Deal Size).

### 5.2 AI Intelligence Integration (Synthesis Engine)

- **AI SUGGEST Feature:** A dedicated synthesis action within the "Company Mission" block.
- **Logic:** It triggers a Gemini-powered scraping and synthesis task that extracts a 2-3 sentence "Professional Elevator Pitch" directly from the provided company website.
- **Validation:** Includes robust feedback loops that inform the recruiter if a website's metadata is insufficient for high-quality synthesis.

### 5.3 Premium UI & "Signal Quality"

- **Identity Banner:** A high-fidelity Slate-900 hero section with glassmorphism elements and indigo energy glows.
- **Profile Strength Meter:** A visual 0-100% "Optimization Gauge" that reflects the completeness and quality of the recruiter's marketplace signals.
- **Sticky Action Dock:** A persistent footer control panel for rapid "UPDATE" and "Discard changes" operations, ensuring a frictionless editing experience.
- **Executive Typography:** Utilizes the "Mission Control" font standard—bold, high-tracking uppercase labels for maximum scanning efficiency.

---

## 5. Hiring Hub: Candidate Pool (Elite Talent Ecosystem)

_Located in:_ [dashboard/recruiter/hiring/pool](apps/web/src/app/dashboard/recruiter/hiring/pool/page.tsx)

The Candidate Pool is a high-signal discovery engine that allows recruiters to proactively source talent from the TalentFlow ecosystem without waiting for applications.

### Discovery Architecture

- **High-Density "Elite Talent" Grid**: A specialized 4-column layout (on large screens) featuring compact, high-information cards.
- **Experience Banding**: Candidates are automatically categorized into vertical "Bands" for rapid scanning:
  - **Executive Leadership**
  - **Senior Talent**
  - **Mid-Level**
  - **Freshers**
- **Signal Signal (Trust Score)**: Visual "Signal" indicator (0-100%) on every card, representing the candidate's verified psychometric and behavioral alignment.

### Deep Hydration & Profile Modals

- **On-Demand Hydration**: To ensure performance, the pool initially loads lightweight candidate summaries. Clicking "View Profile" triggers a **Deep Fetch** to the backend to hydrate full work history, education, and professional bios.
- **Discovery Mode Modal**: A specialized version of the `CandidateProfileModal` that:
  - Purges job-specific tabs (Job Application, Form Submission, Interview).
  - Prioritizes the "Generated CV" and "Original PDF" tabs.
  - Contextualizes the view as "Ecosystem Discovery."

### Advanced Invitation System (Elite Invite)

The Candidate Pool moves beyond simple bookmarking by enabling **Direct Engagement**:

- **Active Job Sync**: Recruiters can instantly invite any pool candidate to their active role inventory.
- **Private/Unlisted Role Support**:
  - Allows recruiters to recruit for "Ghost Roles" (roles not yet publicly posted).
  - Selection of **"+ Other / Unlisted Role"** allows entry of a custom role title.
  - The system automatically creates a private job record and initiates a **Controlled Chat** thread with a personalized invitation message.

### UI & UX Excellence

- **Compact Geometry**: Uses `h-14` avatars and `rounded-2xl` internal components to maintain a clean "Executive Suite" look.
- **Real-Time Search**: Integrated name, role, and skill-signature filtering for rapid talent identification.
- **Status Gating**: Access is restricted to "Verified Recruiters" with a `profile_score > 0` to maintain ecosystem quality.

---

## 6. Neural Intelligence: NeuralMatch (Pipeline B)

_Located in:_ [dashboard/recruiter/intelligence/recommendations](apps/web/src/app/dashboard/recruiter/intelligence/recommendations/page.tsx)

NeuralMatch is the platform's high-tier proactive discovery layer. Unlike the Candidate Pool (which is based on search filters), NeuralMatch uses a weighted behavioral heuristic to "push" the most compatible talent to the recruiter.

### Core Match Engine (The Logic)

The "Sync" between a recruiter and a candidate is calculated using a specialized backend weighting:

- **Psychometric Weight (70%)**: Focuses on character drivers, growth potential, and emotional stability.
- **Behavioral Weight (30%)**: Focuses on professional resilience, communication, and ownership.
- **Formula**: `(Psychometric * 0.7) + (Behavioral * 0.3)`
- **Production Threshold**: A strict **60%** minimum match is required for a candidate to enter the NeuralMatch grid.

### Discovery Tiers

Candidates are automatically categorized into premium hierarchical tiers to facilitate rapid scanning:

1.  **Elite Alignment (90%+ Match)**: Marked with Orange branding and a **Trophy** icon. These represent the platform's highest psychometric correlation.
2.  **High Potential (75-89% Match)**: Marked with Indigo branding and a **Target** icon. Strategic culture alignment.
3.  **Emerging Sync (60-74% Match)**: Marked with Slate branding and a **Users** icon. Verified behavioral consistency.

### Feature Controls & Interactions

#### Primary Discovery Actions

- **"Expert Profile" Button**: Triggers a **Neural Hydration Scan**. This opens the full `CandidateProfileModal`, fetching deep-linked timeline data, education records, and verified achievements from the `candidate_details` service.
- **"Sync Direct" (+ Plus Button)**: A rapid-invitation trigger. It opens the `JobInviteModal`, allowing recruiters to instantly map the recommended talent to any active or unlisted role in their inventory.
- **Profile Deep Link (Header)**: A secondary access point in the card header for navigating to the full candidate view.

#### Visual Metadata & Signals

- **Culture Affinity Badge**: A dynamic percentage indicator (`culture_match_score`) showing the results of the neural alignment calculation.
- **Identity Trust Signal**: Every recommended candidate features an emerald verification badge ([CheckCircle2]) ensuring they have passed mandatory platform KYC.
- **Seniority Verification**: Displays `{years_of_experience}Y Verified`, providing a source-of-truth signal for market tenure.

---

## 7. Notification Hub (Signal Center)

_Located in:_ [dashboard/recruiter/notifications](apps/web/src/app/dashboard/recruiter/notifications/page.tsx)

The Notification Hub is a high-fidelity "Signal Center" that aggregates all system-critical alerts into a single, searchable executive interface.

### 7.1 Intelligence Categorization

To prevent information fatigue, signals are automatically categorized into three distinct protocols:

- **System Protocols (Blue)**: Platform updates, maintenance alerts, and administrative changes.
- **Candidate Activity (Amber)**: New applications, interview confirmations, and messaging signals.
- **Security Alerts (Red)**: Login attempts, password changes, and high-priority account notifications.

### 7.2 Core Interaction Features

- **Real-Time Synchronization**: Powered by Supabase Realtime, signals appear instantly without page refreshes.
- **Bulk Intelligence**:
  - **"Clear Frequency"**: One-click action to mark all notifications as read.
  - **"Purge History"**: Removes all notification data from the recruiter's view to maintain a clean workspace.
- **Deep-Link Navigation**: Every signal includes a "Primary Action" (e.g., "Review Candidate") that navigates the recruiter directly to the relevant dashboard section.

### 7.3 UI/UX Excellence

- **Executive Card Design**: Uses `rounded-2xl` containers with subtle indigo borders.
- **Temporal Logic**: Displays relative time (e.g., "2m ago") for immediate urgency assessment.
- **Empty State "Zen"**: A specialized "All Clear" interface with high-fidelity iconography for when all signals have been addressed.

---

## 8. Account Settings (Executive Control Hub)

_Located in:_ [dashboard/recruiter/account/settings](apps/web/src/app/dashboard/recruiter/account/settings/page.tsx)

The Settings Hub has been redesigned into a high-density "Executive Suite" that prioritizes rapid configuration and platform security.

### 8.1 Tabbed Architecture

The interface utilizes a left-aligned sidebar navigation for seamless switching between configuration scopes:

- **Security & Access (Vault)**: Password management and environment encryption status.
- **Communication (Protocols)**: Toggle controls for Email, Web, and Mobile push signals.
- **Visibility Control (Privacy)**: Granular management of profile public/private status.
- **System Preferences (Localization)**: Language and timezone synchronization.

### 8.2 Security & Integrity

- **Password Reset Protocol**: Integrated Supabase Auth reset flow with secure email link generation.
- **Environment Encryption**: Real-time visual indicator of the workspace's encryption status.
- **Lean Architecture**: Removed legacy Two-Factor Authentication (2FA) in favor of deep-linked session security, simplifying the recruiter experience while maintaining standard enterprise protection.

### 8.3 Technical Optimization ("Executive Look")

- **High-Density Layout**: Reduced padding (`p-8`) and consolidated component geometry (`rounded-24px`) for a more technical, professional feel.
- **Normalized Typography**: Extensive use of `9px` uppercase tracking labels for sub-metadata, ensuring high scannability without visual clutter.
- **Server Sync Optimization**: Implemented strict Pydantic V2 validation schemas (`RecruiterAccountSettingsUpdate`) to ensure zero-latency synchronization with the cloud database.
- **Email Visibility**: Every card prominently displays the candidate's verified email address (flattened from the `users` table) to facilitate high-priority contact.

---

## 8. Intelligence Center: Career GPS

_Located in:_ [dashboard/recruiter/intelligence/gps](apps/web/src/app/dashboard/recruiter/intelligence/gps/page.tsx)

Career GPS is the recruiter's strategic navigation suite. It provides real-time, platform-wide market intelligence to help recruiters understand the current talent landscape and competitive pressures.

### Market Intelligence Engine (Backend)

The "GPS" operates by synthesizing live data across the entire ecosystem:

- **Skill Density Map**: Analyzes every candidate with a `completed` assessment status. It calculates the prevalence of specific skills relative to the total verified pool size.
- **Competition Index**: Scans all `active` job postings to identify high-demand skill requirements and the volume of openings per skill.
- **Market State Heuristic**: A dynamic calculation that determines the health of the pool. If the number of verified candidates is less than 2x the number of active roles, the GPS flags the market as **"High Demand."**

### Visual Intelligence Units

#### 1. Skill Density Map

- **Function**: Visualizes the prevalence of core skills (Technical/Soft) using dynamic percentage bars.
- **Recruiter Value**: Identifies "hot" vs "saturated" skills in the current candidate pool.

#### 2. Competition Index

- **Function**: Displays active job openings per skill area.
- **Logic**: If openings exceed 5 for a specific skill, the index triggers a **Red Pulse** indicator, signaling to recruiters that time-to-hire may be longer due to high market competition.

#### 3. GPS Guidance (Strategic Suite)

- **Content**: Automatically generates strategic advice based on live data (e.g., "Budget for [Skill] talent should be increased due to low counts").
- **Action**: Provides a direct "Post High-Demand Role" button that triggers the Strategic Role Architect to capitalize on market gaps.

### KPIs & Global Metrics

- **Pool Health**: An executive indicator (High Demand vs. Balanced) based on candidate-to-role ratios.
- **Verified Talent Pool**: A large-scale counter of every identity-verified, assessment-passed candidate currently discoverable.

---

## 9. Organization Hub: Employer Branding

_Located in:_ [dashboard/recruiter/organization/branding](apps/web/src/app/dashboard/recruiter/organization/branding/page.tsx)

The Employer Branding suite is a premium visual management tool designed for non-technical users to define their company's digital identity on the platform.

### Visual Identity Management

- **Logo & Culture Assets**:
  - **Company Logo**: High-resolution brand identification.
  - **Life At [Company] Photos**: A 3-slot premium gallery for showcasing office culture, team events, and workspaces.
  - **Storage Strategy**: Assets are stored in dedicated Supabase buckets (`company-logos` and `company-assets`) with hierarchical paths: `[user_id]/[asset_type]-[timestamp]`.

- **Unlimited Color Selection**:
  - **Presets**: An 18-color "Executive Grid" featuring professionally curated palettes (Slate, Indigo, Rose, Amber, Emerald, etc.).
  - **Spectral Picker**: A "Custom Style" hub that unlocks an unlimited hex-color spectrum for pixel-perfect brand alignment.
  - **Term Purge**: All technical jargon (e.g., "Identity Nodes", "Hex Tokens") has been removed in favor of intuitive labels ("Main Color", "Style").

### Backend Synchronization & Scoring

- **Profile Hydration**: Updates to branding data (colors, photos, logos) are persisted in the `companies` table.
- **Automatic Score Sync**: Every branding update triggers the `recruiter_service.sync_completion_score` on the backend.
  - **Impact**: Completing the branding profile increases the company's "Signal Power" (Profile Score), directly improving visibility in the Talent Pool.

### UI & UX Excellence

- **Non-Technical Interface**: Interface uses simplified language ("Ready", "Incomplete", "Selection") to ensure ease of use for executive users.
- **Glassmorphism Design**: High-density cards with `rounded-[2rem]` geometry and professional `h-10` action buttons.
- **Real-time Previews**: Instant visual feedback as users toggle between color presets or upload new culture photos.

---

## 10. Acquisition Pipeline (Candidate Orchestration)

- **Applied Role Column**: Instantly identify which position a candidate is targeting.
- **Elite Match Intelligence**:
  - **Signal**: Backend-calculated `is_skill_match` flags elite talent with a **Zap** icon directly next to their name.
  - **Transparency**: Hovering over match signals reveals the precise intersection of skills.
- **High-Fidelity Candidate Profile Hub**:
  - **Secure Resume Viewer**: Integrated Adobe-style PDF viewer utilizing Supabase Signed URLs (1-hour expiry) to display private candidate resumes securely.
  - **Dual-View CV System**: Toggle between the platform's high-fidelity "Generated CV" (AI-standardized) and the candidate's "Original PDF."
  - **Skill Performance Matrix**: Visual breakdown of 0-6 dimensional assessment scores (Relevance, Specificity, Clarity, Ownership).
  - **Internal Star Ratings**: 1-5 star "Internal Rating" system for recruiter-only notes to standardize talent evaluation.
- **Enterprise Search & Filter**:
  - **Search Engine**: Real-time filtering by Name, Role, or Skill.
  - **Action Suite**: Dedicated "Filter," "Sort," and "Date Range" dropdowns along with a one-click **Export Data** utility.

#### Lifecycle & Process Controls

- **The Gold Path Guardrail**: A strict database-level state machine prevents "stage jumping" (e.g., Screening → Offer is blocked without an Interview Scheduled).
- **Automated Stage Badges**:
  - `Screening` (Applied/Shortlisted) → Amber
  - `Interview` (Interview Scheduled) → Cyan
  - `Offer` (Offered) → Rose
  - `Hired` (Closed) → Indigo
- **Shortlist Automation**: Shortlisting a candidate instantly unlocks the **Elite Hub** (Real-time Messaging), allowing direct communication.
- **Advanced Interview Orchestration**:
  - **Virtual & Face-to-Face Support**: Specialized workflows for Video calls (Zoom/Google Meet) or On-site meetings with precise physical address/location inputs.
  - **Multi-Slot Proposals**: Propose up to 3 time slots per candidate to minimize back-and-forth coordination.
  - **Automated Room Generation**: Automatic generation of **Jitsi Meet** rooms for virtual sessions upon status transition.
- **Ethical Rejection Flow**:
  - Bulk rejection requires a structured reason from a pre-validated ethical bank.
  - Automatic deactivation of chat threads upon rejection.

#### Integrity & Audit

- **Journey Audit Trail**: Every status change is logged in a persistent audit trail, viewable via the **Clock icon** on any candidate row.

---

## 11. Community Ecosystem: Feed (Broadcast Hub)

_Located in:_ [components/CommunityFeed.tsx](apps/web/src/components/CommunityFeed.tsx)

The Community Feed is the platform's professional synchronization layer, enabling recruiters and candidates to share real-time insights, learnings, and organizational updates.

### Broadcast Capabilities

- **Multimedia Messaging**:
  - Supports high-impact text broadcasts with automatic whitespace preservation.
  - **Dynamic Media Grid**: Intelligent rendering of images and videos. Single assets display full-width, while multiple assets (2+) utilize a compact 2-column grid.
  - **Video Integration**: Native support for `.mp4` and `.webm` files with integrated player controls.

- **Non-Technical Management**:
  - **Broadcast Creator**: A simplified interface for sharing "Learnings or Updates" without complex formatting tools.
  - **Photo/Video Vault**: Direct upload to the `community-media` bucket with automatic path-based isolation.
  - **Ownership Control**: Instant **Edit** and **Delete** actions for post owners, allowing for rapid corrections or hygiene management.

---

## 12. Organization Hub: Team Management

_Located in:_ [dashboard/recruiter/organization/team](apps/web/src/app/dashboard/recruiter/organization/team/page.tsx)

The Team Management suite is a high-fidelity administrative center designed for managing organizational hierarchy and recruiter permissions.

### High-Fidelity "Compact Profile" Grid

Moving away from legacy tables, the team interface utilizes a **Compact Profile Card Grid** designed for rapid executive oversight.

- **Visual Identity**: Features stylized geometric avatars and high-contrast typography (`text-lg` for names, `text-[10px]` for titles).
- **Glassmorphism Aesthetic**: Cards utilize `rounded-[2.5rem]` geometry with soft indigo shadow depth and horizontal accent markers.
- **Live Status Badges**:
  - **Role Pill**: Visual distinction between `Admin` (Blue) and `Recruiter` (Gray).
  - **Assessment Badge**: A `BadgeCheck` signal indicating if the teammate has completed their "Cultural DNA" assessment.

### Administrative Command Center (Admin Only)

Authorized administrators have access to an expanded action suite for team orchestration:

- **Invite Recruiter**: A dedicated "Global Invite" modal for onboarding new talent partners via professional email.
- **Leadership Toggle (Promote/Demote)**: A one-click `ShieldCheck` utility to upgrade recruiters to Admins or demote them to standard access.
- **Team Hygiene (Remove Member)**: A rapid `UserMinus` action that instantly detaches a member from the company organization, revoking access to all private jobs and applications.

### Security & Permission Logic

- **Self-Protection**: Admins are restricted from demoting or removing themselves to prevent organization lockouts.
- **Optimistic UI**: All role changes and removals feature instant visual feedback, with backend synchronization happening in the background for zero-latency management.

### Professional Synchronization (The "Connect" System)

- **Identity Signals**:
  - Every post features a specialized role badge: **Recruiter** (Indigo) or **Candidate** (Emerald).
  - High-fidelity author attribution including `full_name` and `profile_photo_url` (where available).
- **The Follow Mechanism**:
  - Recruiters can "Follow" or "Connect" with authors directly from the feed to curate their professional signal stream.
  - **Real-time Status**: Follow buttons toggle instantly between "Connect" and "Following" states based on live database status.

### Backend Intelligence & Security

- **Deep Signal Hydration**: The feed engine performs a multi-table join across `posts`, `users`, `candidate_profiles`, and `recruiter_profiles` to ensure zero-latency author data resolution.
- **Audit-Ready Operations**: Every post deletion is persistent across the ecosystem, and every edit is timestamped for historical accuracy.
- **Synchronized Loading**: Utilizes a "Synchronizing Feed..." state to maintain the dashboard's high-intelligence aesthetic during data retrieval.

```

```
