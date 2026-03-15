export default function ReportsLoading() {
  const pulse = "animate-pulse rounded-lg";
  const bg = { background: 'var(--color-bg-accent)' };
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div className="mb-6">
          <div className={pulse} style={{ ...bg, width: 60, height: 16, marginBottom: 12 }} />
          <div className={pulse} style={{ ...bg, width: 200, height: 28, marginBottom: 8 }} />
        </div>
        <div className={pulse} style={{ ...bg, height: 60, borderRadius: 12, marginBottom: 24 }} />
        <div className="space-y-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className={pulse} style={{ ...bg, height: 48, borderRadius: 8 }} />)}
        </div>
      </div>
    </div>
  );
}
