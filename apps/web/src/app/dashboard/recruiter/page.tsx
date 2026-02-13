"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

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
  full_name: string;
  job_title: string;
  company_id: string;
  onboarding_step: string;
  assessment_status: string;
  companies: Company;
}

interface RecruiterStats {
  active_jobs_count: number;
  pending_applications_count: number;
  invites_sent_count: number;
  completion_score: number;
  verification_status: string;
  company_quality_score: number;
}

export default function RecruiterDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [stats, setStats] = useState<RecruiterStats | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
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
      } catch (err) {
        console.error("Failed to load recruiter data:", err);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
            Syncing Command Center...
          </p>
        </div>
      </div>
    );
  }

  const isAssessmentCompleted = profile?.assessment_status === "completed";

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

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <SidebarLink
            label="Dashboard"
            active
            onClick={() => router.push("/dashboard/recruiter")}
          />
          <SidebarLink
            label="Community Feed"
            onClick={() => router.push("/dashboard/recruiter/community")}
          />
          <SidebarLink
            label="My Jobs"
            onClick={() => router.push("/dashboard/recruiter/jobs")}
          />
          <SidebarLink
            label="Post a Role"
            onClick={() => router.push("/dashboard/recruiter/jobs/new")}
          />
          <SidebarLink
            label="Candidate Pool"
            onClick={() => router.push("/dashboard/recruiter/pool")}
          />
          <SidebarLink
            label="Company Profile"
            onClick={() => router.push("/dashboard/recruiter/profile")}
          />
          <SidebarLink label="Team Access" />
          <SidebarLink label="Trust Matrix" />
          <SidebarLink label="Verification" />
        </nav>

        <div className="p-6 border-t border-slate-50 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                System Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-tight">
              Shared Integrity Score is live for your enterprise.
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
        {!isAssessmentCompleted ? (
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className="text-center p-12 bg-white rounded-4xl shadow-2xl shadow-slate-200/50 border border-slate-100 max-w-md w-full relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-indigo-400 to-indigo-500" />

              <div className="h-20 w-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                <svg
                  className="h-10 w-10 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
                ACCESS LOCKED
              </h1>
              <p className="text-slate-500 mb-10 text-sm font-medium leading-relaxed">
                To unlock the{" "}
                <span className="text-slate-900 font-bold">
                  Recruiter Command Center
                </span>{" "}
                and see trust-verified matches, you must complete your
                onboarding assessment.
              </p>

              <button
                onClick={() => router.push("/onboarding/recruiter")}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                <span>COMPLETE ONBOARDING</span>
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
          <div className="max-w-6xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                    Recruiter Command Center
                  </span>
                  <div className="h-1 w-1 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Enterprise Hub
                  </span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase italic">
                  COMMAND CENTER
                </h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-3">
                  Partner: {profile?.companies?.name} • Role:{" "}
                  {profile?.job_title}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-8">
                {/* Signals like Candidate Dashboard */}
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Company Integrity
                  </span>
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        (stats?.company_quality_score || 0) > 70
                          ? "bg-emerald-500"
                          : (stats?.company_quality_score || 0) > 50
                            ? "bg-indigo-500"
                            : "bg-amber-500"
                      }`}
                    />
                    {stats?.company_quality_score || 0}%
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Compliance
                  </span>
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <span className="text-indigo-600">
                      {stats?.completion_score || 0}%
                    </span>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Verification
                  </span>
                  <div
                    className={`flex items-center gap-2 font-bold text-sm ${
                      stats?.verification_status === "Verified"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        stats?.verification_status === "Verified"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                    />
                    {stats?.verification_status?.toUpperCase() || "PENDING"}
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Recruiter Status
                  </span>
                  <div className="flex items-center gap-2 font-bold text-sm text-indigo-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    {profile?.assessment_status?.toUpperCase() || "ACTIVE"}
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
                  </div>
                </button>
              </div>
            </header>

            {/* Signal Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                label="Company Integrity"
                value={stats?.company_quality_score || 0}
                unit="%"
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                }
                color="indigo"
                status={
                  (stats?.company_quality_score || 0) > 70 ? "Elite" : "Strong"
                }
              />
              <StatCard
                label="Active Jobs"
                value={stats?.active_jobs_count || 0}
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                }
                color="indigo"
              />
              <StatCard
                label="Invites Sent"
                value={stats?.invites_sent_count || 0}
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                }
                color="emerald"
                trend="Real-time"
              />
              <StatCard
                label="Verification"
                value={stats?.verification_status || "Pending"}
                subValue="Trust Level"
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                }
                color={
                  stats?.verification_status === "Verified"
                    ? "emerald"
                    : "amber"
                }
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Overview */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-slate-900 uppercase italic">
                    Recent Activity
                  </h2>
                  <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                    View Pipeline
                  </button>
                </div>
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-400 font-medium text-sm">
                    No recent activity to display.
                  </p>
                </div>
              </div>

              {/* Sidebar Cards */}
              <div className="space-y-6">
                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                    <svg
                      className="h-24 w-24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-black uppercase italic mb-4">
                    Post New Role
                  </h3>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
                    Our AI-driven matching algorithm will source high-trust
                    candidates specifically for your tech stack.
                  </p>
                  <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-xl shadow-black/20">
                    Launch Job Portal
                  </button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 uppercase italic mb-6">
                    Hiring Pulse
                  </h3>
                  <div className="space-y-6">
                    <PulseItem
                      label="Avg. Response"
                      value="1.2 days"
                      color="blue"
                    />
                    <PulseItem
                      label="Interview Rate"
                      value="64%"
                      color="indigo"
                    />
                    <PulseItem
                      label="Offer Acceptance"
                      value="89%"
                      color="emerald"
                    />
                  </div>
                </div>
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
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 rounded-xl transition-all group ${
        active
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
          : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
      }`}
    >
      <span className="text-sm font-bold uppercase tracking-widest">
        {label}
      </span>
    </button>
  );
}

function StatCard({
  label,
  value,
  subValue,
  unit,
  status,
  icon,
  color,
  trend,
}: {
  label: string;
  value: string | number;
  subValue?: string;
  unit?: string;
  status?: string;
  icon: React.ReactNode;
  color: "blue" | "indigo" | "emerald" | "amber";
  trend?: string;
}) {
  const colors = {
    blue: "bg-indigo-50 text-indigo-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {icon}
          </svg>
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {value}
            {unit && <span className="text-sm ml-0.5">{unit}</span>}
          </span>
          {status && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${colors[color]}`}
            >
              {status}
            </span>
          )}
          {subValue && (
            <span className="text-[10px] font-bold text-slate-400 uppercase italic">
              {subValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PulseItem({
  label,
  value,
  color = "indigo",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  const colorClasses =
    {
      blue: "bg-indigo-500",
      indigo: "bg-indigo-500",
      emerald: "bg-emerald-500",
      amber: "bg-amber-500",
    }[color] || "bg-indigo-500";

  return (
    <div className="flex justify-between items-center group/pulse">
      <div className="flex items-center gap-2">
        <div
          className={`h-1.5 w-1.5 rounded-full ${colorClasses} opacity-40 group-hover/pulse:opacity-100 transition-opacity`}
        />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
  );
}
