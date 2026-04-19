import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-default)', padding: '60px 0 30px' }}>
      <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '40px', marginBottom: '40px' }}>
        <div style={{ maxWidth: '300px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            VeriSynth
          </Link>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Advanced forensic analysis and deepfake detection platform securing the digital landscape against synthetic media.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '60px' }}>
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '16px', fontSize: '1rem' }}>Product</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link href="/analyze" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Deepfake Scanner</Link></li>
              <li><Link href="/#features" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Features</Link></li>
              <li><Link href="/#how-it-works" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>How it Works</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '16px', fontSize: '1rem' }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link href="#" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>About Us</Link></li>
              <li><Link href="#" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Privacy Policy</Link></li>
              <li><Link href="#" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container" style={{ borderTop: '1px solid var(--border-default)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>&copy; {new Date().getFullYear()} VeriSynth Platform. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="#" style={{ color: 'var(--text-muted)' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></Link>
          <Link href="#" style={{ color: 'var(--text-muted)' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg></Link>
        </div>
      </div>
    </footer>
  );
}
