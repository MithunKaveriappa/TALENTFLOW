"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useVoice } from "@/hooks/useVoice";
import { extractNameFromEmail } from "@/utils/emailValidation";
import { SKILLS_BY_EXPERIENCE } from "./skillsData";

type Message = {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
  options?: string[];
};

type OnboardingState =
  | "INITIAL"
  | "AWAITING_EXPERIENCE"
  | "AWAITING_RESUME"
  | "AWAITING_SKILLS"
  | "AWAITING_GPS_VISION"
  | "AWAITING_GPS_INTERESTS"
  | "AWAITING_GPS_GOAL"
  | "AWAITING_ID"
  | "AWAITING_TC"
  | "COMPLETED";

export default function CandidateOnboarding() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [state, setState] = useState<OnboardingState>("INITIAL");
  const [experienceBand, setExperienceBand] = useState<string>("fresher");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const userIdRef = useRef<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const { isListening, transcript, startListening, stopListening } = useVoice();

  const handleLogout = async () => {
    if (userIdRef.current) {
      localStorage.removeItem(`tf_onboarding_chat_${userIdRef.current}`);
    }
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const saveStep = async (step: OnboardingState) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await apiClient.post("/candidate/step", { step }, session.access_token);
      }
    } catch (err) {
      console.error("Failed to save onboarding step:", err);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const addMessage = (
    text: string,
    sender: "bot" | "user",
    options?: string[],
  ) => {
    setMessages((prev) => {
      const newMsgs = [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          text,
          sender,
          timestamp: new Date(),
          options,
        },
      ];
      // Store in localStorage for refresh persistence
      if (typeof window !== "undefined" && userIdRef.current) {
        localStorage.setItem(
          `tf_onboarding_chat_${userIdRef.current}`,
          JSON.stringify(newMsgs.slice(-20)),
        ); // Keep last 20
      }
      return newMsgs;
    });
  };

  useEffect(() => {
    async function init() {
      if (initialized.current) return;
      initialized.current = true;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      userIdRef.current = user.id;
      const name = extractNameFromEmail(user.email || "");

      // 1. Load chat history from localStorage if it exists
      const storageKey = `tf_onboarding_chat_${user.id}`;
      const savedChat = localStorage.getItem(storageKey);
      if (savedChat) {
        try {
          const parsed = JSON.parse(savedChat);
          // Convert string timestamps back to Date objects
          const hydrated = parsed.map((m: Message) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }));
          setMessages(hydrated);
        } catch {
          localStorage.removeItem(storageKey);
        }
      }

      // 2. Fetch profile to check progress
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const profile = await apiClient.get(
        "/candidate/profile",
        session?.access_token,
      );

      if (
        profile &&
        profile.onboarding_step &&
        profile.onboarding_step !== "INITIAL" &&
        profile.onboarding_step !== "COMPLETED"
      ) {
        const savedStep = profile.onboarding_step as OnboardingState;
        setExperienceBand(profile.experience || "fresher");
        setSelectedSkills(profile.skills || []);

        // Only add "Welcome back" if we don't have fresh history
        if (!savedChat) {
          addMessage(
            `Welcome back, ${name}! Let's pick up where we left off.`,
            "bot",
          );

          if (savedStep === "AWAITING_RESUME") {
            addMessage(
              "I'm still waiting for your resume upload. Please upload it (PDF only) when you're ready.",
              "bot",
            );
          } else if (savedStep === "AWAITING_SKILLS") {
            addMessage(
              "We were just finalizing your skills. Feel free to refine them below.",
              "bot",
            );
          } else if (
            savedStep === "AWAITING_GPS_VISION" ||
            savedStep === "AWAITING_GPS_INTERESTS" ||
            savedStep === "AWAITING_GPS_GOAL"
          ) {
            addMessage(
              "We were just talking about your career vision. What's your next big target?",
              "bot",
            );
          } else if (savedStep === "AWAITING_ID") {
            addMessage(
              "I just need to verify your identity. Please upload any government-issued ID (DL, Passport, or any ID proof).",
              "bot",
            );
          } else if (savedStep === "AWAITING_TC") {
            addMessage(
              "Almost done! Please review and accept our Terms and Conditions to complete your onboarding.",
              "bot",
              ["Accept Terms & Conditions"],
            );
          }
        }

        setState(savedStep);
      } else if (!savedChat) {
        // Only start fresh if no history
        addMessage(
          `Welcome, ${name}! I'm here to help you build your high-trust profile.`,
          "bot",
        );
        setTimeout(() => {
          addMessage(
            "First, tell me about your experience level in IT Tech Sales. Which band do you fall into?",
            "bot",
            [
              "Fresher (0–1 years)",
              "Mid-level (1–5 years)",
              "Senior (5–10 years)",
              "Leadership / Enterprise (10+ years)",
            ],
          );
          setState("AWAITING_EXPERIENCE");
        }, 1000);
      }
    }
    init();
  }, [router]);

  const handleSend = async (textOverride?: string) => {
    const workingInput = textOverride || input.trim();

    // Check for logout command
    if (
      workingInput.toLowerCase() === "logout" ||
      workingInput.toLowerCase() === "exit"
    ) {
      addMessage("Saving your progress and logging out...", "bot");
      setTimeout(handleLogout, 1500);
      return;
    }

    // In AWAITING_SKILLS, we can proceed even if input is empty if pills are selected
    if (!workingInput && state !== "AWAITING_SKILLS" && !isLoading) return;
    if (isLoading) return;

    if (workingInput) {
      addMessage(workingInput, "user");
    } else if (state === "AWAITING_SKILLS" && selectedSkills.length > 0) {
      addMessage(`Confirmed ${selectedSkills.length} skills`, "user");
    }

    setInput("");
    setIsLoading(true);

    try {
      if (state === "AWAITING_EXPERIENCE") {
        let band = "";
        const lower = workingInput.toLowerCase();
        if (lower.includes("fresher")) band = "fresher";
        else if (lower.includes("mid")) band = "mid";
        else if (lower.includes("senior")) band = "senior";
        else if (lower.includes("leadership") || lower.includes("enterprise"))
          band = "leadership";

        if (!band) {
          addMessage(
            "I didn't quite catch that. Please select one of the options below.",
            "bot",
            [
              "Fresher (0–1 years)",
              "Mid-level (1–5 years)",
              "Senior (5–10 years)",
              "Leadership / Enterprise (10+ years)",
            ],
          );
        } else {
          setExperienceBand(band);
          const {
            data: { session },
          } = await supabase.auth.getSession();
          await apiClient.post(
            "/candidate/experience",
            { experience: band },
            session?.access_token,
          );

          addMessage(
            `Selected ${band} level. This will determine your assessment difficulty.`,
            "bot",
          );

          const nextState = "AWAITING_RESUME";
          await saveStep(nextState);

          setTimeout(() => {
            addMessage(
              "Next, I'll need your resume to understand your background better. Please upload it (PDF only).",
              "bot",
            );
            setState(nextState);
          }, 1000);
        }
      } else if (state === "AWAITING_SKILLS") {
        const skillsFromInput = workingInput
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !selectedSkills.includes(s));

        const finalSkills = [...selectedSkills, ...skillsFromInput];

        if (finalSkills.length === 0) {
          addMessage("Please select or type at least one skill.", "bot");
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          await apiClient.post(
            "/candidate/skills",
            { skills: finalSkills },
            session?.access_token,
          );

          addMessage("Skills saved! Your profile is now enriched.", "bot");

          const nextState = "AWAITING_GPS_VISION";
          await saveStep(nextState);
          setState(nextState);

          setTimeout(() => {
            addMessage(
              "Before we finish, let's look at your future. What's your target role in IT Tech Sales (e.g. Enterprise AE)?",
              "bot",
              ["Skip Career Vision for Now"],
            );
          }, 1000);
        }
      } else if (state === "AWAITING_GPS_VISION") {
        if (workingInput.toLowerCase().includes("skip")) {
          addMessage(
            "No problem! You can set up your Career GPS anytime from your dashboard.",
            "bot",
          );
          const nextState = "AWAITING_ID";
          await saveStep(nextState);
          setState(nextState);
          setTimeout(() => {
            addMessage(
              "Now, for verification and security, please upload a scan or photo of your government-issued ID (DL, Passport, etc).",
              "bot",
            );
          }, 1000);
        } else {
          // Save target_role temporarily (or just proceed)
          // We'll update the profile at the end or per step.
          await supabase.auth.getSession();
          await supabase
            .from("candidate_profiles")
            .update({ target_role: workingInput })
            .eq("user_id", userIdRef.current);

          addMessage(`Got it! Target: ${workingInput}.`, "bot");
          const nextState = "AWAITING_GPS_INTERESTS";
          await saveStep(nextState);
          setState(nextState);
          setTimeout(() => {
            addMessage(
              "Which specific categories or tech verticals interest you most (e.g. SaaS, Cloud, CyberSecurity)?",
              "bot",
            );
          }, 1000);
        }
      } else if (state === "AWAITING_GPS_INTERESTS") {
        await supabase.auth.getSession();
        // Split comma-separated string into an array for the TEXT[] database column
        const interestsArray = workingInput
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean);
        await supabase
          .from("candidate_profiles")
          .update({ career_interests: interestsArray })
          .eq("user_id", userIdRef.current);

        addMessage(`Tech Interests recorded: ${workingInput}.`, "bot");
        const nextState = "AWAITING_GPS_GOAL";
        await saveStep(nextState);
        setState(nextState);
        setTimeout(() => {
          addMessage(
            "Finally, what's your ultimate career long-term goal?",
            "bot",
          );
        }, 1000);
      } else if (state === "AWAITING_GPS_GOAL") {
        await supabase.auth.getSession();
        await supabase
          .from("candidate_profiles")
          .update({ long_term_goal: workingInput })
          .eq("user_id", userIdRef.current);

        addMessage(
          "Career vision captured! We'll use this to build your personalized Career GPS.",
          "bot",
        );
        const nextState = "AWAITING_ID";
        await saveStep(nextState);
        setState(nextState);
        setTimeout(() => {
          addMessage(
            "Now, for verification and security, please upload a scan or photo of your government-issued ID (DL, Passport, etc).",
            "bot",
          );
        }, 1000);
      } else if (state === "AWAITING_ID") {
        // Add a message if someone tries to type during ID upload step
        addMessage(
          "Please upload your ID document using the upload button below.",
          "bot",
        );
      } else if (state === "AWAITING_TC") {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Call backend to mark TC accepted
        await apiClient.post("/candidate/accept-tc", {}, session?.access_token);

        addMessage("Terms accepted! Your onboarding is now complete.", "bot");

        const nextState = "COMPLETED";
        await saveStep(nextState);
        setState(nextState);

        setTimeout(() => {
          addMessage(
            "Welcome aboard! You are now eligible to apply for jobs. However, to get a 'Verified' badge and attract premium recruiters, you should take the assessment. Ready?",
            "bot",
            ["Start Assessment"],
          );
        }, 1500);
      } else if (state === "COMPLETED") {
        addMessage("Redirecting you to the assessment suite...", "bot");
        setTimeout(() => {
          router.replace("/assessment/candidate");
        }, 1500);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      addMessage(`Error: ${errorMsg}`, "bot");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isLoading) return;

    setIsLoading(true);
    addMessage(`Uploading ${file.name}...`, "user");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!user || !session) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const folder = state === "AWAITING_RESUME" ? "resumes" : "id-proofs";
      const filePath = `${folder}/${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(folder)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      if (state === "AWAITING_RESUME") {
        const res = await apiClient.post(
          "/candidate/resume",
          { resume_path: filePath },
          session.access_token,
        );

        if (res.parsed && res.data) {
          const skills: string[] = res.data.skills || [];
          setSelectedSkills(skills);
          addMessage(
            `Resume uploaded and scanned successfully! I've extracted your core work history.`,
            "bot",
          );
          if (skills.length > 0) {
            addMessage(`Extracted Skills: ${skills.join(", ")}`, "bot");
          }
        } else {
          addMessage(
            "Resume uploaded! However, I couldn't automatically scan it because the AI keys are not set up yet.",
            "bot",
          );
        }

        setTimeout(async () => {
          addMessage(
            "Are there any other top 3 tech sales skills (e.g., SaaS, Lead Gen, Negotiation) you'd like to add?",
            "bot",
          );
          const nextState = "AWAITING_SKILLS";
          await saveStep(nextState);
          setState(nextState);
        }, 1000);
      } else if (state === "AWAITING_ID") {
        await apiClient.post(
          "/candidate/verify-id",
          { id_path: filePath },
          session.access_token,
        );

        addMessage("ID document uploaded and received!", "bot");

        setTimeout(async () => {
          addMessage(
            "Last step: Please accept our Terms and Conditions to finalize your profile.",
            "bot",
            ["Accept Terms & Conditions"],
          );
          const nextState = "AWAITING_TC";
          await saveStep(nextState);
          setState(nextState);
        }, 1000);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Upload failed";
      addMessage(`Upload failed: ${errorMsg}`, "bot");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-indigo-600"
            aria-label="Back to home"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <div className="h-4 w-4 rounded-sm bg-white rotate-45" />
            </div>
            <span className="font-bold text-slate-900">
              TalentFlow Onboarding
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
            {msg.options && state !== "COMPLETED" && (
              <div className="mt-2 flex flex-wrap gap-2">
                {msg.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSend(opt)}
                    disabled={isLoading}
                    className="bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 text-xs py-2 px-4 rounded-full transition-all shadow-sm"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="text-xs text-slate-400 animate-pulse">
            Assistant is thinking...
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {state === "AWAITING_SKILLS" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-lg animate-in fade-in slide-in-from-bottom-4 z-10 max-h-[40vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-slate-50">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Select key skills for {experienceBand} level
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Pick from suggestions or add your own below
                  </span>
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || selectedSkills.length === 0}
                  className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 transition-colors shadow-sm"
                >
                  {isLoading ? "Saving..." : "CONFIRM SKILLS"}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {SKILLS_BY_EXPERIENCE[experienceBand]?.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedSkills.includes(skill)
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              {selectedSkills.filter(
                (s) => !SKILLS_BY_EXPERIENCE[experienceBand]?.includes(s),
              ).length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      Custom / Extracted Skills
                    </span>
                    <span className="text-[10px] text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                      {
                        selectedSkills.filter(
                          (s) =>
                            !SKILLS_BY_EXPERIENCE[experienceBand]?.includes(s),
                        ).length
                      }{" "}
                      Total
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills
                      .filter(
                        (s) =>
                          !SKILLS_BY_EXPERIENCE[experienceBand]?.includes(s),
                      )
                      .map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100 group"
                        >
                          {skill}
                          <button
                            onClick={() => toggleSkill(skill)}
                            className="text-emerald-300 hover:text-emerald-700 transition-colors"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2 / 5}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {(state === "AWAITING_RESUME" || state === "AWAITING_ID") && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept={state === "AWAITING_RESUME" ? ".pdf" : "image/*,.pdf"}
                onChange={handleFileUpload}
                disabled={isLoading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-sm font-medium">
                  {state === "AWAITING_RESUME"
                    ? "Click to upload Resume (PDF)"
                    : "Click to upload Govt ID Proof (Image/PDF)"}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                state === "AWAITING_RESUME" || state === "AWAITING_ID"
                  ? "Please use the upload box above"
                  : state === "AWAITING_SKILLS"
                    ? "Add custom skills (comma separated)..."
                    : "Type your response..."
              }
              disabled={
                isLoading ||
                state === "AWAITING_RESUME" ||
                state === "AWAITING_ID"
              }
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={state === "AWAITING_RESUME"}
              className={`p-3 rounded-xl ${isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 text-slate-600"} disabled:opacity-50`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m8 0h-8m4-29a3 3 0 013 3v10a3 3 0 01-3 3 3 3 0 01-3-3V7a3 3 0 013-3z"
                />
              </svg>
            </button>
            <button
              onClick={() => handleSend()}
              disabled={
                isLoading ||
                state === "AWAITING_RESUME" ||
                (!input.trim() && state !== "AWAITING_SKILLS") ||
                (state === "AWAITING_SKILLS" &&
                  !input.trim() &&
                  selectedSkills.length === 0)
              }
              className="p-3 bg-indigo-600 text-white rounded-xl disabled:bg-slate-300"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
