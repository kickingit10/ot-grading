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
      <nav style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              <path d="M9 14l2 2 4-4" />
            </svg>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>OT Tracker</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)' }}>Log in</Link>
            <Link href="/signup" className="btn-primary" style={{ padding: '8px 18px', fontSize: 14 }}>Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px 64px' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 40px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--color-text)' }}>
          You didn&apos;t go to school for 6 years to fight spreadsheets.
        </h1>
        <div style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--color-text-muted)', marginTop: 28 }}>
          <p>
            You&apos;re an OT therapist. You should be helping kids write their name,
            hold scissors, and build the fine motor skills they need.
          </p>
          <p style={{ marginTop: 20 }}>
            Instead, you&apos;re staring at 31 spreadsheet tabs at 4pm trying to pull
            report card numbers while your coffee gets cold.
          </p>
          <p style={{ marginTop: 20 }}>
            OT Tracker replaces all of that with one simple app. Enter a grade in
            10 seconds. See report card averages instantly. Print and go home.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 36 }}>
          <Link href="/signup" className="btn-primary" style={{ padding: '14px 28px', fontSize: 16 }}>Start tracking — it&apos;s free</Link>
          <a href="#how" style={{ padding: '14px 28px', fontSize: 16, fontWeight: 500, color: 'var(--color-text-muted)' }}>See how it works ↓</a>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 64px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--color-text)', marginBottom: 32 }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div className="card">
            <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, background: 'var(--color-primary-lighter)', color: 'var(--color-primary)', marginBottom: 16 }}>1</div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>Add your students</h3>
            <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--color-text-muted)' }}>
              Type a name, pick a school, done. Import your existing spreadsheet data in one click.
            </p>
          </div>
          <div className="card">
            <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, background: 'var(--color-primary-lighter)', color: 'var(--color-primary)', marginBottom: 16 }}>2</div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>Grade in 10 seconds</h3>
            <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--color-text-muted)' }}>
              Pick a category. Type a number. Save. That&apos;s it. No scrolling through tabs, no formulas, no formatting.
            </p>
          </div>
          <div className="card">
            <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, background: 'var(--color-primary-lighter)', color: 'var(--color-primary)', marginBottom: 16 }}>3</div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>Report cards write themselves</h3>
            <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--color-text-muted)' }}>
              Set a date range. See every student&apos;s averages, by category, instantly. Hit print. Hand it to the teacher. Go home early.
            </p>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 64px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
            Built for school-based OTs who track fine motor skills, cutting,
            writing, and words per minute for elementary students.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--color-text-muted)', marginTop: 16, opacity: 0.8 }}>
            Currently used by therapists tracking 24+ students
            and 700+ grades across multiple schools.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--color-text)', marginBottom: 20 }}>
          Your spreadsheet isn&apos;t going to fix itself.
        </h2>
        <Link href="/signup" className="btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>Get started free</Link>
      </section>

      {/* Footer */}
      <footer style={{ maxWidth: 1100, margin: '0 auto', padding: '24px', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)' }}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              <path d="M9 14l2 2 4-4" />
            </svg>
            <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>OT Tracker</span>
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 14, color: 'var(--color-text-muted)' }}>
            <Link href="/login">Log in</Link>
            <Link href="/signup">Sign up</Link>
            <Link href="/guide">Guide</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
