import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authFetch } from '../utils/api';

function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [user, setUser] = useState(null);
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(null);
  const [error, setError] = useState(null);
  const [addError, setAddError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchData();
    if (searchParams.get('upgrade') === 'success') {
      alert('Upgrade Successful! You are now on the Pro plan.');
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
    setAddError(null);
    setAddLoading(true);

    try {
      await authFetch('/add-url', {
        method: 'POST',
        body: JSON.stringify({ url: newUrl }),
      });

      setNewUrl('');
      fetchData(); // Refresh list and potentially user limits/counts if we tracked usage in user object
    } catch (err) {
      setAddError(err.message);
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
        alert(`Check Result:\nStatus: ${result.status}\nResponse Time: ${result.responseTimeMs}ms\nSuccess: ${result.success}`);
        fetchData(); // Refresh status on the card
    } catch (e) {
        alert('Check failed: ' + e.message);
    } finally {
        setCheckLoading(null);
    }
  };

  const getLatencyLabel = (ms) => {
    if (!ms) return 'N/A';
    if (ms < 150) return `${ms}ms (Fast)`;
    if (ms < 500) return `${ms}ms (OK)`;
    return `${ms}ms (Slow)`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Arial' }}>
      <h2>Loading Dashboard...</h2>
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
            <h1 style={{ margin: 0, color: '#333' }}>SimpleApp Monitor</h1>
            {user && (
                <div style={{ marginTop: '5px', fontSize: '14px', color: '#666' }}>
                    Plan: <strong>{user.plan === 'pro' ? 'Pro' : 'Free'}</strong>
                    {user.plan !== 'pro' && (
                        <button 
                            onClick={() => navigate('/upgrade')}
                            style={{ marginLeft: '10px', padding: '4px 8px', fontSize: '12px', background: '#38b2ac', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Upgrade to Pro
                        </button>
                    )}
                </div>
            )}
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ marginBottom: '40px', padding: '25px', backgroundColor: '#f9f9f9', borderRadius: '12px', border: '1px solid #eee' }}>
        <h3 style={{ marginTop: 0 }}>Add New Service</h3>
        {addError && (
            <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#fff5f5', borderRadius: '4px', fontSize: '14px' }}>
                {addError}
                {addError.includes('Limit reached') && (
                    <div style={{ marginTop: '5px' }}>
                        <button onClick={() => navigate('/upgrade')} style={{ color: '#0070f3', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}>
                            Upgrade to increase limits
                        </button>
                    </div>
                )}
            </div>
        )}
        <form onSubmit={handleAddUrl} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://example.com"
            style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
            required
            disabled={addLoading}
          />
          <button 
            type="submit" 
            disabled={addLoading}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: addLoading ? '#ccc' : '#0070f3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: addLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {addLoading ? 'Adding...' : 'Add URL'}
          </button>
        </form>
      </div>

      <div>
        <h3 style={{ color: '#555', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Monitored Services ({urls.length}/{user?.max_urls || 5})</h3>
        {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
        
        {urls.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
            No URLs added yet. Start by adding one above.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {urls.map((item) => {
              const isChecking = checkLoading === item.url;
              return (
                <div key={item.id} style={{ 
                  padding: '20px', 
                  borderRadius: '10px', 
                  border: '1px solid #ddd', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  backgroundColor: 'white'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      <strong style={{ fontSize: '18px' }}>{item.name || 'Service'}</strong>
                      {isChecking ? (
                        <span style={{ fontSize: '12px', padding: '3px 8px', backgroundColor: '#eee', borderRadius: '12px', color: '#666' }}>CHECKING...</span>
                      ) : (
                        <span style={{ 
                          fontSize: '12px', 
                          padding: '3px 8px', 
                          backgroundColor: item.last_status ? '#e6fffa' : '#fff5f5', 
                          color: item.last_status ? '#28a745' : '#dc3545', 
                          borderRadius: '12px',
                          fontWeight: 'bold',
                          border: `1px solid ${item.last_status ? '#b2f2bb' : '#feb2b2'}`
                        }}>
                          {item.last_status ? 'UP' : 'DOWN'}
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#0070f3', fontSize: '14px', marginBottom: '8px' }}>{item.url}</div>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#777' }}>
                      <span>Latency: <strong>{getLatencyLabel(item.last_response_time_ms)}</strong></span>
                      <span>Last Check: {item.last_checked_at ? new Date(item.last_checked_at).toLocaleTimeString() : 'Never'}</span>
                    </div>
                  </div>
                  
                  <button 
                      onClick={() => handleCheck(item.url)}
                      disabled={isChecking}
                      style={{ 
                          padding: '10px 16px', 
                          fontSize: '13px', 
                          cursor: isChecking ? 'not-allowed' : 'pointer',
                          backgroundColor: isChecking ? '#eee' : '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '6px',
                          color: isChecking ? '#999' : '#333',
                          transition: 'all 0.2s',
                          fontWeight: '500'
                      }}
                  >
                      {isChecking ? 'Checking...' : 'Check Now'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;



