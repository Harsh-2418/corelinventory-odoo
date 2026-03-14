import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../contexts/InventoryContext';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js';
import {
  Package, AlertTriangle, ShoppingCart, Truck, ArrowLeftRight,
  TrendingUp, TrendingDown, Eye, Activity, BarChart3, Clock,
  ArrowUpRight, Boxes,
} from 'lucide-react';
import { getStockLevel, formatDate, getStatusLabel } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
  const inv = useInventory();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [docFilter, setDocFilter] = useState('all');

  const stats = useMemo(() => {
    const totalProducts = inv.products.length;
    const lowStock = inv.products.filter(p => {
      const stock = inv.getProductStock(p.id);
      return stock > 0 && stock <= (p.reorderPoint || 10);
    }).length;
    const outOfStock = inv.products.filter(p => inv.getProductStock(p.id) === 0).length;
    const pendingReceipts = inv.receipts.filter(r => r.status !== 'done' && r.status !== 'canceled').length;
    const pendingDeliveries = inv.deliveries.filter(d => d.status !== 'done' && d.status !== 'canceled').length;
    const scheduledTransfers = inv.transfers.filter(t => t.status !== 'done' && t.status !== 'canceled').length;
    const totalOps = inv.receipts.length + inv.deliveries.length + inv.transfers.length + inv.adjustments.length;
    return { totalProducts, lowStock, outOfStock, pendingReceipts, pendingDeliveries, scheduledTransfers, totalOps };
  }, [inv]);

  const filteredHistory = useMemo(() => {
    let history = [...inv.moveHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (docFilter !== 'all') {
      history = history.filter(m => m.type === docFilter);
    }
    return history.slice(0, 10);
  }, [inv.moveHistory, docFilter]);

  // Chart data
  const categoryChart = useMemo(() => {
    const catMap = {};
    inv.products.forEach(p => {
      const catName = inv.getCategoryName(p.category);
      const stock = inv.getProductStock(p.id);
      catMap[catName] = (catMap[catName] || 0) + stock;
    });
    return {
      labels: Object.keys(catMap),
      datasets: [{
        data: Object.values(catMap),
        backgroundColor: ['#06b6d4', '#10b981', '#f59e0b', '#0ea5e9', '#f43f5e', '#a855f7'],
        borderWidth: 0,
        hoverOffset: 6,
      }],
    };
  }, [inv]);

  const opsChart = useMemo(() => ({
    labels: ['Receipts', 'Deliveries', 'Transfers', 'Adjustments'],
    datasets: [{
      label: 'Total',
      data: [inv.receipts.length, inv.deliveries.length, inv.transfers.length, inv.adjustments.length],
      backgroundColor: ['#06b6d480', '#10b98180', '#0ea5e980', '#f59e0b80'],
      borderColor: ['#06b6d4', '#10b981', '#0ea5e9', '#f59e0b'],
      borderWidth: 2,
      borderRadius: 6,
    }],
  }), [inv]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-content">
      {/* Welcome Banner */}
      <div style={{
        padding: '28px 32px',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, #0c1a35 0%, #112240 50%, #0d1f3c 100%)',
        border: '1px solid var(--color-border)',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        flexWrap: 'wrap',
        animation: 'fadeInUp 0.4s ease',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-2xl)',
            fontWeight: 700, marginBottom: 6,
          }}>
            {greeting}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>
            Here's what's happening with your inventory today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { label: 'Products', val: stats.totalProducts, icon: Boxes },
            { label: 'Operations', val: stats.totalOps, icon: Activity },
            { label: 'Alerts', val: stats.lowStock + stats.outOfStock, icon: AlertTriangle },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', animation: `cascade-in 0.4s ease ${i * 80}ms both` }}>
              <s.icon size={18} style={{ color: 'var(--color-accent)', marginBottom: 4 }} />
              <div style={{
                fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-xl)',
                fontWeight: 700, color: 'var(--color-text-primary)',
              }}>{s.val}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bento Grid — 3 columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridAutoRows: 'auto',
        gap: 20,
        marginBottom: 24,
      }}>
        {/* Quick Action Cards — Span full first row */}
        {[
          { icon: ShoppingCart, label: 'Receipts', pending: stats.pendingReceipts, color: '#10b981', path: '/receipts', desc: 'pending inbound' },
          { icon: Truck, label: 'Deliveries', pending: stats.pendingDeliveries, color: '#0ea5e9', path: '/deliveries', desc: 'pending outbound' },
          { icon: ArrowLeftRight, label: 'Transfers', pending: stats.scheduledTransfers, color: '#a855f7', path: '/transfers', desc: 'scheduled' },
        ].map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)} style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            cursor: 'pointer',
            transition: 'all var(--transition-normal)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            animation: `cascade-in 0.4s ease ${(i + 3) * 60}ms both`,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = item.color + '40';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 'var(--radius-md)',
                background: item.color + '15',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <item.icon size={20} color={item.color} />
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-heading)', fontWeight: 600,
                  fontSize: 'var(--font-size-base)',
                }}>{item.label}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  {item.pending} {item.desc}
                </div>
              </div>
            </div>
            <ArrowUpRight size={18} style={{ color: 'var(--color-text-muted)' }} />
          </div>
        ))}

        {/* Charts row — stock donut takes 1 col, operations bar takes 2 cols */}
        <div style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          animation: 'cascade-in 0.5s ease 500ms both',
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-sm)', fontWeight: 700,
            fontFamily: 'var(--font-heading)', marginBottom: 16,
            textTransform: 'uppercase', letterSpacing: '0.05em',
            color: 'var(--color-text-secondary)',
          }}>Stock by Category</h3>
          <div style={{ maxWidth: 220, margin: '0 auto' }}>
            <Doughnut data={categoryChart} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { color: '#8b9cc0', padding: 12, usePointStyle: true, pointStyleWidth: 8, font: { size: 11 } },
                },
              },
              cutout: '68%',
            }} />
          </div>
        </div>

        <div style={{
          gridColumn: 'span 2',
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          animation: 'cascade-in 0.5s ease 560ms both',
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-sm)', fontWeight: 700,
            fontFamily: 'var(--font-heading)', marginBottom: 16,
            textTransform: 'uppercase', letterSpacing: '0.05em',
            color: 'var(--color-text-secondary)',
          }}>Operations Overview</h3>
          <Bar data={opsChart} options={{
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { color: '#506080', stepSize: 1 },
                grid: { color: 'rgba(100,140,200,0.06)' },
              },
              x: {
                ticks: { color: '#8b9cc0' },
                grid: { display: false },
              },
            },
          }} />
        </div>
      </div>

      {/* Activity Timeline */}
      <div style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 24,
        animation: 'cascade-in 0.5s ease 620ms both',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20, flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock size={18} style={{ color: 'var(--color-accent)' }} />
            <h3 style={{
              fontSize: 'var(--font-size-md)', fontWeight: 700,
              fontFamily: 'var(--font-heading)',
            }}>Recent Activity</h3>
          </div>
          <div className="filter-bar" style={{ marginBottom: 0 }}>
            {['all', 'receipt', 'delivery', 'transfer', 'adjustment'].map(t => (
              <button
                key={t}
                className={`filter-chip ${docFilter === t ? 'active' : ''}`}
                onClick={() => setDocFilter(t)}
              >
                {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline list instead of table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
              No activity found
            </div>
          ) : (
            filteredHistory.map((m, i) => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                transition: 'background var(--transition-fast)',
                animation: `slide-in-right 0.3s ease ${i * 40}ms both`,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {/* Type indicator dot */}
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: m.type === 'receipt' ? '#10b981' : m.type === 'delivery' ? '#0ea5e9' : m.type === 'transfer' ? '#a855f7' : '#f59e0b',
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      fontWeight: 600, fontSize: 'var(--font-size-sm)',
                    }}>{m.productName}</span>
                    <span className={`badge badge-${m.type === 'receipt' ? 'done' : m.type === 'delivery' ? 'ready' : m.type === 'transfer' ? 'waiting' : 'draft'}`}>
                      {m.type}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 2,
                  }}>
                    {m.reference} · {m.fromLocation || '—'} → {m.toLocation || '—'}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontWeight: 700, fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--font-size-sm)',
                    color: m.quantity > 0 ? '#10b981' : '#f43f5e',
                  }}>{m.quantity > 0 ? '+' : ''}{m.quantity}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {formatDate(m.date)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
