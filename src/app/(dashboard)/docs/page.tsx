'use client';

import React, { useState } from 'react';
import { BookOpen, Send, CheckCircle2, ShieldCheck, Key, RefreshCw, FileCode, Layers } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { CodeBlock } from '@/components/CodeBlock';

export default function DocsPage() {
  const [activeEndpoint, setActiveEndpoint] = useState<'send' | 'verify' | 'resend' | 'status' | 'totp'>('send');

  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Universal OTP Platform API',
      version: '1.0.0',
      description: 'Production OTP Authentication REST API',
    },
    paths: {
      '/api/v1/otp/send': {
        post: {
          summary: 'Send OTP via SMS, Email, WhatsApp, Voice',
          headers: { 'X-API-Key': 'String (Required)' },
          requestBody: {
            recipient: '+15550192834',
            channel: 'sms | email | whatsapp | voice',
            code_length: 6,
            expires_in_seconds: 300,
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          API Reference Documentation & OpenAPI Spec
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete REST API documentation, request schemas, status codes, and security guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation List */}
        <GlassCard className="space-y-2 p-3">
          <span className="text-[11px] font-semibold text-slate-500 uppercase px-2 font-mono">Endpoints</span>
          {[
            { id: 'send', label: 'POST /api/v1/otp/send', color: 'text-indigo-400' },
            { id: 'verify', label: 'POST /api/v1/otp/verify', color: 'text-emerald-400' },
            { id: 'resend', label: 'POST /api/v1/otp/resend', color: 'text-sky-400' },
            { id: 'status', label: 'GET /api/v1/otp/status/:id', color: 'text-amber-400' },
            { id: 'totp', label: 'POST /api/v1/totp/setup', color: 'text-purple-400' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveEndpoint(item.id as any)}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all ${
                activeEndpoint === item.id
                  ? 'bg-indigo-600/30 text-white font-bold border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              <span className={item.color}>{item.label}</span>
            </button>
          ))}
        </GlassCard>

        {/* Endpoint Detail View */}
        <GlassCard className="lg:col-span-3 space-y-6">
          {activeEndpoint === 'send' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs">POST</span>
                <h2 className="text-lg font-bold text-white font-mono">/api/v1/otp/send</h2>
              </div>
              <p className="text-xs text-slate-300">
                Dispatches a secure OTP verification token via the requested delivery channel (SMS, Email, WhatsApp, Voice).
              </p>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-slate-400 font-mono">Request Headers</h4>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
                  <div><span className="text-indigo-400">X-API-Key:</span> opt_live_9a8b7c6d5e4f3a2b1c</div>
                  <div><span className="text-indigo-400">Content-Type:</span> application/json</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-slate-400 font-mono">Request Payload Schema</h4>
                <CodeBlock
                  code={JSON.stringify(
                    {
                      recipient: '+15550192834',
                      channel: 'sms',
                      code_length: 6,
                      expires_in_seconds: 300,
                      sender_name: 'ApexAuth',
                    },
                    null,
                    2
                  )}
                  language="json"
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-slate-400 font-mono">Success Response (200 OK)</h4>
                <CodeBlock
                  code={JSON.stringify(
                    {
                      success: true,
                      request_id: 'req_8f3a9b1c',
                      status: 'pending',
                      channel: 'sms',
                      recipient: '+15550192834',
                      expires_at: '2026-08-02T12:35:00.000Z',
                      expires_in_seconds: 300,
                    },
                    null,
                    2
                  )}
                  language="json"
                />
              </div>
            </div>
          )}

          {activeEndpoint === 'verify' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-mono font-bold text-xs">POST</span>
                <h2 className="text-lg font-bold text-white font-mono">/api/v1/otp/verify</h2>
              </div>
              <p className="text-xs text-slate-300">
                Verifies user-submitted OTP code. Automatically invalidates the code after single use.
              </p>

              <CodeBlock
                code={JSON.stringify(
                  {
                    request_id: 'req_8f3a9b1c',
                    code: '849201',
                  },
                  null,
                  2
                )}
                language="json"
              />
            </div>
          )}

          {activeEndpoint === 'totp' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-purple-600 text-white font-mono font-bold text-xs">POST</span>
                <h2 className="text-lg font-bold text-white font-mono">/api/v1/totp/setup</h2>
              </div>
              <p className="text-xs text-slate-300">
                Generates a TOTP secret and QR code data URL for Google Authenticator / Authy integration.
              </p>

              <CodeBlock
                code={JSON.stringify(
                  {
                    user_identifier: 'user@example.com',
                    app_name: 'Universal OTP Platform',
                  },
                  null,
                  2
                )}
                language="json"
              />
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
