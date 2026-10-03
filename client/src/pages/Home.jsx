import React from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  PieChart, 
  Lock,
  Bot
} from 'lucide-react';
import './Home.css';

export default function Home({ onGetStarted, onLogin }) {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <header className="home-hero">
        <div className="hero-pill-badge">
          <Sparkles size={14} className="hero-sparkle" />
          <span>Next Generation AI Financial Intelligence</span>
        </div>

        <h1 className="hero-title">
          Master Your Wealth With <br />
          <span className="gradient-text">Autonomous AI Insights</span>
        </h1>

        <p className="hero-subtitle">
          ExpenseMind AI automatically categorizes transactions, forecasts future savings, detects hidden subscription leaks, and optimizes your financial freedom.
        </p>

        <div className="hero-cta-group">
          <button className="btn-primary hero-btn-lg" onClick={onGetStarted}>
            <span>Open AI Dashboard</span>
            <ArrowRight size={18} />
          </button>
          <button className="btn-secondary hero-btn-lg" onClick={onLogin}>
            <span>Sign In</span>
          </button>
        </div>

        {/* Hero Interactive Preview Card */}
        <div className="hero-preview-glass glass-panel">
          <div className="preview-header">
            <div className="preview-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <span className="preview-title"><Bot size={14} /> AI Neural Monitor Active</span>
          </div>
          <div className="preview-content">
            <div className="preview-stat-grid">
              <div className="p-stat">
                <span className="p-label">Monthly Savings Forecast</span>
                <span className="p-val gradient-text">$3,420.00</span>
              </div>
              <div className="p-stat">
                <span className="p-label">AI Optimization Score</span>
                <span className="p-val text-purple">96.4%</span>
              </div>
              <div className="p-stat">
                <span className="p-label">Auto-Categorized</span>
                <span className="p-val text-emerald">100% Verified</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Feature Grid */}
      <section className="features-section">
        <h2 className="section-title">
          Powered By Advanced <span className="gradient-ai-text">Neural Finance</span>
        </h2>

        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon-box purple">
              <BrainCircuit size={24} />
            </div>
            <h3>Smart Auto-Categorization</h3>
            <p>Our deep learning algorithm reads transaction titles and instantly tags merchant categories with 99.8% precision.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon-box cyan">
              <Zap size={24} />
            </div>
            <h3>Real-Time Anomaly Alerts</h3>
            <p>Get notified before overspending happens. AI monitors recurring payments and flags unexpected price hikes.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon-box emerald">
              <BarChart3 size={24} />
            </div>
            <h3>Predictive Cash Flow</h3>
            <p>Visual trend analytics project your end-of-month net worth based on live lifestyle spending habits.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon-box amber">
              <ShieldCheck size={24} />
            </div>
            <h3>Bank-Grade Security</h3>
            <p>AES-256 encrypted local storage and OAuth integration ensure your financial privacy remains 100% strictly yours.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
