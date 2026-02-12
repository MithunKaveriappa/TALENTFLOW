"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";

function SidebarLink({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
        active
          ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
          : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <div
        className={`h-2 w-2 rounded-full transition-all duration-300 ${
          active
            ? "bg-indigo-400 scale-125"
            : "bg-transparent group-hover:bg-slate-300"
        }`}
      />
      <span className="text-xs font-black uppercase tracking-[0.2em]">
        {label}
      </span>
    </button>
  );
}

interface Candidate {
  user_id: string;
  full_name: string;
  current_role: string;
  years_of_experience: number;
  trust_score: number;
  skills_alignment: number;
  bio: string;
  skills: string[];
}

export default function CandidateProfileView() {
  const router = useRouter();
  const { id } = useParams();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCandidate() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("/auth/recruiter/login");
          return;
        }

        const data = await apiClient.get(
          `/recruiter/candidate/${id}`,
          session.access_token,
        );
        setCandidate(data);
      } catch (err) {
        console.error("Failed to fetch candidate:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCandidate();
  }, [id, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/recruiter/login");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  if (!candidate)
    return (
      <div className="p-12 text-center font-bold">Candidate not found.</div>
    );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30">
        <div className="p-8 border-b border-slate-50">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push("/dashboard/recruiter")}
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
              <div className="h-5 w-5 rounded bg-white rotate-45" />
            </div>
            <span className="font-black text-slate-900 tracking-tighter uppercase text-lg">
              TalentFlow
            </span>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <SidebarLink
            label="Dashboard"
            onClick={() => router.push("/dashboard/recruiter")}
          />
          <SidebarLink
            label="Candidate Pool"
            active
            onClick={() => router.push("/dashboard/recruiter/pool")}
          />
          <SidebarLink
            label="Company Profile"
            onClick={() => router.push("/dashboard/recruiter/profile")}
          />
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group"
          >
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
            <span className="text-sm font-bold uppercase tracking-widest">
              Logout
            </span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 flex justify-between items-center">
            <button
              onClick={() => router.push("/dashboard/recruiter/pool")}
              className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-all"
            >
              <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </div>
              Back to Pool
            </button>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Active Status
              </span>
            </div>
          </header>

          <div className="bg-white rounded-4xl p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <div className="px-4 py-2 bg-slate-900 text-[10px] font-black text-white rounded-full tracking-[0.2em] uppercase italic">
                {candidate.years_of_experience >= 10
                  ? "Leadership"
                  : candidate.years_of_experience >= 5
                    ? "Senior"
                    : candidate.years_of_experience >= 2
                      ? "Mid-Level"
                      : "Fresher"}
              </div>
            </div>

            <div className="flex items-center gap-10 mb-16">
              <div className="h-32 w-32 bg-linear-to-br from-slate-50 to-slate-100 rounded-3xl flex items-center justify-center text-4xl font-black text-indigo-600 border border-slate-100 shadow-inner">
                {candidate.full_name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </div>
              <div>
                <h1 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-4">
                  {candidate.full_name}
                </h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] flex items-center gap-3">
                  {candidate.current_role || "Professional"}
                  <span className="h-1 w-1 rounded-full bg-slate-200" />
                  {candidate.years_of_experience} Years Exp
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-16">
              <div className="flex-1">
                <ScoreCard
                  label="Verified Trust Score"
                  score={candidate.trust_score}
                  color="indigo"
                />
              </div>
              <div className="flex-1">
                <ScoreCard
                  label="Skill Alignment"
                  score={candidate.skills_alignment}
                  color="emerald"
                />
              </div>
            </div>

            <div className="space-y-16">
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em]">
                    Professional Narrative
                  </h3>
                  <div className="h-px flex-1 bg-slate-50" />
                </div>
                <p className="text-slate-600 font-medium leading-relaxed text-lg italic">
                  &quot;
                  {candidate.bio ||
                    "Candidate has not provided a professional bio yet. Their profile is verified via our proprietary Trust Matrix."}
                  &quot;
                </p>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em]">
                    Core Stack & Competencies
                  </h3>
                  <div className="h-px flex-1 bg-slate-50" />
                </div>
                <div className="flex flex-wrap gap-3">
                  {candidate.skills?.map((s: string) => (
                    <span
                      key={s}
                      className="px-5 py-3 bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 border border-slate-100 uppercase tracking-wider hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-default"
                    >
                      {s}
                    </span>
                  ))}
                  {(!candidate.skills || candidate.skills.length === 0) && (
                    <span className="text-slate-400 text-xs italic">
                      No skills listed
                    </span>
                  )}
                </div>
              </section>
            </div>

            <div className="mt-16 pt-12 border-t border-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all">
                  Unlock Full Contact
                </button>
                <button className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">
                  Save to Shortlist
                </button>
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight text-right">
                Identity & Experience
                <br />
                Verified by TalentFlow
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ScoreCard({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: "indigo" | "emerald";
}) {
  const colorMap = {
    indigo: {
      border: "hover:border-indigo-200",
      bg: "bg-indigo-500",
    },
    emerald: {
      border: "hover:border-emerald-200",
      bg: "bg-emerald-500",
    },
  };

  const activeColor = colorMap[color];

  return (
    <div
      className={`p-8 bg-white rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group ${activeColor.border} transition-all`}
    >
      <div
        className={`absolute top-0 left-0 w-full h-1 ${activeColor.bg} opacity-0 group-hover:opacity-100 transition-opacity`}
      />
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-4">
        {label}
      </span>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
          {score || "--"}
        </span>
        <span className="text-xs font-bold text-slate-400 mb-1">/100</span>
      </div>
      <div
        className={`mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden`}
      >
        <div
          className={`h-full ${activeColor.bg} transition-all duration-1000`}
          style={{ width: `${score || 0}%` }}
        />
      </div>
    </div>
  );
}
