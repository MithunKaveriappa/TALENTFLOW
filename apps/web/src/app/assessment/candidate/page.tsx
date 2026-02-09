"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";

type Question = {
  id?: string;
  text: string;
  category: string;
  driver: string;
  difficulty: string;
  keywords?: string[];
  action_verbs?: string[];
  connectors?: string[];
  status?: string;
};

type AssessmentSession = {
  candidate_id: string;
  current_step: number;
  total_budget: number;
  status: string;
  experience_band: string;
  warning_count?: number;
};

export default function AssessmentExam() {
  const router = useRouter();
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden" && !showAadhaar && !isBlocked) {
        try {
          const {
            data: { session: authSession },
          } = await supabase.auth.getSession();
          if (!authSession) return;

          const res = await apiClient.post(
            "/assessment/tab-switch",
            {},
            authSession.access_token,
          );
          if (res.status === "blocked") {
            setIsBlocked(true);
          } else if (res.status === "warning") {
            setWarning(
              "FINAL WARNING: Tab switching is strictly prohibited. The next switch will permanently block your account.",
            );
          }
        } catch (err) {
          console.error("Tab switch detection error:", err);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [showAadhaar, isBlocked]);

  // Load Session & First Question
  useEffect(() => {
    async function init() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();

        if (!user || !authSession) {
          router.push("/login");
          return;
        }

        // Check if already blocked (middleware-like check)
        const { data: blocked } = await supabase
          .from("blocked_users")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        if (blocked) {
          setIsBlocked(true);
          setIsLoading(false);
          return;
        }

        const startRes = await apiClient.post(
          "/assessment/start",
          {},
          authSession.access_token,
        );
        if (startRes.status === "completed") {
          setShowAadhaar(true);
          setIsLoading(false);
          return;
        }
        setSession(startRes);

        const qRes = await apiClient.get(
          "/assessment/next",
          authSession.access_token,
        );
        if (qRes.status === "completed") {
          setShowAadhaar(true);
        } else {
          setCurrentQuestion(qRes);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleNext = useCallback(
    async (isTimeout = false) => {
      if (isLoading || isFinishing) return;
      setIsLoading(true);

      try {
        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();
        if (!authSession) return;

        // Submit answer
        await apiClient.post(
          "/assessment/submit",
          {
            question_id: currentQuestion?.id,
            category: currentQuestion?.category,
            answer: isTimeout ? "" : answer,
            difficulty: currentQuestion?.difficulty,
            metadata: currentQuestion,
          },
          authSession.access_token,
        );

        // Get next
        const nextQ = await apiClient.get(
          "/assessment/next",
          authSession.access_token,
        );

        if (nextQ.status === "completed") {
          setShowAadhaar(true);
        } else {
          setCurrentQuestion(nextQ);
          setAnswer("");
          setTimeLeft(60);
          // Refresh session state for progress bar
          const startRes = await apiClient.post(
            "/assessment/start",
            {},
            authSession.access_token,
          );
          setSession(startRes);
        }
      } catch (err) {
        console.error("Submission error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, isFinishing, currentQuestion, answer],
  );

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      handleNext(true); // Auto-jump on timeout
      return;
    }
    if (showAadhaar || isBlocked || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, currentQuestion, showAadhaar, isBlocked, handleNext]);

  const handleAadhaarUpload = async () => {
    if (!aadhaarFile) return;
    setIsUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      const fileExt = aadhaarFile.name.split(".").pop();
      const filePath = `aadhaar/${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, aadhaarFile);

      if (uploadError) throw uploadError;

      setIsFinishing(true);

      // Final sync check - make sure backend marked as completed
      const {
        data: { session: authSession },
      } = await supabase.auth.getSession();
      if (authSession) {
        await apiClient
          .get("/assessment/results", authSession.access_token)
          .catch(() => null);
      }

      setTimeout(() => {
        router.push("/dashboard/candidate");
      }, 1500);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl border-4 border-red-500">
          <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="h-10 w-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m11 3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Account Permanently Blocked
          </h1>
          <p className="text-slate-600 mb-6">
            A security violation (tab switching) was detected. Due to our
            high-trust policy, you are permanently disqualified from using
            TalentFlow.
          </p>
          <div className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl border mb-6">
            This action is irreversible.
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3 text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] transition-colors"
          >
            LOGOUT SESSION
          </button>
        </div>
      </div>
    );
  }

  if (showAadhaar) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-3xl p-10 shadow-xl border border-slate-100 text-center">
          <div className="h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="h-8 w-8 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
            Assessment Complete!
          </h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Your professional signals have been captured. To finalize your
            high-trust profile, please upload a clear scan of your Aadhaar card
            for ID verification.
          </p>

          <div className="relative group mb-8">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className={`border-2 border-dashed rounded-2xl p-10 transition-all ${aadhaarFile ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-slate-50 group-hover:bg-slate-100"}`}
            >
              <div className="flex flex-col items-center gap-2">
                <svg
                  className={`h-10 w-10 ${aadhaarFile ? "text-emerald-500" : "text-slate-400"}`}
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
                <span className="text-sm font-semibold text-slate-700">
                  {aadhaarFile ? aadhaarFile.name : "Select your ID Document"}
                </span>
                <span className="text-xs text-slate-400">
                  PDF, JPG, or PNG (Max 5MB)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleAadhaarUpload}
            disabled={!aadhaarFile || isUploading || isFinishing}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${!aadhaarFile ? "bg-slate-300" : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 shadow-indigo-200"}`}
          >
            {isUploading
              ? "Verifying..."
              : isFinishing
                ? "Profile finalized!"
                : "COMPLETE REGISTRATION"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Progress & Timer */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6 flex-1">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
            <div className="h-5 w-5 rounded bg-white rotate-45" />
          </div>
          <div className="flex-1 max-w-md hidden md:block">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              <span>Assessment Progress</span>
              <span>
                Question {session?.current_step || 1} of{" "}
                {session?.total_budget || "--"}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{
                  width: `${((session?.current_step || 0) / (session?.total_budget || 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors mr-2 group"
          >
            <svg
              className="h-4 w-4 group-hover:scale-110 transition-transform"
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
            <span className="text-[10px] font-black uppercase tracking-widest">
              Quit
            </span>
          </button>

          <div
            className={`px-4 py-2 rounded-xl flex items-center gap-3 border ${timeLeft <= 10 ? "bg-red-50 border-red-100 text-red-600 animate-pulse" : "bg-slate-50 border-slate-100 text-slate-700"}`}
          >
            <svg
              className="h-5 w-5 opacity-70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-mono text-lg font-bold">{timeLeft}s</span>
          </div>
          <button
            onClick={() => handleNext(true)}
            className="text-xs font-bold text-slate-400 hover:text-red-500 px-4 py-2 rounded-lg border border-slate-100 transition-all"
          >
            SKIP
          </button>
        </div>
      </div>

      {/* Main Exam Area */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-24">
        {warning && (
          <div className="mb-8 p-4 bg-orange-50 border border-orange-100 text-orange-800 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
            <svg
              className="h-6 w-6 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-sm font-semibold">{warning}</p>
            <button
              onClick={() => setWarning(null)}
              className="text-orange-900 ml-auto"
            >
              &times;
            </button>
          </div>
        )}

        <div className="space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em]">
              Evaluation Case
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-[1.2]">
              {currentQuestion?.text || "Preparing your case..."}
            </h1>
          </div>

          <div className="relative">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your professional response here... Be detailed yet precise."
              className="w-full h-64 md:h-80 bg-slate-50 border border-slate-200 rounded-3xl p-8 text-lg text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 resize-none shadow-sm"
              disabled={isLoading || !currentQuestion}
              autoFocus
            />
            <div className="absolute bottom-6 right-8 flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-white/50 backdrop-blur px-3 py-1.5 rounded-full">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE MONITORING ACTIVE
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => handleNext(false)}
              disabled={!answer.trim() || isLoading}
              className="group flex items-center gap-4 bg-slate-900 hover:bg-indigo-600 text-white px-8 py-5 rounded-2xl font-black transition-all disabled:bg-slate-200 shadow-xl shadow-slate-200 hover:shadow-indigo-200 hover:-translate-y-1"
            >
              {isLoading ? "EVALUATING..." : "CONFIRM RESPONSE"}
              <svg
                className="h-5 w-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 pointer-events-none">
        <div className="max-w-4xl mx-auto flex justify-between items-center text-[10px] font-bold text-slate-300 tracking-widest uppercase">
          <span>TF-SHIELD v2.4a ENABLED</span>
          <span>LATENCY: 24MS</span>
        </div>
      </footer>
    </div>
  );
}
