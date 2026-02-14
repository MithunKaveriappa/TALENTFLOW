"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import RecruiterSidebar from "@/components/RecruiterSidebar";

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Job Form Data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: [] as string[],
    skills_required: [] as string[],
    experience_band: "mid",
    job_type: "onsite",
    location: "",
    salary_range: "",
    number_of_positions: 1,
    is_ai_generated: false,
  });

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(true);

  const [profile, setProfile] = useState<{ assessment_status?: string } | null>(
    null,
  );

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        try {
          const profileData = await apiClient.get(
            "/recruiter/profile",
            session.access_token,
          );
          setProfile(profileData);
        } catch (err) {
          console.error("Failed to load profile:", err);
        }
      }
    }
    loadProfile();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      await apiClient.post("/recruiter/jobs", formData, session.access_token);
      router.push("/dashboard/recruiter/jobs");
    } catch (err) {
      console.error("Failed to create job:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt) return;
    setAiLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const aiResult = await apiClient.post(
        "/recruiter/jobs/generate-ai",
        {
          prompt: aiPrompt,
          experience_band: formData.experience_band,
        },
        session.access_token,
      );

      setFormData({
        ...formData,
        ...aiResult,
        is_ai_generated: true,
      });
    } catch (err) {
      console.error("AI Generation failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <RecruiterSidebar assessmentStatus={profile?.assessment_status} />

      <main className="flex-1 ml-64 p-6 md:p-12 min-h-screen overflow-y-auto">
        <div className="max-w-350 w-full mx-auto">
          <header className="mb-12 text-center md:text-left">
            <button
              onClick={() => router.push("/dashboard/recruiter/jobs")}
              className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4 hover:text-indigo-600 transition-colors"
            >
              ← Back to Inventory
            </button>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
                  Post a Job
                </h1>
                <p className="text-slate-500 font-medium">
                  Broadcast your signals to the elite candidate pool.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAiAssistant(!showAiAssistant)}
                  className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    showAiAssistant
                      ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                      : "bg-white text-slate-400 border border-slate-200 hover:border-indigo-600 hover:text-indigo-600"
                  }`}
                >
                  {showAiAssistant
                    ? "Close AI Assistant"
                    : "Open AI Assistant ✨"}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm active:scale-95"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Main Posting Form */}
            <div className="flex-1 w-full">
              <form
                onSubmit={handleCreateJob}
                className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-100/20 space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Job Title
                    </label>
                    <input
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 font-black text-xl uppercase tracking-tight focus:ring-2 focus:ring-indigo-600 transition-all"
                      placeholder="SOFTWARE ENGINEER"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Job Description
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 font-medium h-48 focus:ring-2 focus:ring-indigo-600 transition-all"
                      placeholder="Describe the role and its impact..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Experience Level
                    </label>
                    <select
                      value={formData.experience_band}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experience_band: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-bold"
                    >
                      <option value="fresher">Fresher (0-2 years)</option>
                      <option value="mid">Mid-Level (2-5 years)</option>
                      <option value="senior">Senior (5-10 years)</option>
                      <option value="leadership">Leadership (10+ years)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Salary Range
                    </label>
                    <input
                      value={formData.salary_range}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salary_range: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-bold"
                      placeholder="e.g. $80k - $120k"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Key Skills (comma separated)
                    </label>
                    <input
                      value={formData.skills_required?.join(", ") || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          skills_required: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter((s) => s !== ""),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-bold"
                      placeholder="Python, React, Fast API..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Role Requirements (one per line)
                    </label>
                    <textarea
                      value={formData.requirements?.join("\n") || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requirements: e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter((s) => s !== ""),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium h-32"
                      placeholder="Requirement 1&#10;Requirement 2..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Number of Positions
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.number_of_positions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          number_of_positions: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-bold"
                      placeholder="e.g. 1"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Job Type
                    </label>
                    <select
                      value={formData.job_type}
                      onChange={(e) =>
                        setFormData({ ...formData, job_type: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-bold"
                    >
                      <option value="onsite">On-site</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Location
                    </label>
                    <input
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-bold"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  {loading ? "Broadcasting..." : "Publish Job Posting"}
                </button>
              </form>
            </div>

            {/* AI Assistant Sidebar */}
            {showAiAssistant && (
              <div className="w-full lg:w-100 sticky top-12">
                <div className="bg-white p-8 rounded-4xl border border-indigo-100 shadow-xl shadow-indigo-100/30 border-t-8 border-t-indigo-600">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xl">
                      ✨
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight">
                        AI Role Architect
                      </h2>
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                        Powered by Gemini
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        Describe the Role
                      </label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. Senior Node.js Developer for a high-traffic e-commerce platform. Focus on performance and AWS migration."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 font-medium h-48 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all mb-4"
                      />
                      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-50 mb-6">
                        <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                          Tip: Mention specific technology, team size, or
                          mission to get better results.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleAIGenerate}
                      disabled={aiLoading || !aiPrompt}
                      className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 disabled:opacity-50 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      {aiLoading ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Architecting...</span>
                        </div>
                      ) : (
                        "Generate Draft ✨"
                      )}
                    </button>

                    <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      AI updates the form fields automatically
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

