export default function HowItWorks() {
  const steps = [
    { num: '01', title: 'Upload Media', desc: 'Securely upload images or videos. Files are encrypted and never permanently stored on our servers.' },
    { num: '02', title: 'Feature Extraction', desc: 'Our engine isolates faces and extracts critical features using MediaPipe and OpenCV.' },
    { num: '03', title: 'Neural Analysis', desc: 'A MobileNetV2 architecture analyzes the features against a robust dataset of millions of fakes.' },
    { num: '04', title: 'Source Forensics', desc: 'Algorithms detect specific blending seams, frequency artifacts, and metadata fingerprints.' }
  ];

  return (
    <section id="how-it-works" style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.01)' }}>
      <div className="container">
        <h2 className="fade-up" style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 700, marginBottom: '60px' }}>How VeriSynth Works</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px', position: 'relative' }}>
          {/* Connecting Line (hidden on small screens) */}
          <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '2px', background: 'var(--border-default)', zIndex: 0 }} />
          
          {steps.map((step, i) => (
            <div key={i} className={`fade-up stagger-${i+1}`} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ 
                width: '50px', height: '50px', 
                borderRadius: '50%', 
                background: 'var(--bg-page)', 
                border: '2px solid var(--accent-primary)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)',
                marginBottom: '20px',
                boxShadow: '0 0 15px rgba(99,91,255,0.3)'
              }}>
                {step.num}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '12px' }}>{step.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
