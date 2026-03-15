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
  const { setTheme: setAppTheme, isTaylorSwift } = useTheme();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      if (!fullName.trim()) { setError('Enter your name'); setLoading(false); return; }
      if (!profile?.id) { setError('Profile not found'); setLoading(false); return; }
      const { error: err } = await supabase.from('profiles').update({ full_name: fullName.trim(), theme }).eq('id', profile.id);
      if (err) setError(err.message);
      else { setAppTheme(theme as 'default' | 'taylor-swift'); setSuccess(true); setTimeout(() => setSuccess(false), 2000); }
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  const msgStyle = (type: 'success' | 'error') => ({
    background: type === 'error' ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)',
    borderColor: type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
    color: type === 'error' ? 'var(--color-error)' : 'var(--color-success)',
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="section-header">{isTaylorSwift ? 'Welcome to Your Era' : 'Account'}</div>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {error && <div className="px-3 py-2.5 rounded-lg border text-sm animate-slide-in" style={msgStyle('error')}>{error}</div>}
          {success && <div className="px-3 py-2.5 rounded-lg border text-sm animate-slide-in" style={msgStyle('success')}>{isTaylorSwift ? 'Updated — you belong with us!' : 'Profile updated'}</div>}
          <div><label className="label">Email</label><div className="input" style={{ opacity: 0.6 }}>{userEmail}</div></div>
          <div><label className="label">Full name</label><input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input" /></div>
          <div><label className="label">Theme</label>
            <select value={theme} onChange={e => setThemeValue(e.target.value)} className="input">
              <option value="default">Default</option>
              <option value="taylor-swift">Eras Tour</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Saving...' : 'Save profile'}</button>
        </form>
      </div>

      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 32 }}>
        <div className="section-header">Change Password</div>
        <form onSubmit={async (e) => {
          e.preventDefault(); setPasswordError(null);
          if (newPassword.length < 6) { setPasswordError('Min 6 characters'); return; }
          if (newPassword !== confirmPassword) { setPasswordError("Passwords don't match"); return; }
          setPasswordLoading(true);
          try {
            const { error: err } = await supabase.auth.updateUser({ password: newPassword });
            if (err) setPasswordError(err.message);
            else { setPasswordSuccess(true); setNewPassword(''); setConfirmPassword(''); setTimeout(() => setPasswordSuccess(false), 3000); }
          } catch { setPasswordError('An unexpected error occurred'); }
          finally { setPasswordLoading(false); }
        }} className="space-y-4">
          {passwordError && <div className="px-3 py-2.5 rounded-lg border text-sm animate-slide-in" style={msgStyle('error')}>{passwordError}</div>}
          {passwordSuccess && <div className="px-3 py-2.5 rounded-lg border text-sm animate-slide-in" style={msgStyle('success')}>Password updated</div>}
          <div><label className="label">New password</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="input" /></div>
          <div><label className="label">Confirm password</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="input" /></div>
          <button type="submit" disabled={passwordLoading} className="btn-primary w-full">{passwordLoading ? 'Updating...' : 'Update password'}</button>
        </form>
      </div>

      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 32 }}>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="btn-ghost w-full">Sign out</button>
      </div>
    </div>
  );
}
