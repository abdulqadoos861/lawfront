'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiClient, LawUpdate, Source, UpdatesResponse } from '../lib/api';
import SearchBox from '../components/SearchBox';
import FilterBar from '../components/FilterBar';
import UpdateCard from '../components/UpdateCard';

const LIMIT = 12;

export default function PublicFeed() {
  const [response, setResponse]   = useState<UpdatesResponse | null>(null);
  const [sources,  setSources]    = useState<Source[]>([]);
  const [search,      setSearch]      = useState('');
  const [category,    setCategory]    = useState('');
  const [sourceId,    setSourceId]    = useState('');
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [page,        setPage]        = useState(1);
  const [loading,     setLoading]     = useState(true);

  const updates: LawUpdate[] = response?.results ?? [];
  const totalPages = response?.pages ?? 1;
  const totalCount = response?.total ?? 0;

  // Load sources once
  useEffect(() => {
    apiClient.getSources().then(setSources).catch(console.error);
  }, []);

  // Fetch updates on filter/page change
  const fetchUpdates = useCallback(async () => {
    setLoading(true);
    try {
      const srcIdNum = sourceId ? parseInt(sourceId, 10) : undefined;
      const data = await apiClient.getUpdates(search, category, srcIdNum, dateFrom || undefined, dateTo || undefined, page, LIMIT);
      setResponse(data);
    } catch (err) {
      console.error("Failed to fetch updates", err);
    } finally {
      setLoading(false);
    }
  }, [search, category, sourceId, dateFrom, dateTo, page]);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  const handleReset = () => {
    setSearch(''); setCategory(''); setSourceId('');
    setDateFrom(''); setDateTo(''); setPage(1);
  };

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="feed-layout">

      {/* Live Ticker */}
      <div className="live-ticker-banner">
        <div className="ticker-label">
          <span className="ticker-dot"></span>
          Live Feed
        </div>
        <div className="ticker-track">
          <div className="ticker-content">
            {[...updates.slice(0, 4), ...updates.slice(0, 4)].map((item, i) => (
              <span key={i} className="ticker-item">
                <strong>{item.source_name}:</strong> {item.title} •
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="main-header">
        <div className="container header-container">
          <div className="logo-section">
            <span className="gold-crest">🇵🇰</span>
            <div className="logo-text">
              <h1>Pakistan Law Aggregator</h1>
              <p>Official Legislative Intelligence Portal</p>
            </div>
          </div>
          <nav className="header-nav" style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
            <Link href="/about" className="nav-text-link">About Us</Link>
            <Link href="/services" className="nav-text-link">Services</Link>
            <Link href="/contact" className="nav-text-link">Contact Us</Link>
            <Link href="/admin" className="admin-portal-link">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <span>Admin Panel</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container feed-content">

        {/* Hero */}
        <section className="feed-hero">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Updated Daily
          </div>
          <h2>Federal &amp; Provincial Legislative Updates</h2>
          <p>
            Tracking bills, acts, and ordinances from the Senate, National Assembly, Ministry of Law, and Provincial Assemblies — consolidated in one place.
          </p>

          {/* Quick Stats Bar */}
          <div className="stats-bar">
            <div className="stat-chip">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span><strong>{totalCount}</strong> Updates</span>
            </div>
            <div className="stat-chip">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/>
              </svg>
              <span><strong>{sources.filter(s => s.is_active).length}</strong> Active Sources</span>
            </div>
            <div className="stat-chip">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <span>Page <strong>{page}</strong> of <strong>{totalPages}</strong></span>
            </div>
          </div>
        </section>

        {/* Source Tabs */}
        <div className="source-tabs-wrapper animate-fade-in">
          <div className="source-tabs-header">
            <h3>Filter by Department / Source</h3>
          </div>
          <div className="source-tabs-scroll">
            <button
              className={`source-tab-btn ${sourceId === '' ? 'active' : ''}`}
              onClick={() => { setSourceId(''); setPage(1); }}
            >
              <span className="tab-btn-icon">🇵🇰</span>
              <div className="tab-btn-info">
                <span className="tab-btn-title">All Sources</span>
                <span className="tab-btn-desc">Consolidated Law Updates</span>
              </div>
            </button>

            {sources.filter(s => s.is_active).map((src) => {
              let emoji = '🏛️';
              let shortName = src.name;
              let description = 'Legislative Portal';
              
              if (src.name.includes('National Assembly')) {
                emoji = '🏛️';
                shortName = 'National Assembly';
                description = 'Bills, acts & schedules';
              } else if (src.name.includes('Senate')) {
                emoji = '🏛️';
                shortName = 'Senate of Pakistan';
                description = 'Bills status & debates';
              } else if (src.name.includes('Ministry of Law')) {
                emoji = '⚖️';
                shortName = 'Ministry of Law';
                description = 'SROs, rules & publications';
              } else if (src.name.includes('Punjab')) {
                emoji = '🌾';
                shortName = 'Punjab Assembly';
                description = 'Provincial laws & acts';
              } else if (src.name.includes('Sindh')) {
                emoji = '🌴';
                shortName = 'Sindh Assembly';
                description = 'Provincial laws & updates';
              }
              
              return (
                <button
                  key={src.id}
                  className={`source-tab-btn ${sourceId === src.id.toString() ? 'active' : ''}`}
                  onClick={() => { setSourceId(src.id.toString()); setPage(1); }}
                >
                  <span className="tab-btn-icon">{emoji}</span>
                  <div className="tab-btn-info">
                    <span className="tab-btn-title">{shortName}</span>
                    <span className="tab-btn-desc">{description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search + Filters */}
        <section className="filter-section">
          <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
          <FilterBar
            selectedCategory={category}
            onCategoryChange={(c) => { setCategory(c); setPage(1); }}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={(d) => { setDateFrom(d); setPage(1); }}
            onDateToChange={(d) => { setDateTo(d); setPage(1); }}
            onReset={handleReset}
          />
        </section>

        {/* Feed Grid */}
        <section className="feed-grid-wrapper">
          {loading ? (
            <div className="feed-loading">
              <div className="loading-orbs">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
              </div>
              <p>Scanning legislative databases...</p>
            </div>
          ) : updates.length > 0 ? (
            <>
              {/* List header */}
              <div className="list-header-row">
                <span className="lh-num">#</span>
                <span className="lh-cat">Type</span>
                <span className="lh-title">Title</span>
                <span className="lh-src">Source</span>
                <span className="lh-date">Detected</span>
                <span></span>
              </div>

              <div className="feed-list">
                {updates.map((item, i) => (
                  <UpdateCard key={item.id} update={item} index={i + (page - 1) * LIMIT} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn page-nav"
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                  >
                    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Prev
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let p: number;
                      if (totalPages <= 7) {
                        p = i + 1;
                      } else if (page <= 4) {
                        p = i + 1;
                      } else if (page >= totalPages - 3) {
                        p = totalPages - 6 + i;
                      } else {
                        p = page - 3 + i;
                      }
                      return (
                        <button
                          key={p}
                          className={`page-btn page-num ${page === p ? 'active' : ''}`}
                          onClick={() => goToPage(p)}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    className="page-btn page-nav"
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Next
                    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="feed-empty animate-fade-in">
              <div className="empty-icon-wrapper">
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="48" height="48">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3>No Legislative Updates Found</h3>
              <p>No laws or bills match your current filters. Try widening your search or date range.</p>
              <button onClick={handleReset} className="btn-secondary" style={{ marginTop: '20px' }}>
                Reset All Filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container footer-container">
          <div className="footer-brand">
            <span>🇵🇰</span>
            <div>
              <p className="footer-title">Pakistan Law Aggregator</p>
              <p className="footer-disclaimer">Data crawled daily from official government portals. For authoritative texts, refer to the printed Gazette of Pakistan.</p>
            </div>
          </div>
          <div className="footer-links">
            <a href="https://na.gov.pk" target="_blank" rel="noopener noreferrer">National Assembly</a>
            <a href="https://senate.gov.pk" target="_blank" rel="noopener noreferrer">Senate</a>
            <a href="https://molaw.gov.pk" target="_blank" rel="noopener noreferrer">Ministry of Law</a>
          </div>
          <p className="footer-copy">© 2026 All Rights Reserved</p>
        </div>
      </footer>

      <style jsx global>{`
        .feed-layout { display: flex; flex-direction: column; min-height: 100vh; }

        /* Ticker */
        .live-ticker-banner {
          display: flex; align-items: center;
          background: hsl(145, 30%, 4%);
          border-bottom: 1px solid var(--border);
          font-size: 0.8rem; height: 36px; overflow: hidden;
        }
        .ticker-label {
          background: var(--primary-green); color: #fff;
          font-weight: 700; height: 100%; display: flex;
          align-items: center; padding: 0 16px; gap: 6px;
          white-space: nowrap; text-transform: uppercase;
          letter-spacing: 0.05em; box-shadow: 4px 0 10px rgba(0,0,0,.4);
          flex-shrink: 0;
        }
        .ticker-dot {
          width: 7px; height: 7px; background: #fff;
          border-radius: 50%; animation: pulse-glow 1.5s infinite;
        }
        .ticker-track { overflow: hidden; width: 100%; }
        .ticker-content { display: flex; white-space: nowrap; animation: marquee 30s linear infinite; }
        .ticker-item { padding: 0 24px; color: var(--text-secondary); }

        /* Header */
        .main-header {
          background: rgba(10,20,14,0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          position: sticky; top: 0; z-index: 100;
        }
        .header-container {
          display: flex; align-items: center;
          justify-content: space-between; height: 76px;
        }
        .logo-section { display: flex; align-items: center; gap: 12px; }
        .gold-crest { font-size: 2.2rem; }
        .logo-text h1 {
          font-family: var(--font-title); font-size: 1.3rem;
          font-weight: 700; letter-spacing: -0.02em; color: var(--text-primary);
        }
        .logo-text p {
          font-size: 0.75rem; color: var(--accent-gold);
          font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase;
        }
        .nav-text-link {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: color var(--transition-fast);
        }
        .nav-text-link:hover {
          color: var(--accent-gold);
        }
        .admin-portal-link {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.875rem; font-weight: 600; color: var(--accent-gold);
          border: 1px solid var(--border-focus); padding: 10px 18px;
          border-radius: var(--radius-md); background: var(--accent-gold-glow);
          transition: all var(--transition-fast);
        }
        .admin-portal-link:hover {
          background: var(--accent-gold); color: var(--bg-main);
          box-shadow: 0 4px 14px var(--accent-gold-glow); transform: translateY(-1px);
        }

        /* Hero */
        .feed-hero { text-align: center; margin: 52px 0 36px; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--primary-green-glow); border: 1px solid hsla(142,55%,45%,.25);
          border-radius: 20px; padding: 6px 14px; font-size: 0.78rem;
          font-weight: 600; color: var(--primary-green); text-transform: uppercase;
          letter-spacing: 0.06em; margin-bottom: 16px;
        }
        .hero-badge-dot {
          width: 6px; height: 6px; background: var(--primary-green);
          border-radius: 50%; animation: pulse-glow 1.5s infinite;
        }
        .feed-hero h2 {
          font-family: var(--font-title); font-size: 2.4rem; font-weight: 700;
          color: var(--text-primary); margin-bottom: 14px; letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .feed-hero > p {
          max-width: 680px; margin: 0 auto 28px; font-size: 1.05rem;
          line-height: 1.65; color: var(--text-secondary);
        }

        /* Stats chips */
        .stats-bar {
          display: inline-flex; gap: 10px; flex-wrap: wrap;
          justify-content: center; margin-top: 4px;
        }
        .stat-chip {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 30px; padding: 8px 16px;
          font-size: 0.84rem; color: var(--text-secondary);
        }
        .stat-chip svg { color: var(--accent-gold); }
        .stat-chip strong { color: var(--text-primary); }

        /* Filter section */
        .filter-section { margin-bottom: 8px; }

        /* Source Tabs Styling */
        .source-tabs-wrapper {
          margin-bottom: 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
        }
        .source-tabs-header h3 {
          font-family: var(--font-title);
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--accent-gold);
          margin-bottom: 16px;
        }
        .source-tabs-scroll {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }
        @media (max-width: 900px) {
          .source-tabs-scroll {
            display: flex;
            overflow-x: auto;
            scroll-behavior: smooth;
            padding-bottom: 8px;
            margin: 0 -12px;
            padding-left: 12px;
            padding-right: 12px;
          }
          .source-tabs-scroll::-webkit-scrollbar {
            height: 4px;
          }
          .source-tab-btn {
            flex-shrink: 0;
            width: 220px;
          }
        }
        .source-tab-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-normal);
        }
        .source-tab-btn:hover {
          border-color: hsl(145, 15%, 28%);
          background: var(--bg-card-hover);
          transform: translateY(-2px);
        }
        .source-tab-btn.active {
          background: linear-gradient(135deg, rgba(142, 55, 45, 0.1) 0%, rgba(42, 70, 55, 0.15) 100%);
          border-color: var(--accent-gold);
          box-shadow: 0 4px 16px var(--accent-gold-glow);
        }
        .tab-btn-icon {
          font-size: 1.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tab-btn-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .tab-btn-title {
          font-family: var(--font-title);
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .source-tab-btn.active .tab-btn-title {
          color: var(--accent-gold);
        }
        .tab-btn-desc {
          font-size: 0.72rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* List */
        .list-header-row {
          display: grid;
          grid-template-columns: 36px 84px 1fr auto auto 22px;
          gap: 14px;
          padding: 8px 20px;
          font-size: 0.68rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.07em;
          color: var(--text-muted);
          margin-bottom: 6px;
        }
        .lh-src { display: none; }
        @media (min-width: 900px) { .lh-src { display: block; } }
        @media (max-width: 640px) {
          .list-header-row { grid-template-columns: 28px 70px 1fr 20px; }
          .lh-date { display: none; }
        }
        .feed-list {
          display: flex; flex-direction: column; gap: 6px;
          margin-bottom: 40px;
        }
        .feed-grid-wrapper { min-height: 350px; margin-bottom: 80px; }

        /* Loading orbs */
        .feed-loading {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; height: 300px; gap: 20px;
        }
        .loading-orbs { display: flex; gap: 10px; align-items: center; }
        .orb {
          width: 12px; height: 12px; border-radius: 50%;
          background: var(--accent-gold); animation: orb-bounce 1.2s ease-in-out infinite;
        }
        .orb-1 { animation-delay: 0s; }
        .orb-2 { animation-delay: 0.15s; background: var(--primary-green); }
        .orb-3 { animation-delay: 0.3s; }
        @keyframes orb-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        .feed-loading p { color: var(--text-secondary); font-size: 0.95rem; }

        /* Empty state */
        .feed-empty {
          background: var(--bg-card); border: 1px dashed var(--border);
          border-radius: var(--radius-lg); padding: 56px 32px;
          text-align: center; max-width: 540px; margin: 0 auto;
        }
        .empty-icon-wrapper {
          width: 72px; height: 72px; border-radius: 50%;
          background: var(--bg-card-hover); display: flex;
          align-items: center; justify-content: center; margin: 0 auto 20px;
        }
        .empty-icon-wrapper svg { color: var(--text-muted); }
        .feed-empty h3 {
          font-family: var(--font-title); font-size: 1.3rem;
          margin-bottom: 8px; color: var(--text-primary);
        }
        .feed-empty p { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.5; }

        /* Pagination */
        .pagination {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; margin-top: 8px;
        }
        .page-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: var(--radius-md);
          font-size: 0.875rem; font-weight: 500; cursor: pointer;
          transition: all var(--transition-fast);
          background: var(--bg-card); border: 1px solid var(--border);
          color: var(--text-secondary);
        }
        .page-btn:hover:not(:disabled) {
          border-color: var(--accent-gold); color: var(--accent-gold);
          background: var(--accent-gold-glow);
        }
        .page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .page-btn.active {
          background: var(--accent-gold); color: var(--bg-main);
          border-color: var(--accent-gold); font-weight: 700;
          box-shadow: 0 4px 12px var(--accent-gold-glow);
        }
        .page-numbers { display: flex; gap: 4px; }
        .page-num { padding: 9px 14px; }

        /* Footer */
        .main-footer {
          margin-top: auto; background: hsl(145,30%,4%);
          border-top: 1px solid var(--border); padding: 36px 0;
        }
        .footer-container {
          display: flex; flex-wrap: wrap; justify-content: space-between;
          align-items: center; gap: 24px;
        }
        .footer-brand { display: flex; align-items: flex-start; gap: 12px; font-size: 1.5rem; }
        .footer-title { font-weight: 600; font-size: 0.9rem; color: var(--text-primary); margin-bottom: 4px; }
        .footer-disclaimer { font-size: 0.75rem; color: var(--text-muted); max-width: 420px; line-height: 1.5; }
        .footer-links { display: flex; gap: 20px; }
        .footer-links a {
          font-size: 0.875rem; color: var(--text-secondary);
          transition: color var(--transition-fast);
        }
        .footer-links a:hover { color: var(--accent-gold); }
        .footer-copy { font-size: 0.8rem; color: var(--text-muted); }

        /* Responsive */
        @media (max-width: 768px) {
          .header-container { height: auto; padding: 16px 0; flex-direction: column; gap: 12px; }
          .feed-hero h2 { font-size: 1.8rem; }
          .feed-hero > p { font-size: 0.95rem; }
          .footer-container { flex-direction: column; text-align: center; }
          .footer-links { justify-content: center; }
          .footer-brand { justify-content: center; text-align: left; }
          .page-numbers { display: none; }
        }
      `}</style>
    </div>
  );
}
