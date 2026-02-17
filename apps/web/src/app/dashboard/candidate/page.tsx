"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CandidateSidebar from "@/components/CandidateSidebar";
import { TermsModal } from "@/components/TermsModal";
import { 
  CheckCircle2, 
  Video, 
  ArrowRight,
  Target
} from "lucide-react";

interface LatestApplication {
  id: string;
  status: string;
  jobs?: {
    title: string;
    companies?: {
      name: string;
      logo_url?: string;
    }
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

        const [resultsData, statsData, appData] = await Promise.all([
          apiClient.get("/assessment/results", authSession.access_token),
          apiClient.get("/candidate/stats", authSession.access_token),
          apiClient.get("/candidate/latest-application", authSession.access_token),
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
    <div className="flex min-h-screen bg-slate-50">
      <CandidateSidebar assessmentStatus={stats?.assessment_status} />

      <main className="flex-1 ml-64 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {isLocked ? (
            <div className="max-w-4xl mx-auto py-12">
            <header className="mb-12">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic mb-2">
                Command Center Locked
              </h1>
              <p className="text-slate-500 font-medium uppercase tracking-[0.2em] text-[10px]">
                Complete all synchronization signals to unlock transmission.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                onAction={() => router.push("/onboarding/candidate?target=AWAITING_ID")}
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

            <div className="mt-12 bg-indigo-50 border border-indigo-100 p-8 rounded-4xl flex items-center gap-6">
              <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-black text-indigo-900 uppercase tracking-tight text-sm mb-1">
                  Why is my dashboard locked?
                </h4>
                <p className="text-indigo-700/70 text-xs font-medium leading-relaxed">
                  To maintain a high-trust hiring ecosystem, we require all
                  candidates to verify their identity and complete a baseline
                  performance evaluation before matching with recruiters.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-12">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase italic">
                  Command Center
                </h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
                  Session: Live Transmission
                </p>
              </div>
              <div className="flex items-end gap-8">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Profile Strength
                  </span>
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        stats?.profile_strength === "Elite"
                          ? "bg-purple-500"
                          : stats?.profile_strength === "Strong"
                            ? "bg-emerald-500"
                            : stats?.profile_strength === "Moderate"
                              ? "bg-indigo-500"
                              : "bg-slate-400"
                      }`}
                    />
                    {stats?.profile_strength?.toUpperCase() || "LOW"}
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

            {/* Application Roadmap (Status-Specific) */}
            {latestApp ? (
              <section className="bg-white rounded-5xl border border-slate-200 p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    latestApp.status === 'recommended' ? 'bg-blue-50 text-blue-600' :
                    latestApp.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-slate-50 text-slate-500'
                  }`}>
                    {latestApp.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row gap-10 items-start">
                  <div className="h-20 w-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl shrink-0 overflow-hidden relative">
                    {latestApp.jobs?.companies?.logo_url ? (
                        <Image 
                          src={latestApp.jobs.companies.logo_url} 
                          alt={latestApp.jobs.companies.name || "Company Logo"}
                          fill
                          className="object-contain p-4" 
                        />
                    ) : (
                        <span className="text-slate-300">🏢</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                       {latestApp.status === 'interview_scheduled' ? 'Action Required: Interview Protocol' : 
                        latestApp.status === 'shortlisted' ? 'Transmission Success: Shortlisted' :
                        'Application Synchronized'}
                    </h2>
                    <p className="text-slate-500 font-medium mb-6">
                        {latestApp.jobs?.title} at <span className="text-slate-900 font-bold">{latestApp.jobs?.companies?.name}</span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatusStep 
                            label="Applied" 
                            active={['applied', 'recommended', 'shortlisted', 'invited', 'interview_scheduled', 'offered'].includes(latestApp.status)} 
                            done={['shortlisted', 'invited', 'interview_scheduled', 'offered'].includes(latestApp.status)}
                        />
                        <StatusStep 
                            label="Shortlisted" 
                            active={['shortlisted', 'invited', 'interview_scheduled', 'offered'].includes(latestApp.status)} 
                            done={['interview_scheduled', 'offered'].includes(latestApp.status)}
                        />
                        <StatusStep 
                            label="Interview" 
                            active={['interview_scheduled', 'offered'].includes(latestApp.status)} 
                            done={['offered'].includes(latestApp.status)}
                        />
                    </div>
                  </div>
                </div>

                {/* Conditional Call to Action */}
                {latestApp.status === 'interview_scheduled' && (
                  <div className="mt-10 p-6 bg-blue-600 rounded-3xl text-white flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-blue-200 animate-in fade-in slide-in-from-bottom-4">
                    <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                      <Video className="h-6 w-6" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Upcoming Virtual Sync</p>
                      <h4 className="text-lg font-bold">Jitsu Meeting Link is Active</h4>
                    </div>
                    {latestApp.interviews?.[0]?.meeting_link && (
                        <a 
                            href={latestApp.interviews[0].meeting_link} 
                            target="_blank"
                            className="bg-white text-blue-600 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                        >
                            Enter Room
                            <ArrowRight className="h-4 w-4" />
                        </a>
                    )}
                  </div>
                )}
              </section>
            ) : (
              <section className="bg-slate-900 rounded-[2.5rem] p-12 text-white overflow-hidden relative shadow-2xl">
                <div className="relative z-10">
                    <h2 className="text-3xl font-black tracking-tight mb-4 uppercase italic">No Active Missions</h2>
                    <p className="text-blue-300/80 max-w-md font-medium text-sm leading-relaxed">Your profile signals are live, but you haven&apos;t applied to any roles yet. Start exploring calibrated matches in the pool.</p>
                    <button 
                        onClick={() => router.push('/dashboard/candidate/community')}
                        className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-95 flex items-center gap-2"
                    >
                        Explore Elite Pool
                        <Target className="h-4 w-4" />
                    </button>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 bg-blue-600/20 blur-[100px] rounded-full" />
              </section>
            )}

            {/* Global Score Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="space-y-6 text-center md:text-left">
                  <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                    Aggregate Talent Score
                  </span>
                  <div className="space-y-1">
                    <h2 className="text-7xl md:text-9xl font-black tracking-tighter">
                      {results?.overall_score || 0}
                    </h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                      Percentile Score / 100
                    </p>
                  </div>
                  <p className="text-slate-300 max-w-sm text-sm leading-relaxed font-medium">
                    Your profile indicates{" "}
                    <span className="text-indigo-400 font-bold">
                      {(results?.overall_score ?? 0) >= 70
                        ? "High-Fit"
                        : (results?.overall_score ?? 0) >= 40
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
                        264 - (264 * (results?.overall_score || 0)) / 100
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

            {/* Signal Calibration Alerts */}
            {(scores.behavioral === 0 || scores.psychometric === 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-4xl p-8 flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                    <Target className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="text-amber-900 font-black uppercase tracking-tight italic">DNA Calibration Required</h4>
                    <p className="text-amber-700/80 text-sm font-medium">To unlock chat and increase marketplace visibility, complete your mandatory assessments.</p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/dashboard/candidate/assessment')}
                  className="bg-amber-900 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all active:scale-95 shrink-0"
                >
                  Start Now
                </button>
              </div>
            )}

            {/* Signal Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ScoreTile label="Technical Skill" score={scores.skill} />
              <ScoreTile label="Behavioral" score={scores.behavioral} />
              <ScoreTile label="Resume Signal" score={scores.resume} />
              <ScoreTile label="Psychometric" score={scores.psychometric} />
            </div>

            {/* Engagement Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard
                label="Apps"
                value={stats?.applications_count || 0}
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                }
              />
              <StatCard
                label="Shortlisted"
                value={stats?.shortlisted_count || 0}
                color="text-emerald-500"
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                }
              />
              <StatCard
                label="Invites"
                value={stats?.invites_received || 0}
                color="text-indigo-500"
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                }
              />
              <StatCard
                label="Saved"
                value={stats?.saved_jobs_count || 0}
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                }
              />
              <StatCard
                label="Posts"
                value={stats?.posts_count || 0}
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                }
              />
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
        </div>
      </main>
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
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

function StatCard({
  label,
  value,
  icon,
  color = "text-slate-900",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all group flex flex-col items-center text-center">
      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
        <svg
          className="h-5 w-5 text-slate-400 group-hover:text-indigo-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {icon}
        </svg>
      </div>
      <span className={`text-2xl font-black italic mb-1 ${color}`}>
        {value}
      </span>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </span>
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
      className={`p-8 rounded-[2.5rem] border flex flex-col items-center text-center space-y-6 transition-all ${
        isVerified
          ? "bg-white border-slate-100 opacity-60"
          : "bg-white border-slate-200 shadow-xl shadow-slate-200/50 scale-105 z-10"
      }`}
    >
      <div
        className={`h-16 w-16 rounded-2xl flex items-center justify-center ${
          isVerified
            ? "bg-emerald-50 text-emerald-500"
            : "bg-amber-50 text-amber-500"
        }`}
      >
        {isVerified ? (
          <svg
            className="h-8 w-8"
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
        ) : (
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </div>

      <div>
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-slate-500 text-xs font-medium leading-relaxed">
          {description}
        </p>
      </div>

      {isVerified ? (
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full">
          <div className="h-1 w-1 bg-emerald-500 rounded-full" />
          Verified
        </div>
      ) : (
        <div className="w-full space-y-3">
          <button
            onClick={onAction}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            {actionLabel}
          </button>
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StatusStep({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      active 
        ? 'bg-slate-900 border-slate-900 text-white' 
        : 'bg-white border-slate-100 text-slate-400 opacity-60'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${
          done ? 'bg-emerald-500 text-white' : 
          active ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-400'
        }`}>
          {done ? <CheckCircle2 className="h-4 w-4" /> : '•'}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
    </div>
  );
}
