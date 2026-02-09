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

### Experience-Band Weighting:

Weights adjust based on the candidate's level:

| Component   | Fresher | Mid-Level | Senior | Leadership |
| :---------- | :------ | :-------- | :----- | :--------- |
| Resume      | 20%     | 25%       | 30%    | 25%        |
| Behavioral  | 40%     | 30%       | 20%    | 25%        |
| Skill-Based | 30%     | 35%       | 30%    | 20%        |
| Core Values | 10%     | 10%       | 20%    | 30%        |

## 4. Normalization and Immutability

- **Normalization**: All raw scores are mapped to the 0-100 range for display.
- **Immutable**: Once a session is marked `completed`, the score is finalized.
- **Locking**: A score below 40 may trigger a "Low Trust" flag, limiting certain platform features.

* Weightages depend on experience band
* Resume score currently assumed full, later dynamic
* Scores are immutable after assessment completion
