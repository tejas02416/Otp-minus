'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { StatCard } from '@/components/StatCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export default function AnalyticsPage({ searchParams }: { searchParams?: { projectId?: string } }) {
  const activeProjectId = searchParams?.projectId || '';
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [activeProjectId]);

  const fetchAnalytics = async () => {
    try {
      const url = activeProjectId ? `/api/v1/analytics?projectId=${activeProjectId}` : '/api/v1/analytics';
      const res = await fetch(url);
      const data = await res.json();
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    }
  };

  const channelPieData = analytics?.channelData || [
    { channel: 'sms', count: 450 },
    { channel: 'email', count: 320 },
    { channel: 'whatsapp', count: 210 },
    { channel: 'voice', count: 90 },
    { channel: 'totp', count: 180 },
  ];

  const COLORS = ['#6366f1', '#38bdf8', '#10b981', '#f59e0b', '#a855f7'];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          Usage & Latency Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed metrics breakdown across channels, API latency distribution, and conversion rates.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Conversion Rate"
          value={`${analytics?.metrics?.successRate || 95.1}%`}
          subtitle="Percentage of sent OTPs verified"
          icon={CheckCircle2}
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Average API Latency"
          value={`${analytics?.metrics?.averageLatencyMs || 32} ms`}
          subtitle="Response time at edge API gateway"
          icon={Zap}
          iconColor="text-amber-400"
        />
        <StatCard
          title="Monthly Sent Quota"
          value="12,450 / 50,000"
          subtitle="25% of Pro tier quota consumed"
          icon={TrendingUp}
          iconColor="text-indigo-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="space-y-4">
          <h3 className="text-base font-bold text-white">Delivery Channel Breakdown</h3>
          <p className="text-xs text-slate-400">Distribution of OTP volume across SMS, Email, WhatsApp, Voice & TOTP</p>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelPieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="channel" stroke="#64748b" fontSize={11} className="uppercase" />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c0f17',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Channel Market Share</h3>
            <p className="text-xs text-slate-400 font-sans">Proportion of authentication methods selected by users</p>

            <div className="h-56 w-full flex items-center justify-center pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {channelPieData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0f17',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-800 text-[11px] text-center font-mono">
            {channelPieData.map((ch: any, idx: number) => (
              <div key={ch.channel} className="space-y-1">
                <span className="block w-2.5 h-2.5 rounded-full mx-auto" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="uppercase text-slate-400 block">{ch.channel}</span>
                <span className="text-white font-bold block">{ch.count}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
