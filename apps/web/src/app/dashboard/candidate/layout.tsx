"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import CandidateSidebar from "@/components/CandidateSidebar";
import CandidateHeader from "@/components/CandidateHeader";

export default function CandidateDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    assessment_status?: string;
    profile_score?: number;
  } | null>(null);

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      try {
        const statsData = await apiClient.get(
          "/candidate/stats",
          session.access_token,
        );
        setProfile(statsData);
      } catch (err) {
        console.error("Failed to load candidate stats in layout:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
            Calibrating Nexus...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <CandidateSidebar
        assessmentStatus={profile?.assessment_status}
        profileScore={profile?.profile_score ?? 0}
      />
      <div className="flex-1 ml-64 min-h-screen relative">
        <CandidateHeader />
        <div className="relative">
          {/* Subtle top decoration - matching recruiter style */}
          <div className="absolute top-0 right-0 left-0 h-64 bg-linear-to-b from-indigo-50/50 to-transparent -z-10" />
          <main className="p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
