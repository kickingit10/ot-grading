import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { StudentWithSchool } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch user's students with school info
  const { data: students, error } = await supabase
    .from('students')
    .select('*, school:schools(*)')
    .eq('therapist_id', user.id)
    .eq('status', 'active')
    .order('last_name', { ascending: true });

  if (error) {
    console.error('Error fetching students:', error);
  }

  // Count grades for each student
  let studentStats: Record<string, { gradeCount: number; lastGradedDate: string | null }> = {};

  if (students && students.length > 0) {
    for (const student of students) {
      const { data: grades } = await supabase
        .from('grades')
        .select('id, graded_at')
        .eq('student_id', student.id)
        .order('graded_at', { ascending: false })
        .limit(1);

      const { count } = await supabase
        .from('grades')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', student.id);

      studentStats[student.id] = {
        gradeCount: count || 0,
        lastGradedDate: grades?.[0]?.graded_at || null,
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
