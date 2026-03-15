import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">
            OT Tracker
          </h1>
          <p className="text-sm text-slate-500">Student grading for occupational therapists</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-7">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">Welcome back</h2>
          <LoginForm />
        </div>

        <div className="mt-5 text-center">
          <p className="text-sm text-slate-500">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
