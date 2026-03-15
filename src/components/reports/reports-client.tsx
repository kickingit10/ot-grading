'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StudentWithSchool, Category } from '@/lib/types';
import { formatDate, formatScore, formatDateInputValue } from '@/lib/utils';
import { useTheme } from '@/lib/theme';

interface GradeRow { student_id: string; category_id: string; score: number; graded_at: string; }

interface ReportsClientProps {
  students: StudentWithSchool[];
  categories: Category[];
  allGrades: GradeRow[];
}

function getSchoolYearStart(): string {
  const now = new Date();
  const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-08-01`;
}

export function ReportsClient({ students, categories, allGrades }: ReportsClientProps) {
  const [startDate, setStartDate] = useState(getSchoolYearStart());
  const [endDate, setEndDate] = useState(formatDateInputValue(new Date().toISOString()));
  const { isTaylorSwift: ts } = useTheme();

  // Filter grades by date range
  const filteredGrades = allGrades.filter(g => {
    const d = new Date(g.graded_at);
    return d >= new Date(startDate) && d <= new Date(endDate);
  });

  // Compute per-student, per-category averages
  const studentData = students.map(student => {
    const studentGrades = filteredGrades.filter(g => g.student_id === student.id);
    const categoryAvgs: Record<string, { avg: number; count: number } | null> = {};

    for (const cat of categories) {
      const catGrades = studentGrades.filter(g => g.category_id === cat.id);
      if (catGrades.length === 0) {
        categoryAvgs[cat.id] = null;
      } else {
        const avg = catGrades.reduce((s, g) => s + g.score, 0) / catGrades.length;
        categoryAvgs[cat.id] = { avg, count: catGrades.length };
      }
    }

    return { student, categoryAvgs, totalGrades: studentGrades.length };
  });

  // Print
  const handlePrint = () => {
    const headerCells = categories.map(c => `<th>${c.name}</th>`).join('');
    const rows = studentData.map(({ student, categoryAvgs }) => {
      const cells = categories.map(c => {
        const data = categoryAvgs[c.id];
        if (!data) return '<td>—</td>';
        return `<td>${formatScore(data.avg, c.score_type)}</td>`;
      }).join('');
      return `<tr><td>${student.first_name} ${student.last_name}</td><td>${student.school?.name || ''}</td>${cells}</tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><title>Report Cards</title>
    <style>body{font-family:Inter,system-ui,sans-serif;padding:40px;color:#1e293b;max-width:1100px;margin:0 auto}
    h1{font-size:22px;font-weight:600;margin-bottom:4px}p{color:#64748b;font-size:13px;margin:2px 0}
    table{width:100%;border-collapse:collapse;margin-top:20px;font-size:12px}
    th,td{text-align:left;padding:6px 10px;border-bottom:1px solid #e2e8f0}
    th{font-weight:600;color:#475569;text-transform:uppercase;font-size:10px;letter-spacing:0.05em;white-space:nowrap}
    .footer{margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8}</style></head>
    <body><h1>Report Cards</h1>
    <p>${formatDate(startDate)} – ${formatDate(endDate)} · ${students.length} students</p>
    <table><thead><tr><th>Student</th><th>School</th>${headerCells}</tr></thead><tbody>${rows}</tbody></table>
    <div class="footer">Printed ${new Date().toLocaleDateString()}</div></body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="back-link">
            <svg className="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 8, color: 'var(--color-text)' }}>
            {ts ? 'Report Cards (The Collection)' : 'Report Cards'}
          </h1>
          <p style={{ fontSize: 15, marginTop: 4, color: 'var(--color-text-muted)' }}>
            {students.length} students · {filteredGrades.length} grades in range
          </p>
        </div>

        {/* Date range + Print */}
        <div className="card mb-6">
          <label className="label" htmlFor="report-start">Date Range</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input id="report-start" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input" style={{ maxWidth: 200, flex: 'none' }} />
            <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>to</span>
            <input id="report-end" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input" style={{ maxWidth: 200, flex: 'none' }} />
            <button onClick={handlePrint} className="btn-primary text-sm flex items-center gap-1.5 no-print" style={{ marginLeft: 'auto', padding: '6px 14px', minHeight: 36 }}>
              <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print All
            </button>
          </div>
        </div>

        {/* Desktop: Table view */}
        <div className="hidden md:block">
          <div className="card overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: 12, paddingRight: 12, color: 'var(--color-text-muted)' }}>Student</th>
                  <th style={{ textAlign: 'left', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: 12, paddingRight: 12, color: 'var(--color-text-muted)' }}>School</th>
                  {categories.map(c => (
                    <th key={c.id} style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: 12, padding: '0 8px 12px', whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}>
                      {c.name.replace('Writing - ', '').replace('Cutting - ', 'Cut ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {studentData.map(({ student, categoryAvgs, totalGrades }, idx) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid var(--color-border)', background: idx % 2 === 1 ? 'var(--color-bg-accent)' : 'transparent' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <Link href={`/students/${student.id}`} className="text-sm font-medium transition-colors" style={{ color: 'var(--color-text)' }}>
                        {student.first_name} {student.last_name}
                      </Link>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--color-text-muted)' }}>{student.school?.name}</td>
                    {categories.map(c => {
                      const data = categoryAvgs[c.id];
                      return (
                        <td key={c.id} style={{ padding: '10px 12px', fontSize: 15, fontVariantNumeric: 'tabular-nums', textAlign: 'center' as const, color: data ? 'var(--color-text)' : 'var(--color-border)' }}>
                          {data ? formatScore(data.avg, c.score_type) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {studentData.length === 0 && (
              <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>No active students</p>
            )}
          </div>
        </div>

        {/* Mobile: Card view */}
        <div className="md:hidden space-y-3">
          {studentData.map(({ student, categoryAvgs, totalGrades }) => (
            <div key={student.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Link href={`/students/${student.id}`} className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                    {student.first_name} {student.last_name}
                  </Link>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{student.school?.name}</p>
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{totalGrades} grades</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                {categories.map(c => {
                  const data = categoryAvgs[c.id];
                  return (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>{c.name.replace('Writing - ', '').replace('Cutting - ', 'Cut ')}</span>
                      <span className="tabular-nums font-medium" style={{ color: data ? 'var(--color-text)' : 'var(--color-border)' }}>
                        {data ? formatScore(data.avg, c.score_type) : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {studentData.length === 0 && (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>No active students</p>
          )}
        </div>
      </div>
    </div>
  );
}
