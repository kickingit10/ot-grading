'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StudentWithSchool, Category, Grade, GradingPeriod } from '@/lib/types';
import { formatDate, formatScore, isDateInRange } from '@/lib/utils';
import { GradeEntryForm } from './grade-entry-form';
import { GradesList } from './grades-list';
import { ReportCardSummary } from './report-card-summary';
import { ProgressCharts } from './progress-charts';
import { useTheme } from '@/lib/theme';

interface SimpleStudent { id: string; name: string; school: string; }

interface StudentDetailClientProps {
  student: StudentWithSchool;
  categories: Category[];
  initialGrades: Grade[];
  gradingPeriods: GradingPeriod[];
  allStudents: SimpleStudent[];
}

export function StudentDetailClient({ student, categories, initialGrades, gradingPeriods, allStudents }: StudentDetailClientProps) {
  const [grades, setGrades] = useState<Grade[]>(initialGrades);
  const [selectedPeriod, setSelectedPeriod] = useState<GradingPeriod | null>(
    gradingPeriods.find((p) => p.is_current) || gradingPeriods[0] || null
  );
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [view, setView] = useState<'split' | 'entry' | 'summary'>('split');
  const [tab, setTab] = useState<'grades' | 'progress'>('grades');
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const { isTaylorSwift: ts } = useTheme();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const currentPeriod = selectedPeriod;
  const gradesInPeriod = currentPeriod
    ? grades.filter((g) => isDateInRange(g.graded_at, currentPeriod.start_date, currentPeriod.end_date))
    : grades;

  const handleGradeAdded = useCallback((newGrade: Grade) => { setGrades((prev) => [newGrade, ...prev]); }, []);
  const handleGradeUpdated = useCallback((updatedGrade: Grade) => {
    setGrades((prev) => prev.map((g) => (g.id === updatedGrade.id ? updatedGrade : g)));
    setEditingGradeId(null);
  }, []);
  const handleGradeDeleted = useCallback((gradeId: string) => { setGrades((prev) => prev.filter((g) => g.id !== gradeId)); }, []);

  // Quick student nav
  const currentIdx = allStudents.findIndex(s => s.id === student.id);
  const prevStudent = currentIdx > 0 ? allStudents[currentIdx - 1] : null;
  const nextStudent = currentIdx < allStudents.length - 1 ? allStudents[currentIdx + 1] : null;

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
    <p>Period: ${currentPeriod ? `${formatDate(currentPeriod.start_date)} – ${formatDate(currentPeriod.end_date)}` : 'All grades'}</p>
    <table><thead><tr><th>Category</th><th>Average</th><th>Count</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="footer">Printed ${new Date().toLocaleDateString()}</div></body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  const tabBtn = (t: 'grades' | 'progress', label: string) => (
    <button onClick={() => setTab(t)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
      tab === t
        ? ts ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-50 text-indigo-700'
        : ts ? 'text-[#9ca3af] hover:bg-white/[0.04]' : 'text-slate-500 hover:bg-slate-50'
    }`}>{label}</button>
  );

  return (
    <div className={`min-h-screen ${ts ? 'bg-[#0a0a14]' : 'bg-[#fafafa]'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with quick nav */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/" className={`text-sm inline-flex items-center gap-1 transition-colors ${ts ? 'text-amber-400/80 hover:text-amber-400' : 'text-slate-500 hover:text-slate-700'}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back
            </Link>
            <span className={`text-xs ${ts ? 'text-white/[0.1]' : 'text-slate-300'}`}>|</span>
            {/* Prev/Next */}
            <div className="flex items-center gap-1">
              {prevStudent ? (
                <button onClick={() => router.push(`/students/${prevStudent.id}`)} className={`p-1 rounded transition-colors ${ts ? 'hover:bg-white/[0.06] text-[#9ca3af]' : 'hover:bg-slate-100 text-slate-400'}`} title={prevStudent.name}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
              ) : <div className="w-6" />}
              {/* Student picker */}
              <div className="relative">
                <button onClick={() => setShowStudentPicker(!showStudentPicker)}
                  className={`px-2 py-1 text-xs rounded-lg border transition-all duration-200 ${
                    ts ? 'border-white/[0.08] text-[#9ca3af] hover:bg-white/[0.06]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}>
                  {currentIdx + 1} of {allStudents.length}
                </button>
                {showStudentPicker && (
                  <div className={`absolute left-0 top-full mt-1 w-56 max-h-64 overflow-y-auto rounded-lg shadow-lg border py-1 z-50 animate-fade-in ${
                    ts ? 'bg-[#141420] border-white/[0.08]' : 'bg-white border-slate-200'
                  }`}>
                    {allStudents.map(s => (
                      <button key={s.id} onClick={() => { setShowStudentPicker(false); router.push(`/students/${s.id}`); }}
                        className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                          s.id === student.id
                            ? ts ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-50 text-indigo-700'
                            : ts ? 'text-[#f0e6d3] hover:bg-white/[0.06]' : 'text-slate-700 hover:bg-slate-50'
                        }`}>{s.name}</button>
                    ))}
                  </div>
                )}
              </div>
              {nextStudent ? (
                <button onClick={() => router.push(`/students/${nextStudent.id}`)} className={`p-1 rounded transition-colors ${ts ? 'hover:bg-white/[0.06] text-[#9ca3af]' : 'hover:bg-slate-100 text-slate-400'}`} title={nextStudent.name}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : <div className="w-6" />}
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className={`text-3xl font-semibold tracking-tight ${ts ? 'text-[#f0e6d3]' : 'text-slate-900'}`}>
                {student.first_name} {student.last_name}
              </h1>
              <p className={`text-sm mt-0.5 ${ts ? 'text-[#9ca3af]' : 'text-slate-500'}`}>{student.school?.name || 'Unknown School'}</p>
            </div>
            <Link href={`/students/${student.id}/edit`}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 ${
                ts ? 'border-white/[0.08] text-[#9ca3af] hover:bg-white/[0.06]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>Settings</Link>
          </div>
        </div>

        {/* Period selector + Print */}
        {gradingPeriods.length > 0 && (
          <div className={`mb-6 rounded-xl p-4 border flex flex-col sm:flex-row sm:items-end gap-3 ${ts ? 'ts-glass' : 'bg-white border-slate-200'}`}>
            <div className="flex-1">
              <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${ts ? 'text-[#9ca3af]/70' : 'text-slate-400'}`}>Grading Period</label>
              <select value={selectedPeriod?.id || ''} onChange={(e) => setSelectedPeriod(gradingPeriods.find((p) => p.id === e.target.value) || null)}
                className={`w-full max-w-md px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  ts ? 'bg-white/[0.04] border-white/[0.08] text-[#f0e6d3] focus:ring-amber-500/30' : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500/40'
                }`}>
                {gradingPeriods.map((p) => (<option key={p.id} value={p.id}>{p.name} ({formatDate(p.start_date)} – {formatDate(p.end_date)})</option>))}
              </select>
            </div>
            <button onClick={handlePrint} className={`no-print px-3 py-2 text-sm rounded-lg border transition-all duration-200 flex items-center gap-1.5 ${
              ts ? 'border-white/[0.08] text-[#9ca3af] hover:bg-white/[0.06]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print
            </button>
          </div>
        )}

        {/* Mobile toggle */}
        <div className="md:hidden mb-4 flex gap-1.5">
          {(['entry', 'summary'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              view === v ? ts ? 'bg-amber-500/90 text-[#0a0a14]' : 'bg-indigo-600 text-white' : ts ? 'border border-white/[0.08] text-[#9ca3af]' : 'border border-slate-200 text-slate-600'
            }`}>{v === 'entry' ? 'Entry' : 'Summary'}</button>
          ))}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5" ref={printRef}>
          <div className={`md:col-span-2 ${view === 'summary' ? 'hidden md:block' : ''}`}>
            <div className="space-y-5">
              <div className={`rounded-xl p-5 border ${ts ? 'ts-glass' : 'bg-white border-slate-200'}`}>
                <h2 className={`text-sm font-medium uppercase tracking-wider mb-4 ${ts ? 'text-amber-400/80' : 'text-slate-400'}`}>New Grade</h2>
                <GradeEntryForm student={student} categories={categories} onGradeAdded={handleGradeAdded} />
              </div>

              <div className={`rounded-xl p-5 border ${ts ? 'ts-glass' : 'bg-white border-slate-200'}`}>
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
            <div className={`rounded-xl p-5 border sticky top-20 print-area ${ts ? 'ts-glass' : 'bg-white border-slate-200'}`}>
              <h2 className={`text-sm font-medium uppercase tracking-wider mb-4 ${ts ? 'text-amber-400/80' : 'text-slate-400'}`}>Report Card</h2>
              {currentPeriod ? (
                <ReportCardSummary grades={gradesInPeriod} categories={categories} periodName={currentPeriod.name} />
              ) : (
                <p className={`text-sm ${ts ? 'text-[#9ca3af]' : 'text-slate-500'}`}>No grading period selected</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
