# OT Tracker - Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Get these from your Supabase project settings.

### 3. Run Development Server
```bash
npm run dev
```
Visit http://localhost:3000

## Database Setup

Create these tables in your Supabase project (SQL):

```sql
-- Schools
CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Categories
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  score_type text CHECK (score_type IN ('percentage', 'raw')),
  display_order int DEFAULT 0,
  created_at timestamp DEFAULT now()
);

-- Profiles (triggered from auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  email text,
  theme text DEFAULT 'light',
  created_at timestamp DEFAULT now()
);

-- Students
CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  school_id uuid NOT NULL REFERENCES schools,
  therapist_id uuid NOT NULL REFERENCES auth.users,
  status text CHECK (status IN ('active', 'archived')) DEFAULT 'active',
  created_at timestamp DEFAULT now()
);

-- Grading Periods
CREATE TABLE grading_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Grades
CREATE TABLE grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students,
  category_id uuid NOT NULL REFERENCES categories,
  score numeric NOT NULL,
  notes text,
  other_skills text,
  graded_at timestamp NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Grade Edits (audit trail)
CREATE TABLE grade_edits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id uuid NOT NULL REFERENCES grades,
  previous_score numeric NOT NULL,
  previous_notes text,
  previous_other_skills text,
  previous_graded_at timestamp NOT NULL,
  edited_at timestamp DEFAULT now(),
  edited_by uuid NOT NULL REFERENCES auth.users
);

-- Sample Categories (insert these)
INSERT INTO categories (name, score_type, display_order) VALUES
  ('Handwriting', 'percentage', 1),
  ('Reading Fluency (WPM)', 'raw', 2),
  ('Fine Motor Skills', 'percentage', 3),
  ('Gross Motor Skills', 'percentage', 4),
  ('Visual Perception', 'percentage', 5);

-- Sample School (insert this)
INSERT INTO schools (name) VALUES ('Lincoln Elementary School');
```

### 4. Row-Level Security (Recommended)

Enable RLS on tables and add policies in Supabase dashboard:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE grading_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies for students
CREATE POLICY "Therapists can view their own students"
  ON students FOR SELECT
  USING (therapist_id = auth.uid());

-- And so on...
```

## Usage

### Create Account
1. Go to http://localhost:3000/signup
2. Enter name, email, password
3. Profile automatically created

### Add Student
1. Click "Add Student" on dashboard
2. Enter first name, last name, school
3. Optionally create new school
4. Set grading period dates
5. Click "Create Student"

### Enter a Grade (10 seconds!)
1. Click on student card
2. Today's date is pre-filled
3. Select category from dropdown
4. Enter score
5. (Optional) Add notes
6. Click "✨ Save Grade"
7. Done! Appears in history immediately

### View Report Card
1. On student page, report is on the right
2. Select different grading period at top
3. See averages, counts, and notes per category

### Edit a Grade
1. In the grade history list, click "✏️ Edit"
2. Modal appears inline
3. Modify any field
4. Click "✨ Save"
5. Previous value saved in audit trail

### Delete a Grade
1. In the grade history list, click "🗑️ Delete"
2. Confirm deletion
3. Grade removed from history

### Manage Student
1. Click "⚙️ Edit" on student page
2. Update name, school
3. Add new grading periods
4. Archive student (if needed)

## Production Build

```bash
npm run build
npm start
```

## Troubleshooting

### Issue: "Supabase URL is required"
**Fix:** Check `.env.local` has correct environment variables

### Issue: Grades not loading
**Fix:** Verify RLS policies allow the authenticated user to read grades

### Issue: "Cannot insert profile"
**Fix:** Set up auth trigger in Supabase to auto-create profiles on signup

## File Structure

```
src/
├── app/
│   ├── page.tsx (Dashboard)
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── profile/page.tsx
│   └── students/
│       ├── new/page.tsx
│       ├── [id]/page.tsx (Main page)
│       └── [id]/edit/page.tsx
├── components/
│   ├── navbar.tsx
│   ├── auth/
│   ├── dashboard/
│   ├── students/
│   └── profile/
├── lib/
│   ├── types.ts
│   ├── utils.ts
│   └── supabase/
└── middleware.ts
```

## Key Components

| File | Purpose |
|------|---------|
| `grade-entry-form.tsx` | 10-second grade entry |
| `grades-list.tsx` | Grade history with edit/delete |
| `report-card-summary.tsx` | Period-filtered stats |
| `student-detail-client.tsx` | Main UI orchestrator |

## Score Display Rules

- **Percentage categories:** Store as 0-1, display as 0-100%
  - User enters: 85
  - Stored: 0.85
  - Displayed: 85%

- **Raw categories (WPM):** Store and display as-is
  - User enters: 45
  - Stored: 45
  - Displayed: 45 WPM

## Color Scheme

```css
--color-primary: #9b7ed8 (purple)
--color-primary-light: #c4b5e0 (light purple)
--color-primary-lighter: #f3e8ff (very light purple)
```

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Netlify
```bash
netlify deploy --prod
```

### Self-hosted
```bash
npm run build
npm start
```

## Support

For issues or questions:
1. Check IMPLEMENTATION_NOTES.md for detailed docs
2. Verify Supabase tables and RLS policies
3. Check browser console for errors
4. Check server logs for database issues

---

**You're ready to go!** Start with signing up, then add a student, then enter a grade. That's the core workflow.
