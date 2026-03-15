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

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm inline-flex items-center gap-1 transition-colors" style={{ color: 'var(--color-text-muted)' }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Back
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mt-2" style={{ color: 'var(--color-text)' }}>Profile</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Manage your account</p>
        </div>
        <div className="card"><ProfileClient userEmail={user.email || ''} profile={profile as Profile} /></div>
      </div>
    </div>
  );
}
