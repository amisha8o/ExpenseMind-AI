
import React from 'react';
import { Search, Bell, Sparkles, Plus, User } from 'lucide-react';
import './Navbar.css';
export default function Navbar({ activePage, setActivePage, onOpenAddExpense, user }) {
  return (
    <header className="navbar-container glass-panel">
      <div className="navbar-left">
        <div className="search-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search transactions, budgets, AI insights..."
            className="search-input"
          />
        </div>
      </div>
      <div className="navbar-right">
        <div className="ai-status-pill">
          <Sparkles className="ai-icon-spin" size={15} />
          <span>AI Engine Active</span>
        </div>
        <button className="nav-icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="notification-dot"></span>
        </button>
        <button className="btn-primary add-quick-btn" onClick={onOpenAddExpense}>
          <Plus size={18} />
          <span>Add Expense</span>
        </button>
        <div className="user-profile-pill" onClick={() => setActivePage('profile')}>
          <div className="avatar-circle">
            <User size={18} />
          </div>
          <div className="user-meta">
            <span className="user-name">{user?.fullName || 'Account'}</span>
            <span className="user-role">{user?.role || 'User'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}