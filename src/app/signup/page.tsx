import { SignupForm } from '@/components/auth/signup-form';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-1" style={{ color: 'var(--color-text)' }}>OT Tracker</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Create your account to get started</p>
        </div>
        <div className="card p-7">
          <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--color-text)' }}>Sign up</h2>
          <SignupForm />
        </div>
        <div className="mt-5 text-center">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium transition-colors" style={{ color: 'var(--color-primary)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
