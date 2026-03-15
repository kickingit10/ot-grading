import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { StudentDetailClient } from '@/components/students/student-detail-client';
import { StudentWithSchool, Category, Grade, GradingPeriod } from '@/lib/types';

interface StudentDetailPageProps { params: Promise<{ id: string }>; }

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Student must resolve first (guards with notFound)
  const { data: student, error: studentError } = await supabase
    .from('students').select('*, school:schools(*)').eq('id', id).eq('therapist_id', user.id).single();
  if (studentError || !student) notFound();

  // Parallelize remaining queries
  const [{ data: categories }, { data: grades }, { data: gradingPeriods }, { data: allStudents }] = await Promise.all([
    supabase.from('categories').select('*').order('display_order', { ascending: true }),
    supabase.from('grades').select('*, category:categories(*)').eq('student_id', id).order('graded_at', { ascending: false }),
    supabase.from('grading_periods').select('*').eq('student_id', id).order('start_date', { ascending: false }),
    supabase.from('students').select('id, first_name, last_name, school_id, school:schools(name)')
      .eq('therapist_id', user.id).eq('status', 'active').order('last_name', { ascending: true }),
  ]);

  return (
    <StudentDetailClient
      student={student as StudentWithSchool}
      categories={categories as Category[] || []}
      initialGrades={grades as Grade[] || []}
      gradingPeriods={gradingPeriods as GradingPeriod[] || []}
      allStudents={(allStudents || []).map((s: any) => ({ id: s.id, name: `${s.first_name} ${s.last_name}`, school: s.school?.name || '' }))}
    />
  );
}
