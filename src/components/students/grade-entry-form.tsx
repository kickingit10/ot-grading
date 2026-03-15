'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StudentWithSchool, Category, Grade } from '@/lib/types';
import { normalizeScore, formatDateInputValue } from '@/lib/utils';
import { useTheme, getRandomTSMessage } from '@/lib/theme';
import { SparkleBurst } from '@/components/sparkle-burst';

interface GradeEntryFormProps {
  student: StudentWithSchool;
  categories: Category[];
  onGradeAdded: (grade: Grade) => void;
}

const LAST_CATEGORY_KEY = 'ot-tracker-last-category';

export function GradeEntryForm({ student, categories, onGradeAdded }: GradeEntryFormProps) {
  const [date, setDate] = useState(formatDateInputValue(new Date().toISOString()));
  const [categoryId, setCategoryId] = useState('');
  const [score, setScore] = useState('');
  const [notes, setNotes] = useState('');
  const [otherSkills, setOtherSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showSparkle, setShowSparkle] = useState(false);
  const supabase = createClient();
  const scoreRef = useRef<HTMLInputElement>(null);
  const { isTaylorSwift: ts } = useTheme();

  const selectedCategory = categories.find((c) => c.id === categoryId);

  useEffect(() => {
    const lastCat = localStorage.getItem(LAST_CATEGORY_KEY);
    if (lastCat && categories.some((c) => c.id === lastCat)) setCategoryId(lastCat);
  }, [categories]);

  useEffect(() => {
    if (successMsg) { const t = setTimeout(() => setSuccessMsg(null), 2500); return () => clearTimeout(t); }
  }, [successMsg]);

  const inputClass = `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
    ts
      ? 'bg-white/[0.04] border-white/[0.08] text-[#f0e6d3] placeholder:text-[#9ca3af]/40 focus:ring-amber-500/30 focus:border-amber-500/30'
      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/40 focus:border-indigo-400'
  }`;
  const labelClass = `block text-xs font-light mb-1.5 ${ts ? 'text-[#9ca3af]' : 'text-slate-500'}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!categoryId || !score.trim()) { setError('Select a category and enter a score'); setLoading(false); return; }
      const scoreNum = parseFloat(score);
      if (isNaN(scoreNum)) { setError('Enter a valid score'); setLoading(false); return; }

      const normalizedScore = normalizeScore(scoreNum, selectedCategory!.score_type);
      const { data: newGrade, error: gradeError } = await supabase
        .from('grades')
        .insert({ student_id: student.id, category_id: categoryId, score: normalizedScore, notes: notes.trim() || null, other_skills: otherSkills.trim() || null, graded_at: new Date(date).toISOString() })
        .select('*, category:categories(*)')
        .single();

      if (gradeError) { setError(`Failed to save: ${gradeError.message}`); setLoading(false); return; }

      localStorage.setItem(LAST_CATEGORY_KEY, categoryId);
      setScore(''); setNotes(''); setOtherSkills('');
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 1000);
      setSuccessMsg(ts ? getRandomTSMessage() : 'Grade saved');
      onGradeAdded(newGrade as Grade);
      setTimeout(() => scoreRef.current?.focus(), 100);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <SparkleBurst active={showSparkle} isTaylorSwift={ts} />

      {error && (
        <div className={`mb-4 px-3 py-2.5 rounded-lg border text-sm animate-slide-in ${
          ts ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
        }`}>{error}</div>
      )}
      {successMsg && (
        <div className={`mb-4 px-3 py-2.5 rounded-lg border text-sm font-medium animate-slide-in ${
          ts ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
        }`}>{successMsg}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
            <option value="">Select...</option>
            {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
          </select>
        </div>
        <div>
          <label className={labelClass}>
            Score {selectedCategory && `(${selectedCategory.score_type === 'percentage' ? '0–100' : 'WPM'})`}
          </label>
          <input ref={scoreRef} type="number" value={score} onChange={(e) => setScore(e.target.value)}
            placeholder={selectedCategory?.score_type === 'percentage' ? '0–100' : 'e.g., 12'}
            step={selectedCategory?.score_type === 'percentage' ? '0.1' : '1'} min="0" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Notes</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" className={inputClass} />
        </div>
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className={labelClass}>Other skills</label>
          <input type="text" value={otherSkills} onChange={(e) => setOtherSkills(e.target.value)} placeholder="Optional" className={inputClass} />
        </div>
        <button type="submit" disabled={loading}
          className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 ${
            ts
              ? 'bg-amber-500/90 text-[#0a0a14] hover:bg-amber-400'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
