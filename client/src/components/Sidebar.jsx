import React from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  BarChart3, 
  Sparkles, 
  PlusCircle, 
  UserCircle,
  Target,
  BrainCircuit,
  LogOut 
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  const navItems = [
    { id: 'home', label: 'Overview Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'goals', label: 'Financial Goals', icon: Target },
    { id: 'reports', label: 'Analytics Reports', icon: BarChart3 },
    { id: 'ai-insights', label: 'AI Insights', icon: Sparkles, highlight: true },
    { id: 'add-expense', label: 'Log Expense', icon: PlusCircle },
    { id: 'profile', label: 'Profile Settings', icon: UserCircle },
  ];

  return (
    <aside className="sidebar-container glass-panel">
      <div className="sidebar-brand" onClick={() => setActivePage('home')}>
        <div className="brand-icon-wrapper">
          <BrainCircuit size={26} className="brand-logo-icon" />
        </div>
        <div className="brand-title">
          <span className="brand-name">Expense<span className="gradient-text">Mind</span></span>
          <span className="brand-subtitle">AI FINANCIAL SUITE</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-link ${isActive ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={20} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {item.highlight && <span className="ai-badge-sm">AI</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="ai-upgrade-box">
          <div className="ai-upgrade-title">
            <Sparkles size={16} />
            <span>AI Neural V2</span>
          </div>
          <p className="ai-upgrade-desc">Real-time spending anomaly detection enabled.</p>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
