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
  TrendingUp, TrendingDown, Eye,
} from 'lucide-react';
import { getStockLevel, formatDate, getStatusLabel } from '../utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function KPICard({ icon: Icon, label, value, color, lightColor, trend, onClick }) {
  return (
    <div className="glass-card" onClick={onClick} style={{
      padding: '20px 24px',
      cursor: onClick ? 'pointer' : 'default',
      animation: 'fadeInUp 0.4s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            marginBottom: 8,
            fontWeight: 500,
          }}>{label}</div>
          <div className="stat-value" style={{ color }}>{value}</div>
        </div>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-md)',
          background: lightColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={22} color={color} />
        </div>
      </div>
      {trend !== undefined && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: 12,
          fontSize: 'var(--font-size-xs)',
          color: trend >= 0 ? 'var(--color-emerald)' : 'var(--color-rose)',
        }}>
          {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(trend)}% from last period
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const inv = useInventory();
  const navigate = useNavigate();
  const [docFilter, setDocFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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
    return { totalProducts, lowStock, outOfStock, pendingReceipts, pendingDeliveries, scheduledTransfers };
  }, [inv]);

  // Filtered history for activity table
  const filteredHistory = useMemo(() => {
    let history = [...inv.moveHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (docFilter !== 'all') {
      history = history.filter(m => m.type === docFilter);
    }
    return history.slice(0, 15);
  }, [inv.moveHistory, docFilter]);

  // Chart: stock by category
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
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#f43f5e', '#8b5cf6'],
        borderWidth: 0,
        hoverOffset: 8,
      }],
    };
  }, [inv]);

  // Chart: operations count
  const opsChart = useMemo(() => ({
    labels: ['Receipts', 'Deliveries', 'Transfers', 'Adjustments'],
    datasets: [{
      label: 'Total',
      data: [inv.receipts.length, inv.deliveries.length, inv.transfers.length, inv.adjustments.length],
      backgroundColor: ['#6366f180', '#10b98180', '#0ea5e980', '#f59e0b80'],
      borderColor: ['#6366f1', '#10b981', '#0ea5e9', '#f59e0b'],
      borderWidth: 2,
      borderRadius: 8,
    }],
  }), [inv]);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <div className="page-subtitle">Overview of your inventory operations</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-5" style={{ marginBottom: 28 }}>
        <KPICard icon={Package} label="Total Products" value={stats.totalProducts}
          color="var(--color-accent)" lightColor="var(--color-accent-light)" trend={12}
          onClick={() => navigate('/products')} />
        <KPICard icon={AlertTriangle} label="Low / Out of Stock" value={`${stats.lowStock + stats.outOfStock}`}
          color="var(--color-amber)" lightColor="var(--color-amber-light)"
          onClick={() => navigate('/products')} />
        <KPICard icon={ShoppingCart} label="Pending Receipts" value={stats.pendingReceipts}
          color="var(--color-emerald)" lightColor="var(--color-emerald-light)"
          onClick={() => navigate('/receipts')} />
        <KPICard icon={Truck} label="Pending Deliveries" value={stats.pendingDeliveries}
          color="var(--color-sky)" lightColor="var(--color-sky-light)"
          onClick={() => navigate('/deliveries')} />
        <KPICard icon={ArrowLeftRight} label="Transfers Scheduled" value={stats.scheduledTransfers}
          color="var(--color-violet)" lightColor="var(--color-violet-light)"
          onClick={() => navigate('/transfers')} />
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 20 }}>Stock by Category</h3>
          <div style={{ maxWidth: 280, margin: '0 auto' }}>
            <Doughnut data={categoryChart} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { color: '#94a3b8', padding: 16, usePointStyle: true, pointStyleWidth: 8 },
                },
              },
              cutout: '65%',
            }} />
          </div>
        </div>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 20 }}>Operations Overview</h3>
          <Bar data={opsChart} options={{
            responsive: true,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { color: '#64748b', stepSize: 1 },
                grid: { color: 'rgba(148, 163, 184, 0.08)' },
              },
              x: {
                ticks: { color: '#94a3b8' },
                grid: { display: false },
              },
            },
          }} />
        </div>
      </div>

      {/* Filters + Recent Activity */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600 }}>Recent Activity</h3>
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

        <div style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Reference</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>From</th>
                <th>To</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                    No activity found
                  </td>
                </tr>
              ) : (
                filteredHistory.map(m => (
                  <tr key={m.id}>
                    <td>
                      <span className={`badge badge-${m.type === 'receipt' ? 'done' : m.type === 'delivery' ? 'ready' : m.type === 'transfer' ? 'waiting' : 'draft'}`}>
                        {m.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, fontFamily: 'monospace' }}>{m.reference}</td>
                    <td>{m.productName}</td>
                    <td style={{ fontWeight: 600, color: m.quantity > 0 ? 'var(--color-emerald)' : 'var(--color-rose)' }}>
                      {m.quantity > 0 ? '+' : ''}{m.quantity}
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{m.fromLocation || '—'}</td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{m.toLocation || '—'}</td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{formatDate(m.date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
