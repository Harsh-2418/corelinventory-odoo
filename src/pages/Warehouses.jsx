import React, { useState } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { Plus, Edit2, Trash2, Warehouse as WarehouseIcon, MapPin, X, Save } from 'lucide-react';
import { generateId } from '../utils/helpers';

export default function Warehouses() {
  const inv = useInventory();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', locations: [] });
  const [newLocationName, setNewLocationName] = useState('');

  function openAdd() {
    setEditId(null);
    setForm({ name: '', address: '', locations: [] });
    setShowModal(true);
  }

  function openEdit(wh) {
    setEditId(wh.id);
    setForm({ name: wh.name, address: wh.address || '', locations: [...wh.locations] });
    setShowModal(true);
  }

  function addLocation() {
    if (!newLocationName.trim()) return;
    setForm({ ...form, locations: [...form.locations, { id: generateId(), name: newLocationName.trim() }] });
    setNewLocationName('');
  }

  function removeLocation(locId) {
    setForm({ ...form, locations: form.locations.filter(l => l.id !== locId) });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editId) {
      inv.dispatch({ type: 'UPDATE_WAREHOUSE', payload: { id: editId, ...form } });
    } else {
      inv.dispatch({ type: 'ADD_WAREHOUSE', payload: { id: generateId(), ...form } });
    }
    setShowModal(false);
  }

  function handleDelete(id) {
    // Check if any operations reference this warehouse
    if (confirm('Delete this warehouse? This cannot be undone.')) {
      inv.dispatch({ type: 'DELETE_WAREHOUSE', payload: id });
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Warehouses</h1>
          <div className="page-subtitle">Manage warehouses and storage locations</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={18} /> Add Warehouse
        </button>
      </div>

      <div className="grid-3">
        {inv.warehouses.map(wh => (
          <div key={wh.id} className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-violet-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <WarehouseIcon size={22} color="var(--color-violet)" />
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn-icon" onClick={() => openEdit(wh)}><Edit2 size={14} /></button>
                <button className="btn-icon" onClick={() => handleDelete(wh.id)} style={{ color: 'var(--color-rose)' }}><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 4 }}>{wh.name}</h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 16 }}>{wh.address || 'No address'}</p>
            
            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Locations ({wh.locations.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {wh.locations.map(loc => (
                <span key={loc.id} className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={10} /> {loc.name}
                </span>
              ))}
              {wh.locations.length === 0 && (
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>No locations defined</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {inv.warehouses.length === 0 && (
        <div className="empty-state glass-card" style={{ padding: 60 }}>
          <WarehouseIcon size={48} className="empty-state-icon" />
          <div className="empty-state-title">No warehouses yet</div>
          <div className="empty-state-desc">Create a warehouse to start managing inventory locations</div>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Add Warehouse</button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ minWidth: 480 }}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Edit Warehouse' : 'New Warehouse'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Warehouse Name *</label>
                <input type="text" className="form-input" placeholder="e.g. Main Warehouse" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Address</label>
                <input type="text" className="form-input" placeholder="e.g. 123 Industrial Ave" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Locations</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {form.locations.map(loc => (
                    <span key={loc.id} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 12px',
                      background: 'var(--color-bg-tertiary)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--font-size-sm)',
                    }}>
                      {loc.name}
                      <button type="button" onClick={() => removeLocation(loc.id)} style={{ background: 'transparent', color: 'var(--color-text-muted)', padding: 0, lineHeight: 1 }}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="New location name..."
                    value={newLocationName}
                    onChange={e => setNewLocationName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLocation(); } }}
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addLocation}>
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> {editId ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
