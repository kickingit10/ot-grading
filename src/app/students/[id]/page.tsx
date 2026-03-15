import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { StudentDetailClient } from '@/components/students/student-detail-client';
import { StudentWithSchool, Category, Grade, GradingPeriod } from '@/lib/types';

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch student with school
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*, school:schools(*)')
    .eq('id', id)
    .eq('therapist_id', user.id)
    .single();

  if (studentError || !student) {
    notFound();
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  // Fetch all grades for this student
  const { data: grades } = await supabase
    .from('grades')
    .select('*, category:categories(*)')
    .eq('student_id', id)
    .order('graded_at', { ascending: false });

  // Fetch grading periods
  const { data: gradingPeriods } = await supabase
    .from('grading_periods')
    .select('*')
    .eq('student_id', id)
    .order('start_date', { ascending: false });

  return (
    <StudentDetailClient
      student={student as StudentWithSchool}
      categories={categories as Category[] || []}
      initialGrades={grades as Grade[] || []}
      gradingPeriods={gradingPeriods as GradingPeriod[] || []}
    />
  );
}
