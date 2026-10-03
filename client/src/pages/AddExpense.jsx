import React, { useState } from 'react';
import { UploadCloud, Sparkles, FileCheck } from 'lucide-react';
import ExpenseForm from '../components/ExpenseForm';
import './AddExpense.css';

export default function AddExpense({ onSubmitSuccess, onCancel }) {
  const [ocrFile, setOcrFile] = useState(null);

  return (
    <div className="add-expense-page">
      <div className="page-header glass-panel">
        <div>
          <h2>Log Financial Transaction</h2>
          <p>Add expenses or income. Receipt OCR is prepared for a future Vision AI integration.</p>
        </div>
      </div>

      <div className="add-expense-grid">
        {/* Left: Standard Expense Form */}
        <div className="form-wrapper">
          <ExpenseForm onSubmitSuccess={onSubmitSuccess} onCancel={onCancel} />
        </div>

        {/* Right: Vision AI Receipt OCR Dropzone */}
        <div className="ocr-scanner-widget glass-panel">
          <div className="ocr-header">
            <Sparkles size={20} className="gradient-ai-text" />
            <h3>AI Receipt Scanner</h3>
          </div>
          <p className="ocr-desc">Receipt OCR is not enabled in this release. Upload processing will be added when the Vision AI pipeline is connected to the backend.</p>

          <label className="ocr-dropzone">
            <UploadCloud size={40} className="upload-icon" />
            <p className="drop-title">
              {ocrFile ? ocrFile.name : 'Receipt OCR — Coming Soon'}
            </p>
            <span className="drop-sub">PNG, JPG and PDF support planned · No fake scan results are generated</span>
            <input type="file" accept="image/png,image/jpeg,application/pdf" hidden disabled onChange={(e) => setOcrFile(e.target.files?.[0] || null)} />
          </label>

          <div className="ocr-result-badge glass-panel">
            <FileCheck size={16} />
            <span>{ocrFile ? "File selected. OCR processing will be available in a future release." : "OCR processing is currently disabled."}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
