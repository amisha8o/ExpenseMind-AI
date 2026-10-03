import React, { useState } from 'react';
import { BrainCircuit, Mail, Lock, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import './Auth.css';

export default function Login({
  onLoginSuccess,
  onSwitchToRegister,
  onForgotPassword
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await api.login(email, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel">
        <div className="auth-brand">
          <div className="auth-logo-box"><BrainCircuit size={28} /></div>
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Access your AI Autonomous Financial Portal</p>
        </div>

        {error && <div className="auth-error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-field-icon" size={16} />
              <input
                type="email"
                className="form-control padded-left"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-field-icon" size={16} />
              <input
                type="password"
                className="form-control padded-left"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '20px' }}>
  <button
    type="button"
    className="auth-switch-btn"
    onClick={onForgotPassword}
  >
    Forgot Password?
  </button>
</div>
          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account?</p>
          <button className="auth-switch-btn" onClick={onSwitchToRegister}>Create an Account</button>
        </div>
      </div>
    </div>
  );
}