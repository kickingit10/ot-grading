import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileClient } from '@/components/profile/profile-client';
import { Profile } from '@/lib/types';
import Link from 'next/link';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const ts = profile?.theme === 'taylor-swift';

  return (
    <div className={`min-h-screen ${ts ? 'bg-[#0a0a14]' : 'bg-[#fafafa]'}`}>
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/" className={`text-sm inline-flex items-center gap-1 transition-colors ${
            ts ? 'text-amber-400/80 hover:text-amber-400' : 'text-slate-500 hover:text-slate-700'
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </Link>
          <h1 className={`text-2xl font-semibold tracking-tight mt-2 ${ts ? 'text-[#f0e6d3]' : 'text-slate-900'}`}>
            {ts ? 'Your Profile' : 'Profile'}
          </h1>
          <p className={`text-sm mt-1 ${ts ? 'text-[#9ca3af]' : 'text-slate-500'}`}>
            {ts ? 'Customize your era' : 'Manage your account'}
          </p>
        </div>
        <div className={`rounded-xl p-6 border ${ts ? 'ts-glass' : 'bg-white border-slate-200'}`}>
          <ProfileClient userEmail={user.email || ''} profile={profile as Profile} />
        </div>
      </div>
    </div>
  );
}
