'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'success' | 'loading'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

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
            <Link href="/services" className="nav-text-link">Services</Link>
            <Link href="/contact" className="nav-text-link active">Contact Us</Link>
            <Link href="/admin" className="admin-portal-link">
              Admin Panel
            </Link>
          </nav>
        </div>
      </header>

      <main className="container content-section animate-fade-in">
        <section className="hero-block">
          <div className="hero-badge">Get in Touch</div>
          <h2>Contact Drafting Desk Support</h2>
          <p className="hero-lead">
            Have questions about alert integration, custom scraper intervals, or API integration? Send us a message.
          </p>
        </section>

        <section className="contact-container">
          <div className="contact-info">
            <div className="info-card">
              <span className="info-icon">📍</span>
              <div>
                <h4>Address</h4>
                <p>Ministry of Law &amp; Justice Secretariat, Islamabad, Pakistan</p>
              </div>
            </div>

            <div className="info-card">
              <span className="info-icon">📧</span>
              <div>
                <h4>Support Email</h4>
                <p>romangray197@gmail.com</p>
              </div>
            </div>

            <div className="info-card">
              <span className="info-icon">📞</span>
              <div>
                <h4>Desk Helpline</h4>
                <p>+92 (51) 920-1234 (Ext. 402)</p>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper">
            <h3>Send a Message</h3>
            {status === 'success' ? (
              <div className="success-banner">
                <span className="success-icon">✓</span>
                <div>
                  <h4>Message Sent Successfully</h4>
                  <p>Our intelligence support desk will review your inquiry and get back to you shortly.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Adv. Muhammad Ali"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. ali@gmail.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. SMTP Setup Query"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message Details</label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your query or request..."
                  />
                </div>

                <button type="submit" disabled={status === 'loading'} className="btn-submit">
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
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

        .contact-container {
          display: grid; grid-template-columns: 1fr 2fr; gap: 40px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .contact-container { grid-template-columns: 1fr; gap: 32px; }
        }

        .contact-info { display: flex; flex-direction: column; gap: 16px; }
        .info-card {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 24px;
          display: flex; gap: 16px; align-items: flex-start;
        }
        .info-icon { font-size: 1.5rem; }
        .info-card h4 {
          font-family: var(--font-title); font-size: 0.95rem; font-weight: 700;
          color: var(--text-primary); margin-bottom: 4px;
        }
        .info-card p { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; }

        .contact-form-wrapper {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 36px;
        }
        .contact-form-wrapper h3 {
          font-family: var(--font-title); font-size: 1.3rem; font-weight: 700;
          color: var(--text-primary); margin-bottom: 24px;
        }

        .contact-form { display: flex; flex-direction: column; gap: 18px; }
        .form-group-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) {
          .form-group-row { grid-template-columns: 1fr; }
        }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
        .form-group input, .form-group textarea {
          background: var(--bg-main); border: 1px solid var(--border);
          border-radius: var(--radius-md); padding: 12px 14px;
          font-family: inherit; font-size: 0.95rem; color: var(--text-primary);
          transition: all var(--transition-fast);
        }
        .form-group input:focus, .form-group textarea:focus {
          border-color: var(--accent-gold); outline: none; box-shadow: 0 0 0 2px var(--accent-gold-glow);
        }

        .btn-submit {
          background: var(--accent-gold); color: var(--bg-main);
          border: none; border-radius: var(--radius-md); padding: 14px 24px;
          font-size: 0.95rem; font-weight: 700; cursor: pointer;
          transition: all var(--transition-fast); margin-top: 8px;
        }
        .btn-submit:hover:not(:disabled) {
          box-shadow: 0 4px 14px var(--accent-gold-glow); opacity: 0.95;
        }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .success-banner {
          display: flex; gap: 16px; background: rgba(46,125,50,0.1);
          border: 1px solid rgba(46,125,50,0.25); border-radius: var(--radius-lg);
          padding: 24px; color: var(--primary-green);
        }
        .success-icon {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--primary-green); color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; font-weight: 700; flex-shrink: 0;
        }
        .success-banner h4 { font-family: var(--font-title); font-size: 1.1rem; font-weight: 700; margin-bottom: 6px; }
        .success-banner p { font-size: 0.9rem; line-height: 1.5; color: var(--text-secondary); }

        .main-footer { background: hsl(145,30%,4%); border-top: 1px solid var(--border); padding: 24px 0; text-align: center; }
        .main-footer p { font-size: 0.8rem; color: var(--text-muted); }
      `}</style>
    </div>
  );
}
