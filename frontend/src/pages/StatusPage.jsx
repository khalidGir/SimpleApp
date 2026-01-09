import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../utils/api';
import SEO from '../components/SEO';
import '../global.css';

function StatusPage() {
  const { userId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/status-page/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('Status page not found');
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return (
    <div className="deep-space-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="text-glow" style={{ fontSize: '1.2rem', color: 'var(--text-muted)', letterSpacing: '2px' }}>
        ESTABLISHING UPLINK...
      </div>
    </div>
  );

  if (error) return (
    <div className="deep-space-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 className="text-glow-error" style={{ fontSize: '3rem', margin: 0 }}>404</h1>
        <p style={{ color: 'var(--text-muted)' }}>SIGNAL LOST: {error}</p>
      </div>
    </div>
  );

  const allUp = data.services.every(s => s.last_status);
  const downCount = data.services.filter(s => !s.last_status).length;
  const systemStatusColor = allUp ? 'var(--success)' : (downCount === data.services.length ? 'var(--error)' : 'var(--warning)');
  const statusMessage = allUp ? 'ALL SYSTEMS OPERATIONAL' : 'SYSTEM ANOMALIES DETECTED';

  return (
    <div className="deep-space-wrapper">
      <SEO title="System Status" description="Real-time service status and incident reports." />
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* HEADER / REACTOR CORE */}
        <div style={{ textAlign: 'center', marginBottom: '4rem', paddingTop: '2rem' }}>
          
          {/* THE CORE */}
          <div style={{ 
            width: '120px', height: '120px', margin: '0 auto 2rem auto',
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, white, ${systemStatusColor})`,
            boxShadow: `0 0 60px ${systemStatusColor}, inset 0 0 20px rgba(0,0,0,0.5)`,
            position: 'relative',
            animation: allUp ? 'float 6s ease-in-out infinite' : 'shake 0.5s ease-in-out infinite'
          }}>
            <div style={{ 
              position: 'absolute', inset: '-10px', borderRadius: '50%',
              border: `2px solid ${systemStatusColor}`, opacity: 0.3,
              animation: 'spin 10s linear infinite'
            }}></div>
            <div style={{ 
              position: 'absolute', inset: '-20px', borderRadius: '50%',
              border: `1px dashed ${systemStatusColor}`, opacity: 0.1,
              animation: 'spin 20s linear infinite reverse'
            }}></div>
          </div>

          <h1 style={{ 
            fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0',
            letterSpacing: '1px', color: 'white', textShadow: `0 0 20px ${systemStatusColor}` 
          }}>
            {statusMessage}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
            LAST SYNC: {new Date(data.updatedAt).toLocaleTimeString()}
          </p>
        </div>

        {/* SERVICE GRID (Linear Layout for Public) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {data.services.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              NO TELEMETRY DATA
            </div>
          ) : (
            data.services.map((service, idx) => (
              <div key={idx} className="card" style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1.5rem', background: 'rgba(15, 23, 42, 0.4)',
                borderLeft: `4px solid ${service.last_status ? 'var(--success)' : 'var(--error)'}`
              }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: 'white' }}>{service.name}</h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LATENCY: {service.last_response_time_ms || '—'}ms</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>|</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CHECKED: {new Date(service.last_checked_at).toLocaleTimeString()}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ 
                    fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1px',
                    color: service.last_status ? 'var(--success)' : 'var(--error)',
                    textShadow: `0 0 10px ${service.last_status ? 'var(--success)' : 'var(--error)'}`
                  }}>
                    {service.last_status ? 'OPERATIONAL' : 'OFFLINE'}
                  </span>
                  <div className={`status-dot ${service.last_status ? 'up' : 'down'}`}></div>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: '5rem', textAlign: 'center', opacity: 0.4 }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '2px' }}>
            MONITORING INFRASTRUCTURE PROVIDED BY <span style={{ color: 'white' }}>SIMPLE MONITOR</span>
          </p>
        </div>

        <style>{`
          @keyframes shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default StatusPage;