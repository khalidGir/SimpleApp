import React, { useState } from 'react';

function App() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://simpleapp-gp8l.onrender.com/health');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setHealthData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '50px auto',
    textAlign: 'center',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px'
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    marginBottom: '20px'
  };

  const infoStyle = {
    textAlign: 'left',
    marginTop: '20px',
    backgroundColor: '#f5f5f5',
    padding: '15px',
    borderRadius: '4px'
  };

  return (
    <div style={containerStyle}>
      <h1>Backend Health Check</h1>
      <button onClick={checkHealth} style={buttonStyle} disabled={loading}>
        {loading ? 'Checking...' : 'Check Backend Health'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          Error: {error}
        </div>
      )}

      {healthData && (
        <div style={infoStyle}>
          <p><strong>Status:</strong> {healthData.status}</p>
          <p><strong>Timestamp:</strong> {healthData.timestamp}</p>
        </div>
      )}
    </div>
  );
}

export default App;
