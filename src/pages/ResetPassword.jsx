import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Boxes, ArrowLeft, KeyRound, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ResetPassword() {
  const { requestOTP, verifyOTP, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleRequestOTP(e) {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true);
    setTimeout(async () => {
      const result = await requestOTP(email);
      if (result.success) {
        setGeneratedOtp(result.otp);
        setSuccess(`OTP sent! For demo purposes, your OTP is: ${result.otp}`);
        setStep(2);
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, 800);
  }

  async function handleVerifyOTP(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!otp) { setError('Please enter the OTP'); return; }
    const result = await verifyOTP(email, otp);
    if (result.success) {
      setStep(3);
      setSuccess('OTP verified!');
    } else {
      setError(result.error);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newPassword || !confirmPassword) { setError('Please fill in all fields'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    const result = await resetPassword(email, newPassword, otp);
    if (result.success) {
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    }
  }

  const stepIcons = [KeyRound, ShieldCheck, ArrowRight];
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
            }}>
              {success}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestOTP}>
              <div className="form-group" style={{ marginBottom: 24 }}>
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
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Enter 6-digit OTP</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="123456"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  autoFocus
                  style={{ letterSpacing: '0.3em', fontSize: 'var(--font-size-lg)', textAlign: 'center' }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Verify OTP
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
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Reset Password
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
