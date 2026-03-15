import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Nav */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              <path d="M9 14l2 2 4-4" />
            </svg>
            <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>OT Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Log in</Link>
            <Link href="/signup" className="btn-primary text-sm" style={{ padding: '8px 18px' }}>Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight" style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Track student progress,<br />
            <span style={{ color: 'var(--color-primary)' }}>not spreadsheets.</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed" style={{ color: 'var(--color-text-muted)', maxWidth: 520 }}>
            OT Tracker replaces your grading spreadsheets with a fast, simple app built specifically for school-based occupational therapists. Enter grades in seconds. See report card summaries instantly.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary" style={{ padding: '14px 28px', fontSize: 16 }}>Start tracking</Link>
            <a href="#how-it-works" className="btn-ghost" style={{ padding: '14px 28px', fontSize: 16 }}>Learn more</a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 py-20" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>How it works</h2>
        <p className="text-sm mb-10" style={{ color: 'var(--color-text-muted)' }}>Three steps. Under a minute to learn.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Add your students', desc: 'Create a profile for each student with their name and school. Import existing data or start fresh.' },
            { step: '2', title: 'Enter grades in seconds', desc: 'Pick a category, type a score, save. Bulk mode lets you grade all categories at once. Under 10 seconds per grade.' },
            { step: '3', title: 'View report card summaries', desc: 'Set any date range to see averages, trends, and notes for each skill area. Print clean reports for IEP meetings.' },
          ].map(item => (
            <div key={item.step} className="card">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-4"
                style={{ background: 'var(--color-primary-lighter)', color: 'var(--color-primary)' }}>
                {item.step}
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--color-text)' }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Built for */}
      <section className="px-4 sm:px-6 lg:px-8 py-16" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <h2 className="text-2xl font-bold tracking-tight mb-3" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>Built for school-based OTs</h2>
          <p className="text-sm leading-relaxed mx-auto" style={{ color: 'var(--color-text-muted)', maxWidth: 480 }}>
            OT Tracker is designed for occupational therapists who track fine motor skills, cutting, writing, and Words Per Minute for elementary students. It replaces the grading spreadsheets you&apos;re already using — with faster entry, automatic averages, and printable report cards.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="btn-primary" style={{ padding: '14px 28px', fontSize: 16 }}>Get started free</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-10 mt-8" style={{ maxWidth: 1100, margin: '0 auto', borderTop: '1px solid var(--color-border)' }}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)' }}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              <path d="M9 14l2 2 4-4" />
            </svg>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>OT Tracker</span>
          </div>
          <div className="flex gap-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <Link href="/login">Log in</Link>
            <Link href="/signup">Sign up</Link>
            <Link href="/guide">Guide</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
