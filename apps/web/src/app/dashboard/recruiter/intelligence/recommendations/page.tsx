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
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import RecruiterSidebar from "@/components/RecruiterSidebar";
import LockedView from "@/components/dashboard/LockedView";

interface Candidate {
  user_id: string;
  full_name: string;
  current_role: string;
  experience: string;
  years_of_experience: number;
  culture_match_score: number;
  skills: string[];
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [profile, setProfile] = useState<{
    assessment_status?: string;
    team_role?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      const [recData, profileData] = await Promise.all([
        apiClient.get(
          "/recruiter/recommended-candidates",
          session.access_token,
        ),
        apiClient.get("/recruiter/profile", session.access_token),
      ]);
      setCandidates(recData || []);
      setProfile(profileData);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const isLocked = profile && (profile.companies?.profile_score ?? 0) === 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {isLocked ? (
            <LockedView featureName="Recommended Talent" />
          ) : (
            <>
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
                    <BrainCircuit className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Recommended <span className="text-indigo-600">Talent</span>
                  </h1>
                </div>
                <p className="text-slate-500 font-medium ml-12">
                  Found matching behaviors and psychometrics derived from your
                  company culture.
                </p>
              </div>

          {candidates.length === 0 ? (
            <div className="bg-white rounded-3xl p-20 border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
              <Zap className="h-12 w-12 text-slate-200 mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                No Culture Matches Yet
              </h3>
              <p className="text-slate-500 max-w-sm font-medium">
                We're still analyzing candidate psychometrics to find your
                perfect fit.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {candidates.map((c) => (
                <div
                  key={c.user_id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                        <span className="text-xs font-black text-indigo-700 uppercase tracking-tighter">
                          {c.culture_match_score}% Culture Fit
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-300 border border-slate-200 shadow-inner">
                      {c.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {c.full_name}
                      </h3>
                      <p className="text-sm font-bold text-slate-500">
                        {c.current_role || "Software Intelligence"}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] font-black uppercase text-slate-400 border border-slate-200 px-2 py-0.5 rounded-md tracking-widest">
                          {c.experience}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {c.skills?.slice(0, 5).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-bold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-100"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/recruiter/intelligence/search/${c.user_id}`,
                        )
                      }
                      className="flex-1 bg-white border-2 border-slate-200 text-slate-700 font-black uppercase tracking-widest text-[10px] py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Profile
                    </button>
                    <button 
                      onClick={() => router.push(`/dashboard/recruiter/intelligence/search/${c.user_id}`)}
                      className="flex-1 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] py-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      Connect & Invite
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      </div>
    </main>
  </div>
);
}
