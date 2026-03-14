import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Boxes, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'Inventory Manager' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = signup(form.name, form.email, form.password, form.role);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, 500);
  }

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
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12), transparent 60%)',
        top: '-12%',
        left: '-8%',
        animation: 'float 7s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1), transparent 60%)',
        bottom: '-8%',
        right: '-5%',
        animation: 'float 9s ease-in-out infinite reverse',
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
            background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
          }}>
            <Boxes size={28} color="white" />
          </div>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 4 }}>Create Account</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>Get started with StockFlow IMS</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: 32 }}>
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

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option value="Inventory Manager">Inventory Manager</option>
              <option value="Warehouse Staff">Warehouse Staff</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ width: '100%', paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  color: 'var(--color-text-muted)',
                  padding: 0,
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
            {!loading && <ArrowRight size={18} />}
          </button>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 500 }}>Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
