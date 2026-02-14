"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface CandidateSidebarProps {
  assessmentStatus?: string;
}

export default function CandidateSidebar({
  assessmentStatus,
}: CandidateSidebarProps) {
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
          onClick={() => router.push("/dashboard/candidate")}
        >
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
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
          href="/dashboard/candidate"
          active={pathname === "/dashboard/candidate"}
        />
        <SidebarLink
          label="Job Board"
          href="/dashboard/candidate/jobs"
          active={pathname === "/dashboard/candidate/jobs"}
        />
        <SidebarLink
          label="Applications"
          href="/dashboard/candidate/applications"
          active={pathname === "/dashboard/candidate/applications"}
        />
        <SidebarLink
          label="Feed"
          href="/dashboard/candidate/community"
          active={pathname === "/dashboard/candidate/community"}
        />
        <SidebarLink
          label="Profile"
          href="/dashboard/candidate/profile"
          active={pathname === "/dashboard/candidate/profile"}
        />
        <SidebarLink
          label="Notifications"
          href="/dashboard/candidate/notifications"
          active={pathname === "/dashboard/candidate/notifications"}
        />
        <SidebarLink
          label="Messages"
          href="/dashboard/candidate/messages"
          active={pathname === "/dashboard/candidate/messages"}
        />
        <SidebarLink
          label="Settings"
          href="/dashboard/candidate/settings"
          active={pathname === "/dashboard/candidate/settings"}
        />
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
                onClick={() => router.push("/onboarding/candidate")}
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
              d="M17 16l4-4 m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
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
        ${active ? "bg-indigo-50 text-indigo-600 font-bold" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}
      `}
      >
        <div
          className={`h-1.5 w-1.5 rounded-full ${active ? "bg-indigo-600" : "bg-transparent"}`}
        />
        <span className="text-xs font-bold uppercase tracking-widest">
          {label}
        </span>
      </div>
    </Link>
  );
}
