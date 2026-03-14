import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../contexts/InventoryContext';
import { Plus, ArrowLeftRight, CheckCircle } from 'lucide-react';
import { formatDate, getStatusLabel } from '../utils/helpers';

export default function Transfers() {
  const inv = useInventory();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    let items = [...inv.transfers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (statusFilter !== 'all') items = items.filter(t => t.status === statusFilter);
    return items;
  }, [inv.transfers, statusFilter]);

  function handleValidate(e, id) {
    e.stopPropagation();
    if (confirm('Validate this transfer? Stock will be moved between locations.')) {
      inv.dispatch({ type: 'VALIDATE_TRANSFER', payload: id });
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Internal Transfers</h1>
          <div className="page-subtitle">Move stock between warehouses and locations</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/transfers/new')}>
          <Plus size={18} /> New Transfer
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
          <ArrowLeftRight size={48} className="empty-state-icon" />
          <div className="empty-state-title">No transfers found</div>
          <div className="empty-state-desc">Create a transfer to move stock between locations</div>
          <button className="btn btn-primary" onClick={() => navigate('/transfers/new')}><Plus size={18} /> New Transfer</button>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>From</th>
                <th>To</th>
                <th>Items</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/transfers/${t.id}`)}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{t.reference}</td>
                  <td>{inv.getWarehouseName(t.sourceWarehouseId)}</td>
                  <td>{inv.getWarehouseName(t.destWarehouseId)}</td>
                  <td>{t.items.length} item{t.items.length !== 1 ? 's' : ''}</td>
                  <td><span className={`badge badge-${t.status}`}>{getStatusLabel(t.status)}</span></td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>{formatDate(t.createdAt)}</td>
                  <td>
                    {t.status !== 'done' && t.status !== 'canceled' && (
                      <button className="btn btn-success btn-sm" onClick={(e) => handleValidate(e, t.id)}>
                        <CheckCircle size={14} /> Validate
                      </button>
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
