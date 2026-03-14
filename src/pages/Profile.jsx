import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Calendar, Save, Key } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    updateProfile({ name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <div className="page-subtitle">Manage your account settings</div>
        </div>
      </div>

      <div style={{ maxWidth: 600 }}>
        {/* Profile Card */}
        <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--color-emerald), #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--font-size-xl)',
              fontWeight: 700,
              color: 'white',
              flexShrink: 0,
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 4 }}>{user?.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  <Mail size={14} /> {user?.email}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  <Shield size={14} /> {user?.role}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                  <Calendar size={14} /> Joined {formatDate(user?.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={user?.email || ''} disabled style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-muted)' }} />
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Role</label>
              <input type="text" className="form-input" value={user?.role || ''} disabled style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-muted)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="submit" className="btn btn-primary">
                <Save size={18} /> Save Changes
              </button>
              {saved && (
                <span style={{ color: 'var(--color-emerald)', fontSize: 'var(--font-size-sm)', animation: 'fadeIn 0.2s ease' }}>
                  ✓ Saved successfully
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Security */}
        <div className="glass-card" style={{ padding: 32 }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={18} /> Security
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 16 }}>
            To change your password, use the password reset flow from the login page.
          </p>
          <div style={{
            padding: '12px 16px',
            background: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
          }}>
            Last login: {formatDate(new Date())}
          </div>
        </div>
      </div>
    </div>
  );
}
