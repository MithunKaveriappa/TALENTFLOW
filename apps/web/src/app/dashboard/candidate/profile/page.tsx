"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

interface EducationEntry {
  degree: string;
  field: string;
  institution: string;
  start_date: string;
  end_date: string;
  gpa_score: number | null;
}

interface ExperienceEntry {
  role: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  descriptions: string[];
}

interface CareerGapReport {
  has_gap_exceeding_6mo?: boolean;
  has_gap_exceeding_12mo?: boolean;
  total_gap_months?: number;
  explanation?: string;
  confidence_score?: number;
}

interface ProfileData {
  full_name?: string;
  phone_number?: string;
  bio?: string;
  profile_photo_url?: string;
  current_role?: string;
  years_of_experience?: number;
  primary_industry_focus?: string;
  current_employment_status?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  job_type?: string;
  expected_salary?: number;
  location_tier?: string;
  assessment_status?: string;
  completion_score?: number;
  experience?: string;
  gender?: string;
  birthdate?: string;
  university?: string;
  qualification_held?: string;
  graduation_year?: number;
  referral?: string;
  location?: string;
  education_history?: EducationEntry[];
  experience_history?: ExperienceEntry[];
  career_gap_report?: CareerGapReport;
}

export default function CandidateProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/login");
          return;
        }

        const data = await apiClient.get(
          "/candidate/profile",
          session.access_token,
        );
        setProfile(data);
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    let finalValue: string | number | null = value;

    if (type === "number") {
      finalValue = value === "" ? null : Number(value);
    }

    setProfile((prev) => (prev ? { ...prev, [name]: finalValue } : null));
  };

  const handleArrayInputChange = (
    field: "education_history" | "experience_history",
    index: number,
    name: string,
    value: string | number | boolean | null | string[],
  ) => {
    setProfile((prev) => {
      if (!prev) return null;
      if (field === "education_history") {
        const history = [...(prev.education_history || [])];
        history[index] = { ...history[index], [name]: value } as EducationEntry;
        return { ...prev, education_history: history };
      } else {
        const history = [...(prev.experience_history || [])];
        history[index] = {
          ...history[index],
          [name]: value,
        } as ExperienceEntry;
        return { ...prev, experience_history: history };
      }
    });
  };

  const addHistoryItem = (
    field: "education_history" | "experience_history",
  ) => {
    setProfile((prev) => {
      if (!prev) return null;
      const history = [...(prev[field] || [])];

      const newItem =
        field === "education_history"
          ? {
              degree: "",
              field: "",
              institution: "",
              start_date: "",
              end_date: "",
              gpa_score: null,
            }
          : {
              role: "",
              company: "",
              location: "",
              start_date: "",
              end_date: "",
              is_current: false,
              descriptions: [""],
            };

      history.push(newItem);
      return { ...prev, [field]: history };
    });
  };

  const removeHistoryItem = (
    field: "education_history" | "experience_history",
    index: number,
  ) => {
    setProfile((prev) => {
      if (!prev) return null;
      const history = [...(prev[field] || [])];
      history.splice(index, 1);
      return { ...prev, [field]: history };
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/profile-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // 3. Update Profile state and notify backend
      setProfile((prev) =>
        prev ? { ...prev, profile_photo_url: publicUrl } : null,
      );

      const {
        data: { session },
      } = await supabase.auth.getSession();
      await apiClient.patch(
        "/candidate/profile",
        { profile_photo_url: publicUrl },
        session?.access_token,
      );

      setMessage({ type: "success", text: "Photo updated successfully!" });
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload photo";
      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const result = await apiClient.patch(
        "/candidate/profile",
        profile,
        session?.access_token,
      );

      setProfile((prev) =>
        prev ? { ...prev, completion_score: result.completion_score } : null,
      );
      setMessage({ type: "success", text: "Profile updated successfully!" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      console.error("Save error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRetakeAssessment = async () => {
    if (
      !confirm(
        "Are you sure you want to retake the assessment? Your current scores will be permanently deleted and you will start fresh.",
      )
    )
      return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await apiClient.post("/assessment/retake", {}, session?.access_token);
      router.push("/assessment/candidate");
    } catch (err) {
      console.error("Retake error:", err);
      alert("Failed to reset assessment. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">
          Syncing Identity Nexus...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-5xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Identity <span className="text-indigo-600 font-black">Nexus</span>
            </h1>
            <div className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-md border border-indigo-200 shadow-sm">
              Secured Profile
            </div>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
            <ShieldCheck className="h-3 w-3 text-indigo-500" />
            Manage your high-fidelity professional signals.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/candidate")}
          className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200"
        >
          ← Commander View
        </button>
      </header>

      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex items-center gap-8 bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-indigo-600/10 transition-all duration-700" />
          <div className="text-left relative z-10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Profile Completion
            </span>
            <div className="text-2xl font-black text-indigo-600 italic">
              {profile?.completion_score || 0}%
            </div>
          </div>

          <div className="flex-1" />

          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 group"
          >
            <span className="text-[10px] font-bold text-slate-300 group-hover:text-red-400 uppercase tracking-widest transition-colors">
              Session
            </span>
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-red-500 group-hover:border-red-100 group-hover:bg-red-50 transition-all shadow-sm">
              <svg
                className="h-5 w-5 transition-transform group-hover:scale-110"
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
            </div>
          </button>
        </div>

        {message?.text && (
          <div
            className={`p-4 rounded-2xl border ${message?.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"} font-bold text-sm`}
          >
            {message?.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Identity */}
          <div className="bg-white rounded-4xl p-8 md:p-12 shadow-sm border border-slate-200/60 overflow-hidden relative">
            <h3 className="text-xl font-black text-slate-900 mb-10 flex items-center gap-3 italic">
              <span className="h-1 w-8 bg-indigo-600 rounded-full" />
              IDENTITY & BIO
            </h3>

            <div className="flex flex-col md:flex-row gap-12 items-start">
              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-4 group">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="h-32 w-32 rounded-4xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer overflow-hidden relative group-hover:border-indigo-400 transition-all"
                >
                  {profile?.profile_photo_url ? (
                    <Image
                      src={profile.profile_photo_url}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <svg
                      className="h-8 w-8 text-slate-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                  accept="image/*"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {uploading ? "Uploading..." : "Click to Upload Photo"}
                </span>
              </div>

              {/* Basic Fields */}
              <div className="flex-1 space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={profile?.full_name || ""}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-700"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone_number"
                      value={profile?.phone_number || ""}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-700"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={profile?.gender || ""}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-700 appearance-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="birthdate"
                      value={profile?.birthdate || ""}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={profile?.location || ""}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-700"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Professional Bio
                  </label>
                  <textarea
                    name="bio"
                    value={profile?.bio || ""}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-700 min-h-30"
                    placeholder="Tell your professional story..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Career Details */}
          <div className="bg-white rounded-4xl p-8 md:p-12 shadow-sm border border-slate-200/60">
            <h3 className="text-xl font-black text-slate-900 mb-10 flex items-center gap-3 italic">
              <span className="h-1 w-8 bg-indigo-600 rounded-full" />
              CAREER & EXPERIENCE
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Current Role
                </label>
                <input
                  type="text"
                  name="current_role"
                  value={profile?.current_role || ""}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-700"
                  placeholder="e.g. Senior Account Executive"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  Experience Band
                  {profile?.assessment_status === "completed" && (
                    <div className="flex items-center gap-1 text-[8px] text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      <svg
                        className="h-2.5 w-2.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      LOCKED
                    </div>
                  )}
                </label>
                {profile?.assessment_status === "completed" ? (
                  <div className="w-full px-6 py-4 rounded-xl bg-slate-100 border border-slate-200 font-black text-slate-400 uppercase tracking-widest flex justify-between items-center group/lock">
                    <span>{profile?.experience || "Not Set"}</span>
                    <span className="text-[8px] opacity-0 group-hover/lock:opacity-100 transition-opacity">
                      Requires Assessment Reset to change
                    </span>
                  </div>
                ) : (
                  <select
                    name="experience"
                    value={profile?.experience || "fresher"}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-700 appearance-none"
                  >
                    <option value="fresher">Fresher</option>
                    <option value="mid">Mid-Level</option>
                    <option value="senior">Senior</option>
                    <option value="leadership">Leadership</option>
                  </select>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Job Preference
                </label>
                <select
                  name="job_type"
                  value={profile?.job_type || "onsite"}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-700 appearance-none"
                >
                  <option value="onsite">On-Site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Expected Annual Salary (LPA / $)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="expected_salary"
                    value={profile?.expected_salary || ""}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-700"
                    placeholder="e.g. 1200000"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest pointer-events-none">
                    Target
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                  Total Years of Experience
                  {profile?.assessment_status === "completed" && (
                    <div className="px-1.5 py-0.5 rounded bg-slate-100 text-[7px] font-black text-slate-400 border border-slate-200 uppercase tracking-widest">
                      LOCKED
                    </div>
                  )}
                </label>
                {profile?.assessment_status === "completed" ? (
                  <div className="w-full px-6 py-4 rounded-xl bg-slate-100 border border-slate-200 font-black text-slate-400 uppercase tracking-widest flex justify-between items-center group/lock">
                    <span>{profile?.years_of_experience || "0"} Years</span>
                    <span className="text-[8px] opacity-0 group-hover/lock:opacity-100 transition-opacity">
                      Locked post-assessment
                    </span>
                  </div>
                ) : (
                  <input
                    type="number"
                    name="years_of_experience"
                    value={profile?.years_of_experience || 0}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-700"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Career Gap Report - AI Insight */}
          {profile?.career_gap_report &&
            (profile.career_gap_report.has_gap_exceeding_6mo ||
              profile.career_gap_report.has_gap_exceeding_12mo) && (
              <div className="bg-amber-50 rounded-4xl p-8 md:p-12 shadow-sm border border-amber-200/60 transition-all hover:bg-amber-100/50">
                <h3 className="text-xl font-black text-amber-900 mb-6 flex items-center gap-3 italic">
                  <span className="h-1 w-8 bg-amber-600 rounded-full" />
                  AI INTEGRITY AUDIT: CAREER GAPS
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-6 bg-white/60 rounded-2xl border border-amber-200">
                    <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-900">
                        {profile.career_gap_report?.has_gap_exceeding_12mo
                          ? "Significant Career Gap Detected (>12 Months)"
                          : "Moderate Career Gap Detected (>6 Months)"}
                      </p>
                      <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                        Precision analysis identifies chronological gaps in your
                        professional history.{" "}
                        {profile.career_gap_report?.explanation ||
                          "Providing context for these periods during interviews is recommended to maintain high trust scores."}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/40 rounded-xl border border-amber-200/50">
                      <span className="text-[8px] font-black uppercase text-amber-600 tracking-tighter block mb-1">
                        TOTAL GAP DURATION
                      </span>
                      <span className="text-sm font-black text-amber-900">
                        {profile.career_gap_report?.total_gap_months || 0}{" "}
                        Months
                      </span>
                    </div>
                    <div className="p-4 bg-white/40 rounded-xl border border-amber-200/50">
                      <span className="text-[8px] font-black uppercase text-amber-600 tracking-tighter block mb-1">
                        CONFIDENCE SCORE
                      </span>
                      <span className="text-sm font-black text-amber-900">
                        {((profile?.career_gap_report?.confidence_score ||
                          0) as number) * 100}
                        %
                      </span>
                    </div>
                    <div className="p-4 bg-white/40 rounded-xl border border-amber-200/50">
                      <span className="text-[8px] font-black uppercase text-amber-600 tracking-tighter block mb-1">
                        AUDIT TIMESTAMP
                      </span>
                      <span className="text-sm font-black text-amber-900">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Section 3: Sales Intelligence */}
          <div className="bg-white rounded-4xl p-8 md:p-12 shadow-sm border border-slate-200/60">
            <h3 className="text-xl font-black text-slate-900 mb-10 flex items-center gap-3 italic">
              <span className="h-1 w-8 bg-indigo-600 rounded-full" />
              SALES INTELLIGENCE
            </h3>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Primary Industry Focus
                  </label>
                  <input
                    type="text"
                    name="primary_industry_focus"
                    value={profile?.primary_industry_focus || ""}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-700"
                    placeholder="e.g. Fintech, SaaS, Healthtech"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Current Employment Status
                  </label>
                  <select
                    name="current_employment_status"
                    value={profile?.current_employment_status || "Employed"}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-700 appearance-none"
                  >
                    <option value="Employed">Employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Student">Student</option>
                  </select>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-400 text-xs text-center flex items-center justify-center gap-3">
                <svg
                  className="h-4 w-4 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>
                  Skills, CRM Tools, and Sales Methodologies are synchronized
                  from your initial assessment and resume analysis. Manual
                  editing of these core signals is restricted to ensure system
                  trust.
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Education & History */}
          <div className="bg-white rounded-4xl p-8 md:p-12 shadow-sm border border-slate-200/60">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 italic">
                <span className="h-1 w-8 bg-indigo-600 rounded-full" />
                ACADEMIC & EXPERIENCE HISTORY
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addHistoryItem("education_history")}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-all"
                >
                  + Add Education
                </button>
                <button
                  type="button"
                  onClick={() => addHistoryItem("experience_history")}
                  className="px-4 py-2 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100 hover:bg-slate-100 transition-all"
                >
                  + Add Experience
                </button>
              </div>
            </div>

            {/* Dynamic Education Section */}
            <div className="space-y-8">
              {(profile?.education_history || []).map(
                (edu: EducationEntry, index: number) => (
                  <div
                    key={index}
                    className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group animate-in slide-in-from-right-4 duration-300"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        removeHistoryItem("education_history", index)
                      }
                      className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                    >
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Institution
                        </label>
                        <input
                          type="text"
                          value={edu.institution || ""}
                          onChange={(e) =>
                            handleArrayInputChange(
                              "education_history",
                              index,
                              "institution",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-100 focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          GPA Score
                        </label>
                        <input
                          type="text"
                          value={edu.gpa_score || ""}
                          onChange={(e) =>
                            handleArrayInputChange(
                              "education_history",
                              index,
                              "gpa_score",
                              e.target.value,
                            )
                          }
                          placeholder="e.g. 3.8/4.0"
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-100 focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Degree
                        </label>
                        <input
                          type="text"
                          value={edu.degree || ""}
                          onChange={(e) =>
                            handleArrayInputChange(
                              "education_history",
                              index,
                              "degree",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-100 focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Start Date
                        </label>
                        <input
                          type="text"
                          value={edu.start_date || ""}
                          onChange={(e) =>
                            handleArrayInputChange(
                              "education_history",
                              index,
                              "start_date",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-100 focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700 font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          End Date
                        </label>
                        <input
                          type="text"
                          value={edu.end_date || ""}
                          onChange={(e) =>
                            handleArrayInputChange(
                              "education_history",
                              index,
                              "end_date",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-100 focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ),
              )}

              {/* Dynamic Experience Section */}
              <div className="pt-10 border-t border-slate-100">
                {(profile?.experience_history || []).map(
                  (exp: ExperienceEntry, index: number) => (
                    <div
                      key={index}
                      className="mb-6 p-6 bg-white rounded-2xl border-2 border-slate-100 relative group transition-all hover:border-indigo-100"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          removeHistoryItem("experience_history", index)
                        }
                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500"
                      >
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Role
                          </label>
                          <input
                            type="text"
                            value={exp.role || ""}
                            onChange={(e) =>
                              handleArrayInputChange(
                                "experience_history",
                                index,
                                "role",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500/20 font-extrabold text-slate-800"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Company
                          </label>
                          <input
                            type="text"
                            value={exp.company || ""}
                            onChange={(e) =>
                              handleArrayInputChange(
                                "experience_history",
                                index,
                                "company",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500/20 font-extrabold text-slate-800"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Location
                          </label>
                          <input
                            type="text"
                            value={exp.location || ""}
                            onChange={(e) =>
                              handleArrayInputChange(
                                "experience_history",
                                index,
                                "location",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Start Date
                          </label>
                          <input
                            type="text"
                            value={exp.start_date || ""}
                            onChange={(e) =>
                              handleArrayInputChange(
                                "experience_history",
                                index,
                                "start_date",
                                e.target.value,
                              )
                            }
                            placeholder="MM/YYYY or Year"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700 font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            End Date
                          </label>
                          <input
                            type="text"
                            value={exp.end_date || ""}
                            onChange={(e) =>
                              handleArrayInputChange(
                                "experience_history",
                                index,
                                "end_date",
                                e.target.value,
                              )
                            }
                            placeholder="MM/YYYY or Present"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700 font-mono"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Key Achievements (STAR Method Preferred)
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const newDescriptions = [
                                ...(exp.descriptions || []),
                                "",
                              ];
                              handleArrayInputChange(
                                "experience_history",
                                index,
                                "descriptions",
                                newDescriptions,
                              );
                            }}
                            className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                          >
                            + Add Line
                          </button>
                        </div>
                        {(exp.descriptions || []).map(
                          (desc: string, descIndex: number) => (
                            <div
                              key={descIndex}
                              className="relative group/desc"
                            >
                              <textarea
                                value={desc}
                                onChange={(e) => {
                                  const newDescriptions = [
                                    ...(exp.descriptions || []),
                                  ];
                                  newDescriptions[descIndex] = e.target.value;
                                  handleArrayInputChange(
                                    "experience_history",
                                    index,
                                    "descriptions",
                                    newDescriptions,
                                  );
                                }}
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-600 text-sm min-h-20"
                                placeholder="Describe your impact..."
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newDescriptions = [
                                    ...(exp.descriptions || []),
                                  ];
                                  newDescriptions.splice(descIndex, 1);
                                  handleArrayInputChange(
                                    "experience_history",
                                    index,
                                    "descriptions",
                                    newDescriptions,
                                  );
                                }}
                                className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover/desc:opacity-100 transition-opacity"
                              >
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
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>

              {/* Legacy / Backup Education Fields */}
              <div className="pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    University (Primary)
                  </label>
                  <input
                    type="text"
                    name="university"
                    value={profile?.university || ""}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-700"
                    placeholder="e.g. Stanford University"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Qualification Held
                  </label>
                  <input
                    type="text"
                    name="qualification_held"
                    value={profile?.qualification_held || ""}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-700"
                    placeholder="e.g. Bachelor of Business Admin"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    name="graduation_year"
                    value={profile?.graduation_year || ""}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-700"
                    placeholder="2022"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    How did you hear about us?
                  </label>
                  <input
                    type="text"
                    name="referral"
                    value={profile?.referral || ""}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-700"
                    placeholder="e.g. LinkedIn, Friend Name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Professional Links */}
          <div className="bg-slate-900 rounded-4xl p-8 md:p-12 shadow-2xl text-white relative overflow-hidden">
            <h3 className="text-xl font-black mb-10 flex items-center gap-3 italic">
              <span className="h-1 w-8 bg-indigo-400 rounded-full" />
              DIGITAL PRESENCE
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300 ml-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={profile?.linkedin_url || ""}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:bg-white/20 transition-all font-bold text-white placeholder-white/20"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300 ml-1">
                  Portfolio / Website URL
                </label>
                <input
                  type="url"
                  name="portfolio_url"
                  value={profile?.portfolio_url || ""}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:bg-white/20 transition-all font-bold text-white placeholder-white/20"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>

            {/* Mesh Background */}
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
              <div className="grid grid-cols-5 gap-1 h-full w-full">
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className="border-[0.5px] border-white h-full w-full"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-between items-center py-6">
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              Auto-saves only on submission
            </p>

            <button
              type="submit"
              disabled={saving}
              className={`px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center gap-4 ${
                saving
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-slate-900 hover:shadow-indigo-200"
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  SAVING SIGNALS...
                </>
              ) : (
                <>
                  SYNCHRONIZE PROFILE
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Danger Zone: Retake Assessment */}
        <div className="bg-white rounded-4xl p-8 md:p-12 shadow-sm border border-red-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-full blur-3xl -mr-16 -mt-16" />

          <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3 italic uppercase">
            <span className="h-1 w-8 bg-red-500 rounded-full" />
            Performance Reset
          </h3>

          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 max-w-xl">
            Unsatisfied with your current signals? You can reset your evaluation
            history to retake the assessment. This will{" "}
            <span className="text-red-600 font-bold uppercase underline">
              permanently delete
            </span>{" "}
            all previous scores and insights.
          </p>

          <button
            onClick={handleRetakeAssessment}
            className="px-8 py-4 bg-white border-2 border-red-100 text-red-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 shadow-sm"
          >
            RE-INITIALIZE EVALUATION ENGINE
          </button>
        </div>
      </div>
    </div>
  );
}
