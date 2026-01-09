import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import '../global.css';
import './Landing.css';

// SVG Icons Component
const Icon = ({ name }) => {
  const icons = {
    radar: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <path d="M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" />
        <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M12 3v9" />
      </svg>
    ),
    bolt: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2l-10 11h8l-1 9l10 -11h-8l1 -9" />
      </svg>
    ),
    shield: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3" />
      </svg>
    )
  };
  return <div style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' }}>{icons[name]}</div>;
};

function Landing() {
  return (
    <div className="landing-page deep-space-wrapper">
      <SEO 
        title="Monitor the Galaxy" 
        description="The world's most beautiful uptime monitoring platform. Real-time tracking, instant alerts, and holographic public status pages." 
      />
      {/* HERO SECTION */}
      <section className="hero">
        <div className="container">
          <div className="text-glow" style={{ marginBottom: '1rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '2px' }}>
            NEXT-GEN MONITORING
          </div>
          <h1>Monitor the <br /> Digital Galaxy.</h1>
          <p>
            The world's most beautiful uptime monitoring platform. 
            Real-time tracking, instant alerts, and holographic public status pages.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary" style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem' }}>
              Launch Control Center
            </Link>
            <Link to="/login" className="btn btn-ghost" style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem' }}>
              Sign In
            </Link>
          </div>

          {/* DASHBOARD PREVIEW */}
          <div className="preview-container">
            <div className="preview-mockup">
              <div style={{ textAlign: 'center' }}>
                <div className="status-dot up" style={{ width: '40px', height: '40px', marginBottom: '1rem' }}></div>
                <div className="text-glow" style={{ fontSize: '1.5rem', fontWeight: 800 }}>SYSTEMS OPERATIONAL</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>GLOBAL LATENCY: 42MS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features">
        <div className="feature-card">
          <div style={{ marginBottom: '1.5rem' }}><Icon name="radar" /></div>
          <h3>Hyper-Fast Pings</h3>
          <p>Global monitoring network checks your services every 60 seconds. Know the moment a signal drops.</p>
        </div>
        <div className="feature-card">
          <div style={{ marginBottom: '1.5rem' }}><Icon name="bolt" /></div>
          <h3>Instant Alerts</h3>
          <p>Immediate email notifications via high-reliability uplinks. Never keep your users waiting.</p>
        </div>
        <div className="feature-card">
          <div style={{ marginBottom: '1.5rem' }}><Icon name="shield" /></div>
          <h3>Public Beacons</h3>
          <p>Beautiful, transparent status pages to build trust with your audience. 100% white-labeled.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="container">
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '2rem', justifyContent: 'center' }}>
            <Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Terms of Service</Link>
            <Link to="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Policy</Link>
          </div>
          <p style={{ letterSpacing: '2px', fontSize: '0.8rem' }}>
            &copy; 2026 SIMPLE MONITOR. ALL SYSTEMS NOMINAL.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
