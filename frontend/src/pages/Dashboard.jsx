import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addError, setAddError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('https://simpleapp-gp8l.onrender.com/urls', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch URLs');

      const data = await response.json();
      setUrls(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUrl = async (e) => {
    e.preventDefault();
    setAddError(null);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('https://simpleapp-gp8l.onrender.com/add-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: newUrl }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to add URL');

      setNewUrl('');
      fetchUrls(); // Refresh list
    } catch (err) {
      setAddError(err.message);
    }
  };

  const handleCheck = async (url) => {
    // Optional: Trigger a manual check and update the specific item (implementation simplified here)
    // For now, we rely on the list view or could implement a per-item check
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('https://simpleapp-gp8l.onrender.com/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ url })
        });
        const result = await response.json();
        alert(`Check Result:\nStatus: ${result.status}\nResponse Time: ${result.responseTimeMs}ms\nSuccess: ${result.success}`);
    } catch (e) {
        alert('Check failed');
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
          />
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Add URL
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
                    style={{ padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}
                >
                    Check Now
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
