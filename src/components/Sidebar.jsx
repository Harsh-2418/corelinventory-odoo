import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, Truck, ArrowLeftRight,
  ClipboardCheck, History, User, LogOut, ChevronLeft,
  ChevronRight, Boxes, Tag, Warehouse, X, Settings
} from 'lucide-react';

const navSections = [
  {
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { path: '/products', icon: Package, label: 'Products' },
      { path: '/categories', icon: Tag, label: 'Categories' },
      { path: '/warehouses', icon: Warehouse, label: 'Warehouses' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/receipts', icon: ShoppingCart, label: 'Receipts' },
      { path: '/deliveries', icon: Truck, label: 'Deliveries' },
      { path: '/transfers', icon: ArrowLeftRight, label: 'Transfers' },
      { path: '/adjustments', icon: ClipboardCheck, label: 'Adjustments' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { path: '/move-history', icon: History, label: 'Move History' },
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

  const sidebarStyle = isMobile ? {
    position: 'fixed', top: 0, left: 0,
    width: 'var(--sidebar-width)',
    height: '100vh', zIndex: 100,
    transform: mobileOpen ? 'translateX(0)' : 'translateX(-110%)',
    transition: 'transform var(--transition-slow)',
  } : {
    position: 'fixed', top: 0, left: 0,
    width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
    height: '100vh', zIndex: 100,
    transition: 'width var(--transition-slow)',
  };

  return (
    <aside style={sidebarStyle}>
      <div style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        margin: '10px', marginRight: 0,
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
      }}>
        {/* Header area */}
        <div style={{
          padding: collapsed ? '20px 12px' : '20px 20px',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}>
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-secondary-accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Boxes size={16} color="white" />
              </div>
              <span style={{
                fontFamily: 'var(--font-heading)', fontWeight: 700,
                fontSize: 'var(--font-size-lg)',
                color: 'var(--color-text-primary)',
              }}>CoreInventory</span>
            </div>
          ) : (
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--color-accent), var(--color-secondary-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Boxes size={16} color="white" />
            </div>
          )}
          {isMobile && (
            <button onClick={onCloseMobile} className="btn-icon">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Nav sections */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '4px 0' }}>
          {navSections.map((section, si) => (
            <div key={si} style={{ marginBottom: 4 }}>
              {section.label && !collapsed && (
                <div style={{
                  fontSize: '0.65rem', fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  padding: '14px 20px 6px',
                  fontFamily: 'var(--font-heading)',
                }}>
                  {section.label}
                </div>
              )}
              {collapsed && si > 0 && (
                <div style={{
                  height: 1, background: 'var(--color-border)',
                  margin: '8px 12px',
                }} />
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={handleNavClick}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    style={{
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      padding: collapsed ? '11px' : '9px 16px',
                      margin: collapsed ? '2px 8px' : '1px 10px',
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="sidebar-link-icon" />
                    {!collapsed && (
                      <span style={{ fontSize: 'var(--font-size-sm)' }}>{item.label}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div style={{
          padding: collapsed ? '12px 8px' : '14px 14px',
          borderTop: '1px solid var(--color-border)',
        }}>
          {!collapsed ? (
            <>
              {/* User card */}
              <div
                onClick={() => { navigate('/profile'); handleNavClick(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 10px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                  marginBottom: 8,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700, color: 'var(--color-accent)',
                  flexShrink: 0, border: '1px solid var(--color-border)',
                }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: 'var(--font-size-sm)', fontWeight: 600,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {user?.name || 'User'}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                    {user?.role || 'Member'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={onToggle} className="btn btn-ghost"
                  style={{ flex: 1, fontSize: 'var(--font-size-xs)', justifyContent: 'center', padding: '7px 10px' }}>
                  <ChevronLeft size={14} /> Collapse
                </button>
                <button onClick={handleLogout} className="btn btn-ghost"
                  style={{ color: 'var(--color-rose)', padding: '7px 10px' }}>
                  <LogOut size={14} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <button onClick={onToggle} className="btn-icon" title="Expand">
                <ChevronRight size={16} />
              </button>
              <button onClick={handleLogout} className="btn-icon" title="Logout" style={{ color: 'var(--color-rose)' }}>
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
