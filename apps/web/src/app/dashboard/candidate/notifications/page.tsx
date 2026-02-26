"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import {
  Bell,
  CheckCircle2,
  Briefcase,
  Info,
  MessageSquare,
  Clock,
  Globe,
  Calendar,
} from "lucide-react";
import CandidateInterviewConfirmModal from "@/components/CandidateInterviewConfirmModal";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata: Record<string, unknown>;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const notifs = await apiClient.get(
            "/notifications",
            session.access_token,
          );
          setNotifications(notifs);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const markAllAsRead = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await apiClient.patch(
          "/notifications/read-all",
          {},
          session.access_token,
        );
        setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await apiClient.patch(
          `/notifications/${id}/read`,
          {},
          session.access_token,
        );
        setNotifications(
          notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        );
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
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
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Signal <span className="text-indigo-600 font-black">Nexus</span>
            </h1>
            <div className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-md border border-indigo-200">
              Intelligence
            </div>
          </div>
          <p className="mt-1 text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
            <Bell className="h-3 w-3 text-indigo-500" />
            Stay synchronized with your career transmissions.
          </p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200"
          >
            Acknowledge All
          </button>
        )}
      </header>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-20 text-center shadow-sm">
            <div className="h-16 w-16 bg-slate-50 rounded-4xl flex items-center justify-center mx-auto mb-6">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">
              All Quiet in the Hub
            </h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              No new transmissions detected.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.is_read) markAsRead(notif.id);
                if (
                  notif.type === "INTERVIEW_PROPOSED" &&
                  notif.metadata?.interview_id
                ) {
                  setSelectedInterviewId(notif.metadata.interview_id as string);
                  setIsModalOpen(true);
                }
              }}
              className={`
                bg-white rounded-4xl p-8 border transition-all cursor-pointer group
                ${notif.is_read ? "border-slate-100 opacity-80" : "border-indigo-100 shadow-xl shadow-indigo-100/30 hover:border-indigo-200"}
              `}
            >
              <div className="flex gap-6">
                <div
                  className={`
                  h-14 w-14 rounded-2xl shrink-0 flex items-center justify-center shadow-sm
                  ${getNotificationStyle(notif.type)}
                `}
                >
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4
                      className={`text-lg font-black uppercase tracking-tight ${notif.is_read ? "text-slate-700" : "text-indigo-900"}`}
                    >
                      {notif.title}
                    </h4>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">
                        {formatTimestamp(notif.created_at)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4">
                    {notif.message}
                  </p>
                  
                  {notif.type === "INTERVIEW_PROPOSED" && (
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition">
                      Schedule Now
                    </button>
                  )}

                  {!notif.is_read && notif.type !== "INTERVIEW_PROPOSED" && (
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-[9px] uppercase tracking-widest">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      New Transmission
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <CandidateInterviewConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        interviewId={selectedInterviewId || ""}
        onSuccess={() => {
          // You could reload notifications or redirect to applications
          console.log("Interview confirmed!");
        }}
      />
    </div>
  );
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "APPLICATION_SUBMITTED":
      return <Briefcase className="w-6 h-6" />;
    case "INVITE_RECEIVED":
      return <Globe className="w-6 h-6" />;
    case "ASSESSMENT_COMPLETED":
      return <CheckCircle2 className="w-6 h-6" />;
    case "MESSAGE_RECEIVED":
      return <MessageSquare className="w-6 h-6" />;
    case "INTERVIEW_PROPOSED":
      return <Calendar className="w-6 h-6" />;
    default:
      return <Info className="w-6 h-6" />;
  }
}

function getNotificationStyle(type: string) {
  switch (type) {
    case "APPLICATION_SUBMITTED":
      return "bg-indigo-50 text-indigo-600";
    case "INVITE_RECEIVED":
      return "bg-emerald-50 text-emerald-600";
    case "ASSESSMENT_COMPLETED":
      return "bg-purple-50 text-purple-600";
    case "MESSAGE_RECEIVED":
      return "bg-blue-50 text-blue-600";
    case "INTERVIEW_PROPOSED":
      return "bg-amber-50 text-amber-600";
    default:
      return "bg-slate-50 text-slate-600";
  }
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60),
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return date.toLocaleDateString();
}
