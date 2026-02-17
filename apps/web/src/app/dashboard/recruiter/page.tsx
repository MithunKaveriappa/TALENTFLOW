"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { 
  BadgeCheck, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Award, 
  Building2, 
  ShieldCheck, 
  Zap, 
  FileText, 
  Compass 
} from "lucide-react";
import HiringFunnel from "@/components/dashboard/HiringFunnel";

interface Company {
  id: string;
  name: string;
  website: string;
  location: string;
  description: string;
  profile_score: number;
  logo_url?: string;
}

interface RecruiterProfile {
  user_id: string;
  company_id: string;
  onboarding_step: string;
  assessment_status: string;
  is_admin: boolean;
  completion_score: number;
  companies: Company;
}

export default function RecruiterDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [stats, setStats] = useState<{
    active_jobs_count?: number;
    total_views?: number;
    total_applications?: number;
    conversion_rate?: number;
    shortlist_rate?: number;
    visibility_tier?: string;
    funnel_data?: {
      applied: number;
      shortlisted: number;
      interviewed: number;
      offered: number;
      hired: number;
    };
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto space-y-10">
        {!isAssessmentCompleted && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-amber-900 font-bold text-lg tracking-tight">
                  Incomplete Onboarding
                </h3>
                <p className="text-amber-800/70 text-sm font-medium">
                  Finish your assessment to unlock trust-verified matchmaking signals and elite pool access.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/onboarding/recruiter")}
              className="px-6 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition shadow-lg shadow-amber-600/10 active:scale-95"
            >
              Complete Now
            </button>
          </div>
        )}

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                Recruiter <span className="text-indigo-600">Overview</span>
              </h1>
              <div className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-md">
                Admin
              </div>
            </div>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" />
              {profile?.companies?.name || "TalentFlow Partner"} &bull; Live Intelligence
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                System Status
              </span>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                OPERATIONAL
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-xl text-xs font-bold transition-all border border-slate-200"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Company Profile Score Card - Premium Version */}
        <div className="bg-slate-900 rounded-5xl p-10 md:p-16 mb-12 relative overflow-hidden group shadow-2xl shadow-indigo-900/20">
          <div className="absolute top-0 right-0 w-125 h-125 bg-indigo-600/10 rounded-full blur-[120px] -mr-64 -mt-64 group-hover:bg-indigo-600/20 transition-all duration-1000" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[100px] -ml-48 -mb-48" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 animate-pulse">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
                      Live Presence Analysis
                    </span>
                  </div>
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
                  Presence <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">Authenticity</span>
                </h2>
                <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-lg">
                  Your current standing reflects the trust the platform holds in your recruitment signals.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-4xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="text-3xl font-black text-white mb-1">
                    {(profile?.companies?.profile_score ?? 0) >= 85 ? "Elite" : (profile?.companies?.profile_score ?? 0) >= 70 ? "Prime" : "Growth"}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Presence Standing
                  </div>
                </div>
                <div className="p-6 rounded-4xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="text-3xl font-black text-white mb-1">
                    {profile?.completion_score}%
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Profile Integrity
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative h-64 w-64 md:h-80 md:w-80 group/shield">
                {/* Visual Glow */}
                <div className="absolute inset-0 bg-indigo-600/30 rounded-full blur-3xl group-hover/shield:bg-indigo-500/40 transition-all duration-700" />
                
                <div className="absolute inset-0 rounded-full border border-white/5 flex items-center justify-center backdrop-blur-sm z-10">
                  <div className="text-center p-10 bg-slate-800/50 rounded-full border border-white/10 shadow-3xl backdrop-blur-xl group-hover/shield:scale-105 transition-transform duration-500">
                    <Building2 className="h-20 w-20 text-white mb-4 mx-auto drop-shadow-2xl" />
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 animate-pulse">
                      Authentic
                    </div>
                  </div>
                </div>

                {/* Circular Progress SVG */}
                <svg className="absolute inset-0 h-full w-full -rotate-90 drop-shadow-[0_0_25px_rgba(99,102,241,0.5)] z-20" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="transparent"
                    stroke="url(#shieldGradient)"
                    strokeWidth="5"
                    strokeDasharray="289"
                    strokeDashoffset={289 - (289 * (profile?.companies?.profile_score ?? 0)) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-2000 ease-out"
                  />
                  <defs>
                    <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Metric Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Active Roles"
            value={stats?.active_jobs_count?.toString() || "0"}
            sub="Current Pipeline"
            icon={Briefcase}
            trend="+2 this week"
          />
          <StatCard
            label="Talent Reach"
            value={stats?.total_views?.toLocaleString() || "0"}
            sub="Market Awareness"
            icon={Users}
            color="indigo"
          />
          <StatCard
            label="Success Rate"
            value={`${stats?.conversion_rate || 0}%`}
            sub="Conversion Metrics"
            icon={Zap}
            color="amber"
          />
          <StatCard
            label="V-Rank"
            value={stats?.visibility_tier || "Growth"}
            sub="Algorithmic Position"
            icon={Award}
            color="emerald"
          />
        </div>

        {/* Analytics & Roadmap Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white/40 backdrop-blur-sm rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-indigo-500" />
                    Signal Momentum
                  </h3>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Tracking candidate resonance live</p>
                </div>
                <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Real-time
                  </span>
                </div>
              </div>
              
              <HiringFunnel
                data={
                  stats?.funnel_data || {
                    applied: stats?.total_applications || 0,
                    shortlisted: 0,
                    interviewed: 0,
                    offered: 0,
                    hired: 0,
                  }
                }
              />
            </div>

            {/* Optimization Hub - Integrated Below Momentum */}
            <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              
              <div className="flex items-center justify-between mb-12 relative z-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Optimization Roadmap
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    Refining your recruitment signal for maximum authenticity.
                  </p>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                  <div className="flex flex-col items-end">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                      Signal Power
                    </div>
                    <div className="text-2xl font-black text-indigo-600 leading-none">
                      {profile?.completion_score}%
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-indigo-500 animate-[spin_3s_linear_infinite]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                <CompletionItem
                  label="Company DNA"
                  done={!!profile?.companies?.logo_url}
                  href="/dashboard/recruiter/organization/branding"
                  icon={<Building2 className="h-4 w-4" />}
                />
                <CompletionItem
                  label="Team Governance"
                  done={profile?.is_admin || false}
                  href="/dashboard/recruiter/organization/team"
                  icon={<ShieldCheck className="h-4 w-4" />}
                />
                <CompletionItem
                  label="Cultural Mapping"
                  done={profile?.assessment_status === "completed"}
                  href="/onboarding/recruiter"
                  icon={<Zap className="h-4 w-4" />}
                />
                <CompletionItem
                  label="Role Precision"
                  done={(stats?.active_jobs_count || 0) > 0}
                  href="/dashboard/recruiter/hiring/jobs/new"
                  icon={<FileText className="h-4 w-4" />}
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* AI Insights / Market Position */}
            <div className="bg-slate-900 rounded-5xl p-10 text-white shadow-2xl shadow-indigo-200/20 flex flex-col min-h-100 justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-500/30 transition-all duration-700" />
              
              <div className="space-y-8 relative z-10">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl w-fit backdrop-blur-xl group-hover:scale-110 transition-transform">
                  <Compass className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                    Market Intelligence
                  </div>
                  <h3 className="text-3xl font-black tracking-tighter leading-tight">
                    Strategic <br />Positioning
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    Your profile is currently outperforming <span className="text-white font-bold">{profile?.companies?.profile_score}%</span> of regional competitors in verified engagement.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6 pt-8 border-t border-white/5 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Presence Tier
                  </span>
                  <span className="text-lg font-black text-white italic tracking-widest">
                    {stats?.visibility_tier?.toUpperCase() || "GROWTH"}
                  </span>
                </div>
                <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                  Deep Insights
                </button>
              </div>
            </div>

            {/* Support/Resource Card */}
            <div className="bg-indigo-50 rounded-[3rem] p-10 border border-indigo-100 group hover:bg-indigo-100/50 transition-colors">
              <div className="space-y-4">
                <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-6">
                  <Award className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">Elite Partner Program</h4>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">Reach a visibility tier of Prime to unlock exclusive talent pools and priority matching.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompletionItem({
  label,
  done,
  href,
  icon,
}: {
  label: string;
  done: boolean;
  href?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`flex items-center justify-between p-6 rounded-4xl border transition-all duration-500 group ${done ? "bg-slate-50 border-slate-100 shadow-sm" : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10"}`}>
      <div className="flex items-center gap-4">
        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${done ? "bg-emerald-100 text-emerald-600 scale-90" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 group-hover:rotate-6"}`}>
          {icon}
        </div>
        <span className={`text-sm font-bold tracking-tight transition-colors ${done ? "text-slate-400" : "text-slate-700 group-hover:text-slate-900"}`}>
          {label}
        </span>
      </div>
      {done ? (
        <div className="h-8 w-8 bg-emerald-50 rounded-full flex items-center justify-center">
          <BadgeCheck className="h-5 w-5 text-emerald-500" />
        </div>
      ) : (
        href && (
          <Link
            href={href}
            className="px-4 py-1.5 bg-indigo-50 text-[10px] font-black uppercase tracking-widest text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-all transform active:scale-90"
          >
            Optimize
          </Link>
        )
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  color = "slate"
}: {
  label: string;
  value: string;
  sub: string;
  icon?: React.ElementType;
  trend?: string;
  color?: "slate" | "indigo" | "emerald" | "amber";
}) {
  const colorMap = {
    slate: "text-slate-400 bg-slate-50 border-slate-100",
    indigo: "text-indigo-500 bg-indigo-50 border-indigo-100",
    emerald: "text-emerald-500 bg-emerald-50 border-emerald-100",
    amber: "text-amber-500 bg-amber-50 border-amber-100"
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-700 group relative overflow-hidden flex items-center gap-6">
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full blur-2xl -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className={`p-4 rounded-2xl transition-all duration-500 border ${colorMap[color]} group-hover:scale-110 group-hover:rotate-3 shadow-sm shrink-0 relative z-10`}>
        {Icon && <Icon className="h-6 w-6" />}
      </div>
      
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] truncate">
            {label}
          </div>
          {trend && (
            <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-tighter shrink-0">
              {trend}
            </span>
          )}
        </div>
        <div className="text-3xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-indigo-600 transition-all duration-500">
          {value}
        </div>
        <div className="text-[10px] font-medium text-slate-400 italic mt-1.5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-1 group-hover:translate-y-0">
          {sub}
        </div>
      </div>
    </div>
  );
}
