import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-2">
            ✨ OT Tracker
          </h1>
          <p className="text-gray-600">Simple student grading for occupational therapists</p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome back</h2>
          <LoginForm />
        </div>

        {/* Sign up link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-purple-600 hover:text-purple-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
