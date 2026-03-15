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

export function StudentDetailClient({
  student,
  categories,
  initialGrades,
  gradingPeriods,
}: StudentDetailClientProps) {
  const [grades, setGrades] = useState<Grade[]>(initialGrades);
  const [selectedPeriod, setSelectedPeriod] = useState<GradingPeriod | null>(
    gradingPeriods.find((p) => p.is_current) || gradingPeriods[0] || null
  );
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [view, setView] = useState<'split' | 'entry' | 'summary'>('split');
  const { isTaylorSwift } = useTheme();

  const currentPeriod = selectedPeriod;

  // Filter grades by current period
  const gradesInPeriod = currentPeriod
    ? grades.filter((g) => isDateInRange(g.graded_at, currentPeriod.start_date, currentPeriod.end_date))
    : grades;

  const handleGradeAdded = useCallback((newGrade: Grade) => {
    setGrades((prev) => [newGrade, ...prev]);
  }, []);

  const handleGradeUpdated = useCallback((updatedGrade: Grade) => {
    setGrades((prev) =>
      prev.map((g) => (g.id === updatedGrade.id ? updatedGrade : g))
    );
    setEditingGradeId(null);
  }, []);

  const handleGradeDeleted = useCallback((gradeId: string) => {
    setGrades((prev) => prev.filter((g) => g.id !== gradeId));
  }, []);

  return (
    <div className={`min-h-screen ${
      isTaylorSwift
        ? 'bg-gradient-to-br from-[#1a1a2e] via-[#0d0d1a] to-[#2a1a3e]'
        : 'bg-gradient-to-br from-purple-50 via-white to-purple-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className={`font-semibold mb-4 inline-block ${
            isTaylorSwift
              ? 'text-[#d4af37] hover:text-[#e6c84d]'
              : 'text-purple-600 hover:text-purple-700'
          }`}>
            ← Back to dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className={`text-4xl font-bold ${
                isTaylorSwift ? 'text-[#f0e6d3]' : 'text-gray-900'
              }`}>
                {student.first_name} {student.last_name}
              </h1>
              <p className={`mt-2 ${isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-600'}`}>
                🏫 {student.school?.name || 'Unknown School'}
              </p>
            </div>
            <Link
              href={`/students/${student.id}/edit`}
              className={`px-4 py-2 font-semibold rounded-lg transition-all ${
                isTaylorSwift
                  ? 'bg-[#2a1a3e] text-[#f0e6d3] hover:bg-[#3a2a4e]'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              ⚙️ Edit
            </Link>
          </div>
        </div>

        {/* Grading Period Selector */}
        {gradingPeriods.length > 0 && (
          <div className={`mb-8 rounded-lg shadow-sm p-4 border ${
            isTaylorSwift
              ? 'bg-[#1a1a2e] border-[#2e2e4a]'
              : 'bg-white border-gray-200'
          }`}>
            <label className={`block text-sm font-medium mb-3 ${
              isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-700'
            }`}>
              📅 Grading Period
            </label>
            <select
              value={selectedPeriod?.id || ''}
              onChange={(e) => {
                const period = gradingPeriods.find((p) => p.id === e.target.value);
                setSelectedPeriod(period || null);
              }}
              className={`w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                isTaylorSwift
                  ? 'bg-[#2a1a3e] border-[#4a0e4e] text-[#f0e6d3] focus:ring-[#d4af37]'
                  : 'border-gray-300 focus:ring-purple-500'
              }`}
            >
              {gradingPeriods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name} ({formatDate(period.start_date)} - {formatDate(period.end_date)})
                </option>
              ))}
            </select>
            <p className={`text-sm mt-2 ${isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-500'}`}>
              Selected: {currentPeriod && formatDate(currentPeriod.start_date)} to {currentPeriod && formatDate(currentPeriod.end_date)}
            </p>
          </div>
        )}

        {/* View Toggle (Mobile) */}
        <div className="md:hidden mb-6 flex gap-2">
          <button
            onClick={() => setView('entry')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              view === 'entry'
                ? isTaylorSwift
                  ? 'bg-[#d4af37] text-[#1a1a2e]'
                  : 'bg-purple-600 text-white'
                : isTaylorSwift
                  ? 'bg-[#1a1a2e] border border-[#2e2e4a] text-[#b0a090]'
                  : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            📝 Entry
          </button>
          <button
            onClick={() => setView('summary')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              view === 'summary'
                ? isTaylorSwift
                  ? 'bg-[#d4af37] text-[#1a1a2e]'
                  : 'bg-purple-600 text-white'
                : isTaylorSwift
                  ? 'bg-[#1a1a2e] border border-[#2e2e4a] text-[#b0a090]'
                  : 'bg-white border border-gray-300 text-gray-700'
            }`}
          >
            📊 Summary
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Grade Entry & Log */}
          <div className={`md:col-span-2 ${view === 'summary' ? 'hidden md:block' : ''}`}>
            <div className="space-y-6">
              {/* Grade Entry Form */}
              <div className={`rounded-xl shadow-lg p-6 border ${
                isTaylorSwift
                  ? 'bg-[#1a1a2e] border-[#d4af37]/30'
                  : 'bg-white border-purple-100'
              }`}>
                <h2 className={`text-xl font-bold mb-4 ${
                  isTaylorSwift ? 'text-[#d4af37]' : 'text-gray-900'
                }`}>
                  {isTaylorSwift ? '⭐ Enter Grade' : '📝 Enter Grade'}
                </h2>
                <GradeEntryForm
                  student={student}
                  categories={categories}
                  onGradeAdded={handleGradeAdded}
                />
              </div>

              {/* Grades Log */}
              <div className={`rounded-xl shadow-lg p-6 border ${
                isTaylorSwift
                  ? 'bg-[#1a1a2e] border-[#2e2e4a]'
                  : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold mb-4 ${
                  isTaylorSwift ? 'text-[#f0e6d3]' : 'text-gray-900'
                }`}>
                  📋 All Grades ({gradesInPeriod.length})
                </h2>
                <GradesList
                  grades={gradesInPeriod}
                  categories={categories}
                  editingGradeId={editingGradeId}
                  onEditStart={setEditingGradeId}
                  onGradeUpdated={handleGradeUpdated}
                  onGradeDeleted={handleGradeDeleted}
                  studentId={student.id}
                />
              </div>
            </div>
          </div>

          {/* Right: Report Card Summary */}
          <div className={`md:col-span-1 ${view === 'entry' ? 'hidden md:block' : ''}`}>
            <div className={`rounded-xl shadow-lg p-6 border sticky top-24 ${
              isTaylorSwift
                ? 'bg-[#1a1a2e] border-[#d4af37]/30'
                : 'bg-white border-purple-100'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${
                isTaylorSwift ? 'text-[#d4af37]' : 'text-gray-900'
              }`}>
                {isTaylorSwift ? '⭐ Report Card' : '📊 Report Card'}
              </h2>
              {currentPeriod ? (
                <ReportCardSummary
                  grades={gradesInPeriod}
                  categories={categories}
                  periodName={currentPeriod.name}
                />
              ) : (
                <p className={`text-sm ${isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-600'}`}>
                  No grading period selected
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
