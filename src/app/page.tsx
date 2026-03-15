import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

/* ── Tiny inline "app mockup" components ── */

function MockDashboard() {
  const students = [
    { name: 'Emma Garcia', grades: 76, date: 'Mar 9' },
    { name: 'Liam Chen', grades: 64, date: 'Mar 9' },
    { name: 'Olivia Martinez', grades: 56, date: 'Mar 9' },
  ];
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Mini stat row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {[{ n: '6', l: 'Students' }, { n: '347', l: 'Grades' }, { n: '4', l: 'Active' }].map(s => (
          <div key={s.l} style={{ flex: 1, background: '#f8f9fa', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#1d1d1f' }}>{s.n}</div>
            <div style={{ fontSize: 11, color: '#86868b' }}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* Mini student cards */}
      {students.map(s => (
        <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f' }}>{s.name}</span>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#86868b' }}>
            <span>{s.grades} grades</span>
            <span>{s.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MockGradeEntry() {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', marginBottom: 12 }}>New Grade</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <div style={{ flex: 1, background: '#f8f9fa', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#86868b' }}>03/15/2026</div>
        <div style={{ flex: 1, background: '#f8f9fa', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#1d1d1f' }}>Cutting - Simple</div>
        <div style={{ width: 60, background: '#f8f9fa', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#1d1d1f', textAlign: 'center' as const }}>85%</div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, background: '#f8f9fa', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#86868b' }}>Good focus today</div>
        <div style={{ background: '#0071e3', color: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 500 }}>Save</div>
      </div>
    </div>
  );
}

function MockReportCard() {
  const rows = [
    { cat: 'Color', avg: '75%', w: 75 },
    { cat: 'Cutting', avg: '76%', w: 76 },
    { cat: 'Writing', avg: '81%', w: 81 },
    { cat: 'WPM', avg: '16', w: 53 },
  ];
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', marginBottom: 4 }}>Report Card</div>
      <div style={{ fontSize: 11, color: '#86868b', marginBottom: 14 }}>Emma Garcia · Riverside Elementary</div>
      {rows.map(r => (
        <div key={r.cat} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: '#1d1d1f' }}>{r.cat}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0071e3' }}>{r.avg}</span>
          </div>
          <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2 }}>
            <div style={{ height: 4, borderRadius: 2, background: '#0071e3', width: `${r.w}%`, opacity: 0.8 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AppWindow({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)' }}>
      {/* Title bar */}
      <div style={{ background: '#f6f6f6', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <span style={{ fontSize: 11, color: '#999', marginLeft: 8 }}>{title}</span>
      </div>
      <div style={{ background: '#fafafa', padding: 16 }}>
        {children}
      </div>
    </div>
  );
}

/* ── Page ── */

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  return (
    <div className="min-h-screen" style={{ background: '#fafafa' }}>
      {/* Nav — minimal, Apple-style */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(250,250,250,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px', height: 52, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0071e3' }}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              <path d="M9 14l2 2 4-4" />
            </svg>
            <span style={{ fontSize: 17, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.01em' }}>OT Tracker</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <a href="#features" style={{ fontSize: 14, fontWeight: 500, color: '#424245' }}>Features</a>
            <Link href="/guide" style={{ fontSize: 14, fontWeight: 500, color: '#424245' }}>Guide</Link>
            <Link href="/demo" style={{ fontSize: 14, fontWeight: 500, color: '#fff', background: '#0071e3', padding: '8px 18px', borderRadius: 980, minHeight: 36, display: 'inline-flex', alignItems: 'center' }}>Try the demo</Link>
          </div>
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px 64px' }}>
        <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(36px, 5.5vw, 56px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.08, color: '#1d1d1f' }}>
            Grade smarter.<br />Go home earlier.
          </h1>
          <p style={{ fontSize: 'clamp(17px, 2vw, 21px)', lineHeight: 1.5, color: '#86868b', marginTop: 20, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            The simple grading app for school-based OTs. Track fine motor skills, generate report cards, and never wrestle a spreadsheet again.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
            <Link href="/demo" style={{ fontSize: 17, fontWeight: 500, color: '#fff', background: '#0071e3', padding: '12px 28px', borderRadius: 980, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Try the demo</Link>
            <a href="#features" style={{ fontSize: 17, fontWeight: 500, color: '#0071e3', padding: '12px 28px', borderRadius: 980, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Learn more ↓</a>
          </div>
        </div>

        {/* Hero product shot */}
        <div style={{ marginTop: 56, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
          <AppWindow title="OT Tracker — Dashboard">
            <MockDashboard />
          </AppWindow>
        </div>
      </section>

      {/* ═══ Stats strip ═══ */}
      <section style={{ borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)', background: '#fff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 48 }}>
          {[
            { value: '700+', label: 'Grades tracked' },
            { value: '10s', label: 'To enter a grade' },
            { value: '0', label: 'Spreadsheets needed' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.03em', color: '#1d1d1f' }}>{s.value}</div>
              <div style={{ fontSize: 15, color: '#86868b', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section id="features" style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px' }}>
        {/* Feature 1: Grade entry */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 48, alignItems: 'center', marginBottom: 80 }}>
          <div className="feature-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0071e3', marginBottom: 8 }}>FAST GRADING</div>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, color: '#1d1d1f' }}>
                Enter a grade in<br />10 seconds flat.
              </h2>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: '#86868b', marginTop: 16, maxWidth: 400 }}>
                Pick a category, type a number, save. No scrolling through 31 tabs, no formulas, no formatting. Just the grade.
              </p>
            </div>
            <div>
              <AppWindow title="OT Tracker — Grade Entry">
                <MockGradeEntry />
              </AppWindow>
            </div>
          </div>
        </div>

        {/* Feature 2: Report cards */}
        <div className="feature-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center', marginBottom: 80 }}>
          <div style={{ order: 1 }}>
            <AppWindow title="OT Tracker — Report Card">
              <MockReportCard />
            </AppWindow>
          </div>
          <div style={{ order: 2 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0071e3', marginBottom: 8 }}>INSTANT REPORTS</div>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, color: '#1d1d1f' }}>
              Report cards that<br />write themselves.
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: '#86868b', marginTop: 16, maxWidth: 400 }}>
              Set a date range, see every student&apos;s averages by category, instantly. Hit print. Hand it to the teacher. Go home early.
            </p>
          </div>
        </div>

        {/* Feature 3: Organization */}
        <div className="feature-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0071e3', marginBottom: 8 }}>ORGANIZED</div>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, color: '#1d1d1f' }}>
              Every student.<br />Every school.<br />One place.
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: '#86868b', marginTop: 16, maxWidth: 400 }}>
              Filter by school, search by name, see who needs grading at a glance. Your caseload, organized the way your brain already works.
            </p>
          </div>
          <div>
            {/* Mini org mockup */}
            <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)' }}>
              <div style={{ background: '#f6f6f6', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e8e8e8' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                </div>
                <span style={{ fontSize: 11, color: '#999', marginLeft: 8 }}>OT Tracker — Students</span>
              </div>
              <div style={{ background: '#fafafa', padding: 16 }}>
                <div style={{ background: '#fff', borderRadius: 12, padding: 20, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                  {/* School filter chips */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <div style={{ background: '#0071e3', color: '#fff', borderRadius: 980, padding: '6px 14px', fontSize: 12, fontWeight: 500 }}>All (6)</div>
                    <div style={{ background: '#f0f0f0', color: '#424245', borderRadius: 980, padding: '6px 14px', fontSize: 12 }}>Riverside (3)</div>
                    <div style={{ background: '#f0f0f0', color: '#424245', borderRadius: 980, padding: '6px 14px', fontSize: 12 }}>Oak Park (3)</div>
                  </div>
                  {/* Mini school groups */}
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#86868b', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>Riverside Elementary</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                    {['Emma G.', 'Liam C.', 'Olivia M.'].map(n => (
                      <div key={n} style={{ background: '#f8f9fa', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#1d1d1f' }}>{n}</div>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#86868b', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>Oak Park Elementary</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {['Noah W.', 'Sophia J.', 'James B.'].map(n => (
                      <div key={n} style={{ background: '#f8f9fa', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#1d1d1f' }}>{n}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Built for you ═══ */}
      <section style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, color: '#1d1d1f' }}>
            Built for school-based OTs.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: '#86868b', marginTop: 16, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Track color, cutting, writing, and words per minute for every student on your caseload. Designed by an OT therapist who was tired of spreadsheets.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginTop: 36 }}>
            {[
              { icon: '✂️', label: 'Cutting skills' },
              { icon: '✏️', label: 'Writing quality' },
              { icon: '🎨', label: 'Color recognition' },
              { icon: '⚡', label: 'Words per minute' },
            ].map(c => (
              <div key={c.label} style={{ background: '#f8f9fa', borderRadius: 12, padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1d1d1f' }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Final CTA ═══ */}
      <section style={{ background: '#1d1d1f' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, color: '#f5f5f7' }}>
            Your spreadsheet isn&apos;t<br />going to fix itself.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: '#86868b', marginTop: 16 }}>
            See why OT Tracker is the last grading tool you&apos;ll ever need.
          </p>
          <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', marginTop: 28, fontSize: 17, fontWeight: 500, color: '#fff', background: '#0071e3', padding: '14px 32px', borderRadius: 980, minHeight: 44 }}>
            Try the demo
          </Link>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer style={{ background: '#1d1d1f', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#86868b' }}>
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                <path d="M9 14l2 2 4-4" />
              </svg>
              <span style={{ fontSize: 13, color: '#86868b' }}>OT Tracker</span>
            </div>
            <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
              <Link href="/demo" style={{ color: '#86868b' }}>Demo</Link>
              <Link href="/guide" style={{ color: '#86868b' }}>Guide</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
