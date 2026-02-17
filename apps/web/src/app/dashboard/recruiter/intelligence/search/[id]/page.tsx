"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Settings,
  ChevronLeft,
  Mail,
  MapPin,
  Calendar,
  Award,
  Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import InterviewScheduler from "@/components/InterviewScheduler";
import JobInviteModal from "@/components/JobInviteModal";
import LockedView from "@/components/dashboard/LockedView";

interface Candidate {
  user_id: string;
  full_name: string;
  current_role: string;
  years_of_experience: number;
  trust_score: number;
  skills_alignment: number;
  bio: string;
  skills: string[];
}

interface Application {
  id: string;
  job_id: string;
  status: string;
  jobs?: { title: string };
}

interface Job {
  id: string;
  title: string;
  status: string;
  location: string;
  recruiter_id: string;
}

export default function CandidateProfileView() {
  const router = useRouter();
  const { id } = useParams();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [profile, setProfile] = useState<{ 
    assessment_status?: string;
    user_id?: string;
    team_role?: "admin" | "recruiter";
    companies?: {
      profile_score: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [recruiterJobs, setRecruiterJobs] = useState<Job[]>([]);

  const isLocked = profile && (profile.companies?.profile_score ?? 0) === 0;

  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        const [candidateData, profileData, appsData, jobsData] =
          await Promise.all([
            apiClient.get(`/recruiter/candidate/${id}`, session.access_token),
            apiClient.get("/recruiter/profile", session.access_token),
            apiClient.get(
              `/recruiter/candidate/${id}/application-status`,
              session.access_token,
            ),
            apiClient.get("/recruiter/jobs", session.access_token),
          ]);

        setCandidate(candidateData);
        setProfile(profileData);
        setApplications(appsData || []);
        setRecruiterJobs(jobsData || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, router]);

  const handleInvite = async (jobId: string, message: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      await apiClient.post(
        `/recruiter/candidate/${id}/invite`,
        {
          job_id: jobId,
          message: message,
        },
        session.access_token,
      );

      // Refresh status
      const updatedApps = await apiClient.get(
        `/recruiter/candidate/${id}/application-status`,
        session.access_token,
      );
      setApplications(updatedApps || []);
      setShowInviteModal(false);

      alert(`Invitation sent successfully!`);
    } catch (err) {
      console.error("Invite failed:", err);
      alert("Failed to send invitation.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="p-12 min-h-screen bg-slate-50">
        <LockedView featureName="Candidate Intelligence" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          Candidate Not Found
        </h1>
        <p className="text-slate-500 mt-2 mb-6">
          The profile you&apos;re looking for doesn&apos;t exist or you
          don&apos;t have access.
        </p>
        <Link
          href="/dashboard/recruiter/hiring/pool"
          className="text-blue-600 font-bold hover:underline"
        >
          Return to Candidate Pool
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Main Content Area */}
      <div className="flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10 w-full">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/recruiter/hiring/pool"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <span className="text-sm font-semibold text-slate-600">
              Candidate Profile: {candidate.full_name}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/recruiter/account/profile"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Profile Content */}
        <main className="p-8 max-w-6xl mx-auto w-full">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="bg-blue-600 h-32 relative">
              <div className="absolute -bottom-12 left-8 border-4 border-white rounded-2xl bg-blue-100 w-24 h-24 flex items-center justify-center text-blue-700 text-4xl font-black shadow-lg">
                {candidate.full_name?.[0]}
              </div>
            </div>

            <div className="pt-16 pb-8 px-8 border-b border-slate-50">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {candidate.full_name}
                  </h1>
                  <p className="text-slate-500 font-medium text-lg mt-1">
                    {candidate.current_role || "Professional"}
                  </p>

                  <div className="flex items-center space-x-4 mt-4">
                    <span className="flex items-center text-sm font-medium text-slate-500">
                      <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                      {candidate.years_of_experience} Years Experience
                    </span>
                    <span className="flex items-center text-sm font-medium text-slate-500">
                      <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                      Verified Profile
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="bg-blue-50 border border-blue-100 p-2 rounded-xl flex items-center justify-center min-w-30">
                    <div className="text-center">
                      <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">
                        Trust Score
                      </div>
                      <div className="text-2xl font-black text-blue-700">
                        {(candidate.trust_score || 0).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Connect with Candidate
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              <ScoreCard
                label="Verified Trust Score"
                score={candidate.trust_score || 0}
              />
              <ScoreCard
                label="Skill Alignment"
                score={candidate.skills_alignment || 0}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-amber-500" />
                  Bio & Professional Narrative
                </h2>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {candidate.bio || "No professional bio provided."}
                </p>
              </section>

              <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-blue-600" />
                  Skills & Technical Stack
                </h2>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills?.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                  {(!candidate.skills || candidate.skills.length === 0) && (
                    <p className="text-slate-400 text-sm italic">
                      No skills listed
                    </p>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6">
                  Verification Insights
                </h2>
                <p className="text-sm font-medium text-slate-500 italic">
                  Identity & professional background verified by TalentFlow AI
                  algorithms based on cross-platform data mapping.
                </p>
              </section>

              <div className="flex flex-col gap-3">
                <button className="w-full px-6 py-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center">
                  Download Full CV
                </button>
                <button className="w-full px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center">
                  Add to Shortlist
                </button>
                {applications.length > 0 ? (
                  <button
                    onClick={() => setShowScheduler(true)}
                    className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center"
                  >
                    Schedule Interview
                  </button>
                ) : (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center"
                  >
                    Invite to Job
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {showScheduler && (
        <InterviewScheduler
          candidateName={candidate.full_name}
          applications={applications}
          onClose={() => setShowScheduler(false)}
          onSuccess={() => {
            setShowScheduler(false);
            alert("Interview proposal sent!");
          }}
        />
      )}

      {showInviteModal && (
        <JobInviteModal
          candidateName={candidate.full_name}
          jobs={recruiterJobs.filter(j => j.recruiter_id === profile?.user_id)}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInvite}
        />
      )}
    </div>
  );
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  return (
    <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-100 relative overflow-hidden group hover:border-blue-100 transition-all">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-20 group-hover:opacity-100 transition-opacity" />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">
        {label}
      </span>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
          {(score || 0).toFixed(0)}
        </span>
        <span className="text-xs font-bold text-slate-400 mb-1">%</span>
      </div>
      <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-1000 ease-out"
          style={{ width: `${score || 0}%` }}
        />
      </div>
    </div>
  );
}
