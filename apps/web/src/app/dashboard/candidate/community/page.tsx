"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CommunityFeed from "@/components/CommunityFeed";
import CandidateSidebar from "@/components/CandidateSidebar";

export default function CandidateCommunity() {
  const router = useRouter();
  const [assessmentStatus, setAssessmentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("candidate_profiles")
          .select("assessment_status")
          .eq("user_id", user.id)
          .single();
        if (profile) {
          setAssessmentStatus(profile.assessment_status);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
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
      <CandidateSidebar assessmentStatus={assessmentStatus ?? undefined} />

      <main className="flex-1 ml-64 p-12 overflow-y-auto">
        <header className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
              Feed
            </h1>
            <p className="text-slate-500 font-medium">
              Engage with the ecosystem, share learnings, and build presence.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm active:scale-95 translate-y-2"
          >
            Logout
          </button>
        </header>

        <CommunityFeed userRole="candidate" />
      </main>
    </div>
  );
}
