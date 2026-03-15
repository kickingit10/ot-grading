'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StudentWithSchool, Category, Grade } from '@/lib/types';
import { normalizeScore, formatDateInputValue } from '@/lib/utils';
import { useTheme, getRandomTSMessage } from '@/lib/theme';
import { useToast } from '@/lib/toast';

interface BulkGradeFormProps {
  student: StudentWithSchool;
  categories: Category[];
  onGradesAdded: (grades: Grade[]) => void;
}

interface RowData {
  categoryId: string;
  categoryName: string;
  scoreType: 'percentage' | 'raw';
  score: string;
  notes: string;
}

export function BulkGradeForm({ student, categories, onGradesAdded }: BulkGradeFormProps) {
  const [date, setDate] = useState(formatDateInputValue(new Date().toISOString()));
  const [rows, setRows] = useState<RowData[]>(() =>
    categories.map(c => ({ categoryId: c.id, categoryName: c.name, scoreType: c.score_type, score: '', notes: '' }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const { isTaylorSwift: ts } = useTheme();
  const { toast } = useToast();
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Cmd+Shift+Enter to save
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('bulk-save-btn')?.click();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const updateRow = (idx: number, field: 'score' | 'notes', value: string) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const filledRows = rows.filter(r => r.score.trim() !== '');
    if (filledRows.length === 0) { setError('Enter at least one score'); return; }

    // Validate all filled scores
    for (const row of filledRows) {
      const num = parseFloat(row.score);
      if (isNaN(num)) { setError(`Invalid score for ${row.categoryName}`); return; }
    }

    setLoading(true);
    try {
      const gradeObjects = filledRows.map(row => ({
        student_id: student.id,
        category_id: row.categoryId,
        score: normalizeScore(parseFloat(row.score), row.scoreType),
        notes: row.notes.trim() || null,
        other_skills: null,
        graded_at: new Date(date).toISOString(),
      }));

      const { data: newGrades, error: insertError } = await supabase
        .from('grades')
        .insert(gradeObjects)
        .select('*, category:categories(*)');

      if (insertError) { setError(insertError.message); setLoading(false); return; }

      toast(ts ? `${filledRows.length} tracks dropped! 🎤` : `${filledRows.length} grades saved`);
      onGradesAdded((newGrades || []) as Grade[]);

      // Clear scores and notes but keep date
      setRows(prev => prev.map(r => ({ ...r, score: '', notes: '' })));
      setTimeout(() => firstInputRef.current?.focus(), 100);
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  const filledCount = rows.filter(r => r.score.trim() !== '').length;

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error mb-4 text-sm animate-slide-in">{error}</div>}

      {/* Shared date picker */}
      <div className="mb-4">
        <label className="label" htmlFor="bulk-date">Date (all grades)</label>
        <input id="bulk-date" type="date" value={date} onChange={e => setDate(e.target.value)} className="input" style={{ maxWidth: 200 }} />
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className="text-left text-xs font-medium pb-2" style={{ color: 'var(--color-text-muted)', width: '40%' }}>Category</th>
              <th className="text-left text-xs font-medium pb-2" style={{ color: 'var(--color-text-muted)', width: '25%' }}>Score</th>
              <th className="text-left text-xs font-medium pb-2" style={{ color: 'var(--color-text-muted)', width: '35%' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.categoryId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="py-2 pr-3">
                  <span className="text-sm" style={{ color: 'var(--color-text)' }}>{row.categoryName}</span>
                  <span className="text-[10px] ml-1.5" style={{ color: 'var(--color-text-muted)' }}>
                    ({row.scoreType === 'percentage' ? '0–100' : 'WPM'})
                  </span>
                </td>
                <td className="py-2 pr-3">
                  <input
                    ref={idx === 0 ? firstInputRef : undefined}
                    type="number"
                    value={row.score}
                    onChange={e => updateRow(idx, 'score', e.target.value)}
                    placeholder={row.scoreType === 'percentage' ? '0–100' : 'WPM'}
                    step={row.scoreType === 'percentage' ? '0.1' : '1'}
                    min="0"
                    className="input"
                    style={{ padding: '6px 10px', fontSize: 13 }}
                  />
                </td>
                <td className="py-2">
                  <textarea
                    rows={1}
                    value={row.notes}
                    onChange={e => updateRow(idx, 'notes', e.target.value)}
                    placeholder="Optional"
                    className="input"
                    style={{ padding: '6px 10px', fontSize: 13, resize: 'vertical' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {filledCount} of {rows.length} categories filled
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>⌘+Shift+Enter</span>
          <button id="bulk-save-btn" type="submit" disabled={loading || filledCount === 0} className="btn-primary whitespace-nowrap">
            {loading ? (ts ? 'Recording...' : 'Saving...') : (ts ? `Drop ${filledCount} tracks 🎤` : `Save ${filledCount} grades`)}
          </button>
        </div>
      </div>
    </form>
  );
}
