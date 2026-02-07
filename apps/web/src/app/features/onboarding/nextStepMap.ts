// Backend decides next_step
// Frontend maps it to chat flows

export const nextStepMap: Record<string, string> = {
  experience_selection: "experience_select",
  resume_upload: "resume_upload",
  skill_entry: "skill_entry",
  assessment_awareness: "assessment_intro",
  aadhaar_upload: "aadhaar_upload",
  terms_acceptance: "terms",
  dashboard: "dashboard",
};
