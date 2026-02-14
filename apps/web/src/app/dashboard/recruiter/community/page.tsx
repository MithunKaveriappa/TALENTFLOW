"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import CommunityFeed from "@/components/CommunityFeed";
import RecruiterSidebar from "@/components/RecruiterSidebar";

export default function RecruiterCommunity() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ assessment_status?: string } | null>(
    null,
  );

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();
        if (!authSession) {
          router.replace("/login");
          return;
        }

        const data = await apiClient.get(
          "/recruiter/profile",
          authSession.access_token,
        );
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <RecruiterSidebar assessmentStatus={profile?.assessment_status} />

      <main className="flex-1 overflow-y-auto ml-64 p-12">
        <header className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
              Feed
            </h1>
            <p className="text-slate-500 font-medium">
              Broadcast updates, share culture, and engage with passive talent.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm active:scale-95 translate-y-2"
          >
            Logout
          </button>
        </header>

        <CommunityFeed userRole="recruiter" />
      </main>
    </div>
  );
}
