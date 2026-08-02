'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [activeProject, setActiveProject] = useState<any>(null);

  useEffect(() => {
    fetchUserAndProjects();
  }, []);

  const fetchUserAndProjects = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.authenticated) {
          setUser(userData.user);
        }
      }

      const projRes = await fetch('/api/v1/projects');
      if (projRes.ok) {
        const projData = await projRes.json();
        if (projData.projects && projData.projects.length > 0) {
          setActiveProject(projData.projects[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar
        user={user}
        activeProjectId={activeProject?.id || ''}
        onSelectProject={(proj) => setActiveProject(proj)}
      />

      <div className="flex-1 flex w-full">
        <Sidebar userRole={user?.role || 'developer'} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Active project header banner if in sandbox mode */}
          {activeProject && activeProject.environment === 'sandbox' && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-amber-500/20 font-bold uppercase text-[10px]">Sandbox Mode</span>
                <span>You are currently testing in <strong>{activeProject.name}</strong> sandbox. Messages are logged in the Live Stream.</span>
              </div>
              <a href="/projects" className="underline hover:text-amber-200">Switch to Live Mode</a>
            </div>
          )}

          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { activeProjectId: activeProject?.id, activeProject } as any);
            }
            return child;
          })}
        </main>
      </div>
    </div>
  );
}
