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
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
// import RecruiterSidebar from "@/components/RecruiterSidebar";

export default function RecruiterSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [profile, setProfile] = useState<{
    assessment_status?: string;
    team_role?: string;
  } | null>(null);
  const [settings, setSettings] = useState({
    email_notifications: true,
    web_notifications: true,
    mobile_notifications: false,
    profile_visibility: "public",
    language: "en",
    timezone: "UTC",
    two_factor_enabled: false,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/login");
          return;
        }

        const [profileData, settingsData] = await Promise.all([
          apiClient.get("/recruiter/profile", session.access_token),
          apiClient.get("/recruiter/settings", session.access_token)
        ]);

        setProfile(profileData);
        if (settingsData && Object.keys(settingsData).length > 0) {
          setSettings(settingsData);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        setMessage({ type: "error", text: "Failed to synchronize settings." });
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [router]);

  const handleUpdateSettings = async (updates: Partial<typeof settings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await apiClient.patch("/recruiter/settings", updates, session.access_token);
      setMessage({ type: "success", text: "Settings updated in real-time." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      console.error("Update failed:", err);
      setMessage({ type: "error", text: "Failed to save preference." });
    }
  };

  const handlePasswordReset = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user.email) return;

      const { error } = await supabase.auth.resetPasswordForEmail(session.user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      setMessage({ type: "success", text: "Password reset link sent to your email." });
    } catch (err) {
      console.error("Reset failed:", err);
      setMessage({ type: "error", text: "Failed to initiate password reset." });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <main className="overflow-y-auto p-12">
        <header className="mb-12">
          <div className="flex items-center gap-2 text-slate-400 font-semibold mb-2">
            <Settings className="h-5 w-5" />
            <span>Account</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Settings & Control
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Manage your security, notifications, and platform preferences.
          </p>
        </header>

        {message.text && (
          <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span className="font-bold text-sm uppercase tracking-tight">{message.text}</span>
          </div>
        )}

        <div className="max-w-4xl space-y-8">
          {/* Security Section */}
          <section className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                Security & Authentication
              </h2>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">Password</p>
                  <p className="text-sm text-slate-500">
                    Update your account password regularly for security.
                  </p>
                </div>
                <button
                  onClick={handlePasswordReset}
                  className="px-6 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
                >
                  Change Password
                </button>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">
                    Two-Factor Authentication (2FA)
                  </p>
                  <p className="text-sm text-slate-500">
                    Add an extra layer of security to your recruiter hub.
                  </p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.two_factor_enabled}
                    onChange={(e) =>
                      handleUpdateSettings({
                        two_factor_enabled: e.target.checked,
                      })
                    }
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                System Notifications
              </h2>
            </div>

            <div className="p-8 space-y-6">
              {[
                {
                  label: "Email Notifications",
                  key: "email_notifications",
                  desc: "Candidate applications, job alerts, and account activity.",
                },
                {
                  label: "Web Push Notifications",
                  key: "web_notifications",
                  desc: "Real-time alerts while using the platform.",
                },
                {
                  label: "Mobile App Notifications",
                  key: "mobile_notifications",
                  desc: "Notifications on linked mobile devices.",
                },
              ].map((item, idx) => (
                <div key={item.key}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={
                          (settings as Record<string, any>)[item.key] as boolean
                        }
                        onChange={(e) =>
                          handleUpdateSettings({ [item.key]: e.target.checked })
                        }
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                  </div>
                  {idx < 2 && <div className="h-px bg-slate-100 mt-6" />}
                </div>
              ))}
            </div>
          </section>

          {/* Visibility Section */}
          <section className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Eye className="h-5 w-5 text-indigo-600" />
                Privacy & Visibility
              </h2>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="font-bold text-slate-800 block mb-2">
                  Recruiter Profile Visibility
                </label>
                <p className="text-sm text-slate-500 mb-4">
                  Control who can see your professional profile and credentials.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { val: "public", label: "Public", icon: Globe },
                    { val: "team_only", label: "Team Only", icon: Shield },
                    { val: "private", label: "Hidden", icon: Lock },
                  ].map((option) => (
                    <button
                      key={option.val}
                      onClick={() =>
                        handleUpdateSettings({ profile_visibility: option.val })
                      }
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                        settings.profile_visibility === option.val
                          ? "border-blue-600 bg-blue-50/50"
                          : "border-slate-100 bg-slate-50/30 hover:border-slate-200"
                      }`}
                    >
                      <option.icon
                        className={`h-6 w-6 ${
                          settings.profile_visibility === option.val
                            ? "text-blue-600"
                            : "text-slate-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-bold ${
                          settings.profile_visibility === option.val
                            ? "text-blue-600"
                            : "text-slate-500"
                        }`}
                      >
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Localization Section */}
          <section className="bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden mb-12">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-600" />
                Localization
              </h2>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Display Language</label>
                <select 
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none focus:border-blue-500"
                  value={settings.language}
                  onChange={(e) => handleUpdateSettings({ language: e.target.value })}
                >
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Primary Timezone</label>
                <select 
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 outline-none focus:border-blue-500"
                  value={settings.timezone}
                  onChange={(e) => handleUpdateSettings({ timezone: e.target.value })}
                >
                  <option value="UTC">UTC (GMT +0)</option>
                  <option value="EST">EST (GMT -5)</option>
                  <option value="PST">PST (GMT -8)</option>
                  <option value="IST">IST (GMT +5:30)</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
