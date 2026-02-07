## 1. High-Level System Architecture

TalentFlow follows a **3-layer architecture**:

1. **Frontend (Client)**
2. **Backend (FastAPI – Business & Trust Layer)**
3. **Platform Services (Supabase)**

All **business rules, assessments, scoring, and security decisions live in FastAPI**.


## 2. Frontend Architecture (Client Layer)

### Technology

* **Next.js (App Router)**
* TypeScript
* Tailwind CSS
* Web Speech API (Mic input)
* Axios / Fetch

### Responsibilities

Frontend is a **thin client**.

It:

* Renders chat-based UI
* Captures voice → text
* Handles timers, mic, UI guards (copy-paste, tab switch detection)
* Calls backend APIs
* Displays scores, feedback, dashboards

It **does NOT**:

* Compute scores
* Decide next question
* Validate answers logically
* Enforce assessment rules
* Access database directly

### Trust Level

Untrusted
All frontend input is treated as **untrusted**.


## 3. Backend Architecture (FastAPI – Core of the System)

### Technology

* **FastAPI (Python)**
* Uvicorn (ASGI server)
* Pydantic (request/response validation)
* Background tasks (for resume parsing later)

### Role of FastAPI (Very Important)

FastAPI is the **brain and gatekeeper** of the platform.

It owns:

* Authentication orchestration (with Supabase Auth)
* Role enforcement (candidate / recruiter / admin)
* Profile gating logic
* Assessment session lifecycle
* Question selection
* Signal validation
* Scoring logic
* Anti-cheat enforcement decisions
* Dashboard unlock decisions

### How FastAPI Talks to Supabase

FastAPI uses:

* **Supabase Service Role Key**

This means:

* FastAPI bypasses RLS safely
* Frontend never touches DB directly
* All sensitive writes go through backend


## 4. Supabase Architecture (Platform Layer)

Supabase provides **three things only**:

### 4.1 Supabase Auth

* Email + OTP
* Password login
* JWT issuance

Supabase Auth handles:

* Identity
* Session tokens

FastAPI handles:

* Role binding
* Access control
* Business permissions


### 4.2 Supabase Database (Postgres + RLS)

* Structured relational schema
* RLS enabled for safety
* Backend bypass via service role

Stores:

* users
* candidate_profiles
* recruiter_profiles
* companies
* skills
* assessments
* scores
* signals

Does **not** store:

* raw assessment answers
* business logic


### 4.3 Supabase Storage

Used for **secure document storage**:

* Resumes
* Aadhaar files (Phase-1 upload only)

Rules:

* Files are private
* No public URLs
* Access only via backend
* Frontend uploads via signed request handled by backend


## 5. Authentication & Request Flow (Critical)

### Login Flow

1. User logs in via Supabase Auth
2. Supabase returns JWT
3. Frontend sends JWT to FastAPI
4. FastAPI:

   * Verifies token
   * Reads user role from `public.users`
   * Applies role-based logic

### API Trust Model

* Frontend → FastAPI → Supabase
* Frontend never calls Supabase DB directly
* FastAPI is the **single trusted gateway**

## 6. Assessment Engine Placement

### Lives entirely in FastAPI

FastAPI:

* Creates assessment sessions
* Selects questions
* Validates responses
* Generates signals
* Computes scores
* Writes final results

Supabase:

* Stores assessment state & results

Frontend:

* Only displays questions
* Sends signals
* Shows results

## 7. Matching Engine Placement

### Phase-1 (Deterministic)

* Implemented inside FastAPI
* Uses:

  * profile scores
  * skills overlap
  * experience match
  * company score

No ML. No embeddings.

## 8. Admin Architecture

* Admin login already exists
* Admin APIs:

  * Live inside FastAPI
  * Use service role
* Admin bypasses:

  * RLS
  * gating rules
* Admin is **not part of marketplace flows**

## 9. Why This Architecture Is Correct

### Scalability

* Stateless FastAPI
* Horizontal scaling
* DB handles consistency

### Security

* Zero trust frontend
* RLS + service role
* No raw sensitive text stored

### Maintainability

* Python for business logic
* Clear separation of concerns
* Easy to evolve ML later

### Future Proof

* Flutter frontend compatible
* ML services can be added later
* Supabase can remain backend-of-record

## 10. Final Stack Summary (Corrected)

| Layer       | Technology                          |
| ----------- | ----------------------------------- |
| Frontend    | Next.js + Tailwind + Web Speech API |
| Backend     | **FastAPI (Python)**                |
| Auth        | Supabase Auth                       |
| Database    | Supabase Postgres (RLS)             |
| Storage     | Supabase Storage                    |
| Admin       | FastAPI + Service Role              |
| ML (Future) | Separate Python services            |


## ✅ Correction Summary (Important)

* ❌ Node.js backend → **NOT USED**
* ✅ **FastAPI backend → SOURCE OF TRUTH**
* Supabase is a **platform service**, not business logic
* All rules live in FastAPI