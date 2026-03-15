export default function DashboardLoading() {
  const pulse = "animate-pulse rounded-lg";
  const bg = { background: 'var(--color-bg-accent)' };
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        <div className="flex justify-between items-center mb-6">
          <div className={pulse} style={{ ...bg, width: 160, height: 32 }} />
          <div className={pulse} style={{ ...bg, width: 100, height: 36, borderRadius: 8 }} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
          {[1,2,3,4].map(i => <div key={i} className={pulse} style={{ ...bg, height: 72, borderRadius: 12 }} />)}
        </div>
        <div className={`${pulse} mb-5`} style={{ ...bg, height: 36, borderRadius: 8 }} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className={pulse} style={{ ...bg, height: 120, borderRadius: 12 }} />)}
        </div>
      </div>
    </div>
  );
}
