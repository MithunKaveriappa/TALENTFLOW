# Assessment Rules & Security Policies

To ensure the integrity and authenticity of the platform, the following strict rules are enforced for all users (Candidates and Recruiters).

## 1. Zero-Strike/Two-Strike Policies

- **Tab Switching (Anti-Cheat)**:
  - The platform tracks `visibilitychange` events.
  - **1st Switch**: A warning is displayed.
  - **2nd Switch**: Immediate session termination. The user is added to the `blocked_users` table and permanently banned from the platform.
- **Copy-Paste**: Prohibited during the assessment. Standard browser shortcuts and context menus are disabled.

## 2. Session Integrity

- **One-Time Only**: Assessments cannot be retaken in Phase-1. All results are permanent.
- **Continuous Session**: Closing the browser or refreshing during an assessment may lead to session invalidation or a "Started but not completed" status, affecting high-trust scores.
- **Time Boxing**: Each question must be answered within **60 seconds**. Failure to answer within the time limit results in a zero-score for that specific response.

## 3. Input Quality

- **Meaningful Responses**: Brief, one-word, or nonsensical answers are flagged by the AI Grader and results in a 0.0 score across all dimensions.
- **Authenticity**: The system is optimized for voice input (Web Speech API) to encourage natural, unscripted responses.

## 4. Consequences of Violation

- **Permanent Ban**: Users in the `blocked_users` table will see a "Your account has been permanently blocked" message upon login.
- **Score Penalty**: Frequent timeouts or low-quality signals will result in a Profile Score below 40, which locks access to premium features and recruiter dashboards.

* Answers are not stored, only scores and confidence
* Assessment impacts profile score permanently
