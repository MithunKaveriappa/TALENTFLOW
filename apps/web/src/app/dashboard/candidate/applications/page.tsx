"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import CandidateSidebar from "@/components/CandidateSidebar";

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

const STATUS_ORDER = [
  "recommended",
  "applied",
  "invited",
  "shortlisted",
  "interview_scheduled",
  "offered",
];

export default function CandidateApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [assessmentStatus, setAssessmentStatus] =
    useState<string>("not_started");

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

        const [appsData, statsData] = await Promise.all([
          apiClient.get("/candidate/applications", session.access_token),
          apiClient.get("/candidate/stats", session.access_token),
        ]);

        setApplications(appsData);
        setAssessmentStatus(statsData.assessment_status);
      } catch (err) {
        console.error("Failed to load applications:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

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
      <CandidateSidebar assessmentStatus={assessmentStatus} />

      <main className="flex-1 ml-64 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">
                Active Transmissions
              </h1>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">
                Real-time Application Pulse & Lifecycle
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm active:scale-95"
            >
              Logout
            </button>
          </header>

          {applications.length === 0 ? (
            <div className="bg-white p-12 rounded-4xl text-center border border-slate-100 shadow-sm">
              <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">
                No Active Signals
              </h2>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">
                You haven&apos;t transmitted any signals to open roles yet.
                Explore the Job Board to find your next match.
              </p>
              <button
                onClick={() => router.push("/dashboard/candidate/jobs")}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
              >
                Explore Job Board
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  const isRejected = application.status === "rejected";
  const isClosed = application.status === "closed";
  const currentStatusIndex = STATUS_ORDER.indexOf(application.status);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all group">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            {application.job_title}
          </h3>
          <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mt-1">
            {application.company_name}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Applied: {new Date(application.applied_at).toLocaleDateString()}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
              isRejected
                ? "bg-red-50 text-red-600 border-red-100"
                : isClosed
                  ? "bg-slate-50 text-slate-500 border-slate-200"
                  : "bg-indigo-50 text-indigo-600 border-indigo-100"
            }`}
          >
            {application.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Lifecycle Timeline */}
      {!isRejected && !isClosed ? (
        <div className="relative pt-4 pb-12">
          {/* Interview Action Component */}
          {application.status === "interview_scheduled" &&
            application.metadata?.interview_link && (
              <div className="mb-8 p-4 bg-indigo-600 rounded-2xl flex items-center justify-between shadow-lg shadow-indigo-200 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-xs font-black uppercase tracking-widest">
                      Virtual War Room Ready
                    </p>
                    <p className="text-indigo-100 text-[10px] font-bold">
                      Secure Signal:{" "}
                      {application.metadata.interview_time || "Check calendar"}
                    </p>
                  </div>
                </div>
                <a
                  href={application.metadata.interview_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                >
                  Join Jitsi
                </a>
              </div>
            )}

          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 -translate-y-1/2 transition-all duration-1000"
            style={{
              width: `${(currentStatusIndex / (STATUS_ORDER.length - 1)) * 100}%`,
            }}
          />
          <div className="relative flex justify-between">
            {STATUS_ORDER.map((step, idx) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`h-4 w-4 rounded-full border-2 z-10 transition-all ${
                    idx <= currentStatusIndex
                      ? "bg-indigo-600 border-indigo-600 scale-125 shadow-lg shadow-indigo-100"
                      : "bg-white border-slate-200"
                  }`}
                />
                <span
                  className={`absolute -bottom-6 text-[8px] font-black uppercase tracking-tighter whitespace-nowrap transition-colors ${
                    idx <= currentStatusIndex
                      ? "text-slate-900"
                      : "text-slate-300"
                  }`}
                >
                  {step.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : isRejected ? (
        <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
              <svg
                className="h-4 w-4"
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
            <h4 className="font-black text-red-900 uppercase tracking-tight text-xs">
              Rejection Feedback & Guidance
            </h4>
          </div>
          <p className="text-red-700/70 text-xs font-medium leading-relaxed mb-4">
            {application.feedback ||
              "The recruiter has chosen not to move forward with this signal at this time. Standard criteria evaluation suggests a focus on aligning your core signals for similar roles."}
          </p>
          <div className="flex items-center gap-2 text-[8px] font-black text-red-400 uppercase tracking-widest">
            <span className="h-1 w-1 bg-red-400 rounded-full" />
            Guided Improvement: Check Career GPS milestones (Coming Soon)
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            This opportunity is no longer accepting transmissions.
          </p>
        </div>
      )}
    </div>
  );
}
