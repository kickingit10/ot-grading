import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { EditStudentClient } from '@/components/students/edit-student-client';
import { StudentWithSchool, School, GradingPeriod } from '@/lib/types';
import Link from 'next/link';

interface EditStudentPageProps { params: Promise<{ id: string }>; }

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: student, error: studentError } = await supabase.from('students').select('*, school:schools(*)').eq('id', id).eq('therapist_id', user.id).single();
  if (studentError || !student) notFound();

  const { data: schools } = await supabase.from('schools').select('*').order('name', { ascending: true });
  const { data: gradingPeriods } = await supabase.from('grading_periods').select('*').eq('student_id', id).order('start_date', { ascending: false });

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href={`/students/${id}`} className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mt-2">Edit student</h1>
          <p className="text-sm text-slate-500 mt-1">Update {student.first_name}'s information</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <EditStudentClient student={student as StudentWithSchool} schools={schools as School[] || []} gradingPeriods={gradingPeriods as GradingPeriod[] || []} />
        </div>
      </div>
    </div>
  );
}
