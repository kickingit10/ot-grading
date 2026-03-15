'use client';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
      <div className="text-center" style={{ maxWidth: 420 }}>
        <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--color-bg-accent)' }}>
          <svg className="w-6 h-6" style={{ color: 'var(--color-error)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Something went wrong</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          An unexpected error occurred. Please try again.
        </p>
        <button onClick={reset} className="btn-primary">Try again</button>
      </div>
    </div>
  );
}
