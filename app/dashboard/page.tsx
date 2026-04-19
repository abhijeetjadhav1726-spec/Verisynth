'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';

type Tab = 'All' | 'Image' | 'Video';
type Verdict = 'FAKE' | 'AUTHENTIC' | 'UNCERTAIN';
type Risk = 'HIGH' | 'MEDIUM' | 'LOW';

interface Scan {
  id: string;
  filename: string;
  type: 'Image' | 'Video';
  date: string;
  verdict: Verdict;
  confidence: number;
  trust: number;
  risk: Risk;
}

const scans: Scan[] = [
  { id: '1', filename: 'interview_clip.mp4', type: 'Video', date: 'Jun 1, 2025', verdict: 'FAKE', confidence: 92, trust: 12, risk: 'HIGH' },
  { id: '2', filename: 'press_photo_01.jpg', type: 'Image', date: 'Jun 1, 2025', verdict: 'AUTHENTIC', confidence: 96, trust: 91, risk: 'LOW' },
  { id: '4', filename: 'senator_speech.mp4', type: 'Video', date: 'May 31, 2025', verdict: 'FAKE', confidence: 88, trust: 18, risk: 'HIGH' },
  { id: '5', filename: 'campaign_banner.png', type: 'Image', date: 'May 30, 2025', verdict: 'AUTHENTIC', confidence: 99, trust: 97, risk: 'LOW' },
  { id: '7', filename: 'product_launch.mp4', type: 'Video', date: 'May 29, 2025', verdict: 'AUTHENTIC', confidence: 94, trust: 88, risk: 'LOW' },
  { id: '8', filename: 'news_thumbnail.webp', type: 'Image', date: 'May 28, 2025', verdict: 'UNCERTAIN', confidence: 55, trust: 44, risk: 'MEDIUM' },
];

const verdictConfig: Record<Verdict, { label: string; color: string; bg: string }> = {
  FAKE: { label: 'LIKELY FAKE', color: 'var(--accent-danger)', bg: 'rgba(255,77,77,0.12)' },
  AUTHENTIC: { label: 'AUTHENTIC', color: 'var(--accent-success)', bg: 'rgba(0,217,102,0.12)' },
  UNCERTAIN: { label: 'UNCERTAIN', color: 'var(--accent-warning)', bg: 'rgba(245,166,35,0.12)' },
};

const riskConfig: Record<Risk, { color: string; bg: string }> = {
  HIGH: { color: 'var(--accent-danger)', bg: '#2A1010' },
  MEDIUM: { color: 'var(--accent-warning)', bg: '#261E0A' },
  LOW: { color: 'var(--accent-success)', bg: '#0A2016' },
};

const TypeIcon = ({ type }: { type: Scan['type'] }) => {
  if (type === 'Image') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
  if (type === 'Video') return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="14" height="16" rx="2"/><path d="m16 8 5-4v16l-5-4"/></svg>;
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
};

const navLinks = [
  { label: 'Dashboard', icon: '◈', href: '/dashboard', active: true },
  { label: 'Analyze', icon: '⊕', href: '/analyze', active: false },
  { label: 'Results', icon: '◉', href: '/results', active: false },

  { label: 'Settings', icon: '⚙', href: '#', active: false },
];

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('All');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = tab === 'All' ? scans : scans.filter((s) => s.type === tab);
  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageScans = filtered.slice((page - 1) * pageSize, page * pageSize);

  const totalScans = scans.length;
  const fakeCount = scans.filter((s) => s.verdict === 'FAKE').length;
  const avgConf = Math.round(scans.reduce((a, s) => a + s.confidence, 0) / scans.length);
  const avgTrust = Math.round(scans.reduce((a, s) => a + s.trust, 0) / scans.length);

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.sidebarLogo}>
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="#635BFF"/>
            <path d="M7 14L12 19L21 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>VeriSynth</span>
        </Link>

        <nav className={styles.sidebarNav}>
          {navLinks.map((l) => (
            <Link key={l.label} href={l.href} className={`${styles.navLink} ${l.active ? styles.navLinkActive : ''}`}>
              <span className={styles.navIcon}>{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.avatar}>
            <div className={styles.avatarImg}>JD</div>
            <div>
              <p className={styles.avatarName}>Jane Doe</p>
              <p className={styles.avatarPlan}>Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <div>
            <h1 className={styles.h1}>Dashboard</h1>
            <p className={styles.headerSub}>Overview of all your forensic scans</p>
          </div>
          <Link href="/analyze" className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Scan
          </Link>
        </div>

        {/* Stats row */}
        <div className={styles.stats}>
          {[
            { label: 'Total Scans', value: totalScans, icon: '📊', change: '+12%', positive: true },
            { label: 'Fake Detected', value: fakeCount, icon: '⚠️', change: '+5%', positive: false },
            { label: 'Avg Confidence', value: `${avgConf}%`, icon: '🎯', change: '+2.1%', positive: true },
            { label: 'Avg Trust Score', value: avgTrust, icon: '🛡️', change: '+8pts', positive: true },
          ].map((s) => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>{s.label}</span>
                <span className={styles.statIcon}>{s.icon}</span>
              </div>
              <span className={styles.statValue}>{s.value}</span>
              <span className={`${styles.statChange} ${s.positive ? styles.statPos : styles.statNeg}`}>
                {s.change} vs last month
              </span>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className={styles.filterBar}>
          <div className={styles.filterTabs}>
            {(['All', 'Image', 'Video'] as Tab[]).map((t) => (
              <button
                key={t}
                className={`${styles.filterTab} ${tab === t ? styles.filterTabActive : ''}`}
                onClick={() => { setTab(t); setPage(1); }}
              >
                {t}
              </button>
            ))}
          </div>
          <div className={styles.filterRight}>
            <select className={styles.select} defaultValue="all-time">
              <option value="all-time">All time</option>
              <option value="30d">Last 30 days</option>
              <option value="7d">Last 7 days</option>
            </select>
            <select className={styles.select} defaultValue="all-risk">
              <option value="all-risk">All risk levels</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>File</th>
                <th>Type</th>
                <th>Date</th>
                <th>Verdict</th>
                <th>Confidence</th>
                <th>Trust</th>
                <th>Risk</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageScans.map((scan) => {
                const v = verdictConfig[scan.verdict];
                const r = riskConfig[scan.risk];
                return (
                  <tr key={scan.id} className={styles.row}>
                    <td>
                      <div className={styles.fileCell}>
                        <div className={styles.fileThumbnail}>
                          <TypeIcon type={scan.type} />
                        </div>
                        <span className={styles.fileName}>{scan.filename}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.typeBadge}>
                        <TypeIcon type={scan.type} />
                        {scan.type}
                      </span>
                    </td>
                    <td><span className={styles.dateCell}>{scan.date}</span></td>
                    <td>
                      <span className={styles.verdictChip} style={{ color: v.color, background: v.bg }}>
                        {v.label}
                      </span>
                    </td>
                    <td>
                      <div className={styles.confCell}>
                        <span className={styles.confVal}>{scan.confidence}%</span>
                        <div className={styles.confBar}>
                          <div className={styles.confFill} style={{ width: `${scan.confidence}%`, background: scan.confidence > 80 ? v.color : 'var(--accent-warning)' }} />
                        </div>
                      </div>
                    </td>
                    <td><span className={styles.trustVal}>{scan.trust}</span></td>
                    <td>
                      <span className={styles.riskBadge} style={{ color: r.color, background: r.bg }}>
                        {scan.risk}
                      </span>
                    </td>
                    <td>
                      <Link href="/results" className={styles.actionBtn} title="View report">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} scans
          </span>
          <div className={styles.paginationBtns}>
            <button
              className={styles.pageBtn}
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              ←
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`${styles.pageBtn} ${page === i + 1 ? styles.pageBtnActive : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className={styles.pageBtn}
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              →
            </button>
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className={styles.mobileNav}>
        <div className={styles.mobileNavInner}>
          {[
            { label: 'Dashboard', icon: '◈', href: '/dashboard' },
            { label: 'Analyze', icon: '⊕', href: '/analyze' },
            { label: 'Results', icon: '◉', href: '/results' },
            { label: 'Settings', icon: '⚙', href: '#' },
          ].map((l) => (
            <Link key={l.label} href={l.href} className={`${styles.mobileNavLink} ${l.href === '/dashboard' ? styles.active : ''}`}>
              <span className={styles.mobileNavIcon}>{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
