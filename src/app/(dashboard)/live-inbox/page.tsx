'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Mail, MessageSquare, PhoneCall, RefreshCw, Copy, Check } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { formatTimeAgo } from '@/lib/utils';

export default function LiveInboxPage({ searchParams }: { searchParams?: { projectId?: string } }) {
  const activeProjectId = searchParams?.projectId || '';
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 4000);
    return () => clearInterval(interval);
  }, [activeProjectId]);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const url = activeProjectId ? `/api/v1/inbox?projectId=${activeProjectId}` : '/api/v1/inbox';
      const res = await fetch(url);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'email':
        return <Mail className="w-4 h-4 text-sky-400" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'voice':
        return <PhoneCall className="w-4 h-4 text-amber-400" />;
      default:
        return <Smartphone className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-emerald-400 animate-pulse" />
            Live Delivered Messages Stream
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed of all generated OTP messages delivered via SMS, Email, WhatsApp, or Voice.
          </p>
        </div>

        <button
          onClick={fetchInbox}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <GlassCard className="space-y-3">
        {messages.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Smartphone className="w-12 h-12 mx-auto mb-3 text-slate-600 opacity-50" />
            <p className="font-semibold text-white">No messages sent yet in this environment.</p>
            <p className="text-xs text-slate-500 mt-1">
              Trigger an OTP from the <a href="/playground" className="text-indigo-400 underline">API Playground</a> or using your API keys.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-md bg-slate-800 border border-slate-700">{getChannelIcon(msg.channel)}</span>
                  <span className="text-xs font-semibold uppercase text-indigo-300 font-mono">{msg.channel}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs font-mono text-white font-bold">{msg.recipient}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-500">{formatTimeAgo(msg.created_at)}</span>
                </div>
                <p className="text-sm text-slate-200">{msg.message_content}</p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center bg-slate-950 p-2.5 rounded-xl border border-indigo-500/30 shadow-glow-brand">
                <span className="text-xs text-slate-400">OTP Code:</span>
                <span className="text-lg font-mono font-bold tracking-widest text-emerald-400">{msg.otp_code}</span>
                <button
                  onClick={() => copyCode(msg.otp_code)}
                  className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 transition-colors ml-1"
                >
                  {copiedCode === msg.otp_code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))
        )}
      </GlassCard>
    </div>
  );
}
