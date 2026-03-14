import React, { useState, useMemo } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { History, Search, Filter } from 'lucide-react';
import { formatDateTime, getOperationLabel, searchFilter } from '../utils/helpers';

export default function MoveHistory() {
  const inv = useInventory();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    let items = [...inv.moveHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (search) items = searchFilter(items, search, ['productName', 'reference']);
    if (typeFilter !== 'all') items = items.filter(m => m.type === typeFilter);
    if (dateFrom) items = items.filter(m => new Date(m.date) >= new Date(dateFrom));
    if (dateTo) items = items.filter(m => new Date(m.date) <= new Date(dateTo + 'T23:59:59'));
    return items;
  }, [inv.moveHistory, search, typeFilter, dateFrom, dateTo]);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Move History</h1>
          <div className="page-subtitle">Complete stock ledger — every movement logged</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by product or reference..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ minWidth: 150 }}>
          <option value="all">All Types</option>
          <option value="receipt">Receipts</option>
          <option value="delivery">Deliveries</option>
          <option value="transfer">Transfers</option>
          <option value="adjustment">Adjustments</option>
        </select>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ marginBottom: 4 }}>From</label>
          <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ marginBottom: 4 }}>To</label>
          <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
      </div>

      {/* Results count */}
      <div style={{ marginBottom: 12, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
        {filtered.length} movement{filtered.length !== 1 ? 's' : ''} found
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state glass-card" style={{ padding: 60 }}>
          <History size={48} className="empty-state-icon" />
          <div className="empty-state-title">No movements found</div>
          <div className="empty-state-desc">Stock movements will appear here as you process operations</div>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>From Location</th>
                <th>To Location</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{formatDateTime(m.date)}</td>
                  <td>
                    <span className={`badge badge-${m.type === 'receipt' ? 'done' : m.type === 'delivery' ? 'ready' : m.type === 'transfer' ? 'waiting' : 'draft'}`}>
                      {getOperationLabel(m.type)}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 500 }}>{m.reference}</td>
                  <td style={{ fontWeight: 500 }}>{m.productName}</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: m.quantity > 0 ? 'var(--color-emerald-light)' : 'var(--color-rose-light)',
                      color: m.quantity > 0 ? 'var(--color-emerald)' : 'var(--color-rose)',
                      fontSize: 'var(--font-size-sm)',
                    }}>
                      {m.quantity > 0 ? '+' : ''}{m.quantity}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{m.fromLocation || '—'}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{m.toLocation || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
