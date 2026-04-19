'use client';
import Link from 'next/link';

export default function CtaBanner() {
  return (
    <section style={{ padding: '0 24px 100px' }}>
      <div className="container">
        <div className="fade-up" style={{ 
          background: 'linear-gradient(135deg, #635BFF 0%, #00D4FF 100%)', 
          borderRadius: '24px', 
          padding: '60px 40px', 
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(99,91,255,0.2)'
        }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '20px' }}>
            Ready to secure your platform?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 40px' }}>
            Start analyzing media instantly. No credit card required. Protect your organization from deepfakes and synthetic misinformation today.
          </p>
          <Link href="/analyze" style={{ 
            background: '#fff', 
            color: '#0A0A0F', 
            padding: '16px 32px', 
            borderRadius: 'var(--radius-btn)', 
            fontSize: '1rem', 
            fontWeight: 600, 
            display: 'inline-block',
            transition: 'transform 0.2s',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
          }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            Try VeriSynth Free
          </Link>
        </div>
      </div>
    </section>
  );
}
