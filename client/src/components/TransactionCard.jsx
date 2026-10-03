import React from 'react';
import { 
  Laptop, 
  Utensils, 
  Tv, 
  Briefcase, 
  Car, 
  HeartPulse, 
  TrendingUp, 
  Trash2, 
  Tag 
} from 'lucide-react';
import './TransactionCard.css';

const categoryIcons = {
  'Tech': Laptop,
  'Food & Dining': Utensils,
  'Subscriptions': Tv,
  'Salary': Briefcase,
  'Transport': Car,
  'Health & Wellness': HeartPulse,
  'Investments': TrendingUp,
  'Freelance': Briefcase
};

export default function TransactionCard({ transaction, onDelete }) {
  const Icon = categoryIcons[transaction.category] || Tag;
  const isIncome = transaction.type === 'income';

  return (
    <div className="transaction-card glass-panel">
      <div className="tx-left">
        <div className={`tx-icon-circle ${isIncome ? 'income' : 'expense'}`}>
          <Icon size={20} />
        </div>
        <div className="tx-info">
          <h4 className="tx-title">{transaction.title}</h4>
          <div className="tx-sub-meta">
            <span className="tx-category">{transaction.category}</span>
            <span className="tx-dot">•</span>
            <span className="tx-date">
  {transaction.date
    ? new Date(transaction.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'N/A'}
</span>
          </div>
          {transaction.note && <p className="tx-note">{transaction.note}</p>}
        </div>
      </div>

      <div className="tx-right">
        <div className={`tx-amount ${isIncome ? 'income-val' : 'expense-val'}`}>
          {isIncome ? '+' : '-'}₹{Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
        {onDelete && (
          <button 
            className="tx-delete-btn" 
            onClick={() => onDelete(transaction.id, transaction.type)}
            title="Delete Transaction"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
