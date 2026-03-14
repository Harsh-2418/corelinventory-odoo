import React, { useState } from 'react';
import { useInventory } from '../contexts/InventoryContext';
import { Plus, Edit2, Trash2, Tag, X, Save } from 'lucide-react';
import { generateId } from '../utils/helpers';

export default function Categories() {
  const inv = useInventory();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  function openAdd() {
    setEditId(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  }

  function openEdit(cat) {
    setEditId(cat.id);
    setForm({ name: cat.name, description: cat.description || '' });
    setShowModal(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editId) {
      inv.dispatch({ type: 'UPDATE_CATEGORY', payload: { id: editId, ...form } });
    } else {
      inv.dispatch({ type: 'ADD_CATEGORY', payload: { id: generateId(), ...form, productCount: 0 } });
    }
    setShowModal(false);
  }

  function handleDelete(id) {
    const hasProducts = inv.products.some(p => p.category === id);
    if (hasProducts) {
      alert('Cannot delete category with associated products.');
      return;
    }
    if (confirm('Delete this category?')) {
      inv.dispatch({ type: 'DELETE_CATEGORY', payload: id });
    }
  }

  function getProductCount(catId) {
    return inv.products.filter(p => p.category === catId).length;
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <div className="page-subtitle">Organize your products into categories</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="grid-3">
        {inv.categories.map(cat => {
          const count = getProductCount(cat.id);
          return (
            <div key={cat.id} className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-accent-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Tag size={20} color="var(--color-accent)" />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-icon" onClick={() => openEdit(cat)}>
                    <Edit2 size={14} />
                  </button>
                  <button className="btn-icon" onClick={() => handleDelete(cat.id)} style={{ color: 'var(--color-rose)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 4 }}>{cat.name}</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 12 }}>{cat.description || 'No description'}</p>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                <strong>{count}</strong> product{count !== 1 ? 's' : ''}
              </div>
            </div>
          );
        })}
      </div>

      {inv.categories.length === 0 && (
        <div className="empty-state glass-card" style={{ padding: 60 }}>
          <Tag size={48} className="empty-state-icon" />
          <div className="empty-state-title">No categories yet</div>
          <div className="empty-state-desc">Create categories to organize your products</div>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Add Category</button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Edit Category' : 'New Category'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Raw Materials"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Brief description..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="modal-footer" style={{ marginTop: 0 }}>
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
