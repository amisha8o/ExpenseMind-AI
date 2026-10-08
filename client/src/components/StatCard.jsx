import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles } from 'lucide-react';
import './StatCard.css';

export default function StatCard({ title, value, change, isPositive, icon: Icon, color = 'cyan', isAi = false }) {
  return (
    <div className={`stat-card glass-panel theme-${color}`}>
      <div className="stat-card-header">
        <div className="stat-icon-box">
          <Icon size={22} />
        </div>
        {change && (
          <div className={`trend-badge ${isPositive ? 'trend-up' : 'trend-down'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{change}</span>
          </div>
        )}
        {isAi && (
          <span className="badge badge-purple">
            <Sparkles size={12} /> AI Live
          </span>
        )}
      </div>

      <div className="stat-card-content">
        <span className="stat-title">{title}</span>
         <h3 className="stat-value">{value}</h3>
      </div>
    </div>
  );
}
