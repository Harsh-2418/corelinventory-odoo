import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../contexts/InventoryContext';
import { Plus, Truck, CheckCircle, XCircle } from 'lucide-react';
import { formatDate, getStatusLabel } from '../utils/helpers';

export default function Deliveries() {
  const inv = useInventory();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    let items = [...inv.deliveries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (statusFilter !== 'all') items = items.filter(d => d.status === statusFilter);
    return items;
  }, [inv.deliveries, statusFilter]);

  function handleValidate(e, id) {
    e.stopPropagation();
    if (confirm('Validate this delivery? Stock will be decreased automatically.')) {
      inv.dispatch({ type: 'VALIDATE_DELIVERY', payload: id });
    }
  }

  function handleCancel(e, id) {
    e.stopPropagation();
    if (confirm('Cancel this delivery? This action cannot be undone.')) {
      inv.dispatch({ type: 'CANCEL_DELIVERY', payload: id });
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Delivery Orders</h1>
          <div className="page-subtitle">Outgoing stock for customer shipments</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/deliveries/new')}>
          <Plus size={18} /> New Delivery
        </button>
      </div>

      <div className="filter-bar">
        {['all', 'draft', 'waiting', 'ready', 'done', 'canceled'].map(s => (
          <button key={s} className={`filter-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
            {s === 'all' ? 'All' : getStatusLabel(s)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state glass-card" style={{ padding: 60 }}>
          <Truck size={48} className="empty-state-icon" />
          <div className="empty-state-title">No delivery orders found</div>
          <div className="empty-state-desc">Create a delivery when stock needs to be shipped</div>
          <button className="btn btn-primary" onClick={() => navigate('/deliveries/new')}><Plus size={18} /> New Delivery</button>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Warehouse</th>
                <th>Items</th>
                <th>Status</th>
                <th>Created</th>
                <th>Validated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/deliveries/${d.id}`)}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{d.reference}</td>
                  <td>{d.customer}</td>
                  <td>{inv.getWarehouseName(d.warehouseId)}</td>
                  <td>{d.items.length} item{d.items.length !== 1 ? 's' : ''}</td>
                  <td><span className={`badge badge-${d.status}`}>{getStatusLabel(d.status)}</span></td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{formatDate(d.createdAt)}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{d.validatedAt ? formatDate(d.validatedAt) : '—'}</td>
                  <td>
                    {d.status !== 'done' && d.status !== 'canceled' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-success btn-sm" onClick={(e) => handleValidate(e, d.id)}>
                          <CheckCircle size={14} /> Validate
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={(e) => handleCancel(e, d.id)}>
                          <XCircle size={14} /> Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
