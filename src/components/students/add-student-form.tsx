'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { School } from '@/lib/types';
import { formatDateInputValue } from '@/lib/utils';

interface AddStudentFormProps {
  schools: School[];
  userId: string;
}

export function AddStudentForm({ schools, userId }: AddStudentFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [startDate, setStartDate] = useState(formatDateInputValue(new Date().toISOString()));
  const [endDate, setEndDate] = useState(
    formatDateInputValue(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString())
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!firstName.trim() || !lastName.trim()) {
        setError('Please enter both first and last name');
        setLoading(false);
        return;
      }

      let finalSchoolId = schoolId;

      // Create new school if needed
      if (!schoolId && newSchoolName.trim()) {
        const { data: newSchool, error: schoolError } = await supabase
          .from('schools')
          .insert({ name: newSchoolName.trim() })
          .select()
          .single();

        if (schoolError) {
          setError(`Failed to create school: ${schoolError.message}`);
          setLoading(false);
          return;
        }

        finalSchoolId = newSchool.id;
      }

      if (!finalSchoolId) {
        setError('Please select or create a school');
        setLoading(false);
        return;
      }

      // Create student
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          school_id: finalSchoolId,
          therapist_id: userId,
          status: 'active',
        })
        .select()
        .single();

      if (studentError) {
        setError(`Failed to create student: ${studentError.message}`);
        setLoading(false);
        return;
      }

      // Create grading period
      const { error: periodError } = await supabase
        .from('grading_periods')
        .insert({
          student_id: student.id,
          name: 'Initial Period',
          start_date: new Date(startDate).toISOString().split('T')[0],
          end_date: new Date(endDate).toISOString().split('T')[0],
          is_current: true,
        });

      if (periodError) {
        setError(`Failed to create grading period: ${periodError.message}`);
        setLoading(false);
        return;
      }

      router.push(`/students/${student.id}`);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">❌ {error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g., Emma"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="e.g., Smith"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
        <div className="space-y-2">
          <select
            value={schoolId}
            onChange={(e) => {
              setSchoolId(e.target.value);
              setNewSchoolName('');
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select a school...</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-400">or</span>
            </div>
            <input
              type="text"
              value={newSchoolName}
              onChange={(e) => {
                setNewSchoolName(e.target.value);
                if (e.target.value.trim()) {
                  setSchoolId('');
                }
              }}
              placeholder="Create new school..."
              className="w-full pl-20 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Grading Period Start
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            Grading Period End
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? 'Creating student...' : '✨ Create Student'}
      </button>
    </form>
  );
}
