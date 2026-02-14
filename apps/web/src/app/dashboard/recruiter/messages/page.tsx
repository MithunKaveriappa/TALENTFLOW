"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RecruiterSidebar from "@/components/RecruiterSidebar";
import ChatCenter from "@/components/ChatCenter";
import { User } from "@supabase/supabase-js";

interface Profile {
  assessment_status: string;
}

export default function RecruiterMessagesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: prof } = await supabase
          .from("recruiter_profiles")
          .select("assessment_status")
          .eq("id", user.id)
          .single();
        setProfile(prof);
      }
      setLoading(false);
    };
    getInitialData();
  }, []);

  if (loading) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <RecruiterSidebar assessmentStatus={profile?.assessment_status} />
      <main className="flex-1 ml-64 p-8">
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
      </main>
    </div>
  );
}
