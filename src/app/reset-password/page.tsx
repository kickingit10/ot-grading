'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const inputClass = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all duration-200';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessionReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => { if (session) setSessionReady(true); });
    return () => { subscription.unsubscribe(); };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (password.length < 6) { setError('Min 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords don\'t match'); return; }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) setError(err.message);
      else { setSuccess(true); setTimeout(() => router.push('/'), 2000); }
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">OT Tracker</h1>
          <p className="text-sm text-slate-500">Set your new password</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-7">
          {success ? (
            <div className="text-center space-y-3">
              <svg className="w-10 h-10 mx-auto text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
              <h2 className="text-lg font-semibold text-slate-900">Password updated</h2>
              <p className="text-sm text-slate-500">Redirecting to dashboard...</p>
            </div>
          ) : !sessionReady ? (
            <div className="text-center space-y-3">
              <div className="w-8 h-8 mx-auto border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
              <h2 className="text-lg font-semibold text-slate-900">Verifying link...</h2>
              <p className="text-sm text-slate-500">If this takes too long, your link may have expired.</p>
              <Link href="/forgot-password" className="inline-block mt-2 text-sm text-indigo-600 font-medium">Request a new link</Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-5">New password</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 animate-slide-in">{error}</div>}
                <div><label className="block text-sm font-light text-slate-600 mb-1.5">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className={inputClass} /></div>
                <div><label className="block text-sm font-light text-slate-600 mb-1.5">Confirm</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={6} className={inputClass} /></div>
                <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200">
                  {loading ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
