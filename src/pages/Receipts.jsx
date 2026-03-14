import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../contexts/InventoryContext';
import { Plus, ShoppingCart, CheckCircle, XCircle } from 'lucide-react';
import { formatDate, getStatusLabel } from '../utils/helpers';

export default function Receipts() {
  const inv = useInventory();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    let items = [...inv.receipts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (statusFilter !== 'all') items = items.filter(r => r.status === statusFilter);
    return items;
  }, [inv.receipts, statusFilter]);

  function handleValidate(e, id) {
    e.stopPropagation();
    if (confirm('Validate this receipt? Stock will be updated automatically.')) {
      inv.dispatch({ type: 'VALIDATE_RECEIPT', payload: id });
    }
  }

  function handleCancel(e, id) {
    e.stopPropagation();
    if (confirm('Cancel this receipt? This action cannot be undone.')) {
      inv.dispatch({ type: 'CANCEL_RECEIPT', payload: id });
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Receipts</h1>
          <div className="page-subtitle">Incoming goods from suppliers</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/receipts/new')}>
          <Plus size={18} /> New Receipt
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
          <ShoppingCart size={48} className="empty-state-icon" />
          <div className="empty-state-title">No receipts found</div>
          <div className="empty-state-desc">Create a receipt when goods arrive from a supplier</div>
          <button className="btn btn-primary" onClick={() => navigate('/receipts/new')}><Plus size={18} /> New Receipt</button>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Supplier</th>
                <th>Warehouse</th>
                <th>Items</th>
                <th>Status</th>
                <th>Created</th>
                <th>Validated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/receipts/${r.id}`)}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.reference}</td>
                  <td>{r.supplier}</td>
                  <td>{inv.getWarehouseName(r.warehouseId)}</td>
                  <td>{r.items.length} item{r.items.length !== 1 ? 's' : ''}</td>
                  <td><span className={`badge badge-${r.status}`}>{getStatusLabel(r.status)}</span></td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{formatDate(r.createdAt)}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{r.validatedAt ? formatDate(r.validatedAt) : '—'}</td>
                  <td>
                    {r.status !== 'done' && r.status !== 'canceled' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-success btn-sm" onClick={(e) => handleValidate(e, r.id)}>
                          <CheckCircle size={14} /> Validate
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={(e) => handleCancel(e, r.id)}>
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
