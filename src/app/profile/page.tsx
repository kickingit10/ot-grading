import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileClient } from '@/components/profile/profile-client';
import { Profile } from '@/lib/types';
import Link from 'next/link';

export default async function ProfilePage() {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const isTaylorSwift = profile?.theme === 'taylor-swift';

  return (
    <div className={`min-h-screen ${
      isTaylorSwift
        ? 'bg-gradient-to-br from-[#1a1a2e] via-[#0d0d1a] to-[#2a1a3e]'
        : 'bg-gradient-to-br from-purple-50 via-white to-purple-50'
    }`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className={`font-semibold mb-4 inline-block ${
            isTaylorSwift
              ? 'text-[#d4af37] hover:text-[#e6c84d]'
              : 'text-purple-600 hover:text-purple-700'
          }`}>
            ← Back to dashboard
          </Link>
          <h1 className={`text-4xl font-bold ${
            isTaylorSwift ? 'text-[#f0e6d3]' : 'text-gray-900'
          }`}>
            {isTaylorSwift ? 'Your Profile ⭐' : 'Your Profile'}
          </h1>
          <p className={`mt-2 ${isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-600'}`}>
            {isTaylorSwift ? 'Customize your era' : 'Manage your account settings'}
          </p>
        </div>

        {/* Form */}
        <div className={`rounded-2xl shadow-lg p-8 border ${
          isTaylorSwift
            ? 'bg-[#1a1a2e] border-[#d4af37]/30'
            : 'bg-white border-purple-100'
        }`}>
          <ProfileClient
            userEmail={user.email || ''}
            profile={profile as Profile}
          />
        </div>
      </div>
    </div>
  );
}
