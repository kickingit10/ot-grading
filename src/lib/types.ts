// Database types
export type School = {
  id: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
  score_type: 'percentage' | 'raw';
  display_order: number;
};

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  theme: string;
};

export type Student = {
  id: string;
  first_name: string;
  last_name: string;
  school_id: string;
  therapist_id: string;
  status: 'active' | 'archived';
  school?: School;
};

export type GradingPeriod = {
  id: string;
  student_id: string;
  name: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  is_current: boolean;
};

export type Grade = {
  id: string;
  student_id: string;
  category_id: string;
  score: number;
  notes: string | null;
  other_skills: string | null;
  graded_at: string; // ISO date string
  category?: Category;
};

export type GradeEdit = {
  id: string;
  grade_id: string;
  previous_score: number;
  previous_notes: string | null;
  previous_other_skills: string | null;
  previous_graded_at: string;
  edited_at: string;
  edited_by: string;
};

export type StudentWithSchool = Student & {
  school: School;
};
