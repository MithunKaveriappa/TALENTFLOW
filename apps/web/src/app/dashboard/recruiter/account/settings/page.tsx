"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Bell,
  Lock,
  Eye,
  Globe,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  Languages,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";

const SETTINGS_TABS = [
  {
    id: "security",
    label: "Security & Access",
    icon: Lock,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "notifications",
    label: "Communication",
    icon: Bell,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    id: "privacy",
    label: "Visibility Control",
    icon: Eye,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    id: "localization",
    label: "System Preferences",
    icon: Globe,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

export default function RecruiterSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("security");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [profile, setProfile] = useState<{
    full_name?: string;
    job_title?: string;
  } | null>(null);
  const [settings, setSettings] = useState({
    email_notifications: true,
    web_notifications: true,
    mobile_notifications: false,
    profile_visibility: "public",
    language: "en",
    timezone: "UTC",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/login");
          return;
        }

        const [profileData, settingsData] = await Promise.all([
          apiClient.get("/recruiter/profile", session.access_token),
          apiClient.get("/recruiter/settings", session.access_token),
        ]);

        setProfile(profileData);
        if (settingsData) {
          setSettings((prev) => ({ ...prev, ...settingsData }));
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        setMessage({
          type: "error",
          text: "Failed to synchronize cloud settings.",
        });
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [router]);

  const handleUpdateSettings = async (updates: Partial<typeof settings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      await apiClient.patch(
        "/recruiter/settings",
        updates,
        session.access_token,
      );
      setMessage({
        type: "success",
        text: "Preference synchronized instantly.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      console.error("Update failed:", err);
      setMessage({ type: "error", text: "Cloud sync failed." });
    }
  };

  const handlePasswordReset = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || !session.user.email) return;

      const { error } = await supabase.auth.resetPasswordForEmail(
        session.user.email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        },
      );

      if (error) throw error;
      setMessage({ type: "success", text: "Secure reset link sent to vault." });
    } catch (err) {
      console.error("Reset failed:", err);
      setMessage({ type: "error", text: "Failed to initiate secure reset." });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 rounded-3xl bg-indigo-50 border-2 border-indigo-100 animate-pulse flex items-center justify-center">
              <Settings className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full animate-ping" />
          </div>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest animate-pulse">
            Configuring Executive Environment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50/50">
      <div className="max-w-350 mx-auto p-8">
        {/* Header Region */}
        <header className="mb-8 flex justify-between items-end">
          <div className="relative">
            <div className="absolute -top-12 -left-12 h-64 w-64 bg-indigo-400/10 blur-[120px] rounded-full -z-10" />
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                <Settings className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                Platform Core
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">
              Control <span className="text-indigo-600">Center.</span>
            </h1>
            <p className="text-slate-500 text-base font-medium max-w-lg leading-relaxed">
              Manage your executive presence, security protocols, and
              operational preferences.
            </p>
          </div>

          <div className="flex gap-4 mb-2">
            {message.text && (
              <div
                className={`px-5 py-3 rounded-2xl flex items-center gap-3 animate-in slide-in-from-right-8 border ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-red-50 text-red-700 border-red-100"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="font-bold text-xs uppercase tracking-tight">
                  {message.text}
                </span>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8 items-start">
          {/* Sidebar Navigation */}
          <div className="col-span-3 space-y-2">
            {SETTINGS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full group px-5 py-4 rounded-3xl flex items-center gap-4 transition-all duration-300 relative overflow-hidden ${
                  activeTab === tab.id
                    ? "bg-white shadow-xl shadow-indigo-200/20 text-indigo-600 ring-1 ring-slate-200"
                    : "text-slate-500 hover:bg-white hover:text-slate-900"
                }`}
              >
                {activeTab === tab.id && (
                  <div className="absolute inset-y-0 left-0 w-1 bg-indigo-600 rounded-r-full" />
                )}
                <div
                  className={`p-2 rounded-2xl transition-colors duration-300 ${
                    activeTab === tab.id
                      ? tab.bg
                      : "bg-slate-100 group-hover:bg-white border border-transparent"
                  }`}
                >
                  <tab.icon
                    className={`h-4 w-4 ${activeTab === tab.id ? tab.color : "text-slate-400"}`}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-black text-xs uppercase tracking-tight leading-none mb-0.5">
                    {tab.label}
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
                    Configuration
                  </p>
                </div>
                <ChevronRight
                  className={`h-3 w-3 transition-transform duration-300 ${activeTab === tab.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`}
                />
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="col-span-9">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-indigo-100/20 overflow-hidden min-h-125 flex flex-col">
              <div className="p-8 flex-1">
                {activeTab === "security" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-10 w-10 rounded-[14px] bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <Lock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                          Security Vault
                        </h2>
                        <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest opacity-60">
                          Manage Access & Authentication
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center bg-slate-50/50 p-5 rounded-2xl border border-slate-100 group">
                        <div className="max-w-md">
                          <p className="font-black text-slate-900 text-sm tracking-tight mb-1 flex items-center gap-2">
                            Account Password
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[7px] font-black uppercase tracking-widest">
                              Secure
                            </span>
                          </p>
                          <p className="text-slate-500 text-[11px] font-medium leading-relaxed opacity-80">
                            Protect your recruiter hub with a unique password.
                            We recommend updating your credentials every 90
                            days.
                          </p>
                        </div>
                        <button
                          onClick={handlePasswordReset}
                          className="px-5 py-2 bg-white border border-slate-200 rounded-xl font-black text-[9px] uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95 shadow-sm"
                        >
                          Request Reset
                        </button>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-3 text-slate-400">
                          <Shield className="h-3.5 w-3.5" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">
                            Environment Status: Fully Encrypted
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-12 w-12 rounded-[18px] bg-amber-50 border border-amber-100 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                          Signal Protocols
                        </h2>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest opacity-60">
                          System & Event Alerts
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          key: "email_notifications",
                          label: "Email Intelligence",
                          desc: "Summary reports and account activity.",
                          icon: Globe,
                        },
                        {
                          key: "web_notifications",
                          label: "In-App Alerts",
                          desc: "Real-time candidate news.",
                          icon: Clock,
                        },
                        {
                          key: "mobile_notifications",
                          label: "Push Channels",
                          desc: "Administrative push signals.",
                          icon: Shield,
                        },
                      ].map((item, idx) => (
                        <div
                          key={item.key}
                          className="p-5 rounded-2xl border border-slate-100 hover:bg-slate-50/50 transition-all flex justify-between items-center group"
                        >
                          <div className="flex gap-4 items-center">
                            <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-xs transition-transform group-hover:scale-110">
                              <item.icon className="h-4 w-4 text-slate-400" />
                            </div>
                            <div className="max-w-xs">
                              <p className="font-black text-slate-900 text-sm tracking-tight mb-0.5">
                                {item.label}
                              </p>
                              <p className="text-slate-500 text-[11px] font-medium leading-tight opacity-80">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleUpdateSettings({
                                [item.key]: !(settings as any)[item.key],
                              })
                            }
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${
                              (settings as any)[item.key]
                                ? "bg-amber-500"
                                : "bg-slate-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
                                (settings as any)[item.key]
                                  ? "translate-x-5"
                                  : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "privacy" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="h-12 w-12 rounded-[18px] bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                        <Eye className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                          Identity Stealth
                        </h2>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest opacity-60">
                          Visibility Controls
                        </p>
                      </div>
                    </div>

                    <p className="text-slate-500 text-xs font-medium mb-6 max-w-lg">
                      Configure your professional presence across the TalentFlow
                      ecosystem.
                    </p>

                    <div className="grid grid-cols-3 gap-4">
                      {[
                        {
                          id: "public",
                          label: "Executive Public",
                          desc: "Visible to all verified candidates.",
                          icon: Globe,
                        },
                        {
                          id: "team_only",
                          label: "Team Only",
                          desc: "Internal visibility only.",
                          icon: Shield,
                        },
                        {
                          id: "private",
                          label: "Full Stealth",
                          desc: "Hidden from results.",
                          icon: Lock,
                        },
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() =>
                            handleUpdateSettings({
                              profile_visibility: option.id,
                            })
                          }
                          className={`p-5 rounded-2xl border-2 transition-all text-left flex flex-col h-full relative group ${
                            settings.profile_visibility === option.id
                              ? "border-indigo-600 bg-indigo-50/20 shadow-lg shadow-indigo-100/30"
                              : "border-slate-100 hover:border-slate-200 bg-white"
                          }`}
                        >
                          {settings.profile_visibility === option.id && (
                            <div className="absolute top-2 right-2 h-4 w-4 bg-indigo-600 rounded-full flex items-center justify-center scale-110 animate-in zoom-in-50">
                              <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                          <div
                            className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 border ${
                              settings.profile_visibility === option.id
                                ? "bg-white border-indigo-100"
                                : "bg-slate-50 border-transparent"
                            }`}
                          >
                            <option.icon
                              className={`h-5 w-5 ${settings.profile_visibility === option.id ? "text-indigo-600" : "text-slate-400"}`}
                            />
                          </div>
                          <p
                            className={`font-black text-[11px] uppercase tracking-tight mb-1 ${settings.profile_visibility === option.id ? "text-indigo-600" : "text-slate-900"}`}
                          >
                            {option.label}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium leading-tight opacity-70">
                            {option.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "localization" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-12 w-12 rounded-[18px] bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                          Environmental Ops
                        </h2>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest opacity-60">
                          System Alignment
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          <Languages className="h-3 w-3" />
                          Language
                        </label>
                        <div className="relative group">
                          <select
                            value={settings.language}
                            onChange={(e) =>
                              handleUpdateSettings({ language: e.target.value })
                            }
                            className="w-full h-14 pl-5 pr-10 rounded-2xl bg-slate-50 border border-slate-200 font-black text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all appearance-none cursor-pointer"
                          >
                            <option value="en">English (Executive)</option>
                            <option value="es">Español (Standard)</option>
                            <option value="fr">Français (Standard)</option>
                            <option value="de">Deutsch (Standard)</option>
                          </select>
                          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none rotate-90" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          <Clock className="h-3 w-3" />
                          Timezone
                        </label>
                        <div className="relative group">
                          <select
                            value={settings.timezone}
                            onChange={(e) =>
                              handleUpdateSettings({ timezone: e.target.value })
                            }
                            className="w-full h-14 pl-5 pr-10 rounded-2xl bg-slate-50 border border-slate-200 font-black text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all appearance-none cursor-pointer"
                          >
                            <option value="UTC">UTC (Universal Time)</option>
                            <option value="EST">EST (Eastern Standard)</option>
                            <option value="PST">PST (Pacific Standard)</option>
                            <option value="IST">IST (India Standard)</option>
                          </select>
                          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Footer */}
              <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    <UserCheck className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-none mb-0.5">
                      Administrative Session
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-60">
                      Signed in as {profile?.full_name || "Executive User"}
                    </p>
                  </div>
                </div>

                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                  TalentFlow v2.0 // Settings Protocol
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
