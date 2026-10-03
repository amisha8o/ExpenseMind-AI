import React, { useState } from 'react';
import { Sparkles, PlusCircle, DollarSign, Tag, Calendar, FileText } from 'lucide-react';
import './ExpenseForm.css';

export default function ExpenseForm({ onSubmitSuccess, onCancel }) {
    const [formData, setFormData] = useState({
  title: '',
  amount: '',
  type: 'expense',
  category: 'Tech',
  date: new Date().toISOString().split('T')[0],
  note: ''
});
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiSuggestionMsg, setAiSuggestionMsg] = useState('');

  const categories = [
    'Tech',
    'Food & Dining',
    'Subscriptions',
    'Transport',
    'Entertainment',
    'Health & Wellness',
    'Salary',
    'Investments',
    'Freelance',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAiAutoCategorize = () => {
    if (!formData.title) return;
    setAiSuggesting(true);
    setTimeout(() => {
      const lower = formData.title.toLowerCase();
      let suggestedCat = 'Other';
      if (lower.includes('mac') || lower.includes('laptop') || lower.includes('phone') || lower.includes('gpu') || lower.includes('keyboard')) {
        suggestedCat = 'Tech';
      } else if (lower.includes('coffee') || lower.includes('burger') || lower.includes('dinner') || lower.includes('market') || lower.includes('groceries')) {
        suggestedCat = 'Food & Dining';
      } else if (lower.includes('uber') || lower.includes('flight') || lower.includes('gas') || lower.includes('taxi')) {
        suggestedCat = 'Transport';
      } else if (lower.includes('netflix') || lower.includes('spotify') || lower.includes('api') || lower.includes('gpt')) {
        suggestedCat = 'Subscriptions';
      }
      setFormData((prev) => ({ ...prev, category: suggestedCat }));
      setAiSuggestionMsg(`AI auto-detected category: "${suggestedCat}"`);
      setAiSuggesting(false);
    }, 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;
    onSubmitSuccess({
      ...formData,
      amount: parseFloat(formData.amount)
    });
      setFormData({
  title: '',
  amount: '',
  type: 'expense',
  category: 'Tech',
  date: new Date().toISOString().split('T')[0],
  note: ''
});
  };

  return (
    <form className="expense-form-container glass-panel" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3 className="form-title">
          <PlusCircle size={20} className="header-icon" />
          <span>Record New Transaction</span>
        </h3>
        <span className="badge badge-purple">
          <Sparkles size={12} /> Smart Categorizer
        </span>
      </div>

      <div className="type-toggle-container">
        <button
          type="button"
          className={`type-btn ${formData.type === 'expense' ? 'active-expense' : ''}`}
          onClick={() => setFormData({ ...formData, type: 'expense' })}
        >
          Expense
        </button>
        <button
          type="button"
          className={`type-btn ${formData.type === 'income' ? 'active-income' : ''}`}
          onClick={() => setFormData({ ...formData, type: 'income' })}
        >
          Income
        </button>
      </div>

      <div className="form-group">
        <label>Transaction Title</label>
        <div className="input-with-action">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g. AWS Cloud Invoice, Team Lunch, Salary..."
            className="form-control"
            required
          />
          <button
            type="button"
            className="ai-cat-btn"
            onClick={handleAiAutoCategorize}
            title="Auto-detect category with AI"
            disabled={!formData.title || aiSuggesting}
          >
            <Sparkles size={14} />
            <span>{aiSuggesting ? 'Analyzing...' : 'AI Category'}</span>
          </button>
        </div>
        {aiSuggestionMsg && <span className="ai-hint-text">{aiSuggestionMsg}</span>}
      </div>

      <div className="form-row-2">
        <div className="form-group">
          <label>Amount (₹)</label>
          <div className="input-icon-wrapper">
            <DollarSign className="input-field-icon" size={16} />
            <input
              type="number"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              className="form-control padded-left"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Category</label>
          <div className="input-icon-wrapper">
            <Tag className="input-field-icon" size={16} />
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-control padded-left"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
            <div className="form-group">
        <label>Transaction Date</label>
        <div className="input-icon-wrapper">
          <Calendar className="input-field-icon" size={16} />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="form-control padded-left"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Note / Description (Optional)</label>
        <input
          type="text"
          name="note"
          value={formData.note}
          onChange={handleInputChange}
          placeholder="Add tags, receipts, or context details..."
          className="form-control"
        />
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary flex-1">
          <PlusCircle size={18} />
          <span>Save Transaction</span>
        </button>
      </div>
    </form>
  );
}
