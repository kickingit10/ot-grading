import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { StudentWithSchool } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch students with school info
  const { data: students, error } = await supabase
    .from('students')
    .select('*, school:schools(*)')
    .eq('therapist_id', user.id)
    .eq('status', 'active')
    .order('last_name', { ascending: true });

  if (error) console.error('Error fetching students:', error);

  // Single query: fetch all grade stats at once (replaces N+1 loop)
  const studentStats: Record<string, { gradeCount: number; lastGradedDate: string | null }> = {};

  if (students && students.length > 0) {
    const studentIds = students.map(s => s.id);
    const { data: allGrades } = await supabase
      .from('grades')
      .select('student_id, graded_at')
      .in('student_id', studentIds);

    // Compute stats client-side from the single result
    for (const student of students) {
      const grades = allGrades?.filter(g => g.student_id === student.id) || [];
      studentStats[student.id] = {
        gradeCount: grades.length,
        lastGradedDate: grades.length > 0
          ? grades.reduce((latest: string | null, g) =>
              !latest || g.graded_at > latest ? g.graded_at : latest, null)
          : null,
      };
    }
  }

  return (
    <DashboardClient
      initialStudents={students as StudentWithSchool[] || []}
      studentStats={studentStats}
    />
  );
}
