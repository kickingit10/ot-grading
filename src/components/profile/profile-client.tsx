'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/lib/types';
import { useTheme, type EraName } from '@/lib/theme';

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
  const [eraValue, setEraValue] = useState(profile?.era || 'lover');
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const { setTheme: setAppTheme, isTaylorSwift, era, setEra } = useTheme();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      if (!fullName.trim()) { setError('Enter your name'); setLoading(false); return; }
      if (!profile?.id) { setError('Profile not found'); setLoading(false); return; }
      const { error: err } = await supabase.from('profiles').update({ full_name: fullName.trim(), theme, era: eraValue }).eq('id', profile.id);
      if (err) setError(err.message);
      else { setAppTheme(theme as 'default' | 'taylor-swift'); setEra(eraValue as EraName); setSuccess(true); setTimeout(() => setSuccess(false), 2000); }
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="section-header">{isTaylorSwift ? 'Welcome to Your Era' : 'Account'}</div>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {error && <div className="alert alert-error text-sm animate-slide-in">{error}</div>}
          {success && <div className="alert alert-success text-sm animate-slide-in">{isTaylorSwift ? 'Updated — you belong with us!' : 'Profile updated'}</div>}
          <div><label className="label">Email</label><div className="input" style={{ opacity: 0.6 }}>{userEmail}</div></div>
          <div><label className="label" htmlFor="profile-name">Full name</label><input id="profile-name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input" /></div>
          <div><label className="label" htmlFor="profile-theme">Theme</label>
            <select id="profile-theme" value={theme} onChange={e => setThemeValue(e.target.value)} className="input">
              <option value="default">Default</option>
              <option value="taylor-swift">Eras Tour</option>
            </select>
            {isTaylorSwift && (
              <p className="text-xs mt-2" style={{ color: 'var(--color-primary)' }}>🌙 Midnights mode active — Long live the grading era</p>
            )}
          </div>
          {(theme === 'taylor-swift' || isTaylorSwift) && (
            <div>
              <label className="label" htmlFor="profile-era">Era</label>
              <select id="profile-era" value={eraValue} onChange={e => setEraValue(e.target.value)} className="input">
                <option value="fearless">Fearless</option>
                <option value="speakNow">Speak Now</option>
                <option value="red">Red</option>
                <option value="1989">1989</option>
                <option value="reputation">reputation</option>
                <option value="lover">Lover</option>
                <option value="folklore">folklore</option>
                <option value="evermore">evermore</option>
                <option value="midnights">Midnights</option>
                <option value="torturedPoets">TTPD</option>
              </select>
            </div>
          )}
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
          {passwordError && <div className="alert alert-error text-sm animate-slide-in">{passwordError}</div>}
          {passwordSuccess && <div className="alert alert-success text-sm animate-slide-in">Password updated</div>}
          <div><label className="label" htmlFor="profile-new-password">New password</label><input id="profile-new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="input" /></div>
          <div><label className="label" htmlFor="profile-confirm-password">Confirm password</label><input id="profile-confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="input" /></div>
          <button type="submit" disabled={passwordLoading} className="btn-primary w-full">{passwordLoading ? 'Updating...' : 'Update password'}</button>
        </form>
      </div>

      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 32 }}>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="btn-ghost w-full">Sign out</button>
      </div>
    </div>
  );
}
