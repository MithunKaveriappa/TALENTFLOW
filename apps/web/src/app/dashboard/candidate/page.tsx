"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TermsModal } from "@/components/TermsModal";
import {
  CheckCircle2,
  Video,
  Target,
  Briefcase,
  Zap,
  ShieldCheck,
} from "lucide-react";

interface LatestApplication {
  id: string;
  status: string;
  jobs?: {
    title: string;
    companies?: {
      name: string;
      logo_url?: string;
    };
  };
  interviews?: Array<{
    meeting_link?: string;
  }>;
}

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

interface CandidateStats {
  applications_count: number;
  shortlisted_count: number;
  invites_received: number;
  posts_count: number;
  saved_jobs_count: number;
  profile_score: number | null;
  profile_strength: string;
  completion_score: number;
  assessment_status: string;
  identity_verified: boolean;
  terms_accepted: boolean;
  account_status: string;
}

export default function CandidateDashboard() {
  const router = useRouter();
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [stats, setStats] = useState<CandidateStats | null>(null);
  const [latestApp, setLatestApp] = useState<LatestApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTerms, setShowTerms] = useState(false);

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

        const [resultsData, statsData, appData] = await Promise.all([
          apiClient.get("/assessment/results", authSession.access_token),
          apiClient.get("/candidate/stats", authSession.access_token),
          apiClient.get(
            "/candidate/latest-application",
            authSession.access_token,
          ),
        ]);

        setResults(resultsData);
        setStats(statsData);
        setLatestApp(appData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
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
            Compiling Profile Signals...
          </p>
        </div>
      </div>
    );
  }

  const scores = results?.component_scores || {};

  const isLocked =
    stats?.assessment_status !== "completed" ||
    !stats?.identity_verified ||
    !stats?.terms_accepted;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {isLocked ? (
        <div className="max-w-4xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">
                Command <span className="text-indigo-600">Locked</span>
              </h1>
              <div className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-md border border-amber-200">
                Awaiting Sync
              </div>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Complete all synchronization signals to unlock transmission.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: Assessment */}
            <LockStepCard
              title="Performance Assessment"
              description="Verify your behavioral and technical signals via our AI evaluation."
              status={
                stats?.assessment_status === "completed"
                  ? "verified"
                  : "incomplete"
              }
              actionLabel="Initialize Assessment"
              onAction={() => router.push("/assessment/candidate")}
            />

            {/* Step 2: Identity */}
            <LockStepCard
              title="Identity Verification"
              description="Secure your profile by uploading a valid government-issued ID."
              status={stats?.identity_verified ? "verified" : "incomplete"}
              actionLabel="Verify Identity"
              onAction={() =>
                router.push("/onboarding/candidate?target=AWAITING_ID")
              }
            />

            {/* Step 3: Terms & Consent */}
            <LockStepCard
              title="Legal Synchronization"
              description="Accept the platform terms and data privacy consent forms."
              status={stats?.terms_accepted ? "verified" : "incomplete"}
              actionLabel="Accept Terms"
              onAction={() =>
                router.push("/onboarding/candidate?target=AWAITING_TC")
              }
              secondaryActionLabel="Read Policy"
              onSecondaryAction={() => setShowTerms(true)}
            />
          </div>

          <div className="mt-12 bg-white border border-slate-200 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm">
            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1 italic text-wrap wrap-break-word">
                Why is my dashboard locked?
              </h4>
              <p className="text-slate-500 text-xs font-medium leading-relaxed">
                To maintain a high-trust hiring ecosystem, we require all
                candidates to verify their identity and complete a baseline
                performance evaluation before matching with recruiters.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">
                  Candidate <span className="text-indigo-600">Command</span>
                </h1>
                <div className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-md border border-indigo-200">
                  Live
                </div>
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                Session Protocol: Active Transmission &bull; High-Airiness View
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
            </div>
          </header>

          {/* Stat Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              label="Active Missions"
              value={stats?.applications_count || 0}
              icon={<Briefcase className="h-5 w-5" />}
              trend="Real-time"
            />
            <StatCard
              label="Shortlist Hits"
              value={stats?.shortlisted_count || 0}
              icon={<Target className="h-5 w-5" />}
              color="text-emerald-500"
              trend="+12% vs avg"
            />
            <StatCard
              label="Network Invites"
              value={stats?.invites_received || 0}
              icon={<Zap className="h-5 w-5" />}
              color="text-indigo-500"
              trend="Priority"
            />
            <StatCard
              label="Presence Score"
              value={stats?.completion_score || 0}
              unit="%"
              icon={<ShieldCheck className="h-5 w-5" />}
              trend="Verified"
            />
          </div>

          {/* Main Performance Signal Card */}
          <div className="bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden group border border-white/5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-indigo-600/20 transition-all duration-1000" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">
                      Aggregate Talent Signal
                    </span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                    Performance{" "}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">
                      Nexus
                    </span>
                  </h2>
                  <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-md opacity-80">
                    Your combined technical and behavioral signals place you in
                    the{" "}
                    <span className="text-indigo-400 font-bold">Top 5%</span> of
                    local sales talent.
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-black text-white">
                      {results?.overall_score || 0}
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 text-wrap wrap-break-word">
                      Score
                    </div>
                  </div>
                  <div className="h-10 w-px bg-white/10" />
                  <div className="text-center">
                    <div className="text-4xl font-black text-white">Elite</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 text-wrap wrap-break-word">
                      Standing
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className="relative h-56 w-56 md:h-64 md:w-64 group/shield">
                  <div className="absolute inset-0 bg-indigo-600/20 rounded-full blur-3xl group-hover/shield:bg-indigo-500/30 transition-all duration-700" />
                  <div className="absolute inset-0 rounded-full border border-white/5 flex items-center justify-center backdrop-blur-sm z-10 overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-500/10 opacity-50" />
                    <div className="text-center z-20">
                      <Target className="h-16 w-16 text-indigo-400 mx-auto mb-2 drop-shadow-2xl" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">
                        Verified Presence
                      </span>
                    </div>
                    {/* Progress Ring */}
                    <svg
                      className="absolute inset-0 h-full w-full -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="transparent"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="4"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="transparent"
                        stroke="url(#indigoGradientDashboard)"
                        strokeWidth="4"
                        strokeDasharray="301.5"
                        strokeDashoffset={
                          301.5 - (301.5 * (results?.overall_score || 0)) / 100
                        }
                        strokeLinecap="round"
                        className="transition-all duration-2000 ease-out"
                      />
                      <defs>
                        <linearGradient
                          id="indigoGradientDashboard"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#818cf8" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Discovery & Calibration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Active Application or CTA */}
            <div className="lg:col-span-2">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-slate-200" />
                Operational Roadmap
              </h3>

              {latestApp ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="h-20 w-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl shrink-0 overflow-hidden shadow-inner">
                      {latestApp.jobs?.companies?.logo_url ? (
                        <Image
                          src={latestApp.jobs.companies.logo_url}
                          alt={latestApp.jobs.companies.name || "Company Logo"}
                          fill
                          className="object-contain p-4 group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <span className="text-slate-300">🏢</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-2xl font-black text-slate-900 tracking-tight italic">
                            {latestApp.jobs?.title}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              latestApp.status === "recommended"
                                ? "bg-blue-50 text-blue-600 border border-blue-100"
                                : latestApp.status === "shortlisted"
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                  : "bg-slate-50 text-slate-500 border border-slate-100"
                            }`}
                          >
                            {latestApp.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-tight text-xs">
                          {latestApp.jobs?.companies?.name} &bull; Pipeline
                          Active
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <StatusStep label="Applied" active={true} done={true} />
                        <StatusStep
                          label="Shortlist"
                          active={[
                            "shortlisted",
                            "invited",
                            "interview_scheduled",
                            "offered",
                          ].includes(latestApp.status)}
                          done={["interview_scheduled", "offered"].includes(
                            latestApp.status,
                          )}
                        />
                        <StatusStep
                          label="Interview"
                          active={["interview_scheduled", "offered"].includes(
                            latestApp.status,
                          )}
                          done={["offered"].includes(latestApp.status)}
                        />
                      </div>

                      {latestApp.status === "interview_scheduled" && (
                        <button
                          onClick={() =>
                            latestApp.interviews?.[0]?.meeting_link &&
                            window.open(
                              latestApp.interviews[0].meeting_link,
                              "_blank",
                            )
                          }
                          className="w-full mt-4 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                        >
                          <Video className="h-4 w-4" />
                          Enter Interview Protocol
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[2.5rem] p-10 border-2 border-dashed border-slate-200 text-center space-y-6 hover:border-indigo-300 transition-colors group">
                  <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-indigo-50 transition-colors">
                    <Briefcase className="h-8 w-8 text-slate-300 group-hover:text-indigo-400" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-slate-900 uppercase italic">
                      Role Inventory Empty
                    </h4>
                    <p className="text-slate-500 text-xs font-medium max-w-xs mx-auto">
                      Your signals are live, but no active applications
                      detected. Start a new mission.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      router.push("/dashboard/candidate/community")
                    }
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
                  >
                    Explore Opportunities
                  </button>
                </div>
              )}
            </div>

            {/* Score Breakdown */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-slate-200" />
                Signal Calibration
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <ScoreTile
                  label="Technical Proficiency"
                  score={scores.skill}
                  icon={<Briefcase className="h-4 w-4" />}
                />
                <ScoreTile
                  label="Behavioral Dynamic"
                  score={scores.behavioral}
                  icon={<Target className="h-4 w-4" />}
                />
                <ScoreTile
                  label="Psychometric Depth"
                  score={scores.psychometric}
                  icon={<Zap className="h-4 w-4" />}
                />
                <ScoreTile
                  label="Integrity Check"
                  score={scores.resume}
                  icon={<ShieldCheck className="h-4 w-4" />}
                />
              </div>
            </div>
          </div>

          {/* LLM Feedback Section */}
          <div className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden relative">
            <div className="relative z-10 space-y-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 uppercase italic flex items-center gap-4">
                  <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  AI Intelligence <span className="text-slate-300">/</span>{" "}
                  Feedback
                </h3>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest">
                  Live Analysis
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <FeedbackItem
                  title="Decision Logic"
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
            {/* Decorative BG */}
            <div className="absolute -bottom-10 -right-10 text-[180px] font-black text-slate-50 select-none opacity-50 italic">
              TF
            </div>
          </div>
        </div>
      )}
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
}

function ScoreTile({
  label,
  score,
  icon,
}: {
  label: string;
  score: number | undefined;
  icon: React.ReactNode;
}) {
  const hasData = score !== undefined && score !== null;
  return (
    <div
      className={`bg-white p-5 rounded-4xl border transition-all duration-300 group ${
        hasData
          ? "border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5"
          : "border-slate-100 opacity-60"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
              hasData
                ? "bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500"
                : "bg-slate-50 text-slate-300"
            }`}
          >
            {icon}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">
            {label}
          </span>
        </div>
        <span className="text-sm font-black text-slate-900 italic">
          {hasData ? `${score}%` : "--"}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
        <div
          className="h-full bg-indigo-600 transition-all duration-1500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
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
    <div className="space-y-4 group">
      <div className="flex items-center gap-3">
        <h4 className="font-black text-slate-900 text-sm uppercase italic tracking-tight group-hover:text-indigo-600 transition-colors">
          {title}
        </h4>
        <span className="text-[8px] font-black uppercase bg-slate-50 text-slate-400 border border-slate-100 px-2 py-0.5 rounded-md tracking-widest">
          {status}
        </span>
      </div>
      <p className="text-slate-500 text-xs leading-relaxed font-semibold">
        {desc}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color = "text-slate-900",
  unit = "",
  trend = "",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
  unit?: string;
  trend?: string;
}) {
  return (
    <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-5">
        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors duration-300">
          <div className="text-slate-300 group-hover:text-indigo-500 transition-colors duration-300">
            {icon}
          </div>
        </div>
        {trend && (
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-baseline gap-1">
          <span
            className={`text-3xl font-black italic tracking-tighter ${color}`}
          >
            {value}
          </span>
          {unit && (
            <span className="text-sm font-black text-slate-300">{unit}</span>
          )}
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block group-hover:text-slate-600 transition-colors">
          {label}
        </span>
      </div>
    </div>
  );
}

function LockStepCard({
  title,
  description,
  status,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: {
  title: string;
  description: string;
  status: "verified" | "incomplete";
  actionLabel: string;
  onAction: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}) {
  const isVerified = status === "verified";

  return (
    <div
      className={`p-10 rounded-[3rem] border flex flex-col items-center text-center space-y-8 transition-all duration-500 hover:-translate-y-2 ${
        isVerified
          ? "bg-white border-slate-100 opacity-60"
          : "bg-white border-slate-200 shadow-2xl shadow-slate-200/50 scale-105 z-10"
      }`}
    >
      <div
        className={`h-20 w-20 rounded-4xl flex items-center justify-center transition-transform duration-500 ${
          isVerified
            ? "bg-emerald-50 text-emerald-500"
            : "bg-amber-50 text-amber-500 animate-pulse"
        }`}
      >
        {isVerified ? (
          <CheckCircle2 className="h-10 w-10" />
        ) : (
          <ShieldCheck className="h-10 w-10" />
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight italic">
          {title}
        </h3>
        <p className="text-slate-500 text-[11px] font-semibold leading-relaxed">
          {description}
        </p>
      </div>

      {isVerified ? (
        <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-100">
          <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Synchronized
        </div>
      ) : (
        <div className="w-full space-y-4">
          <button
            onClick={onAction}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-indigo-200/20"
          >
            {actionLabel}
          </button>
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StatusStep({
  label,
  active,
  done,
}: {
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-300 ${
        active
          ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10"
          : "bg-white border-slate-100 text-slate-400 opacity-60"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors ${
            done
              ? "bg-emerald-500 text-white"
              : active
                ? "bg-white text-slate-900"
                : "bg-slate-50 text-slate-300"
          }`}
        >
          {done ? <CheckCircle2 className="h-4 w-4" /> : "•"}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">
          {label}
        </span>
      </div>
    </div>
  );
}
