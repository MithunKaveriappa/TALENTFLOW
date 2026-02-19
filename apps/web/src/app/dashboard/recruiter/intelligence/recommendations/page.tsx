"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BrainCircuit,
  Users,
  Search,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Zap,
  Filter,
  LogOut,
  Plus,
  ChevronRight,
  User,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import RecruiterSidebar from "@/components/RecruiterSidebar";
import LockedView from "@/components/dashboard/LockedView";
import CandidateProfileModal from "@/components/CandidateProfileModal";
import JobInviteModal from "@/components/JobInviteModal";
import { toast } from "sonner";

interface Candidate {
  user_id: string;
  full_name: string;
  email?: string;
  current_role: string;
  experience: "fresher" | "mid" | "senior" | "leadership";
  years_of_experience: number;
  culture_match_score: number;
  skills: string[];
  profile_photo_url?: string;
  resume_path?: string;
  identity_verified?: boolean;
  profile_strength?: string;
}

interface RecruiterProfile {
  assessment_status: string;
  companies: {
    profile_score: number;
  };
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [recruiterProfile, setRecruiterProfile] =
    useState<RecruiterProfile | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [filterExperience, setFilterExperience] = useState<string>("all");

  const [profileModal, setProfileModal] = useState<{
    isOpen: boolean;
    candidate: Candidate | null;
    initialTab?: string;
  }>({
    isOpen: false,
    candidate: null,
    initialTab: "resume",
  });

  const [inviteModal, setInviteModal] = useState<{
    isOpen: boolean;
    candidate: Candidate | null;
  }>({
    isOpen: false,
    candidate: null,
  });

  const fetchRecommendations = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      const [recData, profileData, jobsData] = await Promise.all([
        apiClient.get(
          "/recruiter/recommended-candidates",
          session.access_token,
        ),
        apiClient.get("/recruiter/profile", session.access_token),
        apiClient.get("/recruiter/jobs", session.access_token),
      ]);

      setCandidates(recData || []);
      setRecruiterProfile(profileData);
      setJobs(jobsData || []);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      toast.error("Algorithmic Sync Failed: Could not load recommendations");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const handleInviteCandidate = async (
    jobId: string,
    message: string,
    customTitle?: string,
  ) => {
    if (!inviteModal.candidate) return;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      await apiClient.post(
        `/recruiter/candidate/${inviteModal.candidate.user_id}/invite`,
        {
          job_id: jobId,
          message: message,
          custom_role_title: customTitle,
        },
        session.access_token,
      );

      toast.success(`Elite Invite sent to ${inviteModal.candidate.full_name}`);
      setInviteModal({ isOpen: false, candidate: null });
    } catch (err: any) {
      console.error("Failed to invite candidate:", err);
      toast.error(err.message || "Invitation cycle failed");
    }
  };

  const handleViewProfile = async (
    candidate: Candidate,
    tab: string = "resume",
  ) => {
    setIsFetchingProfile(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const fullCandidate = await apiClient.get(
        `/recruiter/candidate/${candidate.user_id}`,
        session.access_token,
      );

      setProfileModal({
        isOpen: true,
        candidate: { ...candidate, ...fullCandidate },
        initialTab: tab,
      });
    } catch (err) {
      console.error("Failed to fetch full candidate details:", err);
      toast.error("Deep Link Error: Could not hydrate talent profile");
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      (c.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.current_role || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.skills?.some((s) =>
        (s || "").toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesFilter =
      filterExperience === "all" || c.experience === filterExperience;
    return matchesSearch && matchesFilter;
  });

  // Group by Match Strength for a more "Recommended" feel
  const tiers = {
    elite: filteredCandidates.filter((c) => c.culture_match_score >= 85),
    strong: filteredCandidates.filter(
      (c) => c.culture_match_score >= 60 && c.culture_match_score < 85,
    ),
    potential: filteredCandidates.filter((c) => c.culture_match_score < 60),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 rounded-3xl bg-white border border-slate-200 flex items-center justify-center shadow-xl">
            <div className="h-8 w-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.4em]">
            Propagating Neural Match...
          </p>
        </div>
      </div>
    );
  }

  const isLocked = (recruiterProfile?.companies?.profile_score ?? 0) === 0;

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {isLocked ? (
        <LockedView featureName="Recommended Talent" />
      ) : (
        <>
          <header className="mb-12 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 scale-110">
                  <BrainCircuit className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                  Neural<span className="text-indigo-600">Match</span>
                </h1>
              </div>
              <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.4em] ml-1">
                Algorithmic Culture Alignment Protocol 2.0
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="text"
                  placeholder="Query alignment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border border-slate-200 pl-12 pr-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 placeholder:text-slate-300 outline-none focus:border-indigo-500 shadow-sm transition-all w-64"
                />
              </div>

              <div className="relative group">
                <button className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
                  <Filter className="w-4 h-4" />
                  {filterExperience === "all" ? "Experience" : filterExperience}
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 p-2">
                  {["all", "fresher", "mid", "senior", "leadership"].map(
                    (band) => (
                      <button
                        key={band}
                        onClick={() => setFilterExperience(band)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                          filterExperience === band
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {band}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm active:scale-95"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div className="space-y-20">
            {Object.entries(tiers).map(
              ([tier, list]) =>
                list.length > 0 && (
                  <div key={tier} className="space-y-10">
                    <div className="flex items-center gap-6">
                      <div
                        className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg ${
                          tier === "elite"
                            ? "bg-orange-500 shadow-orange-100"
                            : tier === "strong"
                              ? "bg-indigo-600 shadow-indigo-100"
                              : "bg-slate-400 shadow-slate-100"
                        }`}
                      >
                        {tier === "elite" ? (
                          <Trophy className="w-6 h-6 text-white" />
                        ) : tier === "strong" ? (
                          <Target className="w-6 h-6 text-white" />
                        ) : (
                          <Users className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
                          {tier === "elite"
                            ? "Elite Alignment"
                            : tier === "strong"
                              ? "High Potential"
                              : "Emerging Sync"}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {tier === "elite"
                            ? "Top 1% Psychometric Correlation"
                            : tier === "strong"
                              ? "Strategic Culture Alignment"
                              : "Behavioral Consistency Verified"}
                        </p>
                      </div>
                      <div className="h-px flex-1 bg-linear-to-r from-slate-200 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {list.map((candidate) => (
                        <RecommendedCard
                          key={candidate.user_id}
                          candidate={candidate}
                          onViewProfile={() =>
                            handleViewProfile(candidate, "resume")
                          }
                          onInvite={() =>
                            setInviteModal({ isOpen: true, candidate })
                          }
                          isElite={tier === "elite"}
                        />
                      ))}
                    </div>
                  </div>
                ),
            )}

            {filteredCandidates.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                  <Zap className="h-10 w-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic">
                  No Neural Matches
                </h3>
                <p className="text-slate-400 text-sm font-medium mt-2">
                  Adjust your alignment query or define new company DNA
                  features.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {profileModal.isOpen && profileModal.candidate && (
        <CandidateProfileModal
          isOpen={profileModal.isOpen}
          onClose={() => setProfileModal({ ...profileModal, isOpen: false })}
          candidate={profileModal.candidate as any}
          resumeData={(profileModal.candidate as any).resume_data}
          jobTitle="Neural Match Discovery"
          appliedDate={new Date().toISOString()}
          score={profileModal.candidate.culture_match_score || 0}
          status="Recommended"
          initialTab={profileModal.initialTab}
          isDiscovery={true}
        />
      )}

      {isFetchingProfile && (
        <div className="fixed inset-0 z-100 bg-indigo-900/10 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-indigo-100 flex flex-col items-center gap-5">
            <div className="h-16 w-16 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-200">
              <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em] animate-pulse">
                Scanning Neural Profile...
              </p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Deep Link Verification in Progress
              </p>
            </div>
          </div>
        </div>
      )}

      {inviteModal.isOpen && inviteModal.candidate && (
        <JobInviteModal
          onClose={() => setInviteModal({ isOpen: false, candidate: null })}
          candidateName={inviteModal.candidate.full_name}
          jobs={jobs}
          onInvite={handleInviteCandidate}
        />
      )}
    </div>
  );
}

function RecommendedCard({
  candidate,
  onViewProfile,
  onInvite,
  isElite,
}: {
  candidate: Candidate;
  onViewProfile: () => void;
  onInvite: () => void;
  isElite?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-4xl border-2 ${isElite ? "border-orange-500/20 shadow-orange-500/10" : "border-indigo-500/10 shadow-indigo-500/10"} hover:border-indigo-500/30 transition-all duration-700 group relative flex flex-col p-4 h-full backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className="relative">
          <div
            className={`h-11 w-11 rounded-xl border ${isElite ? "border-orange-100 bg-orange-50" : "border-slate-100 bg-slate-50"} overflow-hidden shadow-inner group-hover:scale-105 transition-transform flex items-center justify-center`}
          >
            {candidate.profile_photo_url ? (
              <img
                src={candidate.profile_photo_url}
                alt={candidate.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User
                className={`h-5 w-5 ${isElite ? "text-orange-300" : "text-slate-300"}`}
              />
            )}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 bg-white p-0.5 rounded-full shadow-md">
            <div
              className={`h-3 w-3 rounded-full flex items-center justify-center ${candidate.identity_verified ? "bg-emerald-500" : "bg-slate-200"}`}
            >
              <CheckCircle2 className="h-2 w-2 text-white" />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div
            className={`px-2 py-0.5 ${isElite ? "bg-orange-600 shadow-lg shadow-orange-100" : "bg-indigo-600 shadow-lg shadow-indigo-100"} text-[6px] font-black text-white uppercase tracking-widest rounded-md italic shrink-0`}
          >
            {isElite ? "Elite sync" : "High match"}
          </div>
          <button
            onClick={onViewProfile}
            className="text-[8px] font-black text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1 group/btn uppercase tracking-widest shrink-0"
          >
            Profile{" "}
            <ChevronRight className="w-2.5 h-2.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-0.5 mb-3 flex flex-col justify-center relative z-10">
        <h3
          className={`text-[15px] font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors truncate`}
        >
          {candidate.full_name}
        </h3>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
          {candidate.current_role || "Product Infrastructure"}
        </p>
        <p className="text-[8px] font-medium text-slate-300 lowercase tracking-tight truncate">
          {candidate.email || "alignment@talentflow.ai"}
        </p>
      </div>

      <div
        className={`${isElite ? "bg-orange-50/50 border-orange-100/30" : "bg-slate-50 border-slate-100"} rounded-xl p-2.5 mb-3 border relative z-10`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[6px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
            Culture affinity
          </span>
          <span
            className={`text-[7px] font-bold ${isElite ? "text-orange-600" : "text-indigo-600"} uppercase italic tracking-tighter leading-none`}
          >
            {candidate.years_of_experience}Y Verified
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {candidate.skills?.slice(0, 2).map((skill) => (
            <span
              key={skill}
              className="px-1.5 py-0.5 bg-white border border-slate-100 rounded-md text-[7px] font-bold text-slate-500 uppercase tracking-tighter truncate max-w-17.5"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-auto relative z-10">
        <button
          onClick={onViewProfile}
          className={`flex-1 py-2.5 ${isElite ? "bg-orange-600 hover:bg-orange-700 shadow-orange-100" : "bg-slate-900 hover:bg-slate-800 shadow-slate-200"} text-white rounded-xl text-[8px] font-black uppercase tracking-[0.4em] transition-all shadow-md active:scale-95 whitespace-nowrap`}
        >
          Expert Profile
        </button>
        <button
          onClick={onInvite}
          className={`h-9 w-9 ${isElite ? "bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-600 hover:text-white" : "bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white"} border rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90 group/invite shrink-0`}
          title="Direct Sync"
        >
          <Plus className="w-4 h-4 group-hover/invite:rotate-90 transition-transform" />
        </button>
        <div
          className={`h-9 w-9 rounded-xl border flex flex-col items-center justify-center shadow-sm shrink-0 ${isElite ? "bg-white border-orange-100" : "bg-white border-slate-100"}`}
        >
          <span
            className={`text-[5px] font-black leading-none scale-75 uppercase ${isElite ? "text-orange-400" : "text-indigo-400"}`}
          >
            Match
          </span>
          <span
            className={`text-[10px] font-black italic tracking-tighter leading-none ${isElite ? "text-orange-600" : "text-indigo-600"}`}
          >
            {candidate.culture_match_score}%
          </span>
        </div>
      </div>
    </div>
  );
}
