'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { School } from '@/lib/types';
import { formatDateInputValue } from '@/lib/utils';

interface AddStudentFormProps { schools: School[]; userId: string; }

export function AddStudentForm({ schools, userId }: AddStudentFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [startDate, setStartDate] = useState(formatDateInputValue(new Date().toISOString()));
  const [endDate, setEndDate] = useState(formatDateInputValue(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      if (!firstName.trim() || !lastName.trim()) { setError('Enter both names'); setLoading(false); return; }
      let finalSchoolId = schoolId;
      if (!schoolId && newSchoolName.trim()) {
        const { data, error: err } = await supabase.from('schools').insert({ name: newSchoolName.trim() }).select().single();
        if (err) { setError(err.message); setLoading(false); return; }
        finalSchoolId = data.id;
      }
      if (!finalSchoolId) { setError('Select or create a school'); setLoading(false); return; }
      const { data: student, error: err } = await supabase.from('students').insert({ first_name: firstName.trim(), last_name: lastName.trim(), school_id: finalSchoolId, therapist_id: userId, status: 'active' }).select().single();
      if (err) { setError(err.message); setLoading(false); return; }
      await supabase.from('grading_periods').insert({ student_id: student.id, name: 'Initial Period', start_date: startDate, end_date: endDate, is_current: true });
      router.push(`/students/${student.id}`);
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="alert alert-error mb-4 text-sm animate-slide-in">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label" htmlFor="student-first-name">First name</label><input id="student-first-name" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Emma" required className="input" /></div>
        <div><label className="label" htmlFor="student-last-name">Last name</label><input id="student-last-name" type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith" required className="input" /></div>
      </div>
      <div><label className="label" htmlFor="student-school">School</label>
        <select id="student-school" value={schoolId} onChange={e => { setSchoolId(e.target.value); setNewSchoolName(''); }} className="input">
          <option value="">Select a school...</option>
          {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="text" value={newSchoolName} onChange={e => { setNewSchoolName(e.target.value); if (e.target.value.trim()) setSchoolId(''); }} placeholder="or create new school..." className="input mt-2" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label" htmlFor="student-period-start">Period start</label><input id="student-period-start" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="input" /></div>
        <div><label className="label" htmlFor="student-period-end">Period end</label><input id="student-period-end" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="input" /></div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating...' : 'Create student'}</button>
    </form>
  );
}
