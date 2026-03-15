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

export function GradesList({
  grades,
  categories,
  editingGradeId,
  onEditStart,
  onGradeUpdated,
  onGradeDeleted,
  studentId,
}: GradesListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const supabase = createClient();
  const { isTaylorSwift } = useTheme();

  const handleDelete = async (gradeId: string) => {
    if (!confirm('Are you sure you want to delete this grade?')) {
      return;
    }

    setDeleting(gradeId);
    try {
      const { error } = await supabase.from('grades').delete().eq('id', gradeId);
      if (error) {
        alert(`Error deleting grade: ${error.message}`);
      } else {
        onGradeDeleted(gradeId);
      }
    } catch {
      alert('An unexpected error occurred');
    } finally {
      setDeleting(null);
    }
  };

  if (grades.length === 0) {
    return (
      <div className="text-center py-8">
        <p className={isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-600'}>
          {isTaylorSwift
            ? "No grades in this era yet — let's write the story! ✨"
            : 'No grades entered yet for this period.'
          }
        </p>
        <p className={`text-sm mt-2 ${isTaylorSwift ? 'text-[#b0a090]/60' : 'text-gray-500'}`}>
          Use the form above to enter the first grade.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {grades.map((grade) => {
        const category = categories.find((c) => c.id === grade.category_id);
        const isEditing = editingGradeId === grade.id;

        return (
          <div key={grade.id}>
            {isEditing ? (
              <GradeEditModal
                grade={grade}
                category={category}
                categories={categories}
                studentId={studentId}
                onGradeUpdated={onGradeUpdated}
                onCancel={() => onEditStart('')}
              />
            ) : (
              <div className={`p-4 rounded-lg border transition-all ${
                isTaylorSwift
                  ? 'bg-[#2a1a3e]/50 border-[#2e2e4a] hover:border-[#d4af37]/30 hover:bg-[#2a1a3e]'
                  : 'bg-gray-50 border-gray-200 hover:border-purple-200 hover:bg-purple-50'
              }`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className={`text-sm font-medium ${
                        isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-600'
                      }`}>
                        {formatDate(grade.graded_at)}
                      </span>
                      <span className={`font-semibold ${
                        isTaylorSwift ? 'text-[#f0e6d3]' : 'text-gray-900'
                      }`}>{category?.name}</span>
                      <span className={`text-lg font-bold ${
                        isTaylorSwift ? 'text-[#d4af37]' : 'text-purple-600'
                      }`}>
                        {formatScore(grade.score, category?.score_type || 'raw')}
                      </span>
                    </div>
                    {grade.notes && (
                      <p className={`text-sm mt-2 ${
                        isTaylorSwift ? 'text-[#f4c2c2]' : 'text-gray-600'
                      }`}>
                        {isTaylorSwift ? '⭐' : '📝'} <em>{grade.notes}</em>
                      </p>
                    )}
                    {grade.other_skills && (
                      <p className={`text-sm mt-1 ${
                        isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-600'
                      }`}>
                        ⭐ <em>{grade.other_skills}</em>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditStart(grade.id)}
                      className={`px-3 py-1 text-sm rounded-lg transition-all ${
                        isTaylorSwift
                          ? 'text-[#d4af37] hover:bg-[#d4af37]/10'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(grade.id)}
                      disabled={deleting === grade.id}
                      className={`px-3 py-1 text-sm rounded-lg transition-all disabled:opacity-50 ${
                        isTaylorSwift
                          ? 'text-red-400 hover:bg-red-900/20'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      {deleting === grade.id ? '...' : '🗑️ Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
