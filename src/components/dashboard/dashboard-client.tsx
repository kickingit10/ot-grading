'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StudentWithSchool } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface StudentStats { gradeCount: number; lastGradedDate: string | null; }
interface DashboardClientProps { initialStudents: StudentWithSchool[]; studentStats: Record<string, StudentStats>; }

const DISMISS_KEY = 'ot-tracker-welcome-dismissed';

export function DashboardClient({ initialStudents, studentStats }: DashboardClientProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => { if (!localStorage.getItem(DISMISS_KEY)) setShowWelcome(true); }, []);

  const totalGrades = Object.values(studentStats).reduce((sum, s) => sum + s.gradeCount, 0);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const gradesThisWeek = Object.values(studentStats).filter(s => s.lastGradedDate && new Date(s.lastGradedDate) >= weekAgo).length;
  const lastActive = Object.values(studentStats).reduce((latest, s) => {
    if (s.lastGradedDate && (!latest || new Date(s.lastGradedDate) > new Date(latest))) return s.lastGradedDate;
    return latest;
  }, null as string | null);

  const schoolNames = [...new Set(initialStudents.map(s => s.school?.name || 'Unknown'))];
  const groupedBySchool = initialStudents.reduce((acc, student) => {
    const name = student.school?.name || 'Unknown';
    if (!acc[name]) acc[name] = [];
    acc[name].push(student);
    return acc;
  }, {} as Record<string, StudentWithSchool[]>);

  const filteredGroups = Object.entries(groupedBySchool).reduce((acc, [name, students]) => {
    if (schoolFilter && name !== schoolFilter) return acc;
    const filtered = students.filter(s => `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filtered.length > 0) acc[name] = filtered;
    return acc;
  }, {} as Record<string, StudentWithSchool[]>);

  const toggleCollapse = (name: string) => setCollapsed(prev => ({ ...prev, [name]: !prev[name] }));
  const dismissWelcome = () => { setShowWelcome(false); localStorage.setItem(DISMISS_KEY, '1'); };

  const statCards = [
    { label: 'Students', value: initialStudents.length },
    { label: 'Total grades', value: totalGrades },
    { label: 'Graded this week', value: gradesThisWeek },
    { label: 'Last active', value: lastActive ? formatDate(lastActive) : '—' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
        {showWelcome && (
          <div className="card mb-6 flex items-center justify-between animate-slide-in"
            style={{ borderLeft: '3px solid var(--color-primary)' }}>
            <p className="text-sm" style={{ color: 'var(--color-primary)' }}>
              Welcome! New to OT Tracker?{' '}
              <Link href="/guide" className="font-medium underline underline-offset-2">See the quick start guide →</Link>
            </p>
            <button onClick={dismissWelcome} className="btn-ghost text-xs">Dismiss</button>
          </div>
        )}

        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>Students</h1>
          <Link href="/students/new" className="btn-primary text-sm">Add student</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {statCards.map(s => (
            <div key={s.label} className="stat-card">
              <div className="text-xl font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>{s.value}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* School filter chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => setSchoolFilter(null)}
            className={`chip ${!schoolFilter ? 'chip-active' : ''}`}>
            All ({initialStudents.length})
          </button>
          {schoolNames.map(name => {
            const count = groupedBySchool[name]?.length || 0;
            const active = schoolFilter === name;
            return (
              <button key={name} onClick={() => setSchoolFilter(active ? null : name)}
                className={`chip ${active ? 'chip-active' : ''}`}>
                {name} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search students..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="input" style={{ paddingLeft: 36 }} />
          </div>
          <button onClick={() => setShowArchived(!showArchived)}
            className="btn-ghost text-sm"
            style={showArchived ? { background: 'var(--color-bg-accent)' } : {}}>
            {showArchived ? 'Hide archived' : 'Show archived'}
          </button>
        </div>

        {/* Student list */}
        <div className="space-y-8">
          {Object.entries(filteredGroups).length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-border)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{searchTerm ? 'No students match your search' : 'No students yet'}</p>
              {!searchTerm && <Link href="/students/new" className="text-sm font-medium mt-2 inline-block" style={{ color: 'var(--color-primary)' }}>Add your first student</Link>}
            </div>
          ) : (
            Object.entries(filteredGroups).map(([schoolName, students]) => (
              <div key={schoolName}>
                <button onClick={() => toggleCollapse(schoolName)}
                  className="section-header flex items-center gap-2 cursor-pointer mb-4">
                  <svg className={`w-3 h-3 transition-transform duration-200 ${collapsed[schoolName] ? '' : 'rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {schoolName} ({students.length})
                </button>
                {!collapsed[schoolName] && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                    {students.map(student => {
                      const stats = studentStats[student.id];
                      return (
                        <Link key={student.id} href={`/students/${student.id}`}
                          className="card-sm block">
                          <h3 className="font-medium mb-3" style={{ color: 'var(--color-text)' }}>{student.first_name} {student.last_name}</h3>
                          <div className="space-y-1.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            <div className="flex justify-between"><span>Grades</span><span className="font-medium" style={{ color: 'var(--color-text)' }}>{stats?.gradeCount || 0}</span></div>
                            <div className="flex justify-between"><span>Last graded</span><span className="font-medium" style={{ color: 'var(--color-text)' }}>{stats?.lastGradedDate ? formatDate(stats.lastGradedDate) : 'Never'}</span></div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
