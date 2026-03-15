'use client';

import { useState } from 'react';
import { Grade, Category } from '@/lib/types';
import { formatDate, formatScore } from '@/lib/utils';
import { GradeEditModal } from './grade-edit-modal';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/lib/theme';

interface GradesListProps {
  grades: Grade[];
  categories: Category[];
  editingGradeId: string | null;
  onEditStart: (id: string) => void;
  onGradeUpdated: (grade: Grade) => void;
  onGradeDeleted: (id: string) => void;
  studentId: string;
}

export function GradesList({ grades, categories, editingGradeId, onEditStart, onGradeUpdated, onGradeDeleted, studentId }: GradesListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const supabase = createClient();
  const { isTaylorSwift: ts } = useTheme();

  const handleDelete = async (gradeId: string) => {
    if (!confirm('Delete this grade?')) return;
    setDeleting(gradeId);
    try {
      const { error } = await supabase.from('grades').delete().eq('id', gradeId);
      if (error) alert(`Error: ${error.message}`);
      else onGradeDeleted(gradeId);
    } catch { alert('An unexpected error occurred'); }
    finally { setDeleting(null); }
  };

  if (grades.length === 0) {
    return (
      <div className="text-center py-10">
        <svg className={`w-8 h-8 mx-auto mb-2 ${ts ? 'text-[#9ca3af]/30' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className={`text-sm ${ts ? 'text-[#9ca3af]' : 'text-slate-500'}`}>No grades in this period</p>
      </div>
    );
  }

  return (
    <div className={`divide-y ${ts ? 'divide-white/[0.06]' : 'divide-slate-100'}`}>
      {grades.map((grade) => {
        const category = categories.find((c) => c.id === grade.category_id);
        if (editingGradeId === grade.id) {
          return <div key={grade.id} className="py-3"><GradeEditModal grade={grade} category={category} categories={categories} studentId={studentId} onGradeUpdated={onGradeUpdated} onCancel={() => onEditStart('')} /></div>;
        }
        return (
          <div key={grade.id} className={`py-3 flex items-start justify-between gap-3 group`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className={`text-xs ${ts ? 'text-[#9ca3af]/60' : 'text-slate-400'}`}>{formatDate(grade.graded_at)}</span>
                <span className={`text-sm font-medium ${ts ? 'text-[#f0e6d3]' : 'text-slate-700'}`}>{category?.name}</span>
                <span className={`text-sm font-semibold ${ts ? 'text-amber-400' : 'text-indigo-600'}`}>
                  {formatScore(grade.score, category?.score_type || 'raw')}
                </span>
              </div>
              {grade.notes && (
                <p className={`text-xs mt-1 ${ts ? 'text-[#9ca3af]' : 'text-slate-500'}`}>{grade.notes}</p>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button onClick={() => onEditStart(grade.id)}
                className={`px-2 py-1 text-xs rounded transition-colors ${ts ? 'text-amber-400/70 hover:bg-white/[0.06]' : 'text-slate-500 hover:bg-slate-100'}`}>
                Edit
              </button>
              <button onClick={() => handleDelete(grade.id)} disabled={deleting === grade.id}
                className={`px-2 py-1 text-xs rounded transition-colors disabled:opacity-50 ${ts ? 'text-red-400/70 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}>
                {deleting === grade.id ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
