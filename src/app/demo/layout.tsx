'use client';

import Link from 'next/link';
import { useTheme, type EraName } from '@/lib/theme';

const ERAS: { id: EraName; label: string }[] = [
  { id: 'fearless', label: 'Fearless' }, { id: 'speakNow', label: 'Speak Now' },
  { id: 'red', label: 'Red' }, { id: '1989', label: '1989' },
  { id: 'reputation', label: 'reputation' }, { id: 'lover', label: 'Lover' },
  { id: 'folklore', label: 'folklore' }, { id: 'evermore', label: 'evermore' },
  { id: 'midnights', label: 'Midnights' }, { id: 'torturedPoets', label: 'TTPD' },
];

function DemoNavbar() {
  const { isTaylorSwift, colorMode, setColorMode, era, setEra, setTheme } = useTheme();

  const modeBtn = (mode: 'light' | 'dark' | 'system', label: string) => (
    <button onClick={() => setColorMode(mode)} aria-label={`${mode} mode`}
      style={{ padding: 6, borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12,
        background: colorMode === mode ? 'var(--color-primary-lighter)' : 'transparent',
        color: colorMode === mode ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
      {label}
    </button>
  );

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl"
      style={{ background: 'var(--color-nav-bg)', borderBottom: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/demo" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary-surface, var(--color-primary))' }}>
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                <path d="M9 14l2 2 4-4" />
              </svg>
              {isTaylorSwift ? (
                <span className="ts-gradient-text" style={{ fontSize: 18, fontWeight: 700 }}>OT Tracker <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.7 }}>(Taylor&#39;s Version)</span></span>
              ) : (
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary-surface, var(--color-primary))' }}>OT Tracker</span>
              )}
            </Link>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'var(--color-primary-lighter)', color: 'var(--color-primary)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Demo</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/demo/reports" style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-muted)', textDecoration: 'none' }}>Reports</Link>
            <button
              onClick={() => setTheme(isTaylorSwift ? 'default' : 'taylor-swift')}
              style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid var(--color-border)', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                background: isTaylorSwift ? 'var(--color-primary-lighter)' : 'transparent',
                color: isTaylorSwift ? 'var(--color-primary)' : 'var(--color-text-muted)',
                transition: 'all 0.2s ease' }}
              aria-label="Toggle Taylor Swift theme"
            >
              {isTaylorSwift ? '✨ Taylor\'s Version' : '✨ Taylor Mode'}
            </button>
            {isTaylorSwift && (
              <select value={era} onChange={e => setEra(e.target.value as EraName)}
                className="input" style={{ width: 'auto', minWidth: 120, fontSize: 13, padding: '4px 32px 4px 10px', minHeight: 32 }}>
                {ERAS.map(e => (<option key={e.id} value={e.id}>{e.label}</option>))}
              </select>
            )}
            <button onClick={() => setTheme(isTaylorSwift ? 'default' : 'taylor-swift')}
              style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                background: isTaylorSwift ? 'var(--color-primary-lighter)' : 'transparent',
                color: isTaylorSwift ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
              ✨ Taylor Mode
            </button>
            <div style={{ display: 'flex', gap: 2 }}>
              {modeBtn('light', '☀')}
              {modeBtn('dark', '🌙')}
              {modeBtn('system', '💻')}
            </div>
            <Link href="/" style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)', textDecoration: 'none' }}>
              ← Home
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoNavbar />
      {children}
    </>
  );
}
