'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatDate, formatScore, isDateInRange, formatDateInputValue, normalizeScore } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { useToast } from '@/lib/toast';
import { DEMO_STUDENTS, DEMO_CATEGORIES, generateDemoGrades } from '../mock-data';
import type { Grade } from '@/lib/types';

function getSchoolYearStart(): string {
  const now = new Date();
  const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-08-01`;
}

export default function DemoStudentDetail() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const student = DEMO_STUDENTS.find(s => s.id === studentId);
  const { isTaylorSwift: ts } = useTheme();
  const { toast } = useToast();

  const mockGrades = useMemo(() => generateDemoGrades(), []);
  const [grades, setGrades] = useState<Grade[]>(() => mockGrades.filter(g => g.student_id === studentId).sort((a, b) => b.graded_at.localeCompare(a.graded_at)));

  const [startDate, setStartDate] = useState(getSchoolYearStart());
  const [endDate, setEndDate] = useState(formatDateInputValue(new Date().toISOString()));
  const [tab, setTab] = useState<'grades' | 'progress'>('grades');

  // Grade entry state
  const [entryDate, setEntryDate] = useState(formatDateInputValue(new Date().toISOString()));
  const [entryCatId, setEntryCatId] = useState('');
  const [entryScore, setEntryScore] = useState('');
  const [entryNotes, setEntryNotes] = useState('');

  if (!student) return <div className="min-h-screen" style={{ background: 'var(--color-bg)', padding: '80px 24px', textAlign: 'center' }}><p style={{ color: 'var(--color-text-muted)' }}>Student not found</p></div>;

  const gradesInPeriod = grades.filter(g => isDateInRange(g.graded_at, startDate, endDate));

  // Student navigation
  const currentIdx = DEMO_STUDENTS.findIndex(s => s.id === studentId);
  const prevStudent = currentIdx > 0 ? DEMO_STUDENTS[currentIdx - 1] : null;
  const nextStudent = currentIdx < DEMO_STUDENTS.length - 1 ? DEMO_STUDENTS[currentIdx + 1] : null;

  // Grade entry — local only
  const handleSaveGrade = () => {
    if (!entryCatId || !entryScore.trim()) { toast('Select a category and enter a score', 'error'); return; }
    const cat = DEMO_CATEGORIES.find(c => c.id === entryCatId);
    if (!cat) return;
    const scoreNum = parseFloat(entryScore);
    if (isNaN(scoreNum)) { toast('Enter a valid score', 'error'); return; }
    const score = normalizeScore(scoreNum, cat.score_type);
    const newGrade: Grade = {
      id: `demo-${Date.now()}`, student_id: studentId, category_id: entryCatId,
      score, notes: entryNotes.trim() || null, other_skills: null,
      graded_at: new Date(entryDate).toISOString(), category: cat,
    };
    setGrades(prev => [newGrade, ...prev]);
    setEntryScore(''); setEntryNotes('');
    toast(ts ? 'Track dropped! 🎤' : 'Grade saved (demo)');
  };

  const selectedCat = DEMO_CATEGORIES.find(c => c.id === entryCatId);

  // Report card stats
  const categoryStats = DEMO_CATEGORIES.map(cat => {
    const cg = gradesInPeriod.filter(g => g.category_id === cat.id);
    if (cg.length === 0) return { cat, count: 0, average: null };
    return { cat, count: cg.length, average: cg.reduce((s, g) => s + g.score, 0) / cg.length };
  });

  // Print
  const handlePrint = () => {
    const rows = categoryStats.map(s => {
      if (s.count === 0) return `<tr><td>${s.cat.name}</td><td>—</td><td>0</td></tr>`;
      return `<tr><td>${s.cat.name}</td><td>${formatScore(s.average!, s.cat.score_type)}</td><td>${s.count}</td></tr>`;
    }).join('');
    const html = `<!DOCTYPE html><html><head><title>Demo Report</title><style>body{font-family:Inter,system-ui;padding:40px;max-width:700px;margin:0 auto}h1{font-size:22px;font-weight:600}p{color:#64748b;font-size:14px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px}th{font-weight:600;text-transform:uppercase;font-size:11px}</style></head><body><h1>${student.first_name} ${student.last_name}</h1><p>${student.school?.name} · ${formatDate(startDate)} – ${formatDate(endDate)}</p><table><thead><tr><th>Category</th><th>Average</th><th>Count</th></tr></thead><tbody>${rows}</tbody></table><p style="margin-top:24px;font-size:11px;color:#94a3b8">Demo report · ${new Date().toLocaleDateString()}</p></body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  // Group grades by date
  const grouped = gradesInPeriod.reduce((acc, g) => {
    const d = new Date(g.graded_at).toDateString();
    if (!acc[d]) acc[d] = [];
    acc[d].push(g);
    return acc;
  }, {} as Record<string, Grade[]>);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Link href="/demo" className="back-link">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Back
            </Link>
            <span style={{ color: 'var(--color-border)' }}>|</span>
            {prevStudent && <button onClick={() => router.push(`/demo/${prevStudent.id}`)} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }} aria-label="Previous"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>}
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', padding: '4px 8px', background: 'var(--color-bg-accent)', borderRadius: 6 }}>{currentIdx + 1} of {DEMO_STUDENTS.length}</span>
            {nextStudent && <button onClick={() => router.push(`/demo/${nextStudent.id}`)} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }} aria-label="Next"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-text)' }}>{student.first_name} {student.last_name}</h1>
              <p style={{ fontSize: 15, marginTop: 2, color: 'var(--color-text-muted)' }}>{student.school?.name}</p>
            </div>
            <button onClick={() => toast('Sign up to edit student settings!')} className="btn-ghost" style={{ fontSize: 14 }}>Settings</button>
          </div>
        </div>

        {/* Date range */}
        <div style={{ borderRadius: 10, padding: 16, marginBottom: 24, background: 'var(--color-bg-accent)', borderLeft: '3px solid var(--color-primary-surface, var(--color-primary))' }}>
          <label className="label">{ts ? 'Tour Dates' : 'Date Range'}</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' as const }}>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input" style={{ maxWidth: 200, flex: 'none' }} />
            <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>to</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input" style={{ maxWidth: 200, flex: 'none' }} />
            <button onClick={handlePrint} className="btn-primary" style={{ marginLeft: 'auto', fontSize: 14, padding: '6px 14px', minHeight: 36 }}>Print</button>
          </div>
          <p style={{ fontSize: 13, marginTop: 8, color: 'var(--color-text-muted)' }}>Showing {gradesInPeriod.length} grades</p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 24 }}>
          {/* Left column */}
          <div className="md:col-span-2" style={{ display: 'flex', flexDirection: 'column' as const, gap: 24 }}>
            {/* Grade entry */}
            <div className="card">
              <div className="section-header">{ts ? 'New Track ♪' : 'New Grade'}</div>
              <div className="flex flex-col sm:flex-row" style={{ gap: 16, marginBottom: 16 }}>
                <div style={{ minWidth: 140 }}><label className="label">Date</label><input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} className="input" /></div>
                <div style={{ flex: 1, minWidth: 180 }}><label className="label">Category</label>
                  <select value={entryCatId} onChange={e => setEntryCatId(e.target.value)} className="input">
                    <option value="">Select...</option>
                    {DEMO_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name} ({c.score_type === 'percentage' ? '0–100' : 'WPM'})</option>)}
                  </select>
                </div>
                <div style={{ minWidth: 100, maxWidth: 140 }}><label className="label">Score {selectedCat && `(${selectedCat.score_type === 'percentage' ? '0–100' : 'WPM'})`}</label>
                  <input type="number" value={entryScore} onChange={e => setEntryScore(e.target.value)} placeholder={selectedCat?.score_type === 'percentage' ? '0–100' : 'WPM'} className="input" />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}><label className="label">Notes</label><textarea rows={2} value={entryNotes} onChange={e => setEntryNotes(e.target.value)} placeholder="Optional" className="input" style={{ resize: 'vertical' as const }} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSaveGrade} className="btn-primary" style={{ fontSize: 15 }}>{ts ? 'Drop it 🎤' : 'Save grade'}</button>
              </div>
            </div>

            {/* Grades list */}
            <div className="card">
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {(['grades', 'progress'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 14px', fontSize: 15, fontWeight: 500, borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: tab === t ? 'var(--color-primary-lighter)' : 'transparent', color: tab === t ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                    {t === 'grades' ? `${ts ? 'Tracklist' : 'Grades'} (${gradesInPeriod.length})` : (ts ? 'The Eras' : 'Progress')}
                  </button>
                ))}
              </div>
              {tab === 'grades' ? (
                gradesInPeriod.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '40px 0', fontSize: 15, color: 'var(--color-text-muted)' }}>No grades in this date range</p>
                ) : (
                  <div>
                    {Object.entries(grouped).map(([dateStr, dateGrades]) => (
                      <div key={dateStr}>
                        <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', paddingTop: 12, paddingBottom: 6, color: 'var(--color-text-muted)' }}>{formatDate(dateGrades[0].graded_at)}</div>
                        {dateGrades.map(g => {
                          const cat = DEMO_CATEGORIES.find(c => c.id === g.category_id);
                          return (
                            <div key={g.id} className="hover-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' as const }}>
                                  <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text)' }}>{cat?.name}</span>
                                  <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-primary)' }}>{formatScore(g.score, cat?.score_type || 'raw')}</span>
                                </div>
                                {g.notes && <p style={{ fontSize: 13, marginTop: 4, fontStyle: 'italic', color: 'var(--color-text-muted)' }}>{g.notes}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <p style={{ textAlign: 'center', padding: '40px 0', fontSize: 15, color: 'var(--color-text-muted)' }}>Progress charts available in the full app. <Link href="/signup" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Sign up free →</Link></p>
              )}
            </div>
          </div>

          {/* Right column — Report card */}
          <div className="md:col-span-1">
            <div className="card sticky top-20" style={{ paddingTop: 28, paddingBottom: 28 }}>
              <div className="section-header" style={{ marginBottom: 16 }}>{ts ? 'Album Notes' : 'Report Card'}</div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
                {categoryStats.filter(s => s.count > 0).map(s => (
                  <div key={s.cat.id} style={{ padding: 16, borderRadius: 10, background: 'var(--color-bg-accent)', border: '1px solid var(--color-border)' }}>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', marginBottom: 6 }}>{s.cat.name}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums' }}>{s.average !== null ? formatScore(s.average, s.cat.score_type) : '—'}</span>
                        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{s.count} grade{s.count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    {s.cat.score_type === 'percentage' && s.average !== null && (
                      <div style={{ height: 6, borderRadius: 3, background: 'var(--color-border)', width: '100%' }}>
                        <div style={{ height: 6, borderRadius: 3, width: `${Math.round(s.average * 100)}%`, background: 'var(--color-primary)' }} />
                      </div>
                    )}
                  </div>
                ))}
                {categoryStats.filter(s => s.count === 0).map(s => (
                  <div key={s.cat.id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--color-text-muted)' }}>
                    <span>{s.cat.name}</span> <span style={{ color: 'var(--color-border)' }}>— No data</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
