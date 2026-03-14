import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInventory } from '../contexts/InventoryContext';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle, ArrowRight } from 'lucide-react';
import { generateId } from '../utils/helpers';

export default function TransferForm() {
  const { id } = useParams();
  const inv = useInventory();
  const navigate = useNavigate();
  const existing = id ? inv.transfers.find(t => t.id === id) : null;
  const isView = existing?.status === 'done';

  const [form, setForm] = useState({
    sourceWarehouseId: inv.warehouses[0]?.id || '',
    sourceLocationId: '',
    destWarehouseId: inv.warehouses.length > 1 ? inv.warehouses[1].id : inv.warehouses[0]?.id || '',
    destLocationId: '',
    items: [{ productId: '', quantity: '' }],
  });

  useEffect(() => {
    if (existing) {
      setForm({
        sourceWarehouseId: existing.sourceWarehouseId,
        sourceLocationId: existing.sourceLocationId,
        destWarehouseId: existing.destWarehouseId,
        destLocationId: existing.destLocationId,
        items: existing.items.map(i => ({ ...i, quantity: i.quantity.toString() })),
      });
    }
  }, [existing]);

  const srcWarehouse = inv.warehouses.find(w => w.id === form.sourceWarehouseId);
  const srcLocations = srcWarehouse?.locations || [];
  const dstWarehouse = inv.warehouses.find(w => w.id === form.destWarehouseId);
  const dstLocations = dstWarehouse?.locations || [];

  useEffect(() => {
    if (srcLocations.length > 0 && !form.sourceLocationId) {
      setForm(f => ({ ...f, sourceLocationId: srcLocations[0].id }));
    }
  }, [form.sourceWarehouseId]);

  useEffect(() => {
    if (dstLocations.length > 0 && !form.destLocationId) {
      setForm(f => ({ ...f, destLocationId: dstLocations[0].id }));
    }
  }, [form.destWarehouseId]);

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
    if (!form.sourceWarehouseId || !form.sourceLocationId || !form.destWarehouseId || !form.destLocationId) return;
    const validItems = form.items.filter(i => i.productId && parseInt(i.quantity) > 0);
    if (validItems.length === 0) return;

    const nextRef = `TRF-${String(inv.transfers.length + 1).padStart(3, '0')}`;
    const transfer = {
      id: existing?.id || generateId(),
      reference: existing?.reference || nextRef,
      sourceWarehouseId: form.sourceWarehouseId,
      sourceLocationId: form.sourceLocationId,
      destWarehouseId: form.destWarehouseId,
      destLocationId: form.destLocationId,
      status: existing?.status || 'draft',
      items: validItems.map(i => ({ productId: i.productId, quantity: parseInt(i.quantity) })),
      createdAt: existing?.createdAt || new Date().toISOString(),
      validatedAt: existing?.validatedAt || null,
    };

    if (existing) {
      inv.dispatch({ type: 'UPDATE_TRANSFER', payload: transfer });
    } else {
      inv.dispatch({ type: 'ADD_TRANSFER', payload: transfer });
    }
    navigate('/transfers');
  }

  function handleValidate() {
    if (confirm('Validate this transfer? Stock will be moved between locations.')) {
      inv.dispatch({ type: 'VALIDATE_TRANSFER', payload: id });
      navigate('/transfers');
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-icon" onClick={() => navigate('/transfers')}><ArrowLeft size={20} /></button>
          <div>
            <h1 className="page-title">{isView ? `Transfer ${existing.reference}` : existing ? 'Edit Transfer' : 'New Internal Transfer'}</h1>
            <div className="page-subtitle">{isView ? 'Completed transfer' : 'Move stock between warehouses or locations'}</div>
          </div>
        </div>
        {existing && existing.status !== 'done' && existing.status !== 'canceled' && (
          <button className="btn btn-success" onClick={handleValidate}>
            <CheckCircle size={18} /> Validate Transfer
          </button>
        )}
      </div>

      <div className="glass-card" style={{ maxWidth: 900, padding: 32 }}>
        <form onSubmit={handleSubmit}>
          {/* Source and Destination */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'end', marginBottom: 24 }}>
            <div>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source</h4>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Warehouse</label>
                <select className="form-select" value={form.sourceWarehouseId} onChange={e => setForm({ ...form, sourceWarehouseId: e.target.value, sourceLocationId: '' })} disabled={isView}>
                  {inv.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <select className="form-select" value={form.sourceLocationId} onChange={e => setForm({ ...form, sourceLocationId: e.target.value })} disabled={isView}>
                  {srcLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: 'var(--color-accent-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ArrowRight size={20} color="var(--color-accent)" />
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destination</h4>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Warehouse</label>
                <select className="form-select" value={form.destWarehouseId} onChange={e => setForm({ ...form, destWarehouseId: e.target.value, destLocationId: '' })} disabled={isView}>
                  {inv.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <select className="form-select" value={form.destLocationId} onChange={e => setForm({ ...form, destLocationId: e.target.value })} disabled={isView}>
                  {dstLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="divider" />
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 16 }}>Products to Transfer</h3>

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
              <button type="submit" className="btn btn-primary"><Save size={18} /> {existing ? 'Update' : 'Create Transfer'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/transfers')}>Cancel</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
