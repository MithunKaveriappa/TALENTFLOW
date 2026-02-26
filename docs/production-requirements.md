# TalentFlow Production Deployment & Infrastructure Requirements

This document outlines the critical requirements and architectural changes needed to transition the TalentFlow platform from Development (Local) to a Production (Live) environment.

---

## 1. Meeting Infrastructure (Jitsi Integration)
The current integration uses the public `meet.jit.si` server. For production stability and branding, the following is required:

### Problem (Current State):
*   **Moderator Lock:** Rooms cannot be accessed by guests (candidates) until a Moderator (recruiter) logs in manually with a Jitsi/Social account.
*   **Privacy:** Anyone who guesses the meeting ID can technically join the call.

### Production Solution Options:
1.  **Jitsi-as-a-Service (JaaS by 8x8):**
    *   **Requirement:** API Key and Application ID from 8x8.
    *   **Implementation:** Backend must generate a JWT signed with a private key (RS256) to automatically grant Moderator status to the recruiter and Guest status to the candidate.
    *   **Benefit:** Zero-login join for both parties and fully branded interface.
2.  **Self-Hosted Jitsi Meet Stack:**
    *   **Requirement:** Dedicated Linux server (AWS/GCP/DigitalOcean) with Prosody, Jicofo, and JVB installed.
    *   **Requirement:** SSL certificates (Let's Encrypt).
    *   **Requirement:** Prosody configured with `token_verification`.

---

## 2. Environment Secrets Management
Local `.env` files must be migrated to a secure Secrets Manager (e.g., Supabase Secrets, AWS Secrets Manager, or Vercel Environment Variables).

### Required Production Keys:
| Variable Name | Description | Source |
| :--- | :--- | :--- |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key for backend bypass (CRITICAL: Do NOT expose to client) | Supabase Dashboard |
| `OPENROUTER_API_KEY` | Production API key with credits for GPT-4o-mini/Llama-3 fallback | OpenRouter |
| `GOOGLE_API_KEY` | Production key for Gemini 1.5 Pro | Google AI Studio |
| `JITSI_APP_ID` / `JITSI_PRIVATE_KEY` | For JWT generation (if using JaaS) | 8x8 Dashboard |
| `AUTH_DOMAIN` | Production domain name for secure cookie scoping | Hosting Provider |

---

## 3. Database Management & Migrations
The current system uses raw `.sql` scripts in `infra/scripts/`.

### Requirements:
1.  **Migration Tooling:** Implementation of **Alembic** (Python) or **Supabase CLI Migrations** to track schema changes.
2.  **Backup Strategy:** Automated daily/hourly PITR (Point-In-Time Recovery) backups via Supabase.
3.  **RLS Confirmation:** Stress-test Row Level Security policies (see `docs/rls-policies.md`) against unauthorized `user_id` impersonation via API calls.

---

## 4. API Resilience & Rate Limiting
Production traffic requires guardrails to prevent AI cost overruns and system abuse.

### Requirements:
1.  **Global Rate Limiting:** Implement `FastAPI-Limiter` (using Redis) to prevent brute-force attacks on sensitive endpoints (e.g., `/auth/*`, `/candidate/apply`).
2.  **AI Budgeting:** Token-count monitoring in `RecruiterService` to prevent single-user exhaustion of GEMINI/OpenRouter quotas.
3.  **Error Tracking:** Integration of **Sentry** or **LogRocket** in both FastAPI (`apps/api`) and Next.js (`apps/web`) to track runtime exceptions and 429 errors.

---

## 5. Security & Authentication
1.  **SSL/TLS:** All traffic must be enforced via HTTPS.
2.  **Secure Cookies:** `access_token` and `refresh_token` must use `HttpOnly`, `Secure`, and `SameSite=Lax` flags.
3.  **CORS Policy:** Strict whitelist for the production frontend domain (e.g., `https://talentflow.ai`) and blocking all others.
4.  **Identity Verification:** Move from mock verification to a real provider (e.g., Stripe Identity or Persona) for the candidate verification step.

---

## 6. Hosting & Scalability
1.  **Backend (FastAPI):** Deploy via Docker containers (ECS/Fly.io/DigitalOcean App Platform) for easy scaling.
2.  **Frontend (Next.js):** Deploy via **Vercel** for CDN-edge delivery and optimal performance.
3.  **File Storage:** `supabase.storage` buckets (Resumes/Profile Photos) must be set to `private` with Signed URLs used for access (1-hour TTL).

---

## 7. Compliance & Legal
1.  **GDPR/CCPA:** Ensure candidate data deletion logic is implemented (Right to be Forgotten).
2.  **Terms of Service:** Production-ready Legal Terms and Privacy Policy must be reviewed and hosted on the platform.
