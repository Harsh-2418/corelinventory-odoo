import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInventory } from '../contexts/InventoryContext';
import { ArrowLeft, Edit, Package, MapPin, History } from 'lucide-react';
import { getStockLevel, getStockLevelLabel, formatDate } from '../utils/helpers';

export default function ProductDetail() {
  const { id } = useParams();
  const inv = useInventory();
  const navigate = useNavigate();
  const product = inv.products.find(p => p.id === id);

  const totalStock = inv.getProductStock(id);
  const level = getStockLevel(totalStock, product?.reorderPoint);

  // Stock breakdown by location
  const stockBreakdown = useMemo(() => {
    const locStock = inv.stockByLocation[id] || {};
    return Object.entries(locStock).map(([locId, qty]) => {
      let warehouseName = 'Unknown';
      let locationName = 'Unknown';
      for (const wh of inv.warehouses) {
        const loc = wh.locations.find(l => l.id === locId);
        if (loc) {
          warehouseName = wh.name;
          locationName = loc.name;
          break;
        }
      }
      return { locId, warehouseName, locationName, quantity: qty };
    });
  }, [id, inv]);

  // Move history for this product
  const moveHistory = useMemo(() => {
    return inv.moveHistory
      .filter(m => m.productId === id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [id, inv.moveHistory]);

  if (!product) {
    return (
      <div className="page-content">
        <div className="empty-state" style={{ padding: 80 }}>
          <Package size={48} className="empty-state-icon" />
          <div className="empty-state-title">Product not found</div>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>Back to Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-icon" onClick={() => navigate('/products')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">{product.name}</h1>
            <div className="page-subtitle">
              <code style={{ color: 'var(--color-accent)', background: 'var(--color-accent-light)', padding: '2px 8px', borderRadius: 4 }}>{product.sku}</code>
              {' '} · {inv.getCategoryName(product.category)} · {product.unit}
            </div>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(`/products/${id}/edit`)}>
          <Edit size={16} /> Edit Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="stat-label">Total Stock</div>
          <div className="stat-value">{totalStock}</div>
          <div className="stock-level" style={{ marginTop: 8 }}>
            <span className={`stock-dot ${level}`} />
            <span style={{ fontSize: 'var(--font-size-xs)', color: level === 'in-stock' ? 'var(--color-emerald)' : level === 'low-stock' ? 'var(--color-amber)' : 'var(--color-rose)' }}>
              {getStockLevelLabel(level)}
            </span>
          </div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="stat-label">Reorder Point</div>
          <div className="stat-value">{product.reorderPoint}</div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="stat-label">Reorder Quantity</div>
          <div className="stat-value">{product.reorderQty}</div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="stat-label">Locations</div>
          <div className="stat-value">{stockBreakdown.length}</div>
        </div>
      </div>

      {/* Stock by Location */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MapPin size={18} /> Stock by Location
        </h3>
        {stockBreakdown.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-muted)' }}>No stock at any location</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Warehouse</th>
                <th>Location</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {stockBreakdown.map(s => (
                <tr key={s.locId}>
                  <td style={{ fontWeight: 500 }}>{s.warehouseName}</td>
                  <td>{s.locationName}</td>
                  <td style={{ fontWeight: 600 }}>{s.quantity} {product.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Move History */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={18} /> Movement History
        </h3>
        {moveHistory.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-muted)' }}>No movements recorded</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Reference</th>
                <th>Quantity</th>
                <th>From</th>
                <th>To</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {moveHistory.map(m => (
                <tr key={m.id}>
                  <td><span className={`badge badge-${m.type === 'receipt' ? 'done' : m.type === 'delivery' ? 'ready' : m.type === 'transfer' ? 'waiting' : 'draft'}`}>{m.type}</span></td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 500 }}>{m.reference}</td>
                  <td style={{ fontWeight: 600, color: m.quantity > 0 ? 'var(--color-emerald)' : 'var(--color-rose)' }}>
                    {m.quantity > 0 ? '+' : ''}{m.quantity}
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{m.fromLocation || '—'}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{m.toLocation || '—'}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{formatDate(m.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
