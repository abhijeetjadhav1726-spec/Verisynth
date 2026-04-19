'use client';
import Link from 'next/link';

export default function Nav() {
  return (
    <header style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 100, 
      background: 'rgba(10, 10, 15, 0.8)', 
      backdropFilter: 'blur(12px)', 
      borderBottom: '1px solid var(--border-default)', 
      padding: '16px 0' 
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          VeriSynth
        </Link>
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link href="/analyze" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Analyze</Link>
          <Link href="/#how-it-works" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>How it works</Link>
          <Link href="/analyze" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Get Started</Link>
        </nav>
      </div>
    </header>
  );
}
