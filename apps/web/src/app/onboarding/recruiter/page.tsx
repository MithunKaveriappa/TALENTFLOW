"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useVoice } from "@/hooks/useVoice";
import { extractNameFromEmail } from "@/utils/emailValidation";

type Message = {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
  options?: string[];
};

type OnboardingState =
  | "INITIAL"
  | "REGISTRATION"
  | "DETAILS"
  | "ASSESSMENT_PROMPT"
  | "ASSESSMENT_CHAT"
  | "COMPLETED";

const ASSESSMENT_QUESTIONS = [
  {
    text: "What specific business challenge is this role intended to solve, and what does success look like for this position after six months?",
    category: "Hiring Intent & Role Clarity",
  },
  {
    text: "Beyond technical skills, what are the three non-obvious traits that characterize your most successful team members in this department?",
    category: "Ideal Candidate Profile (ICP) Understanding",
  },
  {
    text: "How do you ensure a fair and consistent experience for all candidates, and how do you handle internal disagreements regarding a candidate's fit?",
    category: "Ethics & Fair Hiring Practices",
  },
  {
    text: "What is one unique aspect of your culture or growth path that isn't in the job description, and why should a top candidate choose you over a competitor?",
    category: "Candidate Value Proposition",
  },
  {
    text: "Who are the key decision-makers in your hiring process, and what is your target timeline for providing final feedback to candidates?",
    category: "Decision-Making & Ownership",
  },
];

export default function RecruiterOnboarding() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [state, setState] = useState<OnboardingState>("INITIAL");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyDetails, setCompanyDetails] = useState({
    name: "",
    website: "",
    location: "",
    description: "",
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isAssessmentActive, setIsAssessmentActive] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [warningCount, setWarningCount] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const initialized = useRef(false);

  const { isListening, transcript, startListening, stopListening } = useVoice();

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Sync voice transcript
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Security: Tab switch monitoring
  useEffect(() => {
    if (!isAssessmentActive) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden") {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) return;

          const res = await apiClient.post(
            "/recruiter/tab-switch",
            {},
            session.access_token,
          );

          if (res.status === "blocked") {
            window.location.href = "/login?error=blocked";
          } else {
            addMessage(res.message, "bot");
            setWarningCount((prev) => prev + 1);
          }
        } catch (err) {
          console.error("Failed to report tab switch:", err);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isAssessmentActive]);

  // Timer logic for assessment
  useEffect(() => {
    if (isAssessmentActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isAssessmentActive) {
      // Auto-timeout handling
      handleSend("No response provided (timeout)");
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAssessmentActive, timeLeft]);

  const addMessage = (
    text: string,
    sender: "bot" | "user",
    options?: string[],
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        text,
        sender,
        timestamp: new Date(),
        options,
      },
    ]);
  };

  useEffect(() => {
    async function init() {
      if (initialized.current) return;
      initialized.current = true;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const name = extractNameFromEmail(user.email || "");

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const profile = await apiClient.get(
        "/recruiter/profile",
        session?.access_token,
      );

      if (profile) {
        setCompanyId(profile.company_id);
        if (profile.companies) {
          setCompanyDetails({
            name: profile.companies.name || "",
            website: profile.companies.website || "",
            location: profile.companies.location || "",
            description: profile.companies.description || "",
          });
        }

        const currentStep = profile.onboarding_step as OnboardingState;
        setState(currentStep);

        if (currentStep === "REGISTRATION" || currentStep === "INITIAL") {
          addMessage(
            `Welcome, ${name}! Let's set up your company profile.`,
            "bot",
          );
          addMessage(
            "First, please enter your Company Registration Number (CIN or GSTIN).",
            "bot",
          );
          setState("REGISTRATION");
        } else if (currentStep === "DETAILS") {
          addMessage(
            "Let's complete the basic details for your company.",
            "bot",
          );
          promptNextDetail(profile.companies || {});
        } else if (currentStep === "ASSESSMENT_PROMPT") {
          showAssessmentPrompt();
        } else if (currentStep === "COMPLETED") {
          router.push("/dashboard/recruiter");
        }
      }
    }
    init();
  }, []);

  const promptNextDetail = (details: any) => {
    if (!details.name || details.name === "Pending Verification") {
      addMessage("What is the full legal name of your company?", "bot");
    } else if (!details.website) {
      addMessage("What is your company's website URL?", "bot");
    } else if (!details.location) {
      addMessage("Where is your company headquartered?", "bot");
    } else if (!details.description) {
      addMessage("Please provide a short description of your company.", "bot");
    }
  };

  const showAssessmentPrompt = () => {
    addMessage(
      "Your company profile is set! Now, as part of onboarding, we require a short Recruiter Assessment.",
      "bot",
    );
    addMessage(
      "This helps us generate your Company Profile Score, which impacts candidate matching and trust signals.",
      "bot",
    );
    addMessage(
      "Rules: 5 questions, 60s per question, no retakes, one continuous attempt. Copy-paste and tab-switching are strictly monitored.",
      "bot",
      ["Start Assessment", "Do It Later"],
    );
  };

  const startAssessment = () => {
    setIsAssessmentActive(true);
    setState("ASSESSMENT_CHAT");
    setCurrentQuestionIndex(0);
    setTimeLeft(60);
    addMessage(ASSESSMENT_QUESTIONS[0].text, "bot");
  };

  const handleSend = async (textOverride?: string) => {
    const val = textOverride || input.trim();
    if (!val && !isLoading) return;
    if (isLoading) return;

    addMessage(val, "user");
    setInput("");
    setIsLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (state === "REGISTRATION") {
        // Regex for GSTIN or CIN
        const gstinRegex =
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        const cinRegex =
          /^([LUu]{1})([0-9]{5})([A-Za-z]{2})([0-9]{4})([A-Za-z]{3})([0-9]{6})$/;

        if (!gstinRegex.test(val) && !cinRegex.test(val)) {
          addMessage(
            "Invalid format. Please enter a valid CIN or GSTIN.",
            "bot",
          );
        } else {
          const res = await apiClient.post(
            "/recruiter/registration",
            { registration_number: val },
            token,
          );
          setCompanyId(res.company_id);
          setState("DETAILS");
          addMessage("Registration confirmed.", "bot");
          addMessage("What is the full legal name of your company?", "bot");
        }
      } else if (state === "DETAILS") {
        const nextDetails = { ...companyDetails };
        if (!nextDetails.name) nextDetails.name = val;
        else if (!nextDetails.website) nextDetails.website = val;
        else if (!nextDetails.location) nextDetails.location = val;
        else if (!nextDetails.description) nextDetails.description = val;

        setCompanyDetails(nextDetails);

        if (
          nextDetails.name &&
          nextDetails.website &&
          nextDetails.location &&
          nextDetails.description
        ) {
          await apiClient.post(
            "/recruiter/details",
            { company_id: companyId, ...nextDetails },
            token,
          );
          setState("ASSESSMENT_PROMPT");
          showAssessmentPrompt();
        } else {
          promptNextDetail(nextDetails);
        }
      } else if (state === "ASSESSMENT_PROMPT") {
        if (val === "Start Assessment") {
          startAssessment();
        } else if (val === "Do It Later") {
          await apiClient.post("/recruiter/skip-assessment", {}, token);
          addMessage(
            "No problem! You can complete it later. Note that your dashboard features will remain locked until then.",
            "bot",
          );
          setTimeout(() => router.push("/dashboard/recruiter"), 2000);
        }
      } else if (state === "ASSESSMENT_CHAT") {
        const currentQ = ASSESSMENT_QUESTIONS[currentQuestionIndex];
        await apiClient.post(
          "/recruiter/submit-answer",
          {
            question_text: currentQ.text,
            answer: val,
            category: currentQ.category,
          },
          token,
        );

        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < ASSESSMENT_QUESTIONS.length) {
          setCurrentQuestionIndex(nextIndex);
          setTimeLeft(60);
          addMessage(ASSESSMENT_QUESTIONS[nextIndex].text, "bot");
        } else {
          setIsAssessmentActive(false);
          await apiClient.post("/recruiter/complete-assessment", {}, token);
          addMessage(
            "Assessment complete! Onboarding is finished. Unlocking your dashboard...",
            "bot",
          );
          setTimeout(() => router.push("/dashboard/recruiter"), 2000);
        }
      }
    } catch (err) {
      console.error(err);
      addMessage("Something went wrong. Please try again.", "bot");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white p-4 max-w-2xl mx-auto border-x border-zinc-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold tracking-tighter text-blue-500 italic">
          TALENTFLOW
        </h1>
        {isAssessmentActive && (
          <div
            className={`px-4 py-1 rounded-full text-sm font-mono ${timeLeft < 15 ? "bg-red-900 animate-pulse" : "bg-zinc-800"}`}
          >
            00:{timeLeft.toString().padStart(2, "0")}
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide pb-10"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender === "bot" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl ${m.sender === "bot" ? "bg-zinc-900 border border-zinc-800" : "bg-blue-600 text-white"}`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {m.text}
              </p>
              {m.options && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {m.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleSend(opt)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs transition-all active:scale-95"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
              <div className="flex space-x-2">
                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative group">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder={isListening ? "Listening..." : "Type your response..."}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            autoComplete="off"
            onCopy={(e) => isAssessmentActive && e.preventDefault()}
            onPaste={(e) => isAssessmentActive && e.preventDefault()}
          />
          <button
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
            className={`p-3 rounded-xl border transition-all ${isListening ? "bg-red-600 border-red-500 scale-95" : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"}`}
          >
            <MicIcon />
          </button>
          <button
            onClick={() => handleSend()}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors disabled:opacity-50"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" x2="11" y1="2" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
