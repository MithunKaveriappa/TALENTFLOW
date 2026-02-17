"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  count: number;
}

const ETHICAL_REASONS = [
  "Skills/Experience do not fully align with current role requirements",
  "Role has been closed or already filled by another candidate",
  "Salary or location expectations are outside of the current scope",
  "Other candidates more closely matched the specific criteria for this round",
  "Application does not meet the minimum eligibility criteria specified",
];

export default function RejectionModal({
  isOpen,
  onClose,
  onConfirm,
  count,
}: RejectionModalProps) {
  const [selectedReason, setSelectedReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Send Decision</h3>
            <p className="text-sm text-slate-500 font-medium">
              Updating {count} candidate{count > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Providing clear, objective reasons helps maintain a positive brand
              reputation and ensures a fair experience for all candidates.
            </p>
          </div>

          <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
            Select Ethical Reason
          </label>
          <div className="space-y-2">
            {ETHICAL_REASONS.map((reason) => (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                  selectedReason === reason
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md shadow-blue-100"
                    : "border-slate-100 hover:border-slate-200 text-slate-600"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            disabled={!selectedReason}
            onClick={() => onConfirm(selectedReason)}
            className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 disabled:shadow-none"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}
