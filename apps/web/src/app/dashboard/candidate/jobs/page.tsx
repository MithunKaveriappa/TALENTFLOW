"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import {
  Zap,
  Target,
  Clock,
  MapPin,
  Briefcase,
  Pin,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Filter,
  Search,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  experience_band: string;
  location: string;
  salary_range: string;
  job_type: string;
  company_name: string;
  company_website?: string;
  created_at: string;
  has_applied: boolean;
}

export default function CandidateJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [assessmentStatus, setAssessmentStatus] =
    useState<string>("not_started");

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        const [jobsData, statsData] = await Promise.all([
          apiClient.get("/candidate/jobs", session.access_token),
          apiClient.get("/candidate/stats", session.access_token),
        ]);

        setJobs(jobsData);
        setAssessmentStatus(statsData.assessment_status);
      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  const handleApply = async (jobId: string) => {
    setApplying(jobId);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      await apiClient.post(
        `/candidate/jobs/${jobId}/apply`,
        {},
        session.access_token,
      );

      // Update local state
      setJobs(
        jobs.map((j) => (j.id === jobId ? { ...j, has_applied: true } : j)),
      );
    } catch (err) {
      console.error("Application failed:", err);
    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">
          Scanning Market Signals...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4 italic uppercase">
              Open <span className="text-indigo-600">Signals</span>
            </h1>
            <div className="px-2 py-0.5 bg-indigo-100/50 text-indigo-700 text-[9px] font-black uppercase tracking-widest rounded-md border border-indigo-200/50">
              Live Feed
            </div>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Elite roles currently matching the TalentFlow ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="FILTER TRANSMISSIONS..."
              className="pl-11 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all w-64 shadow-sm placeholder:text-slate-300"
            />
          </div>
          <button className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {jobs.length === 0 ? (
          <div className="bg-white rounded-4xl p-24 text-center border border-slate-200 border-dashed flex flex-col items-center justify-center">
            <div className="h-20 w-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-slate-100">
              <Zap className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight italic">
              Transmission Silent
            </h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] max-w-xs leading-relaxed">
              No active signals currently intersect with your profile metadata.
            </p>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="flex flex-col lg:flex-row justify-between items-start gap-10 relative z-10">
                <div className="flex-1 space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 shadow-lg shadow-slate-900/10">
                        <TrendingUp className="h-3 w-3 text-indigo-400" />
                        {job.company_name}
                      </div>
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        POSTED {new Date(job.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors leading-none italic">
                      {job.title}
                    </h2>

                    <div className="flex flex-wrap gap-2.5">
                      <SignalBadge
                        icon={<Target className="h-3 w-3" />}
                        label={job.experience_band}
                      />
                      <SignalBadge
                        icon={<Briefcase className="h-3 w-3" />}
                        label={job.job_type}
                      />
                      <SignalBadge
                        icon={<MapPin className="h-3 w-3" />}
                        label={job.location || "Remote"}
                      />
                      <SignalBadge
                        icon={<Sparkles className="h-3 w-3 text-indigo-400" />}
                        label={job.salary_range || "Competitive Signal"}
                        highlight
                      />
                    </div>
                  </div>

                  <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-2xl">
                    {job.description}
                  </p>

                  <div className="flex items-center gap-4 pt-2">
                    <button className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors bg-indigo-50/50 px-4 py-2 rounded-xl group/link">
                      VIEW FULL SPECS
                      <ChevronRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                      <Pin className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 shrink-0 sm:self-center lg:self-start pt-2">
                  <div className="relative group/btn">
                    <button
                      disabled={
                        job.has_applied ||
                        applying === job.id ||
                        assessmentStatus !== "completed"
                      }
                      onClick={() => handleApply(job.id)}
                      className={`min-w-44 h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 active:scale-95 relative z-10 ${
                        job.has_applied
                          ? "bg-emerald-50 text-emerald-600 cursor-default border border-emerald-100"
                          : assessmentStatus !== "completed"
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                            : "bg-indigo-600 text-white hover:bg-slate-900 shadow-2xl shadow-indigo-200/50 hover:shadow-indigo-500/20"
                      }`}
                    >
                      {applying === job.id ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white/20 border-b-white rounded-full" />
                          SYNCING...
                        </>
                      ) : job.has_applied ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          TRANSMITTED
                        </>
                      ) : assessmentStatus !== "completed" ? (
                        <>
                          <Lock className="h-4 w-4 mb-0.5" />
                          LOCKED
                        </>
                      ) : (
                        "INITIALIZE MATCH"
                      )}
                    </button>
                    {assessmentStatus === "completed" && !job.has_applied && (
                      <div className="absolute -inset-1 bg-indigo-600/20 rounded-2xl blur-lg opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    )}
                  </div>

                  {assessmentStatus !== "completed" && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[8px] font-black text-amber-700 uppercase tracking-widest">
                        Awaiting Sync
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SignalBadge({
  label,
  icon,
  highlight,
}: {
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
        highlight
          ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-100"
          : "bg-slate-50 text-slate-500 border-slate-100"
      }`}
    >
      {icon}
      {label}
    </div>
  );
}
