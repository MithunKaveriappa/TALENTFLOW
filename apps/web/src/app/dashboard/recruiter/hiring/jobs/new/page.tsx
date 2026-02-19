"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import {
  Plus,
  Sparkles,
  Briefcase,
  Target,
  Layers,
  MapPin,
  Users,
  DollarSign,
  Zap,
  ArrowLeft,
  Globe,
  X,
  Send,
  Workflow,
} from "lucide-react";
import LockedView from "@/components/dashboard/LockedView";

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [checkingLock, setCheckingLock] = useState(true);

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
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;
        const profile = await apiClient.get(
          "/recruiter/profile",
          session.access_token,
        );
        if ((profile?.companies?.profile_score ?? 0) === 0) {
          setIsLocked(true);
        }
      } catch (err) {
        console.error("Lock check failed:", err);
      } finally {
        setCheckingLock(false);
      }
    }
    checkAccess();
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
      router.push("/dashboard/recruiter/hiring/jobs");
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
      setShowAiAssistant(false); // Close on success
    } catch (err) {
      console.error("AI Generation failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  if (checkingLock) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="p-12 min-h-screen bg-slate-50">
        <LockedView featureName="Job Creator" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-20 w-full backdrop-blur-md bg-white/80">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/recruiter/hiring/jobs")}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <h1 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
            Create New Role
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAiAssistant(!showAiAssistant)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              showAiAssistant
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Architect
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <button
            onClick={handleCreateJob}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              "Publishing..."
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Publish
              </>
            )}
          </button>
        </div>
      </header>

      {/* AI Assistant Overlay */}
      {showAiAssistant && (
        <div className="fixed inset-x-0 top-16 z-30 animate-in slide-in-from-top duration-300">
          <div className="max-w-4xl mx-auto p-4">
            <div className="bg-indigo-600 rounded-2xl shadow-2xl p-6 border border-indigo-400 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles className="w-32 h-32 text-white" />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-white font-black text-lg uppercase tracking-tight flex items-center gap-2">
                      Smart Role Architect
                    </h2>
                    <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">
                      Describe the mission, AI will handle the details
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAiAssistant(false)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-4">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer for our DeFi platform. Expertise in React and Web3..."
                    className="flex-1 bg-indigo-700/50 border border-indigo-400/50 rounded-xl p-4 text-white placeholder:text-indigo-300/50 text-sm font-medium focus:ring-2 focus:ring-white/20 outline-none resize-none h-24"
                  />
                  <button
                    onClick={handleAIGenerate}
                    disabled={aiLoading || !aiPrompt}
                    className="bg-white text-indigo-600 px-8 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 shadow-xl self-end h-16"
                  >
                    {aiLoading ? "Thinking..." : "Generate ✨"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-8 max-w-4xl mx-auto w-full pb-20">
        <form onSubmit={handleCreateJob} className="space-y-8">
          {/* Section: Role Identity */}
          <Section title="Role Architecture" icon={Briefcase}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Job Title" icon={Target} fullWidth>
                <input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  placeholder="e.g. Lead Software Architect"
                />
              </Field>
              <Field label="Experience Band" icon={Layers}>
                <select
                  value={formData.experience_band}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experience_band: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="fresher">Fresher (0-2y)</option>
                  <option value="mid">Mid-Level (2-5y)</option>
                  <option value="senior">Senior (5-10y)</option>
                  <option value="leadership">Leadership (10y+)</option>
                </select>
              </Field>
              <Field label="Engagement Type" icon={Workflow}>
                <select
                  value={formData.job_type}
                  onChange={(e) =>
                    setFormData({ ...formData, job_type: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                </select>
              </Field>
            </div>
          </Section>

          {/* Section: Mission & Details */}
          <Section title="Mission & Impact" icon={Zap}>
            <Field label="Description" icon={Zap} fullWidth>
              <textarea
                required
                rows={6}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                placeholder="Describe the mission and daily impact of this role..."
              />
            </Field>
          </Section>

          {/* Section: Requirements & Skills */}
          <Section title="Signal Alignment" icon={Sparkles}>
            <div className="space-y-6">
              <Field label="Core Requirements" icon={Target} fullWidth>
                <textarea
                  rows={4}
                  value={formData.requirements?.join("\n") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requirements: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                  placeholder="Define technical or professional prerequisites (one per line)..."
                />
              </Field>
              <Field label="Technical Skills" icon={Zap} fullWidth>
                <input
                  value={formData.skills_required?.join(", ") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      skills_required: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  placeholder="e.g. Next.js, TypeScript, PostgreSQL (comma separated)"
                />
              </Field>
            </div>
          </Section>

          {/* Section: Market Alignment */}
          <Section title="Market Logistics" icon={Globe}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Location" icon={MapPin}>
                <input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  placeholder="City, Country"
                />
              </Field>
              <Field label="Openings" icon={Users}>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </Field>
              <Field label="Salary Range" icon={DollarSign}>
                <input
                  value={formData.salary_range}
                  onChange={(e) =>
                    setFormData({ ...formData, salary_range: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  placeholder="e.g. $120k - $160k"
                />
              </Field>
            </div>
          </Section>
        </form>
      </main>
    </div>
  );
}

// Reusable UI Components based on Profile Style
function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-sm font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-widest">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
          <Icon className="w-4 h-4" />
        </div>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
  fullWidth = false,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">
        <Icon className="w-3.5 h-3.5 mr-2 text-slate-300" />
        {label}
      </label>
      {children}
    </div>
  );
}
