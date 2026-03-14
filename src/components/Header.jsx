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
    <header style={{
      height: 'var(--header-height)',
      padding: isMobile ? '0 12px' : '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--color-bg-secondary)',
      borderBottom: '1px solid var(--color-border)',
      gap: isMobile ? '8px' : '16px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Left: menu toggle + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px', flex: 1 }}>
        {isMobile && (
          <button onClick={onToggleSidebar} className="btn-icon">
            <Menu size={20} />
          </button>
        )}
        <form onSubmit={handleSearch} className="search-box" style={{ maxWidth: isMobile ? '100%' : 400, flex: 1 }}>
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
            <Bell size={20} />
            {alertCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'var(--color-rose)',
                color: 'white',
                fontSize: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'scaleIn 0.2s ease',
              }}>
                {alertCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div style={{
              position: isMobile ? 'fixed' : 'absolute',
              top: isMobile ? 'var(--header-height)' : '100%',
              right: isMobile ? '8px' : 0,
              left: isMobile ? '8px' : 'auto',
              marginTop: isMobile ? 0 : 8,
              width: isMobile ? 'auto' : 340,
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              animation: 'scaleIn 0.15s ease',
              zIndex: 200,
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 600, fontSize: 'var(--font-size-base)' }}>
                Alerts ({alertCount})
              </div>
              <div style={{ maxHeight: 300, overflow: 'auto' }}>
                {lowStockProducts.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                    No alerts
                  </div>
                ) : (
                  lowStockProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => { navigate(`/products/${p.id}`); setShowNotifications(false); }}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-amber-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <AlertTriangle size={16} color="var(--color-amber)" />
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Low Stock: {p.name}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          SKU: {p.sku} — Reorder at {p.reorderPoint}
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
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-emerald), #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 600,
              color: 'white',
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!isMobile && <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{user?.name?.split(' ')[0] || 'User'}</span>}
          </button>
          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 8,
              width: 200,
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              animation: 'scaleIn 0.15s ease',
              zIndex: 200,
            }}>
              <button
                onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-sm)',
                  textAlign: 'left',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <User size={16} /> My Profile
              </button>
              <div style={{ height: 1, background: 'var(--color-border)' }} />
              <button
                onClick={() => { logout(); navigate('/login'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  color: 'var(--color-rose)',
                  fontSize: 'var(--font-size-sm)',
                  textAlign: 'left',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
