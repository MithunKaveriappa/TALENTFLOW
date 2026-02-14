"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Thread {
  id: string;
  last_message_at: string;
  is_active: boolean;
  candidate_profiles?: { full_name: string; avatar_url: string };
  recruiter_profiles?: { full_name: string; company_name: string };
}

interface ChatCenterProps {
  userId: string;
  role: "candidate" | "recruiter";
}

export default function ChatCenter({ userId, role }: ChatCenterProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch Threads
  useEffect(() => {
    const fetchThreads = async () => {
      const field = role === "recruiter" ? "recruiter_id" : "candidate_id";
      const otherProfile =
        role === "recruiter"
          ? "candidate_profiles(full_name, avatar_url)"
          : "recruiter_profiles(full_name, company_name)";

      const { data, error } = await supabase
        .from("chat_threads")
        .select(`*, ${otherProfile}`)
        .eq(field, userId)
        .order("last_message_at", { ascending: false });

      if (data) setThreads(data);
      setLoading(false);
    };

    fetchThreads();
  }, [userId, role]);

  // Fetch Messages when active thread changes
  useEffect(() => {
    if (!activeThreadId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("thread_id", activeThreadId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`thread:${activeThreadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `thread_id=eq.${activeThreadId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeThreadId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeThreadId) return;

    const msg = {
      thread_id: activeThreadId,
      sender_id: userId,
      content: newMessage.trim(),
    };

    const { error } = await supabase.from("chat_messages").insert(msg);
    if (!error) {
      setNewMessage("");
      // Update local thread last_message_at
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId
            ? { ...t, last_message_at: new Date().toISOString() }
            : t,
        ),
      );
    }
  };

  if (loading)
    return <div className="p-8 text-slate-400">Loading conversations...</div>;

  return (
    <div className="flex h-[calc(100vh-160px)] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Threads Sidebar */}
      <div className="w-80 border-r border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-50 bg-slate-50/50">
          <h2 className="font-bold text-slate-800">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-400">
                No active conversations yet.
              </p>
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 ${
                  activeThreadId === thread.id
                    ? "bg-indigo-50/50 border-r-2 border-r-indigo-500"
                    : ""
                }`}
              >
                <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0 overflow-hidden">
                  {role === "recruiter" &&
                  thread.candidate_profiles?.avatar_url ? (
                    <img
                      src={thread.candidate_profiles.avatar_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold">
                      {
                        (role === "recruiter"
                          ? thread.candidate_profiles?.full_name
                          : thread.recruiter_profiles?.full_name)?.[0]
                      }
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-slate-900 truncate">
                      {role === "recruiter"
                        ? thread.candidate_profiles?.full_name
                        : thread.recruiter_profiles?.full_name}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {thread.last_message_at
                      ? format(
                          new Date(thread.last_message_at),
                          "MMM d, h:mm a",
                        )
                      : "New thread"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        {activeThreadId ? (
          <>
            <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <p className="font-bold text-slate-800">
                  {role === "recruiter"
                    ? threads.find((t) => t.id === activeThreadId)
                        ?.candidate_profiles?.full_name
                    : threads.find((t) => t.id === activeThreadId)
                        ?.recruiter_profiles?.full_name}
                </p>
              </div>
              <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">
                Report User
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                      msg.sender_id === userId
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p
                      className={`text-[10px] mt-1 ${msg.sender_id === userId ? "text-indigo-200" : "text-slate-400"}`}
                    >
                      {format(new Date(msg.created_at), "h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-center flex-col items-center justify-center p-8 text-center bg-white">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <svg
                className="h-10 w-10 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 uppercase">
              Your Private Signal Room
            </h3>
            <p className="text-slate-500 max-w-md text-sm leading-relaxed">
              Select a conversation to start messaging. Remember, only
              recruiters can initiate high-stakes conversations on TalentFlow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
