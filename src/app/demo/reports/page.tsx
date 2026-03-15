'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatDate, formatScore, formatDateInputValue, isDateInRange } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { DEMO_STUDENTS, DEMO_CATEGORIES, generateDemoGrades } from '../mock-data';

export default function DemoReportsPage() {
  const [startDate, setStartDate] = useState('2025-08-01');
  const [endDate, setEndDate] = useState(formatDateInputValue(new Date().toISOString()));
  const { isTaylorSwift: ts } = useTheme();

  const allGrades = useMemo(() => generateDemoGrades(), []);

  const filteredGrades = allGrades.filter(g => isDateInRange(g.graded_at, startDate, endDate));

  const studentData = DEMO_STUDENTS.map(student => {
    const studentGrades = filteredGrades.filter(g => g.student_id === student.id);
    const categoryAvgs: Record<string, { avg: number; count: number } | null> = {};
    for (const cat of DEMO_CATEGORIES) {
      const cg = studentGrades.filter(g => g.category_id === cat.id);
      categoryAvgs[cat.id] = cg.length === 0 ? null : { avg: cg.reduce((s, g) => s + g.score, 0) / cg.length, count: cg.length };
    }
    return { student, categoryAvgs, totalGrades: studentGrades.length };
  });

  const handlePrint = () => {
    const headerCells = DEMO_CATEGORIES.map(c => `<th>${c.name}</th>`).join('');
    const rows = studentData.map(({ student, categoryAvgs }) => {
      const cells = DEMO_CATEGORIES.map(c => {
        const d = categoryAvgs[c.id];
        return d ? `<td>${formatScore(d.avg, c.score_type)}</td>` : '<td>—</td>';
      }).join('');
      return `<tr><td>${student.first_name} ${student.last_name}</td><td>${student.school?.name}</td>${cells}</tr>`;
    }).join('');
    const html = `<!DOCTYPE html><html><head><title>Demo Report Cards</title><style>body{font-family:Inter,system-ui;padding:40px;max-width:1100px;margin:0 auto}h1{font-size:22px;font-weight:600}p{color:#64748b;font-size:13px}table{width:100%;border-collapse:collapse;margin-top:20px;font-size:12px}th,td{text-align:left;padding:6px 10px;border-bottom:1px solid #e2e8f0}th{font-weight:600;text-transform:uppercase;font-size:10px}</style></head><body><h1>Report Cards (Demo)</h1><p>${formatDate(startDate)} – ${formatDate(endDate)} · ${DEMO_STUDENTS.length} students</p><table><thead><tr><th>Student</th><th>School</th>${headerCells}</tr></thead><tbody>${rows}</tbody></table><p style="margin-top:24px;font-size:11px;color:#94a3b8">Demo report · ${new Date().toLocaleDateString()}</p></body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/demo" className="back-link">
            <svg className="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 8, color: 'var(--color-text)' }}>
            {ts ? 'Report Cards (The Collection)' : 'Report Cards'}
          </h1>
          <p style={{ fontSize: 15, marginTop: 4, color: 'var(--color-text-muted)' }}>
            {DEMO_STUDENTS.length} students · {filteredGrades.length} grades in range
          </p>
        </div>

        {/* Date range */}
        <div className="card" style={{ marginBottom: 24 }}>
          <label className="label">Date Range</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' as const }}>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input" style={{ maxWidth: 200, flex: 'none' }} />
            <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>to</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input" style={{ maxWidth: 200, flex: 'none' }} />
            <button onClick={handlePrint} className="btn-primary" style={{ marginLeft: 'auto', fontSize: 14, padding: '6px 14px', minHeight: 36 }}>Print All</button>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' as const, fontSize: 13, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', paddingBottom: 12, paddingRight: 12, color: 'var(--color-text-muted)' }}>Student</th>
                  <th style={{ textAlign: 'left' as const, fontSize: 13, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', paddingBottom: 12, paddingRight: 12, color: 'var(--color-text-muted)' }}>School</th>
                  {DEMO_CATEGORIES.map(c => (
                    <th key={c.id} style={{ textAlign: 'center' as const, fontSize: 13, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', paddingBottom: 12, padding: '0 8px 12px', whiteSpace: 'nowrap' as const, color: 'var(--color-text-muted)' }}>
                      {c.name.replace('Writing - ', '').replace('Cutting - ', 'Cut ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {studentData.map(({ student, categoryAvgs }, idx) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid var(--color-border)', background: idx % 2 === 1 ? 'var(--color-bg-accent)' : 'transparent' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <Link href={`/demo/${student.id}`} style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)', textDecoration: 'none' }}>
                        {student.first_name} {student.last_name}
                      </Link>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--color-text-muted)' }}>{student.school?.name}</td>
                    {DEMO_CATEGORIES.map(c => {
                      const d = categoryAvgs[c.id];
                      return (
                        <td key={c.id} style={{ padding: '10px 12px', fontSize: 15, fontVariantNumeric: 'tabular-nums', textAlign: 'center' as const, color: d ? 'var(--color-text)' : 'var(--color-border)' }}>
                          {d ? formatScore(d.avg, c.score_type) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
          {studentData.map(({ student, categoryAvgs, totalGrades }) => (
            <div key={student.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <Link href={`/demo/${student.id}`} style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)', textDecoration: 'none' }}>
                    {student.first_name} {student.last_name}
                  </Link>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{student.school?.name}</p>
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{totalGrades} grades</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                {DEMO_CATEGORIES.map(c => {
                  const d = categoryAvgs[c.id];
                  return (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>{c.name.replace('Writing - ', '').replace('Cutting - ', 'Cut ')}</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500, color: d ? 'var(--color-text)' : 'var(--color-border)' }}>
                        {d ? formatScore(d.avg, c.score_type) : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', paddingTop: 32, fontSize: 13, color: 'var(--color-text-muted)' }}>
          Demo data — <Link href="/signup" style={{ fontWeight: 500, color: 'var(--color-primary)' }}>Sign up</Link> to track your own students
        </div>
      </div>
    </div>
  );
}
