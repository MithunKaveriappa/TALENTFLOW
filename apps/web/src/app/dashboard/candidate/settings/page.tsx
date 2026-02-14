"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import CandidateSidebar from "@/components/CandidateSidebar";
import { Save, User, Shield, Bell, CheckCircle2, AlertCircle } from "lucide-react";

interface ProfileData {
  full_name: string;
  phone_number: string;
  bio: string;
  linkedin_url: string;
  location: string;
  identity_verified: boolean;
  terms_accepted: boolean;
  assessment_status: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "account" | "notifications">("profile");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const data = await apiClient.get("/candidate/profile", session.access_token);
          setProfile({
            full_name: data.full_name || "",
            phone_number: data.phone_number || "",
            bio: data.bio || "",
            linkedin_url: data.linkedin_url || "",
            location: data.location || "",
            identity_verified: data.identity_verified || false,
            terms_accepted: data.terms_accepted || false,
            assessment_status: data.assessment_status || "not_started"
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await apiClient.patch("/candidate/profile", profile, session.access_token);
        setMessage({ type: "success", text: "Profile updated successfully!" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <CandidateSidebar assessmentStatus={profile?.assessment_status} />

      <main className="flex-1 ml-64 p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <header className="mb-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic mb-2">
              Account Settings
            </h1>
            <p className="text-slate-500 font-medium uppercase tracking-[0.2em] text-[10px]">
              Manage your high-trust identity and preferences.
            </p>
          </header>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 space-y-1">
              <TabButton
                active={activeTab === "profile"}
                onClick={() => setActiveTab("profile")}
                icon={<User className="w-4 h-4" />}
                label="Profile Details"
              />
              <TabButton
                active={activeTab === "account"}
                onClick={() => setActiveTab("account")}
                icon={<Shield className="w-4 h-4" />}
                label="Security & Trust"
              />
              <TabButton
                active={activeTab === "notifications"}
                onClick={() => setActiveTab("notifications")}
                icon={<Bell className="w-4 h-4" />}
                label="Notifications"
                disabled
              />
            </div>

            {/* Content Area */}
            <div className="flex-1">
              <div className="bg-white rounded-4xl border border-slate-100 p-8 shadow-sm">
                {activeTab === "profile" && (
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profile?.full_name}
                          onChange={(e) => setProfile({ ...profile!, full_name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                          placeholder="Ex: John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={profile?.phone_number}
                          onChange={(e) => setProfile({ ...profile!, phone_number: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                          placeholder="+1 234 567 890"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profile?.location}
                        onChange={(e) => setProfile({ ...profile!, location: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        placeholder="Ex: New York, USA"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={profile?.linkedin_url}
                        onChange={(e) => setProfile({ ...profile!, linkedin_url: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        Bio
                      </label>
                      <textarea
                        value={profile?.bio}
                        onChange={(e) => setProfile({ ...profile!, bio: e.target.value })}
                        rows={4}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium resize-none"
                        placeholder="Tell recruiters about your background..."
                      />
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                      {message && (
                        <div className={`text-xs font-bold uppercase tracking-wider ${message.type === "success" ? "text-emerald-500" : "text-red-500"}`}>
                          {message.text}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={saving}
                        className="ml-auto flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving Changes..." : "Save Settings"}
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === "account" && (
                  <div className="space-y-8">
                    <section className="space-y-4">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Trust Indicators</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TrustBadge
                          label="Identity Verification"
                          status={profile?.identity_verified ? "verified" : "pending"}
                        />
                        <TrustBadge
                          label="Terms Acceptance"
                          status={profile?.terms_accepted ? "verified" : "pending"}
                        />
                        <TrustBadge
                          label="Assessment Status"
                          status={profile?.assessment_status === "completed" ? "verified" : "pending"}
                        />
                      </div>
                    </section>

                    <section className="pt-8 border-t border-slate-50 space-y-4">
                      <h3 className="text-xs font-black text-red-600 uppercase tracking-widest">Danger Zone</h3>
                      <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-center justify-between gap-6">
                        <div>
                          <p className="text-sm font-bold text-red-700 mb-1">Delete Account</p>
                          <p className="text-[10px] text-red-600/70 font-medium">
                            Once deleted, your profile, assessment results, and application history will be permanently erased.
                          </p>
                        </div>
                        <button className="px-5 py-2.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-red-700 transition-colors shrink-0">
                          Delete Permanently
                        </button>
                      </div>
                    </section>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, disabled = false }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
        active
          ? "bg-white text-indigo-600 shadow-sm border border-slate-100"
          : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function TrustBadge({ label, status }: { label: string; status: "verified" | "pending" }) {
  const isVerified = status === "verified";
  return (
    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
        isVerified ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
      }`}>
        {isVerified ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
        {status}
      </div>
    </div>
  );
}
