export default function StudentDetailLoading() {
  const pulse = "animate-pulse rounded-lg";
  const bg = { background: 'var(--color-bg-accent)' };
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '32px 24px' }}>
        <div className="mb-6">
          <div className={pulse} style={{ ...bg, width: 60, height: 16, marginBottom: 12 }} />
          <div className={pulse} style={{ ...bg, width: 240, height: 32, marginBottom: 8 }} />
          <div className={pulse} style={{ ...bg, width: 160, height: 16 }} />
        </div>
        <div className={pulse} style={{ ...bg, height: 80, borderRadius: 12, marginBottom: 24 }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className={pulse} style={{ ...bg, height: 200, borderRadius: 12 }} />
            <div className={pulse} style={{ ...bg, height: 300, borderRadius: 12 }} />
          </div>
          <div className={pulse} style={{ ...bg, height: 400, borderRadius: 12 }} />
        </div>
      </div>
    </div>
  );
}
