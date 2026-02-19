"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import {
  Activity,
  ChevronRight,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

interface Application {
  id: string;
  job_title: string;
  company_name: string;
  status: string;
  applied_at: string;
  feedback?: string;
  metadata?: {
    interview_link?: string;
    interview_time?: string;
  };
}

export default function CandidateApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/login");
          return;
        }

        const appsData = await apiClient.get(
          "/candidate/applications",
          session.access_token,
        );
        setApplications(appsData);
      } catch (err) {
        console.error("Failed to load applications:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Active{" "}
              <span className="text-indigo-600 font-black">Transmissions</span>
            </h1>
            <div className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-md border border-indigo-200">
              Applications
            </div>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
            <Activity className="h-3 w-3 text-emerald-500" />
            Real-time tracking of your position within the hiring funnel.
          </p>
        </div>
      </header>

      {applications.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 border border-slate-200 border-dashed text-center">
          <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FileText className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-400 mb-2">
            No Active Applications
          </h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">
            You haven&apos;t initiated any application signals yet.
          </p>
          <button
            onClick={() => router.push("/dashboard/candidate/feed")}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl shadow-indigo-600/20 active:scale-95"
          >
            Explore Role Feed
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-4xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      {app.job_title}
                    </h3>
                  </div>
                  <p className="text-slate-500 font-bold text-sm mb-4">
                    {app.company_name}
                  </p>

                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border">
                      <CheckCircle2 className="h-3 w-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {app.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {app.status === "interview_scheduled" &&
                    app.metadata?.interview_link && (
                      <button
                        onClick={() =>
                          window.open(app.metadata?.interview_link, "_blank")
                        }
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition"
                      >
                        Enter Meeting
                      </button>
                    )}
                  <button
                    onClick={() =>
                      router.push("/dashboard/candidate/applications/")
                    }
                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {app.feedback && (
                <div className="mt-6 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-indigo-500 mt-0.5" />
                  <p className="text-[11px] text-indigo-700 font-medium leading-relaxed italic">
                    &quot;{app.feedback}&quot;
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
