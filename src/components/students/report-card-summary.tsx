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
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
      {withData.map(stat => (
        <div key={stat.category.id} className="p-4 rounded-lg" style={{ background: 'var(--color-bg-accent)', border: '1px solid var(--color-border)' }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ marginBottom: 6 }}>
              {ts ? (
                <span className="ts-bracelet-tag" style={{ display: 'inline-block', fontSize: 12, padding: '4px 12px', lineHeight: 1.4, whiteSpace: 'normal' as const, wordBreak: 'break-word' as const }}>{stat.category.name}</span>
              ) : (
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>{stat.category.name}</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums' }}>
                {stat.average !== null ? formatScore(stat.average, stat.category.score_type) : '—'}
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                {stat.count} grade{stat.count !== 1 ? 's' : ''}
                {stat.count >= 3 && (
                  <span style={{ marginLeft: 4, color: stat.trend === '↑' ? 'var(--color-success)' : stat.trend === '↓' ? 'var(--color-error)' : 'var(--color-text-muted)', fontWeight: 500 }}>{stat.trend}</span>
                )}
              </span>
            </div>
          </div>

          {stat.category.score_type === 'percentage' && stat.average !== null && (
            <div className="w-full rounded-full" style={{ height: 6, background: 'var(--color-border)' }}>
              <div className="rounded-full animate-progress-fill" style={{ height: 6, width: `${Math.round(stat.average * 100)}%`, background: 'var(--color-primary)' }} />
            </div>
          )}
          {stat.category.score_type === 'raw' && stat.average !== null && (
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{Math.round(stat.average)} WPM avg</div>
          )}
          {stat.notes && (
            <p style={{ fontSize: 13, fontStyle: 'italic', marginTop: 8, paddingTop: 8, color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)' }}>{stat.notes}</p>
          )}
        </div>
      ))}

      {noData.length > 0 && (
        <div className="pt-1">
          {noData.map(s => (
            <div key={s.category.id} className="flex items-center gap-2 py-1">
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{s.category.name}</span>
              <span style={{ fontSize: 12, color: 'var(--color-border)' }}>—</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>No data</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
