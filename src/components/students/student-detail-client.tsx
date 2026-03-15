'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StudentWithSchool, Category, Grade, GradingPeriod } from '@/lib/types';
import { formatDate, formatScore, isDateInRange, formatDateInputValue } from '@/lib/utils';
import { GradeEntryForm } from './grade-entry-form';
import { GradesList } from './grades-list';
import { ReportCardSummary } from './report-card-summary';
import { ProgressCharts } from './progress-charts';
import { useTheme } from '@/lib/theme';
import { useToast } from '@/lib/toast';
import { createClient } from '@/lib/supabase/client';

interface SimpleStudent { id: string; name: string; school: string; }

interface StudentDetailClientProps {
  student: StudentWithSchool;
  categories: Category[];
  initialGrades: Grade[];
  gradingPeriods: GradingPeriod[];
  allStudents: SimpleStudent[];
}

// Default school year: Aug 1 of current school year
function getSchoolYearStart(): string {
  const now = new Date();
  const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-08-01`;
}

export function StudentDetailClient({ student, categories, initialGrades, gradingPeriods, allStudents }: StudentDetailClientProps) {
  const [grades, setGrades] = useState<Grade[]>(initialGrades);

  // Flexible date range — default to current period or school year
  const currentPeriodObj = gradingPeriods.find(p => p.is_current) || gradingPeriods[0] || null;
  const [startDate, setStartDate] = useState(currentPeriodObj?.start_date || getSchoolYearStart());
  const [endDate, setEndDate] = useState(currentPeriodObj?.end_date || formatDateInputValue(new Date().toISOString()));
  const [showSavedRanges, setShowSavedRanges] = useState(false);
  const [savingRange, setSavingRange] = useState(false);

  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [view, setView] = useState<'split' | 'entry' | 'summary'>('split');
  const [tab, setTab] = useState<'grades' | 'progress'>('grades');
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const { isTaylorSwift: ts, isDark } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  // Filter grades by selected date range
  const gradesInPeriod = grades.filter(g => isDateInRange(g.graded_at, startDate, endDate));

  const handleGradeAdded = useCallback((newGrade: Grade) => { setGrades(prev => [newGrade, ...prev]); }, []);
  const handleGradeUpdated = useCallback((updatedGrade: Grade) => {
    setGrades(prev => prev.map(g => g.id === updatedGrade.id ? updatedGrade : g));
    setEditingGradeId(null);
  }, []);
  const handleGradeDeleted = useCallback((gradeId: string) => { setGrades(prev => prev.filter(g => g.id !== gradeId)); }, []);

  // Quick student nav
  const currentIdx = allStudents.findIndex(s => s.id === student.id);
  const prevStudent = currentIdx > 0 ? allStudents[currentIdx - 1] : null;
  const nextStudent = currentIdx < allStudents.length - 1 ? allStudents[currentIdx + 1] : null;

  // Save current range as named period
  const handleSaveRange = async () => {
    const name = prompt('Name this range (e.g., "Q3 2026"):');
    if (!name?.trim()) return;
    setSavingRange(true);
    const { error } = await supabase.from('grading_periods').insert({
      student_id: student.id, name: name.trim(), start_date: startDate, end_date: endDate, is_current: false,
    });
    setSavingRange(false);
    if (error) toast(error.message, 'error');
    else { toast('Range saved'); router.refresh(); }
  };

  // Load a saved range
  const loadRange = (p: GradingPeriod) => {
    setStartDate(p.start_date);
    setEndDate(p.end_date);
    setShowSavedRanges(false);
  };

  // Print
  const handlePrint = () => {
    const gradesByCategory: Record<string, { cat: Category; grades: Grade[] }> = {};
    categories.forEach(c => { gradesByCategory[c.id] = { cat: c, grades: [] }; });
    gradesInPeriod.forEach(g => { if (gradesByCategory[g.category_id]) gradesByCategory[g.category_id].grades.push(g); });

    const rows = Object.values(gradesByCategory).map(({ cat, grades: cg }) => {
      if (cg.length === 0) return `<tr><td>${cat.name}</td><td>—</td><td>0</td><td></td></tr>`;
      const avg = cg.reduce((s, g) => s + g.score, 0) / cg.length;
      const notes = cg.filter(g => g.notes).map(g => g.notes).join('; ');
      return `<tr><td>${cat.name}</td><td>${formatScore(avg, cat.score_type)}</td><td>${cg.length}</td><td>${notes}</td></tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><title>Report Card - ${student.first_name} ${student.last_name}</title>
    <style>body{font-family:Inter,system-ui,sans-serif;padding:40px;color:#1e293b;max-width:700px;margin:0 auto}
    h1{font-size:24px;font-weight:600;margin-bottom:4px}p{color:#64748b;font-size:14px;margin:2px 0}
    table{width:100%;border-collapse:collapse;margin-top:24px}th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px}
    th{font-weight:600;color:#475569;text-transform:uppercase;font-size:11px;letter-spacing:0.05em}
    .footer{margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8}</style></head>
    <body><h1>${student.first_name} ${student.last_name}</h1>
    <p>${student.school?.name || ''}</p>
    <p>${formatDate(startDate)} – ${formatDate(endDate)}</p>
    <table><thead><tr><th>Category</th><th>Average</th><th>Count</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="footer">Printed ${new Date().toLocaleDateString()}</div></body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  const inputClass = `px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200`;
  const inputColors = isDark
    ? 'bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text)] focus:ring-[var(--color-primary)]/30'
    : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500/40';
  const labelCls = `block text-xs font-medium uppercase tracking-wider mb-2`;

  const tabBtn = (t: 'grades' | 'progress', label: string) => (
    <button onClick={() => setTab(t)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
      tab === t
        ? ts ? 'bg-amber-500/20 text-amber-400' : isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-700'
        : `text-[var(--color-text-muted)] hover:bg-[var(--color-bg-accent)]`
    }`}>{label}</button>
  );

  const ghostBtn = `px-3 py-2 text-sm rounded-lg border transition-all duration-200 border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-accent)]`;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with quick nav */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/" className="text-sm inline-flex items-center gap-1 transition-colors" style={{ color: 'var(--color-text-muted)' }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back
            </Link>
            <span className="text-xs" style={{ color: 'var(--color-border)' }}>|</span>
            <div className="flex items-center gap-1">
              {prevStudent ? (
                <button onClick={() => router.push(`/students/${prevStudent.id}`)} className="p-1 rounded transition-colors" style={{ color: 'var(--color-text-muted)' }} title={prevStudent.name}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
              ) : <div className="w-6" />}
              <div className="relative">
                <button onClick={() => setShowStudentPicker(!showStudentPicker)}
                  className={`px-2 py-1 text-xs rounded-lg border transition-all duration-200`}
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                  {currentIdx + 1} of {allStudents.length}
                </button>
                {showStudentPicker && (
                  <div className="absolute left-0 top-full mt-1 w-56 max-h-64 overflow-y-auto rounded-lg shadow-lg border py-1 z-50 animate-fade-in"
                    style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                    {allStudents.map(s => (
                      <button key={s.id} onClick={() => { setShowStudentPicker(false); router.push(`/students/${s.id}`); }}
                        className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                          s.id === student.id ? ts ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-50 text-indigo-700' : ''
                        }`} style={s.id !== student.id ? { color: 'var(--color-text)' } : {}}>{s.name}</button>
                    ))}
                  </div>
                )}
              </div>
              {nextStudent ? (
                <button onClick={() => router.push(`/students/${nextStudent.id}`)} className="p-1 rounded transition-colors" style={{ color: 'var(--color-text-muted)' }} title={nextStudent.name}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : <div className="w-6" />}
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>
                {student.first_name} {student.last_name}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{student.school?.name || 'Unknown School'}</p>
            </div>
            <Link href={`/students/${student.id}/edit`} className={ghostBtn}>Settings</Link>
          </div>
        </div>

        {/* Flexible date range + Print */}
        <div className="mb-6 rounded-xl p-4 border ts-glass" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>Date Range</label>
              <div className="flex items-center gap-2">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${inputClass} ${inputColors} w-36`} />
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>to</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`${inputClass} ${inputColors} w-36`} />
              </div>
            </div>
            <div className="flex gap-2">
              {/* Saved ranges */}
              {gradingPeriods.length > 0 && (
                <div className="relative">
                  <button onClick={() => setShowSavedRanges(!showSavedRanges)} className={ghostBtn}>Saved</button>
                  {showSavedRanges && (
                    <div className="absolute right-0 top-full mt-1 w-56 rounded-lg shadow-lg border py-1 z-50 animate-fade-in"
                      style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
                      {gradingPeriods.map(p => (
                        <button key={p.id} onClick={() => loadRange(p)}
                          className="w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-[var(--color-bg-accent)]"
                          style={{ color: 'var(--color-text)' }}>
                          <span className="font-medium">{p.name}</span>
                          <span className="text-[10px] ml-2" style={{ color: 'var(--color-text-muted)' }}>{formatDate(p.start_date)} – {formatDate(p.end_date)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button onClick={handleSaveRange} disabled={savingRange} className={ghostBtn}>
                {savingRange ? '...' : 'Save range'}
              </button>
              <button onClick={handlePrint} className={`no-print ${ghostBtn} flex items-center gap-1.5`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print
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
            <button key={v} onClick={() => setView(v)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              view === v
                ? ts ? 'bg-amber-500/90 text-[#0a0a14]' : 'bg-indigo-600 text-white'
                : `border text-[var(--color-text-muted)]`
            }`} style={view !== v ? { borderColor: 'var(--color-border)' } : {}}>{v === 'entry' ? 'Entry' : 'Summary'}</button>
          ))}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className={`md:col-span-2 ${view === 'summary' ? 'hidden md:block' : ''}`}>
            <div className="space-y-5">
              <div className="rounded-xl p-5 border ts-glass" style={{ borderColor: 'var(--color-border)' }}>
                <h2 className={`text-sm font-medium uppercase tracking-wider mb-4`} style={{ color: ts ? '#d4af37' : 'var(--color-text-muted)' }}>New Grade</h2>
                <GradeEntryForm student={student} categories={categories} onGradeAdded={handleGradeAdded} />
              </div>

              <div className="rounded-xl p-5 border ts-glass" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1">{tabBtn('grades', `Grades (${gradesInPeriod.length})`)}{tabBtn('progress', 'Progress')}</div>
                </div>
                {tab === 'grades' ? (
                  <GradesList grades={gradesInPeriod} categories={categories} editingGradeId={editingGradeId}
                    onEditStart={setEditingGradeId} onGradeUpdated={handleGradeUpdated}
                    onGradeDeleted={handleGradeDeleted} studentId={student.id} />
                ) : (
                  <ProgressCharts grades={gradesInPeriod} categories={categories} />
                )}
              </div>
            </div>
          </div>

          <div className={`md:col-span-1 ${view === 'entry' ? 'hidden md:block' : ''}`}>
            <div className="rounded-xl p-5 border sticky top-20 print-area ts-glass" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-sm font-medium uppercase tracking-wider mb-4" style={{ color: ts ? '#d4af37' : 'var(--color-text-muted)' }}>Report Card</h2>
              <ReportCardSummary grades={gradesInPeriod} categories={categories} periodName={`${formatDate(startDate)} – ${formatDate(endDate)}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
