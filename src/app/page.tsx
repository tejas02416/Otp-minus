'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Smartphone,
  Mail,
  MessageSquare,
  PhoneCall,
  Lock,
  Zap,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Globe2,
  Code2,
  Key,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { GlassCard } from '@/components/GlassCard';
import { CodeBlock } from '@/components/CodeBlock';

export default function LandingPage() {
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'email' | 'whatsapp' | 'totp'>('sms');

  const snippet = `// Send OTP with Universal OTP SDK
import { OtpClient } from '@otpminus/sdk';

const otp = new OtpClient({ apiKey: 'opt_live_9a8b7c6d5e4f3a2b1c' });

const response = await otp.send({
  recipient: '+15550192834',
  channel: '${selectedChannel}',
  codeLength: 6,
  expiresInSeconds: 300,
});

console.log('OTP Request ID:', response.requestId);`;

  return (
    <div className="min-h-screen bg-cyber-black text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-radial from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none"></div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-glow-brand group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight gradient-text">Otp-Minus</span>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase -mt-1">Universal Auth Platform</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#channels" className="hover:text-white transition-colors">Channels</a>
            <a href="#developers" className="hover:text-white transition-colors">Developers & SDKs</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth/login" className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-200 text-xs font-medium hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 rounded-xl gradient-button text-xs font-semibold text-white shadow-glow-brand">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium backdrop-blur-md shadow-glow-brand">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Next-Generation SaaS Authentication Platform for Web & Mobile</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Universal OTP Verification <br />
          <span className="gradient-text">APIs & SDKs for Developers</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Add secure 4, 6, or 8-digit OTP authentication to your apps in minutes. Deliver codes instantly across SMS, Email, WhatsApp, Voice Calls, and TOTP.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/auth/signup" className="w-full sm:w-auto px-8 py-3.5 rounded-xl gradient-button text-sm font-semibold text-white shadow-glow-brand flex items-center justify-center gap-2">
            <span>Start Integrating Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link href="/dashboard" className="w-full sm:w-auto px-6 py-3.5 rounded-xl glass-card text-sm font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>Explore Dashboard Demo</span>
          </Link>
        </div>

        {/* Hero Interactive Code & Channels Showcase */}
        <div className="pt-10 max-w-4xl mx-auto text-left">
          <GlassCard className="p-6 border-indigo-500/30 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="text-xs font-mono text-slate-400 ml-2">otp-client.ts</span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
                {(['sms', 'email', 'whatsapp', 'totp'] as const).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setSelectedChannel(ch)}
                    className={`px-3 py-1 rounded-lg uppercase text-[10px] font-bold font-mono transition-colors ${
                      selectedChannel === ch ? 'bg-indigo-600 text-white shadow-glow-brand' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <CodeBlock code={snippet} language="typescript" />
          </GlassCard>
        </div>
      </section>

      {/* Multi-Channel Capabilities */}
      <section id="channels" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Supported Authentication Channels</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Choose from global multi-channel verification fallback options.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <GlassCard className="space-y-3">
            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 w-fit">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">SMS OTP</h3>
            <p className="text-xs text-slate-400">Global carrier delivery with custom sender name support.</p>
          </GlassCard>

          <GlassCard className="space-y-3">
            <div className="p-3 rounded-xl bg-sky-500/20 text-sky-400 w-fit">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Email OTP</h3>
            <p className="text-xs text-slate-400">Custom HTML email templates with dynamic placeholders.</p>
          </GlassCard>

          <GlassCard className="space-y-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 w-fit">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">WhatsApp OTP</h3>
            <p className="text-xs text-slate-400">Official Meta WhatsApp Business API integration.</p>
          </GlassCard>

          <GlassCard className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 w-fit">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Voice Call OTP</h3>
            <p className="text-xs text-slate-400">Text-to-speech automated voice call verification.</p>
          </GlassCard>

          <GlassCard className="space-y-3">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 w-fit">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">TOTP Authenticator</h3>
            <p className="text-xs text-slate-400">Google Authenticator & Authy 2FA QR code generator.</p>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-300">Otp-Minus Platform</span>
            <span>© 2026 Universal OTP Authentication SaaS. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-slate-300">Dashboard</Link>
            <Link href="/docs" className="hover:text-slate-300">Documentation</Link>
            <Link href="/sdks" className="hover:text-slate-300">SDKs</Link>
            <Link href="/security" className="hover:text-slate-300">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
