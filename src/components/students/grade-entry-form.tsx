'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StudentWithSchool, Category, Grade } from '@/lib/types';
import { normalizeScore, formatDateInputValue } from '@/lib/utils';
import { useTheme, getRandomTSMessage } from '@/lib/theme';
import { useToast } from '@/lib/toast';
import { SparkleBurst } from '@/components/sparkle-burst';

interface GradeEntryFormProps { student: StudentWithSchool; categories: Category[]; onGradeAdded: (grade: Grade) => void; }

const LAST_CATEGORY_KEY = 'ot-tracker-last-category';

export function GradeEntryForm({ student, categories, onGradeAdded }: GradeEntryFormProps) {
  const [date, setDate] = useState(formatDateInputValue(new Date().toISOString()));
  const [categoryId, setCategoryId] = useState('');
  const [score, setScore] = useState('');
  const [notes, setNotes] = useState('');
  const [otherSkills, setOtherSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSparkle, setShowSparkle] = useState(false);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const categoryRef = useRef<HTMLSelectElement>(null);
  const { isTaylorSwift: ts } = useTheme();
  const { toast } = useToast();

  const selectedCategory = categories.find((c) => c.id === categoryId);

  useEffect(() => {
    const lastCat = localStorage.getItem(LAST_CATEGORY_KEY);
    if (lastCat && categories.some((c) => c.id === lastCat)) setCategoryId(lastCat);
  }, [categories]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        const form = document.querySelector('form');
        if (form) form.requestSubmit();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      if (!categoryId || !score.trim()) { setError('Select a category and enter a score'); setLoading(false); return; }
      const scoreNum = parseFloat(score);
      if (isNaN(scoreNum)) { setError('Enter a valid score'); setLoading(false); return; }
      const normalizedScore = normalizeScore(scoreNum, selectedCategory!.score_type);
      const { data: newGrade, error: gradeError } = await supabase
        .from('grades')
        .insert({ student_id: student.id, category_id: categoryId, score: normalizedScore, notes: notes.trim() || null, other_skills: otherSkills.trim() || null, graded_at: new Date(date).toISOString() })
        .select('*, category:categories(*)').single();
      if (gradeError) { setError(`Failed to save: ${gradeError.message}`); setLoading(false); return; }
      localStorage.setItem(LAST_CATEGORY_KEY, categoryId);
      setScore(''); setNotes(''); setOtherSkills('');
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 1000);
      toast(ts ? getRandomTSMessage() : 'Grade saved');
      onGradeAdded(newGrade as Grade);
      setTimeout(() => categoryRef.current?.focus(), 100);
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <SparkleBurst active={showSparkle} isTaylorSwift={ts} />
      {error && (
        <div className="alert alert-error mb-4 text-sm animate-slide-in">{error}</div>
      )}

      {/* Row 1: Date, Category, Score */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div style={{ minWidth: 140 }}>
          <label className="label" htmlFor="grade-date">Date</label>
          <input id="grade-date" tabIndex={1} type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
        </div>
        <div className="flex-1" style={{ minWidth: 180 }}>
          <label className="label" htmlFor="grade-category">Category</label>
          <select id="grade-category" ref={categoryRef} tabIndex={2} value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input">
            <option value="">Select...</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name} ({cat.score_type === 'percentage' ? '0\u2013100' : 'WPM'})</option>)}
          </select>
        </div>
        <div style={{ minWidth: 100, maxWidth: 140 }}>
          <label className="label" htmlFor="grade-score">Score {selectedCategory && `(${selectedCategory.score_type === 'percentage' ? '0–100' : 'WPM'})`}</label>
          <input id="grade-score" tabIndex={3} type="number" value={score} onChange={e => setScore(e.target.value)} placeholder={selectedCategory?.score_type === 'percentage' ? '0–100' : 'e.g., 12'} step={selectedCategory?.score_type === 'percentage' ? '0.1' : '1'} min="0" className="input" />
        </div>
      </div>

      {/* Row 2: Notes — full width */}
      <div className="mb-4">
        <label className="label" htmlFor="grade-notes">Notes</label>
        <textarea id="grade-notes" tabIndex={4} rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional" className="input" style={{ resize: 'vertical' }} />
      </div>

      {/* Row 3: Other skills — full width, always visible */}
      <div className="mb-5">
        <label className="label" htmlFor="grade-other-skills">Other skills observed</label>
        <span className="text-[10px] block -mt-1.5 mb-1.5" style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>Additional skills noticed during grading</span>
        <textarea id="grade-other-skills" tabIndex={5} rows={2} value={otherSkills} onChange={e => setOtherSkills(e.target.value)} placeholder="Optional" className="input" style={{ resize: 'vertical' }} />
      </div>

      {/* Save row */}
      <div className="flex items-center justify-end gap-3">
        <span className="text-[10px] hidden sm:inline" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>⌘+Enter</span>
        <button tabIndex={6} type="submit" disabled={loading} className="btn-primary whitespace-nowrap">{loading ? (ts ? 'Recording...' : 'Saving...') : (ts ? 'Drop it 🎤' : 'Save grade')}</button>
      </div>
    </form>
  );
}
