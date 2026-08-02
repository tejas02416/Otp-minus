'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ title, value, subtitle, trend, icon: Icon, iconColor = 'text-indigo-400' }: StatCardProps) {
  return (
    <GlassCard className="flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-3xl font-bold tracking-tight text-white">{value}</div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>

      {trend && (
        <div className="mt-3 flex items-center text-xs gap-1">
          {trend.isPositive ? (
            <span className="flex items-center text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              {trend.value}
            </span>
          ) : (
            <span className="flex items-center text-rose-400 font-medium">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              {trend.value}
            </span>
          )}
          <span className="text-slate-500">vs last month</span>
        </div>
      )}
    </GlassCard>
  );
}
