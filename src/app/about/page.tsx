'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
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
            <Link href="/about" className="nav-text-link active">About Us</Link>
            <Link href="/services" className="nav-text-link">Services</Link>
            <Link href="/contact" className="nav-text-link">Contact Us</Link>
            <Link href="/admin" className="admin-portal-link">
              Admin Panel
            </Link>
          </nav>
        </div>
      </header>

      <main className="container content-section animate-fade-in">
        <section className="hero-block">
          <div className="hero-badge">About the Project</div>
          <h2>Dedicated to Legislative Transparency</h2>
          <p className="hero-lead">
            The Pakistan Law Aggregator (PLA) is a high-performance legislative intelligence platform designed to centralize and streamline federal and provincial updates.
          </p>
        </section>

        <section className="about-grid">
          <div className="about-card">
            <div className="card-icon">🏛️</div>
            <h3>Our Mission</h3>
            <p>
              To bridge the gap between official portals and legislative draftsmen, attorneys, and public officers by aggregating bills, acts, and ordinances in real time.
            </p>
          </div>
          <div className="about-card">
            <div className="card-icon">⚡</div>
            <h3>Automated Monitoring</h3>
            <p>
              Our daily scheduler queries the official web portals of the Senate, National Assembly, Ministry of Law, Punjab Assembly, and Sindh Assembly automatically.
            </p>
          </div>
          <div className="about-card">
            <div className="card-icon">📧</div>
            <h3>Instant Alerts</h3>
            <p>
              We compile scraped laws, resolve direct document references (PDF/DOCX), and send structured digests directly to regulatory desks via secure SMTP.
            </p>
          </div>
        </section>

        <section className="text-content-block">
          <h3>Why Pakistan Law Aggregator?</h3>
          <p>
            Keeping track of legal updates in Pakistan historically meant checking five separate, slow-loading portals. Pakistan Law Aggregator provides a unified database, customizable filters, and proactive email updates, ensuring draftsmen and officers never miss critical gazettes.
          </p>
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

        .about-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px; margin-bottom: 56px;
        }
        .about-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 32px 24px;
          transition: transform var(--transition-fast);
        }
        .about-card:hover { transform: translateY(-3px); border-color: var(--border-focus); }
        .card-icon { font-size: 2rem; margin-bottom: 16px; }
        .about-card h3 {
          font-family: var(--font-title); font-size: 1.15rem; font-weight: 600;
          color: var(--text-primary); margin-bottom: 10px;
        }
        .about-card p { font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); }

        .text-content-block {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 36px;
        }
        .text-content-block h3 {
          font-family: var(--font-title); font-size: 1.25rem; font-weight: 700;
          color: var(--accent-gold); margin-bottom: 14px;
        }
        .text-content-block p { font-size: 0.98rem; line-height: 1.7; color: var(--text-secondary); }

        .main-footer { background: hsl(145,30%,4%); border-top: 1px solid var(--border); padding: 24px 0; text-align: center; }
        .main-footer p { font-size: 0.8rem; color: var(--text-muted); }
      `}</style>
    </div>
  );
}
