"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CommunityFeed from "@/components/CommunityFeed";

export default function RecruiterCommunity() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
              <div className="h-5 w-5 rounded-sm bg-white rotate-45" />
            </div>
            <span className="font-black text-slate-900 tracking-tighter uppercase text-lg">
              TalentFlow
            </span>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <SidebarLink
            label="Dashboard"
            onClick={() => router.push("/dashboard/recruiter")}
          />
          <SidebarLink
            label="Community"
            active
            onClick={() => router.push("/dashboard/recruiter/community")}
          />
          <SidebarLink
            label="My Jobs"
            onClick={() => router.push("/dashboard/recruiter/jobs")}
          />
          <SidebarLink
            label="Candidate Pool"
            onClick={() => router.push("/dashboard/recruiter/pool")}
          />
        </nav>

        <div className="p-6 border-t border-slate-50 space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-12">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
            Ecosystem Feed
          </h1>
          <p className="text-slate-500 font-medium">
            Broadcast updates, share culture, and engage with passive talent.
          </p>
        </header>

        <CommunityFeed userRole="recruiter" />
      </main>
    </div>
  );
}

function SidebarLink({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
        active
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
          : "text-slate-500 hover:bg-slate-50"
      }`}
    >
      <span className="font-bold text-xs uppercase tracking-widest">
        {label}
      </span>
      {active && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
    </button>
  );
}
