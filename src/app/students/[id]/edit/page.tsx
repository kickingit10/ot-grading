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

  // Student must resolve first (guards with notFound)
  const { data: student, error } = await supabase.from('students').select('*, school:schools(*)').eq('id', id).eq('therapist_id', user.id).single();
  if (error || !student) notFound();

  // Parallelize remaining queries
  const [{ data: schools }, { data: gradingPeriods }] = await Promise.all([
    supabase.from('schools').select('*').order('name', { ascending: true }),
    supabase.from('grading_periods').select('*').eq('student_id', id).order('start_date', { ascending: false }),
  ]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 24px' }}>
        <div className="mb-6">
          <Link href={`/students/${id}`} className="back-link">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Back
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mt-2" style={{ color: 'var(--color-text)' }}>Edit student</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Update {student.first_name}&apos;s information</p>
        </div>
        <div className="card"><EditStudentClient student={student as StudentWithSchool} schools={schools as School[] || []} gradingPeriods={gradingPeriods as GradingPeriod[] || []} /></div>
      </div>
    </div>
  );
}
