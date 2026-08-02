'use client';

import React, { useState, useEffect } from 'react';
import { ListFilter } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { formatDate } from '@/lib/utils';

export default function LogsPage({ searchParams }: { searchParams?: { projectId?: string } }) {
  const activeProjectId = searchParams?.projectId || '';
  const [logs, setLogs] = useState<any[]>([]);
  const [logType, setLogType] = useState<'all' | 'errors' | 'otp'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    fetchLogs();
  }, [activeProjectId, logType]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = `/api/v1/logs?type=${logType}${activeProjectId ? `&projectId=${activeProjectId}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <ListFilter className="w-6 h-6 text-indigo-400" />
            API Request & Error Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit trail of incoming HTTP API calls, payload inspection, and verification failures.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setLogType('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${logType === 'all' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            All API Requests
          </button>
          <button
            onClick={() => setLogType('otp')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${logType === 'otp' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            OTP Verification Logs
          </button>
          <button
            onClick={() => setLogType('errors')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${logType === 'errors' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
          >
            Errors Only (4xx/5xx)
          </button>
        </div>
      </div>

      <GlassCard className="space-y-4">
        <div className="overflow-x-auto">
          {logType === 'otp' ? (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">Request ID</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Digits</th>
                  <th className="p-3">Attempts</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-indigo-300">{item.id}</td>
                    <td className="p-3 text-slate-200">{item.recipient}</td>
                    <td className="p-3 uppercase font-bold text-slate-400">{item.channel}</td>
                    <td className="p-3 text-slate-400">{item.code_length} digits</td>
                    <td className="p-3 text-slate-400">{item.attempt_count}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          item.status === 'verified'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : item.status === 'failed'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{formatDate(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">Endpoint</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Latency</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-white font-sans">{log.endpoint}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-bold">{log.method}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          log.status_code < 300 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {log.status_code}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{log.latency_ms} ms</td>
                    <td className="p-3 text-slate-400">{log.ip_address}</td>
                    <td className="p-3 text-slate-500">{formatDate(log.created_at)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-2xl glass-panel p-6 rounded-2xl border border-slate-700 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white font-mono">Log Details: {selectedLog.id}</h3>
              <button onClick={() => setSelectedLog(null)} className="text-xs text-slate-400 hover:text-white">
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500">Endpoint:</span> <span className="text-white font-bold">{selectedLog.endpoint}</span>
              </div>
              <div>
                <span className="text-slate-500">HTTP Status:</span> <span className="text-emerald-400 font-bold">{selectedLog.status_code}</span>
              </div>
              <div>
                <span className="text-slate-500">Latency:</span> <span className="text-amber-400">{selectedLog.latency_ms} ms</span>
              </div>
              <div>
                <span className="text-slate-500">IP:</span> <span className="text-slate-300">{selectedLog.ip_address}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase font-mono">Request Body</label>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
                {selectedLog.request_body || '{}'}
              </pre>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase font-mono">Response Body</label>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                {selectedLog.response_body || '{}'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
