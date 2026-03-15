'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Grade, Category } from '@/lib/types';
import { normalizeScore, formatDateInputValue } from '@/lib/utils';
import { useToast } from '@/lib/toast';

interface GradeEditModalProps {
  grade: Grade; category: Category | undefined; categories: Category[];
  studentId: string; onGradeUpdated: (grade: Grade) => void; onCancel: () => void;
}

export function GradeEditModal({ grade, category, categories, studentId, onGradeUpdated, onCancel }: GradeEditModalProps) {
  const [date, setDate] = useState(formatDateInputValue(grade.graded_at));
  const [categoryId, setCategoryId] = useState(grade.category_id);
  const [score, setScore] = useState(category?.score_type === 'percentage' ? Math.round(grade.score * 100).toString() : grade.score.toString());
  const [notes, setNotes] = useState(grade.notes || '');
  const [otherSkills, setOtherSkills] = useState(grade.other_skills || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const { toast } = useToast();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleSave = async () => {
    setError(null); setLoading(true);
    try {
      if (!categoryId || !score.trim()) { setError('Category and score required'); setLoading(false); return; }
      const scoreNum = parseFloat(score);
      if (isNaN(scoreNum)) { setError('Enter a valid score'); setLoading(false); return; }
      const normalizedScore = normalizeScore(scoreNum, selectedCategory!.score_type);
      const { data: updatedGrade, error: gradeError } = await supabase
        .from('grades').update({ category_id: categoryId, score: normalizedScore, notes: notes.trim() || null, other_skills: otherSkills.trim() || null, graded_at: new Date(date).toISOString() })
        .eq('id', grade.id).select('*, category:categories(*)').single();
      if (gradeError) { setError(gradeError.message); setLoading(false); return; }
      await supabase.from('grade_edits').insert({ grade_id: grade.id, previous_score: grade.score, previous_notes: grade.notes, previous_other_skills: grade.other_skills, previous_graded_at: grade.graded_at });
      toast('Grade updated');
      onGradeUpdated(updatedGrade as Grade);
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <div className="card border-2 space-y-3" style={{ borderColor: 'var(--color-primary)' }}>
      {error && <div className="alert alert-error text-sm animate-slide-in">{error}</div>}
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" /></div>
        <div><label className="label">Category</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input">
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select></div>
      </div>
      <div><label className="label">Score {selectedCategory && `(${selectedCategory.score_type === 'percentage' ? '0–100' : 'WPM'})`}</label>
        <input type="number" value={score} onChange={e => setScore(e.target.value)} min="0" className="input" /></div>
      <div><label className="label">Notes</label><textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} className="input" style={{ resize: 'vertical', minHeight: 60 }} /></div>
      <div><label className="label">Other skills</label><textarea rows={2} value={otherSkills} onChange={e => setOtherSkills(e.target.value)} className="input" style={{ resize: 'vertical', minHeight: 60 }} /></div>
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Save'}</button>
        <button onClick={onCancel} disabled={loading} className="btn-ghost flex-1">Cancel</button>
      </div>
    </div>
  );
}
