'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-1" style={{ color: 'var(--color-text)' }}>OT Tracker</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Reset your password</p>
        </div>
        <div className="card p-7">
          {sent ? (
            <div className="text-center space-y-3">
              <svg className="w-10 h-10 mx-auto" style={{ color: 'var(--color-success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Check your email</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>We sent a reset link to <strong>{email}</strong>.</p>
              <Link href="/login" className="inline-block mt-2 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>Back to sign in</Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Forgot password?</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>Enter your email for a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="px-3 py-2.5 rounded-lg border text-sm animate-slide-in" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--color-error)' }}>{error}</div>}
                <div><label className="label">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="input" /></div>
                <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send reset link'}</button>
              </form>
            </>
          )}
        </div>
        <div className="mt-5 text-center"><Link href="/login" className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Back to sign in</Link></div>
      </div>
    </div>
  );
}
