'use client';

import React, { useState, useEffect } from 'react';
import { Webhook, Plus, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { formatDate } from '@/lib/utils';

export default function WebhooksPage({ searchParams }: { searchParams?: { projectId?: string } }) {
  const activeProjectId = searchParams?.projectId || '';
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>(['otp.sent', 'otp.verified']);
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWebhooks();
  }, [activeProjectId]);

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const endpoint = activeProjectId ? `/api/v1/webhooks?projectId=${activeProjectId}` : '/api/v1/webhooks';
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.webhooks) setWebhooks(data.webhooks);
      if (data.deliveries) setDeliveries(data.deliveries);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectId) return alert('Select a project first.');

    try {
      const res = await fetch('/api/v1/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: activeProjectId, name, url, events }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setName('');
        setUrl('');
        fetchWebhooks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const testWebhook = async (webhookId: string) => {
    setTestingId(webhookId);
    try {
      await fetch('/api/v1/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookId, eventType: 'otp.verified' }),
      });
      fetchWebhooks();
    } catch (e) {
      console.error(e);
    } finally {
      setTestingId(null);
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook endpoint?')) return;
    try {
      await fetch(`/api/v1/webhooks/${id}`, { method: 'DELETE' });
      fetchWebhooks();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Webhook className="w-6 h-6 text-indigo-400" />
            Webhook Subscriptions & Delivery
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Receive real-time HTTP callbacks when OTP events occur (`otp.sent`, `otp.verified`, `otp.failed`).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-button text-xs font-semibold text-white shadow-glow-brand"
        >
          <Plus className="w-4 h-4" />
          <span>Add Webhook Endpoint</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="space-y-4">
          <h3 className="text-base font-bold text-white">Active Webhook Endpoints</h3>

          <div className="space-y-3">
            {webhooks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No webhooks configured yet.</div>
            ) : (
              webhooks.map((wh) => (
                <div key={wh.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{wh.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => testWebhook(wh.id)}
                        disabled={testingId === wh.id}
                        className="px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-medium"
                      >
                        {testingId === wh.id ? 'Sending...' : 'Test Event'}
                      </button>
                      <button onClick={() => deleteWebhook(wh.id)} className="p-1 rounded bg-rose-500/10 text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="font-mono text-xs text-indigo-300 bg-slate-950 p-2 rounded-lg border border-slate-800 truncate">
                    {wh.url}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                    <span>Secret: {wh.secret.substring(0, 16)}...</span>
                    <span>Created: {formatDate(wh.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard className="space-y-4">
          <h3 className="text-base font-bold text-white">Recent Delivery Logs</h3>

          <div className="space-y-2 overflow-y-auto max-h-[400px]">
            {deliveries.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No webhook deliveries logged yet.</div>
            ) : (
              deliveries.map((del) => (
                <div key={del.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-400">{del.event_type}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">{del.response_status} OK</span>
                  </div>
                  <div className="text-slate-400 flex items-center justify-between pt-1 text-[11px]">
                    <span>Latency: {del.delivery_time_ms} ms</span>
                    <span>{formatDate(del.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-white">Add Webhook Endpoint</h3>

            <form onSubmit={handleCreateWebhook} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Webhook Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production Backend Webhook"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Endpoint URL (HTTPS)</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.yourdomain.com/webhooks/otp"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white font-mono"
                  required
                />
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
                  Save Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
