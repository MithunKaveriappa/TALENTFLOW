"use client";

import { useState } from "react";
import {
  X,
  Calendar,
  Plus,
  Trash2,
  Video,
  MapPin,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { supabase } from "@/lib/supabaseClient";

interface InterviewSchedulerProps {
  candidateName: string;
  applications: {
    id: string;
    job_id: string;
    status: string;
    jobs?: { title: string };
  }[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function InterviewScheduler({
  candidateName,
  applications,
  onClose,
  onSuccess,
}: InterviewSchedulerProps) {
  const [loading, setLoading] = useState(false);
  const [roundName, setRoundName] = useState("Technical Interview");
  const [roundNumber, setRoundNumber] = useState(1);
  const [format, setFormat] = useState<"virtual" | "onsite">("virtual");
  const [location, setLocation] = useState("");
  const [interviewer, setInterviewer] = useState("");
  const [interviewers, setInterviewers] = useState<string[]>([]);
  const [selectedAppId, setSelectedAppId] = useState(applications[0]?.id || "");
  const [slots, setSlots] = useState<
    { start_time: string; end_time: string }[]
  >([{ start_time: "", end_time: "" }]);

  const addSlot = () => {
    if (slots.length < 5) {
      setSlots([...slots, { start_time: "", end_time: "" }]);
    }
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: string, value: string) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const addInterviewer = () => {
    if (interviewer.trim()) {
      setInterviewers([...interviewers, interviewer.trim()]);
      setInterviewer("");
    }
  };

  const removeInterviewer = (name: string) => {
    setInterviewers(interviewers.filter((n) => n !== name));
  };

  const handleSchedule = async () => {
    // Basic validation
    if (!selectedAppId || slots.some((s) => !s.start_time || !s.end_time)) {
      alert("Please fill in all required fields and slots.");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      await apiClient.post(
        "/interviews/propose",
        {
          application_id: selectedAppId,
          round_name: roundName,
          round_number: roundNumber,
          format: format,
          location: format === "onsite" ? location : null,
          interviewer_names: interviewers,
          slots: slots,
        },
        session.access_token,
      );

      onSuccess();
    } catch (err) {
      console.error("Scheduling failed:", err);
      alert("Failed to propose interview.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">
              Propose Interview
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Scheduling for {candidateName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Job Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Select Role / Pipeline
            </label>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.jobs?.title} ({app.status})
                </option>
              ))}
            </select>
          </div>

          {/* Round Details */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Round Name
              </label>
              <input
                type="text"
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
                placeholder="e.g. Technical Screening"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Round #
              </label>
              <input
                type="number"
                value={roundNumber}
                onChange={(e) => setRoundNumber(parseInt(e.target.value))}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Format
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setFormat("virtual")}
                className={`flex-1 p-4 rounded-2xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                  format === "virtual"
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100"
                    : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                }`}
              >
                <Video className="w-4 h-4" /> Virtual
              </button>
              <button
                onClick={() => setFormat("onsite")}
                className={`flex-1 p-4 rounded-2xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                  format === "onsite"
                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100"
                    : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                }`}
              >
                <MapPin className="w-4 h-4" /> On-site
              </button>
            </div>
          </div>

          {format === "onsite" && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Location Address
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter full office address"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700"
              />
            </div>
          )}

          {/* Interviewers */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Interviewers
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={interviewer}
                onChange={(e) => setInterviewer(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addInterviewer()}
                placeholder="Add interviewer name"
                className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={addInterviewer}
                className="px-6 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interviewers.map((name) => (
                <span
                  key={name}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 flex items-center gap-2"
                >
                  {name}{" "}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-500"
                    onClick={() => removeInterviewer(name)}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Slots */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Proposed Slots (UTC)
              </label>
              <button
                onClick={addSlot}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3 h-3" /> Add Slot
              </button>
            </div>
            {slots.map((slot, index) => (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Start
                  </span>
                  <input
                    type="datetime-local"
                    value={slot.start_time}
                    onChange={(e) =>
                      updateSlot(index, "start_time", e.target.value)
                    }
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    End
                  </span>
                  <input
                    type="datetime-local"
                    value={slot.end_time}
                    onChange={(e) =>
                      updateSlot(index, "end_time", e.target.value)
                    }
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600"
                  />
                </div>
                {slots.length > 1 && (
                  <button
                    onClick={() => removeSlot(index)}
                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-100 transition-all"
          >
            Discard
          </button>
          <button
            onClick={handleSchedule}
            disabled={loading}
            className="flex-2 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
            Propose Interview
          </button>
        </div>
      </div>
    </div>
  );
}
