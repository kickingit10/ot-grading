'use client';

import Link from 'next/link';
import { useTheme } from '@/lib/theme';

const defaultSteps = [
  { title: 'Find your student', desc: 'Use the search bar or school filter chips on the dashboard. Students are grouped by school with collapsible sections.' },
  { title: 'Enter a grade', desc: 'Pick a category (shows score type: 0\u2013100 or WPM), type a score, add optional notes. Press \u2318+Enter or click Save. Use Bulk mode to enter all categories at once with \u2318+Shift+Enter.' },
  { title: 'Navigate between students', desc: 'Use the prev/next arrows or the student picker dropdown (grouped by school). Your date range carries over automatically.' },
  { title: 'View report card', desc: 'The sidebar shows averages, grade counts, and trend arrows for each category in the selected date range. Save custom date ranges for quick access.' },
  { title: 'Track progress', desc: 'Switch to the Progress tab to see sparkline charts and trend arrows (needs 2+ grades per category). Trends compare first half vs. second half of your grades.' },
  { title: 'Edit or delete grades', desc: 'Hover any grade row to see edit/delete buttons. Editing tracks the change history. Deleting requires a two-step confirmation.' },
  { title: 'Print for reports', desc: 'Hit the Print button to generate a clean report card. Great for IEP meetings and parent conferences.' },
];

const tsSteps = [
  { title: 'Find your Swiftie', desc: 'Use the search bar or school filter chips on the dashboard. Students are grouped by school with collapsible sections.' },
  { title: 'Pick your era', desc: 'Tap an era chip on the dashboard to switch themes \u2014 Fearless, Speak Now, Red, 1989, reputation, Lover, folklore, evermore, Midnights, or TTPD.' },
  { title: 'Drop a new track', desc: 'Pick a category, type a score, add optional notes. Press \u2318+Enter or tap Save. Switch to Bulk mode to drop all tracks at once with \u2318+Shift+Enter.' },
  { title: 'Navigate the eras', desc: 'Use prev/next arrows or the student picker (grouped by school). Your date range carries over between students \u2014 no resetting.' },
  { title: 'Check the album notes', desc: 'The sidebar shows averages, grade counts, and trend arrows for each category. Save custom date ranges as named periods.' },
  { title: 'See the eras unfold', desc: 'Switch to The Eras tab to see sparkline charts and trend arrows for each category. Needs 2+ grades per category to show.' },
  { title: 'Edit your setlist', desc: 'Hover any grade to edit or delete. Edits are tracked. Deletes need a two-step confirmation \u2014 no accidental drops.' },
  { title: 'Press the vinyl', desc: 'Hit Print for a clean report card \u2014 perfect for IEP meetings and parent conferences.' },
];

export default function GuidePage() {
  const { isTaylorSwift: ts } = useTheme();
  const steps = ts ? tsSteps : defaultSteps;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
        <div className="mb-6">
          <Link href="/dashboard" className="back-link">
            <svg className="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mt-2" style={{ color: 'var(--color-text)' }}>
            {ts ? 'Welcome to the Grading Era' : 'Quick Start'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {ts ? 'Your all-too-well guide to grading' : 'Get grading in 30 seconds'}
          </p>
        </div>

        <div className="card">
          {/* Steps */}
          <div className="space-y-5">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3.5">
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ background: 'var(--color-primary-surface, var(--color-primary))', color: 'var(--color-primary-btn-text)' }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-text)' }}>{step.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Keyboard shortcuts — divider inside same card */}
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--color-border)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
              {ts ? 'Secret tracks' : 'Keyboard shortcuts'}
            </h3>
            <div className="space-y-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <div className="flex justify-between"><span>Save grade</span><span className="font-mono" style={{ color: 'var(--color-primary)' }}>⌘+Enter</span></div>
              <div className="flex justify-between"><span>Save bulk grades</span><span className="font-mono" style={{ color: 'var(--color-primary)' }}>⌘+Shift+Enter</span></div>
              <div className="flex justify-between"><span>Close edit modal</span><span className="font-mono" style={{ color: 'var(--color-primary)' }}>Esc</span></div>
              <div className="flex justify-between"><span>Navigate form fields</span><span className="font-mono" style={{ color: 'var(--color-primary)' }}>Tab</span></div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
            {ts ? 'Start the show →' : 'Go to dashboard →'}
          </Link>
        </div>
      </div>
    </div>
  );
}
