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
  const { isTaylorSwift } = useTheme();

  const selectedCategory = categories.find((c) => c.id === categoryId);

  // Load last-used category from localStorage
  useEffect(() => {
    const lastCat = localStorage.getItem(LAST_CATEGORY_KEY);
    if (lastCat && categories.some((c) => c.id === lastCat)) {
      setCategoryId(lastCat);
    }
  }, [categories]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const { data: newGrade, error: gradeError } = await supabase
        .from('grades')
        .insert({
          student_id: student.id,
          category_id: categoryId,
          score: normalizedScore,
          notes: notes.trim() || null,
          other_skills: otherSkills.trim() || null,
          graded_at: new Date(date).toISOString(),
        })
        .select('*, category:categories(*)')
        .single();

      if (gradeError) {
        setError(`Failed to save grade: ${gradeError.message}`);
        setLoading(false);
        return;
      }

      // Save last-used category
      localStorage.setItem(LAST_CATEGORY_KEY, categoryId);

      // Reset form but keep category and date
      setScore('');
      setNotes('');
      setOtherSkills('');
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 1200);

      if (isTaylorSwift) {
        setSuccessMsg(getRandomTSMessage());
      } else {
        setSuccessMsg('Grade saved successfully! ✨');
      }

      // Notify parent
      onGradeAdded(newGrade as Grade);

      // Focus score input for rapid entry
      setTimeout(() => scoreRef.current?.focus(), 100);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      <SparkleBurst active={showSparkle} isTaylorSwift={isTaylorSwift} />

      {error && (
        <div className={`p-3 rounded-lg border animate-slide-in ${
          isTaylorSwift
            ? 'bg-red-900/30 border-red-800 text-red-300'
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm ${isTaylorSwift ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
        </div>
      )}

      {successMsg && (
        <div className={`p-3 rounded-lg border animate-slide-in ${
          isTaylorSwift
            ? 'bg-[#d4af37]/20 border-[#d4af37]/40'
            : 'bg-green-50 border-green-200'
        }`}>
          <p className={`text-sm font-medium ${
            isTaylorSwift ? 'text-[#d4af37]' : 'text-green-700'
          }`}>{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="date" className={`block text-xs font-medium mb-1 ${
            isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-700'
          }`}>
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
              isTaylorSwift
                ? 'bg-[#2a1a3e] border-[#4a0e4e] text-[#f0e6d3] focus:ring-[#d4af37]'
                : 'border-gray-300 focus:ring-purple-500'
            }`}
          />
        </div>
        <div>
          <label htmlFor="category" className={`block text-xs font-medium mb-1 ${
            isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-700'
          }`}>
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
              isTaylorSwift
                ? 'bg-[#2a1a3e] border-[#4a0e4e] text-[#f0e6d3] focus:ring-[#d4af37]'
                : 'border-gray-300 focus:ring-purple-500'
            }`}
          >
            <option value="">Select...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {isTaylorSwift ? `⭐ ${cat.name}` : cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="score" className={`block text-xs font-medium mb-1 ${
          isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-700'
        }`}>
          Score {selectedCategory && `(${selectedCategory.score_type === 'percentage' ? '0-100' : 'WPM'})`}
        </label>
        <input
          ref={scoreRef}
          id="score"
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder={selectedCategory?.score_type === 'percentage' ? '0-100' : 'e.g., 12'}
          step={selectedCategory?.score_type === 'percentage' ? '0.1' : '1'}
          min="0"
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
            isTaylorSwift
              ? 'bg-[#2a1a3e] border-[#4a0e4e] text-[#f0e6d3] focus:ring-[#d4af37]'
              : 'border-gray-300 focus:ring-purple-500'
          }`}
        />
      </div>

      <div>
        <label htmlFor="notes" className={`block text-xs font-medium mb-1 ${
          isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-700'
        }`}>
          Notes (optional)
        </label>
        <input
          id="notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., Good progress today"
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
            isTaylorSwift
              ? 'bg-[#2a1a3e] border-[#4a0e4e] text-[#f0e6d3] focus:ring-[#d4af37]'
              : 'border-gray-300 focus:ring-purple-500'
          }`}
        />
      </div>

      <div>
        <label htmlFor="otherSkills" className={`block text-xs font-medium mb-1 ${
          isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-700'
        }`}>
          Other Skills (optional)
        </label>
        <input
          id="otherSkills"
          type="text"
          value={otherSkills}
          onChange={(e) => setOtherSkills(e.target.value)}
          placeholder="e.g., Improved fine motor control"
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
            isTaylorSwift
              ? 'bg-[#2a1a3e] border-[#4a0e4e] text-[#f0e6d3] focus:ring-[#d4af37]'
              : 'border-gray-300 focus:ring-purple-500'
          }`}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm ${
          isTaylorSwift
            ? 'bg-gradient-to-r from-[#d4af37] to-[#f4c2c2] text-[#1a1a2e] hover:from-[#e6c84d] hover:to-[#f8d4d4]'
            : 'bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600'
        }`}
      >
        {loading ? 'Saving...' : isTaylorSwift ? '⭐ Save Grade' : '✨ Save Grade'}
      </button>

      <p className={`text-xs text-center ${isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-400'}`}>
        Tip: Tab through fields, Enter to save
      </p>
    </form>
  );
}
