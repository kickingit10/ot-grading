import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
      <div className="text-center max-w-sm">
        <div className="text-5xl font-bold mb-2" style={{ color: 'var(--color-border)' }}>404</div>
        <h1 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Page not found</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="btn-primary inline-block">Go to dashboard</Link>
      </div>
    </div>
  );
}
