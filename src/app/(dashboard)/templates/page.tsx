'use client';

import React, { useState, useEffect } from 'react';
import { FileCode2, Save, Eye } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';

export default function TemplatesPage({ searchParams }: { searchParams?: { projectId?: string } }) {
  const activeProjectId = searchParams?.projectId || '';
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTpl, setSelectedTpl] = useState<any>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [activeProjectId]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const url = activeProjectId ? `/api/v1/templates?projectId=${activeProjectId}` : '/api/v1/templates';
      const res = await fetch(url);
      const data = await res.json();
      if (data.templates) {
        setTemplates(data.templates);
        if (data.templates.length > 0) {
          setSelectedTpl(data.templates[0]);
          setSubject(data.templates[0].subject || '');
          setBody(data.templates[0].body || '');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTpl) return;

    setSaving(true);
    try {
      await fetch(`/api/v1/templates/${selectedTpl.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      });
      fetchTemplates();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const renderedPreview = body
    .replace(/\{\{otp\}\}/g, '849201')
    .replace(/\{\{app_name\}\}/g, 'ApexAuth')
    .replace(/\{\{expires_in\}\}/g, '5')
    .replace(/\{\{request_id\}\}/g, 'req_live_9988');

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <FileCode2 className="w-6 h-6 text-indigo-400" />
          Custom Email & SMS Templates
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize message copy and HTML formatting using dynamic placeholders like <code>{'{{otp}}'}</code>, <code>{'{{app_name}}'}</code>, <code>{'{{expires_in}}'}</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="space-y-3">
          <h3 className="text-base font-bold text-white mb-2">Message Templates</h3>
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => {
                setSelectedTpl(tpl);
                setSubject(tpl.subject || '');
                setBody(tpl.body || '');
              }}
              className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                selectedTpl?.id === tpl.id
                  ? 'border-indigo-500 bg-indigo-600/20 text-white font-medium shadow-glow-brand'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="uppercase font-bold text-indigo-300 font-mono">{tpl.channel}</span>
                <span className="text-[10px] text-slate-500">{tpl.id}</span>
              </div>
              <p className="text-sm font-semibold">{tpl.name}</p>
            </button>
          ))}
        </GlassCard>

        {selectedTpl && (
          <GlassCard className="lg:col-span-2 space-y-5">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Edit Template: {selectedTpl.name}</h3>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-button text-xs font-semibold text-white shadow-glow-brand"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Template'}</span>
                </button>
              </div>

              {selectedTpl.channel === 'email' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white font-sans"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Template Content</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white font-mono h-36 leading-relaxed"
                />
              </div>
            </form>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase font-mono flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                Live Rendered Message Preview
              </span>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                {selectedTpl.channel === 'email' ? (
                  <div dangerouslySetInnerHTML={{ __html: renderedPreview }} />
                ) : (
                  <p className="font-mono">{renderedPreview}</p>
                )}
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
