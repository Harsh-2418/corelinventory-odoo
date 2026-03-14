import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../contexts/InventoryContext';
import { Plus, ClipboardCheck, CheckCircle, XCircle } from 'lucide-react';
import { formatDate, getStatusLabel } from '../utils/helpers';

export default function Adjustments() {
  const inv = useInventory();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    let items = [...inv.adjustments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (statusFilter !== 'all') items = items.filter(a => a.status === statusFilter);
    return items;
  }, [inv.adjustments, statusFilter]);

  function handleValidate(e, id) {
    e.stopPropagation();
    if (confirm('Validate this adjustment? Stock will be corrected.')) {
      inv.dispatch({ type: 'VALIDATE_ADJUSTMENT', payload: id });
    }
  }

  function handleCancel(e, id) {
    e.stopPropagation();
    if (confirm('Cancel this adjustment? This action cannot be undone.')) {
      inv.dispatch({ type: 'CANCEL_ADJUSTMENT', payload: id });
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Adjustments</h1>
          <div className="page-subtitle">Correct stock mismatches from physical counts</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/adjustments/new')}>
          <Plus size={18} /> New Adjustment
        </button>
      </div>

      <div className="filter-bar">
        {['all', 'draft', 'done'].map(s => (
          <button key={s} className={`filter-chip ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
            {s === 'all' ? 'All' : getStatusLabel(s)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state glass-card" style={{ padding: 60 }}>
          <ClipboardCheck size={48} className="empty-state-icon" />
          <div className="empty-state-title">No adjustments found</div>
          <div className="empty-state-desc">Create an adjustment to correct stock discrepancies</div>
          <button className="btn btn-primary" onClick={() => navigate('/adjustments/new')}><Plus size={18} /> New Adjustment</button>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Reason</th>
                <th>Warehouse</th>
                <th>Items</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/adjustments/${a.id}`)}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{a.reference}</td>
                  <td>{a.reason || '—'}</td>
                  <td>{inv.getWarehouseName(a.warehouseId)}</td>
                  <td>{a.items.length} item{a.items.length !== 1 ? 's' : ''}</td>
                  <td><span className={`badge badge-${a.status}`}>{getStatusLabel(a.status)}</span></td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{formatDate(a.createdAt)}</td>
                  <td>
                    {a.status !== 'done' && a.status !== 'canceled' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-success btn-sm" onClick={(e) => handleValidate(e, a.id)}>
                          <CheckCircle size={14} /> Validate
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={(e) => handleCancel(e, a.id)}>
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
