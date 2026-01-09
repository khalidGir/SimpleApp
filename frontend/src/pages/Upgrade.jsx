import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/api';
import '../global.css';

function Upgrade() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await authFetch('/create-checkout-session', {
        method: 'POST'
      });
      // Redirect to Chapa checkout
      window.location.href = response.checkoutUrl;
    } catch (error) {
      alert('Upgrade initialization failed: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="deep-space-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 className="text-glow" style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            UNLOCK FULL CLEARANCE
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Scale your monitoring infrastructure to orbital levels.
          </p>
        </div>

        {/* THE PRO CARD */}
        <div className="card" style={{ 
          maxWidth: '500px', margin: '0 auto', padding: '3rem', 
          background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 0 50px rgba(99, 102, 241, 0.15)',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Glowing Border Effect */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, var(--primary), #4f46e5)' }}></div>

          <div style={{ marginBottom: '2rem' }}>
            <span style={{ 
              background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', 
              padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '2px' 
            }}>
              PRO TIER
            </span>
          </div>

          <div style={{ fontSize: '4rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem', lineHeight: 1 }}>
            100 <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>ETB</span>
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>One-time activation fee</p>

          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
            <FeatureRow text="Monitor up to 50 Targets" />
            <FeatureRow text="1-Minute Rapid Pings" />
            <FeatureRow text="Priority SMS/Email Alerts" />
            <FeatureRow text="Public Status Page Access" />
            <FeatureRow text="Advanced Latency Analytics" />
          </div>

          <button 
            onClick={handleUpgrade} 
            className="btn btn-primary"
            disabled={loading}
            style={{ 
              width: '100%', padding: '1.25rem', fontSize: '1.1rem', 
              background: 'linear-gradient(90deg, var(--primary) 0%, #4f46e5 100%)',
              boxShadow: '0 10px 30px rgba(79, 70, 229, 0.4)'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span className="spinner"></span> INITIALIZING...
              </span>
            ) : (
              'INITIATE UPGRADE'
            )}
          </button>
          
          <div style={{ marginTop: '1.5rem' }}>
            <button onClick={() => navigate('/dashboard')} className="btn btn-ghost" style={{ border: 'none', background: 'transparent' }}>
              Return to Command
            </button>
          </div>
        </div>
        
        <div style={{ marginTop: '3rem', opacity: 0.5, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          SECURE PAYMENT ENCRYPTION ENABLED via CHAPA
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-main)' }}>
      <div style={{ 
        width: '24px', height: '24px', borderRadius: '50%', 
        background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem'
      }}>
        ✓
      </div>
      <span style={{ fontSize: '1rem' }}>{text}</span>
    </div>
  );
}

export default Upgrade;