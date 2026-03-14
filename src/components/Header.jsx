import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useInventory } from '../contexts/InventoryContext';
import { Search, Bell, Menu, User, LogOut, AlertTriangle } from 'lucide-react';

export default function Header({ sidebarCollapsed, onToggleSidebar, isMobile }) {
  const { user, logout } = useAuth();
  const { getLowStockProducts } = useInventory();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const lowStockProducts = getLowStockProducts();
  const alertCount = lowStockProducts.length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  }

  return (
    <header className="header-bar" style={{
      padding: isMobile ? '0 12px' : undefined,
      gap: isMobile ? '8px' : undefined,
    }}>
      {/* Left: menu toggle + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px', flex: 1 }}>
        {isMobile && (
          <button onClick={onToggleSidebar} className="btn-icon">
            <Menu size={20} />
          </button>
        )}
        <form onSubmit={handleSearch} className="search-box" style={{ maxWidth: isMobile ? '100%' : 420, flex: 1 }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder={isMobile ? "Search..." : "Search products by name or SKU..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ width: '100%' }}
          />
        </form>
      </div>

      {/* Right: notifications + profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Notification Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className="btn-icon"
            style={{ position: 'relative' }}
          >
            <Bell size={20} className={alertCount > 0 ? 'bell-alert' : ''} />
            {alertCount > 0 && (
              <span style={{
                position: 'absolute', top: 3, right: 3,
                width: 16, height: 16, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-rose), #e11d48)',
                color: 'white', fontSize: '9px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'scaleIn 0.2s ease',
                boxShadow: '0 0 8px rgba(244, 63, 94, 0.4)',
              }}>
                {alertCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="dropdown-panel" style={{
              position: isMobile ? 'fixed' : 'absolute',
              top: isMobile ? 'var(--header-height)' : '100%',
              right: isMobile ? '8px' : 0,
              left: isMobile ? '8px' : 'auto',
              marginTop: isMobile ? 0 : 8,
              width: isMobile ? 'auto' : 360,
              zIndex: 200,
              maxHeight: '70vh',
            }}>
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--color-border)',
                fontWeight: 600, fontFamily: 'var(--font-heading)',
                fontSize: 'var(--font-size-base)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <AlertTriangle size={16} color="var(--color-amber)" />
                Alerts ({alertCount})
              </div>
              <div style={{ maxHeight: 300, overflow: 'auto' }}>
                {lowStockProducts.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                    No alerts — all systems go ✓
                  </div>
                ) : (
                  lowStockProducts.map((p, i) => (
                    <div
                      key={p.id}
                      onClick={() => { navigate(`/products/${p.id}`); setShowNotifications(false); }}
                      style={{
                        padding: '12px 18px',
                        display: 'flex', alignItems: 'center', gap: '12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'all var(--transition-fast)',
                        animation: `cascade-in 0.3s ease ${i * 50}ms both`,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(6, 182, 212, 0.06)';
                        e.currentTarget.style.paddingLeft = '22px';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.paddingLeft = '18px';
                      }}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: 'var(--radius-md)',
                        background: 'var(--color-amber-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <AlertTriangle size={16} color="var(--color-amber)" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          Low stock — SKU: {p.sku}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div ref={userRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '6px 14px 6px 6px',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-border-glow)';
              e.currentTarget.style.boxShadow = '0 0 15px var(--color-accent-glow)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-secondary-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: 'white',
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!isMobile && <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{user?.name?.split(' ')[0] || 'User'}</span>}
          </button>
          {showUserMenu && (
            <div className="dropdown-panel" style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 8,
              width: 210, zIndex: 200,
            }}>
              <button
                onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                  padding: '12px 18px', background: 'transparent',
                  color: 'var(--color-text-primary)', fontSize: 'var(--font-size-sm)',
                  textAlign: 'left', transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(6, 182, 212, 0.06)';
                  e.currentTarget.style.paddingLeft = '22px';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.paddingLeft = '18px';
                }}
              >
                <User size={16} /> My Profile
              </button>
              <div style={{ height: 1, background: 'var(--color-border)' }} />
              <button
                onClick={() => { logout(); navigate('/login'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                  padding: '12px 18px', background: 'transparent',
                  color: 'var(--color-rose)', fontSize: 'var(--font-size-sm)',
                  textAlign: 'left', transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--color-rose-light)';
                  e.currentTarget.style.paddingLeft = '22px';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.paddingLeft = '18px';
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
