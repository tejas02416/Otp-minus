'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Users, AlertTriangle, Ticket, Server, Cpu, Database, RefreshCw } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { StatCard } from '@/components/StatCard';
import { formatDate } from '@/lib/utils';

export default function AdminPage() {
  const [health, setHealth] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [healthRes, usersRes, fraudRes, ticketRes] = await Promise.all([
        fetch('/api/v1/admin/health'),
        fetch('/api/v1/admin/users'),
        fetch('/api/v1/admin/fraud'),
        fetch('/api/v1/admin/tickets'),
      ]);

      const healthData = await healthRes.json();
      const usersData = await usersRes.json();
      const fraudData = await fraudRes.json();
      const ticketData = await ticketRes.json();

      setHealth(healthData);
      if (usersData.users) setUsers(usersData.users);
      if (fraudData.fraudAlerts) setFraudAlerts(fraudData.fraudAlerts);
      if (ticketData.tickets) setTickets(ticketData.tickets);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            Platform Super Admin Panel
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System-wide operational monitoring, microservices status, user management, and fraud alerts.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          <span>Refresh System Health</span>
        </button>
      </div>

      {/* System Health Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>DATABASE ENGINE</span>
            <span className="text-emerald-400 font-bold">1.2ms latency</span>
          </div>
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-indigo-400" />
            <div>
              <div className="text-base font-bold text-white">SQLite WAL Engine</div>
              <div className="text-xs text-slate-400">High performance prepared query store</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>REDIS CACHE LAYER</span>
            <span className="text-emerald-400 font-bold">98.4% Hit Rate</span>
          </div>
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-amber-400" />
            <div>
              <div className="text-base font-bold text-white">In-Memory Token Cache</div>
              <div className="text-xs text-slate-400">24.5 MB RAM consumed</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>MESSAGE QUEUE WORKERS</span>
            <span className="text-emerald-400 font-bold">8 Active Workers</span>
          </div>
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6 text-emerald-400" />
            <div>
              <div className="text-base font-bold text-white">Delivery Queue System</div>
              <div className="text-xs text-slate-400">0 pending jobs in queue</div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Global Registered SaaS Developers */}
      <GlassCard className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          Global Tenant & Developer Accounts
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3">User ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Projects</th>
                <th className="p-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40">
                  <td className="p-3 text-indigo-300 font-bold">{u.id}</td>
                  <td className="p-3 text-white font-sans font-semibold">{u.name}</td>
                  <td className="p-3 text-slate-300 font-sans">{u.email}</td>
                  <td className="p-3 uppercase text-[10px] font-bold text-purple-400">{u.role}</td>
                  <td className="p-3 text-slate-400">{u.project_count} projects</td>
                  <td className="p-3 text-slate-500">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Fraud Alerts & Support Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Fraud Detection & Velocity Alerts
          </h3>

          <div className="space-y-3">
            {fraudAlerts.map((f) => (
              <div key={f.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-rose-400">{f.type}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 uppercase text-[10px]">{f.severity}</span>
                </div>
                <p className="text-xs text-slate-300 font-sans">{f.description}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Ticket className="w-4 h-4 text-sky-400" />
            Developer Support Tickets
          </h3>

          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-white font-sans">{t.subject}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase text-[10px]">{t.status}</span>
                </div>
                <p className="text-xs text-slate-400 font-sans">From: {t.user_email || 'Developer'}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
