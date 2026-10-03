import React, { useEffect, useMemo, useState } from 'react';
import { PieChart, AlertTriangle, CheckCircle, Edit2, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import './Budgets.css';

export default function Budgets({ budgets, onUpdateBudget }) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [newLimit, setNewLimit] = useState('');
  const [intelligence, setIntelligence] = useState(null);
  const [error, setError] = useState('');
  const currency = api.getCurrentUser()?.currency || 'INR';
  const money = useMemo(()=>new Intl.NumberFormat('en-IN',{style:'currency',currency,maximumFractionDigits:0}),[currency]);

  useEffect(()=>{ api.getBudgetIntelligence().then(setIntelligence).catch(e=>setError(e.message || 'Unable to load budget intelligence.')); }, [budgets]);

  const handleEditClick = (b) => { setEditingCategory(b.category); setNewLimit(b.limit); };
  const handleSave = async (category) => { if (newLimit && !isNaN(newLimit)) await onUpdateBudget(category, newLimit); setEditingCategory(null); };
  const insight = intelligence?.intelligence?.find(i=>i.status === 'Exceeded') || intelligence?.intelligence?.find(i=>i.status === 'Warning') || intelligence?.intelligence?.[0];

  return <div className="budgets-page">
    <div className="page-header glass-panel"><div><h2>Budgets & Spend Limits</h2><p>Set spending thresholds per category and receive live budget intelligence from your transaction data.</p></div><div className="ai-status-pill"><Sparkles size={14}/><span>AI Budget Guard Active</span></div></div>
    {error && <div className="save-alert">{error}</div>}
    {insight && <div className="ai-budget-banner glass-panel"><div className="banner-icon-box"><Sparkles size={24} className="banner-icon"/></div><div className="banner-content"><h4>Live Budget Intelligence: {insight.category}</h4><p>{insight.alert} Current utilization: {insight.utilization}%. {insight.status === 'Exceeded' ? `Overspending: ${money.format(insight.overspendingAmount || 0)}.` : `Remaining: ${money.format(insight.remainingAmount || 0)}.`}</p></div></div>}
    {!budgets.length ? <div className="glass-panel" style={{padding:35,textAlign:'center'}}>No budgets found. Create budgets from your backend budget workflow to see live limits here.</div> : <div className="budgets-grid">{budgets.map((b)=>{
      const percent = b.limit > 0 ? Math.round((Number(b.spent||0)/Number(b.limit))*100) : 0;
      const displayPercent=Math.min(Math.max(percent,0),100); const isWarning=percent>=80; const isExceeded=percent>100;
      return <div key={b.category} className="budget-card glass-panel"><div className="budget-card-header"><div className="cat-title-group"><span className="cat-color-dot" style={{background:b.color}}/><h4>{b.category}</h4></div>{isExceeded?<span className="badge badge-rose"><AlertTriangle size={12}/> Exceeded</span>:isWarning?<span className="badge badge-amber"><AlertTriangle size={12}/> Near Limit</span>:<span className="badge badge-emerald"><CheckCircle size={12}/> On Track</span>}</div>
        <div className="budget-progress-meta"><span className="spent-val">{money.format(b.spent||0)} spent</span><span className="limit-val">of {money.format(b.limit||0)}</span></div><div className="progress-bar-track"><div className={`progress-bar-fill ${isExceeded?'exceeded':isWarning?'warning':''}`} style={{width:`${displayPercent}%`,background:isExceeded?'var(--accent-rose)':isWarning?'var(--accent-amber)':b.color}}/></div>
        <div className="budget-card-footer">{editingCategory===b.category?<div className="edit-limit-form"><input type="number" value={newLimit} onChange={e=>setNewLimit(e.target.value)} className="form-control edit-input"/><button className="btn-primary btn-sm" onClick={()=>handleSave(b.category)}>Save</button></div>:<button className="edit-btn" onClick={()=>handleEditClick(b)}><Edit2 size={14}/><span>Adjust Limit</span></button>}<span className="percent-text">{Math.max(percent,0)}%</span></div></div>
    })}</div>}
  </div>;
}
