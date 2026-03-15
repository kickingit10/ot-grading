'use client';

import { Grade, Category } from '@/lib/types';
import { formatScore } from '@/lib/utils';
import { useTheme } from '@/lib/theme';

interface ReportCardSummaryProps {
  grades: Grade[];
  categories: Category[];
  periodName: string;
}

export function ReportCardSummary({
  grades,
  categories,
  periodName,
}: ReportCardSummaryProps) {
  const { isTaylorSwift } = useTheme();

  // Group grades by category
  const gradesByCategory: Record<string, Grade[]> = {};
  grades.forEach((grade) => {
    if (!gradesByCategory[grade.category_id]) {
      gradesByCategory[grade.category_id] = [];
    }
    gradesByCategory[grade.category_id].push(grade);
  });

  // Calculate stats for each category
  const stats = categories.map((category) => {
    const categoryGrades = gradesByCategory[category.id] || [];
    if (categoryGrades.length === 0) {
      return {
        category,
        count: 0,
        average: null,
        notes: [],
      };
    }

    const average =
      categoryGrades.reduce((sum, g) => sum + g.score, 0) / categoryGrades.length;
    const notes = categoryGrades
      .filter((g) => g.notes)
      .map((g) => g.notes as string);

    return {
      category,
      count: categoryGrades.length,
      average,
      notes,
    };
  });

  return (
    <div className="space-y-4">
      {stats.map((stat) => {
        if (stat.count === 0) {
          return (
            <div key={stat.category.id} className={`p-3 rounded-lg border ${
              isTaylorSwift
                ? 'bg-[#2a1a3e]/50 border-[#4a0e4e]'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className={`text-sm font-medium ${
                isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-600'
              }`}>
                {isTaylorSwift ? (
                  <span className="ts-bracelet-tag">{stat.category.name}</span>
                ) : stat.category.name}
              </div>
              <div className={`text-xs mt-1 ${
                isTaylorSwift ? 'text-[#b0a090]/60' : 'text-gray-500'
              }`}>
                {isTaylorSwift ? 'No grades yet — this era awaits ✨' : 'No grades yet'}
              </div>
            </div>
          );
        }

        return (
          <div key={stat.category.id} className={`p-3 rounded-lg border ${
            isTaylorSwift
              ? 'bg-[#2a1a3e] border-[#d4af37]/30'
              : 'bg-purple-50 border-purple-200'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <div className={`text-sm font-medium ${
                isTaylorSwift ? 'text-[#f0e6d3]' : 'text-gray-900'
              }`}>
                {isTaylorSwift ? (
                  <span className="ts-bracelet-tag">{stat.category.name}</span>
                ) : stat.category.name}
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  isTaylorSwift ? 'text-[#d4af37]' : 'text-purple-600'
                }`}>
                  {stat.average !== null ? formatScore(stat.average, stat.category.score_type) : '—'}
                </div>
                <div className={`text-xs ${
                  isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-500'
                }`}>{stat.count} grade{stat.count !== 1 ? 's' : ''}</div>
              </div>
            </div>

            {/* Progress bar for percentage types */}
            {stat.category.score_type === 'percentage' && stat.average !== null && (
              <div className={`w-full rounded-full h-2 mb-2 ${
                isTaylorSwift ? 'bg-[#1a1a2e]' : 'bg-gray-300'
              }`}>
                <div
                  className={`h-2 rounded-full animate-progress-fill ${
                    isTaylorSwift
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#f4c2c2]'
                      : 'bg-gradient-to-r from-purple-500 to-purple-600'
                  }`}
                  style={{ width: `${Math.round(stat.average * 100)}%` }}
                />
              </div>
            )}

            {/* WPM display */}
            {stat.category.score_type === 'raw' && stat.average !== null && (
              <div className={`text-xs ${isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-500'}`}>
                {Math.round(stat.average)} WPM average
              </div>
            )}

            {/* Notes */}
            {stat.notes.length > 0 && (
              <div className={`mt-2 pt-2 border-t ${
                isTaylorSwift ? 'border-[#d4af37]/20' : 'border-purple-200'
              }`}>
                <div className="text-xs space-y-1">
                  {stat.notes.map((note, idx) => (
                    <div key={idx} className={`text-xs italic ${
                      isTaylorSwift ? 'text-[#f4c2c2]' : 'text-gray-600'
                    }`}>
                      {isTaylorSwift ? '⭐' : '📝'} {note}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
