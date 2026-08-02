'use client';

import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus, ShieldCheck, ShieldAlert, Globe, Trash2, Edit, ExternalLink } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { formatDate } from '@/lib/utils';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'live'>('sandbox');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/projects');
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, environment, description }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setName('');
        setDescription('');
        fetchProjects();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleEnv = async (projId: string, currentEnv: string) => {
    const newEnv = currentEnv === 'live' ? 'sandbox' : 'live';
    try {
      await fetch(`/api/v1/projects/${projId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environment: newEnv }),
      });
      fetchProjects();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteProject = async (projId: string) => {
    if (!confirm('Are you sure you want to delete this project? All associated API keys and logs will be permanently removed.')) return;
    try {
      await fetch(`/api/v1/projects/${projId}`, { method: 'DELETE' });
      fetchProjects();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-400" />
            Project Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize multi-tenant apps, switch between Sandbox (testing) and Live (production) environments.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-button text-xs font-semibold text-white shadow-glow-brand"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <GlassCard key={proj.id} className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                    proj.environment === 'live'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {proj.environment} Mode
                </span>
                <span className="text-[11px] font-mono text-slate-500">{proj.slug}</span>
              </div>

              <h3 className="text-lg font-bold text-white mt-3">{proj.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{proj.description || 'No description provided.'}</p>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Created: {formatDate(proj.created_at)}</span>
                <span>ID: {proj.id.substring(0, 10)}...</span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => toggleEnv(proj.id, proj.environment)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Switch to {proj.environment === 'live' ? 'Sandbox' : 'Live'}
                </button>

                <button
                  onClick={() => deleteProject(proj.id)}
                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Project</h3>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mobile Banking App"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of what this OTP project is used for"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white h-20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Environment</label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                >
                  <option value="sandbox">Sandbox (Testing / Mock Delivery)</option>
                  <option value="live">Live (Production SMS / Email)</option>
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
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
