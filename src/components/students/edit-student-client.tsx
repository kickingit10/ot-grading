'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { StudentWithSchool, School, GradingPeriod } from '@/lib/types';

interface EditStudentClientProps { student: StudentWithSchool; schools: School[]; gradingPeriods: GradingPeriod[]; }

export function EditStudentClient({ student, schools, gradingPeriods }: EditStudentClientProps) {
  const [firstName, setFirstName] = useState(student.first_name);
  const [lastName, setLastName] = useState(student.last_name);
  const [schoolId, setSchoolId] = useState(student.school_id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPeriodForm, setShowPeriodForm] = useState(false);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [newPeriodStart, setNewPeriodStart] = useState('');
  const [newPeriodEnd, setNewPeriodEnd] = useState('');
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      if (!firstName.trim() || !lastName.trim()) { setError('Enter both names'); setLoading(false); return; }
      const { error: err } = await supabase.from('students').update({ first_name: firstName.trim(), last_name: lastName.trim(), school_id: schoolId }).eq('id', student.id);
      if (err) setError(err.message); else { setSuccess(true); setTimeout(() => setSuccess(false), 2000); }
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  const handleAddPeriod = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      if (!newPeriodName.trim() || !newPeriodStart || !newPeriodEnd) { setError('Fill in all fields'); setLoading(false); return; }
      const { error: err } = await supabase.from('grading_periods').insert({ student_id: student.id, name: newPeriodName.trim(), start_date: newPeriodStart, end_date: newPeriodEnd, is_current: false });
      if (err) setError(err.message); else { setNewPeriodName(''); setNewPeriodStart(''); setNewPeriodEnd(''); setSuccess(true); router.refresh(); setTimeout(() => setSuccess(false), 2000); }
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="section-header">Student Information</div>
        <form onSubmit={handleUpdateStudent} className="space-y-4">
          {error && <div className="alert alert-error text-sm animate-slide-in">{error}</div>}
          {success && <div className="alert alert-success text-sm animate-slide-in">Changes saved</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label" htmlFor="edit-first-name">First name</label><input id="edit-first-name" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="input" /></div>
            <div><label className="label" htmlFor="edit-last-name">Last name</label><input id="edit-last-name" type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="input" /></div>
          </div>
          <div><label className="label" htmlFor="edit-school">School</label>
            <select id="edit-school" value={schoolId} onChange={e => setSchoolId(e.target.value)} className="input">
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Saving...' : 'Save changes'}</button>
        </form>
      </div>

      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 32 }}>
        <div className="section-header">Grading Periods</div>
        {gradingPeriods.length > 0 && (
          <div className="mb-4 space-y-1.5">
            {gradingPeriods.map(p => (
              <div key={p.id} className="flex justify-between items-center text-sm py-2 px-3 rounded-lg" style={{ background: 'var(--color-bg-accent)' }}>
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>{p.name}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{p.start_date} – {p.end_date}{p.is_current && <span className="ml-2 font-medium" style={{ color: 'var(--color-primary)' }}>Current</span>}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => setShowPeriodForm(!showPeriodForm)} className="btn-ghost w-full">{showPeriodForm ? 'Cancel' : 'Add period'}</button>
        {showPeriodForm && (
          <form onSubmit={handleAddPeriod} className="mt-3 p-4 rounded-lg space-y-3" style={{ background: 'var(--color-bg-accent)' }}>
            <div><label className="label" htmlFor="edit-period-name">Period name</label><input id="edit-period-name" type="text" value={newPeriodName} onChange={e => setNewPeriodName(e.target.value)} placeholder="e.g., Spring 2026" className="input" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label" htmlFor="edit-period-start">Start</label><input id="edit-period-start" type="date" value={newPeriodStart} onChange={e => setNewPeriodStart(e.target.value)} className="input" /></div>
              <div><label className="label" htmlFor="edit-period-end">End</label><input id="edit-period-end" type="date" value={newPeriodEnd} onChange={e => setNewPeriodEnd(e.target.value)} className="input" /></div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Adding...' : 'Add period'}</button>
          </form>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 32 }}>
        <div className="section-header" style={{ color: 'var(--color-error)' }}>Danger Zone</div>
        <button onClick={async () => { if (!confirm('Archive this student?')) return; setLoading(true); const { error } = await supabase.from('students').update({ status: 'archived' }).eq('id', student.id); setLoading(false); if (error) setError(error.message); else router.push('/'); }}
          disabled={loading} className="w-full py-2.5 px-4 text-sm font-medium rounded-lg border transition-all duration-200"
          style={{ borderColor: 'rgba(239,68,68,0.3)', color: 'var(--color-error)', background: 'rgba(239,68,68,0.04)' }}>
          Archive student
        </button>
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>Archived students are hidden but their data is preserved.</p>
      </div>
    </div>
  );
}
