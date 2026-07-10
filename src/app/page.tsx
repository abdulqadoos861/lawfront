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

  useEffect(() => {
    apiClient.getSources().then(setSources).catch(console.error);
  }, []);

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

      {/* Ambient background orbs */}
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />
      <div className="bg-orb bg-orb-3" aria-hidden="true" />

      {/* Live Ticker */}
      <div className="live-ticker-banner">
        <div className="ticker-label">
          <span className="ticker-dot" />
          Live
        </div>
        <div className="ticker-track">
          <div className="ticker-content">
            {[...updates.slice(0, 5), ...updates.slice(0, 5)].map((item, i) => (
              <span key={i} className="ticker-item">
                <span className="ticker-source">{item.source_name}</span>
                {item.title} &nbsp;•&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="main-header">
        <div className="container header-container">
          <div className="logo-section">
            <div className="logo-icon-wrap">
              <span className="logo-flag">🇵🇰</span>
            </div>
            <div className="logo-text">
              <h1>Pakistan Law Aggregator</h1>
              <p>Official Legislative Intelligence Portal</p>
            </div>
          </div>

          <nav className="header-nav">
            <Link href="/about" className="nav-text-link">About</Link>
            <Link href="/services" className="nav-text-link">Services</Link>
            <Link href="/contact" className="nav-text-link">Contact</Link>
            <Link href="/admin" className="admin-portal-link" id="admin-panel-link">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              Admin Panel
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container feed-content">

        {/* Hero */}
        <section className="feed-hero animate-fade-in">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Updated Daily
          </div>
          <h2>Federal &amp; Provincial<br />Legislative Updates</h2>
          <p>
            Tracking bills, acts, and ordinances from the Senate, National Assembly,
            Ministry of Law &amp; Provincial Assemblies — all in one place.
          </p>

          <div className="stats-bar">
            <div className="stat-chip" id="stat-total-updates">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span><strong>{totalCount}</strong> Total Updates</span>
            </div>
            <div className="stat-chip" id="stat-active-sources">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/>
              </svg>
              <span><strong>{sources.filter(s => s.is_active).length}</strong> Active Sources</span>
            </div>
            <div className="stat-chip" id="stat-page-info">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <span>Page <strong>{page}</strong> of <strong>{totalPages}</strong></span>
            </div>
          </div>
        </section>

        {/* Source Tabs */}
        <div className="source-tabs-wrapper animate-fade-in">
          <div className="source-tabs-header">
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="13" height="13">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
            </svg>
            <h3>Filter by Department</h3>
          </div>
          <div className="source-tabs-scroll">
            <button
              id="source-tab-all"
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
                emoji = '🏛️'; shortName = 'National Assembly'; description = 'Bills, acts & schedules';
              } else if (src.name.includes('Senate')) {
                emoji = '⚖️'; shortName = 'Senate of Pakistan'; description = 'Bills status & debates';
              } else if (src.name.includes('Ministry of Law')) {
                emoji = '📜'; shortName = 'Ministry of Law'; description = 'SROs, rules & publications';
              } else if (src.name.includes('Punjab')) {
                emoji = '🌾'; shortName = 'Punjab Assembly'; description = 'Provincial laws & acts';
              } else if (src.name.includes('Sindh')) {
                emoji = '🌴'; shortName = 'Sindh Assembly'; description = 'Provincial laws & updates';
              }

              return (
                <button
                  key={src.id}
                  id={`source-tab-${src.id}`}
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
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
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
                <span />
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
                    id="page-prev"
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
                      if (totalPages <= 7)        p = i + 1;
                      else if (page <= 4)         p = i + 1;
                      else if (page >= totalPages - 3) p = totalPages - 6 + i;
                      else                        p = page - 3 + i;
                      return (
                        <button
                          key={p}
                          id={`page-btn-${p}`}
                          className={`page-btn page-num ${page === p ? 'active' : ''}`}
                          onClick={() => goToPage(p)}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    id="page-next"
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
              <button onClick={handleReset} className="btn-secondary" style={{ marginTop: '24px' }}>
                Reset All Filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-glow" aria-hidden="true" />
        <div className="container footer-container">
          <div className="footer-brand">
            <span className="footer-flag">🇵🇰</span>
            <div>
              <p className="footer-title">Pakistan Law Aggregator</p>
              <p className="footer-disclaimer">
                Data crawled daily from official government portals. For authoritative texts,
                refer to the printed Gazette of Pakistan.
              </p>
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
        /* ── Background Orbs ── */
        .bg-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
          animation: float 8s ease-in-out infinite;
        }
        .bg-orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, hsla(258,80%,65%,0.06) 0%, transparent 70%);
          top: -120px; left: -100px;
          animation-delay: 0s;
        }
        .bg-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, hsla(280,75%,65%,0.05) 0%, transparent 70%);
          top: 40%; right: -80px;
          animation-delay: 3s;
        }
        .bg-orb-3 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, hsla(192,90%,55%,0.04) 0%, transparent 70%);
          bottom: 10%; left: 30%;
          animation-delay: 5s;
        }

        .feed-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          position: relative;
        }

        /* ── Ticker ── */
        .live-ticker-banner {
          display: flex; align-items: center;
          background: hsl(228,30%,5%);
          border-bottom: 1px solid hsl(228,20%,14%);
          font-size: 0.78rem; height: 34px; overflow: hidden;
          position: relative; z-index: 10;
        }
        .ticker-label {
          background: linear-gradient(135deg, var(--indigo), var(--violet));
          color: #fff; font-weight: 700; height: 100%;
          display: flex; align-items: center; padding: 0 14px;
          gap: 7px; white-space: nowrap;
          text-transform: uppercase; letter-spacing: 0.08em;
          flex-shrink: 0;
          box-shadow: 6px 0 20px rgba(0,0,0,.5);
        }
        .ticker-dot {
          width: 6px; height: 6px; background: #fff;
          border-radius: 50%; animation: pulse-ring 1.5s infinite;
        }
        .ticker-track { overflow: hidden; width: 100%; }
        .ticker-content {
          display: flex; white-space: nowrap;
          animation: marquee 35s linear infinite;
        }
        .ticker-item { padding: 0 20px; color: var(--text-muted); }
        .ticker-source { color: var(--indigo-light); font-weight: 600; margin-right: 6px; }

        /* ── Header ── */
        .main-header {
          background: hsla(228,28%,6%,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid hsl(228,20%,14%);
          position: sticky; top: 0; z-index: 100;
        }
        .header-container {
          display: flex; align-items: center;
          justify-content: space-between; height: 72px;
        }
        .logo-section { display: flex; align-items: center; gap: 14px; }
        .logo-icon-wrap {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, var(--indigo-glow), var(--violet-glow));
          border: 1px solid hsl(258,40%,28%);
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
        }
        .logo-flag { font-size: 1.6rem; }
        .logo-text h1 {
          font-family: var(--font-title); font-size: 1.2rem;
          font-weight: 700; letter-spacing: -0.02em;
          background: linear-gradient(135deg, var(--text-primary) 40%, var(--indigo-light));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .logo-text p {
          font-size: 0.68rem; color: var(--indigo-light);
          font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
          opacity: 0.8;
        }
        .header-nav { display: flex; align-items: center; gap: 20px; }
        .nav-text-link {
          font-size: 0.88rem; font-weight: 500;
          color: var(--text-secondary);
          transition: color var(--transition-fast);
          position: relative;
        }
        .nav-text-link::after {
          content: '';
          position: absolute; bottom: -3px; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--indigo), var(--violet));
          border-radius: 2px;
          transform: scaleX(0); transform-origin: left;
          transition: transform var(--transition-fast);
        }
        .nav-text-link:hover { color: var(--text-primary); }
        .nav-text-link:hover::after { transform: scaleX(1); }
        .admin-portal-link {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 0.85rem; font-weight: 700;
          color: var(--gold);
          border: 1px solid hsla(42,85%,58%,.3);
          padding: 9px 18px; border-radius: var(--radius-md);
          background: var(--gold-glow);
          transition: all var(--transition-fast);
          letter-spacing: 0.02em;
        }
        .admin-portal-link:hover {
          background: var(--gold); color: hsl(228,28%,5%);
          box-shadow: 0 4px 20px var(--gold-glow);
          transform: translateY(-1px);
        }

        /* ── Hero ── */
        .feed-hero { text-align: center; margin: 60px 0 44px; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, var(--indigo-glow), var(--violet-glow));
          border: 1px solid hsla(258,80%,65%,.25);
          border-radius: 24px; padding: 7px 18px;
          font-size: 0.72rem; font-weight: 700;
          color: var(--indigo-light);
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 20px;
        }
        .hero-badge-dot {
          width: 6px; height: 6px; background: var(--indigo);
          border-radius: 50%; animation: pulse-ring 1.5s infinite;
        }
        .feed-hero h2 {
          font-family: var(--font-title);
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          line-height: 1.15;
          background: linear-gradient(135deg,
            var(--text-primary) 0%,
            var(--indigo-light) 50%,
            var(--violet) 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
          animation: gradient-shift 6s ease infinite;
        }
        .feed-hero > p {
          max-width: 640px; margin: 0 auto 32px;
          font-size: 1.05rem; line-height: 1.7;
          color: var(--text-secondary);
        }

        /* ── Stats ── */
        .stats-bar {
          display: inline-flex; gap: 10px;
          flex-wrap: wrap; justify-content: center;
        }
        .stat-chip {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 30px; padding: 9px 18px;
          font-size: 0.84rem; color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .stat-chip:hover {
          border-color: var(--indigo);
          background: var(--bg-card-hover);
        }
        .stat-chip svg { color: var(--indigo-light); }
        .stat-chip strong { color: var(--text-primary); }

        /* ── Source Tabs ── */
        .source-tabs-wrapper {
          margin-bottom: 28px;
          background: hsla(228,22%,10%,0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 24px;
        }
        .source-tabs-header {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 18px;
        }
        .source-tabs-header svg { color: var(--indigo-light); }
        .source-tabs-header h3 {
          font-family: var(--font-title);
          font-size: 0.75rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--indigo-light);
        }
        .source-tabs-scroll {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 10px;
        }
        .source-tab-btn {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          cursor: pointer; text-align: left;
          transition: all var(--transition-normal);
          position: relative; overflow: hidden;
        }
        .source-tab-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, var(--indigo-glow), var(--violet-glow));
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        .source-tab-btn:hover {
          border-color: var(--border-bright);
          background: var(--bg-card-hover);
          transform: translateY(-2px);
        }
        .source-tab-btn:hover::before { opacity: 1; }
        .source-tab-btn.active {
          border-color: var(--indigo);
          box-shadow: 0 4px 20px var(--indigo-glow);
        }
        .source-tab-btn.active::before { opacity: 1; }
        .tab-btn-icon {
          font-size: 1.7rem;
          display: flex; align-items: center; justify-content: center;
          position: relative; z-index: 1;
        }
        .tab-btn-info {
          display: flex; flex-direction: column; gap: 2px;
          min-width: 0; position: relative; z-index: 1;
        }
        .tab-btn-title {
          font-family: var(--font-title); font-size: 0.9rem;
          font-weight: 700; color: var(--text-primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .source-tab-btn.active .tab-btn-title { color: var(--indigo-light); }
        .tab-btn-desc {
          font-size: 0.7rem; color: var(--text-muted);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* ── Filter Section ── */
        .filter-section { margin-bottom: 10px; }

        /* ── List ── */
        .list-header-row {
          display: grid;
          grid-template-columns: 36px 84px 1fr auto auto 22px;
          gap: 14px; padding: 8px 20px;
          font-size: 0.66rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--text-muted); margin-bottom: 8px;
        }
        .lh-src { display: none; }
        @media (min-width: 900px) { .lh-src { display: block; } }
        @media (max-width: 640px) {
          .list-header-row { grid-template-columns: 28px 70px 1fr 20px; }
          .lh-date { display: none; }
        }
        .feed-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 44px; }
        .feed-grid-wrapper { min-height: 350px; margin-bottom: 80px; }

        /* ── Loading ── */
        .feed-loading {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; height: 320px; gap: 24px;
        }
        .loading-orbs { display: flex; gap: 10px; align-items: center; }
        .orb {
          width: 13px; height: 13px; border-radius: 50%;
          animation: orb-bounce 1.2s ease-in-out infinite;
        }
        .orb-1 { background: var(--indigo); animation-delay: 0s; }
        .orb-2 { background: var(--violet); animation-delay: 0.15s; }
        .orb-3 { background: var(--cyan); animation-delay: 0.3s; }
        .feed-loading p { color: var(--text-secondary); font-size: 0.95rem; letter-spacing: 0.02em; }

        /* ── Empty ── */
        .feed-empty {
          background: var(--bg-card);
          border: 1px dashed hsl(228,20%,22%);
          border-radius: var(--radius-xl);
          padding: 64px 40px;
          text-align: center; max-width: 520px; margin: 0 auto;
        }
        .empty-icon-wrapper {
          width: 80px; height: 80px; border-radius: 50%;
          background: linear-gradient(135deg, var(--indigo-glow), var(--violet-glow));
          border: 1px solid hsl(258,40%,24%);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px;
        }
        .empty-icon-wrapper svg { color: var(--indigo-light); }
        .feed-empty h3 {
          font-family: var(--font-title); font-size: 1.4rem;
          margin-bottom: 10px; color: var(--text-primary); font-weight: 700;
        }
        .feed-empty p { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; }

        /* ── Pagination ── */
        .pagination {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; margin-top: 8px;
        }
        .page-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: var(--radius-md);
          font-size: 0.875rem; font-weight: 600; cursor: pointer;
          transition: all var(--transition-fast);
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-secondary);
        }
        .page-btn:hover:not(:disabled) {
          border-color: var(--indigo);
          color: var(--indigo-light);
          background: var(--indigo-glow);
        }
        .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .page-btn.active {
          background: linear-gradient(135deg, var(--indigo), var(--violet));
          color: #fff; border-color: transparent; font-weight: 700;
          box-shadow: 0 4px 16px var(--indigo-glow);
        }
        .page-numbers { display: flex; gap: 4px; }
        .page-num { padding: 9px 14px; }

        /* ── Footer ── */
        .main-footer {
          margin-top: auto;
          background: hsl(228,30%,4%);
          border-top: 1px solid hsl(228,20%,12%);
          padding: 40px 0;
          position: relative; overflow: hidden;
        }
        .footer-glow {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 60%; height: 1px;
          background: linear-gradient(90deg, transparent, var(--indigo), var(--violet), transparent);
        }
        .footer-container {
          display: flex; flex-wrap: wrap; justify-content: space-between;
          align-items: center; gap: 28px; position: relative; z-index: 1;
        }
        .footer-brand { display: flex; align-items: flex-start; gap: 14px; }
        .footer-flag { font-size: 1.6rem; }
        .footer-title { font-weight: 700; font-size: 0.95rem; color: var(--text-primary); margin-bottom: 5px; }
        .footer-disclaimer { font-size: 0.75rem; color: var(--text-muted); max-width: 400px; line-height: 1.6; }
        .footer-links { display: flex; gap: 22px; }
        .footer-links a {
          font-size: 0.875rem; color: var(--text-muted);
          transition: color var(--transition-fast);
        }
        .footer-links a:hover { color: var(--indigo-light); }
        .footer-copy { font-size: 0.78rem; color: hsl(228,10%,35%); }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .source-tabs-scroll {
            display: flex; overflow-x: auto;
            scroll-behavior: smooth;
            padding-bottom: 6px;
            margin: 0 -8px; padding-left: 8px; padding-right: 8px;
          }
          .source-tabs-scroll::-webkit-scrollbar { height: 3px; }
          .source-tab-btn { flex-shrink: 0; width: 210px; }
        }
        @media (max-width: 768px) {
          .header-container { height: auto; padding: 14px 0; flex-direction: column; gap: 14px; }
          .feed-hero { margin: 44px 0 32px; }
          .footer-container { flex-direction: column; text-align: center; }
          .footer-links { justify-content: center; }
          .footer-brand { justify-content: center; text-align: left; }
          .page-numbers { display: none; }
        }
      `}</style>
    </div>
  );
}
