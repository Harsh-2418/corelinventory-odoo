import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, Truck, ArrowLeftRight,
  ClipboardCheck, History, Settings, User, LogOut, ChevronLeft,
  ChevronRight, Boxes, Tag, Warehouse, X
} from 'lucide-react';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'Products',
    items: [
      { path: '/products', icon: Package, label: 'All Products' },
      { path: '/categories', icon: Tag, label: 'Categories' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/receipts', icon: ShoppingCart, label: 'Receipts' },
      { path: '/deliveries', icon: Truck, label: 'Delivery Orders' },
      { path: '/transfers', icon: ArrowLeftRight, label: 'Internal Transfers' },
      { path: '/adjustments', icon: ClipboardCheck, label: 'Adjustments' },
      { path: '/move-history', icon: History, label: 'Move History' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { path: '/warehouses', icon: Warehouse, label: 'Warehouses' },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle, isMobile, mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
    if (isMobile) onCloseMobile?.();
  }

  function handleNavClick() {
    if (isMobile) onCloseMobile?.();
  }

  // On mobile: slide in/out as overlay
  const sidebarStyle = isMobile ? {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: 'var(--sidebar-width)',
    background: 'var(--color-bg-secondary)',
    borderRight: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    overflow: 'hidden',
    transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform var(--transition-slow)',
  } : {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
    background: 'var(--color-bg-secondary)',
    borderRight: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width var(--transition-slow)',
    zIndex: 100,
    overflow: 'hidden',
  };

  const showLabels = isMobile ? true : !collapsed;

  return (
    <aside style={sidebarStyle}>
      {/* Logo */}
      <div style={{
        padding: showLabels ? '20px 24px' : '20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid var(--color-border)',
        minHeight: 'var(--header-height)',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Boxes size={20} color="white" />
          </div>
          {showLabels && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', letterSpacing: '-0.02em' }}>CoreInventory</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Inventory System</div>
            </div>
          )}
        </div>
        {isMobile && (
          <button onClick={onCloseMobile} className="btn-icon">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflow: 'auto', padding: '12px 0' }}>
        {navGroups.map(group => (
          <div key={group.label} style={{ marginBottom: '8px' }}>
            {showLabels && (
              <div style={{
                padding: '8px 24px 4px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                {group.label}
              </div>
            )}
            {group.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={handleNavClick}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: showLabels ? '10px 24px' : '10px 0',
                  justifyContent: showLabels ? 'flex-start' : 'center',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  background: isActive ? 'var(--color-accent-light)' : 'transparent',
                  borderRight: isActive ? '3px solid var(--color-accent)' : '3px solid transparent',
                  textDecoration: 'none',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: isActive ? 500 : 400,
                  transition: 'all var(--transition-fast)',
                })}
              >
                <item.icon size={18} />
                {showLabels && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      {!isMobile && (
        <button
          onClick={onToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-end',
            padding: '12px 20px',
            background: 'transparent',
            color: 'var(--color-text-muted)',
            borderTop: '1px solid var(--color-border)',
            transition: 'color var(--transition-fast)',
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      )}

      {/* Profile */}
      <div style={{
        padding: showLabels ? '16px 20px' : '16px 8px',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <NavLink
          to="/profile"
          onClick={handleNavClick}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0 }}
        >
          <div style={{
            width: 36, height: 36,
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, var(--color-emerald), #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'white',
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {showLabels && (
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.role || 'Staff'}</div>
            </div>
          )}
        </NavLink>
        {showLabels && (
          <button onClick={handleLogout} className="btn-icon" title="Logout">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
