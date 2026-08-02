'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { formatDate } from '@/lib/utils';

export default function TeamPage({ searchParams }: { searchParams?: { projectId?: string } }) {
  const activeProjectId = searchParams?.projectId || '';
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'developer' | 'viewer'>('developer');

  useEffect(() => {
    fetchTeam();
  }, [activeProjectId]);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const url = activeProjectId ? `/api/v1/team?projectId=${activeProjectId}` : '/api/v1/team';
      const res = await fetch(url);
      const data = await res.json();
      if (data.members) setMembers(data.members);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectId) return alert('Select a project first');

    try {
      const res = await fetch('/api/v1/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: activeProjectId, email, role }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setEmail('');
        fetchTeam();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      await fetch(`/api/v1/team/${id}`, { method: 'DELETE' });
      fetchTeam();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Team Member Access & Roles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Invite developers, devops, and security auditors with RBAC permissions (Owner, Admin, Developer, Viewer).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-button text-xs font-semibold text-white shadow-glow-brand"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      <GlassCard className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3">Member Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Added Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-white font-sans">{m.email}</td>
                  <td className="p-3 uppercase text-[10px] font-bold text-indigo-300">{m.role}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] capitalize ${
                        m.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{formatDate(m.created_at)}</td>
                  <td className="p-3 text-right">
                    {m.role !== 'owner' && (
                      <button
                        onClick={() => removeMember(m.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-white">Invite Team Member</h3>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@yourcompany.com"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                >
                  <option value="admin">Admin (Full project control & keys)</option>
                  <option value="developer">Developer (Playground, logs, integration)</option>
                  <option value="viewer">Viewer (Read-only analytics & metrics)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl gradient-button text-xs font-semibold text-white">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
