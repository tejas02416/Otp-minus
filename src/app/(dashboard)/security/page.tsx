'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock, Save } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { formatDate } from '@/lib/utils';

export default function SecurityPage({ searchParams }: { searchParams?: { projectId?: string } }) {
  const activeProjectId = searchParams?.projectId || '';
  const [rules, setRules] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [whitelist, setWhitelist] = useState('');
  const [blacklist, setBlacklist] = useState('');
  const [rateLimit, setRateLimit] = useState(120);
  const [captcha, setCaptcha] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSecurityData();
  }, [activeProjectId]);

  const fetchSecurityData = async () => {
    if (!activeProjectId) return;
    try {
      const [rulesRes, auditRes] = await Promise.all([
        fetch(`/api/v1/security/rules?projectId=${activeProjectId}`),
        fetch(`/api/v1/security/audit-logs?projectId=${activeProjectId}`),
      ]);

      const rulesData = await rulesRes.json();
      const auditData = await auditRes.json();

      if (rulesData.rules) {
        setRules(rulesData.rules);
        setWhitelist(JSON.parse(rulesData.rules.ip_whitelist || '[]').join('\n'));
        setBlacklist(JSON.parse(rulesData.rules.ip_blacklist || '[]').join('\n'));
        setRateLimit(rulesData.rules.max_rate_limit_per_min || 120);
        setCaptcha(Boolean(rulesData.rules.captcha_required));
      }

      if (auditData.auditLogs) setAuditLogs(auditData.auditLogs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectId) return;

    setSaving(true);
    try {
      const whitelistArr = whitelist.split('\n').map((s) => s.trim()).filter(Boolean);
      const blacklistArr = blacklist.split('\n').map((s) => s.trim()).filter(Boolean);

      await fetch('/api/v1/security/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProjectId,
          ip_whitelist: whitelistArr,
          ip_blacklist: blacklistArr,
          max_rate_limit_per_min: Number(rateLimit),
          captcha_required: captcha ? 1 : 0,
        }),
      });

      fetchSecurityData();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-indigo-400" />
          Security Policies & Audit Trail
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure IP blocking rules, rate limits, replay protection, and view administrative audit logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="space-y-4">
          <form onSubmit={handleSaveRules} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                IP Filtering & Rate Limits
              </h3>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-button text-xs font-semibold text-white shadow-glow-brand"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Updating...' : 'Save Rules'}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Max Requests / Minute (Per IP & Key)
              </label>
              <input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                IP Blacklist (One IP per line)
              </label>
              <textarea
                value={blacklist}
                onChange={(e) => setBlacklist(e.target.value)}
                placeholder="e.g. 198.51.100.14"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white font-mono h-24"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                IP Whitelist (Leave blank to allow all IPs)
              </label>
              <textarea
                value={whitelist}
                onChange={(e) => setWhitelist(e.target.value)}
                placeholder="e.g. 192.168.1.1"
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-white font-mono h-20"
              />
            </div>
          </form>
        </GlassCard>

        <GlassCard className="space-y-4">
          <h3 className="text-base font-bold text-white">Immutable Security Audit Logs</h3>

          <div className="space-y-2 overflow-y-auto max-h-[400px]">
            {auditLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No audit logs recorded yet.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-indigo-400">{log.action}</span>
                    <span className="text-slate-500 text-[11px]">{formatDate(log.created_at)}</span>
                  </div>
                  <p className="text-slate-300">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
