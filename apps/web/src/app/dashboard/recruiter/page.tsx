"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import RecruiterSidebar from "@/components/RecruiterSidebar";

interface Company {
  id: string;
  name: string;
  website: string;
  location: string;
  description: string;
  profile_score: number;
}

interface RecruiterProfile {
  user_id: string;
  company_id: string;
  onboarding_step: string;
  assessment_status: string;
  companies: Company;
}

export default function RecruiterDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [stats, setStats] = useState<{
    active_jobs_count?: number;
    visibility_tier?: string;
    invites_sent_count?: number;
    [key: string]: unknown;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();
        if (!authSession) {
          router.replace("/login");
          return;
        }

        const [profileData, statsData] = await Promise.all([
          apiClient.get("/recruiter/profile", authSession.access_token),
          apiClient.get("/recruiter/stats", authSession.access_token),
        ]);

        setProfile(profileData);
        setStats(statsData);
        setError(null);
      } catch (err) {
        console.error("Failed to load recruiter dashboard data:", err);
        setError("Failed to sync dashboard signals");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
            Syncing Command Center...
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-xl max-w-sm text-center">
          <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="h-8 w-8 text-red-500"
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
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-tight">
            Sync Offline
          </h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            {error || "Server disconnected"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
          >
            RETRY CONNECTION
          </button>
        </div>
      </div>
    );
  }

  const isAssessmentCompleted =
    profile?.assessment_status === "completed" ||
    (profile?.companies?.profile_score ?? 0) > 0;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <RecruiterSidebar assessmentStatus={profile?.assessment_status} />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          {!isAssessmentCompleted && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <svg
                    className="h-6 w-6"
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
                </div>
                <div>
                  <h3 className="text-amber-900 font-bold">
                    Incomplete Onboarding
                  </h3>
                  <p className="text-amber-700 text-sm">
                    Finish your assessment to unlock trust-verified matchmaking
                    signals.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/onboarding/recruiter")}
                className="px-6 py-2 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition"
              >
                Complete Now
              </button>
            </div>
          )}
          <header className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase italic">
                Dashboard
              </h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
                Company Domain: {profile?.companies?.name || "Initializing..."}
              </p>
            </div>
            <div className="flex items-end gap-8">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Company Status
                </span>
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  LIVE ON MATRIX
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm active:scale-95"
              >
                Logout
              </button>
            </div>
          </header>

          {/* Company Profile Score Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="space-y-6 text-center md:text-left">
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  Company Profile Score
                </span>
                <div className="space-y-1">
                  <h2 className="text-7xl md:text-9xl font-black tracking-tighter">
                    {profile?.companies?.profile_score || 0}
                  </h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                    Trust Signal Integrity / 100
                  </p>
                </div>
                <p className="text-slate-300 max-w-sm text-sm leading-relaxed font-medium">
                  Your current score indicates{" "}
                  <span className="text-blue-400 font-bold">
                    {(profile.companies?.profile_score ?? 0) >= 85
                      ? "High-Trust Status"
                      : (profile.companies?.profile_score ?? 0) >= 70
                        ? "Standard-Trust Status"
                        : "Early-Signal Status"}
                  </span>
                  . Candidates prioritize matching with companies that showcase
                  clear hiring intent.
                </p>
              </div>

              <div className="h-48 w-48 md:h-64 md:w-64 relative">
                <div className="absolute inset-0 rounded-full border-[1.5rem] border-slate-800 flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="h-12 w-12 md:h-16 md:w-16 text-blue-500 mx-auto mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                      Signal Meta
                    </span>
                  </div>
                </div>
                {/* Score Progress Ring */}
                {(profile.companies?.profile_score ?? 0) > 0 && (
                  <svg
                    className="absolute inset-0 h-full w-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="transparent"
                      stroke="#3b82f6"
                      strokeWidth="4"
                      strokeDasharray="264"
                      strokeDashoffset={
                        264 -
                        (264 * (profile.companies?.profile_score ?? 0)) / 100
                      }
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Live Jobs"
              value={stats?.active_jobs_count?.toString() || "0"}
              sub="Active candidate pipelines"
            />
            <StatCard
              label="Trust Reach"
              value={stats?.visibility_tier || "Low"}
              sub="Market perception rank"
              icon="reach"
            />
            <StatCard
              label="Network Signals"
              value={stats?.invites_sent_count?.toString() || "0"}
              sub="Profile engagement"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon?: string;
}) {
  return (
    <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </span>
        <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
          {icon === "reach" ? (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          )}
        </div>
      </div>
      <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {sub}
      </div>
    </div>
  );
}

