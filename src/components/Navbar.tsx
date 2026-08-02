'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Smartphone, Bell, LogOut, User, Sparkles, Plus, Terminal } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { ProjectSelector } from './ProjectSelector';
import { LiveInboxModal } from './LiveInboxModal';

interface NavbarProps {
  user?: any;
  activeProjectId?: string;
  onSelectProject?: (proj: any) => void;
}

export function Navbar({ user, activeProjectId = '', onSelectProject }: NavbarProps) {
  const router = useRouter();
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isCreateProjOpen, setIsCreateProjOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjEnv, setNewProjEnv] = useState<'sandbox' | 'live'>('sandbox');
  const [creating, setCreating] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName) return;
    setCreating(true);

    try {
      const res = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjName, environment: newProjEnv }),
      });
      const data = await res.json();
      if (data.project) {
        if (onSelectProject) onSelectProject(data.project);
        setIsCreateProjOpen(false);
        setNewProjName('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-glow-brand group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight gradient-text">Otp-Minus</span>
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase -mt-1">Universal Auth</span>
              </div>
            </Link>

            <div className="hidden md:block h-5 w-px bg-slate-800" />

            {onSelectProject && (
              <ProjectSelector
                activeProjectId={activeProjectId}
                onSelectProject={onSelectProject}
                onOpenCreateProjectModal={() => setIsCreateProjOpen(true)}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Live Message Inbox Trigger Button */}
            <button
              onClick={() => setIsInboxOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all shadow-glow-brand"
              title="Open Live Delivered Message Inbox Stream"
            >
              <Smartphone className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span className="hidden sm:inline">Live Deliveries Stream</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>

            <Link
              href="/playground"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>API Playground</span>
            </Link>

            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-medium text-white">{user.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono capitalize">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl glass-card text-slate-400 hover:text-rose-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-xl gradient-button text-xs font-semibold text-white shadow-glow-brand"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Live Message Inbox Modal */}
      <LiveInboxModal isOpen={isInboxOpen} onClose={() => setIsInboxOpen(false)} selectedProjectId={activeProjectId} />

      {/* Create Project Modal */}
      {isCreateProjOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Create New OTP Project
            </h3>
            <p className="text-xs text-slate-400">Each project gets separate API keys, security rules, and analytics.</p>

            <form onSubmit={handleCreateProject} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. Mobile App Auth, Admin Portal"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Default Environment</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewProjEnv('sandbox')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium ${
                      newProjEnv === 'sandbox' ? 'border-amber-500 bg-amber-500/20 text-amber-300' : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    Sandbox (Testing)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewProjEnv('live')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium ${
                      newProjEnv === 'live' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300' : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    Production (Live)
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateProjOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl gradient-button text-xs font-semibold text-white"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
