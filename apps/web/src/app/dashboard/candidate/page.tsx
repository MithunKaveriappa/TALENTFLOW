"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

interface ComponentScores {
  skill?: number;
  behavioral?: number;
  resume?: number;
  psychometric?: number;
  reference?: number;
  [key: string]: number | undefined;
}

interface AssessmentResults {
  overall_score: number;
  component_scores: ComponentScores;
  status: string;
  completed_at?: string;
}

export default function CandidateDashboard() {
  const router = useRouter();
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    async function loadResults() {
      try {
        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();
        if (!authSession) {
          router.push("/login");
          return;
        }

        const data = await apiClient.get(
          "/assessment/results",
          authSession.access_token,
        );
        setResults(data);
      } catch (err) {
        console.error("Failed to load results:", err);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
            Compiling Profile Signals...
          </p>
        </div>
      </div>
    );
  }

  const scores = results?.component_scores || {};

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30">
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
              <div className="h-5 w-5 rounded bg-white rotate-45" />
            </div>
            <span className="font-black text-slate-900 tracking-tighter uppercase text-lg">
              TalentFlow
            </span>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <SidebarLink label="Dashboard" active />
          <SidebarLink label="My Profile" />
          <SidebarLink label="Assessments" />
          <SidebarLink label="Trust Matrix" />
          <SidebarLink label="Job Matches" />
          <SidebarLink label="Shield Status" />
          <SidebarLink label="Verification" />
        </nav>

        <div className="p-6 border-t border-slate-50 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Trust Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-tight">
              Your signals are live for 12 enterprise partners.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group"
          >
            <svg
              className="h-5 w-5 transition-transform group-hover:scale-110"
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
            <span className="text-sm font-bold uppercase tracking-widest">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6 md:p-12 overflow-y-auto">
        {!results ? (
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className="text-center p-12 bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 max-w-md w-full relative overflow-hidden group">
              {/* Decorative element */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-amber-400 to-orange-500" />

              <div className="h-20 w-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                <svg
                  className="h-10 w-10 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                EVALUATION REQUIRED
              </h1>
              <p className="text-slate-500 mb-10 text-sm font-medium leading-relaxed">
                To unlock your{" "}
                <span className="text-slate-900 font-bold">Command Center</span>{" "}
                and begin matching with partners, you must first complete the
                baseline assessment signals.
              </p>

              <button
                onClick={() => router.push("/assessment/candidate")}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                <span>INITIALIZE ASSESSMENT</span>
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
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex justify-between items-end mb-12">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase italic">
                  CANDIDATE COMMAND CENTER
                </h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
                  Real-time Performance Monitoring
                </p>
              </div>
              <div className="flex items-end gap-8">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Identity Status
                  </span>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    VERIFIED
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center gap-1 group"
                >
                  <span className="text-[10px] font-bold text-slate-300 group-hover:text-red-400 uppercase tracking-widest transition-colors">
                    Session
                  </span>
                  <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-red-500 group-hover:border-red-100 group-hover:bg-red-50 transition-all shadow-sm">
                    <svg
                      className="h-5 w-5"
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
                  </div>
                </button>
              </div>
            </header>

            {/* Global Score Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="space-y-6 text-center md:text-left">
                  <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                    Aggregate Talent Score
                  </span>
                  <div className="space-y-1">
                    <h2 className="text-7xl md:text-9xl font-black tracking-tighter">
                      {results.overall_score || 0}
                    </h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                      Percentile Score / 100
                    </p>
                  </div>
                  <p className="text-slate-300 max-w-sm text-sm leading-relaxed font-medium">
                    Your profile indicates{" "}
                    <span className="text-indigo-400 font-bold">
                      {results.overall_score >= 70
                        ? "High-Fit"
                        : results.overall_score >= 40
                          ? "Moderate-Fit"
                          : "Emerging-Fit"}
                    </span>{" "}
                    for Technical Sales roles. Profile shared with 12 top-tier
                    companies.
                  </p>
                </div>

                <div className="relative">
                  <div className="h-48 w-48 md:h-64 md:w-64 rounded-full border-[1.5rem] border-slate-800 flex items-center justify-center">
                    <div className="text-center">
                      <svg
                        className="h-12 w-12 md:h-16 md:w-16 text-indigo-500 mx-auto mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                        Trust Matrix
                      </span>
                    </div>
                  </div>
                  {/* SVG Progress Circle */}
                  <svg
                    className="absolute inset-0 h-full w-full -rotate-90 scale-102"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray="264"
                      strokeDashoffset={
                        264 - (264 * (results.overall_score || 0)) / 100
                      }
                      strokeLinecap="round"
                      className="text-indigo-500 transition-all duration-2000 ease-out"
                    />
                  </svg>
                </div>
              </div>

              {/* Decorative Mesh */}
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-linear-to-l from-indigo-500 to-transparent" />
                <div className="grid grid-cols-10 gap-1 h-full w-full">
                  {[...Array(100)].map((_, i) => (
                    <div
                      key={i}
                      className="border-[0.5px] border-white/20 h-full w-full"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Signal Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ScoreTile label="Technical Skill" score={scores.skill} />
              <ScoreTile label="Behavioral" score={scores.behavioral} />
              <ScoreTile label="Resume Signal" score={scores.resume} />
              <ScoreTile label="Psychometric" score={scores.psychometric} />
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-sm overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 italic text-wrap wrap-break-word">
                  <span className="h-1 w-8 bg-indigo-600 rounded-full shrink-0" />
                  EXPERT SIGNALS & LLM FEEDBACK
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <FeedbackItem
                    title="Structural Integrity"
                    desc="Logical flow in responses is above benchmark. Candidate treats sales scenarios as strategic operations rather than simple transactions."
                    status="Elite"
                  />
                  <FeedbackItem
                    title="Adaptive Quotient"
                    desc="High degree of flexibility shown when handling complex customer objections in the AI-generated skill scenarios."
                    status="Superior"
                  />
                </div>
              </div>
              {/* Background branding */}
              <div className="absolute -bottom-10 -right-10 text-[120px] font-black text-slate-50 select-none">
                TF
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SidebarLink({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all cursor-pointer ${active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50"}`}
    >
      <div
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : "bg-slate-200 group-hover:bg-indigo-400"}`}
      />
      {label}
    </div>
  );
}

function ScoreTile({
  label,
  score,
}: {
  label: string;
  score: number | undefined;
}) {
  const hasData = score !== undefined && score !== null;
  return (
    <div
      className={`bg-white p-6 rounded-3xl border shadow-sm space-y-4 transition-colors group ${hasData ? "border-slate-200 hover:border-indigo-200" : "border-slate-100 opacity-60"}`}
    >
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-500 transition-colors">
          {label}
        </span>
        <span className="text-xl font-black text-slate-900 italic">
          {hasData ? `${score}%` : "--"}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-1500 ease-out"
          style={{ width: `${hasData ? score : 0}%` }}
        />
      </div>
    </div>
  );
}

function FeedbackItem({
  title,
  desc,
  status,
}: {
  title: string;
  desc: string;
  status: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight">
          {title}
        </h4>
        <span className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-md tracking-widest">
          {status}
        </span>
      </div>
      <p className="text-slate-500 text-xs leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  );
}
