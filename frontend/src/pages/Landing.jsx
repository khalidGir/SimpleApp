import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

function Landing() {
  const token = localStorage.getItem('token');

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-logo">SimpleMonitor</div>
        <div className="nav-links">
          {token ? (
            <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register?source=landing" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <h1>Uptime Monitoring Made Simple</h1>
        <p>
          Ensure your websites and APIs are always online. 
          Get instant email alerts when your services go down. 
          Start for free today.
        </p>
        <Link to={token ? "/dashboard" : "/register?source=landing"} className="btn-primary hero-cta">
          {token ? "Go to Dashboard" : "Start Monitoring Free"}
        </Link>
      </header>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose SimpleMonitor?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <h3>Real-Time Checks</h3>
            <p>We monitor your services every minute to ensure maximum uptime and reliability.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔔</span>
            <h3>Instant Alerts</h3>
            <p>Receive email notifications the second your service goes down or becomes slow.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h3>Clear Dashboard</h3>
            <p>Track response times and historical performance with our intuitive interface.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Register</h3>
            <p>Create a free account in seconds. No credit card required.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Add URLs</h3>
            <p>Enter the websites or API endpoints you want to monitor.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Stay Informed</h3>
            <p>Relax while we check your services 24/7 and alert you on issues.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} SimpleMonitor. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
