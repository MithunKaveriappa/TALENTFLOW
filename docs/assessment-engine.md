## Purpose

This document defines **how assessments work internally** for both **Candidates** and **Recruiters**.
The assessment engine is the **core trust mechanism** of the platform and directly affects:

- Profile Score (0-100)
- Visibility & Reputation
- Matching Rank
- Dashboard Access

The engine utilizes **Generative AI (Gemini 1.5 Flash)** for qualitative evaluation while maintaining strict **security guards**.

## 1. Core Principles

1. **One-time assessment**
   - Assessments are high-stakes and cannot be retaken in Phase-1.
2. **AI-Driven Qualitative Scoring**
   - Answers are evaluated across multiple dimensions (Relevance, Specificity, Clarity, Ownership) on a 0-6 scale.
3. **Voice/Text Hybrid**
   - Optimized for conversational input, supporting Web Speech API for voice-to-text.
4. **Zero-Tolerance Anti-Cheat**
   - Mandatory visibility tracking and time-boxing.
5. **Real-Time Feedback**
   - Scores are calculated and normalized immediately upon completion.

## 2. Assessment Types

### Candidate Assessment (Dynamic)

- **Goal**: Generate multidimensional behavioral and technical scores.
- **Structure**: Dynamic question budget (8-16 questions) based on experience band.
- **Content**:
  - Resume-specific deep dives.
  - Skill-based practical questions.
  - Predefined psychometric/cultural dimensions (Resilience, Adaptability, etc.).

### Recruiter Assessment (Fixed)

- **Goal**: Verify company intent and recruitment ethics.
- **Structure**: Exactly **5 dimensions**.
- **Dimensions**:
  1. **Hiring Intent**: Urgency and necessity.
  2. **Ethics & Fairness**: Integrity in the hiring process.
  3. **Role Clarity**: Precision in requirements.
  4. **Value Proposition**: What the candidate gains.
  5. **Fit Definition**: Clear success criteria.

## 3. Security & Anti-Cheat

### Tab-Switch Detection

- **Rule**: 2-strike system.
- **Mechanism**: `visibilitychange` event listener on the frontend.
- **Penalty**: Immediate session termination and permanent ban (`blocked_users` table).

### Time Boxing

- **Limit**: 60 seconds per response.
- **Enforcement**: Server-side validation of response timestamp vs. question delivery.

### Copy-Paste Blocking

- **Mechanism**: Standard browser event prevention.

## 4. Evaluation Logic (The AI Grader)

Each response is passed to **Gemini 1.5 Flash** with a strict system prompt:

1. **Relevance (0-6)**: Does it answer the question?
2. **Specificity (0-6)**: Does it provide details vs. generic fluff?
3. **Clarity (0-6)**: Is the communication structure sound?
4. **Ownership (0-6)**: Does it show accountability or deep understanding?

The results are parsed as JSON. Fallback logic ensures a neutral score (3.0) if AI parsing fails, preventing data loss.

- Was an answer given?
- Minimum word count met?
- Keywords present?
- On-topic?
- Logical flow?

Each check is **boolean / numeric**, not subjective.

## 6. Signal Capture (ML-Ready, Safe)

Stored per question attempt:

- answered / skipped
- word count bucket
- keyword match count
- action verb count
- on-topic flag
- logical flow flag
- response time bucket
- confidence signal (0–1)

No free text stored.

## 7. Anti-Cheat Rules

- Copy-paste disabled
- Tab switch detection:
  - 1st → warning
  - 2nd → permanent block

- Session marked abandoned if violated
- Block enforced at user level

## 8. Scoring Logic (Summary)

### Per Question

- Base score: 0–4
- Difficulty multiplier:
  - low ×1.0
  - medium ×1.2
  - high ×1.5

- Driver score capped at 6

### Per Component

- Average driver scores
- Normalize to 0–100

### Final Score

- Experience-weighted aggregation
- Stored immutably

## 9. Assessment Completion

On completion:

- Scores written to DB
- `assessment_completed = true`
- Candidate must upload Aadhaar (Phase-1)
- Recruiter dashboard unlocks immediately
