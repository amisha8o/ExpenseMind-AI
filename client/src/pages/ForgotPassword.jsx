import React, { useState } from "react";
import { Mail, ArrowRight, BrainCircuit } from "lucide-react";
import { api } from "../services/api";
import "./Auth.css";

export default function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await api.forgotPassword(email);

      setMessage(
        response?.message ||
          "If an account exists with this email, a password reset link has been sent."
      );

      setEmail("");
    } catch (err) {
      setError(
        err.message ||
          "Unable to send reset link. Please try again."
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

          <h2>Forgot Password?</h2>

          <p className="auth-subtitle">
            Enter your registered email and we will send you a
            password reset link.
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>

            <div className="input-icon-wrapper">
              <Mail
                className="input-field-icon"
                size={16}
              />

              <input
                type="email"
                className="form-control padded-left"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
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
              {loading ? "Sending..." : "Send Reset Link"}
            </span>

            <ArrowRight size={18} />
          </button>
        </form>

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