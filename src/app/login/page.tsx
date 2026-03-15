import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  return (
    <div className="min-h-screen flex px-4" style={{ background: 'var(--color-bg)', padding: '80px 24px 32px 24px', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="text-center mb-8">
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 4, color: 'var(--color-text)' }}>OT Tracker</h1>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)' }}>Student grading for occupational therapists</p>
        </div>
        <div className="card p-7">
          <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20, color: 'var(--color-text)' }}>Welcome back</h2>
          <LoginForm />
        </div>
        <div className="mt-5 text-center">
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium transition-colors" style={{ color: 'var(--color-primary)' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
