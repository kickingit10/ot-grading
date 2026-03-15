'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const inputClass = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all duration-200';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      if (err) setError(err.message); else setSent(true);
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">OT Tracker</h1>
          <p className="text-sm text-slate-500">Reset your password</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-7">
          {sent ? (
            <div className="text-center space-y-3">
              <svg className="w-10 h-10 mx-auto text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <h2 className="text-lg font-semibold text-slate-900">Check your email</h2>
              <p className="text-sm text-slate-500">We sent a reset link to <strong className="text-slate-700">{email}</strong>.</p>
              <Link href="/login" className="inline-block mt-2 text-sm text-indigo-600 font-medium hover:text-indigo-500 transition-colors">Back to sign in</Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Forgot password?</h2>
              <p className="text-sm text-slate-500 mb-5">Enter your email for a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 animate-slide-in">{error}</div>}
                <div><label className="block text-sm font-light text-slate-600 mb-1.5">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className={inputClass} /></div>
                <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200">
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>
        <div className="mt-5 text-center">
          <Link href="/login" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
