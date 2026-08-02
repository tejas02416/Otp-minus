import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Otp-Minus | Universal OTP Authentication SaaS Platform',
  description: 'Add secure 4, 6, or 8-digit OTP verification to websites and mobile applications through APIs and SDKs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-cyber-black text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
