'use client';

import React, { useState } from 'react';
import { LawUpdate } from '../lib/api';

interface UpdateCardProps {
  update: LawUpdate;
  index: number;
}

const CATEGORY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Bill:      { text: 'hsl(192,90%,60%)',   bg: 'hsla(192,90%,55%,0.1)',  border: 'hsla(192,90%,55%,0.25)' },
  Act:       { text: 'hsl(152,60%,55%)',   bg: 'hsla(152,60%,45%,0.1)',  border: 'hsla(152,60%,45%,0.25)' },
  Ordinance: { text: 'hsl(42,85%,62%)',    bg: 'hsla(42,85%,58%,0.1)',   border: 'hsla(42,85%,58%,0.25)' },
};

const SOURCE_COLORS: Record<number, { text: string; glow: string }> = {
  1: { text: 'hsl(258,80%,72%)',  glow: 'hsla(258,80%,65%,0.2)' },   // NA – indigo
  2: { text: 'hsl(192,90%,60%)',  glow: 'hsla(192,90%,55%,0.2)' },   // Senate – cyan
  3: { text: 'hsl(42,85%,62%)',   glow: 'hsla(42,85%,58%,0.2)' },    // MoLaw – gold
};

export default function UpdateCard({ update, index }: UpdateCardProps) {
  const [open, setOpen] = useState(false);

  const catStyle = CATEGORY_COLORS[update.category] ?? { text: 'var(--text-secondary)', bg: 'transparent', border: 'var(--border)' };
  const srcStyle = SOURCE_COLORS[update.source_id]  ?? { text: 'hsl(280,70%,70%)', glow: 'hsla(280,75%,65%,0.2)' };

  const isMockUrl = (url?: string | null): boolean => {
    if (!url) return true;
    return url.includes('mock') || url.includes('localhost') || url.includes('example.com') || !url.startsWith('http');
  };

  const portalMock = isMockUrl(update.url);
  const pdfMock    = isMockUrl(update.pdf_url);

  const SOURCE_DOMAINS: Record<number, string> = {
    1: 'na.gov.pk',
    2: 'senate.gov.pk',
    3: 'molaw.gov.pk',
  };

  const searchFallback = (title: string, sourceId: number) => {
    const domain = SOURCE_DOMAINS[sourceId] ?? '';
    const q = encodeURIComponent(`${title} site:${domain || 'gov.pk'}`);
    return `https://www.google.com/search?q=${q}`;
  };

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleDateString('en-PK', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return s; }
  };

  return (
    <>
      {/* ── Row ── */}
      <div
        className={`law-row ${open ? 'law-row-open' : ''}`}
        onClick={() => setOpen(o => !o)}
        role="button"
        aria-expanded={open}
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setOpen(o => !o)}
      >
        <span className="law-index">{index + 1}</span>

        <span
          className="law-cat-pill"
          style={{ color: catStyle.text, background: catStyle.bg, borderColor: catStyle.border }}
        >
          {update.category}
        </span>

        <span className="law-title">{update.title}</span>

        <span className="law-source" style={{ color: srcStyle.text }}>
          {update.source_name}
        </span>

        <span className="law-date">{formatDate(update.date_found)}</span>

        <span className={`law-chevron ${open ? 'law-chevron-open' : ''}`}>
          <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14" height="14">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </span>
      </div>

      {/* ── Detail panel ── */}
      {open && (
        <div className="law-detail animate-fade-in">
          <div className="detail-grid">

            <div className="detail-section detail-full">
              <span className="detail-label">Full Title</span>
              <p className="detail-title-full">{update.title}</p>
            </div>

            <div className="detail-section">
              <span className="detail-label">Source</span>
              <span className="detail-value" style={{ color: srcStyle.text }}>{update.source_name}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">Category</span>
              <span className="detail-value" style={{ color: catStyle.text }}>{update.category}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">Date Detected</span>
              <span className="detail-value">{formatDate(update.date_found)}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">Status</span>
              <span className={`detail-notified ${update.is_notified ? 'notified' : 'pending'}`}>
                {update.is_notified ? '✓ Alert Sent' : '⏳ Pending'}
              </span>
            </div>

            <div className="detail-section detail-full detail-actions">
              {(portalMock || pdfMock) && (
                <div className="mock-notice">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14" height="14">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>
                    Scraped from <strong>fallback demo data</strong>. The direct links below are placeholders.
                    Use <strong>Search on Google</strong> to find the real document.
                  </span>
                </div>
              )}

              {!portalMock && update.url ? (
                <a href={update.url} target="_blank" rel="noopener noreferrer"
                  className="detail-btn btn-portal" onClick={e => e.stopPropagation()}>
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="15" height="15">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                  View on Official Portal
                </a>
              ) : (
                <a href={searchFallback(update.title, update.source_id)} target="_blank"
                  rel="noopener noreferrer" className="detail-btn btn-search-fallback"
                  onClick={e => e.stopPropagation()} title="Search for this document on Google">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="15" height="15">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  Search on Google
                </a>
              )}

              {!pdfMock && update.pdf_url ? (
                <a href={update.pdf_url} target="_blank" rel="noopener noreferrer"
                  className="detail-btn btn-pdf" onClick={e => e.stopPropagation()}>
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="15" height="15">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Download PDF
                </a>
              ) : (
                <span className="detail-no-pdf">
                  {update.pdf_url ? '⚠️ PDF link unavailable (demo data)' : 'No PDF Available'}
                </span>
              )}
            </div>

          </div>
        </div>
      )}

      <style jsx>{`
        /* ── Row ── */
        .law-row {
          display: grid;
          grid-template-columns: 36px 84px 1fr auto auto 22px;
          align-items: center;
          gap: 14px; padding: 15px 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          user-select: none;
          position: relative; overflow: hidden;
        }
        .law-row::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          background: linear-gradient(180deg, var(--indigo), var(--violet));
          opacity: 0;
          transition: opacity var(--transition-fast);
          border-radius: 0;
        }
        .law-row:hover { border-color: var(--border-bright); background: var(--bg-card-hover); }
        .law-row:hover::before { opacity: 1; }
        .law-row:focus-visible { outline: 2px solid var(--indigo); outline-offset: 2px; }
        .law-row-open {
          border-color: hsl(228,20%,24%);
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          background: var(--bg-card-hover);
        }
        .law-row-open::before { opacity: 1; }

        .law-index {
          font-size: 0.72rem; font-weight: 700; color: var(--text-muted);
          text-align: center; font-variant-numeric: tabular-nums;
        }
        .law-cat-pill {
          font-size: 0.68rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.07em;
          padding: 3px 10px; border-radius: 20px;
          border: 1px solid; text-align: center; white-space: nowrap;
        }
        .law-title {
          font-size: 0.9rem; font-weight: 500; color: var(--text-primary);
          line-height: 1.4; overflow: hidden; text-overflow: ellipsis;
          display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;
        }
        .law-source {
          font-size: 0.72rem; font-weight: 700; white-space: nowrap; display: none;
        }
        .law-date { font-size: 0.7rem; color: var(--text-muted); white-space: nowrap; }
        .law-chevron {
          color: var(--text-muted); transition: transform 0.22s ease, color 0.18s ease;
          display: flex; align-items: center; justify-content: center;
        }
        .law-chevron-open { transform: rotate(180deg); color: var(--indigo-light); }

        /* ── Detail Panel ── */
        .law-detail {
          background: hsl(228,24%,7%);
          border: 1px solid hsl(228,20%,20%);
          border-top: 1px solid var(--indigo-glow);
          border-bottom-left-radius: var(--radius-md);
          border-bottom-right-radius: var(--radius-md);
          padding: 22px 24px;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px 24px;
        }
        .detail-section { display: flex; flex-direction: column; gap: 5px; }
        .detail-full { grid-column: 1 / -1; }
        .detail-label {
          font-size: 0.64rem; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.09em; color: var(--text-muted);
        }
        .detail-title-full {
          font-size: 0.92rem; font-weight: 500; color: var(--text-primary);
          line-height: 1.6; margin: 0;
        }
        .detail-value { font-size: 0.875rem; font-weight: 600; }
        .detail-notified {
          font-size: 0.78rem; font-weight: 700;
          padding: 4px 12px; border-radius: 20px; width: fit-content;
        }
        .notified {
          background: hsla(152,60%,45%,0.12); color: hsl(152,60%,55%);
          border: 1px solid hsla(152,60%,45%,0.25);
        }
        .pending {
          background: hsla(42,85%,58%,0.1); color: hsl(42,85%,62%);
          border: 1px solid hsla(42,85%,58%,0.2);
        }
        .detail-actions { display: flex; gap: 10px; flex-wrap: wrap; padding-top: 4px; }
        .detail-btn {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 0.82rem; font-weight: 700; padding: 10px 18px;
          border-radius: var(--radius-sm); transition: all var(--transition-fast);
          text-decoration: none; letter-spacing: 0.01em;
        }
        .btn-portal {
          background: rgba(255,255,255,.04);
          border: 1px solid var(--border); color: var(--text-secondary);
        }
        .btn-portal:hover {
          border-color: var(--indigo); color: var(--indigo-light);
          background: var(--indigo-glow); transform: translateY(-1px);
        }
        .btn-pdf {
          background: linear-gradient(135deg, var(--indigo) 0%, var(--violet) 100%);
          color: #fff; border: none;
          box-shadow: 0 4px 16px var(--indigo-glow);
        }
        .btn-pdf:hover { transform: translateY(-2px); box-shadow: 0 8px 24px var(--indigo-glow); }
        .detail-no-pdf { font-size: 0.78rem; color: var(--text-muted); align-self: center; font-style: italic; }
        .mock-notice {
          display: flex; align-items: flex-start; gap: 8px;
          background: hsla(42,85%,58%,0.07);
          border: 1px solid hsla(42,85%,58%,0.2);
          border-radius: var(--radius-sm); padding: 10px 14px;
          font-size: 0.78rem; color: hsl(42,80%,65%); line-height: 1.5; width: 100%;
        }
        .mock-notice svg { flex-shrink: 0; margin-top: 1px; }
        .mock-notice strong { color: hsl(42,90%,68%); }
        .btn-search-fallback {
          background: hsla(42,85%,58%,0.08);
          border: 1px solid hsla(42,85%,58%,0.22);
          color: hsl(42,85%,65%);
        }
        .btn-search-fallback:hover {
          background: hsla(42,85%,58%,0.18);
          border-color: hsl(42,85%,65%); color: hsl(42,95%,72%);
          transform: translateY(-1px);
        }

        /* Responsive */
        @media (min-width: 900px) { .law-source { display: block; } }
        @media (max-width: 640px) {
          .law-row { grid-template-columns: 28px 70px 1fr 20px; }
          .law-date { display: none; }
          .law-detail { padding: 16px; }
        }
      `}</style>
    </>
  );
}
