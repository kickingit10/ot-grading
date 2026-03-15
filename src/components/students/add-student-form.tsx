'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { School } from '@/lib/types';
import { formatDateInputValue } from '@/lib/utils';

const inputClass = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all duration-200';
const labelClass = 'block text-sm font-light text-slate-500 mb-1.5';

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
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!firstName.trim() || !lastName.trim()) { setError('Enter both first and last name'); setLoading(false); return; }
      let finalSchoolId = schoolId;
      if (!schoolId && newSchoolName.trim()) {
        const { data: newSchool, error: schoolError } = await supabase.from('schools').insert({ name: newSchoolName.trim() }).select().single();
        if (schoolError) { setError(`Failed to create school: ${schoolError.message}`); setLoading(false); return; }
        finalSchoolId = newSchool.id;
      }
      if (!finalSchoolId) { setError('Select or create a school'); setLoading(false); return; }

      const { data: student, error: studentError } = await supabase.from('students')
        .insert({ first_name: firstName.trim(), last_name: lastName.trim(), school_id: finalSchoolId, therapist_id: userId, status: 'active' })
        .select().single();
      if (studentError) { setError(studentError.message); setLoading(false); return; }

      await supabase.from('grading_periods').insert({
        student_id: student.id, name: 'Initial Period',
        start_date: new Date(startDate).toISOString().split('T')[0],
        end_date: new Date(endDate).toISOString().split('T')[0],
        is_current: true,
      });
      router.push(`/students/${student.id}`);
    } catch { setError('An unexpected error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 animate-slide-in">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelClass}>First name</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Emma" required className={inputClass} /></div>
        <div><label className={labelClass}>Last name</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith" required className={inputClass} /></div>
      </div>

      <div>
        <label className={labelClass}>School</label>
        <select value={schoolId} onChange={(e) => { setSchoolId(e.target.value); setNewSchoolName(''); }} className={inputClass}>
          <option value="">Select a school...</option>
          {schools.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
        </select>
        <input type="text" value={newSchoolName} onChange={(e) => { setNewSchoolName(e.target.value); if (e.target.value.trim()) setSchoolId(''); }}
          placeholder="or create new school..." className={`${inputClass} mt-2`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelClass}>Period start</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className={inputClass} /></div>
        <div><label className={labelClass}>Period end</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className={inputClass} /></div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-2.5 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200">
        {loading ? 'Creating...' : 'Create student'}
      </button>
    </form>
  );
}
