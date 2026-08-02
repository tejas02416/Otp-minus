'use client';

import React from 'react';
import { Terminal } from 'lucide-react';
import { ApiPlayground } from '@/components/ApiPlayground';

export default function PlaygroundPage({ searchParams }: { searchParams?: { projectId?: string } }) {
  const activeProjectId = searchParams?.projectId || '';

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Terminal className="w-6 h-6 text-indigo-400" />
          Interactive API Testing Sandbox
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Execute live REST API calls against <code>/api/v1/otp/send</code> and <code>/api/v1/otp/verify</code>.
        </p>
      </div>

      <ApiPlayground projectId={activeProjectId} />
    </div>
  );
}
