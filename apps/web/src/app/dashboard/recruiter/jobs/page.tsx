"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Settings,
  Clock,
  MapPin,
  Building2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import RecruiterSidebar from "@/components/RecruiterSidebar";

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
  const [profile, setProfile] = useState<{
    assessment_status?: string;
    full_name?: string;
    is_verified?: boolean;
  } | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/login");
          return;
        }

        const [jobsData, profileData] = await Promise.all([
          apiClient.get("/recruiter/jobs", session.access_token),
          apiClient.get("/recruiter/profile", session.access_token),
        ]);
        setJobs(jobsData);
        setProfile(profileData);
      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <RecruiterSidebar assessmentStatus={profile?.assessment_status} />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10 w-full">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <div
                className={`w-2 h-2 rounded-full ${
                  profile?.is_verified ? "bg-green-500" : "bg-amber-500"
                } animate-pulse`}
              />
              <span className="text-sm font-medium text-slate-600">
                Hub Status: {profile?.is_verified ? "Active" : "Pending Sync"}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200">
              {profile?.full_name?.[0] || "R"}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm active:scale-95 ml-2"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="p-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                My Jobs
              </h1>
              <p className="text-slate-500 mt-2 font-medium">
                Manage and track your published opportunities
              </p>
            </div>
            <Link
              href="/dashboard/recruiter/jobs/new"
              className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100 font-medium active:scale-95"
            >
              <Plus className="w-5 h-5 mr-1.5" />
              Post New Role
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {jobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-slate-200">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">
                  No active postings
                </h3>
                <p className="text-slate-500 mb-6">
                  Start growing your team by posting your first role.
                </p>
                <Link
                  href="/dashboard/recruiter/jobs/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post First Job
                </Link>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-50 transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            job.status === "active"
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : job.status === "paused"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-slate-50 text-slate-700 border border-slate-100"
                          }`}
                        >
                          {job.status.toUpperCase()}
                        </span>
                        <span className="text-xs font-medium text-slate-400 flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>

                      <div className="flex items-center space-x-4 text-sm font-medium text-slate-500">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                          {job.location}
                        </span>
                        <span className="flex items-center border-l border-slate-200 pl-4">
                          <Building2 className="w-4 h-4 mr-1.5 text-slate-400" />
                          {job.job_type}
                        </span>
                        <span className="flex items-center border-l border-slate-200 pl-4 text-blue-600">
                          {job.number_of_positions}{" "}
                          {job.number_of_positions === 1
                            ? "Open Role"
                            : "Open Roles"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {job.status === "active" ? (
                        <button
                          onClick={() => updateJobStatus(job.id, "paused")}
                          className="px-4 py-2 text-sm font-bold text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => updateJobStatus(job.id, "active")}
                          className="px-4 py-2 text-sm font-bold text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          Activate
                        </button>
                      )}

                      <button
                        onClick={() => updateJobStatus(job.id, "closed")}
                        className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Close
                      </button>

                      <button className="p-2 text-slate-400 hover:text-slate-900">
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

