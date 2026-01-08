import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../utils/api';

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
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <div className="loader">Loading status...</div>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif', color: '#666' }}>
      <h2>404</h2>
      <p>{error}</p>
    </div>
  );

  const allUp = data.services.every(s => s.last_status);
  const downCount = data.services.filter(s => !s.last_status).length;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px', color: '#333' }}>System Status</h1>
        <p style={{ color: '#666' }}>Last updated: {new Date(data.updatedAt).toLocaleString()}</p>
      </div>

      {/* Global Status Banner */}
      <div style={{ 
        padding: '20px', 
        borderRadius: '8px', 
        backgroundColor: allUp ? '#28a745' : (downCount === data.services.length ? '#dc3545' : '#ffc107'),
        color: 'white',
        textAlign: 'center',
        marginBottom: '40px',
        fontWeight: 'bold',
        fontSize: '18px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        {allUp 
          ? 'All Systems Operational' 
          : `${downCount} Service${downCount > 1 ? 's' : ''} Experiencing Issues`}
      </div>

      {/* Service List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {data.services.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999' }}>No services monitored.</p>
        ) : (
            data.services.map((service, idx) => (
            <div key={idx} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '20px',
                backgroundColor: 'white',
                border: '1px solid #eee',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                <div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#333' }}>{service.name}</h3>
                {/* <a href={service.url} target="_blank" rel="noreferrer" style={{ color: '#0070f3', fontSize: '12px', textDecoration: 'none' }}>{service.url}</a> */}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                    fontSize: '14px', 
                    color: service.last_status ? '#28a745' : '#dc3545',
                    fontWeight: '600'
                }}>
                    {service.last_status ? 'Operational' : 'Outage'}
                </span>
                <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    backgroundColor: service.last_status ? '#28a745' : '#dc3545' 
                }} />
                </div>
            </div>
            ))
        )}
      </div>

      <div style={{ marginTop: '60px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
        Powered by <a href="/" style={{ color: '#666', textDecoration: 'underline' }}>SimpleApp Monitor</a>
      </div>
    </div>
  );
}

export default StatusPage;
