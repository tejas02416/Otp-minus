'use client';

import React, { useState } from 'react';
import { Code2, Copy, Check, Download, Layers } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { CodeBlock } from '@/components/CodeBlock';
import { getSdkCodeSnippet } from '@/lib/sdk-generators';

export default function SdksPage() {
  const [selectedLang, setSelectedLanguage] = useState('javascript');
  const [apiKey, setApiKey] = useState('opt_live_9a8b7c6d5e4f3a2b1c');

  const languages = [
    { id: 'javascript', label: 'JavaScript' },
    { id: 'nodejs', label: 'Node.js' },
    { id: 'python', label: 'Python' },
    { id: 'php', label: 'PHP' },
    { id: 'java', label: 'Java' },
    { id: 'kotlin', label: 'Kotlin' },
    { id: 'swift', label: 'Swift' },
    { id: 'flutter', label: 'Flutter' },
    { id: 'react-native', label: 'React Native' },
  ];

  const snippets = getSdkCodeSnippet(selectedLang, apiKey);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Code2 className="w-6 h-6 text-indigo-400" />
          Multi-Platform SDKs & Code Snippets
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Pre-built production code generators for 9 popular programming languages and mobile frameworks.
        </p>
      </div>

      {/* Language Tabs */}
      <GlassCard className="p-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLanguage(lang.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedLang === lang.id
                  ? 'gradient-button text-white shadow-glow-brand'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Code Snippets Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            Send OTP Code Snippet
          </h3>
          <CodeBlock code={snippets.sendOtp} language={selectedLang} />
        </GlassCard>

        <GlassCard className="space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Verify OTP Code Snippet
          </h3>
          <CodeBlock code={snippets.verifyOtp} language={selectedLang} />
        </GlassCard>
      </div>
    </div>
  );
}
