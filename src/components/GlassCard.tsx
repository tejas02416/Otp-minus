'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-6 glass-card relative overflow-hidden',
        hoverEffect ? 'hover:border-indigo-500/40 hover:shadow-glow-brand' : '',
        className
      )}
    >
      {children}
    </div>
  );
}
