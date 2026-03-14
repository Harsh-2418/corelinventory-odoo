import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInventory } from '../contexts/InventoryContext';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle } from 'lucide-react';
import { generateId } from '../utils/helpers';

export default function DeliveryForm() {
  const { id } = useParams();
  const inv = useInventory();
  const navigate = useNavigate();
  const existing = id ? inv.deliveries.find(d => d.id === id) : null;
  const isView = existing?.status === 'done';

  const [form, setForm] = useState({
    customer: '',
    warehouseId: inv.warehouses[0]?.id || '',
    locationId: '',
    items: [{ productId: '', quantity: '' }],
  });

  useEffect(() => {
    if (existing) {
      setForm({
        customer: existing.customer,
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
    if (!form.customer || !form.warehouseId || !form.locationId) return;
    const validItems = form.items.filter(i => i.productId && parseInt(i.quantity) > 0);
    if (validItems.length === 0) return;

    const nextRef = `DEL-${String(inv.deliveries.length + 1).padStart(3, '0')}`;
    const delivery = {
      id: existing?.id || generateId(),
      reference: existing?.reference || nextRef,
      customer: form.customer,
      warehouseId: form.warehouseId,
      locationId: form.locationId,
      status: existing?.status || 'draft',
      items: validItems.map(i => ({ productId: i.productId, quantity: parseInt(i.quantity) })),
      createdAt: existing?.createdAt || new Date().toISOString(),
      validatedAt: existing?.validatedAt || null,
    };

    if (existing) {
      inv.dispatch({ type: 'UPDATE_DELIVERY', payload: delivery });
    } else {
      inv.dispatch({ type: 'ADD_DELIVERY', payload: delivery });
    }
    navigate('/deliveries');
  }

  function handleValidate() {
    if (confirm('Validate this delivery? Stock will be decreased automatically.')) {
      inv.dispatch({ type: 'VALIDATE_DELIVERY', payload: id });
      navigate('/deliveries');
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-icon" onClick={() => navigate('/deliveries')}><ArrowLeft size={20} /></button>
          <div>
            <h1 className="page-title">{isView ? `Delivery ${existing.reference}` : existing ? 'Edit Delivery' : 'New Delivery Order'}</h1>
            <div className="page-subtitle">{isView ? 'Completed delivery' : 'Ship goods to a customer'}</div>
          </div>
        </div>
        {existing && existing.status !== 'done' && existing.status !== 'canceled' && (
          <button className="btn btn-success" onClick={handleValidate}>
            <CheckCircle size={18} /> Validate Delivery
          </button>
        )}
      </div>

      <div className="glass-card" style={{ maxWidth: 800, padding: 32 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input type="text" className="form-input" placeholder="e.g. Office Solutions Inc." value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} disabled={isView} />
            </div>
            <div className="form-group">
              <label className="form-label">Source Warehouse *</label>
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
                  {inv.products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku}) — Stock: {inv.getProductStock(p.id)}</option>)}
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
              <button type="submit" className="btn btn-primary"><Save size={18} /> {existing ? 'Update' : 'Create Delivery'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/deliveries')}>Cancel</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
