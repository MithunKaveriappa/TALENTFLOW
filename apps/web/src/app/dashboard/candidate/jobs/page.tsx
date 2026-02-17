"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import CandidateSidebar from "@/components/CandidateSidebar";

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <CandidateSidebar assessmentStatus={assessmentStatus} />

      <main className="flex-1 ml-64 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
              Open Signals
            </h1>
            <p className="text-slate-500 font-medium">
              Elite roles currently matching the TalentFlow ecosystem.
            </p>
          </header>

          <div className="space-y-6">
            {jobs.length === 0 ? (
              <div className="bg-white p-12 rounded-4xl text-center border border-slate-100">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                  No active signals found.
                </p>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-2 py-1 rounded">
                          {job.company_name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                        {job.title}
                      </h2>
                      <div className="flex flex-wrap gap-4 mb-4">
                        <SignalBadge label={job.experience_band} />
                        <SignalBadge label={job.job_type} />
                        <SignalBadge label={job.location || "Remote"} />
                        <SignalBadge
                          label={job.salary_range || "Competitive"}
                        />
                      </div>
                      <p className="text-slate-600 font-medium line-clamp-2">
                        {job.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <button
                        disabled={
                          job.has_applied ||
                          applying === job.id ||
                          assessmentStatus !== "completed"
                        }
                        onClick={() => handleApply(job.id)}
                        className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95 ${
                          job.has_applied
                            ? "bg-slate-100 text-slate-400 cursor-default"
                            : assessmentStatus !== "completed"
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                        }`}
                      >
                        {applying === job.id
                          ? "Syncing..."
                          : job.has_applied
                            ? "Applied"
                            : assessmentStatus !== "completed"
                              ? "LOCKED"
                              : "Apply Now"}
                      </button>
                      {assessmentStatus !== "completed" && (
                        <span className="text-[8px] font-bold text-amber-600 uppercase tracking-widest text-center max-w-30">
                          Complete assessment to unlock applications
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function SignalBadge({ label }: { label: string }) {
  return (
    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
      {label}
    </span>
  );
}
