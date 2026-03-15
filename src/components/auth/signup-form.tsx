'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const inputClass = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all duration-200';

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
      const { error: authError, data } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName } },
      });

      if (authError) {
        setError(authError.message);
      } else if (data.user) {
        router.push('/');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      {error && (
        <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg animate-slide-in">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="fullName" className="block text-sm font-light text-slate-600 mb-1.5">Full name</label>
        <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" required className={inputClass} />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-light text-slate-600 mb-1.5">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className={inputClass} />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-light text-slate-600 mb-1.5">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className={inputClass} />
      </div>

      <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
        {loading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}
