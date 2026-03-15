'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Grade, Category } from '@/lib/types';
import { normalizeScore, formatDateInputValue } from '@/lib/utils';
import { useTheme } from '@/lib/theme';

interface GradeEditModalProps {
  grade: Grade;
  category: Category | undefined;
  categories: Category[];
  studentId: string;
  onGradeUpdated: (grade: Grade) => void;
  onCancel: () => void;
}

export function GradeEditModal({
  grade,
  category,
  categories,
  studentId,
  onGradeUpdated,
  onCancel,
}: GradeEditModalProps) {
  const [date, setDate] = useState(formatDateInputValue(grade.graded_at));
  const [categoryId, setCategoryId] = useState(grade.category_id);
  const [score, setScore] = useState(
    category?.score_type === 'percentage' ? Math.round(grade.score * 100).toString() : grade.score.toString()
  );
  const [notes, setNotes] = useState(grade.notes || '');
  const [otherSkills, setOtherSkills] = useState(grade.other_skills || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { isTaylorSwift } = useTheme();

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleSave = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!categoryId || !score.trim()) {
        setError('Please select a category and enter a score');
        setLoading(false);
        return;
      }

      const scoreNum = parseFloat(score);
      if (isNaN(scoreNum)) {
        setError('Please enter a valid score');
        setLoading(false);
        return;
      }

      const normalizedScore = normalizeScore(scoreNum, selectedCategory!.score_type);

      const { data: updatedGrade, error: gradeError } = await supabase
        .from('grades')
        .update({
          category_id: categoryId,
          score: normalizedScore,
          notes: notes.trim() || null,
          other_skills: otherSkills.trim() || null,
          graded_at: new Date(date).toISOString(),
        })
        .eq('id', grade.id)
        .select('*, category:categories(*)')
        .single();

      if (gradeError) {
        setError(`Failed to update grade: ${gradeError.message}`);
        setLoading(false);
        return;
      }

      // Record edit in grade_edits table
      await supabase.from('grade_edits').insert({
        grade_id: grade.id,
        previous_score: grade.score,
        previous_notes: grade.notes,
        previous_other_skills: grade.other_skills,
        previous_graded_at: grade.graded_at,
      });

      onGradeUpdated(updatedGrade as Grade);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = isTaylorSwift
    ? 'w-full px-3 py-2 border rounded-lg text-sm bg-[#2a1a3e] border-[#4a0e4e] text-[#f0e6d3] focus:outline-none focus:ring-2 focus:ring-[#d4af37]'
    : 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500';

  const labelClass = `block text-xs font-medium mb-1 ${
    isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-700'
  }`;

  return (
    <div className={`p-4 rounded-lg border-2 space-y-4 ${
      isTaylorSwift
        ? 'bg-[#1a1a2e] border-[#d4af37]'
        : 'bg-white border-purple-400'
    }`}>
      <h3 className={`font-bold ${isTaylorSwift ? 'text-[#d4af37]' : 'text-gray-900'}`}>
        Edit Grade
      </h3>

      {error && (
        <div className={`p-3 rounded-lg border ${
          isTaylorSwift
            ? 'bg-red-900/30 border-red-800'
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm ${isTaylorSwift ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`edit-date-${grade.id}`} className={labelClass}>Date</label>
          <input
            id={`edit-date-${grade.id}`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`edit-category-${grade.id}`} className={labelClass}>Category</label>
          <select
            id={`edit-category-${grade.id}`}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor={`edit-score-${grade.id}`} className={labelClass}>
          Score {selectedCategory && `(${selectedCategory.score_type === 'percentage' ? '0-100' : 'WPM'})`}
        </label>
        <input
          id={`edit-score-${grade.id}`}
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          min="0"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={`edit-notes-${grade.id}`} className={labelClass}>Notes</label>
        <input
          id={`edit-notes-${grade.id}`}
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={`edit-skills-${grade.id}`} className={labelClass}>Other Skills</label>
        <input
          id={`edit-skills-${grade.id}`}
          type="text"
          value={otherSkills}
          onChange={(e) => setOtherSkills(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className={`flex-1 py-2 px-3 font-semibold rounded-lg disabled:opacity-50 text-sm ${
            isTaylorSwift
              ? 'bg-[#d4af37] text-[#1a1a2e] hover:bg-[#e6c84d]'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {loading ? 'Saving...' : isTaylorSwift ? '⭐ Save' : '✨ Save'}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className={`flex-1 py-2 px-3 font-semibold rounded-lg text-sm ${
            isTaylorSwift
              ? 'bg-[#2a1a3e] text-[#f0e6d3] hover:bg-[#3a2a4e]'
              : 'bg-gray-300 text-gray-900 hover:bg-gray-400'
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
