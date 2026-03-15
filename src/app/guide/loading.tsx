export default function GuideLoading() {
  const pulse = "animate-pulse rounded-lg";
  const bg = { background: 'var(--color-bg-accent)' };
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className={pulse} style={{ ...bg, width: 60, height: 16, marginBottom: 12 }} />
          <div className={pulse} style={{ ...bg, width: 200, height: 28, marginBottom: 8 }} />
          <div className={pulse} style={{ ...bg, width: 180, height: 16 }} />
        </div>
        <div className="card" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '20px 24px' }}>
          <div className="space-y-5">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="flex gap-3.5">
                <div className={`${pulse} flex-shrink-0`} style={{ ...bg, width: 28, height: 28, borderRadius: '50%' }} />
                <div className="flex-1 space-y-1.5">
                  <div className={pulse} style={{ ...bg, width: '40%', height: 14 }} />
                  <div className={pulse} style={{ ...bg, width: '90%', height: 12 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
