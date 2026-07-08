'use client';

import React from 'react';
import Link from 'next/link';

export default function ServicesPage() {
  return (
    <div className="page-layout">
      {/* Navigation Header */}
      <header className="main-header">
        <div className="container header-container">
          <Link href="/" className="logo-section">
            <span className="gold-crest">🇵🇰</span>
            <div className="logo-text">
              <h1>Pakistan Law Aggregator</h1>
              <p>Official Legislative Intelligence Portal</p>
            </div>
          </Link>
          <nav className="header-nav">
            <Link href="/" className="nav-text-link">Home</Link>
            <Link href="/about" className="nav-text-link">About Us</Link>
            <Link href="/services" className="nav-text-link active">Services</Link>
            <Link href="/contact" className="nav-text-link">Contact Us</Link>
            <Link href="/admin" className="admin-portal-link">
              Admin Panel
            </Link>
          </nav>
        </div>
      </header>

      <main className="container content-section animate-fade-in">
        <section className="hero-block">
          <div className="hero-badge">Our Expertise</div>
          <h2>Professional Legal &amp; Legislative Services</h2>
          <p className="hero-lead">
            Leveraging our real-time legislative intelligence engine, our agency provides premier legal counsel, compliance mapping, and advocacy services across Pakistan.
          </p>
        </section>

        <section className="services-grid">
          <div className="service-card">
            <div className="service-header">
              <span className="service-icon">🏛️</span>
              <h3>Constitutional &amp; Legislative Advisory</h3>
            </div>
            <p>
              We provide precise legal interpretations and strategic advisory on newly introduced Bills, passed Acts, and SROs. Our teams track legislative debates in the Senate and National Assembly to advise clients on impending legal reforms.
            </p>
          </div>

          <div className="service-card">
            <div className="service-header">
              <span className="service-icon">⚖️</span>
              <h3>Corporate &amp; Regulatory Compliance</h3>
            </div>
            <p>
              Avoid regulatory friction. We map and review corporate operations against provincial laws (Punjab, Sindh, KPK, Balochistan Assemblies) and federal gazette publications to ensure continuous statutory compliance.
            </p>
          </div>

          <div className="service-card">
            <div className="service-header">
              <span className="service-icon">📝</span>
              <h3>Legislative &amp; Policy Drafting</h3>
            </div>
            <p>
              Our draftsmen assist public sector departments, non-governmental bodies, and corporate entities in drafting bills, code amendments, regulations, policy guidelines, and complex commercial agreements.
            </p>
          </div>

          <div className="service-card">
            <div className="service-header">
              <span className="service-icon">🧑‍⚖️</span>
              <h3>Litigation &amp; Strategic Advocacy</h3>
            </div>
            <p>
              Offering representations across all High Courts, the Supreme Court of Pakistan, and specialized tax/labor tribunals. Our arguments are backed by real-time access to the most recently gazetted and active legislation.
            </p>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <div className="container footer-container">
          <p>© 2026 Pakistan Law Aggregator. All Rights Reserved.</p>
        </div>
      </footer>

      <style jsx global>{`
        .page-layout { display: flex; flex-direction: column; min-height: 100vh; }
        .main-header {
          background: rgba(10,20,14,0.9);
          backdrop-filter: blur(16px);
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
          font-weight: 700; color: var(--text-primary);
        }
        .logo-text p {
          font-size: 0.75rem; color: var(--accent-gold);
          font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase;
        }
        .header-nav { display: flex; align-items: center; gap: 20px; }
        .nav-text-link {
          font-size: 0.9rem; font-weight: 500; color: var(--text-secondary);
          transition: color var(--transition-fast);
        }
        .nav-text-link:hover, .nav-text-link.active { color: var(--accent-gold); }
        .admin-portal-link {
          font-size: 0.875rem; font-weight: 600; color: var(--accent-gold);
          border: 1px solid var(--border-focus); padding: 10px 18px;
          border-radius: var(--radius-md); background: var(--accent-gold-glow);
          transition: all var(--transition-fast);
        }
        .admin-portal-link:hover {
          background: var(--accent-gold); color: var(--bg-main);
          box-shadow: 0 4px 14px var(--accent-gold-glow);
        }

        .content-section { margin-top: 56px; margin-bottom: 80px; }
        .hero-block { text-align: center; max-width: 720px; margin: 0 auto 56px; }
        .hero-badge {
          display: inline-flex; background: var(--primary-green-glow);
          border: 1px solid hsla(142,55%,45%,0.25); border-radius: 20px;
          padding: 6px 14px; font-size: 0.78rem; font-weight: 600;
          color: var(--primary-green); text-transform: uppercase; margin-bottom: 16px;
        }
        .hero-block h2 {
          font-family: var(--font-title); font-size: 2.2rem; font-weight: 700;
          color: var(--text-primary); margin-bottom: 14px;
        }
        .hero-lead { font-size: 1.1rem; line-height: 1.6; color: var(--text-secondary); }

        .services-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }
        .service-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 36px 28px;
          transition: all var(--transition-normal);
        }
        .service-card:hover { border-color: var(--accent-gold); transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
        .service-header { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
        .service-icon { font-size: 1.8rem; }
        .service-card h3 {
          font-family: var(--font-title); font-size: 1.25rem; font-weight: 700;
          color: var(--text-primary);
        }
        .service-card p { font-size: 0.92rem; line-height: 1.65; color: var(--text-secondary); }

        .main-footer { background: hsl(145,30%,4%); border-top: 1px solid var(--border); padding: 24px 0; text-align: center; }
        .main-footer p { font-size: 0.8rem; color: var(--text-muted); }
      `}</style>
    </div>
  );
}
