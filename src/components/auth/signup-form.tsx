'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: authError, data } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (authError) setError(authError.message);
      else if (data.user) router.push('/');
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      {error && <div className="alert alert-error text-sm animate-slide-in">{error}</div>}
      <div><label className="label" htmlFor="signup-name">Full name</label><input id="signup-name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" required className="input" /></div>
      <div><label className="label" htmlFor="signup-email">Email</label><input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="input" /></div>
      <div><label className="label" htmlFor="signup-password">Password</label><input id="signup-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="input" /></div>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating account...' : 'Create account'}</button>
    </form>
  );
}
