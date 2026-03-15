import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AddStudentForm } from '@/components/students/add-student-form';
import { School } from '@/lib/types';
import Link from 'next/link';

export default async function AddStudentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: schools } = await supabase.from('schools').select('*').order('name', { ascending: true });

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 480 }} className="mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm inline-flex items-center gap-1 transition-colors" style={{ color: 'var(--color-text-muted)' }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Back
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mt-2" style={{ color: 'var(--color-text)' }}>Add student</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Create a profile to start tracking progress</p>
        </div>
        <div className="card"><AddStudentForm schools={schools as School[] || []} userId={user.id} /></div>
      </div>
    </div>
  );
}
