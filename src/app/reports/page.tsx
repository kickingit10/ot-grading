import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ReportsClient } from '@/components/reports/reports-client';
import { StudentWithSchool, Category } from '@/lib/types';

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Parallel fetch: students, categories, all grades
  const [{ data: students }, { data: categories }, { data: allGrades }] = await Promise.all([
    supabase.from('students').select('*, school:schools(*)').eq('therapist_id', user.id).eq('status', 'active').order('last_name', { ascending: true }),
    supabase.from('categories').select('*').order('display_order', { ascending: true }),
    supabase.from('grades').select('student_id, category_id, score, graded_at')
      .in('student_id', (await supabase.from('students').select('id').eq('therapist_id', user.id).eq('status', 'active')).data?.map(s => s.id) || []),
  ]);

  return (
    <ReportsClient
      students={students as StudentWithSchool[] || []}
      categories={categories as Category[] || []}
      allGrades={allGrades || []}
    />
  );
}
