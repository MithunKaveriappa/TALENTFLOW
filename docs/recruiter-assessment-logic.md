# Recruiter Assessment Logic: The Company Profile Score (CPS)

## Overview
The Recruiter Assessment is a high-signal, unbiased evaluation system designed to measure the "Strategic Intent" and "Universal DNA" of a recruiter. Unlike candidate assessments that focus on job skills, this assessment evaluates the clarity, ethics, and long-term vision of the person building the team.

## The 5 Pillars of Recruitment DNA
Each recruiter is presented with 5 questions, randomly selected from a bank of 125 questions (25 per category).

1.  **Strategic Intent & Universal DNA (recruiter_intent)**:
    *   **Focus**: Moves away from role-specific tasks to measure the recruiter's understanding of the company's "Soul" and long-term vision.
    *   **Goal**: Ensure the recruiter isn't just "hiring for a slot" but "building a culture."

2.  **Ideal Talent Archetype (recruiter_icp)**:
    *   **Focus**: Definitions of high performance beyond technical skills.
    *   **Goal**: Identifying non-negotiable personality traits and behavioral markers.

3.  **Ethical Integrity & Bias Neutralization (recruiter_ethics)**:
    *   **Focus**: How the recruiter handles subjectivity and ensures a fair playing field.
    *   **Goal**: Protection against unconscious bias and cronyism.

4.  **Value Proposition & Talent Magnetism (recruiter_cvp)**:
    *   **Focus**: The ability to articulate *why* a top-tier candidate should choose their company.
    *   **Goal**: Moving from "salary-first" to "mission-first" selling.

5.  **Ownership & Outcome Accountability (recruiter_ownership)**:
    *   **Focus**: Willingness to take responsibility for the long-term success of the hire.
    *   **Goal**: Preventing "hand-off and forget" mentalities.

## Unbiased Scoring Rubric (The AI Auditor)
The system uses **Gemini 1.5 Flash** as an **Objective Auditor**. It ignores sentiment, politeness, and buzzwords, focusing solely on "Structural Signals" and "Strategic Intent."

### Semantic Evaluation Framework
Each answer is scored on a **0-6 scale** using a holistic rubric that eliminates linguistic and cultural bias:

| Dimension | Focus | Signal Indicators |
| :--- | :--- | :--- |
| **Strategic Logic** | Intent | Does the recruiter explain the *why* behind their approach? |
| **Evidence of Ownership** | Accountability | Does the candidate use first-person examples of taking responsibility? |
| **Ethical Framework** | Bias Guard | Does the answer show awareness of fairness and objective criteria? |
| **Structural Depth** | Detail | Does the answer move beyond generic corporate jargon into specific tactics? |

### Neutrality Guardrails
To ensure a level playing field, the AI Auditor follows strict instructions:
1.  **Grammar Neutrality**: No penalties for non-standard English or regional accents.
2.  **Logic over Linguistics**: A brief, logical answer outscores a long, flowery one that lacks substance.
3.  **Verbatim Persistence**: The system stores the exact `question_text` and `raw_answer` to allow for human audit of AI decisions.

### Final Score Calculation
1.  **Question Score**: Each response is graded 0-6.
2.  **Company Profile Score (CPS)**: `(Sum of Scores / (Questions * 6)) * 100`
3.  **Visualization**: Scores are mapped to a 0-100% "Recruiter DNA" signal displayed in the talent marketplace.

## Technical Architecture
- **Table**: `recruiter_assessment_questions` (Isolated from candidate data).
- **Selection**: `RecruiterService.get_assessment_questions()` picks 1 random question per category.
- **Cheating Prevention**: 2-strike tab-switch monitoring via `/recruiter/tab-switch`.

## Data Integrity & Initialization
To prevent database failures during high-concurrency recruiter logins, the system implements **Lazy Profile Initialization**:
- **Point of Entry**: The `/auth/post-login` handshake.
- **Verification**: The system checks if the `user_id` exists in the `users` table before attempting `recruiter_profiles` insertion.
- **Auto-Fix**: If a recruiter logs in without a profile record (e.g., due to an interrupted signup), the `RecruiterService` automatically creates the base records to ensure a seamless dashboard experience.
