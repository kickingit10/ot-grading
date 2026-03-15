'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY') setSessionReady(true); });
    supabase.auth.getSession().then(({ data: { session } }) => { if (session) setSessionReady(true); });
    return () => { subscription.unsubscribe(); };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (password.length < 6) { setError('Min 6 characters'); return; }
    if (password !== confirmPassword) { setError("Passwords don't match"); return; }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) setError(err.message); else { setSuccess(true); setTimeout(() => router.push('/'), 2000); }
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-1" style={{ color: 'var(--color-text)' }}>OT Tracker</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Set your new password</p>
        </div>
        <div className="card p-7">
          {success ? (
            <div className="text-center space-y-3">
              <svg className="w-10 h-10 mx-auto" style={{ color: 'var(--color-success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Password updated</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Redirecting...</p>
            </div>
          ) : !sessionReady ? (
            <div className="text-center space-y-3">
              <div className="w-8 h-8 mx-auto border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Verifying link...</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>If this takes too long, your link may have expired.</p>
              <Link href="/forgot-password" className="inline-block mt-2 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>Request a new link</Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--color-text)' }}>New password</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="alert alert-error text-sm animate-slide-in">{error}</div>}
                <div><label className="label" htmlFor="reset-password">Password</label><input id="reset-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="input" /></div>
                <div><label className="label" htmlFor="reset-confirm">Confirm</label><input id="reset-confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="input" /></div>
                <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Updating...' : 'Update password'}</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
