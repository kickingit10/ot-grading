'use client';

import { Grade, Category } from '@/lib/types';
import { formatDate, formatScore } from '@/lib/utils';
import { useTheme } from '@/lib/theme';

interface ProgressChartsProps { grades: Grade[]; categories: Category[]; }

function SparklineSVG({ points, color, height = 48, width = 200 }: { points: number[]; color: string; height?: number; width?: number }) {
  if (points.length < 2) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const coords = points.map((v, i) => ({
    x: pad + (i / (points.length - 1)) * w,
    y: pad + h - ((v - min) / range) * h,
  }));

  const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ');
  const areaD = `${pathD} L${coords[coords.length - 1].x},${height - pad} L${coords[0].x},${height - pad} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <path d={areaD} fill={color} opacity={0.1} />
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {coords.length > 0 && (
        <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r={2.5} fill={color} />
      )}
    </svg>
  );
}

export function getTrend(grades: Grade[]): '↑' | '↓' | '→' {
  if (grades.length < 3) return '→';
  const sorted = [...grades].sort((a, b) => new Date(a.graded_at).getTime() - new Date(b.graded_at).getTime());
  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid);
  const secondHalf = sorted.slice(mid);
  const avg = (arr: Grade[]) => arr.reduce((s, g) => s + g.score, 0) / arr.length;
  const diff = avg(secondHalf) - avg(firstHalf);
  if (diff > 0.03) return '↑';
  if (diff < -0.03) return '↓';
  return '→';
}

export function ProgressCharts({ grades, categories }: ProgressChartsProps) {
  const { isTaylorSwift: ts } = useTheme();

  const gradesByCategory: Record<string, Grade[]> = {};
  grades.forEach((g) => {
    if (!gradesByCategory[g.category_id]) gradesByCategory[g.category_id] = [];
    gradesByCategory[g.category_id].push(g);
  });

  const charted = categories
    .filter((c) => (gradesByCategory[c.id]?.length || 0) >= 2)
    .map((cat) => {
      const catGrades = [...gradesByCategory[cat.id]].sort((a, b) => new Date(a.graded_at).getTime() - new Date(b.graded_at).getTime());
      const points = catGrades.map((g) => cat.score_type === 'percentage' ? g.score * 100 : g.score);
      const trend = getTrend(catGrades);
      return { cat, catGrades, points, trend };
    });

  if (charted.length === 0) {
    return (
      <div className="text-center py-8">
        <p className={`text-sm ${ts ? 'text-[#9ca3af]' : 'text-slate-500'}`}>Need at least 2 grades in a category to show progress</p>
      </div>
    );
  }

  const color = ts ? '#d4af37' : '#6366f1';

  return (
    <div className="space-y-5">
      {charted.map(({ cat, catGrades, points, trend }) => (
        <div key={cat.id} className={`p-4 rounded-lg border ${ts ? 'border-white/[0.06]' : 'border-slate-100'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-xs font-medium ${ts ? 'text-[#f0e6d3]' : 'text-slate-700'}`}>{cat.name}</span>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] ${ts ? 'text-[#9ca3af]' : 'text-slate-400'}`}>
                {formatScore(catGrades[catGrades.length - 1].score, cat.score_type)}
              </span>
              <span className={`text-xs font-medium ${
                trend === '↑' ? 'text-emerald-500' : trend === '↓' ? 'text-red-400' : ts ? 'text-[#9ca3af]' : 'text-slate-400'
              }`}>{trend}</span>
            </div>
          </div>
          <SparklineSVG points={points} color={color} />
          <div className="flex justify-between mt-1">
            <span className={`text-[10px] ${ts ? 'text-[#9ca3af]/50' : 'text-slate-300'}`}>{formatDate(catGrades[0].graded_at)}</span>
            <span className={`text-[10px] ${ts ? 'text-[#9ca3af]/50' : 'text-slate-300'}`}>{formatDate(catGrades[catGrades.length - 1].graded_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
