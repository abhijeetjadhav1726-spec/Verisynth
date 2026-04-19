'use client';
import React, { useEffect, useRef, useState } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import styles from './results.module.css';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface SourcePrediction {
  name: string;
  confidence: number;
  category: string;
}

interface SourceAnalysis {
  probable_sources: SourcePrediction[];
  primary_source: string;
  primary_confidence: number;
  analysis_details: {
    metadata_signals: string[];
    frequency_signals: string[];
    texture_signals: string[];
    color_signals: string[];
    geometry_signals: string[];
  };
}

const technicalRows = [
  { label: 'GAN Fingerprint Analysis', val: 'Residual artifacts detected in facial blending zone' },
  { label: 'Temporal Consistency', val: '14 frames with non-coherent blinking sequence at 00:23' },
];

function DonutRing({ confidence = 87 }: { confidence?: number }) {
  const pct = confidence;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const [val, setVal] = useState(0);
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    let start: number;
    const duration = 1200;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * pct));
      setOffset(circ - eased * pct / 100 * circ);
      if (p < 1) requestAnimationFrame(step);
    };
    const timeout = setTimeout(() => requestAnimationFrame(step), 400);
    return () => clearTimeout(timeout);
  }, [circ]);

  return (
    <div className={styles.donut}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke="#635BFF"
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />
        <text x="60" y="64" textAnchor="middle" fill="white" fontSize="18" fontWeight="600" fontFamily="Inter, sans-serif">
          {val}%
        </text>
      </svg>
      <span className={styles.donutLabel}>Confidence</span>
    </div>
  );
}

function TrustBar({ trustScore = 23 }: { trustScore?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(trustScore), 500);
    return () => clearTimeout(t);
  }, [trustScore]);

  const barColor = trustScore >= 70 ? '#2ed573' : trustScore >= 40 ? '#f5a623' : '#ff4d4d';
  const trustLabel = trustScore >= 70 ? 'High Trust' : trustScore >= 40 ? 'Medium Trust' : 'Low Trust';

  return (
    <div className={styles.trustBarWrap}>
      <div className={styles.trustBarHeader}>
        <span className={styles.trustBarLabel}>Trust Score</span>
        <span className={styles.trustBarVal}>{trustScore} / 100</span>
      </div>
      <div className={styles.trustBarTrack}>
        <div className={styles.trustBarFill} style={{ width: `${w}%`, background: barColor }} />
      </div>
      <span className={styles.trustBarSub} style={{ color: barColor }}>{trustLabel}</span>
    </div>
  );
}

function Accordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className={styles.accordion}>
      <p className={styles.accordionTitle}>Technical Insights</p>
      {technicalRows.map((row, i) => (
        <div key={row.label} className={styles.accordionRow}>
          <button className={styles.accordionBtn} onClick={() => setOpen(open === i ? null : i)}>
            <span>{row.label}</span>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {open === i && <p className={styles.accordionBody}>{row.val}</p>}
        </div>
      ))}
    </div>
  );
}

const categoryIcons: Record<string, string> = {
  'Diffusion Model': '🎨',
  'GAN': '🔄',
  'Face Manipulation': '🎭',
  'Face Reenactment': '🎬',
  'Unknown': '❓',
};

const categoryColors: Record<string, string> = {
  'Diffusion Model': '#a78bfa',
  'GAN': '#60a5fa',
  'Face Manipulation': '#f97316',
  'Face Reenactment': '#fb7185',
  'Unknown': '#94a3b8',
};

const detailLabels: Record<string, { label: string; icon: string }> = {
  metadata_signals:  { label: 'Metadata Analysis',  icon: '📋' },
  frequency_signals: { label: 'Frequency Domain',   icon: '📡' },
  texture_signals:   { label: 'Texture & Noise',    icon: '🔍' },
  color_signals:     { label: 'Color Distribution',  icon: '🎨' },
  geometry_signals:  { label: 'Face Geometry',       icon: '📐' },
};

function SourceAttribution({ sourceData }: { sourceData: SourceAnalysis }) {
  const [showDetails, setShowDetails] = useState(false);
  const primary = sourceData.probable_sources[0];

  return (
    <div className={styles.sourceCard}>
      <div className={styles.sourceHeader}>
        <div className={styles.sourceTitleRow}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
          <span className={styles.sourceTitle}>Source Attribution</span>
        </div>
        <span className={styles.sourceBadge}>
          {categoryIcons[primary?.category] || '🔍'} {sourceData.primary_source}
        </span>
      </div>

      {/* Primary source highlight */}
      <div className={styles.sourcePrimary}>
        <div className={styles.sourcePrimaryLeft}>
          <span className={styles.sourcePrimaryName}>{sourceData.primary_source}</span>
          <span className={styles.sourcePrimaryCategory} style={{ color: categoryColors[primary?.category] || '#94a3b8' }}>
            {primary?.category}
          </span>
        </div>
        <div className={styles.sourcePrimaryRight}>
          <span className={styles.sourcePrimaryConf}>{sourceData.primary_confidence}%</span>
          <span className={styles.sourcePrimaryLabel}>confidence</span>
        </div>
      </div>

      {/* Bar chart of all sources */}
      <div className={styles.sourceBars}>
        {sourceData.probable_sources.map((src, i) => (
          <div key={src.name} className={styles.sourceBarRow}>
            <div className={styles.sourceBarLabel}>
              <span className={styles.sourceBarIcon}>{categoryIcons[src.category] || '🔍'}</span>
              <span className={styles.sourceBarName}>{src.name}</span>
              <span className={styles.sourceBarPct}>{src.confidence}%</span>
            </div>
            <div className={styles.sourceBarTrack}>
              <div
                className={styles.sourceBarFill}
                style={{
                  width: `${src.confidence}%`,
                  background: i === 0
                    ? 'linear-gradient(90deg, #635BFF, #a78bfa)'
                    : i === 1
                    ? 'linear-gradient(90deg, rgba(99,91,255,0.5), rgba(167,139,250,0.5))'
                    : 'rgba(99,91,255,0.25)',
                  animationDelay: `${0.3 + i * 0.15}s`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Expandable forensic details */}
      <button
        className={styles.sourceDetailsToggle}
        onClick={() => setShowDetails(!showDetails)}
      >
        <span>Forensic Analysis Details</span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: showDetails ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {showDetails && (
        <div className={styles.sourceDetails}>
          {Object.entries(sourceData.analysis_details).map(([key, signals]) => {
            const meta = detailLabels[key] || { label: key, icon: '📊' };
            return (
              <div key={key} className={styles.sourceDetailGroup}>
                <p className={styles.sourceDetailLabel}>
                  {meta.icon} {meta.label}
                </p>
                {(signals as string[]).map((sig, j) => (
                  <p key={j} className={styles.sourceDetailSignal}>{sig}</p>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const filename = searchParams.get('filename') || 'interview_clip.mp4';
  const type = searchParams.get('type') || 'Video';
  const prediction = searchParams.get('prediction') || 'fake';
  const confidence = parseInt(searchParams.get('confidence') || '87', 10);
  
  const isFake = prediction.toLowerCase() === 'fake';
  const trustScore = isFake ? Math.max(0, 100 - confidence) : confidence;

  const [heatmapSrc, setHeatmapSrc] = useState<string | null>(null);
  const [sourceData, setSourceData] = useState<SourceAnalysis | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('verisynth_heatmap');
    if (stored) {
      setHeatmapSrc(stored);
    }

    const storedSource = sessionStorage.getItem('verisynth_source');
    if (storedSource) {
      try {
        setSourceData(JSON.parse(storedSource));
      } catch (e) {
        console.error('Failed to parse source data', e);
      }
    }
  }, []);

  return (
    <div className="container">
      <div className={styles.header}>
        <Link href="/analyze" className={styles.back}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Analyze
        </Link>
        <h1 className={styles.h1}>Analysis Results</h1>
        <p className={styles.headerSub}>{filename} · {type.charAt(0).toUpperCase() + type.slice(1)} · Analyzed just now</p>
      </div>

      <div className={styles.grid}>
        {/* LEFT COLUMN */}
        <div className={styles.left}>
          {/* Verdict card */}
          <div className={styles.verdictCard} style={{ background: isFake ? 'rgba(255,77,77,0.06)' : 'rgba(46,213,115,0.06)', borderColor: isFake ? 'rgba(255,77,77,0.2)' : 'rgba(46,213,115,0.2)' }}>
            <div className={styles.verdictTop}>
              <span className={styles.verdictPill} style={{ background: isFake ? 'rgba(255, 77, 77, 0.1)' : 'rgba(46, 213, 115, 0.1)', color: isFake ? '#ff4d4d' : '#2ed573' }}>
                {isFake ? 'LIKELY FAKE' : 'LIKELY REAL'}
              </span>
              <span className={styles.riskBadge} style={{ background: isFake ? '#2A1010' : '#0A2A10', color: isFake ? '#ff4d4d' : '#2ed573' }}>
                {isFake ? 'HIGH RISK' : 'LOW RISK'}
              </span>
            </div>
            <p className={styles.verdictText}>{isFake ? 'Manipulated media detected' : 'Media appears authentic'}</p>
            {isFake && <span className={styles.manipChip}>AI Generation Detected</span>}
          </div>

          {/* Score row */}
          <div className={styles.scoreRow}>
            <DonutRing confidence={confidence} />
            <TrustBar trustScore={trustScore} />
          </div>

          {/* Explanation */}
          <div className={styles.explanationCard}>
            <p className={styles.explanationTitle}>AI Explanation</p>
            <p className={styles.explanationBody}>
              {isFake 
                ? `The model predicted this ${type} to be fake with ${confidence}% confidence. High-frequency blending artifacts and anomalous patterns were detected, consistent with deepfake generation.` 
                : `The model predicted this ${type} to be real with ${confidence}% confidence. No significant signs of manipulation or synthesis were found.`}
            </p>
          </div>

          {/* Source Attribution */}
          {sourceData && (
            <SourceAttribution sourceData={sourceData} />
          )}

          {/* Grad-CAM Heatmap */}
          <div className={styles.heatmapCard}>
            <div className={styles.heatmapInner}>
              {heatmapSrc ? (
                <img
                  src={heatmapSrc}
                  alt="Grad-CAM heatmap showing regions of interest"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'var(--radius-card)' }}
                />
              ) : (
                <div className={styles.heatmapOverlay}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={isFake ? 'rgba(255,77,77,0.8)' : 'rgba(46,213,115,0.8)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span>Upload and analyze media to see the Grad-CAM heatmap</span>
                </div>
              )}
            </div>
            <div style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)' }}>
              {heatmapSrc 
                ? (isFake 
                    ? '🔴 Red/warm regions indicate areas the AI model found suspicious — potential manipulation zones.'
                    : '🟢 Heatmap shows the regions the model analyzed. No significant manipulation signatures detected.')
                : 'Grad-CAM visualization will appear here after analysis.'}
            </div>
          </div>

          <Accordion />
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.right}>
          {/* Confidence timeline (video) */}
          <div className={styles.graphCard}>
            <p className={styles.graphTitle}>Confidence Timeline</p>
            <p className={styles.graphSub}>Per-frame confidence score (0–100%)</p>
            <div className={styles.graphArea}>
              <svg width="100%" height="140" viewBox="0 0 400 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#635BFF" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#635BFF" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path
                  d="M0,100 C40,95 60,30 100,25 C140,20 160,55 200,50 C240,45 260,15 300,20 C320,22 340,40 400,35"
                  fill="url(#lineGrad)"
                  stroke="none"
                />
                <path
                  d="M0,100 C40,95 60,30 100,25 C140,20 160,55 200,50 C240,45 260,15 300,20 C320,22 340,40 400,35"
                  fill="none"
                  stroke="#635BFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <div className={styles.graphAxes}>
                <span>Frame 0</span>
                <span>Frame 1,240</span>
              </div>
            </div>
          </div>



          {/* Recommended action */}
          <div className={styles.actionCard} style={{ background: isFake ? 'rgba(255,77,77,0.06)' : 'rgba(46,213,115,0.06)', borderColor: isFake ? 'rgba(255,77,77,0.2)' : 'rgba(46,213,115,0.2)' }}>
            <div className={styles.actionTop}>
              {isFake ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2ed573" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              )}
              <span className={styles.actionHeadline} style={{ color: isFake ? '#ff4d4d' : '#2ed573' }}>{isFake ? 'Do Not Publish' : 'Safe to Publish'}</span>
            </div>
            <p className={styles.actionBody}>
              {isFake 
                ? 'This media shows strong indicators of synthetic manipulation. We recommend withholding publication, flagging for human review, and preserving the original file for forensic audit.'
                : 'This media appears to be authentic. No significant signs of manipulation were detected. It is likely safe for publication.'}
            </p>
          </div>

          {/* Share + Export */}
          <div className={styles.shareRow}>
            <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied to clipboard!'); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share
            </button>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => window.print()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <>
      <Nav />
      <main className={styles.main}>
        <Suspense fallback={<div className="container" style={{padding: '100px 0', textAlign: 'center', color: '#fff'}}>Loading results...</div>}>
          <ResultsContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
