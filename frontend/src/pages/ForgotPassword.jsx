import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { publicFetch } from '../utils/api';
import './Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await publicFetch('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-logo">SimpleMonitor.</Link>
      <div className="auth-container">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p>We will send a secure link to your uplink address.</p>
        </div>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>UPLINK ADDRESS (EMAIL)</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="name@example.com"
            />
          </div>

          <div className="auth-actions">
            <button type="submit" className="btn-full" disabled={loading}>
              {loading ? 'TRANSMITTING...' : 'SEND RESET LINK'}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          Remember your credentials? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
