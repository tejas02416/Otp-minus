'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, Smartphone, Mail, MessageSquare, PhoneCall, Key, Code, ShieldCheck } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ApiPlaygroundProps {
  projectId: string;
}

export function ApiPlayground({ projectId }: ApiPlaygroundProps) {
  const [channel, setChannel] = useState<'sms' | 'email' | 'whatsapp' | 'voice' | 'totp'>('sms');
  const [recipient, setRecipient] = useState('+15550192834');
  const [codeLength, setCodeLength] = useState<number>(6);
  const [expiresIn, setExpiresIn] = useState<number>(300);
  const [senderName, setSenderName] = useState('ApexAuth');

  const [loading, setLoading] = useState(false);
  const [sendResponse, setSendResponse] = useState<any>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResponse, setVerifyResponse] = useState<any>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSendResponse(null);
    setVerifyResponse(null);

    try {
      const res = await fetch('/api/v1/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Project-Id': projectId,
        },
        body: JSON.stringify({
          recipient,
          channel,
          code_length: codeLength,
          expires_in_seconds: expiresIn,
          sender_name: senderName,
        }),
      });

      const data = await res.json();
      setSendResponse(data);
      if (data.demo_otp) {
        setVerifyCode(data.demo_otp);
      }
    } catch (err: any) {
      setSendResponse({ error: err.message || 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendResponse?.request_id) return;

    setVerifyLoading(true);
    setVerifyResponse(null);

    try {
      const res = await fetch('/api/v1/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Project-Id': projectId,
        },
        body: JSON.stringify({
          request_id: sendResponse.request_id,
          code: verifyCode,
        }),
      });

      const data = await res.json();
      setVerifyResponse(data);
    } catch (err: any) {
      setVerifyResponse({ error: err.message || 'Verification failed' });
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Send OTP Column */}
      <GlassCard className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">1. Send OTP Request</h3>
              <p className="text-xs text-slate-400">POST /api/v1/otp/send</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
            Interactive Test
          </span>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Delivery Channel</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'sms', label: 'SMS', icon: Smartphone },
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                { id: 'voice', label: 'Voice', icon: PhoneCall },
              ].map((ch) => {
                const Icon = ch.icon;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setChannel(ch.id as any);
                      if (ch.id === 'email' && !recipient.includes('@')) setRecipient('alex@example.com');
                      if (ch.id !== 'email' && recipient.includes('@')) setRecipient('+15550192834');
                    }}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      channel === ch.id
                        ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 shadow-glow-brand'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Recipient {channel === 'email' ? '(Email Address)' : '(Phone Number with country code)'}
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">OTP Digits</label>
              <select
                value={codeLength}
                onChange={(e) => setCodeLength(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white"
              >
                <option value={4}>4 Digits</option>
                <option value={6}>6 Digits</option>
                <option value={8}>8 Digits</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Expires (sec)</label>
              <input
                type="number"
                value={expiresIn}
                onChange={(e) => setExpiresIn(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Sender Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-sm text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gradient-button text-white font-medium text-sm flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-spin text-white">⏳</span> : <Send className="w-4 h-4" />}
            <span>{loading ? 'Dispatching OTP...' : 'Send Test OTP'}</span>
          </button>
        </form>

        {sendResponse && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-semibold text-emerald-400">Response Status: 200 OK</span>
              <span>{sendResponse.expires_in_seconds}s expiry</span>
            </div>
            <pre className="text-slate-300 overflow-x-auto">{JSON.stringify(sendResponse, null, 2)}</pre>
          </div>
        )}
      </GlassCard>

      {/* Verify OTP Column */}
      <GlassCard className="space-y-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">2. Verify OTP Token</h3>
                <p className="text-xs text-slate-400">POST /api/v1/otp/verify</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Live Validation
            </span>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Request ID</label>
              <input
                type="text"
                value={sendResponse?.request_id || ''}
                readOnly
                placeholder="Send an OTP first to populate Request ID"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-300 font-mono bg-slate-900/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Enter OTP Code</label>
              <input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="Enter received 6-digit code"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-lg font-mono font-bold tracking-widest text-emerald-400 text-center"
                maxLength={8}
                required
              />
            </div>

            <button
              type="submit"
              disabled={verifyLoading || !sendResponse?.request_id}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{verifyLoading ? 'Verifying...' : 'Verify OTP Code'}</span>
            </button>
          </form>

          {verifyResponse && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className={`font-semibold ${verifyResponse.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {verifyResponse.success ? 'VERIFICATION SUCCESSFUL' : 'VERIFICATION FAILED'}
                </span>
              </div>
              <pre className="text-slate-300 overflow-x-auto">{JSON.stringify(verifyResponse, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
          <Key className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>OTPs are hashed with SHA-256 before saving to database and automatically invalidated after successful verification.</span>
        </div>
      </GlassCard>
    </div>
  );
}
