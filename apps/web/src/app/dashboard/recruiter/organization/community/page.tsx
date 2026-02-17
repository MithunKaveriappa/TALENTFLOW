"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
// import { apiClient } from "@/lib/apiClient";
import CommunityFeed from "@/components/CommunityFeed";

export default function RecruiterCommunity() {
  const router = useRouter();

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

        // We don't need profile here anymore as sidebar logic moved to layout
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
    <div className="p-12 overflow-y-auto">
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
    </div>
  );
}
