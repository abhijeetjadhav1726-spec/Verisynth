'use client';
import React, { useState, useRef, useCallback } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import styles from './analyze.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Tab = 'image' | 'video';
type Stage = 'idle' | 'uploading' | 'scanning' | 'scoring' | 'done';

const acceptMap: Record<Tab, string> = {
  image: 'image/*',
  video: 'video/*',
};

const stageLabels: Stage[] = ['idle', 'uploading', 'scanning', 'scoring', 'done'];
const stageDisplay = ['Uploading', 'Scanning', 'Scoring', 'Done'];

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

const TypeIcon = ({ type }: { type: Tab }) => {
  if (type === 'image') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  );
  if (type === 'video') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="14" height="16" rx="2"/><path d="m16 8 5-4v16l-5-4"/>
    </svg>
  );
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  );
};

export default function AnalyzePage() {
  const [tab, setTab] = useState<Tab>('image');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => { setFile(f); setStage('idle'); setProgress(0); };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const router = useRouter();

  const analyzeMedia = async () => {
    if (!file) return;
    
    setStage('uploading');
    setProgress(20);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const endpoint = tab === 'video' ? 'predict-video' : 'predict-image';
      
      setStage('scanning');
      setProgress(50);
      
      const res = await fetch(`http://localhost:8000/${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Analysis failed');
      }
      
      setStage('scoring');
      setProgress(80);
      
      const data = await res.json();
      
      setStage('done');
      setProgress(100);

      // Store heatmap in sessionStorage (too large for URL params)
      if (data.heatmap) {
        sessionStorage.setItem('verisynth_heatmap', data.heatmap);
      } else {
        sessionStorage.removeItem('verisynth_heatmap');
      }

      // Store source attribution analysis
      if (data.source_analysis) {
        sessionStorage.setItem('verisynth_source', JSON.stringify(data.source_analysis));
      } else {
        sessionStorage.removeItem('verisynth_source');
      }
      
      const query = new URLSearchParams({
        filename: file.name,
        type: tab,
        prediction: data.prediction || 'Unknown',
        confidence: data.confidence ? Math.round(data.confidence).toString() : '0'
      }).toString();
      
      router.push(`/results?${query}`);
      
    } catch (err) {
      console.error(err);
      alert('Error analyzing file. Is the backend running?');
      setStage('idle');
      setProgress(0);
    }
  };

  const currentStageIdx = stageLabels.indexOf(stage);

  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.h1}>Analyze Media</h1>
            <p className={styles.sub}>Upload any image or video file for instant deepfake analysis.</p>
          </div>

          {/* Tab switcher */}
          <div className={styles.tabs}>
            {(['image', 'video'] as Tab[]).map((t) => (
              <button
                key={t}
                className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
                onClick={() => { setTab(t); setFile(null); setStage('idle'); }}
              >
                <TypeIcon type={t} />
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Drop zone */}
          {!file && (
            <div
              className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept={acceptMap[tab]}
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div className={styles.dropIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p className={styles.dropTitle}>Drop {tab} file here or <span className={styles.dropBrowse}>browse</span></p>
              <p className={styles.dropSub}>
                {tab === 'image' && 'Supports JPG, PNG, WEBP, HEIC — up to 25 MB'}
                {tab === 'video' && 'Supports MP4, MOV, AVI, MKV — up to 500 MB'}
              </p>
            </div>
          )}

          {/* Preview card */}
          {file && (
            <div className={styles.preview}>
              <div className={styles.previewIcon}>
                <TypeIcon type={tab} />
              </div>
              <div className={styles.previewInfo}>
                <p className={styles.previewName}>{file.name}</p>
                <p className={styles.previewMeta}>{formatBytes(file.size)} · {tab.charAt(0).toUpperCase() + tab.slice(1)}</p>
              </div>
              <button
                className={styles.removeBtn}
                onClick={() => { setFile(null); setStage('idle'); setProgress(0); }}
                title="Remove file"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          )}

          {/* Loading state */}
          {stage !== 'idle' && (
            <div className={styles.loader}>
              <div className={styles.loaderBar}>
                <div className={styles.loaderFill} style={{ width: `${progress}%` }} />
              </div>
              <div className={styles.stageLabels}>
                {stageDisplay.map((label, i) => (
                  <span
                    key={label}
                    className={`${styles.stageLabel} ${i < currentStageIdx - 1 ? styles.stageDone : i === currentStageIdx - 1 ? styles.stageCurrent : styles.stagePending}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          {stage === 'done' ? (
            <Link href="/results" className={styles.analyzeBtn} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
              View Results
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          ) : (
            <button
              className={styles.analyzeBtn}
              disabled={!file || stage !== 'idle'}
              onClick={analyzeMedia}
            >
              {stage === 'idle' ? 'Analyze' : 'Analyzing...'}
            </button>
          )}

          <p className={styles.note}>Your files are encrypted in transit and deleted after 24 hours.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
