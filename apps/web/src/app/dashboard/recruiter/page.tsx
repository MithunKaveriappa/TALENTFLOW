"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RecruiterDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  if (loading) return <div className="p-8">Loading Recruiter Command Center...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-slate-900 text-white p-8">
        <h2 className="font-bold text-xl mb-8">TalentFlow</h2>
        <nav className="space-y-4">
          <div className="text-indigo-400 font-bold">Dashboard</div>
          <div className="text-slate-400">Search Candidates</div>
          <div className="text-slate-400">Post Job</div>
          <button 
            onClick={() => { supabase.auth.signOut(); router.push("/login"); }}
            className="mt-8 text-slate-500 hover:text-white"
          >
            Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-12">
        <h1 className="text-3xl font-black text-slate-900 mb-8">RECRUITER COMMAND CENTER</h1>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Welcome to the Recruiter Portal</h2>
          <p className="text-slate-500">We are currently initializing your access to the TalentFlow trust-verified candidate pool. Check back shortly for live matches.</p>
        </div>
      </main>
    </div>
  );
}
