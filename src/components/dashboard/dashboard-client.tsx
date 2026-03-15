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

export function DashboardClient({ initialStudents, studentStats }: DashboardClientProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { isTaylorSwift } = useTheme();

  const totalGrades = Object.values(studentStats).reduce((sum, s) => sum + s.gradeCount, 0);

  const groupedBySchool = initialStudents.reduce((acc, student) => {
    const schoolName = student.school?.name || 'Unknown School';
    if (!acc[schoolName]) acc[schoolName] = [];
    acc[schoolName].push(student);
    return acc;
  }, {} as Record<string, StudentWithSchool[]>);

  const filteredGroups = Object.entries(groupedBySchool).reduce((acc, [schoolName, students]) => {
    const filtered = students.filter((s) =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schoolName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) acc[schoolName] = filtered;
    return acc;
  }, {} as Record<string, StudentWithSchool[]>);

  const ts = isTaylorSwift;

  return (
    <div className={`min-h-screen ${ts ? 'bg-[#0a0a14]' : 'bg-[#fafafa]'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className={`text-3xl font-semibold tracking-tight ${ts ? 'text-[#f0e6d3]' : 'text-slate-900'}`}>
              Students
            </h1>
            <p className={`text-sm mt-1 ${ts ? 'text-[#9ca3af]' : 'text-slate-500'}`}>
              {initialStudents.length} active · {totalGrades} total grades
            </p>
          </div>
          <Link
            href="/students/new"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              ts
                ? 'bg-amber-500/90 text-[#0a0a14] hover:bg-amber-400'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            Add student
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${ts ? 'text-[#9ca3af]' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                ts
                  ? 'bg-white/[0.04] border-white/[0.08] text-[#f0e6d3] placeholder:text-[#9ca3af]/50 focus:ring-amber-500/30 focus:border-amber-500/30'
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/40 focus:border-indigo-400'
              }`}
            />
          </div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
              showArchived
                ? ts ? 'bg-white/[0.08] border-white/[0.12] text-[#f0e6d3]' : 'bg-slate-100 border-slate-200 text-slate-900'
                : ts ? 'bg-transparent border-white/[0.08] text-[#9ca3af] hover:bg-white/[0.04]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {showArchived ? 'Hide archived' : 'Show archived'}
          </button>
        </div>

        {/* Student list */}
        <div className="space-y-8">
          {Object.entries(filteredGroups).length === 0 ? (
            <div className="text-center py-16">
              <svg className={`w-10 h-10 mx-auto mb-3 ${ts ? 'text-[#9ca3af]/30' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className={`text-sm ${ts ? 'text-[#9ca3af]' : 'text-slate-500'}`}>
                {searchTerm ? 'No students match your search' : 'No students yet'}
              </p>
              {!searchTerm && (
                <Link href="/students/new" className={`text-sm font-medium mt-2 inline-block ${ts ? 'text-amber-400' : 'text-indigo-600'}`}>
                  Add your first student
                </Link>
              )}
            </div>
          ) : (
            Object.entries(filteredGroups).map(([schoolName, students]) => (
              <div key={schoolName}>
                <h2 className={`text-xs font-medium uppercase tracking-wider mb-3 ${
                  ts ? 'text-[#9ca3af]/70' : 'text-slate-400'
                }`}>{schoolName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {students.map((student) => {
                    const stats = studentStats[student.id];
                    return (
                      <Link
                        key={student.id}
                        href={`/students/${student.id}`}
                        className={`block p-5 rounded-xl border transition-all duration-200 ${
                          ts
                            ? 'ts-glass ts-glass-hover'
                            : 'bg-white border-slate-200 hover:shadow-md hover:border-slate-300'
                        }`}
                      >
                        <h3 className={`font-medium mb-3 ${ts ? 'text-[#f0e6d3]' : 'text-slate-900'}`}>
                          {student.first_name} {student.last_name}
                        </h3>
                        <div className={`space-y-1.5 text-sm ${ts ? 'text-[#9ca3af]' : 'text-slate-500'}`}>
                          <div className="flex justify-between">
                            <span>Grades</span>
                            <span className="font-medium">{stats?.gradeCount || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last graded</span>
                            <span className="font-medium">{stats?.lastGradedDate ? formatDate(stats.lastGradedDate) : 'Never'}</span>
                          </div>
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
