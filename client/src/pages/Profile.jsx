import React, { useEffect, useState } from 'react';
import { User, Shield, Save, CheckCircle2, LogOut } from 'lucide-react';
import './Profile.css';

export default function Profile({ user, onUpdateUser }) {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    currency: user?.currency || 'INR',
    aiSensitivity: user?.aiSensitivity || 'Balanced Allocation'
  });
  const [savedMsg, setSavedMsg] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      currency: user?.currency || 'INR',
      aiSensitivity: user?.aiSensitivity || 'Balanced Allocation'
    });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await onUpdateUser(formData);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch (err) {
      setError(err.message || 'Unable to save profile.');
    } finally { setSaving(false); }
  };

  return (
    <div className="profile-page">
      <div className="page-header glass-panel">
        <div><h2>Account Settings & AI Preferences</h2><p>Manage your account details, display currency, and AI recommendation mode.</p></div>
      </div>

      <div className="profile-grid">
        <form className="profile-card glass-panel" onSubmit={handleSubmit}>
          <div className="card-title-bar"><User size={20} className="text-cyan" /><h3>Personal Information</h3></div>
          {savedMsg && <div className="save-alert"><CheckCircle2 size={16}/><span>Profile settings saved to your account.</span></div>}
          {error && <div className="save-alert" style={{color:'#fca5a5'}}>{error}</div>}
          <div className="form-group"><label>Full Display Name</label><input type="text" className="form-control" value={formData.fullName} onChange={e=>setFormData({...formData,fullName:e.target.value})} required /></div>
          <div className="form-group"><label>Email Address</label><input type="email" className="form-control" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} required /></div>
          <div className="form-row-2">
            <div className="form-group"><label>Default Currency</label><select className="form-control" value={formData.currency} onChange={e=>setFormData({...formData,currency:e.target.value})}><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="INR">INR (₹)</option><option value="JPY">JPY (¥)</option></select></div>
            <div className="form-group"><label>AI Financial Mode</label><select className="form-control" value={formData.aiSensitivity} onChange={e=>setFormData({...formData,aiSensitivity:e.target.value})}><option value="Aggressive Saving">Aggressive Saving</option><option value="Balanced Allocation">Balanced Allocation</option><option value="Growth & Investments">Growth & Investments</option></select></div>
          </div>
          <button type="submit" className="btn-primary" disabled={saving}><Save size={18}/><span>{saving ? 'Saving…' : 'Save Preferences'}</span></button>
        </form>

        <div className="profile-card glass-panel">
          <div className="card-title-bar"><Shield size={20} className="text-purple"/><h3>Account & Data</h3></div>
          <div className="security-info-box"><h4>Server-backed account</h4><p>Your profile and financial records are stored through the authenticated ExpenseMind backend and database. Browser storage is used only to retain the active session token and cached user identity.</p></div>
          <div className="danger-zone"><h4>Session</h4><p>Use Sign Out to remove the active session from this browser. Your server-side financial records are not deleted.</p><button type="button" className="btn-secondary danger-btn" onClick={()=>{localStorage.removeItem('expense_token');localStorage.removeItem('expense_user');window.location.reload();}}><LogOut size={16}/><span>Sign Out</span></button></div>
        </div>
      </div>
    </div>
  );
}
