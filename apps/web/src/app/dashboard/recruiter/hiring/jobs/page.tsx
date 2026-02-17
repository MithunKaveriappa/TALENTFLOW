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
  Users,
  ChevronRight,
  Search,
  Filter,
  ArrowUpRight,
  ArrowLeft,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import LockedView from "@/components/dashboard/LockedView";

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
  recruiter_id: string;
  recruiter_profiles?: {
    full_name: string;
    user_id: string;
  };
}

export default function JobsManagement() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    assessment_status?: string;
    full_name?: string;
    is_verified?: boolean;
    user_id?: string;
    team_role?: "admin" | "recruiter";
    companies?: {
      profile_score: number;
    };
  } | null>(null);

  const isLocked = profile && (profile.companies?.profile_score ?? 0) === 0;

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
    <div className="min-h-screen bg-slate-50/30">
      {isLocked ? (
        <div className="p-12 flex justify-center">
          <LockedView featureName="Job Management" />
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Top Navigation Bar */}
          <header className="bg-white/80 border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-20 w-full backdrop-blur-md text-black">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                <div
                  className={`w-2 h-2 rounded-full ${
                    profile?.is_verified ? "bg-green-500" : "bg-amber-500"
                  } animate-pulse`}
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {profile?.is_verified ? "Verified" : "Syncing"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 shadow-sm cursor-pointer group hover:bg-white hover:border-slate-300 transition-all">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-[10px] text-white font-black shadow-lg">
                  {profile?.full_name?.[0] || "R"}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Recruiter</span>
                  <span className="text-xs font-bold text-slate-900">
                    {profile?.full_name}
                  </span>
                </div>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-all active:scale-95"
              >
                Sign Out
              </button>
            </div>
          </header>

          {/* Content Container */}
          <main className="p-8 max-w-5xl mx-auto w-full">
            {/* Action Bar */}
            <div className="flex flex-col mb-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Roles</span>
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                    Jobs Posted
                  </h1>
                </div>
                
                <Link
                  href="/dashboard/recruiter/hiring/jobs/new"
                  className="flex items-center px-8 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/20 font-black text-xs uppercase tracking-widest active:scale-95 group"
                >
                  <Plus className="w-4 h-4 mr-2.5 group-hover:rotate-90 transition-transform duration-300" />
                  Post a Job
                </Link>
              </div>

              <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input 
                     type="text" 
                     placeholder="Search roles by title, department or location..."
                     className="w-full pl-14 pr-4 py-4 bg-transparent text-sm font-bold text-slate-900 placeholder:text-slate-300 outline-none"
                   />
                </div>
                <div className="h-10 w-px bg-slate-100" />
                <button className="flex items-center gap-2 px-6 py-4 hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors group">
                  <Filter className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Filter</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {jobs.length === 0 ? (
                <div className="bg-white rounded-4xl p-24 text-center border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Briefcase className="w-64 h-64 -mr-16 -mt-16" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                      <Briefcase className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2 italic">
                      No Roles Found
                    </h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10 max-w-xs mx-auto">
                      Your talent pipeline is currently dormant. Initialize your first opportunity.
                    </p>
                    <Link
                      href="/dashboard/recruiter/hiring/jobs/new"
                      className="inline-flex items-center px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-900/20 active:scale-95"
                    >
                      Configure New Role
                    </Link>
                  </div>
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="group bg-white rounded-4xl border border-slate-200 hover:border-slate-900 hover:shadow-[0_40px_80px_-15px_rgba(15,23,42,0.1)] transition-all duration-500 overflow-hidden cursor-pointer"
                    onClick={() => router.push(`/dashboard/recruiter/hiring/jobs/${job.id}`)}
                  >
                    <div className="p-8 flex items-center gap-10">
                      {/* Status Icon */}
                      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 transition-all duration-500 relative group-hover:scale-105 ${
                        job.status === 'active' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-slate-50 text-slate-300'
                      }`}>
                         <Briefcase className="w-8 h-8 relative z-10" />
                         {job.status === 'active' && (
                           <div className="absolute inset-0 bg-slate-900 rounded-3xl animate-ping opacity-10" />
                         )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col mb-4">
                          <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${
                            job.status === 'active' ? 'text-indigo-600' : 'text-slate-400'
                          }`}>
                            {job.status} / {job.job_type}
                          </span>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:translate-x-2 transition-transform duration-500 italic uppercase">
                            {job.title}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-3">
                          <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest mr-6">
                            <MapPin className="w-3.5 h-3.5 mr-2 text-slate-300" />
                            {job.location}
                          </div>
                          <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest mr-6 border-l border-slate-100 pl-6">
                            <Clock className="w-3.5 h-3.5 mr-2 text-slate-300" />
                            {job.experience_band}
                          </div>
                          <div className="flex items-center text-indigo-600 text-[10px] font-black uppercase tracking-widest border-l border-slate-100 pl-6">
                             {job.number_of_positions} Slots Open
                          </div>
                        </div>
                      </div>

                      {/* Right Side Actions */}
                      <div className="flex items-center gap-6 pl-10 border-l border-slate-100">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Applications</span>
                          <span className="text-xl font-black text-slate-900">0</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateJobStatus(job.id, job.status === 'active' ? 'paused' : 'active');
                            }}
                            className="p-4 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all active:scale-90 border border-transparent hover:border-slate-100"
                          >
                            <Settings className="w-5 h-5" />
                          </button>
                          <div className="p-4 bg-slate-50 text-slate-900 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                            <ChevronRight className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
