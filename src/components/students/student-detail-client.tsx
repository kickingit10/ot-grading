'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { StudentWithSchool, Category, Grade, GradingPeriod } from '@/lib/types';
import { formatDate, isDateInRange } from '@/lib/utils';
import { GradeEntryForm } from './grade-entry-form';
import { GradesList } from './grades-list';
import { ReportCardSummary } from './report-card-summary';
import { useTheme } from '@/lib/theme';

interface StudentDetailClientProps {
  student: StudentWithSchool;
  categories: Category[];
  initialGrades: Grade[];
  gradingPeriods: GradingPeriod[];
}

export function StudentDetailClient({ student, categories, initialGrades, gradingPeriods }: StudentDetailClientProps) {
  const [grades, setGrades] = useState<Grade[]>(initialGrades);
  const [selectedPeriod, setSelectedPeriod] = useState<GradingPeriod | null>(
    gradingPeriods.find((p) => p.is_current) || gradingPeriods[0] || null
  );
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [view, setView] = useState<'split' | 'entry' | 'summary'>('split');
  const { isTaylorSwift: ts } = useTheme();

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

  return (
    <div className={`min-h-screen ${ts ? 'bg-[#0a0a14]' : 'bg-[#fafafa]'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className={`text-sm mb-3 inline-flex items-center gap-1 transition-colors ${
            ts ? 'text-amber-400/80 hover:text-amber-400' : 'text-slate-500 hover:text-slate-700'
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className={`text-3xl font-semibold tracking-tight ${ts ? 'text-[#f0e6d3]' : 'text-slate-900'}`}>
                {student.first_name} {student.last_name}
              </h1>
              <p className={`text-sm mt-0.5 ${ts ? 'text-[#9ca3af]' : 'text-slate-500'}`}>
                {student.school?.name || 'Unknown School'}
              </p>
            </div>
            <Link href={`/students/${student.id}/edit`}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-all duration-200 ${
                ts ? 'border-white/[0.08] text-[#9ca3af] hover:bg-white/[0.06]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              Settings
            </Link>
          </div>
        </div>

        {/* Period selector */}
        {gradingPeriods.length > 0 && (
          <div className={`mb-6 rounded-xl p-4 border ${
            ts ? 'ts-glass' : 'bg-white border-slate-200'
          }`}>
            <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${ts ? 'text-[#9ca3af]/70' : 'text-slate-400'}`}>
              Grading Period
            </label>
            <select value={selectedPeriod?.id || ''} onChange={(e) => {
              setSelectedPeriod(gradingPeriods.find((p) => p.id === e.target.value) || null);
            }} className={`w-full max-w-md px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
              ts
                ? 'bg-white/[0.04] border-white/[0.08] text-[#f0e6d3] focus:ring-amber-500/30'
                : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500/40'
            }`}>
              {gradingPeriods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name} ({formatDate(period.start_date)} – {formatDate(period.end_date)})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Mobile toggle */}
        <div className="md:hidden mb-4 flex gap-1.5">
          {(['entry', 'summary'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                view === v
                  ? ts ? 'bg-amber-500/90 text-[#0a0a14]' : 'bg-indigo-600 text-white'
                  : ts ? 'border border-white/[0.08] text-[#9ca3af]' : 'border border-slate-200 text-slate-600'
              }`}>
              {v === 'entry' ? 'Entry' : 'Summary'}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className={`md:col-span-2 ${view === 'summary' ? 'hidden md:block' : ''}`}>
            <div className="space-y-5">
              <div className={`rounded-xl p-5 border ${ts ? 'ts-glass' : 'bg-white border-slate-200'}`}>
                <h2 className={`text-sm font-medium uppercase tracking-wider mb-4 ${ts ? 'text-amber-400/80' : 'text-slate-400'}`}>
                  New Grade
                </h2>
                <GradeEntryForm student={student} categories={categories} onGradeAdded={handleGradeAdded} />
              </div>

              <div className={`rounded-xl p-5 border ${ts ? 'ts-glass' : 'bg-white border-slate-200'}`}>
                <h2 className={`text-sm font-medium uppercase tracking-wider mb-4 ${ts ? 'text-[#9ca3af]/70' : 'text-slate-400'}`}>
                  Grades ({gradesInPeriod.length})
                </h2>
                <GradesList grades={gradesInPeriod} categories={categories} editingGradeId={editingGradeId}
                  onEditStart={setEditingGradeId} onGradeUpdated={handleGradeUpdated}
                  onGradeDeleted={handleGradeDeleted} studentId={student.id} />
              </div>
            </div>
          </div>

          <div className={`md:col-span-1 ${view === 'entry' ? 'hidden md:block' : ''}`}>
            <div className={`rounded-xl p-5 border sticky top-20 ${ts ? 'ts-glass' : 'bg-white border-slate-200'}`}>
              <h2 className={`text-sm font-medium uppercase tracking-wider mb-4 ${ts ? 'text-amber-400/80' : 'text-slate-400'}`}>
                Report Card
              </h2>
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
