import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInventory } from '../contexts/InventoryContext';
import { ArrowLeft, Save } from 'lucide-react';
import { generateId, generateSKU } from '../utils/helpers';

export default function ProductForm() {
  const { id } = useParams();
  const inv = useInventory();
  const navigate = useNavigate();
  const isEdit = !!id;
  const existing = isEdit ? inv.products.find(p => p.id === id) : null;

  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: inv.categories[0]?.id || '',
    unit: 'pcs',
    reorderPoint: 10,
    reorderQty: 50,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        sku: existing.sku,
        category: existing.category,
        unit: existing.unit,
        reorderPoint: existing.reorderPoint,
        reorderQty: existing.reorderQty,
      });
    }
  }, [existing]);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.sku || !form.category) {
      setError('Please fill in all required fields');
      return;
    }
    // Check for duplicate SKU
    const dupSku = inv.products.find(p => p.sku === form.sku && p.id !== id);
    if (dupSku) {
      setError('SKU already exists');
      return;
    }

    if (isEdit) {
      inv.dispatch({ type: 'UPDATE_PRODUCT', payload: { id, ...form } });
    } else {
      inv.dispatch({ type: 'ADD_PRODUCT', payload: { id: generateId(), ...form, createdAt: new Date().toISOString() } });
    }
    navigate('/products');
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-icon" onClick={() => navigate('/products')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Product' : 'New Product'}</h1>
            <div className="page-subtitle">{isEdit ? `Editing ${existing?.name}` : 'Create a new product in your inventory'}</div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ maxWidth: 700, padding: 32 }}>
        {error && (
          <div style={{
            padding: '10px 14px',
            background: 'var(--color-rose-light)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-rose)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Steel Rods"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">SKU / Code *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. RAW-0001"
                value={form.sku}
                onChange={e => setForm({ ...form, sku: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                {inv.categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <select className="form-select" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="liters">Liters</option>
                <option value="meters">Meters</option>
                <option value="boxes">Boxes</option>
              </select>
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 32 }}>
            <div className="form-group">
              <label className="form-label">Reorder Point</label>
              <input
                type="number"
                className="form-input"
                value={form.reorderPoint}
                onChange={e => setForm({ ...form, reorderPoint: parseInt(e.target.value) || 0 })}
                min={0}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reorder Quantity</label>
              <input
                type="number"
                className="form-input"
                value={form.reorderQty}
                onChange={e => setForm({ ...form, reorderQty: parseInt(e.target.value) || 0 })}
                min={0}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary">
              <Save size={18} /> {isEdit ? 'Save Changes' : 'Create Product'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
