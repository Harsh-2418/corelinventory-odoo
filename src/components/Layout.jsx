import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(false);
      }
      if (!mobile) {
        setMobileOpen(false);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function toggleSidebar() {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  }

  function closeMobileSidebar() {
    setMobileOpen(false);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Mobile overlay backdrop */}
      {isMobile && mobileOpen && (
        <div
          onClick={closeMobileSidebar}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 99,
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      <Sidebar
        collapsed={isMobile ? false : sidebarCollapsed}
        onToggle={toggleSidebar}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobileSidebar}
      />

      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : (sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)'),
        transition: 'margin-left var(--transition-slow)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: isMobile ? '100%' : 'auto',
      }}>
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />
        <main style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
