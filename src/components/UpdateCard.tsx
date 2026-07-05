'use client';

import React, { useState } from 'react';
import { LawUpdate } from '../lib/api';

interface UpdateCardProps {
  update: LawUpdate;
  index: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Bill:      'hsl(210,80%,65%)',
  Act:       'hsl(142,55%,50%)',
  Ordinance: 'hsl(42,85%,58%)',
};

const SOURCE_COLORS: Record<number, string> = {
  1: 'hsl(142,55%,45%)',   // NA  – green
  2: 'hsl(220,70%,60%)',   // Senate – blue
  3: 'hsl(42,85%,55%)',    // MoLaw – gold
};

export default function UpdateCard({ update, index }: UpdateCardProps) {
  const [open, setOpen] = useState(false);

  const catColor = CATEGORY_COLORS[update.category] ?? 'var(--text-secondary)';
  const srcColor = SOURCE_COLORS[update.source_id]  ?? 'hsl(280,60%,65%)';

  /** Returns true if the URL is a placeholder / mock that won't resolve. */
  const isMockUrl = (url?: string | null): boolean => {
    if (!url) return true;
    return (
      url.includes('mock') ||
      url.includes('localhost') ||
      url.includes('example.com') ||
      !url.startsWith('http')
    );
  };

  const portalMock = isMockUrl(update.url);
  const pdfMock    = isMockUrl(update.pdf_url);

  /** Build a Google-search fallback URL for the title on the source's domain. */
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
        {/* Index */}
        <span className="law-index">{index + 1}</span>

        {/* Category pill */}
        <span className="law-cat-pill" style={{ color: catColor, borderColor: catColor }}>
          {update.category}
        </span>

        {/* Title */}
        <span className="law-title">{update.title}</span>

        {/* Source badge */}
        <span className="law-source" style={{ color: srcColor }}>
          {update.source_name}
        </span>

        {/* Date */}
        <span className="law-date">{formatDate(update.date_found)}</span>

        {/* Chevron */}
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

            {/* Full title */}
            <div className="detail-section detail-full">
              <span className="detail-label">Full Title</span>
              <p className="detail-title-full">{update.title}</p>
            </div>

            {/* Meta row */}
            <div className="detail-section">
              <span className="detail-label">Source</span>
              <span className="detail-value" style={{ color: srcColor }}>{update.source_name}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">Category</span>
              <span className="detail-value" style={{ color: catColor }}>{update.category}</span>
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

            {/* Actions */}
            <div className="detail-section detail-full detail-actions">

              {/* Mock-data notice */}
              {(portalMock || pdfMock) && (
                <div className="mock-notice">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14" height="14">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>
                    This entry was scraped from <strong>fallback demo data</strong> because the live
                    government portal was unreachable. The direct links below are placeholders.
                    Use <strong>Search on Google</strong> to find the real document.
                  </span>
                </div>
              )}

              {/* Portal link */}
              {!portalMock && update.url ? (
                <a
                  href={update.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-btn btn-portal"
                  onClick={e => e.stopPropagation()}
                >
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="15" height="15">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                  View on Official Portal
                </a>
              ) : (
                <a
                  href={searchFallback(update.title, update.source_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-btn btn-search-fallback"
                  onClick={e => e.stopPropagation()}
                  title="Search for this document on Google"
                >
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="15" height="15">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  Search on Google
                </a>
              )}

              {/* PDF link */}
              {!pdfMock && update.pdf_url ? (
                <a
                  href={update.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-btn btn-pdf"
                  onClick={e => e.stopPropagation()}
                >
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
          gap: 14px;
          padding: 14px 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.18s ease;
          user-select: none;
        }
        .law-row:hover { border-color: hsl(145,15%,28%); background: var(--bg-card-hover); }
        .law-row:focus-visible { outline: 2px solid var(--accent-gold); outline-offset: 2px; }
        .law-row-open {
          border-color: hsl(145,20%,30%);
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          background: var(--bg-card-hover);
        }

        .law-index {
          font-size: 0.75rem; font-weight: 700; color: var(--text-muted);
          text-align: center; font-variant-numeric: tabular-nums;
        }
        .law-cat-pill {
          font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.06em; padding: 3px 9px; border-radius: 20px;
          border: 1px solid; background: rgba(255,255,255,0.04);
          text-align: center; white-space: nowrap;
        }
        .law-title {
          font-size: 0.9rem; font-weight: 500; color: var(--text-primary);
          line-height: 1.4; overflow: hidden; text-overflow: ellipsis;
          display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;
        }
        .law-source {
          font-size: 0.75rem; font-weight: 600; white-space: nowrap;
          display: none;
        }
        .law-date {
          font-size: 0.72rem; color: var(--text-muted); white-space: nowrap;
        }
        .law-chevron {
          color: var(--text-muted); transition: transform 0.2s ease;
          display: flex; align-items: center; justify-content: center;
        }
        .law-chevron-open { transform: rotate(180deg); color: var(--accent-gold); }

        /* ── Detail panel ── */
        .law-detail {
          background: hsl(145,28%,5%);
          border: 1px solid hsl(145,20%,25%);
          border-top: none;
          border-bottom-left-radius: var(--radius-md);
          border-bottom-right-radius: var(--radius-md);
          padding: 20px 24px;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px 24px;
        }
        .detail-section { display: flex; flex-direction: column; gap: 4px; }
        .detail-full { grid-column: 1 / -1; }
        .detail-label {
          font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.07em; color: var(--text-muted);
        }
        .detail-title-full {
          font-size: 0.92rem; font-weight: 500; color: var(--text-primary);
          line-height: 1.5; margin: 0;
        }
        .detail-value { font-size: 0.875rem; color: var(--text-primary); font-weight: 500; }
        .detail-notified {
          font-size: 0.8rem; font-weight: 600; padding: 3px 10px;
          border-radius: 20px; width: fit-content;
        }
        .notified { background: var(--primary-green-glow); color: var(--primary-green); border: 1px solid hsla(142,55%,45%,.25); }
        .pending  { background: hsla(42,85%,55%,.12); color: var(--accent-gold); border: 1px solid hsla(42,70%,55%,.2); }
        .detail-actions {
          display: flex; gap: 10px; flex-wrap: wrap; padding-top: 4px;
        }
        .detail-btn {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 0.82rem; font-weight: 600; padding: 9px 16px;
          border-radius: var(--radius-sm); transition: all 0.18s ease;
          text-decoration: none;
        }
        .btn-portal {
          background: rgba(255,255,255,.05); border: 1px solid var(--border);
          color: var(--text-secondary);
        }
        .btn-portal:hover { border-color: hsl(145,15%,35%); color: var(--text-primary); background: rgba(255,255,255,.08); }
        .btn-pdf {
          background: linear-gradient(135deg, var(--primary-green) 0%, hsl(142,60%,35%) 100%);
          color: #fff; border: none;
          box-shadow: 0 4px 12px var(--primary-green-glow);
        }
        .btn-pdf:hover { transform: translateY(-1px); box-shadow: 0 6px 16px var(--primary-green-glow); }
        .detail-no-pdf {
          font-size: 0.8rem; color: var(--text-muted);
          align-self: center; font-style: italic;
        }

        /* Mock / fallback notice */
        .mock-notice {
          display: flex; align-items: flex-start; gap: 8px;
          background: hsla(35,85%,55%,.08);
          border: 1px solid hsla(35,85%,55%,.2);
          border-radius: var(--radius-sm);
          padding: 10px 14px;
          font-size: 0.78rem; color: hsl(35,80%,65%);
          line-height: 1.5; width: 100%;
        }
        .mock-notice svg { flex-shrink: 0; margin-top: 1px; }
        .mock-notice strong { color: hsl(42,90%,65%); }

        /* Search fallback button */
        .btn-search-fallback {
          background: hsla(35,85%,55%,.1);
          border: 1px solid hsla(35,85%,55%,.25);
          color: hsl(42,85%,65%);
        }
        .btn-search-fallback:hover {
          background: hsla(35,85%,55%,.2);
          border-color: hsl(42,85%,65%);
          color: hsl(42,95%,72%);
        }

        /* Responsive */
        @media (min-width: 900px) {
          .law-source { display: block; }
        }
        @media (max-width: 640px) {
          .law-row { grid-template-columns: 28px 70px 1fr 20px; }
          .law-date { display: none; }
          .law-detail { padding: 16px; }
        }
      `}</style>
    </>
  );
}
