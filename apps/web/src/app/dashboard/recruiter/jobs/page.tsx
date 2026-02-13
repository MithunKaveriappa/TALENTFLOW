"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

interface Job {
  id: string;
  title: string;
  description: string;
  status: "active" | "closed" | "paused";
  experience_band: string;
  job_type: string;
  location: string;
  number_of_positions: number;
  created_at: string;
}

export default function JobsManagement() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    async function loadJobs() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        const jobsData = await apiClient.get(
          "/recruiter/jobs",
          session.access_token,
        );
        setJobs(jobsData);
      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, [router]);

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      await apiClient.patch(
        `/recruiter/jobs/${jobId}`,
        { status: newStatus },
        session.access_token,
      );
      setJobs(
        jobs.map((j) =>
          j.id === jobId ? { ...j, status: newStatus as Job["status"] } : j,
        ),
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
            Loading Jobs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - Consistent with other recruiter pages */}
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
          <SidebarLink label="My Jobs" active />
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
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group"
          >
            <span className="text-sm font-bold uppercase tracking-widest">
              Logout
            </span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-end mb-12">
            <div>
              <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.2em] mb-2">
                Inventory
              </p>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Active Job Postings
              </h1>
            </div>
            <button
              onClick={() => router.push("/dashboard/recruiter/jobs/new")}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              Post New Role
            </button>
          </header>

          <div className="grid grid-cols-1 gap-6">
            {jobs.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm italic">
                  No jobs found. Start by posting a new role.
                </p>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xs hover:shadow-lg transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                            job.status === "active"
                              ? "bg-emerald-50 text-emerald-600"
                              : job.status === "paused"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          {job.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Created{" "}
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                        {job.title}
                      </h3>
                      <p className="text-slate-500 font-medium mb-4 flex items-center gap-2">
                        {job.experience_band} • {job.job_type} • {job.location}
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-600 ml-2">
                          {job.number_of_positions}{" "}
                          {job.number_of_positions === 1
                            ? "Position"
                            : "Positions"}
                        </span>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {job.status === "active" ? (
                        <button
                          onClick={() => updateJobStatus(job.id, "paused")}
                          className="px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50"
                        >
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => updateJobStatus(job.id, "active")}
                          className="px-4 py-2 border border-emerald-200 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50"
                        >
                          Activate
                        </button>
                      )}

                      <button
                        onClick={() => updateJobStatus(job.id, "closed")}
                        className="px-4 py-2 border border-red-100 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50"
                      >
                        Close
                      </button>
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
