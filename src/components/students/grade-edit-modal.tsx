'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Grade, Category } from '@/lib/types';
import { normalizeScore, formatDateInputValue } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { useToast } from '@/lib/toast';

interface GradeEditModalProps {
  grade: Grade;
  category: Category | undefined;
  categories: Category[];
  studentId: string;
  onGradeUpdated: (grade: Grade) => void;
  onCancel: () => void;
}

export function GradeEditModal({ grade, category, categories, studentId, onGradeUpdated, onCancel }: GradeEditModalProps) {
  const [date, setDate] = useState(formatDateInputValue(grade.graded_at));
  const [categoryId, setCategoryId] = useState(grade.category_id);
  const [score, setScore] = useState(category?.score_type === 'percentage' ? Math.round(grade.score * 100).toString() : grade.score.toString());
  const [notes, setNotes] = useState(grade.notes || '');
  const [otherSkills, setOtherSkills] = useState(grade.other_skills || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { isTaylorSwift: ts } = useTheme();
  const { toast } = useToast();

  // Escape key to cancel
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const inputClass = `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
    ts ? 'bg-white/[0.04] border-white/[0.08] text-[#f0e6d3] focus:ring-amber-500/30' : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500/40'
  }`;
  const labelClass = `block text-xs font-light mb-1.5 ${ts ? 'text-[#9ca3af]' : 'text-slate-500'}`;

  const handleSave = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!categoryId || !score.trim()) { setError('Category and score required'); setLoading(false); return; }
      const scoreNum = parseFloat(score);
      if (isNaN(scoreNum)) { setError('Enter a valid score'); setLoading(false); return; }
      const normalizedScore = normalizeScore(scoreNum, selectedCategory!.score_type);

      const { data: updatedGrade, error: gradeError } = await supabase
        .from('grades')
        .update({ category_id: categoryId, score: normalizedScore, notes: notes.trim() || null, other_skills: otherSkills.trim() || null, graded_at: new Date(date).toISOString() })
        .eq('id', grade.id).select('*, category:categories(*)').single();

      if (gradeError) { setError(gradeError.message); setLoading(false); return; }

      await supabase.from('grade_edits').insert({
        grade_id: grade.id, previous_score: grade.score, previous_notes: grade.notes,
        previous_other_skills: grade.other_skills, previous_graded_at: grade.graded_at,
      });
      toast('Grade updated');
      onGradeUpdated(updatedGrade as Grade);
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <div className={`p-4 rounded-lg border-2 space-y-3 ${ts ? 'bg-[#0a0a14] border-amber-500/40' : 'bg-white border-indigo-300'}`}>
      {error && <div className={`px-3 py-2 rounded-lg text-sm ${ts ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>{error}</div>}

      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelClass}>Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
            {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
          </select>
        </div>
      </div>

      <div><label className={labelClass}>Score {selectedCategory && `(${selectedCategory.score_type === 'percentage' ? '0–100' : 'WPM'})`}</label>
        <input type="number" value={score} onChange={(e) => setScore(e.target.value)} min="0" className={inputClass} /></div>
      <div><label className={labelClass}>Notes</label><input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} /></div>
      <div><label className={labelClass}>Other skills</label><input type="text" value={otherSkills} onChange={(e) => setOtherSkills(e.target.value)} className={inputClass} /></div>

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={loading}
          className={`flex-1 py-2 text-sm font-medium rounded-lg disabled:opacity-50 transition-all duration-200 ${
            ts ? 'bg-amber-500/90 text-[#0a0a14] hover:bg-amber-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}>{loading ? 'Saving...' : 'Save'}</button>
        <button onClick={onCancel} disabled={loading}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            ts ? 'bg-white/[0.06] text-[#f0e6d3] hover:bg-white/[0.1]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}>Cancel</button>
      </div>
    </div>
  );
}
