"use client";

import { useState } from "react";
import { X, Send, Loader2, Briefcase } from "lucide-react";

interface JobInviteModalProps {
  candidateName: string;
  jobs: { 
    id: string; 
    title: string; 
    status: string; 
    location: string;
    recruiter_id: string;
  }[];
  onClose: () => void;
  onInvite: (jobId: string, message: string) => Promise<void>;
}

export default function JobInviteModal({
  candidateName,
  jobs,
  onClose,
  onInvite,
}: JobInviteModalProps) {
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const handleSendInvite = async () => {
    if (!selectedJobId) return;
    setLoading(true);
    try {
      await onInvite(selectedJobId, message);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate a professional message template when job changes
  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setMessage(
        `Hi ${candidateName},\n\nI saw your profile and was impressed by your experience. I think you'd be a great fit for our ${job.title} role. We are looking for someone with your background to join our team.\n\nYou can find the full job description attached to this invitation. Let me know if you'd be interested in discussing this further!`,
      );
    }
  };

  // Set initial message
  useState(() => {
    if (selectedJob) {
      handleJobChange(selectedJob.id);
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">
              Personalize Invite
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Sending to {candidateName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Job Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Select Role
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => handleJobChange(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {jobs
                .filter((j) => j.status === "active")
                .map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job.location})
                  </option>
                ))}
            </select>
          </div>

          {/* Invitation Message */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Invitation Note
              </label>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
              placeholder="Add a personal touch to your invitation..."
            />
          </div>

          {/* JD Badge */}
          {selectedJob && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-blue-900 uppercase tracking-tight">
                  {selectedJob.title}
                </p>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                  Full Description Attached
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSendInvite}
            disabled={loading || !selectedJobId}
            className="flex-2 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send Invitation
          </button>
        </div>
      </div>
    </div>
  );
}
