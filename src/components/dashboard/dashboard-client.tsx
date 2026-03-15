'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StudentWithSchool } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useTheme } from '@/lib/theme';

interface StudentStats {
  gradeCount: number;
  lastGradedDate: string | null;
}

interface DashboardClientProps {
  initialStudents: StudentWithSchool[];
  studentStats: Record<string, StudentStats>;
}

export function DashboardClient({
  initialStudents,
  studentStats,
}: DashboardClientProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { isTaylorSwift } = useTheme();

  // Group students by school
  const groupedBySchool = initialStudents.reduce(
    (acc, student) => {
      const schoolName = student.school?.name || 'Unknown School';
      if (!acc[schoolName]) {
        acc[schoolName] = [];
      }
      acc[schoolName].push(student);
      return acc;
    },
    {} as Record<string, StudentWithSchool[]>
  );

  // Filter by search term
  const filteredGroups = Object.entries(groupedBySchool).reduce(
    (acc, [schoolName, students]) => {
      const filtered = students.filter(
        (s) =>
          `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          schoolName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[schoolName] = filtered;
      }
      return acc;
    },
    {} as Record<string, StudentWithSchool[]>
  );

  return (
    <div className={`min-h-screen ${
      isTaylorSwift
        ? 'bg-gradient-to-br from-[#1a1a2e] via-[#0d0d1a] to-[#2a1a3e]'
        : 'bg-gradient-to-br from-purple-50 via-white to-purple-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${
              isTaylorSwift ? 'text-[#f0e6d3]' : 'text-gray-900'
            }`}>
              {isTaylorSwift ? 'Your Students ⭐' : 'Your Students'}
            </h1>
            <p className={isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-600'}>
              {initialStudents.length} active student{initialStudents.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/students/new"
            className={`px-6 py-3 font-semibold rounded-lg transition-all shadow-md hover:shadow-lg ${
              isTaylorSwift
                ? 'bg-gradient-to-r from-[#d4af37] to-[#f4c2c2] text-[#1a1a2e] hover:from-[#e6c84d] hover:to-[#f8d4d4]'
                : 'bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600'
            }`}
          >
            ➕ Add Student
          </Link>
        </div>

        {/* Search and filter */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="Search students or schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
              isTaylorSwift
                ? 'bg-[#1a1a2e] border-[#2e2e4a] text-[#f0e6d3] placeholder-[#b0a090]/50 focus:ring-[#d4af37]'
                : 'border-gray-300 focus:ring-purple-500'
            }`}
          />
          <div className="flex gap-4">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                showArchived
                  ? isTaylorSwift
                    ? 'bg-[#2a1a3e] text-[#f0e6d3]'
                    : 'bg-gray-200 text-gray-900'
                  : isTaylorSwift
                    ? 'bg-[#1a1a2e] border border-[#2e2e4a] text-[#b0a090] hover:bg-[#2a1a3e]'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {showArchived ? '📦 Hide Archived' : '📦 Show Archived'}
            </button>
          </div>
        </div>

        {/* Students by school */}
        <div className="space-y-8">
          {Object.entries(filteredGroups).length === 0 ? (
            <div className="text-center py-12">
              <p className={`text-lg mb-4 ${isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-600'}`}>
                {searchTerm
                  ? 'No students match your search'
                  : isTaylorSwift
                    ? "No students yet — let's begin this era! ✨"
                    : "No students yet — let's get started! ✨"
                }
              </p>
              {!searchTerm && (
                <Link
                  href="/students/new"
                  className={`font-semibold ${
                    isTaylorSwift ? 'text-[#d4af37] hover:text-[#e6c84d]' : 'text-purple-600 hover:text-purple-700'
                  }`}
                >
                  Add your first student →
                </Link>
              )}
            </div>
          ) : (
            Object.entries(filteredGroups).map(([schoolName, students]) => (
              <div key={schoolName}>
                <h2 className={`text-xl font-bold mb-4 ${
                  isTaylorSwift ? 'text-[#f0e6d3]' : 'text-gray-900'
                }`}>🏫 {schoolName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map((student) => {
                    const stats = studentStats[student.id];
                    return (
                      <Link
                        key={student.id}
                        href={`/students/${student.id}`}
                        className={`block p-6 rounded-xl border transition-all hover:scale-105 ${
                          isTaylorSwift
                            ? 'bg-[#1a1a2e] border-[#2e2e4a] hover:border-[#d4af37]/50 hover:shadow-lg hover:shadow-[#d4af37]/10'
                            : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-lg'
                        }`}
                      >
                        <h3 className={`text-lg font-bold mb-2 ${
                          isTaylorSwift ? 'text-[#f0e6d3]' : 'text-gray-900'
                        }`}>
                          {student.first_name} {student.last_name}
                        </h3>
                        <div className={`space-y-2 text-sm ${
                          isTaylorSwift ? 'text-[#b0a090]' : 'text-gray-600'
                        }`}>
                          <div className="flex justify-between">
                            <span>{isTaylorSwift ? '⭐' : '📝'} Grades entered:</span>
                            <span className="font-semibold">{stats?.gradeCount || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>📅 Last graded:</span>
                            <span className="font-semibold">
                              {stats?.lastGradedDate ? formatDate(stats.lastGradedDate) : 'Never'}
                            </span>
                          </div>
                        </div>
                        <div className={`mt-4 pt-4 border-t ${
                          isTaylorSwift ? 'border-[#2e2e4a]' : 'border-gray-200'
                        }`}>
                          <span className={`text-sm font-semibold ${
                            isTaylorSwift ? 'text-[#d4af37]' : 'text-purple-600'
                          }`}>
                            Click to enter grades →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
