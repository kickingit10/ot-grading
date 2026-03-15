'use client';

import { Grade, Category } from '@/lib/types';
import { formatDate, formatScore } from '@/lib/utils';

interface ProgressChartsProps { grades: Grade[]; categories: Category[]; }

function SparklineSVG({ points, height = 48, width = 200 }: { points: number[]; height?: number; width?: number }) {
  if (points.length < 2) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const coords = points.map((v, i) => ({ x: pad + (i / (points.length - 1)) * w, y: pad + h - ((v - min) / range) * h }));
  const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ');
  const areaD = `${pathD} L${coords[coords.length - 1].x},${height - pad} L${coords[0].x},${height - pad} Z`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <path d={areaD} fill="var(--color-primary)" opacity={0.1} />
      <path d={pathD} fill="none" stroke="var(--color-primary)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r={2.5} fill="var(--color-primary)" />
    </svg>
  );
}

export function getTrend(grades: Grade[]): '↑' | '↓' | '→' {
  if (grades.length < 3) return '→';
  const sorted = [...grades].sort((a, b) => new Date(a.graded_at).getTime() - new Date(b.graded_at).getTime());
  const mid = Math.floor(sorted.length / 2);
  const avg = (arr: Grade[]) => arr.reduce((s, g) => s + g.score, 0) / arr.length;
  const diff = avg(sorted.slice(mid)) - avg(sorted.slice(0, mid));
  if (diff > 0.03) return '↑';
  if (diff < -0.03) return '↓';
  return '→';
}

export function ProgressCharts({ grades, categories }: ProgressChartsProps) {
  const gradesByCategory: Record<string, Grade[]> = {};
  grades.forEach(g => { if (!gradesByCategory[g.category_id]) gradesByCategory[g.category_id] = []; gradesByCategory[g.category_id].push(g); });

  const charted = categories
    .filter(c => (gradesByCategory[c.id]?.length || 0) >= 2)
    .map(cat => {
      const cg = [...gradesByCategory[cat.id]].sort((a, b) => new Date(a.graded_at).getTime() - new Date(b.graded_at).getTime());
      const points = cg.map(g => cat.score_type === 'percentage' ? g.score * 100 : g.score);
      return { cat, cg, points, trend: getTrend(cg) };
    });

  if (charted.length === 0) {
    return <div className="text-center py-8"><p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Need at least 2 grades in a category to show progress</p></div>;
  }

  return (
    <div className="space-y-5">
      {charted.map(({ cat, cg, points, trend }) => (
        <div key={cat.id} className="p-4 rounded-lg" style={{ border: '1px solid var(--color-border)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{cat.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{formatScore(cg[cg.length - 1].score, cat.score_type)}</span>
              <span className="text-xs font-medium" style={{ color: trend === '↑' ? 'var(--color-success)' : trend === '↓' ? 'var(--color-error)' : 'var(--color-text-muted)' }}>{trend}</span>
            </div>
          </div>
          <SparklineSVG points={points} />
          <div className="flex justify-between mt-1">
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{formatDate(cg[0].graded_at)}</span>
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{formatDate(cg[cg.length - 1].graded_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
