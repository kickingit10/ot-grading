import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AddStudentForm } from '@/components/students/add-student-form';
import { School } from '@/lib/types';
import Link from 'next/link';

export default async function AddStudentPage() {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch schools
  const { data: schools, error } = await supabase
    .from('schools')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching schools:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-purple-600 font-semibold mb-4 inline-block hover:text-purple-700">
            ← Back to dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Add New Student</h1>
          <p className="text-gray-600 mt-2">Create a profile for a student to start tracking their progress</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
          <AddStudentForm schools={schools as School[] || []} userId={user.id} />
        </div>
      </div>
    </div>
  );
}
