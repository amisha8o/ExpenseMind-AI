import React, { useState } from 'react';
import { Search, Filter, Plus, ArrowUpDown, Tag } from 'lucide-react';
import TransactionCard from '../components/TransactionCard';
import './Transactions.css';

export default function Transactions({ transactions, onDeleteTransaction, onOpenAddExpense }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = [
    'all',
    'Tech',
    'Food & Dining',
    'Subscriptions',
    'Salary',
    'Transport',
    'Health & Wellness',
    'Investments',
    'Freelance'
  ];

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
  String(tx.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  String(tx.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  String(tx.category || '').toLowerCase().includes(searchTerm.toLowerCase());

   
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

    // Financial summary for currently visible transactions
  const totalIncome = filteredTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const totalExpense = filteredTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="transactions-page">
      <div className="page-header glass-panel">
        <div>
          <h2>Transactions Directory</h2>
          <p>Search, filter, and manage all your historical income and expense records.</p>
        </div>
        <button className="btn-primary" onClick={onOpenAddExpense}>
          <Plus size={18} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar glass-panel">
        <div className="search-filter-input">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, note, merchant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control padded-left"
          />
        </div>

        <div className="filter-group">
          <div className="select-wrapper">
            <Filter size={16} className="select-icon" />
            <select 
              className="form-control padded-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Incomes Only</option>
            </select>
          </div>

          <div className="select-wrapper">
            <Tag size={16} className="select-icon" />
            <select 
              className="form-control padded-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
            {/* Financial Summary */}
      <div className="transaction-summary-grid">
        <div className="summary-card glass-panel">
          <span className="summary-label">Total Income</span>
          <strong className="summary-value income-text">
            ₹{totalIncome.toLocaleString('en-IN', {
              minimumFractionDigits: 2
            })}
          </strong>
        </div>

        <div className="summary-card glass-panel">
          <span className="summary-label">Total Expenses</span>
          <strong className="summary-value expense-text">
            ₹{totalExpense.toLocaleString('en-IN', {
              minimumFractionDigits: 2
            })}
          </strong>
        </div>

        <div className="summary-card glass-panel">
          <span className="summary-label">Net Balance</span>
          <strong className={`summary-value ${netBalance >= 0 ? 'income-text' : 'expense-text'}`}>
            ₹{netBalance.toLocaleString('en-IN', {
              minimumFractionDigits: 2
            })}
          </strong>
        </div>

        <div className="summary-card glass-panel">
          <span className="summary-label">Transactions</span>
          <strong className="summary-value">
            {filteredTransactions.length}
          </strong>
        </div>
      </div>

      {/* Transaction List */}
      <div className="transactions-list-container">
        {filteredTransactions.length === 0 ? (
          <div className="empty-state glass-panel">
            <p>No transactions match your current search/filter criteria.</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              onDelete={onDeleteTransaction}
            />
          ))
        )}
      </div>
    </div>
  );
}
