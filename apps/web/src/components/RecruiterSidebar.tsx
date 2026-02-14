"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface RecruiterSidebarProps {
  assessmentStatus?: string;
}

export default function RecruiterSidebar({
  assessmentStatus,
}: RecruiterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30">
      <div className="p-8 border-b border-slate-50">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push("/dashboard/recruiter")}
        >
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-100">
            <div className="h-5 w-5 rounded bg-white rotate-45" />
          </div>
          <span className="font-black text-slate-900 tracking-tighter uppercase text-lg">
            TalentFlow
          </span>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar">
        <SidebarLink
          label="Dashboard"
          href="/dashboard/recruiter"
          active={pathname === "/dashboard/recruiter"}
        />
        <SidebarLink
          label="Post a Job"
          href="/dashboard/recruiter/jobs/new"
          active={pathname === "/dashboard/recruiter/jobs/new"}
        />
        <SidebarLink
          label="My Jobs"
          href="/dashboard/recruiter/jobs"
          active={pathname === "/dashboard/recruiter/jobs"}
        />
        <SidebarLink
          label="Candidate Pool"
          href="/dashboard/recruiter/pool"
          active={pathname === "/dashboard/recruiter/pool"}
        />
        <SidebarLink label="Candidate Search" href="#" />
        <SidebarLink
          label="Feed"
          href="/dashboard/recruiter/community"
          active={pathname === "/dashboard/recruiter/community"}
        />
        <SidebarLink
          label="Profile"
          href="/dashboard/recruiter/profile"
          active={pathname === "/dashboard/recruiter/profile"}
        />
        <SidebarLink
          label="Messages"
          href="/dashboard/recruiter/messages"
          active={pathname === "/dashboard/recruiter/messages"}
        />
        <SidebarLink label="Settings" href="#" />
      </nav>

      <div className="p-4 border-t border-slate-50 space-y-3">
        {assessmentStatus && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className={`h-1.5 w-1.5 rounded-full ${assessmentStatus === "completed" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}
              />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                Verification Hub
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-medium leading-tight">
              Status:{" "}
              {assessmentStatus.charAt(0).toUpperCase() +
                assessmentStatus.slice(1)}
            </p>
            {assessmentStatus !== "completed" && (
              <button
                onClick={() => router.push("/onboarding/recruiter")}
                className="mt-2 w-full py-1.5 bg-amber-600 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-amber-700 transition-colors"
              >
                Complete Now
              </button>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all group border border-transparent hover:border-red-100"
        >
          <svg
            className="h-4 w-4 transition-transform group-hover:scale-110"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="text-xs font-black uppercase tracking-widest">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({
  label,
  href,
  active = false,
}: {
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link href={href}>
      <div
        className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all
        ${active ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}
      `}
      >
        <div
          className={`h-1.5 w-1.5 rounded-full ${active ? "bg-blue-600" : "bg-transparent"}`}
        />
        <span className="text-xs font-bold uppercase tracking-widest">
          {label}
        </span>
      </div>
    </Link>
  );
}

