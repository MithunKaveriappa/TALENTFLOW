"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { 
  Users, 
  Briefcase, 
  IndianRupee, 
  MapPin, 
  Zap, 
  Filter,
  Search,
  ArrowRight,
  ShieldCheck,
  TrendingUp
} from "lucide-react";

// --- AI Mock / Utility for City Tiering ---
const TIER_1_CITIES = ['bangalore', 'bengaluru', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad'];
const TIER_2_CITIES = ['jaipur', 'lucknow', 'nagpur', 'indore', 'thiruvananthapuram', 'kochi', 'coimbatore', 'madurai', 'mysore', 'chandigarh', 'bhopal', 'surat', 'patna', 'ranchi'];

function getCityTier(location: string): string {
  if (!location) return "Unspecified";
  const loc = location.toLowerCase();
  if (TIER_1_CITIES.some(city => loc.includes(city))) return "Tier 1";
  if (TIER_2_CITIES.some(city => loc.includes(city))) return "Tier 2";
  return "Tier 3";
}

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

interface CandidateData {
  user_id: string;
  full_name: string;
  experience: string;
  years_of_experience: number;
  skills: string[];
  location: string;
  location_tier: string | null;
  expected_salary: number | null;
  target_role: string | null;
  current_role: string | null;
}

export default function TalentPoolPage() {
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    experience: "all",
    tier: "all",
    search: ""
  });

  useEffect(() => {
    async function fetchPool() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch via API endpoint which uses Service Role and handles missing columns
        const data = await apiClient.get("/recruiter/talent-pool", session.access_token);
        setCandidates(data || []);
      } catch (err: any) {
        console.error("Pool fetch error:", err.message || err);
      } finally {
        setLoading(false);
      }
    }
    fetchPool();
  }, []);

  // --- Filtering Logic ---
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchesExp = filters.experience === "all" || c.experience === filters.experience;
      const actualTier = c.location_tier || getCityTier(c.location);
      const matchesTier = filters.tier === "all" || actualTier === filters.tier;
      const matchesSearch = !filters.search || 
        c.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.skills?.some(s => s.toLowerCase().includes(filters.search.toLowerCase()));
      return matchesExp && matchesTier && matchesSearch;
    });
  }, [candidates, filters]);

  // --- Visualization Data Preparation ---
  const skillData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredCandidates.forEach(c => {
      (c.skills || []).forEach(skill => {
        counts[skill] = (counts[skill] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredCandidates]);

  const experienceData = useMemo(() => {
    const counts: Record<string, number> = {
      fresher: 0,
      mid: 0,
      senior: 0,
      leadership: 0
    };
    filteredCandidates.forEach(c => {
      if (counts[c.experience] !== undefined) {
        counts[c.experience]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      name: name.toUpperCase(), 
      value 
    }));
  }, [filteredCandidates]);

  const salaryData = useMemo(() => {
    // Group into buckets of 5 LPA or similar
    const buckets: Record<string, number> = {
      "< 5L": 0,
      "5L-10L": 0,
      "10L-20L": 0,
      "20L-35L": 0,
      "35L+": 0
    };
    filteredCandidates.forEach(c => {
      const sal = c.expected_salary || 0;
      if (sal === 0) return;
      if (sal < 500000) buckets["< 5L"]++;
      else if (sal < 1000000) buckets["5L-10L"]++;
      else if (sal < 2000000) buckets["10L-20L"]++;
      else if (sal < 3500000) buckets["20L-35L"]++;
      else buckets["35L+"]++;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [filteredCandidates]);

  const tierData = useMemo(() => {
    const counts: Record<string, number> = {
      "Tier 1": 0,
      "Tier 2": 0,
      "Tier 3": 0
    };
    filteredCandidates.forEach(c => {
      const tier = c.location_tier || getCityTier(c.location);
      if (counts[tier] !== undefined) counts[tier]++;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [filteredCandidates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Synchronizing Talent Pool...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0f172a] text-slate-50 p-4 md:p-6 overflow-hidden">
      {/* --- Ambient Background Layer (Sidebar Matched) --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-slate-800 shadow-[0_0_15px_rgba(79,70,229,0.2)]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        {/* Subtle Ambient Glows */}
        <div className="absolute top-[-10%] left-[5%] w-[50%] h-[30%] bg-indigo-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-5%] right-[2%] w-[30%] h-[30%] bg-blue-600/5 blur-[80px] rounded-full" />
      </div>

      <div className="relative z-10 space-y-6 max-w-7xl mx-auto">
        
        {/* --- Slim Header --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-sm p-4 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="h-4 w-4 rounded-sm bg-white rotate-45" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
                Talent <span className="text-indigo-400">Pool</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Global Intelligence Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text"
                placeholder="Query database..."
                className="pl-9 pr-4 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-[10px] font-bold focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none w-48 lg:w-72 transition-all placeholder:text-slate-600 uppercase tracking-widest text-slate-200"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* --- Compact KPI Grid --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricNode label="Network Reach" value={filteredCandidates.length.toLocaleString()} icon={<Users />} subtext="Candidates" delay="0" />
          <MetricNode label="Economic Median" value={`₹${(12.5).toFixed(1)}L`} icon={<IndianRupee />} subtext="LPA Avg" delay="100" />
          <MetricNode label="Domain Exp" value="5.2 YRS" icon={<Briefcase />} subtext="Years Avg" delay="200" />
          <MetricNode label="Peak Signal" value={skillData[0]?.name || "N/A"} icon={<Zap />} subtext="Primary Skill" delay="300" />
        </div>

        {/* --- Core Analysis Matrix --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Geo Ring (4 Columns) */}
          <div className="lg:col-span-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-800 group overflow-hidden">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <MapPin size={12} className="text-indigo-400" /> Geography Matrix
            </h3>
            <div className="h-[220px] w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={6}
                    dataKey="count"
                    stroke="#0f172a"
                    strokeWidth={2}
                  >
                    {tierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#6366f1" : index === 1 ? "#3b82f6" : "#8b5cf6"} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-white tracking-tighter">TIER</span>
                <span className="text-[7px] font-bold text-slate-500 uppercase">Distribution</span>
              </div>
            </div>
          </div>

          {/* Trend Surface (8 Columns) */}
          <div className="lg:col-span-8 bg-slate-900/40 p-5 rounded-2xl border border-slate-800 group overflow-hidden">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <TrendingUp size={12} className="text-indigo-400" /> Compensation Spread
            </h3>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salaryData}>
                  <defs>
                    <linearGradient id="indigoGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#475569', fontWeight: 700 }} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-xl">
                            <p className="text-[9px] font-bold text-indigo-400 uppercase">{payload[0].payload.range}</p>
                            <p className="text-sm font-bold text-white">{payload[0].value} hits</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    fill="url(#indigoGlow)"
                    dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skills Vector (12 Columns) */}
          <div className="lg:col-span-12 bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap size={12} className="text-indigo-400" /> High-Signal Competencies
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {skillData.slice(0, 5).map((skill, i) => (
                <div key={i} className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">{skill.name}</span>
                    <span className="text-[9px] font-black text-indigo-500">{skill.count}</span>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-1000"
                      style={{ width: `${(skill.count / (skillData[0]?.count || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* --- Control Bar --- */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Experience Filter</span>
              <div className="flex gap-1">
                {['all', 'fresher', 'mid', 'senior'].map((lv) => (
                  <button
                    key={lv}
                    onClick={() => setFilters(f => ({ ...f, experience: lv }))}
                    className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${
                      filters.experience === lv 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {lv}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Market Tier</span>
              <div className="flex gap-1">
                {['all', 'Tier 1', 'Tier 2'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilters(f => ({ ...f, tier: t }))}
                    className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${
                      filters.tier === t 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-500 uppercase">Synchronization Coverage</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white tracking-tighter">
                {((filteredCandidates.length / (candidates.length || 1)) * 100).toFixed(0)}%
              </span>
              <span className="text-[8px] font-bold text-indigo-400 uppercase">Match Matrix</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function MetricNode({ label, value, icon, subtext, delay }: { label: string, value: string | number, icon: any, subtext: string, delay: string }) {
  return (
    <div 
      className="group relative h-28 flex flex-col justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          {React.cloneElement(icon, { size: 16 })}
        </div>
        <div className="text-right">
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
          <span className="text-[7px] font-bold text-slate-600 uppercase italic">
            {subtext}
          </span>
        </div>
      </div>
      
      <div>
        <h4 className="text-xl font-bold text-white tracking-tight">
          {value}
        </h4>
      </div>

      {/* Subtle Scanner Line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 overflow-hidden">
        <div className="h-full w-1/4 bg-indigo-500/40 animate-[scan_4s_infinite_linear]" />
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
