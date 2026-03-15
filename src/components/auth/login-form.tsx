'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes('database error') || msg.includes('querying schema')) setError('Unable to connect. Please try again.');
        else if (msg.includes('invalid login credentials')) setError('Invalid email or password.');
        else setError(authError.message);
      } else { router.push('/dashboard'); }
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && <div className="alert alert-error text-sm animate-slide-in">{error}</div>}
      <div><label className="label" htmlFor="login-email">Email</label><input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="input" /></div>
      <div><label className="label" htmlFor="login-password">Password</label><input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="input" /></div>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing in...' : 'Sign in'}</button>
      <div className="text-center"><a href="/forgot-password" className="text-sm transition-colors" style={{ color: 'var(--color-text-muted)' }}>Forgot password?</a></div>
    </form>
  );
}
