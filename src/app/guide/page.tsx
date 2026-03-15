'use client';

import Link from 'next/link';
import { useTheme } from '@/lib/theme';

const steps = [
  { title: 'Find your student', desc: 'Use the search bar or school filters on the dashboard to quickly find who you need.', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { title: 'Enter a grade', desc: 'Pick a category, type a score, add optional notes, and hit Save. Under 10 seconds.', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { title: 'View report card', desc: 'Set a date range to see averages, grade counts, and notes for each skill area.', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { title: 'Track progress', desc: 'Switch to the Progress tab to see sparkline charts and trend arrows for each category.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { title: 'Print for reports', desc: 'Hit the Print button to get a clean, printable report card.', icon: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' },
];

export default function GuidePage() {
  const { isTaylorSwift: ts } = useTheme();

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="text-sm inline-flex items-center gap-1 transition-colors" style={{ color: 'var(--color-text-muted)' }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mt-2" style={{ color: 'var(--color-text)' }}>Quick Start</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Get grading in 30 seconds</p>
        </div>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl border transition-all duration-200 ts-glass" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-bg-accent)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={step.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--color-primary)' }}>{i + 1}</span>
                  <h3 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{step.title}</h3>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>Go to dashboard →</Link>
        </div>
      </div>
    </div>
  );
}
