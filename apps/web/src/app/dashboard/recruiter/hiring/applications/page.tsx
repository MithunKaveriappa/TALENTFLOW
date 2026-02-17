"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Briefcase,
  Search,
  CheckCircle2,
  XCircle,
  Filter,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Target,
  Zap,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import RecruiterSidebar from "@/components/RecruiterSidebar";
import RejectionModal from "@/components/RejectionModal";
import ApplicationHistoryModal from "@/components/ApplicationHistoryModal";

interface Application {
  id: string;
  status: string;
  feedback: string | null;
  created_at: string;
  job_id: string;
  candidate_id: string;
  jobs: {
    id: string;
    title: string;
    status: string;
  };
  candidate_profiles: {
    user_id: string;
    full_name: string;
    current_role: string | null;
    years_of_experience: number | null;
  };
  profile_scores?: {
    final_score: number;
  } | null;
  is_skill_match?: boolean;
}

interface GroupedApplications {
  [jobId: string]: {
    jobTitle: string;
    jobStatus: string;
    applications: Application[];
  };
}

export default function ApplicationsPipelinePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [historyModal, setHistoryModal] = useState<{ isOpen: boolean; appId: string; name: string }>({
    isOpen: false,
    appId: "",
    name: "",
  });
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({});

  const fetchApplications = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      const [data, profileData] = await Promise.all([
        apiClient.get("/recruiter/applications/pipeline", session.access_token),
        apiClient.get("/recruiter/profile", session.access_token)
      ]);
      setApplications(data || []);
      setProfile(profileData);
      
      // Initialize expanded state for all jobs
      const jobs = Array.from(new Set((data || []).map((a: any) => a.job_id)));
      const expanded: Record<string, boolean> = {};
      jobs.forEach((id: any) => expanded[id] = true);
      setExpandedJobs(expanded);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const toggleSelect = (id: string) => {
    setSelectedApps((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleJobExpansion = (jobId: string) => {
    setExpandedJobs(prev => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  const handleBulkStatusChange = async (status: string, feedback?: string) => {
    if (selectedApps.length === 0) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      await apiClient.post(
        "/recruiter/applications/bulk-status",
        {
          application_ids: selectedApps,
          status,
          feedback,
        },
        session.access_token,
      );

      setIsRejectionModalOpen(false);
      setSelectedApps([]);
      fetchApplications();
    } catch (err) {
      console.error("Failed to update statuses:", err);
    }
  };

  // Grouping logic
  const groupedApps: GroupedApplications = applications.reduce((acc, app) => {
    const jobId = app.job_id;
    if (!acc[jobId]) {
      acc[jobId] = {
        jobTitle: app.jobs.title,
        jobStatus: app.jobs.status,
        applications: [],
      };
    }
    acc[jobId].applications.push(app);
    return acc;
  }, {} as GroupedApplications);

  // Sorting within groups by Skill Match first, then Match Score
  Object.values(groupedApps).forEach(group => {
    group.applications.sort((a: any, b: any) => {
      // Priority 1: Skill Match
      if (a.is_skill_match && !b.is_skill_match) return -1;
      if (!a.is_skill_match && b.is_skill_match) return 1;
      
      // Priority 2: Match Score
      const scoreA = a.profile_scores?.final_score || 0;
      const scoreB = b.profile_scores?.final_score || 0;
      return scoreB - scoreA;
    });
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 rounded-3xl bg-white border border-slate-200 flex items-center justify-center shadow-xl">
              <div className="h-8 w-8 rounded-full border-4 border-slate-900 border-t-transparent animate-spin" />
            </div>
          </div>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">
            Loading Pipeline...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30">
      {/* Top Navigation Bar */}
      <header className="bg-white/80 border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-20 w-full backdrop-blur-md text-black">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Pipeline Active
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
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate Tracking</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                Acquisition <span className="text-indigo-600">Pipeline</span>
              </h1>
            </div>

            {selectedApps.length > 0 && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500 bg-white p-2 ml-auto rounded-2xl border border-slate-200 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.1)]">
                <div className="px-6">
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">
                    {selectedApps.length} Selected
                  </span>
                </div>
                <button
                  disabled={!applications.filter(a => selectedApps.includes(a.id)).every(a => a.status === 'applied')}
                  onClick={() => handleBulkStatusChange("shortlisted")}
                  className="bg-indigo-600 text-white font-black py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 hover:bg-black transition-all flex items-center gap-2 disabled:opacity-20 uppercase text-[9px] tracking-widest"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Shortlist
                </button>
                <button
                  onClick={() => setIsRejectionModalOpen(true)}
                  className="bg-red-50 text-red-600 font-black py-3 px-8 rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 uppercase text-[9px] tracking-widest"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
              </div>
            )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <input
              type="text"
              placeholder="SEARCH CANDIDATES, SKILLS, OR ROLES..."
              className="w-full pl-15 pr-6 py-5 bg-white border border-slate-200 rounded-3xl text-[11px] font-bold text-slate-900 uppercase tracking-[0.2em] placeholder:text-slate-200 focus:ring-8 focus:ring-slate-50 outline-none transition-all shadow-sm"
            />
          </div>
          <button className="px-10 py-5 bg-white border border-slate-200 rounded-3xl text-slate-900 font-black text-[10px] uppercase tracking-widest hover:border-slate-900 transition-all flex items-center gap-4 shadow-sm group">
            <Filter className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
            Filters
          </button>
        </div>

        {/* Pipeline Groups */}
        {Object.keys(groupedApps).length === 0 ? (
          <div className="bg-white rounded-4xl p-24 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No candidates yet</h3>
            <p className="text-slate-400 text-sm font-medium mb-8 max-w-sm mx-auto">
              The pipeline is waiting. Try boosting your job visibility or sourcing candidates directly.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedApps).map(([jobId, group]) => (
              <div key={jobId} className="bg-white rounded-5xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-[0_40px_80px_-15px_rgba(15,23,42,0.1)] mb-8">
                {/* Job Header */}
                <div 
                  onClick={() => toggleJobExpansion(jobId)}
                  className="p-10 bg-slate-50/50 cursor-pointer flex items-center justify-between group border-b border-slate-100"
                >
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-white rounded-4xl shadow-sm flex items-center justify-center border border-slate-200 group-hover:bg-slate-900 transition-all duration-500 group-hover:rotate-6">
                      <Briefcase className="h-7 w-7 text-slate-900 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
                        {group.jobTitle}
                      </h2>
                      <div className="flex items-center gap-6 mt-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                          {group.applications.length} APPLICANTS
                        </span>
                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${group.jobStatus === 'active' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                          {group.jobStatus}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl transition-all ${expandedJobs[jobId] ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-300 border border-slate-100'}`}>
                    {expandedJobs[jobId] ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                  </div>
                </div>

                {/* Applicants List */}
                {expandedJobs[jobId] && (
                  <div className="divide-y divide-slate-100 bg-white">
                    {group.applications.map((app) => (
                      <div key={app.id} className={`p-8 hover:bg-slate-50/40 transition-all flex items-center justify-between group/row border-b border-slate-50 relative ${app.is_skill_match ? 'overflow-hidden' : ''}`}>
                        {app.is_skill_match && (
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)]" />
                        )}
                        <div className="flex items-center gap-8 relative z-10">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={selectedApps.includes(app.id)}
                                onChange={() => toggleSelect(app.id)}
                                className="h-6 w-6 rounded-[10px] border-2 border-slate-200 text-slate-900 focus:ring-slate-900/10 transition-all cursor-pointer accent-slate-900"
                              />
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-xl font-black text-slate-900 group-hover/row:scale-110 transition-transform duration-500">
                                {(app.candidate_profiles?.full_name || "?").charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-3 mb-1.5">
                                  <h4 className="font-black text-slate-900 text-lg tracking-tighter uppercase italic">
                                    {app.candidate_profiles?.full_name || "Anonymous Candidate"}
                                  </h4>
                                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-widest ${
                                    app.status === 'applied' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                    app.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                    'bg-slate-100 text-slate-500 border border-slate-200'
                                  }`}>
                                    {app.status}
                                  </span>
                                  {app.is_skill_match && (
                                    <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-widest bg-slate-900 text-white shadow-xl flex items-center gap-1.5">
                                      <Zap className="h-3 w-3" />
                                      Elite Match
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  {app.candidate_profiles?.current_role || "Role Undisclosed"}
                                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                                  {app.candidate_profiles?.years_of_experience || 0} Years Exp.
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-12">
                            <div className="text-right">
                              <div className="flex items-center gap-2 justify-end mb-1">
                                <Target className="h-3 w-3 text-indigo-600" />
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Aptitude Score</span>
                              </div>
                              <div className="text-2xl font-black text-slate-900 tracking-tighter">
                                {app.profile_scores?.final_score || 0}%
                              </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover/row:opacity-100 transition-all translate-x-4 group-hover/row:translate-x-0">
                              <button
                                onClick={() => setHistoryModal({ 
                                  isOpen: true, 
                                  appId: app.id, 
                                  name: app.candidate_profiles?.full_name || "Candidate"
                                })}
                                className="p-3 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200 hover:shadow-xl text-slate-400 hover:text-slate-900"
                                title="Audit Trail"
                              >
                                <Clock className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => router.push(`/dashboard/recruiter/intelligence/search/${app.candidate_id}`)}
                                className="p-3 hover:bg-slate-900 rounded-xl transition-all border border-transparent hover:border-slate-800 shadow-sm text-slate-400 hover:text-white"
                                title="Candidate Intel"
                              >
                                <ExternalLink className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

      <RejectionModal
        isOpen={isRejectionModalOpen}
        onClose={() => setIsRejectionModalOpen(false)}
        onConfirm={(reason) => handleBulkStatusChange("rejected", reason)}
        count={selectedApps.length}
      />

      <ApplicationHistoryModal
        isOpen={historyModal.isOpen}
        onClose={() => setHistoryModal({ ...historyModal, isOpen: false })}
        applicationId={historyModal.appId}
        candidateName={historyModal.name}
      />
    </div>
  );
}
