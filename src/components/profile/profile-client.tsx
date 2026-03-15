'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/lib/types';
import { useTheme } from '@/lib/theme';

interface ProfileClientProps {
  userEmail: string;
  profile: Profile | null;
}

export function ProfileClient({ userEmail, profile }: ProfileClientProps) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [theme, setThemeValue] = useState(profile?.theme || 'default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { setTheme: setAppTheme, isTaylorSwift } = useTheme();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!fullName.trim()) {
        setError('Please enter your full name');
        setLoading(false);
        return;
      }

      if (!profile?.id) {
        setError('Profile not found');
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          theme,
        })
        .eq('id', profile.id);

      if (updateError) {
        setError(`Failed to update profile: ${updateError.message}`);
      } else {
        setAppTheme(theme as 'default' | 'taylor-swift');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="space-y-8">
      {/* Account Info */}
      <div>
        <h2 className={`text-2xl font-bold mb-6 ${
          isTaylorSwift ? 'text-[#d4af37]' : 'text-gray-900'
        }`}>
          {isTaylorSwift ? 'Welcome to Your Era ⭐' : 'Account Information'}
        </h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {error && (
            <div className={`p-4 rounded-lg border ${
              isTaylorSwift
                ? 'bg-red-900/30 border-red-800'
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-sm ${isTaylorSwift ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
            </div>
          )}

          {success && (
            <div className={`p-4 rounded-lg border animate-slide-in ${
              isTaylorSwift
                ? 'bg-[#d4af37]/20 border-[#d4af37]/40'
                : 'bg-green-50 border-green-200'
            }`}>
              <p className={`text-sm ${
                isTaylorSwift ? 'text-[#d4af37]' : 'text-green-700'
              }`}>
                {isTaylorSwift ? '⭐ Profile updated — you belong with us!' : '✨ Profile updated!'}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-1 ${
              isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-700'
            }`}>
              Email (cannot be changed)
            </label>
            <div className={`w-full px-4 py-2 border rounded-lg ${
              isTaylorSwift
                ? 'bg-[#2a1a3e] border-[#4a0e4e] text-[#b0a090]'
                : 'bg-gray-100 border-gray-300 text-gray-600'
            }`}>
              {userEmail}
            </div>
          </div>

          <div>
            <label htmlFor="fullName" className={`block text-sm font-medium mb-1 ${
              isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-700'
            }`}>
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                isTaylorSwift
                  ? 'bg-[#2a1a3e] border-[#4a0e4e] text-[#f0e6d3] focus:ring-[#d4af37]'
                  : 'border-gray-300 focus:ring-purple-500'
              }`}
            />
          </div>

          <div>
            <label htmlFor="theme" className={`block text-sm font-medium mb-1 ${
              isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-700'
            }`}>
              Theme Preference
            </label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setThemeValue(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                isTaylorSwift
                  ? 'bg-[#2a1a3e] border-[#4a0e4e] text-[#f0e6d3] focus:ring-[#d4af37]'
                  : 'border-gray-300 focus:ring-purple-500'
              }`}
            >
              <option value="default">✨ Default (Lavender)</option>
              <option value="taylor-swift">⭐ Eras Tour</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 font-semibold rounded-lg disabled:opacity-50 transition-all ${
              isTaylorSwift
                ? 'bg-gradient-to-r from-[#d4af37] to-[#f4c2c2] text-[#1a1a2e] hover:from-[#e6c84d] hover:to-[#f8d4d4]'
                : 'bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600'
            }`}
          >
            {loading ? 'Saving...' : isTaylorSwift ? '⭐ Save Profile' : '💾 Save Profile'}
          </button>
        </form>
      </div>

      {/* Logout */}
      <div className={`border-t pt-8 ${isTaylorSwift ? 'border-[#2e2e4a]' : ''}`}>
        <h2 className={`text-2xl font-bold mb-4 ${
          isTaylorSwift ? 'text-[#f0e6d3]' : 'text-gray-900'
        }`}>Session</h2>
        <button
          onClick={handleLogout}
          className={`w-full py-3 px-4 font-semibold rounded-lg transition-all ${
            isTaylorSwift
              ? 'bg-[#2a1a3e] text-[#f0e6d3] hover:bg-[#3a2a4e]'
              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          }`}
        >
          👋 Logout
        </button>
      </div>
    </div>
  );
}
