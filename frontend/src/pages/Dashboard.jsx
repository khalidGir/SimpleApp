import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authFetch } from '../utils/api';
import SEO from '../components/SEO';
import '../global.css';

function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [user, setUser] = useState(null);
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(null);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchData();
    if (searchParams.get('upgrade') === 'success') {
      alert('Welcome to Pro Command.');
    }
  }, []);

  const fetchData = async () => {
    try {
      const [urlsData, userData] = await Promise.all([
        authFetch('/urls'),
        authFetch('/me')
      ]);
      setUrls(urlsData);
      setUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUrl = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await authFetch('/add-url', {
        method: 'POST',
        body: JSON.stringify({ url: newUrl }),
      });
      setNewUrl('');
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleCheck = async (url) => {
    setCheckLoading(url);
    try {
      const result = await authFetch('/check', {
        method: 'POST',
        body: JSON.stringify({ url })
      });
      fetchData(); 
    } catch (e) {
      alert('Check failed: ' + e.message);
    } finally {
      setCheckLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return (
    <div className="deep-space-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="text-glow" style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>INITIALIZING COMMAND LINK...</div>
    </div>
  );

  // Stats Calculation
  const totalServices = urls.length;
  const upServices = urls.filter(u => u.last_status).length;
  const avgLatency = urls.reduce((acc, curr) => acc + (curr.last_response_time_ms || 0), 0) / (totalServices || 1);
  const systemHealth = totalServices === 0 ? 100 : Math.round((upServices / totalServices) * 100);

  return (
    <div className="deep-space-wrapper">
      <SEO title="Orbital Command" description="Manage your monitoring infrastructure." />
      <div className="container">
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '40px', height: '40px', 
              background: 'linear-gradient(135deg, var(--primary), #4f46e5)', 
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
            }}>
              <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '50%' }}></div>
            </div>
            <div>
              <h1 className="text-glow" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Orbital Command</h1>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600 }}>
                {user?.plan === 'pro' ? <span style={{ color: 'var(--warning)', textShadow: '0 0 10px rgba(245, 158, 11, 0.4)' }}>PRO CLEARANCE</span> : 'FREE TIER'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {user?.plan !== 'pro' && (
               <button onClick={() => navigate('/upgrade')} className="btn btn-primary">Upgrade Clearance</button>
            )}
            <a href={`/status/${user?.id}`} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = '#94a3b8'}>
              Public Beacon &rarr;
            </a>
            <button onClick={handleLogout} className="btn btn-ghost">
              Abort Session
            </button>
          </div>
        </div>

        {/* STATS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>System Integrity</div>
            <div className={`text-glow-${systemHealth === 100 ? 'success' : 'error'}`} style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>
              {systemHealth}%
            </div>
          </div>
          <div className="card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Active Targets</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>
              {totalServices} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {user?.max_urls}</span>
            </div>
          </div>
          <div className="card">
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Avg Signal Latency</div>
            <div className={avgLatency < 200 ? 'text-glow-success' : 'text-glow-error'} style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>
              {Math.round(avgLatency)}<span style={{fontSize: '1rem'}}>ms</span>
            </div>
          </div>
        </div>

        {/* ADD SERVICE */}
        <div className="card" style={{ marginBottom: '3rem', display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'rgba(30, 41, 59, 0.6)' }}>
          <div style={{ flex: 1 }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Enter Target URL (e.g. https://google.com)" 
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              style={{ background: 'transparent', border: 'none', boxShadow: 'none', fontSize: '1.1rem' }}
            />
          </div>
          <button onClick={handleAddUrl} className="btn btn-primary" style={{ minWidth: '140px' }}>
            {addLoading ? <span className="spinner"></span> : '+ Initialize'}
          </button>
        </div>

        {/* SERVICE GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          {urls.map((item) => (
            <div key={item.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              {/* Status Bar */}
              <div style={{ 
                position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', 
                background: item.last_status ? 'var(--success)' : 'var(--error)',
                boxShadow: item.last_status ? '0 0 15px var(--success)' : '0 0 15px var(--error)'
              }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem', paddingLeft: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                  {item.name || item.url.replace('https://', '')}
                </h3>
                <div className={`status-dot ${item.last_status ? 'up' : 'down'}`}></div>
              </div>

              <div style={{ paddingLeft: '1rem', marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>TARGET URL</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.url}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', paddingLeft: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>RESPONSE TIME</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
                    {item.last_response_time_ms ? `${item.last_response_time_ms}ms` : '—'}
                  </div>
                </div>
                <button 
                  onClick={() => handleCheck(item.url)} 
                  className="btn btn-ghost"
                  disabled={checkLoading === item.url}
                  style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                >
                  {checkLoading === item.url ? <span className="spinner" style={{width: '12px', height: '12px'}}></span> : 'PING'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {urls.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem', padding: '4rem', border: '1px dashed var(--border)', borderRadius: '16px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}>📡</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'white' }}>No Active Scans</h3>
            <p>Initialize a new target above to begin monitoring sequence.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
