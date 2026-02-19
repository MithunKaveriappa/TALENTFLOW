"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";
import ChatCenter from "@/components/ChatCenter";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import LockedView from "@/components/dashboard/LockedView";

export default function RecruiterMessagesPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const getInitialData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Check lock status
        try {
          const profile = await apiClient.get("/recruiter/profile", session.access_token);
          if ((profile?.companies?.profile_score ?? 0) === 0) {
            setIsLocked(true);
          }
        } catch (err) {
          console.error("Lock check failed:", err);
        }
      }
      setLoading(false);
    };
    getInitialData();
  }, []);

  if (loading) return null;

  if (isLocked) {
    return (
      <div className="p-8">
        <LockedView featureName="Discovery Messaging" />
      </div>
    );
  }

  return (
    <div className="p-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
          Discovery Messaging
        </h1>
        <p className="text-slate-500 font-medium whitespace-nowrap">
          Communicate with shortlisted talent directly.
        </p>
      </header>

      {user?.id ? (
        <ChatCenter userId={user.id} role="recruiter" />
      ) : (
        !loading && <div className="p-8 text-slate-400">Please log in to view messages.</div>
      )}
    </div>
  );
}
