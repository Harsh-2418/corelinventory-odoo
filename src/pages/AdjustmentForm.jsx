import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useInventory } from '../contexts/InventoryContext';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { generateId } from '../utils/helpers';

export default function AdjustmentForm() {
  const { id } = useParams();
  const inv = useInventory();
  const navigate = useNavigate();
  const existing = id ? inv.adjustments.find(a => a.id === id) : null;
  const isView = existing?.status === 'done';

  const [form, setForm] = useState({
    warehouseId: inv.warehouses[0]?.id || '',
    locationId: '',
    reason: '',
    items: [{ productId: '', countedQty: '' }],
  });

  useEffect(() => {
    if (existing) {
      setForm({
        warehouseId: existing.warehouseId,
        locationId: existing.locationId,
        reason: existing.reason || '',
        items: existing.items.map(i => ({
          productId: i.productId,
          countedQty: i.countedQty.toString(),
          expectedQty: i.expectedQty,
          difference: i.difference,
        })),
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
    setForm({ ...form, items: [...form.items, { productId: '', countedQty: '' }] });
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

  function getExpectedQty(productId) {
    if (!productId || !form.locationId) return 0;
    return inv.getLocationStock(productId, form.locationId);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.warehouseId || !form.locationId) return;
    const validItems = form.items.filter(i => i.productId && i.countedQty !== '');
    if (validItems.length === 0) return;

    const nextRef = `ADJ-${String(inv.adjustments.length + 1).padStart(3, '0')}`;
    const adjustment = {
      id: existing?.id || generateId(),
      reference: existing?.reference || nextRef,
      warehouseId: form.warehouseId,
      locationId: form.locationId,
      reason: form.reason,
      status: existing?.status || 'draft',
      items: validItems.map(i => {
        const expected = getExpectedQty(i.productId);
        const counted = parseInt(i.countedQty);
        return {
          productId: i.productId,
          expectedQty: expected,
          countedQty: counted,
          difference: counted - expected,
        };
      }),
      createdAt: existing?.createdAt || new Date().toISOString(),
      validatedAt: existing?.validatedAt || null,
    };

    if (existing) {
      // Can't update done adjustments
    } else {
      inv.dispatch({ type: 'ADD_ADJUSTMENT', payload: adjustment });
    }
    navigate('/adjustments');
  }

  function handleValidate() {
    if (confirm('Validate this adjustment? Stock will be corrected to match counted quantities.')) {
      inv.dispatch({ type: 'VALIDATE_ADJUSTMENT', payload: id });
      navigate('/adjustments');
    }
  }

  function handleCancel() {
    if (confirm('Cancel this adjustment? This action cannot be undone.')) {
      inv.dispatch({ type: 'CANCEL_ADJUSTMENT', payload: id });
      navigate('/adjustments');
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-icon" onClick={() => navigate('/adjustments')}><ArrowLeft size={20} /></button>
          <div>
            <h1 className="page-title">{isView ? `Adjustment ${existing.reference}` : 'New Stock Adjustment'}</h1>
            <div className="page-subtitle">{isView ? 'Completed adjustment' : 'Correct stock based on physical count'}</div>
          </div>
        </div>
        {existing && existing.status !== 'done' && existing.status !== 'canceled' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-success" onClick={handleValidate}>
              <CheckCircle size={18} /> Validate Adjustment
            </button>
            <button className="btn btn-danger" onClick={handleCancel}>
              <XCircle size={18} /> Cancel Request
            </button>
          </div>
        )}
      </div>

      <div className="glass-card" style={{ maxWidth: 900, padding: 32 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Warehouse *</label>
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
            <div className="form-group">
              <label className="form-label">Reason</label>
              <input type="text" className="form-input" placeholder="e.g. Damaged goods, Shrinkage" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} disabled={isView} />
            </div>
          </div>

          <div className="divider" />
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, marginBottom: 16 }}>Products to Adjust</h3>

          {form.items.map((item, i) => {
            const expected = item.productId ? getExpectedQty(item.productId) : 0;
            const counted = parseInt(item.countedQty) || 0;
            const diff = counted - expected;
            return (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 2 }}>
                  {i === 0 && <label className="form-label">Product</label>}
                  <select className="form-select" value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)} disabled={isView}>
                    <option value="">Select product</option>
                    {inv.products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 0.8 }}>
                  {i === 0 && <label className="form-label">System Qty</label>}
                  <input type="text" className="form-input" value={isView ? (item.expectedQty ?? expected) : expected} disabled style={{ background: 'var(--color-bg-primary)' }} />
                </div>
                <div className="form-group" style={{ flex: 0.8 }}>
                  {i === 0 && <label className="form-label">Counted Qty</label>}
                  <input type="number" className="form-input" placeholder="0" value={item.countedQty} onChange={e => updateItem(i, 'countedQty', e.target.value)} min={0} disabled={isView} />
                </div>
                <div className="form-group" style={{ flex: 0.6 }}>
                  {i === 0 && <label className="form-label">Diff</label>}
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-primary)',
                    fontWeight: 600,
                    color: (isView ? item.difference : diff) > 0 ? 'var(--color-emerald)' : (isView ? item.difference : diff) < 0 ? 'var(--color-rose)' : 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-base)',
                    textAlign: 'center',
                  }}>
                    {item.productId ? (isView ? (item.difference > 0 ? '+' : '') + item.difference : (diff > 0 ? '+' : '') + diff) : '—'}
                  </div>
                </div>
                {!isView && form.items.length > 1 && (
                  <button type="button" className="btn-icon" onClick={() => removeItem(i)} style={{ color: 'var(--color-rose)', marginBottom: 4 }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}

          {!isView && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={addItem} style={{ marginBottom: 24 }}>
              <Plus size={16} /> Add Product Line
            </button>
          )}

          {!isView && (
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="submit" className="btn btn-primary"><Save size={18} /> Create Adjustment</button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/adjustments')}>Cancel</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
