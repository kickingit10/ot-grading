'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { DEMO_STUDENTS, DEMO_CATEGORIES, generateDemoGrades } from './mock-data';

export default function DemoDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { isTaylorSwift: ts } = useTheme();

  const allGrades = useMemo(() => generateDemoGrades(), []);

  const studentStats = useMemo(() => {
    const stats: Record<string, { gradeCount: number; lastGradedDate: string | null }> = {};
    for (const s of DEMO_STUDENTS) {
      const sg = allGrades.filter(g => g.student_id === s.id);
      stats[s.id] = {
        gradeCount: sg.length,
        lastGradedDate: sg.length > 0 ? sg.reduce((l, g) => !l || g.graded_at > l ? g.graded_at : l, '' as string) : null,
      };
    }
    return stats;
  }, [allGrades]);

  const totalGrades = allGrades.length;
  const schoolNames = [...new Set(DEMO_STUDENTS.map(s => s.school?.name || 'Unknown'))];
  const groupedBySchool = DEMO_STUDENTS.reduce((acc, s) => {
    const name = s.school?.name || 'Unknown';
    if (!acc[name]) acc[name] = [];
    acc[name].push(s);
    return acc;
  }, {} as Record<string, typeof DEMO_STUDENTS>);

  const filteredGroups = Object.entries(groupedBySchool).reduce((acc, [name, students]) => {
    if (schoolFilter && name !== schoolFilter) return acc;
    const filtered = students.filter(s => `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filtered.length > 0) acc[name] = filtered;
    return acc;
  }, {} as Record<string, typeof DEMO_STUDENTS>);

  const toggleCollapse = (name: string) => setCollapsed(prev => ({ ...prev, [name]: !prev[name] }));

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        {/* Demo banner */}
        <div className="card" style={{ marginBottom: 24, borderLeft: '3px solid var(--color-primary-surface, var(--color-primary))' }}>
          <p style={{ fontSize: 15, color: 'var(--color-text-muted)' }}>
            You&apos;re viewing a demo with sample data.{' '}
            <Link href="/signup" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Sign up free</Link> to start tracking your own students.
          </p>
        </div>

        {/* Title row */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-text)' }}>{ts ? 'The Roster' : 'Students'}</h1>
            <Link href="/signup" className="btn-primary" style={{ fontSize: 15 }}>{ts ? 'New Swiftie ✦' : 'Add student'}</Link>
          </div>
          {ts && <p style={{ fontSize: 13, fontWeight: 400, marginTop: 6, color: 'var(--color-text-muted)' }}>Welcome to the grading era ✨</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-4" style={{ gap: 24, marginBottom: 32 }}>
          {[
            { label: ts ? 'Swifties' : 'Students', value: DEMO_STUDENTS.length },
            { label: ts ? 'Eras Graded' : 'Total grades', value: totalGrades },
            { label: ts ? 'Active Swifties' : 'Active this week', value: 4 },
            { label: ts ? 'Last Encore' : 'Last active', value: 'Today' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ fontSize: 20, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'var(--color-text)' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* School filter */}
        <div className="flex flex-wrap" style={{ gap: 12, marginBottom: 24 }}>
          <button onClick={() => setSchoolFilter(null)} className={`chip ${!schoolFilter ? 'chip-active' : ''}`}>All ({DEMO_STUDENTS.length})</button>
          {schoolNames.map(name => (
            <button key={name} onClick={() => setSchoolFilter(schoolFilter === name ? null : name)}
              className={`chip ${schoolFilter === name ? 'chip-active' : ''}`}>{name} ({groupedBySchool[name]?.length})</button>
          ))}
        </div>

        {/* Search */}
        <div className="flex" style={{ gap: 16, marginBottom: 32 }}>
          <input type="text" placeholder={ts ? 'Find your Swiftie...' : 'Search students...'} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="input" style={{ paddingLeft: 16 }} />
        </div>

        {/* Student list */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 32 }}>
          {Object.entries(filteredGroups).map(([schoolName, students]) => (
            <div key={schoolName}>
              <button onClick={() => toggleCollapse(schoolName)} className="section-header" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'none', padding: 0 }}>
                <svg style={{ width: 12, height: 12, transition: 'transform 0.2s', transform: collapsed[schoolName] ? 'rotate(0deg)' : 'rotate(90deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {schoolName} ({students.length})
              </button>
              {!collapsed[schoolName] && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
                  {students.map(student => {
                    const stats = studentStats[student.id];
                    return (
                      <Link key={student.id} href={`/demo/${student.id}`} className="card-sm block">
                        <h3 style={{ fontWeight: 500, marginBottom: 8, color: 'var(--color-text)' }}>{student.first_name} {student.last_name}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8, fontSize: 15, color: 'var(--color-text-muted)' }}>
                          <div className="flex justify-between"><span>Grades</span><span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{stats?.gradeCount || 0}</span></div>
                          <div className="flex justify-between"><span>Last graded</span><span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{stats?.lastGradedDate ? formatDate(stats.lastGradedDate) : 'Never'}</span></div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center" style={{ paddingTop: 48, paddingBottom: 24, fontSize: 13, color: 'var(--color-text-muted)' }}>
          Demo data — <Link href="/signup" style={{ fontWeight: 500, color: 'var(--color-primary)' }}>Sign up</Link> to track your own students
        </div>
      </div>
    </div>
  );
}
