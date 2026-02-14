"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Settings,
  Building2,
  Globe,
  MapPin,
  Tag,
  Target,
  DollarSign,
  User,
  Linkedin,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import RecruiterSidebar from "@/components/RecruiterSidebar";

interface Company {
  id: string;
  name: string;
  website: string;
  location: string;
  description: string;
  domain: string;
  industry_category: string;
  sales_model: string;
  avg_deal_size_range: string;
  hiring_focus_areas: string[];
}

interface RecruiterProfile {
  full_name: string;
  job_title: string;
  linkedin_url: string;
  bio: string;
  company_id: string;
  companies: Company;
  is_verified?: boolean;
  assessment_status?: string;
}

export default function RecruiterProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();
        if (!authSession) {
          router.replace("/login");
          return;
        }

        const data = await apiClient.get(
          "/recruiter/profile",
          authSession.access_token,
        );
        setProfile(data);
      } catch (err) {
        console.error("Failed to load recruiter profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const {
        data: { session: authSession },
      } = await supabase.auth.getSession();
      if (!authSession) return;

      // Update Recruiter Info
      await apiClient.patch(
        "/recruiter/profile",
        {
          full_name: profile.full_name,
          job_title: profile.job_title,
          linkedin_url: profile.linkedin_url,
          bio: profile.bio,
        },
        authSession.access_token,
      );

      // Update Company Info
      await apiClient.patch(
        "/recruiter/company",
        {
          name: profile.companies.name,
          website: profile.companies.website,
          location: profile.companies.location,
          description: profile.companies.description,
          domain: profile.companies.domain,
          industry_category: profile.companies.industry_category,
          sales_model: profile.companies.sales_model,
          avg_deal_size_range: profile.companies.avg_deal_size_range,
          hiring_focus_areas: profile.companies.hiring_focus_areas,
        },
        authSession.access_token,
      );

      setMessage({
        type: "success",
        text: "Identity signals synchronized successfully.",
      });
    } catch (err) {
      console.error("Failed to update profile:", err);
      setMessage({
        type: "error",
        text: "Failed to sync signals. Please check your connection.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <RecruiterSidebar assessmentStatus={profile?.assessment_status} />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10 w-full">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <div
                className={`w-2 h-2 rounded-full ${
                  profile?.is_verified ? "bg-green-500" : "bg-amber-500"
                } animate-pulse`}
              />
              <span className="text-sm font-medium text-slate-600">
                Hub Status: {profile?.is_verified ? "Active" : "Pending Sync"}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-blue-600 bg-blue-50 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200">
              {profile?.full_name?.[0] || "R"}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm active:scale-95 ml-2"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="p-8 max-w-5xl mx-auto w-full">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Profile Settings
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Manage your professional identity and company details
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-8 pb-20">
            {message.text && (
              <div
                className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm transition-all ${
                  message.type === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <CheckCircle2
                  className={`w-5 h-5 ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
                />
                <p className="text-sm font-semibold">{message.text}</p>
              </div>
            )}

            {/* Recruiter Details */}
            <Section title="Professional Liaison" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Full Name" icon={User}>
                  <input
                    type="text"
                    value={profile?.full_name || ""}
                    onChange={(e) =>
                      setProfile((p) =>
                        p ? { ...p, full_name: e.target.value } : null,
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  />
                </Field>
                <Field label="Job Title" icon={Briefcase}>
                  <input
                    type="text"
                    value={profile?.job_title || ""}
                    onChange={(e) =>
                      setProfile((p) =>
                        p ? { ...p, job_title: e.target.value } : null,
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  />
                </Field>
                <Field label="LinkedIn Profile" icon={Linkedin}>
                  <input
                    type="text"
                    value={profile?.linkedin_url || ""}
                    onChange={(e) =>
                      setProfile((p) =>
                        p ? { ...p, linkedin_url: e.target.value } : null,
                      )
                    }
                    placeholder="linkedin.com/in/username"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  />
                </Field>
                <Field label="Professional Bio" icon={FileText} fullWidth>
                  <textarea
                    rows={3}
                    value={profile?.bio || ""}
                    onChange={(e) =>
                      setProfile((p) =>
                        p ? { ...p, bio: e.target.value } : null,
                      )
                    }
                    placeholder="Brief professional intro..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
                  />
                </Field>
              </div>
            </Section>

            {/* Company Details */}
            <Section title="Company Intelligence" icon={Building2}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Company Name" icon={Building2}>
                  <input
                    type="text"
                    value={profile?.companies?.name || ""}
                    onChange={(e) =>
                      setProfile((p) =>
                        p
                          ? {
                              ...p,
                              companies: {
                                ...p.companies,
                                name: e.target.value,
                              },
                            }
                          : null,
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  />
                </Field>
                <Field label="Official Website" icon={Globe}>
                  <input
                    type="url"
                    value={profile?.companies?.website || ""}
                    onChange={(e) =>
                      setProfile((p) =>
                        p
                          ? {
                              ...p,
                              companies: {
                                ...p.companies,
                                website: e.target.value,
                              },
                            }
                          : null,
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  />
                </Field>
                <Field label="Headquarters" icon={MapPin}>
                  <input
                    type="text"
                    value={profile?.companies?.location || ""}
                    onChange={(e) =>
                      setProfile((p) =>
                        p
                          ? {
                              ...p,
                              companies: {
                                ...p.companies,
                                location: e.target.value,
                              },
                            }
                          : null,
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  />
                </Field>
                <Field label="Industry / Domain" icon={Tag}>
                  <input
                    type="text"
                    value={profile?.companies?.industry_category || ""}
                    onChange={(e) =>
                      setProfile((p) =>
                        p
                          ? {
                              ...p,
                              companies: {
                                ...p.companies,
                                industry_category: e.target.value,
                              },
                            }
                          : null,
                      )
                    }
                    placeholder="e.g. Fintech, SaaS, HealthTech"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  />
                </Field>
                <Field label="Sales Model" icon={Target}>
                  <select
                    value={profile?.companies?.sales_model || ""}
                    onChange={(e) =>
                      setProfile((p) =>
                        p
                          ? {
                              ...p,
                              companies: {
                                ...p.companies,
                                sales_model: e.target.value,
                              },
                            }
                          : null,
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none"
                  >
                    <option value="">Select Model</option>
                    <option value="Inbound">Inbound</option>
                    <option value="Outbound">Outbound</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </Field>
                <Field label="Avg. Deal Size" icon={DollarSign}>
                  <select
                    value={profile?.companies?.avg_deal_size_range || ""}
                    onChange={(e) =>
                      setProfile((p) =>
                        p
                          ? {
                              ...p,
                              companies: {
                                ...p.companies,
                                avg_deal_size_range: e.target.value,
                              },
                            }
                          : null,
                      )
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none"
                  >
                    <option value="">Select Range</option>
                    <option value="< $10k">Under $10k</option>
                    <option value="$10k - $50k">$10k - $50k</option>
                    <option value="$50k - $150k">$50k - $150k</option>
                    <option value="$150k+">$150k+</option>
                  </select>
                </Field>
                <Field label="Company Mission" icon={FileText} fullWidth>
                  <textarea
                    rows={4}
                    value={profile?.companies?.description || ""}
                    onChange={(e) =>
                      setProfile((p) =>
                        p
                          ? {
                              ...p,
                              companies: {
                                ...p.companies,
                                description: e.target.value,
                              },
                            }
                          : null,
                      )
                    }
                    placeholder="What makes your company a great place for sales talent?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
                  />
                </Field>
              </div>
            </Section>

            <div className="flex justify-end gap-3 pt-6">
              <Link
                href="/dashboard/recruiter"
                className="px-6 py-2.5 rounded-lg font-bold text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
              >
                Discard Changes
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-10 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-100 active:scale-95"
              >
                {saving ? "SAVING..." : "SAVE PROFILE"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

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
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          <Icon className="w-5 h-5" />
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
      <label className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 ml-1">
        <Icon className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
        {label}
      </label>
      {children}
    </div>
  );
}

