-- ---------- APPLICATION STATUS HISTORY ----------

CREATE TABLE IF NOT EXISTS job_application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  old_status application_status,
  new_status application_status NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fast lookup of a candidate's journey
CREATE INDEX IF NOT EXISTS idx_status_history_app_id ON job_application_status_history(application_id);

-- ---------- STATUS TRANSITION GUARDRAIL FUNCTION ----------

CREATE OR REPLACE FUNCTION validate_application_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- If status hasn't changed, just update updated_at
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- GUARDRAILS: Define strict allowed transitions
  -- Allowed transitions:
  -- 'recommended'        -> 'invited' | 'rejected'
  -- 'invited'            -> 'applied' | 'rejected'
  -- 'applied'            -> 'shortlisted' | 'rejected'
  -- 'shortlisted'        -> 'interview_scheduled' | 'rejected'
  -- 'interview_scheduled' -> 'offered' | 'rejected' | 'closed'
  -- 'offered'            -> 'closed' | 'rejected'
  
  -- Exceptions: Always allow transition to 'rejected' from any non-final state
  IF NEW.status = 'rejected' AND OLD.status NOT IN ('closed') THEN
    RETURN NEW;
  END IF;

  -- Transition Logic
  CASE OLD.status
    WHEN 'recommended' THEN
      IF NEW.status NOT IN ('invited') THEN
        RAISE EXCEPTION 'Invalid transition: Recommended candidates must be Invited first.';
      END IF;
    WHEN 'invited' THEN
      IF NEW.status NOT IN ('applied') THEN
        RAISE EXCEPTION 'Invalid transition: Invited candidates must Apply to proceed.';
      END IF;
    WHEN 'applied' THEN
      IF NEW.status NOT IN ('shortlisted') THEN
        RAISE EXCEPTION 'Invalid transition: Applied candidates must be Shortlisted before interviews.';
      END IF;
    WHEN 'shortlisted' THEN
      IF NEW.status NOT IN ('interview_scheduled') THEN
        RAISE EXCEPTION 'Invalid transition: Shortlisted candidates must have an Interview Scheduled.';
      END IF;
    WHEN 'interview_scheduled' THEN
      IF NEW.status NOT IN ('offered', 'closed') THEN
        RAISE EXCEPTION 'Invalid transition: Interviews must lead to an Offer or be Closed.';
      END IF;
    WHEN 'offered' THEN
      IF NEW.status NOT IN ('closed') THEN
        RAISE EXCEPTION 'Invalid transition: Offers can only move to Closed (Hired).';
      END IF;
    WHEN 'rejected' THEN
      RAISE EXCEPTION 'Invalid transition: Cannot move a candidate out of Rejected status.';
    WHEN 'closed' THEN
      RAISE EXCEPTION 'Invalid transition: Cannot move a candidate out of Closed (Hired) status.';
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce guardrails on update
CREATE OR REPLACE TRIGGER trg_validate_application_status
BEFORE UPDATE ON job_applications
FOR EACH ROW
EXECUTE FUNCTION validate_application_status_transition();

-- Trigger to automatically log history on changes
CREATE OR REPLACE FUNCTION log_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO job_application_status_history (application_id, new_status, changed_by, reason)
    VALUES (NEW.id, NEW.status, auth.uid(), 'Initial application creation');
  ELSIF (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO job_application_status_history (application_id, old_status, new_status, changed_by, reason)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), NEW.feedback);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_log_application_status
AFTER INSERT OR UPDATE ON job_applications
FOR EACH ROW
EXECUTE FUNCTION log_application_status_change();
