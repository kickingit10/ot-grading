'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/lib/types';
import { useTheme } from '@/lib/theme';

interface ProfileClientProps { userEmail: string; profile: Profile | null; }

export function ProfileClient({ userEmail, profile }: ProfileClientProps) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [theme, setThemeValue] = useState(profile?.theme || 'default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { setTheme: setAppTheme, isTaylorSwift: ts } = useTheme();

  const inputClass = `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
    ts ? 'bg-white/[0.04] border-white/[0.08] text-[#f0e6d3] focus:ring-amber-500/30' : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500/40'
  }`;
  const labelClass = `block text-sm font-light mb-1.5 ${ts ? 'text-[#9ca3af]' : 'text-slate-500'}`;
  const btnPrimary = `w-full py-2 px-4 text-sm font-medium rounded-lg disabled:opacity-50 transition-all duration-200 ${
    ts ? 'bg-amber-500/90 text-[#0a0a14] hover:bg-amber-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'
  }`;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      if (!fullName.trim()) { setError('Enter your name'); setLoading(false); return; }
      if (!profile?.id) { setError('Profile not found'); setLoading(false); return; }
      const { error: err } = await supabase.from('profiles').update({ full_name: fullName.trim(), theme }).eq('id', profile.id);
      if (err) setError(err.message);
      else { setAppTheme(theme as 'default' | 'taylor-swift'); setSuccess(true); setTimeout(() => setSuccess(false), 2000); }
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-base font-semibold mb-4 ${ts ? 'text-amber-400' : 'text-slate-900'}`}>
          {ts ? 'Welcome to Your Era' : 'Account'}
        </h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {error && <div className={`px-3 py-2.5 rounded-lg border text-sm animate-slide-in ${ts ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>{error}</div>}
          {success && <div className={`px-3 py-2.5 rounded-lg border text-sm animate-slide-in ${ts ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>{ts ? 'Updated — you belong with us!' : 'Profile updated'}</div>}

          <div>
            <label className={labelClass}>Email</label>
            <div className={`px-3 py-2 text-sm rounded-lg ${ts ? 'bg-white/[0.02] text-[#9ca3af] border border-white/[0.06]' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>{userEmail}</div>
          </div>
          <div><label className={labelClass}>Full name</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>Theme</label>
            <select value={theme} onChange={(e) => setThemeValue(e.target.value)} className={inputClass}>
              <option value="default">Default</option>
              <option value="taylor-swift">Eras Tour</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className={btnPrimary}>{loading ? 'Saving...' : 'Save profile'}</button>
        </form>
      </div>

      <div className={`border-t pt-8 ${ts ? 'border-white/[0.06]' : 'border-slate-200'}`}>
        <h2 className={`text-base font-semibold mb-4 ${ts ? 'text-[#f0e6d3]' : 'text-slate-900'}`}>Change password</h2>
        <form onSubmit={async (e) => {
          e.preventDefault(); setPasswordError(null);
          if (newPassword.length < 6) { setPasswordError('Min 6 characters'); return; }
          if (newPassword !== confirmPassword) { setPasswordError('Passwords don\'t match'); return; }
          setPasswordLoading(true);
          try {
            const { error: err } = await supabase.auth.updateUser({ password: newPassword });
            if (err) setPasswordError(err.message);
            else { setPasswordSuccess(true); setNewPassword(''); setConfirmPassword(''); setTimeout(() => setPasswordSuccess(false), 3000); }
          } catch { setPasswordError('An unexpected error occurred'); }
          finally { setPasswordLoading(false); }
        }} className="space-y-4">
          {passwordError && <div className={`px-3 py-2.5 rounded-lg border text-sm animate-slide-in ${ts ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>{passwordError}</div>}
          {passwordSuccess && <div className={`px-3 py-2.5 rounded-lg border text-sm animate-slide-in ${ts ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>Password updated</div>}

          <div><label className={labelClass}>New password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required minLength={6} className={inputClass} /></div>
          <div><label className={labelClass}>Confirm password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={6} className={inputClass} /></div>
          <button type="submit" disabled={passwordLoading} className={btnPrimary}>{passwordLoading ? 'Updating...' : 'Update password'}</button>
        </form>
      </div>

      <div className={`border-t pt-8 ${ts ? 'border-white/[0.06]' : 'border-slate-200'}`}>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
          className={`w-full py-2 px-4 text-sm font-medium rounded-lg border transition-all duration-200 ${
            ts ? 'border-white/[0.08] text-[#9ca3af] hover:bg-white/[0.06]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}>
          Sign out
        </button>
      </div>
    </div>
  );
}
