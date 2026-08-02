'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, MessageSquare, PhoneCall, Smartphone, RefreshCw, Copy, Check } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';

interface LiveInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProjectId?: string;
}

export function LiveInboxModal({ isOpen, onClose, selectedProjectId }: LiveInboxModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const url = selectedProjectId ? `/api/v1/inbox?projectId=${selectedProjectId}` : '/api/v1/inbox';
      const res = await fetch(url);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInbox();
      const interval = setInterval(fetchInbox, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, selectedProjectId]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-3xl glass-panel rounded-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-700/60 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Live Delivered Messages Stream
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </h2>
              <p className="text-xs text-slate-400">Simulated real-time OTP message inbox across SMS, Email, WhatsApp & Voice</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchInbox}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh inbox"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {messages.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Smartphone className="w-12 h-12 mx-auto mb-3 text-slate-600 opacity-50" />
              <p>No messages sent yet in this environment.</p>
              <p className="text-xs text-slate-500 mt-1">Use the Interactive Playground or API to trigger an OTP.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-md bg-slate-800 border border-slate-700">{getChannelIcon(msg.channel)}</span>
                    <span className="text-xs font-semibold uppercase text-indigo-300">{msg.channel}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs font-mono text-slate-300">{msg.recipient}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-500">{formatTimeAgo(msg.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-200 mt-1 font-sans">{msg.message_content}</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center bg-slate-950 p-2.5 rounded-xl border border-indigo-500/20">
                  <span className="text-xs text-slate-400">OTP Code:</span>
                  <span className="text-base font-mono font-bold tracking-widest text-emerald-400">{msg.otp_code}</span>
                  <button
                    onClick={() => copyCode(msg.otp_code)}
                    className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 transition-colors"
                    title="Copy OTP code to clipboard"
                  >
                    {copiedCode === msg.otp_code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-900/80 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Auto-refreshes every 5s</span>
          <span className="text-emerald-400 flex items-center gap-1 font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span> Sandbox Live Stream Active
          </span>
        </div>
      </div>
    </div>
  );
}
