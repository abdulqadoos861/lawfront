'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient, Source, Admin, LawUpdate } from '../../lib/api';

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

const SCRAPER_TYPES = ['na', 'senate', 'molaw', 'generic', 'punjab', 'sindh'];

export default function AdminDashboard() {
  const [sources,      setSources]      = useState<Source[]>([]);
  const [admins,       setAdmins]       = useState<Admin[]>([]);
  const [newEmail,     setNewEmail]     = useState('');
  const [newName,      setNewName]      = useState('');
  const [updatesCount, setUpdatesCount] = useState(0);
  const [activeTab,    setActiveTab]    = useState<'dashboard' | 'crawler' | 'sources' | 'receivers'>('dashboard');
  const [todayUpdates, setTodayUpdates] = useState<LawUpdate[]>([]);
  const [loadingToday, setLoadingToday] = useState(false);

  const fetchTodayUpdates = async () => {
    setLoadingToday(true);
    try {
      const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
      const res = await apiClient.getUpdates("", "", undefined, todayStr, todayStr, 1, 200);
      setTodayUpdates(res.results);
    } catch (err) {
      console.error("Failed to load today's updates", err);
    } finally {
      setLoadingToday(false);
    }
  };

  // Source form
  const [newSrcName,    setNewSrcName]    = useState('');
  const [newSrcUrl,     setNewSrcUrl]     = useState('');
  const [newSrcType,    setNewSrcType]    = useState('generic');
  const [addingSrc,     setAddingSrc]     = useState(false);

  const [crawling, setCrawling] = useState(false);
  const [untilDate, setUntilDate] = useState('');
  // Initialize logs empty to avoid SSR/client time mismatch (hydration error).
  // Populated on the client after mount via useEffect below.
  const [logs, setLogs] = useState<LogEntry[]>([]);

  function formatTime() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
  }

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, { timestamp: formatTime(), type, message }]);
  };

  // Populate initial log entries on client-only (after mount)
  useEffect(() => {
    setLogs([
      { timestamp: formatTime(), type: 'info',    message: 'Admin Session Initialized.' },
      { timestamp: formatTime(), type: 'success', message: 'Database connection established.' },
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [srcList, admList, upData] = await Promise.all([
          apiClient.getSources(),
          apiClient.getAdmins(),
          apiClient.getUpdates(),
        ]);
        setSources(srcList);
        setAdmins(admList);
        setUpdatesCount(upData.total);
      } catch (err) {
        addLog('Failed to load initial system datasets.', 'error');
        console.error(err);
      }
    }
    loadData();
    fetchTodayUpdates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Crawl ────────────────────────────────────────────────────────────────
  const handleTriggerCrawl = async () => {
    if (crawling) return;
    setActiveTab('crawler');
    setCrawling(true);
    addLog('Manual crawler process triggered by admin...', 'info');
    if (untilDate) {
      addLog(`Date filter active – only scraping items from ${untilDate} onwards.`, 'info');
    }
    setTimeout(() => addLog('Resolving active source nodes...', 'info'), 600);
    setTimeout(() => addLog(`Starting trafilatura fetch session for ${sources.filter(s => s.is_active).length} active source(s)...`, 'info'), 1400);

    setTimeout(async () => {
      try {
        const result = await apiClient.triggerManualCrawl(untilDate || undefined);
        const [srcList, upData] = await Promise.all([
          apiClient.getSources(),
          apiClient.getUpdates(),
          fetchTodayUpdates()
        ]);
        setSources(srcList);
        setUpdatesCount(upData.total);

        addLog(`Successfully scanned ${result.sourcesScraped} official law portal(s).`, 'success');
        if (result.until_date) {
          addLog(`Date filter applied: items before ${result.until_date} were excluded.`, 'info');
        }
        if (result.newUpdates.length > 0) {
          result.newUpdates.forEach(t => addLog(`[New Law Detected]: "${t}"`, 'success'));
          addLog(`Database synced. Alert dispatched to ${admins.length} email receiver(s).`, 'success');
        } else {
          addLog('No new legislation detected. All sources match database.', 'info');
        }
      } catch (err) {
        addLog(`Crawler execution failed: ${err}`, 'error');
      } finally {
        setCrawling(false);
      }
    }, 2400);
  };

  // ─── Receivers ────────────────────────────────────────────────────────────
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    try {
      const added = await apiClient.addAdmin(newEmail, newName || 'Admin Officer');
      setAdmins(prev => [...prev, added]);
      addLog(`Registered new alert receiver: ${newEmail}`, 'success');
      setNewEmail(''); setNewName('');
    } catch (err) { addLog(`Failed to add receiver: ${err}`, 'error'); }
  };

  const handleRemoveAdmin = async (id: number, email: string) => {
    try {
      await apiClient.removeAdmin(id);
      setAdmins(prev => prev.filter(a => a.id !== id));
      addLog(`Removed receiver: ${email}`, 'warning');
    } catch (err) { addLog(`Failed to remove receiver: ${err}`, 'error'); }
  };

  // ─── Sources ──────────────────────────────────────────────────────────────
  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrcName.trim() || !newSrcUrl.trim()) return;
    setAddingSrc(true);
    try {
      const added = await apiClient.addSource({ name: newSrcName, url: newSrcUrl, scraper_type: newSrcType });
      setSources(prev => [...prev, added]);
      addLog(`Added new scraping source: ${newSrcName} (${newSrcUrl})`, 'success');
      setNewSrcName(''); setNewSrcUrl(''); setNewSrcType('generic');
    } catch (err) { addLog(`Failed to add source: ${err}`, 'error'); }
    finally { setAddingSrc(false); }
  };

  const handleToggleSource = async (id: number, name: string, current: boolean) => {
    try {
      const updated = await apiClient.toggleSource(id);
      setSources(prev => prev.map(s => s.id === id ? updated : s));
      addLog(`Source "${name}" ${updated.is_active ? 'enabled' : 'disabled'}.`, updated.is_active ? 'success' : 'warning');
    } catch (err) { addLog(`Failed to toggle source: ${err}`, 'error'); }
  };

  const handleDeleteSource = async (id: number, name: string) => {
    if (!confirm(`Delete source "${name}"? All its law updates will also be removed.`)) return;
    try {
      await apiClient.deleteSource(id);
      setSources(prev => prev.filter(s => s.id !== id));
      addLog(`Deleted source: "${name}". Associated law updates removed.`, 'warning');
    } catch (err) { addLog(`Failed to delete source: ${err}`, 'error'); }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'var(--success)';
      case 'warning': return 'var(--warning)';
      case 'error':   return 'var(--danger)';
      default:        return 'var(--text-secondary)';
    }
  };

  const activeSources   = sources.filter(s => s.is_active).length;
  const inactiveSources = sources.length - activeSources;

  return (
    <div className="admin-layout">

      {/* Header */}
      <header className="admin-header">
        <div className="container admin-header-container">
          <div className="admin-logo">
            <span className="crest-emoji">🇵🇰</span>
            <div>
              <h2>Admin Control Panel</h2>
              <p>Pakistan Law Aggregator Engine</p>
            </div>
          </div>
          <div className="header-actions">
            <button
              onClick={handleTriggerCrawl}
              className={`crawl-btn ${crawling ? 'crawling' : ''}`}
              disabled={crawling}
            >
              {crawling ? (
                <><div className="btn-spinner"></div><span>Crawling...</span></>
              ) : (
                <>
                  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="15" height="15">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 6H16"/>
                  </svg>
                  <span>Run Scraper</span>
                </>
              )}
            </button>
            <Link href="/" className="back-feed-link">
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Public Feed
            </Link>
          </div>
        </div>
      </header>

      <main className="container admin-content">

        {/* Stats */}
        <section className="stats-grid">
          {[
            { value: updatesCount, label: 'Total Law Updates',   icon: '📋', color: 'var(--accent-gold)' },
            { value: activeSources, label: 'Active Sources',     icon: '🟢', color: 'var(--success)' },
            { value: inactiveSources, label: 'Disabled Sources', icon: '⏸️', color: 'var(--text-muted)' },
            { value: admins.length,   label: 'Alert Receivers',  icon: '📧', color: 'hsl(210,80%,65%)' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </section>

        {/* Tabs */}
        <div className="admin-tabs">
          {(['dashboard', 'crawler', 'sources', 'receivers'] as const).map(tab => (
            <button
              key={tab}
              className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'dashboard' && <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"/></svg>}
              {tab === 'crawler'   && <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>}
              {tab === 'sources'   && <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/></svg>}
              {tab === 'receivers' && <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="15" height="15"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── TAB: Dashboard ── */}
        {activeTab === 'dashboard' && (
          <div className="tab-panel animate-fade-in">
            <div className="dashboard-block">
              <div className="block-header">
                <div>
                  <h3>Today's Legislative Updates</h3>
                  <p className="block-subtitle">
                    Updates collected today, {new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <span className="block-meta">{todayUpdates.length} updates found today</span>
              </div>

              {loadingToday ? (
                <div className="dashboard-loading">
                  <div className="btn-spinner"></div>
                  <span>Fetching today's records...</span>
                </div>
              ) : todayUpdates.length === 0 ? (
                <div className="no-updates-today">
                  <span className="no-updates-icon">📭</span>
                  <h4>No updates crawled today</h4>
                  <p>All sources are up to date. You can run a manual scrape above to check for updates.</p>
                </div>
              ) : (
                <div className="dashboard-sources-group">
                  {sources.map(src => {
                    const srcUpdates = todayUpdates.filter(u => u.source_id === src.id);
                    if (srcUpdates.length === 0) return null;

                    return (
                      <div key={src.id} className="dashboard-source-section">
                        <div className="dashboard-source-header">
                          <span className={`badge ${
                            src.scraper_type === 'na' ? 'badge-na' :
                            src.scraper_type === 'senate' ? 'badge-senate' :
                            src.scraper_type === 'molaw' ? 'badge-molaw' : 'badge-province'
                          }`}>
                            {src.name}
                          </span>
                          <span className="dashboard-source-count">{srcUpdates.length} update(s)</span>
                        </div>
                        <div className="dashboard-updates-list">
                          {srcUpdates.map(up => (
                            <div key={up.id} className="dashboard-update-row">
                              <div className="update-row-main">
                                <span className={`category-tag tag-${up.category ? up.category.toLowerCase() : 'bill'}`}>
                                  {up.category || 'Bill'}
                                </span>
                                <span className="update-row-title" title={up.title}>{up.title}</span>
                              </div>
                              <div className="update-row-actions">
                                <span className="update-time">
                                  {new Date(up.date_found).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className={`notification-pill ${up.is_notified ? 'notified' : 'pending'}`} title={up.is_notified ? 'Email dispatch sent' : 'Notification pending'}>
                                  {up.is_notified ? 'Notified' : 'Pending'}
                                </span>
                                {up.pdf_url ? (
                                  <a href={up.pdf_url} target="_blank" rel="noopener noreferrer" className="update-link-btn" title="View document">
                                    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="13" height="13">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    PDF
                                  </a>
                                ) : up.url ? (
                                  <a href={up.url} target="_blank" rel="noopener noreferrer" className="update-link-btn" title="View details page">
                                    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="13" height="13">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                    </svg>
                                    Link
                                  </a>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {(() => {
                    const knownSourceIds = sources.map(s => s.id);
                    const orphanUpdates = todayUpdates.filter(u => !knownSourceIds.includes(u.source_id));
                    if (orphanUpdates.length === 0) return null;
                    return (
                      <div className="dashboard-source-section">
                        <div className="dashboard-source-header">
                          <span className="badge badge-province">Other / Deleted Sources</span>
                          <span className="dashboard-source-count">{orphanUpdates.length} update(s)</span>
                        </div>
                        <div className="dashboard-updates-list">
                          {orphanUpdates.map(up => (
                            <div key={up.id} className="dashboard-update-row">
                              <div className="update-row-main">
                                <span className={`category-tag tag-${up.category ? up.category.toLowerCase() : 'bill'}`}>
                                  {up.category || 'Bill'}
                                </span>
                                <span className="update-row-title" title={up.title}>{up.title}</span>
                              </div>
                              <div className="update-row-actions">
                                <span className="update-time">
                                  {new Date(up.date_found).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className={`notification-pill ${up.is_notified ? 'notified' : 'pending'}`}>
                                  {up.is_notified ? 'Notified' : 'Pending'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: Crawler ── */}
        {activeTab === 'crawler' && (
          <div className="tab-panel animate-fade-in">
            <div className="dashboard-block console-block">
              <div className="block-header">
                <h3>Scraper Engine Logs</h3>
                <span className={`engine-status ${crawling ? 'running' : 'idle'}`}>
                  <span className="status-dot"></span>
                  {crawling ? 'Running' : 'Idle'}
                </span>
              </div>

              {/* ── Date filter row ── */}
              <div className="date-filter-row">
                <div className="date-filter-field">
                  <label htmlFor="until-date-input" className="date-filter-label">
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14" height="14">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    Scrape from date
                  </label>
                  <input
                    id="until-date-input"
                    type="date"
                    className="date-filter-input"
                    value={untilDate}
                    onChange={e => setUntilDate(e.target.value)}
                    disabled={crawling}
                    title="Only items published on or after this date will be collected"
                  />
                  {untilDate && (
                    <button
                      className="date-clear-btn"
                      onClick={() => setUntilDate('')}
                      disabled={crawling}
                      title="Clear date filter"
                    >
                      <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="12" height="12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  )}
                </div>
                {untilDate && (
                  <span className="date-filter-badge">
                    📅 Filtering from {new Date(untilDate + 'T00:00:00').toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>

              <div className="console-output">
                {logs.map((log, i) => (
                  <div key={i} className="log-line">
                    <span className="log-time">[{log.timestamp}]</span>
                    <span className="log-text" style={{ color: getLogColor(log.type) }}>
                      {log.type !== 'info' && <span className="log-badge log-badge-{log.type}">{log.type.toUpperCase()}</span>}
                      {log.message}
                    </span>
                  </div>
                ))}
                {crawling && (
                  <div className="log-line">
                    <span className="log-time">[{formatTime()}]</span>
                    <span className="log-text blink-text">Scraper worker active, parsing HTML tables...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Sources ── */}
        {activeTab === 'sources' && (
          <div className="tab-panel animate-fade-in">
            <div className="dashboard-block">
              <div className="block-header">
                <h3>Scraping Sources</h3>
                <span className="block-meta">{sources.length} configured · {activeSources} active</span>
              </div>

              <div className="sources-list">
                {sources.map((src) => (
                  <div key={src.id} className={`source-item ${!src.is_active ? 'source-inactive' : ''}`}>
                    <div className="source-info">
                      <div className="source-name-row">
                        <span className={`source-status-dot ${src.is_active ? 'active' : 'inactive'}`}></span>
                        <strong className="source-name">{src.name}</strong>
                        <span className="source-type-badge">{src.scraper_type}</span>
                      </div>
                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="source-url">
                        {src.url.replace(/^https?:\/\//, '')}
                      </a>
                      {src.last_crawled && (
                        <span className="source-last-crawled">
                          Last crawled: {new Date(src.last_crawled).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="source-actions">
                      <button
                        onClick={() => handleToggleSource(src.id, src.name, src.is_active)}
                        className={`toggle-btn ${src.is_active ? 'toggle-disable' : 'toggle-enable'}`}
                        title={src.is_active ? 'Disable source' : 'Enable source'}
                      >
                        {src.is_active ? (
                          <><svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="13" height="13"><path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> Disable</>
                        ) : (
                          <><svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="13" height="13"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Enable</>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteSource(src.id, src.name)}
                        className="delete-source-btn"
                        title="Delete source permanently"
                      >
                        <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="13" height="13">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add source form */}
              <form onSubmit={handleAddSource} className="add-source-form">
                <h4>Add New Scraping Source</h4>
                <div className="source-form-grid">
                  <input
                    className="input-field" placeholder="Source name (e.g. KPK Laws Portal)"
                    value={newSrcName} onChange={e => setNewSrcName(e.target.value)} required
                  />
                  <input
                    className="input-field" placeholder="Base URL (e.g. https://kpklaws.gov.pk)"
                    value={newSrcUrl} onChange={e => setNewSrcUrl(e.target.value)} required type="url"
                  />
                  <div className="select-wrapper-sm">
                    <select
                      className="input-field source-type-select"
                      value={newSrcType} onChange={e => setNewSrcType(e.target.value)}
                    >
                      {SCRAPER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="btn-primary add-source-btn" disabled={addingSrc}>
                    {addingSrc ? <div className="btn-spinner dark"></div> : (
                      <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="15" height="15">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                      </svg>
                    )}
                    Add Source
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── TAB: Receivers ── */}
        {activeTab === 'receivers' && (
          <div className="tab-panel animate-fade-in">
            <div className="dashboard-block">
              <div className="block-header">
                <h3>Email Alert Receivers</h3>
                <span className="block-meta">{admins.length} registered</span>
              </div>
              <p className="block-description">
                These recipients receive HTML digest emails via Resend.com when new laws, acts, or ordinances are detected by the crawler.
              </p>

              <div className="admins-list">
                {admins.map((adm) => (
                  <div key={adm.id} className="admin-item">
                    <div className="admin-avatar">
                      {(adm.name?.[0] || adm.email[0]).toUpperCase()}
                    </div>
                    <div className="admin-info">
                      <span className="admin-name">{adm.name}</span>
                      <span className="admin-email">{adm.email}</span>
                    </div>
                    <button onClick={() => handleRemoveAdmin(adm.id, adm.email)} className="delete-admin-btn" title="Remove receiver">
                      <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14" height="14">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddAdmin} className="add-admin-form">
                <h4>Register New Receiver</h4>
                <div className="form-group">
                  <input type="text" className="input-field" placeholder="Agency / Name" value={newName} onChange={e => setNewName(e.target.value)} />
                </div>
                <div className="form-group inline-group">
                  <input type="email" className="input-field" placeholder="alert.desk@domain.gov.pk" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
                  <button type="submit" className="btn-primary form-submit-btn">Register</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .admin-layout { display: flex; flex-direction: column; min-height: 100vh; }

        /* Header */
        .admin-header {
          background: hsl(145,28%,3%);
          border-bottom: 1px solid var(--border);
          position: sticky; top: 0; z-index: 100;
          backdrop-filter: blur(12px);
        }
        .admin-header-container {
          display: flex; align-items: center;
          justify-content: space-between; height: 68px;
        }
        .admin-logo { display: flex; align-items: center; gap: 10px; }
        .crest-emoji { font-size: 1.8rem; }
        .admin-logo h2 {
          font-family: var(--font-title); font-size: 1.1rem;
          font-weight: 700; color: var(--text-primary);
        }
        .admin-logo p { font-size: 0.72rem; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.06em; }

        .header-actions { display: flex; align-items: center; gap: 12px; }

        .crawl-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, var(--primary-green) 0%, hsl(142,60%,35%) 100%);
          color: #fff; font-weight: 600; font-size: 0.875rem;
          padding: 10px 18px; border-radius: var(--radius-md); cursor: pointer;
          transition: all var(--transition-fast);
          box-shadow: 0 4px 14px var(--primary-green-glow);
        }
        .crawl-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px var(--primary-green-glow); }
        .crawl-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .crawl-btn.crawling { background: var(--bg-card); color: var(--text-secondary); box-shadow: none; border: 1px solid var(--border); }

        .back-feed-link {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.85rem; font-weight: 600;
          color: var(--text-secondary); transition: color var(--transition-fast);
          border: 1px solid var(--border); padding: 10px 16px;
          border-radius: var(--radius-md);
        }
        .back-feed-link:hover { color: var(--accent-gold); border-color: var(--border-focus); }

        /* Content */
        .admin-content { margin-top: 32px; margin-bottom: 64px; }

        /* Stats */
        .stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px; margin-bottom: 28px;
        }
        .stat-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 24px 20px; text-align: center;
          transition: transform var(--transition-fast);
        }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-icon { font-size: 1.5rem; margin-bottom: 8px; }
        .stat-value { font-family: var(--font-title); font-size: 2rem; font-weight: 700; margin-bottom: 4px; }
        .stat-label { font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }

        /* Tabs */
        .admin-tabs {
          display: flex; gap: 4px; background: var(--bg-card);
          border: 1px solid var(--border); border-radius: var(--radius-md);
          padding: 4px; margin-bottom: 20px; width: fit-content;
        }
        .admin-tab {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: calc(var(--radius-md) - 4px);
          font-size: 0.875rem; font-weight: 500; cursor: pointer;
          color: var(--text-secondary); transition: all var(--transition-fast);
          text-transform: capitalize;
        }
        .admin-tab:hover { color: var(--text-primary); background: rgba(255,255,255,.04); }
        .admin-tab.active {
          background: var(--accent-gold); color: var(--bg-main);
          font-weight: 600; box-shadow: 0 2px 10px var(--accent-gold-glow);
        }
        .admin-tab.active svg { stroke: var(--bg-main); }

        .tab-panel { animation: fadeIn 0.25s ease forwards; }

        /* Block */
        .dashboard-block {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 28px;
        }
        .dashboard-block h3 {
          font-family: var(--font-title); font-size: 1.1rem;
          color: var(--text-primary); font-weight: 700;
        }
        .block-header {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; margin-bottom: 20px;
        }
        .block-header h3 { margin-bottom: 0; }
        .block-meta { font-size: 0.8rem; color: var(--text-muted); }
        .block-description { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.55; margin-bottom: 20px; }

        /* Engine status badge */
        .engine-status {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 0.8rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.05em; padding: 5px 12px; border-radius: 20px;
        }
        .engine-status.idle { background: rgba(255,255,255,.05); color: var(--text-muted); border: 1px solid var(--border); }
        .engine-status.running { background: var(--primary-green-glow); color: var(--primary-green); border: 1px solid hsla(142,55%,45%,.3); }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: pulse-glow 1.5s infinite; }

        /* Console */
        .console-output {
          background: hsl(145,30%,2.5%); border: 1px solid var(--border);
          border-radius: var(--radius-md); padding: 16px;
          min-height: 260px; max-height: 400px; overflow-y: auto;
          font-family: 'Courier New', monospace; font-size: 0.82rem;
          display: flex; flex-direction: column; gap: 6px;
        }
        .log-line { line-height: 1.45; }
        .log-time { color: var(--text-muted); margin-right: 8px; }
        .log-text { word-break: break-all; }
        .log-badge {
          display: inline-block; font-size: 0.65rem; font-weight: 700;
          padding: 1px 5px; border-radius: 3px; margin-right: 6px;
          background: rgba(255,255,255,.08); vertical-align: middle;
        }
        .blink-text { animation: blink 1.2s infinite; color: var(--accent-gold); }
        @keyframes blink { 0%,100%{opacity:.4} 50%{opacity:1} }

        /* Sources list */
        .sources-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
        .source-item {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,.02); border: 1px solid var(--border);
          border-radius: var(--radius-md); padding: 14px 18px; gap: 16px;
          transition: all var(--transition-fast);
        }
        .source-item:hover { border-color: hsl(145,15%,25%); }
        .source-inactive { opacity: 0.55; }

        .source-info { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
        .source-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .source-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .source-status-dot.active { background: var(--success); box-shadow: 0 0 6px var(--success); }
        .source-status-dot.inactive { background: var(--text-muted); }
        .source-name { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
        .source-type-badge {
          font-size: 0.7rem; font-weight: 600; padding: 2px 8px;
          border-radius: 10px; background: var(--accent-gold-glow);
          border: 1px solid hsla(42,70%,55%,.2); color: var(--accent-gold);
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .source-url { font-size: 0.8rem; color: var(--accent-gold); text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .source-url:hover { text-decoration: underline; }
        .source-last-crawled { font-size: 0.75rem; color: var(--text-muted); }

        .source-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .toggle-btn {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.78rem; font-weight: 600; padding: 7px 12px;
          border-radius: var(--radius-sm); cursor: pointer; transition: all var(--transition-fast);
        }
        .toggle-btn.toggle-disable { background: rgba(255,255,255,.04); border: 1px solid var(--border); color: var(--text-muted); }
        .toggle-btn.toggle-disable:hover { color: var(--warning); border-color: var(--warning); background: hsla(35,85%,55%,.08); }
        .toggle-btn.toggle-enable { background: var(--primary-green-glow); border: 1px solid hsla(142,55%,45%,.25); color: var(--primary-green); }
        .toggle-btn.toggle-enable:hover { background: var(--primary-green); color: #fff; }
        .delete-source-btn {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.78rem; font-weight: 600; padding: 7px 12px;
          border-radius: var(--radius-sm); cursor: pointer;
          color: var(--text-muted); border: 1px solid var(--border);
          background: transparent; transition: all var(--transition-fast);
        }
        .delete-source-btn:hover { color: var(--danger); border-color: var(--danger); background: hsla(0,75%,55%,.08); }

        /* Add source form */
        .add-source-form { border-top: 1px solid var(--border); padding-top: 24px; }
        .add-source-form h4 { font-family: var(--font-title); font-size: 0.95rem; color: var(--accent-gold); margin-bottom: 14px; }
        .source-form-grid { display: grid; grid-template-columns: 1fr 1fr auto auto; gap: 10px; align-items: end; }
        .select-wrapper-sm { position: relative; }
        .source-type-select { padding: 12px 16px; font-size: 0.875rem; cursor: pointer; }
        .add-source-btn { padding: 12px 20px; white-space: nowrap; }

        /* Admin receivers */
        .admins-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; max-height: 300px; overflow-y: auto; }
        .admin-item {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,.02); border: 1px solid var(--border);
          border-radius: var(--radius-md); padding: 12px 16px;
        }
        .admin-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-green) 0%, var(--accent-gold) 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .admin-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
        .admin-name { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
        .admin-email { font-size: 0.75rem; color: var(--text-muted); }
        .delete-admin-btn {
          color: var(--text-muted); cursor: pointer; padding: 7px;
          border-radius: 6px; transition: all var(--transition-fast); background: transparent; border: none;
        }
        .delete-admin-btn:hover { color: var(--danger); background: hsla(0,75%,55%,.1); }

        /* Add admin form */
        .add-admin-form { border-top: 1px solid var(--border); padding-top: 20px; }
        .add-admin-form h4 { font-family: var(--font-title); font-size: 0.95rem; color: var(--accent-gold); margin-bottom: 12px; }
        .form-group { margin-bottom: 12px; }
        .form-group.inline-group { display: flex; gap: 10px; }
        .form-group.inline-group .input-field { flex-grow: 1; }
        .form-group .input-field { width: 100%; font-size: 0.875rem; }
        .form-submit-btn { font-size: 0.875rem; padding: 0 20px; white-space: nowrap; }

        /* Date filter row */
        .date-filter-row {
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
          margin-bottom: 14px;
          padding: 12px 14px;
          background: rgba(255,255,255,.025);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
        }
        .date-filter-field {
          display: flex; align-items: center; gap: 8px;
        }
        .date-filter-label {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.8rem; font-weight: 600;
          color: var(--text-secondary); white-space: nowrap;
        }
        .date-filter-input {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text-primary);
          font-size: 0.82rem; padding: 7px 10px;
          cursor: pointer; transition: border-color var(--transition-fast);
          color-scheme: dark;
        }
        .date-filter-input:hover:not(:disabled),
        .date-filter-input:focus { border-color: var(--accent-gold); outline: none; }
        .date-filter-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .date-clear-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 22px; height: 22px; border-radius: 50%;
          background: rgba(255,255,255,.06); border: 1px solid var(--border);
          color: var(--text-muted); cursor: pointer;
          transition: all var(--transition-fast);
        }
        .date-clear-btn:hover:not(:disabled) { color: var(--danger); border-color: var(--danger); background: hsla(0,75%,55%,.1); }
        .date-clear-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .date-filter-badge {
          font-size: 0.75rem; font-weight: 600;
          color: var(--accent-gold); padding: 4px 10px;
          border-radius: 20px; background: var(--accent-gold-glow);
          border: 1px solid hsla(42,70%,55%,.2);
        }

        /* Spinner */
        .btn-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,.25);
          border-top-color: rgba(255,255,255,.9);
          border-radius: 50%; animation: spin 0.8s infinite linear;
        }
        .btn-spinner.dark { border-color: rgba(0,0,0,.2); border-top-color: rgba(0,0,0,.8); }

        /* Responsive */
        @media (max-width: 768px) {
          .admin-header-container { flex-direction: column; height: auto; padding: 12px 0; gap: 10px; }
          .stats-grid { grid-template-columns: repeat(2,1fr); }
          .admin-tabs { width: 100%; }
          .admin-tab { flex: 1; justify-content: center; }
          .source-form-grid { grid-template-columns: 1fr; }
          .source-actions { flex-wrap: wrap; }
        }

        /* Dashboard Panel styles */
        .block-subtitle { font-size: 0.82rem; color: var(--text-muted); margin-top: 4px; }
        .dashboard-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; gap: 12px; color: var(--text-secondary); }
        .no-updates-today { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 48px 24px; color: var(--text-secondary); }
        .no-updates-icon { font-size: 3rem; margin-bottom: 12px; }
        .no-updates-today h4 { font-family: var(--font-title); font-size: 1.1rem; color: var(--text-primary); margin-bottom: 6px; }
        .no-updates-today p { font-size: 0.85rem; color: var(--text-muted); max-width: 320px; line-height: 1.5; }
        
        .dashboard-sources-group { display: flex; flex-direction: column; gap: 24px; }
        .dashboard-source-section { border: 1px solid var(--border); border-radius: var(--radius-md); background: rgba(255,255,255,.01); overflow: hidden; }
        .dashboard-source-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; background: rgba(255,255,255,.02); border-bottom: 1px solid var(--border); }
        .dashboard-source-count { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
        
        .dashboard-updates-list { display: flex; flex-direction: column; }
        .dashboard-update-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--border); gap: 16px; transition: background var(--transition-fast); }
        .dashboard-update-row:last-child { border-bottom: none; }
        .dashboard-update-row:hover { background: rgba(255,255,255,.015); }
        
        .update-row-main { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
        .update-row-title { font-size: 0.88rem; font-weight: 500; color: var(--text-primary); line-height: 1.45; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        
        .category-tag { font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; flex-shrink: 0; }
        .tag-bill { background: hsla(210, 80%, 55%, 0.1); color: hsl(210, 80%, 65%); border: 1px solid hsla(210, 80%, 55%, 0.25); }
        .tag-act { background: hsla(142, 55%, 45%, 0.1); color: var(--primary-green); border: 1px solid hsla(142, 55%, 45%, 0.25); }
        .tag-ordinance { background: hsla(42, 70%, 55%, 0.1); color: var(--accent-gold); border: 1px solid hsla(42, 70%, 55%, 0.25); }
        
        .update-row-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .update-time { font-size: 0.78rem; color: var(--text-muted); }
        
        .notification-pill { font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 20px; display: inline-flex; align-items: center; }
        .notification-pill.notified { background: var(--primary-green-glow); color: var(--primary-green); }
        .notification-pill.pending { background: rgba(255,255,255,.05); color: var(--text-muted); }
        
        .update-link-btn { display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 600; color: var(--accent-gold); padding: 5px 10px; border-radius: 4px; border: 1px solid hsla(42, 70%, 55%, 0.2); background: var(--accent-gold-glow); transition: all var(--transition-fast); }
        .update-link-btn:hover { background: var(--accent-gold); color: var(--bg-main); box-shadow: 0 2px 6px var(--accent-gold-glow); }
      `}</style>
    </div>
  );
}
