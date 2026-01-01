import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/api';

function Upgrade() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authFetch('/create-checkout-session', {
        method: 'POST'
      });
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', cursor: 'pointer', background: 'none', border: 'none', color: '#0070f3' }}>
        &larr; Back to Dashboard
      </button>
      
      <div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Upgrade to Pro</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Unlock the full potential of SimpleMonitor</p>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <div style={{ flex: 1, padding: '20px', background: '#f9f9f9', borderRadius: '8px', opacity: 0.7 }}>
            <h3>Free Plan</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>5 Monitored URLs</li>
              <li>5-minute Check Interval</li>
              <li>Basic Email Alerts</li>
            </ul>
          </div>
          <div style={{ flex: 1, padding: '20px', background: '#e6fffa', borderRadius: '8px', border: '2px solid #38b2ac' }}>
            <h3 style={{ color: '#2c7a7b' }}>Pro Plan</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              <li><strong>50 Monitored URLs</strong></li>
              <li><strong>1-minute Check Interval</strong></li>
              <li>Priority Support</li>
            </ul>
            <div style={{ marginTop: '20px', fontSize: '24px', fontWeight: 'bold', color: '#2c7a7b' }}>
              100 ETB <span style={{ fontSize: '14px', fontWeight: 'normal' }}>/ lifetime</span>
            </div>
          </div>
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</div>}

        <button 
          onClick={handleUpgrade}
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '15px', 
            backgroundColor: '#38b2ac', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Redirecting to Payment...' : 'Upgrade Now'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '15px' }}>
          Secured by Chapa
        </p>
      </div>
    </div>
  );
}

export default Upgrade;
