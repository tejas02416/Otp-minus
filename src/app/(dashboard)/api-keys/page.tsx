'use client';

import React, { useState, useEffect } from 'react';
import { Key, Plus, Copy, Check, Trash2, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { formatDate } from '@/lib/utils';

export default function ApiKeysPage({ searchParams }: { searchParams?: { projectId?: string } }) {
  const activeProjectId = searchParams?.projectId || '';
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'live'>('sandbox');
  const [createdKey, setCreatedKey] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, [activeProjectId]);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const url = activeProjectId ? `/api/v1/keys?projectId=${activeProjectId}` : '/api/v1/keys';
      const res = await fetch(url);
      const data = await res.json();
      if (data.keys) setKeys(data.keys);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectId) return alert('Select an active project first.');

    try {
      const res = await fetch('/api/v1/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: activeProjectId, name: keyName, environment }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedKey({
          rawKey: data.rawApiKey,
          secret: data.key.secret_key,
          name: data.key.name,
        });
        setKeyName('');
        setIsModalOpen(false);
        fetchKeys();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const revokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API Key? Any application using this key will immediately fail authentication.')) return;
    try {
      await fetch(`/api/v1/keys/${id}`, { method: 'DELETE' });
      fetchKeys();
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Key className="w-6 h-6 text-indigo-400" />
            API Key & Secret Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authenticate API requests using Bearer token or <code>X-API-Key</code> header.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-button text-xs font-semibold text-white shadow-glow-brand"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New API Key</span>
        </button>
      </div>

      {createdKey && (
        <GlassCard className="border-2 border-emerald-500/50 bg-emerald-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Sparkles className="w-5 h-5" />
              API Key Generated Successfully!
            </div>
            <button onClick={() => setCreatedKey(null)} className="text-xs text-slate-400 hover:text-white">
              Dismiss
            </button>
          </div>
          <p className="text-xs text-slate-300">
            Please copy your API key and secret now. For security, full keys will <strong>never be displayed again</strong>.
          </p>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase">API Key (X-API-Key):</span>
              <div className="flex items-center justify-between text-emerald-400 font-bold mt-0.5">
                <span>{createdKey.rawKey}</span>
                <button
                  onClick={() => copyToClipboard(createdKey.rawKey)}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Webhook Secret Key:</span>
              <div className="text-indigo-300 font-bold mt-0.5">{createdKey.secret}</div>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3">Key Name</th>
                <th className="p-3">Key Prefix</th>
                <th className="p-3">Environment</th>
                <th className="p-3">Project</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last Used</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                    No API keys generated yet. Click &quot;Generate New API Key&quot; above.
                  </td>
                </tr>
              ) : (
                keys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-white font-sans">{k.name}</td>
                    <td className="p-3 text-indigo-300">{k.key_prefix}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          k.environment === 'live' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {k.environment}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-sans">{k.project_name || 'Active Project'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Active</span>
                    </td>
                    <td className="p-3 text-slate-400">{k.last_used_at ? formatDate(k.last_used_at) : 'Never'}</td>
                    <td className="p-3 text-slate-500">{formatDate(k.created_at)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => revokeKey(k.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-white">Generate API Key</h3>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Key Description / Name</label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Node Backend Production Server"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Key Scope Environment</label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                >
                  <option value="sandbox">Sandbox (opt_test_...)</option>
                  <option value="live">Live Production (opt_live_...)</option>
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
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
