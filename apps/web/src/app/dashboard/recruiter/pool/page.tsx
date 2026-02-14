"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import RecruiterSidebar from "@/components/RecruiterSidebar";

interface Candidate {
  user_id: string;
  full_name: string;
  current_role: string;
  experience: "fresher" | "mid" | "senior" | "leadership";
  years_of_experience: number;
  profile_strength: string;
  identity_verified: boolean;
  trust_score: number;
  assessment_status: string;
  skills: string[];
}

interface RecruiterProfile {
  assessment_status: string;
  companies: {
    profile_score: number;
  };
}

export default function CandidatePoolPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recruiterProfile, setRecruiterProfile] =
    useState<RecruiterProfile | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const fetchPool = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      const [poolData, profileData] = await Promise.all([
        apiClient.get("/recruiter/candidate-pool", session.access_token),
        apiClient.get("/recruiter/profile", session.access_token),
      ]);
      setCandidates(poolData || []);
      setRecruiterProfile(profileData);
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to fetch candidate pool:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to sync with TalentFlow servers";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchPool();

    // Enable Real-time updates via Supabase Channel
    const channel = supabase
      .channel("candidate_pool_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "candidate_profiles" },
        () => {
          fetchPool(); // Re-fetch when any candidate profile updates
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPool]);

  const bands = {
    fresher: candidates.filter((c) => c.experience === "fresher"),
    mid: candidates.filter((c) => c.experience === "mid"),
    senior: candidates.filter((c) => c.experience === "senior"),
    leadership: candidates.filter((c) => c.experience === "leadership"),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Check if either the recruiter or their company has completed onboarding
  const isAssessmentCompleted =
    recruiterProfile?.assessment_status === "completed" ||
    (recruiterProfile?.companies?.profile_score ?? 0) > 0;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <RecruiterSidebar
        assessmentStatus={recruiterProfile?.assessment_status}
      />

      <main className="flex-1 ml-64 p-6 md:p-12">
        {!isAssessmentCompleted && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-amber-900 font-bold">
                  Trust Verification Needed
                </h3>
                <p className="text-amber-700 text-sm">
                  Onboarding signals help verify recruiter intent. Complete your
                  assessment to finalize pairing.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/onboarding/recruiter")}
              className="px-6 py-2 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition"
            >
              Complete Now
            </button>
          </div>
        )}
        {error ? (
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-3xl border border-red-100 shadow-xl max-w-sm">
              <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-tight">
                Sync Offline
              </h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                {error.includes("Server disconnected")
                  ? "The Identity Server is currently unreachable. Please check your connection or try again in a few minutes."
                  : error}
              </p>
              <button
                onClick={fetchPool}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all"
              >
                Retry Sync
              </button>
            </div>
          </div>
        ) : (
          <>
            <header className="mb-12 flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">
                  Candidate Pool
                </h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-3">
                  Real-time synchronized top-tier talent
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Live Pool
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm active:scale-95"
                >
                  Logout
                </button>
              </div>
            </header>

            <div className="space-y-16">
              <PoolSection title="Leadership" candidates={bands.leadership} />
              <PoolSection title="Senior" candidates={bands.senior} />
              <PoolSection title="Mid-Level" candidates={bands.mid} />
              <PoolSection title="Freshers" candidates={bands.fresher} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function PoolSection({
  title,
  candidates,
}: {
  title: string;
  candidates: Candidate[];
}) {
  if (candidates.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">
          {title}
        </h2>
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {candidates.length} Matches
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((c) => (
          <CandidateCard key={c.user_id} candidate={c} />
        ))}
      </div>
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  const router = useRouter();
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group relative overflow-hidden">
      {/* Small Floating Trust Badge - Top Left */}
      <div className="absolute top-3 left-3 z-10">
        <div className="bg-slate-900 text-white px-2 py-1 rounded-lg shadow-2xl border border-white/10 group-hover:bg-indigo-600 transition-colors duration-300">
          <div className="flex flex-col items-center">
            <span className="text-[6px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-0.5">
              Trust
            </span>
            <span className="text-[11px] font-black italic tracking-tighter leading-none">
              {candidate.trust_score}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-start mb-4">
        <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 group-hover:scale-110 transition-transform duration-500">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div className="text-right">
          <div
            className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${
              candidate.profile_strength === "Elite"
                ? "bg-amber-50 text-amber-600"
                : candidate.profile_strength === "Strong"
                  ? "bg-indigo-50 text-indigo-600"
                  : "bg-slate-50 text-slate-500"
            }`}
          >
            {candidate.profile_strength}
          </div>
          {candidate.identity_verified && (
            <div className="mt-1 flex items-center justify-end gap-1 text-emerald-500">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              <span className="text-[7px] font-black uppercase tracking-widest">
                Verified
              </span>
            </div>
          )}
        </div>
      </div>

      <h3 className="text-base font-black text-slate-900 leading-tight mb-0.5">
        {candidate.full_name}
      </h3>
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-4">
        {candidate.current_role}
      </p>

      <div className="flex flex-wrap gap-1 mb-6">
        {candidate.skills?.slice(0, 3)?.map((s) => (
          <span
            key={s}
            className="px-2 py-1 bg-white border border-slate-100 rounded-lg text-[8px] font-bold text-slate-500 uppercase tracking-tighter"
          >
            {s}
          </span>
        ))}
      </div>

      <button
        onClick={() =>
          router.push(`/dashboard/recruiter/candidate/${candidate.user_id}`)
        }
        className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all duration-300 shadow-lg shadow-slate-200"
      >
        View Profile
      </button>

      {/* Trust Gradient */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-indigo-500/5 to-transparent pointer-events-none" />
    </div>
  );
}

