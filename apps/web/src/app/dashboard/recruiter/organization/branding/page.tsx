"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  Camera,
  Image as ImageIcon,
  Palette,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";

interface CompanyBranding {
  logo_url?: string;
  brand_colors?: {
    primary: string;
    secondary: string;
  };
  life_at_photo_urls?: string[];
  name?: string;
}

export default function EmployerBrandingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  const [branding, setBranding] = useState<CompanyBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadBranding() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/login");
          return;
        }

        const data = await apiClient.get("/recruiter/profile", session.access_token);
        setBranding({
          logo_url: data.companies?.logo_url,
          brand_colors: data.companies?.brand_colors || { primary: "#2563eb", secondary: "#64748b" },
          life_at_photo_urls: data.companies?.life_at_photo_urls || [],
          name: data.companies?.name
        });
      } catch (err) {
        console.error("Failed to load branding:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBranding();
  }, [router]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("company-logos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("company-logos")
        .getPublicUrl(fileName);

      setBranding(prev => prev ? { ...prev, logo_url: publicUrl } : null);
      setMessage({ type: "success", text: "Logo uploaded. Remember to save changes." });
    } catch (err) {
      console.error("Logo upload failed:", err);
      setMessage({ type: "error", text: "Failed to upload logo." });
    } finally {
      setUploading(false);
    }
  };

  const handlePhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/life-${Date.now()}-${i}.${fileExt}`;
        
        await supabase.storage.from("company-assets").upload(fileName, file);
        const { data: { publicUrl } } = supabase.storage.from("company-assets").getPublicUrl(fileName);
        newUrls.push(publicUrl);
      }

      setBranding(prev => prev ? { 
        ...prev, 
        life_at_photo_urls: [...(prev.life_at_photo_urls || []), ...newUrls] 
      } : null);
      setMessage({ type: "success", text: `${newUrls.length} photos added. Remember to save changes.` });
    } catch (err) {
      console.error("Photos upload failed:", err);
      setMessage({ type: "error", text: "Failed to upload photos." });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (url: string) => {
    setBranding(prev => prev ? {
      ...prev,
      life_at_photo_urls: prev.life_at_photo_urls?.filter(u => u !== url)
    } : null);
  };

  const handleSave = async () => {
    if (!branding) return;
    setSaving(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await apiClient.patch("/recruiter/company", {
        logo_url: branding.logo_url,
        brand_colors: branding.brand_colors,
        life_at_photo_urls: branding.life_at_photo_urls
      }, session.access_token);

      setMessage({ type: "success", text: "Employer branding signals updated!" });
    } catch (err) {
      console.error("Failed to save branding:", err);
      setMessage({ type: "error", text: "Failed to synchronize branding data." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <header className="mb-12">
        <div className="flex items-center gap-2 text-blue-600 font-semibold mb-2">
          <Palette className="h-5 w-5" />
          <span>Employer Brand</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Company DNA <span className="text-blue-600">& Visuals</span>
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Project your high-trust culture and visual identity to the talent pool.
        </p>
      </header>

      {message && (
        <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <Palette className="h-5 w-5" />}
          <span className="font-bold text-sm uppercase tracking-tight">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Logo & Colors */}
        <div className="space-y-8">
          {/* Logo Section */}
          <section className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm text-center">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 text-left">Company Logo</h3>
            <div className="relative inline-block">
              <div className="h-32 w-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative">
                {branding?.logo_url ? (
                  <Image src={branding.logo_url} alt="Logo" fill className="object-contain p-4" />
                ) : (
                  <Building2 className="h-12 w-12 text-slate-300" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all active:scale-95"
              >
                <Camera className="h-5 w-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLogoUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-wider">
              High-res PNG or SVG preferred
            </p>
          </section>

          {/* Colors Section */}
          <section className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Brand Palette</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={branding?.brand_colors?.primary || "#2563eb"} 
                    onChange={(e) => setBranding(prev => prev ? {
                      ...prev,
                      brand_colors: { ...prev.brand_colors!, primary: e.target.value }
                    } : null)}
                    className="h-10 w-20 rounded-lg cursor-pointer border-none p-0"
                  />
                  <input 
                    type="text" 
                    value={branding?.brand_colors?.primary || "#2563eb"} 
                    onChange={(e) => setBranding(prev => prev ? {
                      ...prev,
                      brand_colors: { ...prev.brand_colors!, primary: e.target.value }
                    } : null)}
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm font-mono font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={branding?.brand_colors?.secondary || "#64748b"} 
                    onChange={(e) => setBranding(prev => prev ? {
                      ...prev,
                      brand_colors: { ...prev.brand_colors!, secondary: e.target.value }
                    } : null)}
                    className="h-10 w-20 rounded-lg cursor-pointer border-none p-0"
                  />
                  <input 
                    type="text" 
                    value={branding?.brand_colors?.secondary || "#64748b"} 
                    onChange={(e) => setBranding(prev => prev ? {
                      ...prev,
                      brand_colors: { ...prev.brand_colors!, secondary: e.target.value }
                    } : null)}
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Life at Company Photos */}
        <div className="md:col-span-2">
          <section className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Company Lifestyle</h3>
                <p className="text-sm text-slate-500">Showcase your office, team, and culture.</p>
              </div>
              <button 
                onClick={() => photosInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Photos
              </button>
              <input 
                type="file" 
                ref={photosInputRef} 
                onChange={handlePhotosUpload} 
                className="hidden" 
                multiple 
                accept="image/*" 
              />
            </div>

            {branding?.life_at_photo_urls && branding.life_at_photo_urls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {branding.life_at_photo_urls.map((url, i) => (
                  <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                    <Image src={url} alt="Culture" fill className="object-cover" />
                    <button 
                      onClick={() => removePhoto(url)}
                      className="absolute top-2 right-2 h-8 w-8 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm hover:bg-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
                <ImageIcon className="h-12 w-12 mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">No Lifestyle Photos</p>
              </div>
            )}
          </section>
        </div>
      </div>

      <footer className="fixed bottom-0 left-64 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-6 flex justify-end z-20">
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95"
        >
          {saving ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          Synchronize DNA Visuals
        </button>
      </footer>
    </div>
  );
}
