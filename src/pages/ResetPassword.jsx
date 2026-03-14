import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, KeyRound, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

export default function ResetPassword() {
  const { requestOTP, verifyOTP, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequestOTP(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true);
    try {
      const result = await requestOTP(email);
      if (result.success) {
        setSuccess('OTP has been sent to your email! Check your inbox.');
        setStep(2);
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
    setLoading(false);
  }

  async function handleVerifyOTP(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!otp) { setError('Please enter the OTP'); return; }
    if (otp.length !== 6) { setError('OTP must be 6 digits'); return; }
    setLoading(true);
    try {
      const result = await verifyOTP(email, otp);
      if (result.success) {
        setStep(3);
        setSuccess('OTP verified! Now set your new password.');
      } else {
        setError(result.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    }
    setLoading(false);
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newPassword || !confirmPassword) { setError('Please fill in all fields'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      // Pass the OTP code to the reset function for server-side verification
      const result = await resetPassword(email, newPassword, otp);
      if (result.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
    setLoading(false);
  }

  async function handleResendOTP() {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const result = await requestOTP(email);
      if (result.success) {
        setSuccess('New OTP sent! Check your email inbox.');
      } else {
        setError(result.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP.');
    }
    setLoading(false);
  }

  const stepLabels = ['Enter Email', 'Verify OTP', 'New Password'];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1), transparent 60%)',
        top: '-10%',
        right: '-8%',
        animation: 'float 7s ease-in-out infinite',
      }} />

      <div style={{
        width: '100%',
        maxWidth: 440,
        padding: '40px',
        animation: 'fadeInUp 0.5s ease',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--color-amber), #d97706)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
          }}>
            <KeyRound size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 4 }}>Reset Password</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>Step {step} of 3 — {stepLabels[step - 1]}</p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              width: 40,
              height: 4,
              borderRadius: 'var(--radius-full)',
              background: s <= step ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
              transition: 'background var(--transition-normal)',
            }} />
          ))}
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'var(--color-rose-light)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-rose)',
              fontSize: 'var(--font-size-sm)',
              marginBottom: 20,
              animation: 'scaleIn 0.2s ease',
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{
              padding: '10px 14px',
              background: 'var(--color-emerald-light)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-emerald)',
              fontSize: 'var(--font-size-sm)',
              marginBottom: 20,
              animation: 'scaleIn 0.2s ease',
            }}>
              {success}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestOTP}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 20 }}>
                We'll send a 6-digit verification code to your email.
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Enter 6-digit OTP</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  autoFocus
                  style={{ letterSpacing: '0.3em', fontSize: 'var(--font-size-lg)', textAlign: 'center' }}
                />
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 20 }}>
                Enter the code sent to <strong style={{ color: 'var(--color-text-secondary)' }}>{email}</strong>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginBottom: 12 }}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleResendOTP}
                disabled={loading}
                style={{ width: '100%', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <RefreshCw size={14} /> Resend OTP
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 'var(--font-size-sm)' }}>
            <Link to="/login" style={{ color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
