import React, { useState } from 'react';
import { Sparkles, Send, Bot, ShieldAlert, CheckCircle2, TrendingUp, Zap, HelpCircle } from 'lucide-react';
import './AIInsights.css';

export default function AIInsights({ aiInsights, onGenerateInsight }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleSendPrompt = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setError('');
    try {
      await onGenerateInsight(prompt);
      setPrompt('');
    } catch (err) {
      setError(err.message || 'Failed to generate AI insight. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const samplePrompts = [
    "Where can I cut $300 from my monthly expenses?",
    "Analyze my recurring subscriptions for duplicates.",
    "Forecast my net worth in 12 months."
  ];

  return (
    <div className="ai-insights-page">
      <div className="page-header glass-panel">
        <div>
          <h2><Sparkles className="gradient-ai-text" size={24} /> AI Neural Advisor</h2>
          <p>Continuous AI analysis of your bank flows, anomaly detection, and automated wealth optimizations.</p>
        </div>
        <div className="ai-badge-header">
          <Bot size={18} />
          <span>ExpenseMind Gemini AI Engine</span>
        </div>
      </div>

      {/* Interactive AI Prompt Box */}
      <div className="ai-chat-card glass-panel">
        <div className="chat-header">
          <div className="bot-avatar">
            <Bot size={22} />
          </div>
          <div>
            <h4>Query Neural Financial Model</h4>
            <p>Ask anything regarding your budget, spending limits, or investment allocation.</p>
          </div>
        </div>

        <form onSubmit={handleSendPrompt} className="prompt-form">
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '12px',
              fontSize: '14px',
            }}>
              {error}
            </div>
          )}
          <div className="prompt-input-wrapper">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. How can I optimize my food budget without changing my routine?"
              className="form-control prompt-input"
              disabled={isGenerating}
            />
            <button type="submit" className="btn-ai prompt-submit" disabled={!prompt.trim() || isGenerating}>
              <Send size={16} />
              <span>{isGenerating ? 'Processing...' : 'Analyze'}</span>
            </button>
          </div>
        </form>

        <div className="sample-prompts">
          <span className="sample-label"><HelpCircle size={14} /> Quick Queries:</span>
          {samplePrompts.map((p, idx) => (
            <button key={idx} className="prompt-chip" onClick={() => setPrompt(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* List of Insights */}
      <div className="insights-feed-container">
        <h3 className="section-subtitle">Active Autonomous Insights</h3>

        <div className="insights-grid">
          {aiInsights.map((insight) => (
            <div key={insight.id} className="insight-card glass-panel">
              <div className="insight-card-top">
                <div className={`insight-icon-box ${insight.type}`}>
                  {insight.type === 'warning' ? (
                    <ShieldAlert size={20} />
                  ) : insight.type === 'success' ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <Zap size={20} />
                  )}
                </div>
                <div className="insight-meta">
                  <h4>{insight.title}</h4>
                  <span className="insight-date">{insight.date}</span>
                </div>
              </div>

              <p className="insight-body">{insight.message}</p>

              <div className="insight-card-bottom">
                <span className="savings-badge">
                  <TrendingUp size={14} /> Savings Impact: <strong>{insight.savingsPotential}</strong>
                </span>
                <button className="btn-secondary btn-sm-action">Apply Suggestion</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}