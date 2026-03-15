'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StudentWithSchool, Category, Grade, GradingPeriod } from '@/lib/types';
import { formatDate, formatScore, isDateInRange, formatDateInputValue } from '@/lib/utils';
import { GradeEntryForm } from './grade-entry-form';
import { BulkGradeForm } from './bulk-grade-form';
import { GradesList } from './grades-list';
import { ReportCardSummary } from './report-card-summary';
import { ProgressCharts } from './progress-charts';
import { useTheme } from '@/lib/theme';
import { useToast } from '@/lib/toast';
import { createClient } from '@/lib/supabase/client';

interface SimpleStudent { id: string; name: string; school: string; }
interface StudentDetailClientProps {
  student: StudentWithSchool; categories: Category[]; initialGrades: Grade[];
  gradingPeriods: GradingPeriod[]; allStudents: SimpleStudent[];
}

function getSchoolYearStart(): string {
  const now = new Date();
  const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-08-01`;
}

export function StudentDetailClient({ student, categories, initialGrades, gradingPeriods, allStudents }: StudentDetailClientProps) {
  const [grades, setGrades] = useState<Grade[]>(initialGrades);
  const currentPeriodObj = gradingPeriods.find(p => p.is_current) || gradingPeriods[0] || null;
  const savedStart = typeof window !== 'undefined' ? sessionStorage.getItem('ot-date-start') : null;
  const savedEnd = typeof window !== 'undefined' ? sessionStorage.getItem('ot-date-end') : null;
  const [startDate, setStartDate] = useState(savedStart || currentPeriodObj?.start_date || getSchoolYearStart());
  const [endDate, setEndDate] = useState(savedEnd || currentPeriodObj?.end_date || formatDateInputValue(new Date().toISOString()));
  const [showSavedRanges, setShowSavedRanges] = useState(false);
  const [savingRange, setSavingRange] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [view, setView] = useState<'split' | 'entry' | 'summary'>('split');
  const [tab, setTab] = useState<'grades' | 'progress'>('grades');
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const { isTaylorSwift: ts } = useTheme();

  useEffect(() => {
    sessionStorage.setItem('ot-date-start', startDate);
    sessionStorage.setItem('ot-date-end', endDate);
  }, [startDate, endDate]);
  const { toast } = useToast();
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const gradesInPeriod = grades.filter(g => isDateInRange(g.graded_at, startDate, endDate));

  const handleGradeAdded = useCallback((g: Grade) => setGrades(prev => [g, ...prev]), []);
  const handleBulkGradesAdded = useCallback((newGrades: Grade[]) => setGrades(prev => [...newGrades, ...prev]), []);
  const handleGradeUpdated = useCallback((g: Grade) => { setGrades(prev => prev.map(x => x.id === g.id ? g : x)); setEditingGradeId(null); }, []);
  const handleGradeDeleted = useCallback((id: string) => setGrades(prev => prev.filter(g => g.id !== id)), []);

  const currentIdx = allStudents.findIndex(s => s.id === student.id);
  const prevStudent = currentIdx > 0 ? allStudents[currentIdx - 1] : null;
  const nextStudent = currentIdx < allStudents.length - 1 ? allStudents[currentIdx + 1] : null;

  const handleSaveRange = async () => {
    const name = prompt('Name this range (e.g., "Q3 2026"):');
    if (!name?.trim()) return;
    setSavingRange(true);
    const { error } = await supabase.from('grading_periods').insert({ student_id: student.id, name: name.trim(), start_date: startDate, end_date: endDate, is_current: false });
    setSavingRange(false);
    if (error) toast(error.message, 'error'); else { toast('Range saved'); router.refresh(); }
  };

  const handlePrint = () => {
    const byCategory: Record<string, { cat: Category; grades: Grade[] }> = {};
    categories.forEach(c => { byCategory[c.id] = { cat: c, grades: [] }; });
    gradesInPeriod.forEach(g => { if (byCategory[g.category_id]) byCategory[g.category_id].grades.push(g); });
    const rows = Object.values(byCategory).map(({ cat, grades: cg }) => {
      if (cg.length === 0) return `<tr><td>${cat.name}</td><td>—</td><td>0</td><td></td></tr>`;
      const avg = cg.reduce((s, g) => s + g.score, 0) / cg.length;
      return `<tr><td>${cat.name}</td><td>${formatScore(avg, cat.score_type)}</td><td>${cg.length}</td><td>${cg.filter(g => g.notes).map(g => g.notes).join('; ')}</td></tr>`;
    }).join('');
    const html = `<!DOCTYPE html><html><head><title>Report Card</title><style>body{font-family:Inter,system-ui,sans-serif;padding:40px;color:#1e293b;max-width:700px;margin:0 auto}h1{font-size:24px;font-weight:600;margin-bottom:4px}p{color:#64748b;font-size:14px;margin:2px 0}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px}th{font-weight:600;color:#475569;text-transform:uppercase;font-size:11px;letter-spacing:0.05em}.footer{margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8}</style></head><body><h1>${student.first_name} ${student.last_name}</h1><p>${student.school?.name||''}</p><p>${formatDate(startDate)} – ${formatDate(endDate)}</p><table><thead><tr><th>Category</th><th>Average</th><th>Count</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table><div class="footer">Printed ${new Date().toLocaleDateString()}</div></body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  const tabBtn = (t: 'grades' | 'progress', label: string) => (
    <button onClick={() => setTab(t)} className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200"
      style={{
        background: tab === t ? 'var(--color-primary-lighter)' : 'transparent',
        color: tab === t ? 'var(--color-primary-surface, var(--color-primary))' : 'var(--color-text-muted)',
      }}>{label}</button>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header with quick nav */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/dashboard" className="text-sm inline-flex items-center gap-1 transition-colors" style={{ color: 'var(--color-text-muted)' }}>
              <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Back
            </Link>
            <span style={{ color: 'var(--color-border)' }}>|</span>
            <div className="flex items-center gap-1">
              {prevStudent ? (
                <button onClick={() => router.push(`/students/${prevStudent.id}`)} aria-label="Previous student" className="p-1 rounded transition-colors" style={{ color: 'var(--color-text-muted)' }}>
                  <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
              ) : <div className="w-6" />}
              <div className="relative">
                <button onClick={() => setShowStudentPicker(!showStudentPicker)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 inline-flex items-center gap-1"
                  style={{ background: 'var(--color-bg-accent)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                  {currentIdx + 1} of {allStudents.length}
                  <svg className="w-3 h-3 opacity-50" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showStudentPicker && (
                  <div className="absolute left-0 top-full mt-1 w-56 max-h-64 overflow-y-auto rounded-xl py-1 z-50 animate-fade-in"
                    style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)', maxWidth: 'calc(100vw - 32px)' }}>
                    {(() => {
                      const grouped: Record<string, typeof allStudents> = {};
                      allStudents.forEach(s => { if (!grouped[s.school]) grouped[s.school] = []; grouped[s.school].push(s); });
                      return Object.entries(grouped).map(([school, students]) => (
                        <div key={school}>
                          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{school}</div>
                          {students.map(s => (
                            <button key={s.id} onClick={() => { setShowStudentPicker(false); router.push(`/students/${s.id}`); }}
                              className="w-full text-left px-3 py-1.5 text-sm transition-colors"
                              style={{ color: s.id === student.id ? 'var(--color-primary)' : 'var(--color-text)', background: s.id === student.id ? 'var(--color-primary-lighter)' : 'transparent' }}>{s.name}</button>
                          ))}
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
              {nextStudent ? (
                <button onClick={() => router.push(`/students/${nextStudent.id}`)} aria-label="Next student" className="p-1 rounded transition-colors" style={{ color: 'var(--color-text-muted)' }}>
                  <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : <div className="w-6" />}
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>{student.first_name} {student.last_name}</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{student.school?.name || 'Unknown School'}</p>
            </div>
            <Link href={`/students/${student.id}/edit`} className="btn-ghost text-sm">Settings</Link>
          </div>
        </div>

        {/* Date range bar */}
        <div className="rounded-lg p-4 mb-6" style={{ background: 'var(--color-bg-accent)', borderLeft: '3px solid var(--color-primary-surface, var(--color-primary))' }}>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <label className="label" htmlFor="date-range-start">{ts ? 'Tour Dates' : 'Date Range'}</label>
              <div className="flex items-center gap-2 flex-wrap">
                <input type="date" id="date-range-start" value={startDate} onChange={e => setStartDate(e.target.value)} className="input w-full sm:w-[150px]" />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>to</span>
                <input type="date" id="date-range-end" value={endDate} onChange={e => setEndDate(e.target.value)} className="input w-full sm:w-[150px]" />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {gradingPeriods.length > 0 && (
                <div className="relative">
                  <button onClick={() => setShowSavedRanges(!showSavedRanges)} className="btn-ghost text-sm">Saved</button>
                  {showSavedRanges && (
                    <div className="absolute right-0 top-full mt-1 w-56 rounded-xl py-1 z-50 animate-fade-in"
                      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)', maxWidth: 'calc(100vw - 32px)' }}>
                      {gradingPeriods.map(p => (
                        <button key={p.id} onClick={() => { setStartDate(p.start_date); setEndDate(p.end_date); setShowSavedRanges(false); }}
                          className="w-full text-left px-3 py-1.5 text-sm transition-colors" style={{ color: 'var(--color-text)' }}>
                          <span className="font-medium">{p.name}</span>
                          <span className="text-[10px] ml-2" style={{ color: 'var(--color-text-muted)' }}>{formatDate(p.start_date)} – {formatDate(p.end_date)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button onClick={handleSaveRange} disabled={savingRange} className="btn-ghost text-sm">{savingRange ? '...' : 'Save range'}</button>
              <button onClick={handlePrint} className="no-print btn-primary text-sm py-1.5 px-3 flex items-center gap-1.5">
                <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg> Print
              </button>
            </div>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
            Showing {gradesInPeriod.length} grade{gradesInPeriod.length !== 1 ? 's' : ''} from {formatDate(startDate)} to {formatDate(endDate)}
          </p>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden mb-4 flex gap-1.5">
          {(['entry', 'summary'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              style={{
                background: view === v ? 'var(--color-primary)' : 'transparent',
                color: view === v ? 'var(--color-primary-btn-text)' : 'var(--color-text-muted)',
                border: view !== v ? '1px solid var(--color-border)' : 'none',
              }}>{v === 'entry' ? 'Grades' : 'Summary'}</button>
          ))}
        </div>

        {grades.length === 0 && (
          <div className="card text-center py-8 mb-4">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{ts ? "Time to start this era! 🎵" : "No grades yet"}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Enter the first grade above to begin tracking progress.</p>
          </div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`md:col-span-2 ${view === 'summary' ? 'hidden md:block' : ''}`}>
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="section-header" style={{ marginBottom: 0 }}>{ts ? 'New Track ♪' : 'New Grade'}</div>
                  <button onClick={() => setBulkMode(!bulkMode)} className="text-xs font-medium px-2.5 py-1 rounded-lg transition-all" style={{
                    background: bulkMode ? 'var(--color-primary-lighter)' : 'transparent',
                    color: bulkMode ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    border: bulkMode ? 'none' : '1px solid var(--color-border)',
                  }}>
                    {bulkMode ? (ts ? '♪ Single' : 'Single') : (ts ? '♪♪ Bulk' : 'Bulk')}
                  </button>
                </div>
                {bulkMode ? (
                  <BulkGradeForm student={student} categories={categories} onGradesAdded={handleBulkGradesAdded} />
                ) : (
                  <GradeEntryForm student={student} categories={categories} onGradeAdded={handleGradeAdded} />
                )}
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1">{tabBtn('grades', ts ? `Tracklist (${gradesInPeriod.length})` : `Grades (${gradesInPeriod.length})`)}{tabBtn('progress', ts ? 'The Eras' : 'Progress')}</div>
                </div>
                {tab === 'grades' ? (
                  <GradesList grades={gradesInPeriod} categories={categories} editingGradeId={editingGradeId}
                    onEditStart={setEditingGradeId} onGradeUpdated={handleGradeUpdated} onGradeDeleted={handleGradeDeleted} studentId={student.id} />
                ) : (
                  <ProgressCharts grades={gradesInPeriod} categories={categories} />
                )}
              </div>
            </div>
          </div>

          <div className={`md:col-span-1 ${view === 'entry' ? 'hidden md:block' : ''}`}>
            <div className="card sticky top-20 print-area">
              <div className="section-header">{ts ? 'Album Notes' : 'Report Card'}</div>
              <ReportCardSummary grades={gradesInPeriod} categories={categories} periodName={`${formatDate(startDate)} – ${formatDate(endDate)}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
