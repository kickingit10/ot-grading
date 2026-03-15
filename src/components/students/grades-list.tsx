'use client';

import { useState, useRef } from 'react';
import { Grade, Category } from '@/lib/types';
import { formatDate, formatScore } from '@/lib/utils';
import { GradeEditModal } from './grade-edit-modal';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/toast';
import { useTheme } from '@/lib/theme';

interface GradesListProps {
  grades: Grade[]; categories: Category[]; editingGradeId: string | null;
  onEditStart: (id: string) => void; onGradeUpdated: (grade: Grade) => void;
  onGradeDeleted: (id: string) => void; studentId: string;
}

export function GradesList({ grades, categories, editingGradeId, onEditStart, onGradeUpdated, onGradeDeleted, studentId }: GradesListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const { toast } = useToast();
  const { isTaylorSwift: ts } = useTheme();

  const handleDelete = async (gradeId: string) => {
    setDeleting(gradeId);
    try {
      const { error } = await supabase.from('grades').delete().eq('id', gradeId);
      if (error) toast(`Error: ${error.message}`, 'error');
      else { onGradeDeleted(gradeId); toast('Grade deleted'); }
    } catch { toast('An unexpected error occurred', 'error'); }
    finally { setDeleting(null); }
  };

  const TS_EMPTY_MESSAGES = [
    "No grades yet for this era... time to shake it off and start grading! ✨",
    "This is a blank space, baby... write a grade! 📝",
    "The grades are all too well... absent. Let's fix that! 🎵",
    "It's a Cruel Summer without any grades... 🌙",
    "We're in our no-grades era. Begin again? 🦋",
  ];

  if (grades.length === 0) {
    const emptyMsg = ts ? TS_EMPTY_MESSAGES[new Date().getMinutes() % TS_EMPTY_MESSAGES.length] : "No grades recorded for this date range. Enter one above to get started.";
    return (
      <div className="text-center py-10">
        {ts ? (
          <svg className="w-10 h-10 mx-auto mb-3" aria-hidden="true" style={{ color: 'var(--color-primary)', opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        ) : (
          <svg className="w-10 h-10 mx-auto mb-3" aria-hidden="true" style={{ color: 'var(--color-primary)', opacity: 0.2 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{emptyMsg}</p>
      </div>
    );
  }

  return (
    <div>
      {grades.map((grade) => {
        const category = categories.find((c) => c.id === grade.category_id);
        if (editingGradeId === grade.id) {
          return <div key={grade.id} className="py-2"><GradeEditModal grade={grade} category={category} categories={categories} studentId={studentId} onGradeUpdated={onGradeUpdated} onCancel={() => onEditStart('')} /></div>;
        }
        return (
          <div key={grade.id} className="hover-row group flex items-start justify-between gap-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: 'var(--color-bg-accent)', color: 'var(--color-text-muted)' }}>{formatDate(grade.graded_at)}</span>
                {new Date(grade.graded_at).toDateString() === new Date().toDateString() && (
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-success)' }}>New</span>
                )}
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{category?.name}</span>
                <span className="text-base font-bold" style={{ color: 'var(--color-primary)' }}>{formatScore(grade.score, category?.score_type || 'raw')}</span>
              </div>
              {grade.notes && <p className="text-xs mt-1 italic" style={{ color: 'var(--color-text-muted)' }}>{grade.notes}</p>}
            </div>
            {confirmingDelete === grade.id ? (
              <div className="flex gap-1 items-center shrink-0">
                <button onClick={() => { handleDelete(grade.id); setConfirmingDelete(null); }}
                  className="text-xs font-medium px-2 py-1 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)' }}>Delete</button>
                <button onClick={() => setConfirmingDelete(null)}
                  className="text-xs px-2 py-1 rounded" style={{ color: 'var(--color-text-muted)' }}>Cancel</button>
              </div>
            ) : (
              <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                <button onClick={() => onEditStart(grade.id)} className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--color-text-muted)' }} aria-label="Edit grade" title="Edit">
                  <svg className="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button onClick={() => setConfirmingDelete(grade.id)} disabled={deleting === grade.id} className="p-1.5 rounded-md transition-colors disabled:opacity-50" style={{ color: 'var(--color-error)' }} aria-label="Delete grade" title="Delete">
                  <svg className="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
