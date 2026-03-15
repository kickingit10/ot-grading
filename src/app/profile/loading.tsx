export default function ProfileLoading() {
  const pulse = "animate-pulse rounded-lg";
  const bg = { background: 'var(--color-bg-accent)' };
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className={pulse} style={{ ...bg, width: 60, height: 16, marginBottom: 12 }} />
          <div className={pulse} style={{ ...bg, width: 120, height: 28, marginBottom: 8 }} />
          <div className={pulse} style={{ ...bg, width: 160, height: 16 }} />
        </div>
        <div className="card" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 24px' }}>
          <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className={pulse} style={{ ...bg, height: 56 }} />)}
            <div className={pulse} style={{ ...bg, height: 40, borderRadius: 8 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
