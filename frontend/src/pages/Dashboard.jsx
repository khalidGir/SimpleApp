import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authFetch } from '../utils/api';
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
      // In a real app, we'd update just this item in state
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

  if (loading) return <div className="container" style={{textAlign:'center', marginTop: '20vh'}}>Loading Command Interface...</div>;

  // Stats Calculation
  const totalServices = urls.length;
  const upServices = urls.filter(u => u.last_status).length;
  const avgLatency = urls.reduce((acc, curr) => acc + (curr.last_response_time_ms || 0), 0) / (totalServices || 1);
  const systemHealth = totalServices === 0 ? 100 : Math.round((upServices / totalServices) * 100);

  return (
    <div className="container">
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="status-dot up" style={{ width: '12px', height: '12px' }}></div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Orbital Command</h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {user?.email} • <span style={{ color: user?.plan === 'pro' ? 'var(--warning)' : 'var(--text-muted)' }}>
                {user?.plan === 'pro' ? 'PRO PLAN' : 'FREE TIER'}
              </span>
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user?.plan !== 'pro' && (
             <button onClick={() => navigate('/upgrade')} className="btn btn-primary">Upgrade</button>
          )}
          <a href={`/status/${user?.id}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem' }}>
            Public Status &rarr;
          </a>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ border: '1px solid var(--error)', color: 'var(--error)' }}>
            Logout
          </button>
        </div>
      </div>

      {/* STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>System Health</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: systemHealth === 100 ? 'var(--success)' : 'var(--error)' }}>
            {systemHealth}%
          </div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Active Monitors</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {totalServices} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ {user?.max_urls}</span>
          </div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Avg Latency</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: avgLatency < 200 ? 'var(--success)' : 'var(--warning)' }}>
            {Math.round(avgLatency)}ms
          </div>
        </div>
      </div>

      {/* ADD SERVICE */}
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input 
          type="text" 
          className="input-field" 
          placeholder="https://example.com" 
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
        />
        <button onClick={handleAddUrl} className="btn btn-primary" style={{ minWidth: '120px' }}>
          {addLoading ? <span className="spinner"></span> : 'Add Target'}
        </button>
      </div>

      {/* SERVICE GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {urls.map((item) => (
          <div key={item.id} className="card" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
              <div className={`status-dot ${item.last_status ? 'up' : 'down'}`}></div>
            </div>
            
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', paddingRight: '20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.name || item.url.replace('https://', '')}
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {item.url}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LATENCY</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  {item.last_response_time_ms ? `${item.last_response_time_ms}ms` : '—'}
                </div>
              </div>
              <button 
                onClick={() => handleCheck(item.url)} 
                className="btn btn-ghost"
                disabled={checkLoading === item.url}
              >
                {checkLoading === item.url ? <span className="spinner" style={{borderColor: '#94a3b8', borderTopColor: 'transparent'}}></span> : 'Ping'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {urls.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
          No targets acquired. Initialize monitoring above.
        </div>
      )}
    </div>
  );
}

export default Dashboard;