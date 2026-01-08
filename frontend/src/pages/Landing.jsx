import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

function Landing() {
  const token = localStorage.getItem('token');

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="nav container">
        <div className="nav-logo">SimpleMonitor.</div>
        <div className="nav-menu">
          {token ? (
            <Link to="/dashboard" className="btn-text">Dashboard &rarr;</Link>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn-black">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section container">
        <div className="hero-content">
          <span className="eyebrow">Reliability First</span>
          <h1>Monitoring for the <br /><em>Modern Web</em>.</h1>
          <p className="hero-sub">
            Precision uptime tracking for APIs and websites.
            Instant alerts, detailed analytics, and zero clutter.
            Essential infrastructure visibility designed for professionals.
          </p>
          <div className="hero-actions">
            <Link to={token ? "/dashboard" : "/register"} className="btn-black btn-lg">
              {token ? "Go to Dashboard" : "Start Monitoring Free"}
            </Link>
            <span className="hero-note">No credit card required.</span>
          </div>
        </div>
      </header>

      {/* Philosophy / Features Section */}
      <section className="philosophy-section">
        <div className="container">
          <div className="section-header">
            <h2>The Standard</h2>
          </div>
          <div className="grid-3">
            <div className="grid-item">
              <span className="item-number">01</span>
              <h3>Real-Time Precision</h3>
              <p>We check your services every 60 seconds from multiple global locations, ensuring you know about downtime before your customers do.</p>
            </div>
            <div className="grid-item">
              <span className="item-number">02</span>
              <h3>Instant Intelligence</h3>
              <p>Get notified immediately via email. Our alerts provide the exact error code and response time metrics you need to debug fast.</p>
            </div>
            <div className="grid-item">
              <span className="item-number">03</span>
              <h3>Historical Insight</h3>
              <p>Track performance trends over time. Identify degrading services and optimize your infrastructure with long-term data retention.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal CTA */}
      <section className="cta-section container">
        <div className="cta-content">
          <h2>Ready to upgrade your workflow?</h2>
          <Link to="/register" className="link-underline">Create your account &rarr;</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="simple-footer container">
        <div className="footer-left">
          &copy; {new Date().getFullYear()} SimpleMonitor.
        </div>
        <div className="footer-right">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
