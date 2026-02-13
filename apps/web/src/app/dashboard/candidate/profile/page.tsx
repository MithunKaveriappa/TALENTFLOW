"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  completion_score?: number;
  experience?: string;
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
    router.push("/login");
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
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
    const { name, value } = e.target;
    setProfile((prev) => (prev ? { ...prev, [name]: value } : null));
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push("/dashboard/candidate")}
              className="text-slate-400 hover:text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-2 flex items-center gap-2 transition-colors"
            >
              ← Back to Command Center
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
              Manage Profile
            </h1>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Profile Completion
              </span>
              <div className="text-2xl font-black text-indigo-600 italic">
                {profile?.completion_score || 0}%
              </div>
            </div>

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
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl border ${message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"} font-bold text-sm`}
          >
            {message.text}
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
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Experience Band (Read Only)
                </label>
                <div className="w-full px-6 py-4 rounded-xl bg-slate-100 border border-slate-200 font-black text-slate-400 uppercase tracking-widest">
                  {profile?.experience || "Not Set"}
                </div>
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
                  Total Years of Experience
                </label>
                <input
                  type="number"
                  name="years_of_experience"
                  value={profile?.years_of_experience || 0}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-slate-700"
                />
              </div>
            </div>
          </div>

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

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-400 text-xs text-center">
                Skills, CRM Tools, and Sales Methodologies are synchronized from
                your initial assessment and resume analysis. Manual editing of
                these core signals is restricted in Phase 1 to ensure system
                trust.
              </div>
            </div>
          </div>

          {/* Section 4: Professional Links */}
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
      </div>
    </div>
  );
}
