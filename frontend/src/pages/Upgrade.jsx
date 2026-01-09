import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/api';
import '../global.css';

function Upgrade() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpgrade = async (planType) => {
    setLoading(true);
    try {
      const response = await authFetch('/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ planType })
      });
      window.location.href = response.checkoutUrl;
    } catch (error) {
      alert('Transaction initialization failed: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="deep-space-wrapper" style={{ padding: '4rem 2rem' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        
        {/* HERO */}
        <div style={{ marginBottom: '4rem' }}>
          <h1 className="text-glow" style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.1 }}>
            CHOOSE YOUR WEAPON.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
            Scale your infrastructure monitoring as you grow. No monthly fees.
          </p>
        </div>

        {/* PRICING GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          
          {/* TIER 1: FREE */}
          <PricingCard 
            title="CADET" 
            price="0" 
            sub="Forever Free"
            features={[
              "5 Monitors",
              "5-Minute Checks",
              "Email Alerts",
              "Community Support"
            ]}
            btnText="CURRENT PLAN"
            btnAction={() => navigate('/dashboard')}
            isGhost={true}
          />

          {/* TIER 2: PRO (HERO) */}
          <PricingCard 
            title="COMMANDER" 
            price="1,000" 
            sub="One-time Payment"
            features={[
              "50 Monitors",
              "1-Minute Rapid Checks",
              "Priority SMS & Email",
              "Public Status Pages",
              "Advanced Analytics"
            ]}
            btnText={loading ? "PROCESSING..." : "GET LIFETIME ACCESS"}
            btnAction={() => handleUpgrade('pro')}
            isPrimary={true}
            badge="MOST POPULAR"
          />

          {/* TIER 3: AGENCY (ANCHOR) */}
          <PricingCard 
            title="ADMIRAL" 
            price="5,000" 
            sub="One-time Payment"
            features={[
              "500 Monitors",
              "30-Second Hyper Checks",
              "White-label Status Pages",
              "API Access",
              "Dedicated Support Channel"
            ]}
            btnText={loading ? "PROCESSING..." : "SCALE TO EMPIRE"}
            btnAction={() => handleUpgrade('agency')}
            isGhost={false}
            borderColor="var(--warning)"
          />

        </div>

        <div style={{ marginTop: '4rem', opacity: 0.6, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          🔒 Secure Payment via Chapa • 30-Day Money-Back Guarantee
        </div>

      </div>
    </div>
  );
}

function PricingCard({ title, price, sub, features, btnText, btnAction, isPrimary, isGhost, badge, borderColor }) {
  const borderStyle = borderColor ? `1px solid ${borderColor}` : (isPrimary ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)');
  const bgStyle = isPrimary 
    ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)' 
    : 'rgba(30, 41, 59, 0.4)';
  const scale = isPrimary ? 'scale(1.05)' : 'scale(1)';
  const zIndex = isPrimary ? 10 : 1;

  return (
    <div className="card" style={{ 
      padding: '0', background: bgStyle, border: borderStyle, 
      transform: scale, zIndex: zIndex, position: 'relative',
      boxShadow: isPrimary ? '0 0 50px rgba(99, 102, 241, 0.2)' : 'none'
    }}>
      {badge && (
        <div style={{ 
          position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', 
          background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', 
          borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px'
        }}>
          {badge}
        </div>
      )}

      <div style={{ padding: '2.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', margin: '0 0 0.5rem 0' }}>{title}</h3>
        <div style={{ fontSize: '3rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>
          {price}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}> ETB</span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{sub}</div>
      </div>

      <div style={{ padding: '0 2.5rem 2.5rem 2.5rem', textAlign: 'left' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {features.map((feat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
              <span style={{ color: isPrimary ? 'var(--success)' : 'var(--text-muted)' }}>✓</span>
              {feat}
            </div>
          ))}
        </div>

        <button 
          onClick={btnAction}
          className={isPrimary ? 'btn' : 'btn btn-ghost'}
          style={{ 
            width: '100%', padding: '1rem', fontWeight: 700,
            background: isPrimary ? 'linear-gradient(90deg, var(--primary) 0%, #4f46e5 100%)' : 'transparent',
            color: isPrimary ? 'white' : 'var(--text-main)',
            border: isPrimary ? 'none' : '1px solid rgba(255,255,255,0.2)'
          }}
        >
          {btnText}
        </button>
      </div>
    </div>
  );
}

export default Upgrade;