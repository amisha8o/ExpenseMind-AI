import React, { useState } from 'react';
import { BrainCircuit, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import './Auth.css';

export default function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await api.register(name, email, password);
      onRegisterSuccess(user);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel">
        <div className="auth-brand">
          <div className="auth-logo-box"><BrainCircuit size={28} /></div>
          <h2>Create AI Account</h2>
          <p className="auth-subtitle">Unlock real-time financial neural analytics</p>
        </div>

        {error && <div className="auth-error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-icon-wrapper">
              <User className="input-field-icon" size={16} />
              <input type="text" className="form-control padded-left" value={name}
                onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-field-icon" size={16} />
              <input type="email" className="form-control padded-left" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" required />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-field-icon" size={16} />
              <input type="password" className="form-control padded-left" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters..." required />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            <span>{loading ? 'Initializing Account...' : 'Get Started Free'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account?</p>
          <button className="auth-switch-btn" onClick={onSwitchToLogin}>Sign In Here</button>
        </div>
      </div>
    </div>
  );
}