"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Compass, 
  TrendingUp, 
  Users, 
  Activity,
  DollarSign, 
  BarChart3,
  Search,
  Zap,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import RecruiterSidebar from "@/components/RecruiterSidebar";
import LockedView from "@/components/dashboard/LockedView";

export default function CareerGPSPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isLocked = profile && (profile.companies?.profile_score ?? 0) === 0;

  useEffect(() => {
    async function loadInsights() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/login");
          return;
        }

        const [profileData, insightsData] = await Promise.all([
          apiClient.get("/recruiter/profile", session.access_token),
          apiClient.get("/recruiter/market-insights", session.access_token)
        ]);
        
        setProfile(profileData);
        setInsights(insightsData);
      } catch (err) {
        console.error("Failed to load GPS:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, [router]);

  return (
    <div className="min-h-screen">
      <main className="p-12 overflow-y-auto">
        {isLocked ? (
          <LockedView featureName="Career GPS" />
        ) : (
          <>
            <header className="mb-12 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold mb-2">
            <Compass className="h-5 w-5" />
            <span>Talent Signals</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Career GPS
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Live market intelligence based on platform-wide talent distribution.
          </p>
        </div>

        <div className="flex gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">Pool Health</p>
                <p className="text-lg font-black text-slate-900 leading-none">
                  {insights?.market_state || "Analyzing..."}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Skill Density */}
            <div className="md:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                
                <div className="flex items-center justify-between mb-8 relative">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                      Skill Density Map
                    </h3>
                    <p className="text-slate-500 text-sm">Prevalence of skills across {insights?.pool_size} verified candidates.</p>
                  </div>
                  <button className="text-blue-600 text-sm font-bold flex items-center hover:underline">
                    Expand Map <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-6 relative">
                  {insights?.talent_density.map((item: any, i: number) => (
                    <div key={item.skill} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="font-bold text-slate-700">{item.skill}</span>
                        <span className="text-sm font-black text-blue-600">{item.percentage}%</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                          style={{ width: `${item.percentage}%`, transitionDelay: `${i * 100}ms` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitive Index */}
              <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-8">
                  <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Competition Index</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {insights?.competition_index.map((item: any) => (
                    <div key={item.skill} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">{item.skill}</p>
                        <p className="text-lg font-black text-slate-900">{item.active_openings} Active Jobs</p>
                      </div>
                      <div className={`h-2 w-2 rounded-full ${item.active_openings > 5 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-green-500'}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Recommendations */}
            <div className="space-y-8">
              <div className="bg-slate-900 p-8 rounded-4xl text-white shadow-xl shadow-blue-100/50">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-400 fill-amber-400" />
                  GPS Guidance
                </h3>
                
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                    <p className="text-sm text-blue-200 font-bold mb-2">HOT SKILL</p>
                    <p className="font-medium text-white italic truncate">
                      "{insights?.talent_density[0]?.skill || 'Parsing'}" counts are low relative to demand.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-white/50 font-bold uppercase tracking-wider">Strategic Moves</p>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-emerald-500/20 shrink-0 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </div>
                        <p className="text-sm text-white/80">Consider increasing budget for {insights?.talent_density[1]?.skill || 'Lead Gen'} talent.</p>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-blue-500/20 shrink-0 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        </div>
                        <p className="text-sm text-white/80">Benchmark against {insights?.pool_size} verified candidates.</p>
                      </li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => router.push("/dashboard/recruiter/hiring/jobs/new")}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 transition-colors rounded-2xl font-black uppercase tracking-tighter text-sm"
                  >
                    Post High-Demand Role
                  </button>
                </div>
              </div>

              {/* Pool Size Stats */}
              <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm text-center">
                <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                  <Users className="h-8 w-8" />
                </div>
                <p className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{insights?.pool_size}</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Verified Talent Pool</p>
              </div>
            </div>
          </div>
        )}
      </>
    )}
  </main>
  </div>
);
}
