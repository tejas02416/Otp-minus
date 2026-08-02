'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, FolderKanban, ShieldCheck } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  environment: 'live' | 'sandbox';
}

interface ProjectSelectorProps {
  activeProjectId: string;
  onSelectProject: (proj: Project) => void;
  onOpenCreateProjectModal: () => void;
}

export function ProjectSelector({ activeProjectId, onSelectProject, onOpenCreateProjectModal }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/v1/projects');
      const data = await res.json();
      if (data.projects) {
        setProjects(data.projects);
        if (!activeProjectId && data.projects.length > 0) {
          onSelectProject(data.projects[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-indigo-500/50 text-xs font-medium text-slate-200 transition-all"
      >
        <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
        <span className="max-w-[120px] truncate">{activeProject ? activeProject.name : 'Select Project'}</span>
        {activeProject && (
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
              activeProject.environment === 'live' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {activeProject.environment}
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 glass-panel rounded-xl shadow-2xl z-50 p-2 border border-slate-700 space-y-1">
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase text-slate-400">Your Projects</div>
          {projects.map((proj) => (
            <button
              key={proj.id}
              onClick={() => {
                onSelectProject(proj);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                proj.id === activeProjectId ? 'bg-indigo-600/30 text-white font-medium border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span className="truncate">{proj.name}</span>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                  proj.environment === 'live' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {proj.environment}
              </span>
            </button>
          ))}

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenCreateProjectModal();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-indigo-400 hover:bg-indigo-500/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Project</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
