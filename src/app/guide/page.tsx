'use client';

import Link from 'next/link';
import { useTheme } from '@/lib/theme';

const defaultSteps = [
  { title: 'Find your student', desc: 'Use the search bar or school filter chips on the dashboard. Students are grouped by school with collapsible sections.', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { title: 'Enter a grade', desc: 'Pick a category (shows score type: 0\u2013100 or WPM), type a score, add optional notes. Press Cmd+Enter or click Save. The category is remembered for next time.', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { title: 'Navigate between students', desc: 'Use the prev/next arrows or the student picker dropdown (grouped by school). Your date range carries over automatically.', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { title: 'View report card', desc: 'The sidebar shows averages, grade counts, and trend arrows for each category in the selected date range. Save custom date ranges for quick access.', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { title: 'Track progress', desc: 'Switch to the Progress tab to see sparkline charts and trend arrows (needs 2+ grades per category). Trends compare first half vs. second half of your grades.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { title: 'Edit or delete grades', desc: 'Hover any grade row to see edit/delete buttons. Editing tracks the change history. Deleting requires a two-step confirmation.', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { title: 'Print for reports', desc: 'Hit the Print button to generate a clean report card. Great for IEP meetings and parent conferences.', icon: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' },
];

const tsSteps = [
  { title: 'Find your Swiftie', desc: 'Use the search bar or school filter chips on the dashboard. Students are grouped by school with collapsible sections.', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { title: 'Pick your era', desc: 'Tap an era chip on the dashboard to switch themes \u2014 Fearless, Speak Now, Red, 1989, reputation, Lover, folklore, evermore, Midnights, or TTPD. Each has its own color palette.', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
  { title: 'Drop a new track', desc: 'Pick a category (shows 0\u2013100 or WPM), type a score, add optional notes. Press Cmd+Enter or tap Save. Your last category is remembered.', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { title: 'Navigate the eras', desc: 'Use prev/next arrows or the student picker (grouped by school). Your date range carries over between students \u2014 no resetting.', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { title: 'Check the album notes', desc: 'The sidebar shows averages, grade counts, and trend arrows for each category. Save custom date ranges as named periods.', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { title: 'See the eras unfold', desc: 'Switch to The Eras tab to see sparkline charts and trend arrows for each category. Needs 2+ grades per category to show.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { title: 'Edit your setlist', desc: 'Hover any grade to edit or delete. Edits are tracked. Deletes need a two-step confirmation \u2014 no accidental drops.', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { title: 'Press the vinyl', desc: 'Hit Print for a clean report card \u2014 perfect for IEP meetings and parent conferences.', icon: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' },
];

export default function GuidePage() {
  const { isTaylorSwift: ts } = useTheme();
  const steps = ts ? tsSteps : defaultSteps;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/" className="text-sm inline-flex items-center gap-1 transition-colors" style={{ color: 'var(--color-text-muted)' }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mt-2" style={{ color: 'var(--color-text)' }}>
            {ts ? 'Welcome to the Grading Era' : 'Quick Start'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {ts ? 'Your all-too-well guide to grading' : 'Get grading in 30 seconds'}
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="card-sm flex gap-4">
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

        <div className="mt-6 card-sm">
          <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
            {ts ? 'Secret tracks (keyboard shortcuts)' : 'Keyboard shortcuts'}
          </h3>
          <div className="space-y-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <div className="flex justify-between"><span>Save grade</span><span className="font-mono" style={{ color: 'var(--color-primary)' }}>⌘+Enter</span></div>
            <div className="flex justify-between"><span>Close edit modal</span><span className="font-mono" style={{ color: 'var(--color-primary)' }}>Esc</span></div>
            <div className="flex justify-between"><span>Navigate form fields</span><span className="font-mono" style={{ color: 'var(--color-primary)' }}>Tab</span></div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
            {ts ? 'Start the show →' : 'Go to dashboard →'}
          </Link>
        </div>
      </div>
    </div>
  );
}
