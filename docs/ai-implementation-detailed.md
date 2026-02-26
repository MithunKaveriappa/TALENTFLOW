# TalentFlow AI Implementation Architecture

This document provides a comprehensive technical breakdown of how Artificial Intelligence is integrated into the TalentFlow platform. As of February 24, 2026, the system exclusively utilizes **Google Gemini 3 Flash (Preview)** for all high-fidelity generation and auditing tasks.

---

## 🏗️ Core AI Engine
- **Model:** `gemini-3-flash-preview`
- **Configuration:** Managed via `GOOGLE_API_KEY` in [apps/api/src/core/config.py](apps/api/src/core/config.py).
- **Architecture:** The API handles AI logic through dedicated services in `apps/api/src/services/`, ensuring a clean separation between prompt engineering and business logic.

---

## 1. High-Fidelity Resume Audit (Parsing)
**Implementation:** [apps/api/src/services/resume_service.py](apps/api/src/services/resume_service.py)

When a candidate uploads a resume, the system doesn't just extract text; it performs a structural audit to build a "High-Fidelity" profile.

### How it Works:
1. **Extraction:** Gemini extracts structured JSON including education history, experience, specific projects, and certifications.
2. **Career Gap Audit:** Specialized logic flags employment gaps > 6 months (experienced) or > 12 months (freshers).
3. **Calculated Metadata:** AI determines the "Experience Band" (Fresher, Mid, Senior, Leadership) and total years of experience.

### Primary Prompt Persona:
> *"Act as an Elite AI Talent Auditor and Data Architect for TalentFlow. MISSION: Perform a high-fidelity 'Structural Audit'..."*

---

## 2. Dynamic Assessment Engine
**Implementation:** [apps/api/src/services/assessment_service.py](apps/api/src/services/assessment_service.py)

The assessment engine uses AI to avoid generic testing, creating a unique "per-candidate" evaluation experience.

### A. Adaptive Question Generation
The AI generates questions contextually:
- **Resume-Specific:** Audits the candidate's actual job history to ask about role transitions or gap periods.
- **Skill Case Studies:** Based on a candidate's self-reported skills, it generates "High-Pressure Case Studies" (e.g., asking how they would handle a specific sales rejection in a B2B SaaS context).

### B. AI Auditor (Evaluation)
Every behavioral answer provided by a candidate is audited by Gemini.
- **Framework:** Uses the **STAR (Situation, Task, Action, Result)** framework.
- **Scoring:** 0-6 Scale (0 = None, 6 = Elite).
- **Bias Guardrails:** The prompt explicitly ignores non-standard grammar or regional idioms, focusing strictly on "Commercial Logic."

---

## 3. Career GPS (Roadmap Generation)
**Implementation:** [apps/api/src/services/career_gps_service.py](apps/api/src/services/career_gps_service.py)

This module generates a hyper-specialized career progression path for candidates focusing on Tech Sales (SaaS, Cloud, Cybersecurity).

### How it Works:
1. **Input Analysis:** Takes the candidate's current skills, target role, and long-term vision.
2. **Pathing:** Generates 4-6 milestones that represent a logical career ladder (e.g., SDR → BDR → Enterprise AE).
3. **Learning Actions:** For every milestone, the AI suggests specific certifications from **Salesforce Trailhead** or **HubSpot Academy**.

### Primary Prompt Persona:
> *"You are an elite Career Architect specialized ONLY in IT Tech Sales (SaaS, Cloud, Cybersecurity, AI Infrastructure)."*

---

## 4. Recruiter Intelligence (Company Bio)
**Implementation:** [apps/api/src/services/recruiter_service.py](apps/api/src/services/recruiter_service.py)

To streamline recruiter onboarding, the system automates company profile creation.

### How it Works:
- **Scraping:** The service scrapes the provided company website URL.
- **Synthesizing:** Gemini processes up to 2,000 characters of raw website text to distill a professional 2-3 sentence bio that captures mission, products, and value proposition.

---

## 🧪 Summary of Prompt Engineering Strategies
Across all modules, TalentFlow uses three core prompt engineering principles:
1. **High-Authority Personas:** Prompts always begin by assigning an elite role (e.g., "Lead Behavioral Psychologist").
2. **Negative Constraints:** Explicitly tells the AI what *not* to do (e.g., "NO generic advice," "No conversational filler").
3. **Structured Outputs:** All complex modules use `response_mime_type: "application/json"` to ensure data can be saved directly to the Supabase database.

---
*Note: While `OPENROUTER_API_KEY` is present in the environment configuration, it is currently reserved for future redundancy and is not used in the primary production flows.*
