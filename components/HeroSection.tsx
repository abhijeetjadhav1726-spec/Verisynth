import Link from 'next/link';

export default function HeroSection() {
  return (
    <section style={{ 
      position: 'relative', 
      padding: '120px 24px 80px', 
      textAlign: 'center', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      overflow: 'hidden'
    }}>
      {/* Dynamic Glowing Background */}
      <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '600px', background: 'radial-gradient(circle, rgba(99,91,255,0.15) 0%, rgba(10,10,15,0) 70%)', zIndex: -1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '0', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, rgba(10,10,15,0) 70%)', zIndex: -1, pointerEvents: 'none' }} />

      <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(99,91,255,0.1)', border: '1px solid rgba(99,91,255,0.2)', borderRadius: '999px', marginBottom: '24px', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600 }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)' }} />
        v1.0 Forensic AI Engine Live
      </div>

      <h1 className="fade-up stagger-1" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '24px', maxWidth: '900px' }}>
        Unmask Deepfakes with <br/>
        <span style={{ background: 'linear-gradient(135deg, #635BFF 0%, #00D4FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Multimodal AI Intelligence</span>
      </h1>

      <p className="fade-up stagger-2" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '40px', lineHeight: 1.6 }}>
        Advanced forensic analysis for images and videos. Detect synthetic media, uncover AI manipulation, and identify the source algorithms in seconds.
      </p>

      <div className="fade-up stagger-3" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/analyze" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
          Analyze Media Now
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </Link>
        <Link href="#how-it-works" className="btn-ghost" style={{ padding: '14px 32px', fontSize: '1rem' }}>
          See How It Works
        </Link>
      </div>
    </section>
  );
}
