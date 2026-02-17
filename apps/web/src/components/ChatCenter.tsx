"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

interface Thread {
  id: string;
  last_message_at: string;
  is_active: boolean;
  candidate_profiles?: { full_name: string; profile_photo_url: string };
  recruiter_profiles?: { full_name: string; company_id: string };
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
      
      // Direct profiles join (enabled by the SQL relationship update)
      const profileJoin = 
        role === "recruiter"
          ? "candidate_profiles!candidate_id(full_name, profile_photo_url)"
          : "recruiter_profiles!recruiter_id(full_name, company_id)";

      const { data, error } = await supabase
        .from("chat_threads")
        .select(`*, ${profileJoin}`)
        .eq(field, userId)
        .eq("is_active", true) // ELITE FILTER: Only show active dialogues
        .order("last_message_at", { ascending: false });

      if (error) {
        console.error("Fetch threads error:", error);
      }
      
      if (data) setThreads(data as Thread[]);
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
      text: newMessage.trim(),
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
    return (
      <div className="p-12 flex flex-col items-center justify-center h-96">
        <div className="h-12 w-12 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Messages</p>
      </div>
    );

  return (
    <div className="flex bg-white rounded-4xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50 min-h-150 h-[calc(100vh-280px)]">
      {/* Threads Sidebar */}
      <div className="w-80 border-r border-slate-100 flex flex-col">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {threads.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                <svg className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No active messages</p>
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`w-full p-6 flex items-center gap-4 transition-all relative group border-b border-slate-50 ${
                  activeThreadId === thread.id
                    ? "bg-indigo-50/50"
                    : "hover:bg-slate-50/80"
                }`}
              >
                {activeThreadId === thread.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600 rounded-r-full shadow-[2px_0_10px_rgba(79,70,229,0.2)]" />
                )}
                
                <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 border-2 border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                  {role === "recruiter" && thread.candidate_profiles?.profile_photo_url ? (
                    <img
                      src={thread.candidate_profiles.profile_photo_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-indigo-500 font-black text-xs">
                      { (role === "recruiter"
                          ? thread.candidate_profiles?.full_name
                          : thread.recruiter_profiles?.full_name)?.[0] || "?" }
                    </div>
                  )}
                </div>

                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-start">
                    <p className={`font-black text-sm tracking-tight truncate ${activeThreadId === thread.id ? "text-indigo-600" : "text-slate-900"}`}>
                      {role === "recruiter"
                        ? thread.candidate_profiles?.full_name || "New Candidate"
                        : thread.recruiter_profiles?.full_name || "Elite Recruiter"}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {thread.last_message_at
                      ? format(new Date(thread.last_message_at), "MMM d, h:mm a")
                      : "New Message"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col bg-slate-50/20">
        {activeThreadId ? (
          <>
            <div className="px-10 py-6 border-b border-slate-100 bg-white/80 backdrop-blur-md flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse" />
                <div>
                  <h3 className="font-black text-slate-900 text-base uppercase tracking-wider">
                    {role === "recruiter"
                      ? threads.find((t) => t.id === activeThreadId)
                          ?.candidate_profiles?.full_name || "Candidate"
                      : "Recruitment Lead"}
                  </h3>
                  <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-[0.2em] mt-0.5">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                  View Profile
                </button>
                <div className="h-4 w-px bg-slate-100" />
                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-10 py-10 space-y-8 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex flex-col ${msg.sender_id === userId ? "items-end" : "items-start"} max-w-[75%]`}>
                    <div
                      className={`rounded-3xl px-6 py-4 shadow-sm transition-all hover:shadow-md ${
                        msg.sender_id === userId
                          ? "bg-slate-900 text-white rounded-tr-none shadow-slate-900/10"
                          : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                      }`}
                    >
                      <p className="text-[13px] leading-relaxed font-medium">{msg.text}</p>
                    </div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mt-2 px-1">
                      {format(new Date(msg.created_at), "h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-8 bg-white border-t border-slate-100">
              <form onSubmit={sendMessage} className="relative group">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-8 py-5 pr-40 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all placeholder:text-slate-400 font-medium"
                />
                <div className="absolute right-3 top-3 bottom-3">
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="h-full bg-slate-900 text-white px-10 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black active:scale-95 disabled:opacity-20 disabled:grayscale transition-all shadow-xl shadow-slate-900/20"
                  >
                    Send
                  </button>
                </div>
              </form>
              <div className="mt-4 flex justify-between items-center px-1">
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Secure & Encrypted</p>
                 <div className="flex gap-4">
                    <button className="text-[9px] text-slate-400 font-bold uppercase hover:text-indigo-600 transition-colors">Attach File</button>
                    <button className="text-[9px] text-slate-400 font-bold uppercase hover:text-indigo-600 transition-colors">Templates</button>
                 </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center animate-in fade-in zoom-in duration-700">
            <div className="relative mb-10 group cursor-default">
               <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full scale-150 group-hover:bg-indigo-500/20 transition-all duration-700" />
               <div className="relative h-32 w-32 rounded-[3.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-xl transition-all duration-700 hover:rotate-12">
                  <svg className="h-14 w-14 text-indigo-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
               </div>
            </div>
            <h3 className="text-4xl font-black text-slate-900 tracking-[-0.04em] mb-4 uppercase">
              Messaging Center
            </h3>
            <p className="text-slate-400 max-w-sm text-[10px] font-bold uppercase tracking-[0.25em] leading-relaxed opacity-70">
              Select a conversation to start chatting. Your messages are private and secure.
            </p>
            <div className="mt-12 h-1.5 w-12 bg-indigo-100 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
