export default function StatStrip() {
  const stats = [
    { value: "99.8%", label: "Detection Accuracy", icon: "🎯" },
    { value: "< 2s", label: "Average Scan Time", icon: "⚡" },
    { value: "8+", label: "Forensic Techniques", icon: "🔍" },
    { value: "100%", label: "Private & Secure", icon: "🛡️" }
  ];

  return (
    <section style={{ padding: '40px 24px', position: 'relative', zIndex: 10 }}>
      <div className="container fade-up stagger-4">
        <div className="card-shimmer" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '24px', 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-default)', 
          borderRadius: 'var(--radius-card)', 
          padding: '32px' 
        }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>{stat.value}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
