'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { StudentWithSchool, School, GradingPeriod } from '@/lib/types';

const inputClass = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all duration-200';
const labelClass = 'block text-sm font-light text-slate-500 mb-1.5';

interface EditStudentClientProps { student: StudentWithSchool; schools: School[]; gradingPeriods: GradingPeriod[]; }

export function EditStudentClient({ student, schools, gradingPeriods }: EditStudentClientProps) {
  const [firstName, setFirstName] = useState(student.first_name);
  const [lastName, setLastName] = useState(student.last_name);
  const [schoolId, setSchoolId] = useState(student.school_id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showGradingPeriods, setShowGradingPeriods] = useState(false);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [newPeriodStart, setNewPeriodStart] = useState('');
  const [newPeriodEnd, setNewPeriodEnd] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      if (!firstName.trim() || !lastName.trim()) { setError('Enter both names'); setLoading(false); return; }
      const { error: err } = await supabase.from('students').update({ first_name: firstName.trim(), last_name: lastName.trim(), school_id: schoolId }).eq('id', student.id);
      if (err) setError(err.message);
      else { setSuccess(true); setTimeout(() => setSuccess(false), 2000); }
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  const handleAddGradingPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      if (!newPeriodName.trim() || !newPeriodStart || !newPeriodEnd) { setError('Fill in all period fields'); setLoading(false); return; }
      const { error: err } = await supabase.from('grading_periods').insert({
        student_id: student.id, name: newPeriodName.trim(),
        start_date: new Date(newPeriodStart).toISOString().split('T')[0],
        end_date: new Date(newPeriodEnd).toISOString().split('T')[0],
        is_current: false,
      });
      if (err) setError(err.message);
      else { setNewPeriodName(''); setNewPeriodStart(''); setNewPeriodEnd(''); setSuccess(true); router.refresh(); setTimeout(() => setSuccess(false), 2000); }
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  const handleArchiveStudent = async () => {
    if (!confirm('Archive this student? They will be hidden from your main list.')) return;
    setLoading(true);
    try {
      const { error: err } = await supabase.from('students').update({ status: 'archived' }).eq('id', student.id);
      if (err) setError(err.message);
      else router.push('/');
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-4">Student information</h2>
        <form onSubmit={handleUpdateStudent} className="space-y-4">
          {error && <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 animate-slide-in">{error}</div>}
          {success && <div className="px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-600 animate-slide-in">Changes saved</div>}

          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>First name</label><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Last name</label><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} /></div>
          </div>
          <div><label className={labelClass}>School</label>
            <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} className={inputClass}>
              {schools.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200">
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="border-t border-slate-200 pt-8">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Grading periods</h2>
        {gradingPeriods.length > 0 && (
          <div className="mb-4 space-y-1.5">
            {gradingPeriods.map((p) => (
              <div key={p.id} className="flex justify-between items-center text-sm py-2 px-3 rounded-lg bg-slate-50">
                <span className="font-medium text-slate-700">{p.name}</span>
                <span className="text-slate-400 text-xs">{p.start_date} – {p.end_date}{p.is_current && <span className="ml-2 text-indigo-600 font-medium">Current</span>}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => setShowGradingPeriods(!showGradingPeriods)}
          className="w-full py-2 px-4 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-200">
          {showGradingPeriods ? 'Cancel' : 'Add period'}
        </button>
        {showGradingPeriods && (
          <form onSubmit={handleAddGradingPeriod} className="mt-3 p-4 bg-slate-50 rounded-lg space-y-3">
            <div><label className={labelClass}>Period name</label><input type="text" value={newPeriodName} onChange={(e) => setNewPeriodName(e.target.value)} placeholder="e.g., Spring 2026" className={inputClass} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelClass}>Start</label><input type="date" value={newPeriodStart} onChange={(e) => setNewPeriodStart(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>End</label><input type="date" value={newPeriodEnd} onChange={(e) => setNewPeriodEnd(e.target.value)} className={inputClass} /></div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200">
              {loading ? 'Adding...' : 'Add period'}
            </button>
          </form>
        )}
      </div>

      <div className="border-t border-slate-200 pt-8">
        <h2 className="text-base font-semibold text-red-600 mb-3">Danger zone</h2>
        <button onClick={handleArchiveStudent} disabled={loading}
          className="w-full py-2.5 px-4 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-100 disabled:opacity-50 transition-all duration-200">
          Archive student
        </button>
        <p className="text-xs text-slate-400 mt-2">Archived students are hidden but their data is preserved.</p>
      </div>
    </div>
  );
}
