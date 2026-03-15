import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-1" style={{ color: 'var(--color-text)' }}>OT Tracker</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Student grading for occupational therapists</p>
        </div>
        <div className="card p-7">
          <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--color-text)' }}>Welcome back</h2>
          <LoginForm />
        </div>
        <div className="mt-5 text-center">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium transition-colors" style={{ color: 'var(--color-primary)' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
