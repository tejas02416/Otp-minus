'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Key,
  Terminal,
  Smartphone,
  ListFilter,
  BarChart3,
  Webhook,
  FileCode2,
  ShieldAlert,
  Users,
  Code2,
  BookOpen,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole = 'developer' }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'API Keys', href: '/api-keys', icon: Key },
    { name: 'API Playground', href: '/playground', icon: Terminal },
    { name: 'Live Message Inbox', href: '/live-inbox', icon: Smartphone },
    { name: 'API & Request Logs', href: '/logs', icon: ListFilter },
    { name: 'Analytics & Latency', href: '/analytics', icon: BarChart3 },
    { name: 'Webhooks & Events', href: '/webhooks', icon: Webhook },
    { name: 'Message Templates', href: '/templates', icon: FileCode2 },
    { name: 'Security & IP Rules', href: '/security', icon: ShieldAlert },
    { name: 'Team Members', href: '/team', icon: Users },
    { name: 'SDKs & Integration', href: '/sdks', icon: Code2 },
    { name: 'API Documentation', href: '/docs', icon: BookOpen },
  ];

  if (userRole === 'admin') {
    navigation.push({ name: 'Admin Control Panel', href: '/admin', icon: ShieldCheck });
  }

  return (
    <aside className="w-64 flex-shrink-0 glass-panel border-r border-slate-800/80 bg-slate-950/70 p-4 min-h-[calc(100vh-4rem)] flex flex-col justify-between hidden md:flex">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
          Developer Workspace
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/40 shadow-glow-brand font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-800/80">
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/20 text-xs">
          <div className="flex items-center justify-between font-semibold text-white mb-1">
            <span>SaaS Quota Tier</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Pro Developer</span>
          </div>
          <p className="text-[11px] text-slate-400">12,450 / 50,000 monthly OTPs used</p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full w-[25%]" />
          </div>
        </div>
      </div>
    </aside>
  );
}
