"use client";

import { useState } from "react";
import Image from "next/image";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  User,
  Star,
  Download,
  FileText,
  ClipboardList,
  Video,
  Send,
  Building2,
  BrainCircuit,
} from "lucide-react";
import { format } from "date-fns";
import InterviewScheduler from "./InterviewScheduler";

interface CandidateProfile {
  user_id: string;
  full_name: string;
  bio?: string;
  profile_photo_url?: string;
  phone_number?: string;
  location?: string;
  gender?: string;
  birthdate?: string;
  university?: string;
  qualification_held?: string;
  graduation_year?: number;
  referral?: string;
  skills: string[];
  email?: string | null;
  resume_path?: string | null;
  resume_url?: string | null;
}

interface ExperienceEntry {
  role?: string;
  title?: string;
  company?: string;
  location?: string;
  start?: string;
  end?: string;
  description?: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateProfile;
  resumeData?: Record<string, unknown> | Record<string, unknown>[];
  jobTitle: string;
  appliedDate: string;
  score: number;
  status?: string;
  initialTab?: string;
  applicationId?: string;
  isDiscovery?: boolean;
}

interface ParsedResume {
  education?: {
    institution?: string;
    degree?: string;
    year?: string;
  };
  location?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  [key: string]: unknown;
}

export default function CandidateProfileModal({
  isOpen,
  onClose,
  candidate,
  resumeData,
  jobTitle,
  appliedDate,
  score,
  status,
  initialTab = "resume",
  applicationId,
  isDiscovery = false,
}: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showScheduler, setShowScheduler] = useState(false);

  if (!isOpen) return null;

  const tabs = [
    {
      id: "application",
      label: "Job Application",
      icon: ClipboardList,
      hidden: isDiscovery,
    },
    { id: "resume", label: "Generated CV", icon: FileText },
    {
      id: "original_resume",
      label: "Original PDF",
      icon: Download,
      hidden: !(candidate.resume_path || candidate.resume_url),
    },
    {
      id: "form",
      label: "Form Submission",
      icon: ClipboardList,
      hidden: isDiscovery,
    },
    { id: "interview", label: "Interview", icon: Video, hidden: isDiscovery },
  ].filter((t) => !t.hidden);

  const normalizedResume = (
    Array.isArray(resumeData) ? resumeData[0] : resumeData
  ) as Record<string, unknown> | undefined;

  // Extraction logic with fallbacks to parsed resume details
  // Note: if raw_text contains a JSON string, we attempt to use it
  let parsedDetails: ParsedResume = {};
  if (
    typeof normalizedResume?.raw_text === "string" &&
    (normalizedResume.raw_text as string).trim().startsWith("{")
  ) {
    try {
      parsedDetails = JSON.parse(normalizedResume.raw_text as string);
    } catch {
      // Ignored
    }
  } else if (typeof normalizedResume?.raw_text === "object") {
    parsedDetails = normalizedResume.raw_text as unknown as ParsedResume;
  }

  const timeline: ExperienceEntry[] = Array.isArray(normalizedResume?.timeline)
    ? normalizedResume.timeline
    : [];

  // Education fallbacks: Profile -> Resume Table -> Parsed JSON
  const eduInstitution =
    candidate.university ||
    (normalizedResume?.education as Record<string, string>)?.institution ||
    parsedDetails?.education?.institution ||
    "Not Provided";
  const eduDegree =
    candidate.qualification_held ||
    (normalizedResume?.education as Record<string, string>)?.degree ||
    parsedDetails?.education?.degree ||
    "Not Provided";
  const eduYear =
    candidate.graduation_year?.toString() ||
    (normalizedResume?.education as Record<string, string>)?.year ||
    parsedDetails?.education?.year ||
    "N/A";

  // Contact/Bio fallbacks
  const displayLocation =
    candidate.location || parsedDetails?.location || "Not Provided";
  const displayPhone =
    candidate.phone_number || parsedDetails?.phone || "Hidden";
  const displayBio =
    candidate.bio ||
    parsedDetails?.bio ||
    "Candidate has not provided a professional bio yet.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-50 rounded-[28px] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200/50">
        {/* Compact Header */}
        <div className="bg-white px-5 py-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              {candidate.profile_photo_url ? (
                <Image
                  src={candidate.profile_photo_url}
                  alt={candidate.full_name}
                  width={44}
                  height={44}
                  className="rounded-full object-cover ring-2 ring-slate-50"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center ring-2 ring-slate-50">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-xs">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 leading-tight tracking-tight">
                  {candidate.full_name}
                </h2>
                <div
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-0.5 border shadow-sm ${
                    isDiscovery && score
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-amber-50 text-amber-700 border-amber-100"
                  }`}
                >
                  {isDiscovery && score ? (
                    <>
                      <BrainCircuit className="w-2.5 h-2.5 text-white" />
                      {score}% Neural Sync
                    </>
                  ) : (
                    <>
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      {(score / 20).toFixed(1)}
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-0.5 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[7px] font-black leading-none mb-0.5">
                    Applied at
                  </span>
                  {format(new Date(appliedDate), "dd MMM, yyyy")}
                </div>
                <div className="flex flex-col border-l border-slate-200 pl-3">
                  <span className="text-slate-400 text-[7px] font-black leading-none mb-0.5">
                    Target Position
                  </span>
                  <span className="text-slate-900 truncate max-w-50">
                    {jobTitle}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (candidate.email) {
                  window.location.href = `mailto:${candidate.email.toLowerCase()}?subject=Regarding your application for ${jobTitle}&body=Hello ${candidate.full_name},`;
                } else {
                  alert("Candidate email not found.");
                }
              }}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
            >
              <Mail className="w-3 h-3" />
              Send Email
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all border border-slate-200"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Main Workspace (Scrollable) */}
          <div className="flex-1 flex flex-col bg-slate-50/50 p-4 min-w-0">
            {/* View Switching Tabs */}
            <div className="flex items-center gap-0.5 mb-3 bg-slate-200/40 p-1 rounded-xl self-start">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:bg-slate-300/50"
                  }`}
                >
                  <tab.icon
                    className={`w-3 h-3 ${activeTab === tab.id ? "text-indigo-600" : "text-slate-400"}`}
                  />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Display Layer */}
            <div className="flex-1 bg-white rounded-[20px] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-0">
              {activeTab === "resume" && (
                <div className="flex flex-col h-full bg-slate-100/50">
                  <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                    <div className="bg-white aspect-[1/1.3] w-full max-w-2xl mx-auto shadow-xl p-8 relative border border-slate-100 min-h-200">
                      {/* Sub-action Download */}
                      <div className="absolute top-6 right-6 flex gap-2 print:hidden">
                        <button
                          onClick={() => window.print()}
                          className="bg-white hover:bg-slate-50 text-slate-900 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                        >
                          <Download className="w-3 h-3" />
                          Export PDF
                        </button>
                      </div>

                      <div className="border-b-2 border-slate-900 pb-4 mb-5">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
                          {candidate.full_name}
                        </h1>
                      </div>

                      <div className="space-y-6">
                        {/* Real Summary from DB */}
                        <section>
                          <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 px-1">
                            Professional Bio
                          </h3>
                          <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100/50">
                            <p className="text-slate-600 text-[10px] font-bold leading-relaxed">
                              {displayBio}
                            </p>
                          </div>
                        </section>

                        {/* Real Work History Mapping */}
                        <section>
                          <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-1">
                            Experience Hub
                          </h3>
                          {timeline.length > 0 ? (
                            <div className="space-y-4">
                              {timeline.map(
                                (exp: ExperienceEntry, idx: number) => (
                                  <div
                                    key={idx}
                                    className="relative pl-4 border-l-2 border-slate-100 pb-1 group"
                                  >
                                    <div className="absolute -left-1.25 top-1 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-indigo-500 transition-colors" />
                                    <div className="flex justify-between items-start mb-0.5">
                                      <h4 className="font-black text-slate-900 text-[11px] tracking-tight group-hover:text-indigo-600 transition-colors">
                                        {exp.role || exp.title}
                                      </h4>
                                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">
                                        {exp.start} {exp.end || "Present"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[8px] text-slate-500 font-bold mb-1">
                                      <Building2 className="w-2.5 h-2.5" />
                                      {exp.company}
                                    </div>
                                    <p className="text-[10px] text-slate-600 leading-relaxed font-medium italic">
                                      {exp.description}
                                    </p>
                                  </div>
                                ),
                              )}
                            </div>
                          ) : (
                            <div className="p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center">
                              <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                No Work History Logs Found
                              </p>
                            </div>
                          )}
                        </section>

                        {/* Real Skills Tag Cloud */}
                        {(candidate.skills?.length > 0 ||
                          (parsedDetails?.skills?.length ?? 0) > 0) && (
                          <section>
                            <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2.5 px-1">
                              Core Competencies
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                              {(
                                candidate.skills ||
                                parsedDetails?.skills ||
                                []
                              ).map((skill: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-1 bg-white text-indigo-600 text-[8px] font-black rounded-lg border border-indigo-100 uppercase tracking-tighter hover:bg-indigo-600 hover:text-white transition-colors cursor-default"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </section>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "original_resume" &&
                (candidate.resume_url || candidate.resume_path) && (
                  <div className="flex flex-col h-full bg-slate-900">
                    <div className="bg-slate-800 p-3 flex justify-between items-center px-6">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Candidate Uploaded Document
                      </span>
                      <a
                        href={
                          candidate.resume_url ||
                          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${candidate.resume_path}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95"
                      >
                        <Download className="w-3 h-3" />
                        Download Original
                      </a>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <iframe
                        src={
                          candidate.resume_url ||
                          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${candidate.resume_path}`
                        }
                        className="w-full h-full border-none"
                        title="Original Resume PDF"
                      />
                    </div>
                  </div>
                )}
              {activeTab === "application" && (
                <div className="p-8">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                    Current Application Status
                  </h3>
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                          <ClipboardList className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Current Stage
                          </p>
                          <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                            {status || "APPLIED"}
                          </h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                          Applied On
                        </p>
                        <h4 className="text-sm font-bold text-slate-700">
                          {format(new Date(appliedDate), "MMMM dd, yyyy")}
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-50">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Match Score
                        </span>
                        <span className="text-sm font-black text-indigo-600">
                          {(score / 20).toFixed(1)} / 5.0
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Target Role
                        </span>
                        <span className="text-sm font-black text-slate-700 uppercase tracking-tight">
                          {jobTitle}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "form" && (
                <div className="p-8">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                    High-Fidelity Form Signals
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        Demographics
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                            University
                          </label>
                          <p className="text-xs font-bold text-slate-700">
                            {candidate.university || "Not Provided"}
                          </p>
                        </div>
                        <div>
                          <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                            Qualification
                          </label>
                          <p className="text-xs font-bold text-slate-700">
                            {candidate.qualification_held || "Not Provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        Professional Metadata
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                            Graduation Year
                          </label>
                          <p className="text-xs font-bold text-slate-700">
                            {candidate.graduation_year || "Not Provided"}
                          </p>
                        </div>
                        <div>
                          <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                            Referral Source
                          </label>
                          <p className="text-xs font-bold text-slate-700">
                            {candidate.referral || "Direct Application"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "interview" && (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                    <Video className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">
                    Interview Scheduler
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium max-w-60 leading-relaxed mb-8">
                    Invite this candidate to a live video assessment or
                    behavioral interview session.
                  </p>
                  <button
                    onClick={() => setShowScheduler(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                  >
                    Schedule New Session
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Static Details Panel */}
          <div className="w-65 border-l border-slate-100 bg-white p-5 overflow-y-auto custom-scrollbar shrink-0">
            <div className="mb-6">
              <h3 className="text-[9px] font-black text-slate-900 mb-3.5 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">
                Candidate Info
              </h3>
              <div className="space-y-2">
                <MiniInfoItem
                  label="Candidate Email"
                  value={candidate.email?.toLowerCase() || "Not Available"}
                  icon={Mail}
                  color="text-indigo-600 bg-indigo-50"
                />
                <MiniInfoItem
                  label="Verified Phone"
                  value={displayPhone}
                  icon={Phone}
                  color="text-blue-600 bg-blue-50"
                />
                <MiniInfoItem
                  label="Sex/Gender"
                  value={candidate.gender || "Not Specified"}
                  icon={User}
                  color="text-slate-500 bg-slate-50"
                />
                <MiniInfoItem
                  label="DOB"
                  value={
                    candidate.birthdate
                      ? format(new Date(candidate.birthdate), "MMM dd, yyyy")
                      : "Not Provided"
                  }
                  icon={Calendar}
                  color="text-slate-500 bg-slate-50"
                />
                <MiniInfoItem
                  label="Residing"
                  value={displayLocation}
                  icon={MapPin}
                  color="text-slate-500 bg-slate-50"
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-[9px] font-black text-slate-900 mb-3.5 uppercase tracking-[0.2em] border-b border-slate-50 pb-2">
                Education
              </h3>
              <div className="space-y-2">
                <MiniInfoItem
                  label="Institution"
                  value={eduInstitution}
                  icon={GraduationCap}
                  color="text-slate-500 bg-slate-50"
                />
                <MiniInfoItem
                  label="Credential"
                  value={eduDegree}
                  icon={FileText}
                  color="text-slate-500 bg-slate-50"
                />
                <MiniInfoItem
                  label="Passout Year"
                  value={eduYear}
                  icon={Calendar}
                  color="text-slate-500 bg-slate-50"
                />
                <MiniInfoItem
                  label="Referral Path"
                  value={candidate.referral || "Organic Application"}
                  icon={Send}
                  color="text-slate-500 bg-slate-50"
                />
              </div>
            </div>

            <div className="mt-auto">
              <h3 className="text-[9px] font-black text-slate-900 mb-2 uppercase tracking-[0.2em]">
                Private Notes
              </h3>
              <div className="relative">
                <textarea
                  placeholder="Add recruiter context..."
                  className="w-full h-20 bg-slate-50 border border-slate-200/50 rounded-xl p-3 text-[9px] font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showScheduler && (
        <InterviewScheduler
          candidateName={candidate.full_name}
          applicationId={applicationId}
          onClose={() => setShowScheduler(false)}
          onSuccess={() => {
            setShowScheduler(false);
            onClose();
          }}
        />
      )}
    </div>
  );
}

function MiniInfoItem({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5 text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">
        <Icon className={`w-2 h-2 ${color?.split(" ")[0] || ""}`} />
        {label}
      </div>
      <div
        className={`px-2 py-1.5 rounded-lg text-[9px] font-black border border-slate-100/50 ${color?.split(" ")[1] || "bg-slate-50/50"} text-slate-700 truncate mr-0.5 shadow-xs tracking-tighter`}
      >
        {value}
      </div>
    </div>
  );
}
