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
      window.location.href = response.checkoutUrl;
    } catch (error) {
      alert('Transaction initialization failed: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="deep-space-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        
        {/* HERO: The Problem & The Solution */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ 
            display: 'inline-block', background: '#f43f5e', color: 'white', 
            fontWeight: 900, fontSize: '0.8rem', padding: '0.5rem 1rem', 
            borderRadius: '50px', marginBottom: '1rem', letterSpacing: '1px', textTransform: 'uppercase'
          }}>
            Warning: Price Increases Soon
          </div>
          <h1 className="text-glow" style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.1 }}>
            STOP LOSING REVENUE <br/>TO DOWNTIME.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
            Get the exact system top engineering teams use to catch outages before their customers do.
          </p>
        </div>

        {/* THE GRAND SLAM OFFER CARD */}
        <div className="card" style={{ 
          maxWidth: '550px', margin: '0 auto', padding: '0', 
          background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid var(--primary)',
          boxShadow: '0 0 80px rgba(99, 102, 241, 0.2)',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ padding: '2rem', background: 'rgba(99, 102, 241, 0.1)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>FOUNDER'S LIFETIME DEAL</h2>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--primary)', fontWeight: 600 }}>NO MONTHLY FEES. EVER.</p>
          </div>

          {/* The Value Stack */}
          <div style={{ padding: '2rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <StackItem name="50 Enterprise Monitors" value="Branded Status Pages" worth="$49/mo Value" />
              <StackItem name="1-Minute Rapid Pings" value="Instant Alerts" worth="$29/mo Value" />
              <StackItem name="Priority Email & SMS" value="Direct Uplink" worth="$19/mo Value" />
              <StackItem name="Public Status Page" value="Build Trust" worth="$99/mo Value" />
            </div>

            {/* Total Value Anchor */}
            <div style={{ margin: '2rem 0', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'line-through' }}>Total Value: $2,300/year</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginTop: '0.5rem' }}>
                Today's Price:
              </div>
              <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--success)', lineHeight: 1, textShadow: '0 0 30px rgba(16, 185, 129, 0.3)' }}>
                100 <span style={{ fontSize: '1.5rem' }}>ETB</span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>One-time payment. Own it forever.</div>
            </div>

            {/* The Big Button */}
            <button 
              onClick={handleUpgrade} 
              className="btn"
              disabled={loading}
              style={{ 
                width: '100%', padding: '1.5rem', fontSize: '1.4rem', fontWeight: 800,
                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', // Green for money/go
                color: 'white',
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
                border: '1px solid #34d399',
                marginBottom: '1rem',
                transform: 'scale(1)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              {loading ? 'SECURING SPOT...' : 'GET LIFETIME ACCESS NOW'}
            </button>
            
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              🔒 100% Secure Payment via Chapa. Instant Activation.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost" style={{ border: 'none', background: 'transparent' }}>
            No thanks, I prefer risking downtime.
          </button>
        </div>

      </div>
    </div>
  );
}

function StackItem({ name, value, worth }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ color: 'var(--success)', fontSize: '1.2rem' }}>✔</div>
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{value}</div>
        </div>
      </div>
      <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>{worth}</div>
    </div>
  );
}

export default Upgrade;
