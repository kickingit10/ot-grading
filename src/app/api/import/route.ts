import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface ImportGrade {
  date: string;
  category: string;
  score: number;
  notes: string | null;
  other_skills: string | null;
}

interface ImportStudent {
  first_name: string;
  last_name: string;
  school: string;
  status: string;
  start_date: string;
  end_date: string;
  grades: ImportGrade[];
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { students } = (await request.json()) as { students: ImportStudent[] };

    if (!students || !Array.isArray(students)) {
      return NextResponse.json({ error: 'Invalid data: expected { students: [...] }' }, { status: 400 });
    }

    // Fetch schools and categories for lookup
    const { data: schools } = await supabase.from('schools').select('*');
    const { data: categories } = await supabase.from('categories').select('*');

    if (!schools || !categories) {
      return NextResponse.json({ error: 'Failed to fetch schools or categories' }, { status: 500 });
    }

    const schoolMap = new Map(schools.map((s) => [s.name, s.id]));
    const categoryMap = new Map(categories.map((c) => [c.name, c]));

    let studentsCreated = 0;
    let gradesCreated = 0;
    let periodsCreated = 0;
    const errors: string[] = [];

    for (const studentData of students) {
      // Look up school
      const schoolId = schoolMap.get(studentData.school);
      if (!schoolId) {
        errors.push(`School not found: ${studentData.school}`);
        continue;
      }

      // Create student
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert({
          first_name: studentData.first_name,
          last_name: studentData.last_name,
          school_id: schoolId,
          therapist_id: user.id,
          status: studentData.status || 'active',
        })
        .select()
        .single();

      if (studentError) {
        errors.push(`Failed to create student ${studentData.first_name} ${studentData.last_name}: ${studentError.message}`);
        continue;
      }

      studentsCreated++;

      // Create grading period
      if (studentData.start_date && studentData.end_date) {
        const { error: periodError } = await supabase
          .from('grading_periods')
          .insert({
            student_id: student.id,
            name: 'Current Period',
            start_date: studentData.start_date,
            end_date: studentData.end_date,
            is_current: true,
          });

        if (periodError) {
          errors.push(`Failed to create grading period for ${studentData.first_name}: ${periodError.message}`);
        } else {
          periodsCreated++;
        }
      }

      // Insert grades
      if (studentData.grades && studentData.grades.length > 0) {
        const gradeRows = [];

        for (const gradeData of studentData.grades) {
          const cat = categoryMap.get(gradeData.category);
          if (!cat) {
            errors.push(`Category not found: ${gradeData.category}`);
            continue;
          }

          // Handle score conversion
          let score = gradeData.score;
          if (cat.score_type === 'raw') {
            // WPM values in the JSON are stored as decimals (0.02 = 2 WPM)
            // Multiply by 100 to get the real value
            score = Math.round(gradeData.score * 100);
          }
          // Percentage scores are already in 0-1 format, which is how we store them

          gradeRows.push({
            student_id: student.id,
            category_id: cat.id,
            score,
            notes: gradeData.notes || null,
            other_skills: gradeData.other_skills || null,
            graded_at: new Date(gradeData.date).toISOString(),
          });
        }

        if (gradeRows.length > 0) {
          const { error: gradesError, data: insertedGrades } = await supabase
            .from('grades')
            .insert(gradeRows)
            .select();

          if (gradesError) {
            errors.push(`Failed to insert grades for ${studentData.first_name}: ${gradesError.message}`);
          } else {
            gradesCreated += insertedGrades?.length || 0;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        studentsCreated,
        gradesCreated,
        periodsCreated,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Import failed: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
