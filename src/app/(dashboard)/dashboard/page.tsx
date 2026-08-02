'use client';

import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  Smartphone,
  ShieldAlert,
  ArrowUpRight,
  Activity,
  Terminal,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { GlassCard } from '@/components/GlassCard';
import { ApiPlayground } from '@/components/ApiPlayground';
import { formatTimeAgo } from '@/lib/utils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

export default function DashboardOverviewPage({ searchParams }: { searchParams?: { projectId?: string } }) {
  const activeProjectId = searchParams?.projectId || '';
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [activeProjectId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const url = activeProjectId ? `?projectId=${activeProjectId}` : '';
      const [analyticsRes, logsRes, inboxRes] = await Promise.all([
        fetch(`/api/v1/analytics${url}`),
        fetch(`/api/v1/logs${url}`),
        fetch(`/api/v1/inbox${url}`),
      ]);

      const analyticsData = await analyticsRes.json();
      const logsData = await logsRes.json();
      const inboxData = await inboxRes.json();

      setAnalytics(analyticsData);
      if (logsData.logs) setRecentLogs(logsData.logs.slice(0, 8));
      if (inboxData.messages) setInboxMessages(inboxData.messages.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const metrics = analytics?.metrics || {
    totalSent: 1420,
    verifiedCount: 1350,
    failedCount: 70,
    pendingCount: 0,
    successRate: 95.1,
    averageLatencyMs: 32,
  };

  const timeSeriesData = analytics?.timeSeries || [
    { date: 'Mon', sent: 120, verified: 112, failed: 8 },
    { date: 'Tue', sent: 180, verified: 172, failed: 8 },
    { date: 'Wed', sent: 240, verified: 230, failed: 10 },
    { date: 'Thu', sent: 310, verified: 298, failed: 12 },
    { date: 'Fri', sent: 290, verified: 278, failed: 12 },
    { date: 'Sat', sent: 150, verified: 142, failed: 8 },
    { date: 'Sun', sent: 130, verified: 128, failed: 2 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-card bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            Universal OTP Control Center
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-mono border border-indigo-500/30">
              v2.4
            </span>
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Real-time multi-channel OTP delivery, security policies, and performance latency monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/live-inbox"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>View Live Inbox</span>
          </a>
          <a
            href="/playground"
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-button text-xs font-semibold text-white shadow-glow-brand"
          >
            <Terminal className="w-4 h-4" />
            <span>API Playground</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total OTPs Sent"
          value={metrics.totalSent.toLocaleString()}
          subtitle="Across SMS, Email, WhatsApp, Voice & TOTP"
          trend={{ value: '+14.2%', isPositive: true }}
          icon={Send}
          iconColor="text-indigo-400"
        />
        <StatCard
          title="Successful Verifications"
          value={metrics.verifiedCount.toLocaleString()}
          subtitle={`${metrics.successRate}% Conversion Rate`}
          trend={{ value: '+2.8%', isPositive: true }}
          icon={CheckCircle2}
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Failed Verifications"
          value={metrics.failedCount.toLocaleString()}
          subtitle="Expired or max retry limit reached"
          trend={{ value: '-1.4%', isPositive: true }}
          icon={XCircle}
          iconColor="text-rose-400"
        />
        <StatCard
          title="Avg API Latency"
          value={`${metrics.averageLatencyMs} ms`}
          subtitle="Global edge delivery response time"
          trend={{ value: '-4 ms', isPositive: true }}
          icon={Zap}
          iconColor="text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                OTP Volume & Delivery Trends
              </h3>
              <p className="text-xs text-slate-400">Daily verification distribution over the past 7 days</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              99.98% System Health
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c0f17',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="sent" stroke="#6366f1" fillOpacity={1} fill="url(#colorSent)" name="Sent" />
                <Area type="monotone" dataKey="verified" stroke="#10b981" fillOpacity={1} fill="url(#colorVerified)" name="Verified" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Recent Delivered Stream
              </h3>
              <a href="/live-inbox" className="text-xs text-indigo-400 hover:underline flex items-center gap-0.5">
                View All <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-3 mt-4">
              {inboxMessages.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">No messages sent yet.</div>
              ) : (
                inboxMessages.map((msg) => (
                  <div key={msg.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-mono text-indigo-300 font-semibold">{msg.recipient}</span>
                      <span>{formatTimeAgo(msg.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="capitalize text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {msg.channel}
                      </span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">{msg.otp_code}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <a
            href="/playground"
            className="w-full py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Trigger Test OTP Request</span>
          </a>
        </GlassCard>
      </div>

      <div className="pt-2">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-400" />
          Live Interactive API Testing Sandbox
        </h2>
        <ApiPlayground projectId={activeProjectId} />
      </div>

      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Recent API Request Stream</h3>
            <p className="text-xs text-slate-400">Real-time HTTP execution log with status codes and latency</p>
          </div>
          <a href="/logs" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
            View All Logs <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3">Endpoint</th>
                <th className="p-3">Method</th>
                <th className="p-3">Status</th>
                <th className="p-3">Latency</th>
                <th className="p-3">Client IP</th>
                <th className="p-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-slate-200">{log.endpoint}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-bold">{log.method}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        log.status_code < 300
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {log.status_code}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{log.latency_ms} ms</td>
                  <td className="p-3 text-slate-400">{log.ip_address}</td>
                  <td className="p-3 text-slate-500">{formatTimeAgo(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
