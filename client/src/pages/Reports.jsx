import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileSpreadsheet, Award, TrendingUp, Calendar } from 'lucide-react';
import { api } from '../services/api';
import './Reports.css';

export default function Reports({ transactions, user }) {
  const [report, setReport] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currency = user?.currency || 'INR';
  const money = useMemo(() => new Intl.NumberFormat('en-IN',{style:'currency',currency,maximumFractionDigits:0}),[currency]);

  useEffect(() => {
    Promise.all([api.getReport(), api.getFinancialHealth()])
      .then(([r,h])=>{setReport(r);setHealth(h);})
      .catch(e=>setError(e.message || 'Unable to load reports.'))
      .finally(()=>setLoading(false));
  }, []);

  const exportCsv = async () => { try { await api.downloadReportCsv(); } catch(e) { setError(e.message || 'CSV export failed.'); } };
  const printPdf = () => window.print();

  const categories = report?.categoryBreakdown || [];
  const score = Number(health?.healthScore ?? health?.score ?? 0);
  const status = health?.status || 'Not available';
  const savingsRate = Number(report?.savingsRate || 0);

  return <div className="reports-page">
    <div className="page-header glass-panel">
      <div><h2>Analytics & Financial Reports</h2><p>Live analytics generated from your ExpenseMind account data.</p></div>
      <div className="export-actions"><button className="btn-secondary" onClick={exportCsv}><FileSpreadsheet size={16}/><span>Export CSV</span></button><button className="btn-primary" onClick={printPdf}><Download size={16}/><span>Print / Save PDF</span></button></div>
    </div>
    {error && <div className="save-alert">{error}</div>}
    {loading ? <div className="glass-panel" style={{padding:30}}>Loading report…</div> : <>
      <div className="health-score-banner glass-panel">
        <div className="score-left"><div className="score-badge-circle"><Award size={32}/></div><div><h3>Financial Health Index: {score} / 100</h3><p>Current account status: <strong>{status}</strong>. Savings rate for the selected report period is <strong>{savingsRate}%</strong>.</p></div></div>
        <div className="score-stats"><div className="h-stat"><span className="h-label">Income</span><span className="h-val text-emerald">{money.format(report?.totalIncome || 0)}</span></div><div className="h-stat"><span className="h-label">Expenses</span><span className="h-val text-cyan">{money.format(report?.totalExpense || 0)}</span></div></div>
      </div>
      <div className="reports-grid">
        <div className="category-report-widget glass-panel"><div className="widget-header"><h3>Expense Distribution by Category</h3></div><div className="category-bars-list">{categories.length ? categories.map(item=><div key={item.category} className="cat-report-item"><div className="cat-report-meta"><span className="cat-name">{item.category}</span><span className="cat-val">{money.format(item.total)} ({item.percent}%)</span></div><div className="cat-track"><div className="cat-fill" style={{width:`${item.percent}%`}}/></div></div>) : <p>No expense data available.</p>}</div></div>
        <div className="trend-report-widget glass-panel"><div className="widget-header"><h3>Cash Flow Summary</h3></div><div className="report-flow-summary"><div><span>Net savings</span><strong>{money.format(report?.netSavings || 0)}</strong></div><div><span>Transactions</span><strong>{report?.transactionCount || 0}</strong></div><div><span>Generated</span><strong><Calendar size={15}/> {new Date().toLocaleDateString()}</strong></div></div><p className="trend-note">This report is calculated from the current server-side income and expense records; no demo trend values are used.</p></div>
      </div>
    </>}
  </div>;
}
