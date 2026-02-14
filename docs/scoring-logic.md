# Scoring Logic

The Profile Score (0-100) is the cornerstone of the TalentFlow platform, determining user visibility, ranking, and trust levels.

## 1. Dimensional Scoring (The 0-6 Scale)

Every response in the assessment is evaluated by the AI Grader across four qualitative dimensions. Each dimension is scored from **0 to 6**:

- **0-1 (Poor)**: Irrelevant, generic, or extremely brief.
- **2-3 (Average)**: Answers the question but lacks depth or clarity.
- **4-5 (Good)**: Specific, clear, and demonstrates ownership or expertise.
- **6 (Exceptional)**: Outstanding detail, structured thought, and high impact.

### Evaluation Dimensions:

1.  **Relevance**: How well the answer aligns with the specific prompt.
2.  **Specificity**: Inclusion of concrete examples or technical details.
3.  **Clarity**: Effectiveness of communication and structure.
4.  **Ownership**: Demonstrated accountability, initiative, or mastery.

## 2. Recruiter Profile Score

The Recruiter score represents the **Company Quality Score**.

### Calculation:

1.  Sum of all dimension scores for the 5 categories (Max possible = $5 \times 4 \times 6 = 120$).
2.  Average per response is calculated: $S_{avg} = \frac{\sum Dimensions}{4}$.
3.  Final Score: $Score = (\frac{\sum S_{avg}}{5 \times 6}) \times 100$.

_Example_: If a recruiter averages 4.5 across all dimensions for 5 questions, their score is $(4.5 / 6) \times 100 = 75$.

## 3. Candidate Profile Score

The Candidate score is a weighted composite of different assessment components.

### Components:

- **Resume Score**: Calculated during initial parsing (Experience, Skills, Formatting).
- **Behavioral**: Derived from predefined soft-skill questions (Resilience, Emotional Stability).
- **Skill-Based**: Technical depth questions generated on-the-fly.
- **Resume-Deep-Dive**: Verification of claims made in the uploaded CV.

### Weighted Distribution (The Feb 2026 Model)

Questions are pulled dynamically based on the candidate's seniority level to ensure the evaluation is relevant. The total question count (Budget) scales with seniority.

| Category                  | Fresher (8 Qs) | Mid (10 Qs) | Senior (13 Qs) | Leadership (16 Qs) |
| :------------------------ | :------------- | :---------- | :------------- | :----------------- |
| **Resume AI Deep Dive**   | 20%            | 20%         | 20%            | 25%                |
| **Case Study (Skills)**   | 10%            | 20%         | 30%            | 35%                |
| **Behavioral (Seeded)**   | 35%            | 30%         | 25%            | 20%                |
| **Psychometric (Seeded)** | 35%            | 30%         | 25%            | 20%                |

- **Resume AI**: Dynamically generated based on parsed CV data (Gaps, achievements, history).
- **Case Study**: Technical scenario questions based on self-reported skills.
- **Seeded**: High-validity psychometric and behavioral drivers from our curated bank.

## 4. The Verified Trust Matrix (Recruiter View)

To protect candidate raw data while providing actionable trust signals, recruiters view a consolidated **Trust Score** instead of individual assessment metrics.

### Calculation:

$$Trust Score = (Psychometric Score \times 0.6) + (Behavioral Score \times 0.4)$$

- **Masking**: Raw `psychometric_score` and `behavioral_score` are deleted from the API payload before being sent to the recruiter frontend.
- **Sorting**: The Candidate Pool is automatically sorted by this Trust Score to prioritize the most reliable talent.

## 5. Persistence & Improvement (The MAX Logic)

To ensure users are never penalized for trying to improve, the system follows a strict "Keep the Best" policy:

- **Candidate Retakes**: A candidate can retake an assessment via Profile Settings. The new score only replaces the existing one if it is higher: $final\_score = MAX(new\_score, existing\_score)$.
- **Recruiter Improvements**: Multiple recruiters for the same company can attempt the assessment. The public **Company Profile Score (CPS)** only updates if a new attempt yields a better result than the current score.

## 6. Normalization and Immutability

- **Normalization**: All raw scores are mapped to the 0-100 range for display.
- **Finalization**: Once a session is marked `completed`, the session and individual responses are locked for auditing.
- **Locking**: A score below 40 may trigger a "Low Trust" flag, limiting certain platform features.
