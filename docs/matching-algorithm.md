## Purpose

Defines **how candidates and recruiters are matched** in Phase-1.

This is **not ML-based**.
It is deterministic, explainable, and score-aware.

## 1. Matching Philosophy

Matching is based on **mutual fit**, not just keywords.

The system answers:

* “Is this candidate suitable for this role?”
* “Is this company suitable for this candidate?”

## 2. Inputs Used for Matching

### Candidate Inputs

* Experience band
* Consolidated skills (resume + manual)
* **Verified Trust Score** (60/40 Psychometric vs Behavioral)
* Location (optional)

### Job / Company Inputs

* Required skills
* Experience level
* **Company Profile Score** (Recruiter reliability)
* Role type


## 3. Hard Filters (Mandatory)

Matching fails immediately if:

* Experience band mismatch
* Zero skill overlap
* **Trust Threshold**: Candidates with extreme low-trust signals are de-ranked.

Hard filters prevent irrelevant noise.


## 4. Soft Scoring Components

### 1. Skill Match Score

* % overlap between candidate skills and job skills

### 2. Experience Alignment

* Exact match preferred
* Adjacent bands allowed with penalty

### 3. Score Compatibility

* Candidate score vs company score
* Large gaps reduce match confidence

### 4. Contextual Factors (Optional)

* Location
* Role seniority

## 5. Final Match Score

Final score is a weighted combination of:

* skill match
* experience alignment
* score compatibility

This produces a **0–100 match score**.


## 6. Output Usage

### For Candidates

* Recommended jobs
* Ranked by match score

### For Recruiters

* Recommended candidates
* Ranked by fit and trust alignment


## 7. Transparency & Explainability

The platform can explain:

* “Why this job was recommended”
* “Why this candidate fits”

No black boxes.


## 8. Phase-1 Limitations (Intentional)

* No ML
* No embeddings
* No historical performance feedback loop
* No behavioral prediction

These are added later **without changing this base**.


## 9. Why This Matching Works Long-Term

* Simple
* Debbugable
* Bias-controlled
* Easy to improve
* Compatible with ML later