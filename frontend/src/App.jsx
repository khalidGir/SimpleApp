import React, { useState, useEffect } from 'react';

function App() {
  // Existing Health Check State
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // New URL Check State
  const [targetUrl, setTargetUrl] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkError, setCheckError] = useState(null);

  useEffect(() => {
    const savedResult = localStorage.getItem('lastCheckResult');
    if (savedResult) {
      try {
        setCheckResult(JSON.parse(savedResult));
      } catch (e) {
        console.error("Failed to parse saved result", e);
      }
    }
  }, []);

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

  const checkApi = async () => {
    if (!targetUrl.startsWith('https://')) {
      setCheckError('URL must start with https://');
      return;
    }

    setCheckLoading(true);
    setCheckError(null);
    setCheckResult(null);

    try {
      const response = await fetch('https://simpleapp-gp8l.onrender.com/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCheckResult(data);
      localStorage.setItem('lastCheckResult', JSON.stringify(data));
    } catch (e) {
      setCheckError(e.message);
    } finally {
      setCheckLoading(false);
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

  const sectionStyle = {
    marginBottom: '40px',
    borderBottom: '1px solid #eee',
    paddingBottom: '20px'
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    margin: '10px'
  };

  const inputStyle = {
    padding: '10px',
    fontSize: '16px',
    width: '70%',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginRight: '10px'
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
      <div style={sectionStyle}>
        <h2>Backend Health Check</h2>
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

      <div>
        <h2>Check External API</h2>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="https://example.com"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            style={inputStyle}
          />
          <button onClick={checkApi} style={buttonStyle} disabled={checkLoading}>
            {checkLoading ? 'Checking...' : 'Check API'}
          </button>
        </div>

        {checkError && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            Error: {checkError}
          </div>
        )}

        {checkResult && (
          <div style={infoStyle}>
            <p><strong>Status Code:</strong> {checkResult.status}</p>
            <p><strong>Response Time:</strong> {checkResult.responseTimeMs} ms</p>
            <p><strong>Timestamp:</strong> {checkResult.timestamp}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;