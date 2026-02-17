"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  BadgeCheck,
  UserMinus,
  Mail,
  X,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { apiClient } from "@/lib/apiClient";

interface TeamMember {
  user_id: string;
  full_name?: string;
  job_title?: string;
  is_admin: boolean;
  assessment_status: string;
  created_at: string;
  users: {
    email: string;
  };
}

export default function TeamManagementPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    user_id?: string;
    is_admin?: boolean;
    companies?: { name: string };
  } | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadTeamData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      const profileData = await apiClient.get("/recruiter/profile", session.access_token);
      setProfile(profileData);

      const teamData = await apiClient.get("/recruiter/team", session.access_token);
      setTeam(teamData || []);
    } catch (err) {
      console.error("Failed to load team:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    setInviting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await apiClient.post("/recruiter/invite", { email: inviteEmail }, session.access_token);
      setIsInviteModalOpen(false);
      setInviteEmail("");
      alert("Invitation sent successfully!");
    } catch (err) {
      console.error("Invite failed:", err);
      alert("Failed to send invitation. Make sure you are an admin.");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member? They will lose access to the company dashboard.")) return;
    
    setActioningId(memberId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await apiClient.delete(`/recruiter/team/${memberId}`, session.access_token);
      setTeam(prev => prev.filter(m => m.user_id !== memberId));
    } catch (err) {
      console.error("Remove failed:", err);
      alert("Failed to remove member. Make sure you are an admin.");
    } finally {
      setActioningId(null);
    }
  };

  const handlePromote = async (member: TeamMember) => {
    const action = member.is_admin ? "demote" : "promote";
    if (!confirm(`Are you sure you want to ${action} ${member.full_name || member.users.email}?`)) return;

    setActioningId(member.user_id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await apiClient.patch(`/recruiter/team/${member.user_id}/role`, { is_admin: !member.is_admin }, session.access_token);
      setTeam(prev => prev.map(m => m.user_id === member.user_id ? { ...m, is_admin: !m.is_admin } : m));
    } catch (err) {
      console.error("Role change failed:", err);
      alert("Failed to change role.");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <main className="p-12 overflow-y-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold mb-2">
              <Users className="h-5 w-5" />
              <span>Organization</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Team Management
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Manage recruiters and hiring permissions for {profile?.companies?.name || "your company"}.
            </p>
          </div>

          {profile?.is_admin && (
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
              <UserPlus className="h-5 w-5" />
              Invite Recruiter
            </button>
          )}
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider">Member</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {team.map((member) => (
                  <tr key={member.user_id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 shadow-sm">
                          {member.full_name?.charAt(0) || member.users.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            {member.full_name || "New Recruiter"}
                            {member.is_admin && <ShieldCheck className="h-4 w-4 text-blue-600" />}
                          </div>
                          <div className="text-sm text-slate-500">{member.users.email}</div>
                          {member.job_title && <div className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">{member.job_title}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                        member.is_admin ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-slate-50 text-slate-500 border border-slate-100"
                      }`}>
                        {member.is_admin ? "Admin" : "Recruiter"}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <BadgeCheck className={`h-4 w-4 ${member.assessment_status === 'completed' ? 'text-emerald-500' : 'text-slate-300'}`} />
                        <span className="text-sm font-semibold capitalize bg-slate-100/50 px-3 py-1 rounded-lg">
                          {member.assessment_status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {profile?.is_admin && member.user_id !== profile.user_id && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handlePromote(member)}
                            disabled={actioningId === member.user_id}
                            title={member.is_admin ? "Demote to Recruiter" : "Promote to Admin"}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          >
                            <ShieldCheck className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleRemove(member.user_id)}
                            disabled={actioningId === member.user_id}
                            title="Remove from Team"
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            {actioningId === member.user_id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <UserMinus className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-4xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 fill-mode-both">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Invite Team Member</h2>
                  <p className="text-slate-500 text-sm mt-1">Send an invitation to join your company team.</p>
                </div>
                <button onClick={() => setIsInviteModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleInvite} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Professional Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex gap-3">
                    <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-blue-900 mb-1">Standard Recruiter Role</p>
                      <p className="text-xs text-blue-700/80 leading-relaxed">
                        Invited members can post jobs, manage applications, and interview candidates. Only you can manage team members.
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={inviting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {inviting ? (
                     <Loader2 className="h-5 w-5 animate-spin" />
                  ) : "Send Invitation"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

