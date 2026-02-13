"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

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
}

export default function RecruiterProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();
        if (!authSession) {
          router.push("/login");
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
            Accessing Corporate Vault...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - Reusing basic structure */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30">
        <div className="p-8 border-b border-slate-50">
          <div
            className="flex items-center gap-3"
            onClick={() => router.push("/dashboard/recruiter")}
            style={{ cursor: "pointer" }}
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
              <div className="h-5 w-5 rounded bg-white rotate-45" />
            </div>
            <span className="font-black text-slate-900 tracking-tighter uppercase text-lg">
              TalentFlow
            </span>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <button
            onClick={() => router.push("/dashboard/recruiter")}
            className="w-full flex items-center px-4 py-3 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold uppercase tracking-widest text-sm text-left"
          >
            Dashboard
          </button>
          <button
            onClick={() => router.push("/dashboard/recruiter/jobs")}
            className="w-full flex items-center px-4 py-3 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold uppercase tracking-widest text-sm text-left"
          >
            My Jobs
          </button>
          <button
            onClick={() => router.push("/dashboard/recruiter/jobs/new")}
            className="w-full flex items-center px-4 py-3 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold uppercase tracking-widest text-sm text-left"
          >
            Post a Role
          </button>
          <button
            onClick={() => router.push("/dashboard/recruiter/pool")}
            className="w-full flex items-center px-4 py-3 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold uppercase tracking-widest text-sm text-left"
          >
            Candidate Pool
          </button>
          <button className="w-full flex items-center px-4 py-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-bold uppercase tracking-widest text-sm text-left">
            Company Profile
          </button>
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group"
          >
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
            <span className="text-sm font-bold uppercase tracking-widest">
              Logout
            </span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase italic">
                CORPORATE IDENTITY
              </h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-3">
                Manage your liaison signals and company profile
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard/recruiter")}
                className="px-6 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Back to Command
              </button>
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
          </header>

          <form onSubmit={handleUpdateProfile} className="space-y-8 pb-20">
            {message.text && (
              <div
                className={`p-4 rounded-2xl flex items-center gap-3 border ${
                  message.type === "success"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                    : "bg-red-50 border-red-100 text-red-700"
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full ${message.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}
                />
                <p className="text-xs font-bold uppercase tracking-widest">
                  {message.text}
                </p>
              </div>
            )}

            {/* Recruiter Liaison Details */}
            <Section title="Recruiter Liaison Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Full Name">
                  <input
                    type="text"
                    value={profile?.full_name || ""}
                    onChange={(e) =>
                      setProfile((p) =>
                        p ? { ...p, full_name: e.target.value } : null,
                      )
                    }
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </Field>
                <Field label="Job Title">
                  <input
                    type="text"
                    value={profile?.job_title || ""}
                    onChange={(e) =>
                      setProfile((p) =>
                        p ? { ...p, job_title: e.target.value } : null,
                      )
                    }
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </Field>
                <Field label="LinkedIn ID/URL">
                  <input
                    type="text"
                    value={profile?.linkedin_url || ""}
                    onChange={(e) =>
                      setProfile((p) =>
                        p ? { ...p, linkedin_url: e.target.value } : null,
                      )
                    }
                    placeholder="linkedin.com/in/username"
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </Field>
                <Field label="Liaison Bio" fullWidth>
                  <textarea
                    rows={3}
                    value={profile?.bio || ""}
                    onChange={(e) =>
                      setProfile((p) =>
                        p ? { ...p, bio: e.target.value } : null,
                      )
                    }
                    placeholder="Brief professional intro..."
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  />
                </Field>
              </div>
            </Section>

            {/* Company Signals */}
            <Section title="Company Signals">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Company Name">
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
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </Field>
                <Field label="Official Website">
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
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </Field>
                <Field label="Headquarters">
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
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </Field>
                <Field label="Domain / Industry">
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
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </Field>
                <Field label="Sales Model">
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
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="">Select Model</option>
                    <option value="Inbound">Inbound</option>
                    <option value="Outbound">Outbound</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </Field>
                <Field label="Avg. Deal Size">
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
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="">Select Range</option>
                    <option value="< $10k">Under $10k</option>
                    <option value="$10k - $50k">$10k - $50k</option>
                    <option value="$50k - $150k">$50k - $150k</option>
                    <option value="$150k+">$150k+</option>
                  </select>
                </Field>
                <Field label="Company Mission" fullWidth>
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
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  />
                </Field>
              </div>
            </Section>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push("/dashboard/recruiter")}
                className="px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 disabled:opacity-50 transition-all shadow-xl shadow-slate-200"
              >
                {saving ? "SYNCING..." : "COMMIT CHANGES"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
      <h2 className="text-xl font-black text-slate-900 uppercase italic mb-8 flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-indigo-500" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  fullWidth = false,
}: {
  label: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
        {label}
      </label>
      {children}
    </div>
  );
}
