'use client';

import { Grade, Category } from '@/lib/types';
import { formatScore } from '@/lib/utils';
import { getTrend } from './progress-charts';
import { useTheme } from '@/lib/theme';

interface ReportCardSummaryProps { grades: Grade[]; categories: Category[]; periodName: string; }

export function ReportCardSummary({ grades, categories }: ReportCardSummaryProps) {
  const { isTaylorSwift: ts } = useTheme();

  const gradesByCategory: Record<string, Grade[]> = {};
  grades.forEach(g => { if (!gradesByCategory[g.category_id]) gradesByCategory[g.category_id] = []; gradesByCategory[g.category_id].push(g); });

  const stats = categories.map(category => {
    const cg = gradesByCategory[category.id] || [];
    if (cg.length === 0) return { category, count: 0, average: null, notes: '', trend: '→' as const };
    const average = cg.reduce((s, g) => s + g.score, 0) / cg.length;
    const notes = cg.filter(g => g.notes).map(g => g.notes).join('; ');
    return { category, count: cg.length, average, notes, trend: getTrend(cg) };
  });

  const withData = stats.filter(s => s.count > 0);
  const noData = stats.filter(s => s.count === 0);

  return (
    <div className="space-y-3">
      {withData.map(stat => (
        <div key={stat.category.id} className="p-4 rounded-lg" style={{ background: 'var(--color-bg-accent)', border: '1px solid var(--color-border)' }}>
          <div className="flex justify-between items-start mb-1.5">
            <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
              {ts ? <span className="ts-bracelet-tag">{stat.category.name}</span> : stat.category.name}
            </span>
            <div className="text-right">
              <div className="text-lg font-semibold tabular-nums" style={{ color: 'var(--color-primary)' }}>
                {stat.average !== null ? formatScore(stat.average, stat.category.score_type) : '—'}
              </div>
              <div className="text-[10px] flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                {stat.count} grade{stat.count !== 1 ? 's' : ''}
                {stat.count >= 3 && (
                  <span style={{ color: stat.trend === '↑' ? 'var(--color-success)' : stat.trend === '↓' ? 'var(--color-error)' : 'var(--color-text-muted)' }} className="font-medium">{stat.trend}</span>
                )}
              </div>
            </div>
          </div>

          {stat.category.score_type === 'percentage' && stat.average !== null && (
            <div className="w-full rounded-full" style={{ height: 6, background: 'var(--color-border)' }}>
              <div className="rounded-full animate-progress-fill" style={{ height: 6, width: `${Math.round(stat.average * 100)}%`, background: 'var(--color-primary)' }} />
            </div>
          )}
          {stat.category.score_type === 'raw' && stat.average !== null && (
            <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{Math.round(stat.average)} WPM avg</div>
          )}
          {stat.notes && (
            <p className="text-[11px] italic mt-2 pt-2" style={{ color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)' }}>{stat.notes}</p>
          )}
        </div>
      ))}

      {noData.length > 0 && (
        <div className="pt-1">
          {noData.map(s => (
            <div key={s.category.id} className="flex items-center gap-2 py-1">
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.category.name}</span>
              <span className="text-[10px]" style={{ color: 'var(--color-border)' }}>—</span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>No data</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
