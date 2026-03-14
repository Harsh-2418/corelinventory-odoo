import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInventory } from '../contexts/InventoryContext';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { generateId } from '../utils/helpers';

export default function ReceiptForm() {
  const { id } = useParams();
  const inv = useInventory();
  const navigate = useNavigate();
  const existing = id ? inv.receipts.find(r => r.id === id) : null;
  const isView = existing?.status === 'done';

  const [form, setForm] = useState({
    supplier: '',
    warehouseId: inv.warehouses[0]?.id || '',
    locationId: '',
    items: [{ productId: '', quantity: '' }],
  });

  useEffect(() => {
    if (existing) {
      setForm({
        supplier: existing.supplier,
        warehouseId: existing.warehouseId,
        locationId: existing.locationId,
        items: existing.items.map(i => ({ ...i, quantity: i.quantity.toString() })),
      });
    }
  }, [existing]);

  const selectedWarehouse = inv.warehouses.find(w => w.id === form.warehouseId);
  const locations = selectedWarehouse?.locations || [];

  useEffect(() => {
    if (locations.length > 0 && !form.locationId) {
      setForm(f => ({ ...f, locationId: locations[0].id }));
    }
  }, [form.warehouseId]);

  function addItem() {
    setForm({ ...form, items: [...form.items, { productId: '', quantity: '' }] });
  }

  function removeItem(index) {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  }

  function updateItem(index, field, value) {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    setForm({ ...form, items });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.supplier || !form.warehouseId || !form.locationId) return;
    const validItems = form.items.filter(i => i.productId && parseInt(i.quantity) > 0);
    if (validItems.length === 0) return;

    const nextRef = `REC-${String(inv.receipts.length + 1).padStart(3, '0')}`;
    const receipt = {
      id: existing?.id || generateId(),
      reference: existing?.reference || nextRef,
      supplier: form.supplier,
      warehouseId: form.warehouseId,
      locationId: form.locationId,
      status: existing?.status || 'draft',
      items: validItems.map(i => ({ productId: i.productId, quantity: parseInt(i.quantity) })),
      createdAt: existing?.createdAt || new Date().toISOString(),
      validatedAt: existing?.validatedAt || null,
    };

    if (existing) {
      inv.dispatch({ type: 'UPDATE_RECEIPT', payload: receipt });
    } else {
      inv.dispatch({ type: 'ADD_RECEIPT', payload: receipt });
    }
    navigate('/receipts');
  }

  function handleValidate() {
    if (confirm('Validate this receipt? Stock will be increased automatically.')) {
      inv.dispatch({ type: 'VALIDATE_RECEIPT', payload: id });
      navigate('/receipts');
    }
  }

  function handleCancel() {
    if (confirm('Cancel this receipt? This action cannot be undone.')) {
      inv.dispatch({ type: 'CANCEL_RECEIPT', payload: id });
      navigate('/receipts');
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-icon" onClick={() => navigate('/receipts')}><ArrowLeft size={20} /></button>
          <div>
            <h1 className="page-title">{isView ? `Receipt ${existing.reference}` : existing ? 'Edit Receipt' : 'New Receipt'}</h1>
            <div className="page-subtitle">{isView ? 'Validated receipt' : 'Record incoming goods from a supplier'}</div>
          </div>
        </div>
        {existing && existing.status !== 'done' && existing.status !== 'canceled' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-success" onClick={handleValidate}>
              <CheckCircle size={18} /> Validate Receipt
            </button>
            <button className="btn btn-danger" onClick={handleCancel}>
              <XCircle size={18} /> Cancel Request
            </button>
          </div>
        )}
      </div>

      <div className="glass-card" style={{ maxWidth: 800, padding: 32 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Supplier Name *</label>
              <input type="text" className="form-input" placeholder="e.g. Steel Corp Ltd." value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} disabled={isView} />
            </div>
            <div className="form-group">
              <label className="form-label">Destination Warehouse *</label>
              <select className="form-select" value={form.warehouseId} onChange={e => setForm({ ...form, warehouseId: e.target.value, locationId: '' })} disabled={isView}>
                {inv.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location *</label>
              <select className="form-select" value={form.locationId} onChange={e => setForm({ ...form, locationId: e.target.value })} disabled={isView}>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <div className="divider" />

          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 16 }}>Products</h3>
          {form.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 2 }}>
                {i === 0 && <label className="form-label">Product</label>}
                <select className="form-select" value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)} disabled={isView}>
                  <option value="">Select product</option>
                  {inv.products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                {i === 0 && <label className="form-label">Quantity</label>}
                <input type="number" className="form-input" placeholder="0" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} min={1} disabled={isView} />
              </div>
              {!isView && form.items.length > 1 && (
                <button type="button" className="btn-icon" onClick={() => removeItem(i)} style={{ color: 'var(--color-rose)', marginBottom: 4 }}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}

          {!isView && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={addItem} style={{ marginBottom: 24 }}>
              <Plus size={16} /> Add Product Line
            </button>
          )}

          {!isView && (
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="submit" className="btn btn-primary"><Save size={18} /> {existing ? 'Update' : 'Create Receipt'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/receipts')}>Cancel</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
