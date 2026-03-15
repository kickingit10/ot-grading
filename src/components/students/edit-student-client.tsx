'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { StudentWithSchool, School, GradingPeriod } from '@/lib/types';
import { formatDateInputValue } from '@/lib/utils';

interface EditStudentClientProps {
  student: StudentWithSchool;
  schools: School[];
  gradingPeriods: GradingPeriod[];
}

export function EditStudentClient({
  student,
  schools,
  gradingPeriods,
}: EditStudentClientProps) {
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
    setError(null);
    setLoading(true);

    try {
      if (!firstName.trim() || !lastName.trim()) {
        setError('Please enter both first and last name');
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('students')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          school_id: schoolId,
        })
        .eq('id', student.id);

      if (updateError) {
        setError(`Failed to update student: ${updateError.message}`);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGradingPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!newPeriodName.trim() || !newPeriodStart || !newPeriodEnd) {
        setError('Please fill in all grading period fields');
        setLoading(false);
        return;
      }

      const { error: periodError } = await supabase
        .from('grading_periods')
        .insert({
          student_id: student.id,
          name: newPeriodName.trim(),
          start_date: new Date(newPeriodStart).toISOString().split('T')[0],
          end_date: new Date(newPeriodEnd).toISOString().split('T')[0],
          is_current: false,
        });

      if (periodError) {
        setError(`Failed to add grading period: ${periodError.message}`);
      } else {
        setNewPeriodName('');
        setNewPeriodStart('');
        setNewPeriodEnd('');
        setSuccess(true);
        // Refresh the page to show new period
        router.refresh();
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveStudent = async () => {
    if (!confirm('Are you sure you want to archive this student? They will no longer appear in your main list.')) {
      return;
    }

    setLoading(true);
    try {
      const { error: archiveError } = await supabase
        .from('students')
        .update({ status: 'archived' })
        .eq('id', student.id);

      if (archiveError) {
        setError(`Failed to archive student: ${archiveError.message}`);
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Edit Student Info */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Information</h2>
        <form onSubmit={handleUpdateStudent} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">❌ {error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">✨ Changes saved!</p>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
              School
            </label>
            <select
              id="school"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 transition-all"
          >
            {loading ? 'Saving...' : '💾 Save Changes'}
          </button>
        </form>
      </div>

      {/* Grading Periods */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Grading Periods</h2>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Current Periods</h3>
          {gradingPeriods.length === 0 ? (
            <p className="text-gray-600">No grading periods created yet.</p>
          ) : (
            <ul className="space-y-2">
              {gradingPeriods.map((period) => (
                <li key={period.id} className="text-sm text-gray-700">
                  📅 <strong>{period.name}</strong> ({period.start_date} to {period.end_date})
                  {period.is_current && <span className="ml-2 text-purple-600 font-semibold">(Current)</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={() => setShowGradingPeriods(!showGradingPeriods)}
          className="w-full py-2 px-4 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-all"
        >
          {showGradingPeriods ? '➖ Hide Add Period' : '➕ Add Grading Period'}
        </button>

        {showGradingPeriods && (
          <form onSubmit={handleAddGradingPeriod} className="mt-4 p-4 bg-purple-50 rounded-lg space-y-3">
            <div>
              <label htmlFor="periodName" className="block text-sm font-medium text-gray-700 mb-1">
                Period Name
              </label>
              <input
                id="periodName"
                type="text"
                value={newPeriodName}
                onChange={(e) => setNewPeriodName(e.target.value)}
                placeholder="e.g., Spring 2024"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="periodStart" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  id="periodStart"
                  type="date"
                  value={newPeriodStart}
                  onChange={(e) => setNewPeriodStart(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label htmlFor="periodEnd" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  id="periodEnd"
                  type="date"
                  value={newPeriodEnd}
                  onChange={(e) => setNewPeriodEnd(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-600 disabled:opacity-50 transition-all"
            >
              {loading ? 'Adding...' : '✨ Add Period'}
            </button>
          </form>
        )}
      </div>

      {/* Archive Student */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-red-600">Danger Zone</h2>
        <button
          onClick={handleArchiveStudent}
          disabled={loading}
          className="w-full py-3 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all"
        >
          📦 Archive Student
        </button>
        <p className="text-sm text-gray-600 mt-2">
          Archived students won't appear in your main list but their data will be preserved.
        </p>
      </div>
    </div>
  );
}
