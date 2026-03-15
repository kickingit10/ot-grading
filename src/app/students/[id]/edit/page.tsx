import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { EditStudentClient } from '@/components/students/edit-student-client';
import { StudentWithSchool, School, GradingPeriod } from '@/lib/types';
import Link from 'next/link';

interface EditStudentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch student
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*, school:schools(*)')
    .eq('id', id)
    .eq('therapist_id', user.id)
    .single();

  if (studentError || !student) {
    notFound();
  }

  // Fetch schools
  const { data: schools } = await supabase
    .from('schools')
    .select('*')
    .order('name', { ascending: true });

  // Fetch grading periods
  const { data: gradingPeriods } = await supabase
    .from('grading_periods')
    .select('*')
    .eq('student_id', id)
    .order('start_date', { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/students/${id}`} className="text-purple-600 font-semibold mb-4 inline-block hover:text-purple-700">
            ← Back to student
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Edit Student</h1>
          <p className="text-gray-600 mt-2">Update {student.first_name}'s information</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
          <EditStudentClient
            student={student as StudentWithSchool}
            schools={schools as School[] || []}
            gradingPeriods={gradingPeriods as GradingPeriod[] || []}
          />
        </div>
      </div>
    </div>
  );
}
