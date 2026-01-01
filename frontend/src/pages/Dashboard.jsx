import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/api';

function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(null); // URL that is being checked
  const [error, setError] = useState(null);
  const [addError, setAddError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const data = await authFetch('/urls');
      setUrls(data);
    } catch (err) {
      // If error is strictly session related, authFetch redirects.
      // Otherwise, show error.
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
      fetchUrls(); // Refresh list
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

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Add New URL</h3>
        {addError && <div style={{ color: 'red', marginBottom: '10px' }}>{addError}</div>}
        <form onSubmit={handleAddUrl} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://example.com"
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
            disabled={addLoading}
          />
          <button 
            type="submit" 
            disabled={addLoading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: addLoading ? '#ccc' : '#0070f3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: addLoading ? 'not-allowed' : 'pointer' 
            }}
          >
            {addLoading ? 'Adding...' : 'Add URL'}
          </button>
        </form>
      </div>

      <div>
        <h3>Your Monitored URLs</h3>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {urls.length === 0 ? (
          <p>No URLs added yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {urls.map((item) => (
              <li key={item.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{item.name || 'URL'}</strong>
                  <div style={{ color: '#666', fontSize: '14px' }}>{item.url}</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>Added: {new Date(item.created_at).toLocaleDateString()}</div>
                </div>
                <button 
                    onClick={() => handleCheck(item.url)}
                    disabled={checkLoading === item.url}
                    style={{ 
                        padding: '5px 10px', 
                        fontSize: '12px', 
                        cursor: checkLoading === item.url ? 'not-allowed' : 'pointer',
                        backgroundColor: checkLoading === item.url ? '#ccc' : '#EFEFEF',
                        border: '1px solid #ddd',
                        borderRadius: '3px'
                    }}
                >
                    {checkLoading === item.url ? 'Checking...' : 'Check Now'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

