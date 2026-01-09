import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { publicFetch } from '../utils/api';
import './Auth.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match');
    
    setLoading(true);
    setError('');

    try {
      await publicFetch('/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      navigate('/login?reset=success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="error-message">Invalid or missing reset token.</div>
          <Link to="/login" className="btn-full" style={{textDecoration:'none'}}>Return to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Link to="/" className="auth-logo">SimpleMonitor.</Link>
      <div className="auth-container">
        <div className="auth-header">
          <h2>Set New Password</h2>
          <p>Re-establish secure access to your command center.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>NEW PASSWORD</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="••••••••"
            />
          </div>
          <div className="form-group">
            <label>CONFIRM NEW PASSWORD</label>
            <input
              className="form-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="••••••••"
            />
          </div>

          <div className="auth-actions">
            <button type="submit" className="btn-full" disabled={loading}>
              {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
