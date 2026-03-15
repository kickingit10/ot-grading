// Utility functions for formatting and data manipulation

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateInputValue(dateString: string): string {
  // Format as YYYY-MM-DD for input[type="date"]
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseInputDate(inputValue: string): string {
  // Convert from YYYY-MM-DD to ISO string
  return new Date(inputValue + 'T00:00:00Z').toISOString();
}

export function formatScore(score: number, scoreType: 'percentage' | 'raw'): string {
  if (scoreType === 'percentage') {
    return `${Math.round(score * 100)}%`;
  }
  return Math.round(score).toString();
}

export function normalizeScore(value: number, scoreType: 'percentage' | 'raw'): number {
  if (scoreType === 'percentage') {
    // User enters 0-100, store as 0-1
    return Math.min(Math.max(value / 100, 0), 1);
  }
  // Raw scores are stored as-is
  return Math.max(value, 0);
}

export function getStudentFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function sortByDate(a: { graded_at: string }, b: { graded_at: string }): number {
  return new Date(b.graded_at).getTime() - new Date(a.graded_at).getTime();
}

export function getDateRange(startDate: string, endDate: string): { start: Date; end: Date } {
  return {
    start: new Date(startDate),
    end: new Date(endDate),
  };
}

export function isDateInRange(dateString: string, startDate: string, endDate: string): boolean {
  const date = new Date(dateString);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return date >= start && date <= end;
}
