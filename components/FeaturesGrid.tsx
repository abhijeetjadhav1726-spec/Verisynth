'use client';
export default function FeaturesGrid() {
  const features = [
    {
      title: 'Multimodal Analysis',
      desc: 'Seamlessly analyze both images and video files. The engine extracts frames, isolates faces, and aggregates predictions across temporal data.',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
    },
    {
      title: 'Source Attribution',
      desc: 'Don\'t just know if it\'s fake—know how it was made. Our engine predicts the specific AI tool (e.g. Stable Diffusion, MidJourney, StyleGAN) used to generate the media.',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
    },
    {
      title: 'Grad-CAM Heatmaps',
      desc: 'Visual interpretability built-in. See exactly which regions of a face triggered the AI to flag it as synthetic with glowing heatmaps.',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l2-9 5 18 3-10 4 5h4"/></svg>
    },
    {
      title: 'Forensic Heuristics',
      desc: 'Combines neural networks with deterministic forensics including FFT frequency analysis, metadata scanning, and noise residual detection.',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
    },
    {
      title: 'Bank-Grade Security',
      desc: 'Media is processed in volatile memory. No images or videos are permanently stored, ensuring complete data privacy and compliance.',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    },
    {
      title: 'Actionable Insights',
      desc: 'Get clear Trust Scores and publication recommendations. Designed for journalists, platform moderators, and security teams.',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 22h5a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-5"/><path d="M10 22H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h5"/><path d="M14 12h-4"/></svg>
    }
  ];

  return (
    <section id="features" style={{ padding: '100px 24px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 className="fade-up" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px' }}>Enterprise-Grade Detection</h2>
          <p className="fade-up" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>A comprehensive suite of tools designed to fight the spread of synthetic media and protect digital authenticity.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {features.map((feature, i) => (
            <div key={i} className="fade-up" style={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-default)', 
              borderRadius: 'var(--radius-card)', 
              padding: '32px',
              transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
              cursor: 'default'
            }} onMouseOver={e => {
              e.currentTarget.style.borderColor = 'var(--border-accent)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.5)';
            }} onMouseOut={e => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ 
                width: '48px', height: '48px', 
                borderRadius: '12px', 
                background: 'rgba(99,91,255,0.1)', 
                color: 'var(--accent-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px'
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
