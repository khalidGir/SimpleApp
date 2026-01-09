import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../global.css';

function Legal() {
  const location = useLocation();
  const isPrivacy = location.pathname === '/privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service';
  const date = new Date().toLocaleDateString();

  return (
    <div className="deep-space-wrapper" style={{ padding: '4rem 2rem' }}>
      <div className="container" style={{ maxWidth: '800px', color: 'var(--text-main)' }}>
        <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', marginBottom: '2rem', display: 'block' }}>
          &larr; Return Home
        </Link>
        
        <h1 className="text-glow" style={{ fontSize: '3rem', marginBottom: '1rem' }}>{title}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Last Updated: {date}</p>

        <div className="card" style={{ lineHeight: '1.8', color: '#cbd5e1' }}>
          {isPrivacy ? (
            <>
              <h3>1. Information We Collect</h3>
              <p>We collect email addresses and website URLs solely for the purpose of providing monitoring services. We do not sell your data to third parties.</p>
              
              <h3>2. How We Use Data</h3>
              <p>Your data is used to send alerts, process payments (via Chapa), and improve system performance.</p>
              
              <h3>3. Cookies</h3>
              <p>We use local storage to keep you logged in. We do not use tracking cookies for advertising.</p>
            </>
          ) : (
            <>
              <h3>1. Acceptance of Terms</h3>
              <p>By using Simple Monitor, you agree to these terms. If you do not agree, please do not use the service.</p>
              
              <h3>2. Usage Limits</h3>
              <p>You may not use the service to monitor illegal content or spam services. We reserve the right to terminate accounts that abuse the API.</p>
              
              <h3>3. Liability</h3>
              <p>Simple Monitor is provided "as is". We are not liable for any damages resulting from downtime or missed alerts.</p>
            </>
          )}
        </div>

        <div style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Questions? Contact us at legal@simplemonitor.com
        </div>
      </div>
    </div>
  );
}

export default Legal;
