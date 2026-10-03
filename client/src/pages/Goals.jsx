import React, { useEffect, useMemo, useState } from 'react';
import { Target, Plus, Trash2, WalletCards, CalendarDays, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import './Goals.css';

const CATEGORIES = ['Emergency Fund','Travel','Vehicle','Home','Education','Retirement','Gadget','Wedding','Investment','Other'];

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [form, setForm] = useState({ title:'', targetAmount:'', deadline:'', category:'Other', notes:'' });

  const currency = api.getCurrentUser()?.currency || 'INR';
  const money = useMemo(() => new Intl.NumberFormat('en-IN', { style:'currency', currency, maximumFractionDigits:0 }), [currency]);

  const load = async () => {
    try {
      setError('');
      const [g, s] = await Promise.all([api.getGoals(), api.getGoalSummary()]);
      setGoals(g || []); setSummary(s || null);
    } catch (e) { setError(e.message || 'Unable to load goals.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || Number(form.targetAmount) <= 0) return;
    try {
      await api.createGoal({ ...form, targetAmount:Number(form.targetAmount), deadline: form.deadline || undefined });
      setForm({ title:'', targetAmount:'', deadline:'', category:'Other', notes:'' });
      setFormOpen(false); await load();
    } catch (e) { setError(e.message || 'Unable to create goal.'); }
  };

  const contribute = async (goal) => {
    const raw = window.prompt(`Enter amount to add to ${goal.title}. Use a negative value to withdraw.`);
    if (raw === null) return;
    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount === 0) { setError('Enter a valid non-zero amount.'); return; }
    try { setSavingId(goal._id); await api.contributeToGoal(goal._id, amount); await load(); }
    catch (e) { setError(e.message || 'Unable to update goal.'); }
    finally { setSavingId(null); }
  };

  const remove = async (goal) => {
    if (!window.confirm(`Delete goal “${goal.title}”?`)) return;
    try { await api.deleteGoal(goal._id); await load(); }
    catch (e) { setError(e.message || 'Unable to delete goal.'); }
  };

  return <div className="goals-page">
    <div className="page-header glass-panel goals-header">
      <div><h2>Financial Goals</h2><p>Create savings targets, track progress, and update contributions from your real account data.</p></div>
      <button className="btn-primary" onClick={() => setFormOpen(v => !v)}><Plus size={17}/>{formOpen ? 'Close' : 'New Goal'}</button>
    </div>

    {error && <div className="goal-error">{error}</div>}

    {summary && <div className="goal-summary-grid">
      <div className="goal-stat glass-panel"><span>Total Goals</span><strong>{summary.totalGoals}</strong></div>
      <div className="goal-stat glass-panel"><span>Saved</span><strong>{money.format(summary.totalSaved || 0)}</strong></div>
      <div className="goal-stat glass-panel"><span>Remaining</span><strong>{money.format(summary.remainingAmount || 0)}</strong></div>
      <div className="goal-stat glass-panel"><span>Overall Progress</span><strong>{Number(summary.overallProgress || 0).toFixed(1)}%</strong></div>
    </div>}

    {formOpen && <form className="goal-form glass-panel" onSubmit={create}>
      <h3>Create a financial goal</h3>
      <div className="goal-form-grid">
        <input className="form-control" placeholder="Goal title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
        <input className="form-control" type="number" min="0.01" step="0.01" placeholder="Target amount" value={form.targetAmount} onChange={e=>setForm({...form,targetAmount:e.target.value})} required />
        <input className="form-control" type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})} />
        <select className="form-control" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
        <input className="form-control goal-notes" placeholder="Notes (optional)" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
      </div>
      <button className="btn-primary" type="submit">Create Goal</button>
    </form>}

    {loading ? <div className="goal-empty glass-panel">Loading goals…</div> : goals.length === 0 ? <div className="goal-empty glass-panel"><Target size={34}/><h3>No financial goals yet</h3><p>Create your first goal to start tracking savings progress.</p></div> :
      <div className="goals-grid">{goals.map(goal => {
        const progress = Math.min(Number(goal.progressPercent || 0), 100);
        return <article className="goal-card glass-panel" key={goal._id}>
          <div className="goal-card-top"><div className="goal-title"><Target size={19}/><div><h3>{goal.title}</h3><span>{goal.category}</span></div></div><button className="icon-danger" onClick={()=>remove(goal)} title="Delete goal"><Trash2 size={17}/></button></div>
          <div className="goal-amounts"><strong>{money.format(goal.savedAmount || 0)}</strong><span>of {money.format(goal.targetAmount || 0)}</span></div>
          <div className="goal-progress"><div style={{width:`${progress}%`}}/></div>
          <div className="goal-meta"><span>{progress.toFixed(0)}% saved</span>{goal.daysLeft !== null && <span><CalendarDays size={13}/> {goal.daysLeft < 0 ? `${Math.abs(goal.daysLeft)} days overdue` : `${goal.daysLeft} days left`}</span>}</div>
          <div className="goal-status">{goal.goalStatus === 'At-risk' || goal.goalStatus === 'Delayed' ? <AlertTriangle size={14}/> : <CheckCircle2 size={14}/>} {goal.goalStatus || goal.status}</div>
          {goal.recommendation && <p className="goal-recommendation">{goal.recommendation}</p>}
          <button className="btn-secondary goal-contribute" disabled={savingId===goal._id} onClick={()=>contribute(goal)}><WalletCards size={15}/>{savingId===goal._id ? 'Updating…' : 'Add / Withdraw Funds'}</button>
        </article>;
      })}</div>}
  </div>;
}
