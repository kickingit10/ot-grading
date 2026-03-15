'use client';

import { Grade, Category } from '@/lib/types';
import { formatScore } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { getTrend } from './progress-charts';

interface ReportCardSummaryProps {
  grades: Grade[];
  categories: Category[];
  periodName: string;
}

export function ReportCardSummary({ grades, categories }: ReportCardSummaryProps) {
  const { isTaylorSwift: ts } = useTheme();

  const gradesByCategory: Record<string, Grade[]> = {};
  grades.forEach((grade) => {
    if (!gradesByCategory[grade.category_id]) gradesByCategory[grade.category_id] = [];
    gradesByCategory[grade.category_id].push(grade);
  });

  const stats = categories.map((category) => {
    const categoryGrades = gradesByCategory[category.id] || [];
    if (categoryGrades.length === 0) return { category, count: 0, average: null, notes: [] };
    const average = categoryGrades.reduce((sum, g) => sum + g.score, 0) / categoryGrades.length;
    const notes = categoryGrades.filter((g) => g.notes).map((g) => g.notes as string);
    const trend = getTrend(categoryGrades);
    return { category, count: categoryGrades.length, average, notes, trend };
  });

  return (
    <div className="space-y-3">
      {stats.map((stat) => (
        <div key={stat.category.id} className={`p-3 rounded-lg border ${
          stat.count === 0
            ? ts ? 'border-white/[0.04] bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'
            : ts ? 'border-amber-500/10 bg-amber-500/[0.04]' : 'border-indigo-100 bg-indigo-50/50'
        }`}>
          <div className="flex justify-between items-start mb-1.5">
            <div className={`text-xs font-medium ${
              stat.count === 0
                ? ts ? 'text-[#9ca3af]/50' : 'text-slate-400'
                : ts ? 'text-[#f0e6d3]' : 'text-slate-700'
            }`}>
              {ts && stat.count > 0 ? (
                <span className="ts-bracelet-tag">{stat.category.name}</span>
              ) : stat.category.name}
            </div>
            {stat.count > 0 && (
              <div className="text-right">
                <div className={`text-lg font-semibold tabular-nums ${ts ? 'text-amber-400' : 'text-indigo-600'}`}>
                  {stat.average !== null ? formatScore(stat.average, stat.category.score_type) : '—'}
                </div>
                <div className={`text-[10px] flex items-center gap-1 ${ts ? 'text-[#9ca3af]/60' : 'text-slate-400'}`}>
                  {stat.count} grade{stat.count !== 1 ? 's' : ''}
                  {stat.count >= 3 && (
                    <span className={`font-medium ${
                      stat.trend === '↑' ? 'text-emerald-500' : stat.trend === '↓' ? 'text-red-400' : ''
                    }`}>{stat.trend}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {stat.count === 0 && (
            <div className={`text-[11px] ${ts ? 'text-[#9ca3af]/40' : 'text-slate-400'}`}>No data</div>
          )}

          {stat.category.score_type === 'percentage' && stat.average !== null && (
            <div className={`w-full rounded-full h-1.5 ${ts ? 'bg-white/[0.06]' : 'bg-slate-200'}`}>
              <div className={`h-1.5 rounded-full animate-progress-fill ${
                ts ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-indigo-500'
              }`} style={{ width: `${Math.round(stat.average * 100)}%` }} />
            </div>
          )}

          {stat.category.score_type === 'raw' && stat.average !== null && (
            <div className={`text-[11px] ${ts ? 'text-[#9ca3af]/60' : 'text-slate-400'}`}>
              {Math.round(stat.average)} WPM avg
            </div>
          )}

          {stat.notes.length > 0 && (
            <div className={`mt-2 pt-2 border-t space-y-0.5 ${ts ? 'border-white/[0.06]' : 'border-slate-200/60'}`}>
              {stat.notes.map((note, idx) => (
                <div key={idx} className={`text-[11px] italic ${ts ? 'text-[#f4c2c2]/70' : 'text-slate-500'}`}>
                  {note}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
