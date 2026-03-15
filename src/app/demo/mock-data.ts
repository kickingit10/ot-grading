import type { Category, Grade, StudentWithSchool } from '@/lib/types';

export const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Color', score_type: 'percentage', display_order: 1 },
  { id: 'cat-2', name: 'Cutting - Simple', score_type: 'percentage', display_order: 2 },
  { id: 'cat-3', name: 'Cutting - Complex', score_type: 'percentage', display_order: 3 },
  { id: 'cat-4', name: 'Writing - Line Placement', score_type: 'percentage', display_order: 4 },
  { id: 'cat-5', name: 'Writing - Letter Size', score_type: 'percentage', display_order: 5 },
  { id: 'cat-6', name: 'Writing - Spacing', score_type: 'percentage', display_order: 6 },
  { id: 'cat-7', name: 'Writing - Legibility', score_type: 'percentage', display_order: 7 },
  { id: 'cat-8', name: 'Words Per Minute', score_type: 'raw', display_order: 8 },
];

export const DEMO_STUDENTS: StudentWithSchool[] = [
  { id: 's1', first_name: 'Emma', last_name: 'Garcia', school_id: 'sch1', therapist_id: 'demo', status: 'active', school: { id: 'sch1', name: 'Riverside Elementary' } },
  { id: 's2', first_name: 'Liam', last_name: 'Chen', school_id: 'sch1', therapist_id: 'demo', status: 'active', school: { id: 'sch1', name: 'Riverside Elementary' } },
  { id: 's3', first_name: 'Olivia', last_name: 'Martinez', school_id: 'sch1', therapist_id: 'demo', status: 'active', school: { id: 'sch1', name: 'Riverside Elementary' } },
  { id: 's4', first_name: 'Noah', last_name: 'Williams', school_id: 'sch2', therapist_id: 'demo', status: 'active', school: { id: 'sch2', name: 'Oak Park Elementary' } },
  { id: 's5', first_name: 'Sophia', last_name: 'Johnson', school_id: 'sch2', therapist_id: 'demo', status: 'active', school: { id: 'sch2', name: 'Oak Park Elementary' } },
  { id: 's6', first_name: 'James', last_name: 'Brown', school_id: 'sch2', therapist_id: 'demo', status: 'active', school: { id: 'sch2', name: 'Oak Park Elementary' } },
];

const NOTES = [
  'Good focus today', 'Needs more practice', 'Great improvement!', 'Traced a-z',
  'Used adaptive scissors', 'Self-corrected spacing', 'Wrote first name independently',
  'Struggled with curves', 'Strong pencil grip', null, null, null, null, null, null, null,
];

// Deterministic pseudo-random: consistent across page loads
function seededValue(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export function generateDemoGrades(): Grade[] {
  const grades: Grade[] = [];
  let gradeId = 1;

  // Dates: Aug 2025 through Mar 2026 (roughly every 1-2 weeks)
  const dates: string[] = [];
  const start = new Date('2025-08-18');
  for (let i = 0; i < 30; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i * 7 + Math.floor(seededValue(i) * 4));
    if (d <= new Date('2026-03-15')) dates.push(d.toISOString().split('T')[0]);
  }

  DEMO_STUDENTS.forEach((student, si) => {
    // Each student gets grades on a subset of dates
    const studentDates = dates.filter((_, di) => seededValue(si * 100 + di) > 0.35);

    studentDates.forEach((date, di) => {
      // Pick 2-4 categories per session
      const catCount = 2 + Math.floor(seededValue(si * 1000 + di) * 3);
      const shuffledCats = [...DEMO_CATEGORIES].sort((a, b) => seededValue(si * 50 + di + a.display_order) - 0.5);
      const sessionCats = shuffledCats.slice(0, catCount);

      sessionCats.forEach((cat, ci) => {
        const seed = si * 10000 + di * 100 + ci;
        // Base score with slight upward trend over time
        const progress = di / studentDates.length * 0.15; // 0-15% improvement
        let score: number;
        if (cat.score_type === 'percentage') {
          const base = 0.55 + seededValue(seed + 1) * 0.25 + progress;
          score = Math.min(Math.max(Math.round(base * 100) / 100, 0.3), 1.0);
        } else {
          // WPM: 4-25 range with improvement
          score = Math.round(4 + seededValue(seed + 2) * 15 + progress * 30);
        }

        const noteIdx = Math.floor(seededValue(seed + 3) * NOTES.length);

        grades.push({
          id: `g${gradeId++}`,
          student_id: student.id,
          category_id: cat.id,
          score,
          notes: NOTES[noteIdx],
          other_skills: null,
          graded_at: `${date}T00:00:00Z`,
          category: cat,
        });
      });
    });
  });

  return grades;
}
