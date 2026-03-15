'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StudentWithSchool } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useTheme, type EraName } from '@/lib/theme';

interface StudentStats { gradeCount: number; lastGradedDate: string | null; }
interface DashboardClientProps { initialStudents: StudentWithSchool[]; studentStats: Record<string, StudentStats>; }

const DISMISS_KEY = 'ot-tracker-welcome-dismissed';

const ERAS: { id: EraName; label: string; accentColor: string }[] = [
  { id: 'fearless', label: 'Fearless', accentColor: '#CBA863' },
  { id: 'speakNow', label: 'Speak Now', accentColor: '#833C63' },
  { id: 'red', label: 'Red', accentColor: '#A91E47' },
  { id: '1989', label: '1989', accentColor: '#659BBB' },
  { id: 'reputation', label: 'reputation', accentColor: '#515151' },
  { id: 'lover', label: 'Lover', accentColor: '#C9A84C' },
  { id: 'folklore', label: 'folklore', accentColor: '#949494' },
  { id: 'evermore', label: 'evermore', accentColor: '#D37F55' },
  { id: 'midnights', label: 'Midnights', accentColor: '#5A658B' },
  { id: 'torturedPoets', label: 'TTPD', accentColor: '#635B3A' },
];

export function DashboardClient({ initialStudents, studentStats }: DashboardClientProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showWelcome, setShowWelcome] = useState(false);
  const { isTaylorSwift: ts, era, setEra } = useTheme();

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
    { label: ts ? 'Swifties' : 'Students', value: initialStudents.length, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: ts ? 'Eras Graded' : 'Total grades', value: totalGrades, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: ts ? "Active Swifties" : 'Active this week', value: gradesThisWeek, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: ts ? 'Last Encore' : 'Last active', value: lastActive ? formatDate(lastActive) : '—', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        {showWelcome && (
          <div className="flex items-center justify-between animate-slide-in"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderStyle: 'solid', borderLeft: '3px solid var(--color-primary-surface, var(--color-primary))', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
            <p className="text-sm" style={{ color: 'var(--color-primary)' }}>
              {ts ? "It's me, hi, I'm the grader, it's me! ✨ " : 'Welcome! '}New to OT Tracker?{' '}
              <Link href="/guide" className="font-medium underline underline-offset-2">See the quick start guide →</Link>
            </p>
            <button onClick={dismissWelcome} className="btn-ghost text-xs">Dismiss</button>
          </div>
        )}

        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>{ts ? 'The Roster' : 'Students'}</h1>
              {ts && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Welcome to the grading era ✨</p>}
            </div>
            {ts && (
              <select value={era} onChange={e => setEra(e.target.value as EraName)}
                className="input" style={{ width: 'auto', minWidth: 150, fontSize: 14 }}>
                {ERAS.map(e => (<option key={e.id} value={e.id}>{e.label}</option>))}
              </select>
            )}
          </div>
          <Link href="/students/new" className="btn-primary text-sm">{ts ? 'New Swiftie ✦' : 'Add student'}</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-4" style={{ gap: 16, marginBottom: 32 }}>
          {statCards.map(s => (
            <div key={s.label} className="stat-card">
              <div className="text-xl font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>{s.value}</div>
              <div className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                <svg className="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} /></svg>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* School filter chips */}
        <div className="flex flex-wrap" style={{ gap: 12, marginBottom: 24 }}>
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
        <div className="flex" style={{ gap: 16, marginBottom: 32 }}>
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" aria-hidden="true" style={{ color: 'var(--color-text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder={ts ? 'Find your Swiftie...' : 'Search students...'} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="input" style={{ paddingLeft: 36 }} />
          </div>
          <button onClick={() => setShowArchived(!showArchived)}
            className="btn-ghost text-sm"
            style={showArchived ? { background: 'var(--color-bg-accent)' } : {}}>
            {showArchived ? 'Hide archived' : 'Show archived'}
          </button>
        </div>

        {/* Student list */}
        <div className="space-y-6">
          {Object.entries(filteredGroups).length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-10 h-10 mx-auto mb-3" aria-hidden="true" style={{ color: 'var(--color-border)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <svg className={`w-3 h-3 transition-transform duration-200 ${collapsed[schoolName] ? '' : 'rotate-90'}`} aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {schoolName} ({students.length})
                </button>
                {!collapsed[schoolName] && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
                    {students.map(student => {
                      const stats = studentStats[student.id];
                      return (
                        <Link key={student.id} href={`/students/${student.id}`}
                          className="card-sm block">
                          <h3 className="font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                            {student.first_name} {student.last_name}
                            {ts && stats?.gradeCount === 13 && <span className="ts-bracelet-tag" style={{ fontSize: 9, marginLeft: 6 }}>13 ✨</span>}
                          </h3>
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

        {/* Footer */}
        {ts ? (
          <div className="text-center pt-12 pb-6" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            <span>Made with 🌙 for Kyleigh</span>
            <br />
            <span className="ts-bracelet-tag" style={{ display: 'inline-block', marginTop: 6 }}>LONG LIVE THE GRADES</span>
          </div>
        ) : (
          <div className="text-center pt-12 pb-6" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            Made with 💜 for Kyleigh
          </div>
        )}
      </div>
    </div>
  );
}
