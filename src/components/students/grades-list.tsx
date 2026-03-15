'use client';

import { useState } from 'react';
import { Grade, Category } from '@/lib/types';
import { formatDate, formatScore } from '@/lib/utils';
import { GradeEditModal } from './grade-edit-modal';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/toast';

interface GradesListProps {
  grades: Grade[]; categories: Category[]; editingGradeId: string | null;
  onEditStart: (id: string) => void; onGradeUpdated: (grade: Grade) => void;
  onGradeDeleted: (id: string) => void; studentId: string;
}

export function GradesList({ grades, categories, editingGradeId, onEditStart, onGradeUpdated, onGradeDeleted, studentId }: GradesListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const handleDelete = async (gradeId: string) => {
    if (!confirm('Delete this grade?')) return;
    setDeleting(gradeId);
    try {
      const { error } = await supabase.from('grades').delete().eq('id', gradeId);
      if (error) toast(`Error: ${error.message}`, 'error');
      else { onGradeDeleted(gradeId); toast('Grade deleted'); }
    } catch { toast('An unexpected error occurred', 'error'); }
    finally { setDeleting(null); }
  };

  if (grades.length === 0) {
    return (
      <div className="text-center py-10">
        <svg className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-border)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No grades in this period</p>
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
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{category?.name}</span>
                <span className="text-base font-bold" style={{ color: 'var(--color-primary)' }}>{formatScore(grade.score, category?.score_type || 'raw')}</span>
              </div>
              {grade.notes && <p className="text-xs mt-1 italic" style={{ color: 'var(--color-text-muted)' }}>{grade.notes}</p>}
            </div>
            <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150 shrink-0">
              <button onClick={() => onEditStart(grade.id)} className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--color-text-muted)' }} title="Edit">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <button onClick={() => handleDelete(grade.id)} disabled={deleting === grade.id} className="p-1.5 rounded-md transition-colors disabled:opacity-50" style={{ color: 'var(--color-error)' }} title="Delete">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
