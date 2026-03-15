'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

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
      {error && <div className="px-3 py-2.5 rounded-lg border text-sm animate-slide-in" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--color-error)' }}>{error}</div>}
      <div><label className="label">Full name</label><input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" required className="input" /></div>
      <div><label className="label">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="input" /></div>
      <div><label className="label">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="input" /></div>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating account...' : 'Create account'}</button>
    </form>
  );
}
