import React, { useState } from "react";
import { Lock, ArrowRight, BrainCircuit } from "lucide-react";
import { api } from "../services/api";
import "./Auth.css";

export default function ResetPassword({ token, onBackToLogin }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.resetPassword(token, password);

      setMessage(
        response?.message ||
          "Password reset successful. You can now login."
      );

      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.message || "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel">
        <div className="auth-brand">
          <div className="auth-logo-box">
            <BrainCircuit size={28} />
          </div>

          <h2>Reset Password</h2>

          <p className="auth-subtitle">
            Create a new password for your ExpenseMind AI account.
          </p>
        </div>

        {message && (
          <div className="auth-success-msg">
            {message}
          </div>
        )}

        {error && (
          <div className="auth-error-msg">
            {error}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Password</label>

              <div className="input-icon-wrapper">
                <Lock
                  className="input-field-icon"
                  size={16}
                />

                <input
                  type="password"
                  className="form-control padded-left"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>

              <div className="input-icon-wrapper">
                <Lock
                  className="input-field-icon"
                  size={16}
                />

                <input
                  type="password"
                  className="form-control padded-left"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm new password"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary auth-submit-btn"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Resetting..."
                  : "Reset Password"}
              </span>

              <ArrowRight size={18} />
            </button>
          </form>
        )}

        <div className="auth-footer">
          <button
            type="button"
            className="auth-switch-btn"
            onClick={onBackToLogin}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}