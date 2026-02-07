## Purpose

This document defines **how assessments work internally** for both **Candidates** and **Recruiters**.
The assessment engine is the **core trust mechanism** of the platform and directly affects:

* profile score
* visibility
* recommendations
* dashboard access

The engine is **deterministic**, **explainable**, **real-time**, and **privacy-safe**.

## 1. Core Principles

1. **One-time assessment**

   * No retake in Phase-1
2. **Signal-based evaluation**

   * No raw answer storage
3. **Chat + mic driven**
4. **Strict anti-cheat**
5. **FastAPI is the source of truth**

## 2. Assessment Types

### Candidate Assessment

* Purpose: generate **candidate profile score**
* Question count depends on experience band
* Skip allowed (with penalties)

### Recruiter Assessment

* Purpose: generate **company profile score**
* Exactly **5 questions**
* No skip allowed

## 3. Assessment Lifecycle

### Step 1: Awareness (Mandatory)

Before starting, user is informed about:

* one-time nature
* no copy-paste
* no tab switching
* score impact
* dashboard lock

User can:

* start now
* take later (but cannot access dashboard)

### Step 2: Session Creation

* FastAPI creates `assessment_sessions`
* status = `in_progress`
* Only one session allowed per user per type

### Step 3: Question Loop (Real-Time)

For each question:

1. FastAPI selects the next question based on:

   * experience band
   * remaining category quota
   * resume relevance
   * difficulty progression
2. Frontend displays question via chat
3. Mic input captured → text
4. Frontend sends **signals only** to backend

## 4. Question Composition

### Candidate Questions (Mixed)

* Resume-based (AI-generated, conditional)
* Behavioral
* Psychometric
* Skills (based on extracted + manual skills)
* Reference & cultural fit (minimal for freshers)

### Recruiter Questions

Five fixed dimensions:

1. Hiring intent
2. Ethics & fairness
3. Role clarity
4. Candidate value proposition
5. Fit definition

## 5. Real-Time Answer Validation (No ML)

FastAPI validates **structure only**, not meaning.

Checks:

* Was an answer given?
* Minimum word count met?
* Keywords present?
* On-topic?
* Logical flow?

Each check is **boolean / numeric**, not subjective.

## 6. Signal Capture (ML-Ready, Safe)

Stored per question attempt:

* answered / skipped
* word count bucket
* keyword match count
* action verb count
* on-topic flag
* logical flow flag
* response time bucket
* confidence signal (0–1)

No free text stored.

## 7. Anti-Cheat Rules

* Copy-paste disabled
* Tab switch detection:

  * 1st → warning
  * 2nd → permanent block
* Session marked abandoned if violated
* Block enforced at user level

## 8. Scoring Logic (Summary)

### Per Question

* Base score: 0–4
* Difficulty multiplier:

  * low ×1.0
  * medium ×1.2
  * high ×1.5
* Driver score capped at 6

### Per Component

* Average driver scores
* Normalize to 0–100

### Final Score

* Experience-weighted aggregation
* Stored immutably


## 9. Assessment Completion

On completion:

* Scores written to DB
* `assessment_completed = true`
* Candidate must upload Aadhaar (Phase-1)
* Recruiter dashboard unlocks immediately