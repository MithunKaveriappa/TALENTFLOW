"use client";

import React from "react";
import {
  Users,
  UserCheck,
  MessageSquare,
  Award,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

interface FunnelData {
  applied: number;
  shortlisted: number;
  interviewed: number;
  offered: number;
  hired: number;
}

interface HiringFunnelProps {
  data: FunnelData;
}

const HiringFunnel: React.FC<HiringFunnelProps> = ({ data }) => {
  const stages = [
    {
      label: "Interest Captured",
      value: data.applied,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      light: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Verified Matches",
      value: data.shortlisted,
      icon: UserCheck,
      color: "from-indigo-500 to-indigo-600",
      light: "bg-indigo-50",
      text: "text-indigo-600",
    },
    {
      label: "Active Dialogues",
      value: data.interviewed,
      icon: MessageSquare,
      color: "from-purple-500 to-purple-600",
      light: "bg-purple-50",
      text: "text-purple-600",
    },
    {
      label: "Success Secured",
      value: data.hired,
      icon: CheckCircle,
      color: "from-emerald-500 to-emerald-600",
      light: "bg-emerald-50",
      text: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stages.map((stage, idx) => (
          <div key={stage.label} className="relative group">
            <div className="p-8 rounded-[3rem] border border-slate-100 transition-all duration-700 hover:shadow-2xl hover:shadow-slate-200/50 bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full blur-2xl -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div
                className={`w-14 h-14 rounded-2xl ${stage.light} ${stage.text} border border-transparent group-hover:border-current/10 flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 relative z-10 shadow-sm`}
              >
                <stage.icon size={28} />
              </div>
              <div className="space-y-2 relative z-10">
                <div className="text-4xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">
                  {stage.value}
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-tight">
                  {stage.label}
                </div>
              </div>
            </div>
            {idx < stages.length - 1 && (
              <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 items-center justify-center bg-white rounded-full border border-slate-100 text-slate-300 shadow-sm group-hover:text-indigo-500 transition-colors">
                <ArrowRight size={14} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-6 bg-slate-900 rounded-4xl flex items-center justify-between text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full translate-x-32 -translate-y-32" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 w-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold"
              >
                TF
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-300">
              Conversion Momentum
            </p>
            <p className="text-xs text-slate-400">
              Your engagement is 12% higher than similar entities.
            </p>
          </div>
        </div>
        <div className="text-right relative z-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
            Momentum Score
          </p>
          <p className="text-2xl font-black text-white italic">
            {data.applied > 0
              ? ((data.hired / data.applied) * 100).toFixed(1)
              : 0}
            %
          </p>
        </div>
      </div>
    </div>
  );
};

export default HiringFunnel;
