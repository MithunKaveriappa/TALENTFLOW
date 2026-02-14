"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import CandidateSidebar from "@/components/CandidateSidebar";
import {
  Bell,
  CheckCircle2,
  Briefcase,
  Info,
  MessageSquare,
  Clock,
  Globe,
} from "lucide-react";

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
  const [assessmentStatus, setAssessmentStatus] =
    useState<string>("not_started");

  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const [notifs, profile] = await Promise.all([
            apiClient.get("/notifications", session.access_token),
            apiClient.get("/candidate/profile", session.access_token),
          ]);
          setNotifications(notifs);
          setAssessmentStatus(profile?.assessment_status || "not_started");
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
    <div className="flex min-h-screen bg-slate-50">
      <CandidateSidebar assessmentStatus={assessmentStatus} />

      <main className="flex-1 ml-64 p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <header className="flex items-end justify-between mb-10">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic mb-2">
                Notification Center
              </h1>
              <p className="text-slate-500 font-medium uppercase tracking-[0.2em] text-[10px]">
                Stay synchronized with your career transmissions.
              </p>
            </div>
            {notifications.some((n) => !n.is_read) && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </header>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="bg-white rounded-4xl border border-slate-100 p-12 text-center">
                <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-1">
                  All Quiet in the Hub
                </h3>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                  No new transmissions detected.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                  className={`
                    bg-white rounded-3xl p-6 border transition-all cursor-pointer group
                    ${notif.is_read ? "border-slate-100 opacity-80" : "border-indigo-100 shadow-lg shadow-indigo-50 hover:border-indigo-200"}
                  `}
                >
                  <div className="flex gap-5">
                    <div
                      className={`
                      h-12 w-12 rounded-2xl shrink-0 flex items-center justify-center
                      ${getNotificationStyle(notif.type)}
                    `}
                    >
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4
                          className={`text-sm font-black uppercase tracking-tight ${notif.is_read ? "text-slate-700" : "text-indigo-900"}`}
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
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3">
                        {notif.message}
                      </p>
                      {!notif.is_read && (
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
        </div>
      </main>
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
