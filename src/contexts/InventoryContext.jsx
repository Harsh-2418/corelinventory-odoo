import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const InventoryContext = createContext(null);

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}

export function InventoryProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [stockByLocation, setStockByLocation] = useState({});
  const [loading, setLoading] = useState(true);

  // ─── Fetch all data from Supabase on mount ──────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: whData }, { data: locData }, { data: catData }, { data: prodData },
        { data: stockData }, { data: recData }, { data: recItemData },
        { data: delData }, { data: delItemData }, { data: trfData }, { data: trfItemData },
        { data: adjData }, { data: adjItemData }, { data: moveData },
      ] = await Promise.all([
        supabase.from('warehouses').select('*').order('created_at'),
        supabase.from('locations').select('*').order('created_at'),
        supabase.from('categories').select('*').order('created_at'),
        supabase.from('products').select('*').order('created_at'),
        supabase.from('stock_levels').select('*'),
        supabase.from('receipts').select('*').order('created_at', { ascending: false }),
        supabase.from('receipt_items').select('*'),
        supabase.from('deliveries').select('*').order('created_at', { ascending: false }),
        supabase.from('delivery_items').select('*'),
        supabase.from('transfers').select('*').order('created_at', { ascending: false }),
        supabase.from('transfer_items').select('*'),
        supabase.from('adjustments').select('*').order('created_at', { ascending: false }),
        supabase.from('adjustment_items').select('*'),
        supabase.from('move_history').select('*').order('created_at', { ascending: false }),
      ]);

      // Build warehouses with embedded locations
      const warehouseList = (whData || []).map(wh => ({
        ...wh,
        locations: (locData || []).filter(l => l.warehouse_id === wh.id).map(l => ({ id: l.id, name: l.name })),
      }));
      setWarehouses(warehouseList);

      // Map categories
      setCategories((catData || []).map(c => ({ id: c.id, name: c.name, description: c.description })));

      // Map products (use category_id as category for component compatibility)
      setProducts((prodData || []).map(p => ({
        id: p.id, name: p.name, sku: p.sku,
        category: p.category_id, unit: p.unit,
        reorderPoint: p.reorder_point, reorderQty: p.reorder_qty,
        createdAt: p.created_at,
      })));

      // Build stockByLocation map: { productId: { locationId: qty } }
      const sbl = {};
      (stockData || []).forEach(s => {
        if (!sbl[s.product_id]) sbl[s.product_id] = {};
        sbl[s.product_id][s.location_id] = s.quantity;
      });
      setStockByLocation(sbl);

      // Map receipts with items
      setReceipts((recData || []).map(r => ({
        id: r.id, reference: r.reference, supplier: r.supplier,
        warehouseId: r.warehouse_id, locationId: r.location_id,
        status: r.status, createdAt: r.created_at, validatedAt: r.validated_at,
        items: (recItemData || []).filter(i => i.receipt_id === r.id).map(i => ({
          productId: i.product_id, quantity: i.quantity,
        })),
      })));

      // Map deliveries with items
      setDeliveries((delData || []).map(d => ({
        id: d.id, reference: d.reference, customer: d.customer,
        warehouseId: d.warehouse_id, locationId: d.location_id,
        status: d.status, createdAt: d.created_at, validatedAt: d.validated_at,
        items: (delItemData || []).filter(i => i.delivery_id === d.id).map(i => ({
          productId: i.product_id, quantity: i.quantity,
        })),
      })));

      // Map transfers with items
      setTransfers((trfData || []).map(t => ({
        id: t.id, reference: t.reference,
        sourceWarehouseId: t.source_warehouse_id, sourceLocationId: t.source_location_id,
        destWarehouseId: t.dest_warehouse_id, destLocationId: t.dest_location_id,
        status: t.status, createdAt: t.created_at, validatedAt: t.validated_at,
        items: (trfItemData || []).filter(i => i.transfer_id === t.id).map(i => ({
          productId: i.product_id, quantity: i.quantity,
        })),
      })));

      // Map adjustments with items
      setAdjustments((adjData || []).map(a => ({
        id: a.id, reference: a.reference,
        warehouseId: a.warehouse_id, locationId: a.location_id,
        reason: a.reason, status: a.status,
        createdAt: a.created_at, validatedAt: a.validated_at,
        items: (adjItemData || []).filter(i => i.adjustment_id === a.id).map(i => ({
          productId: i.product_id, expectedQty: i.expected_qty,
          countedQty: i.counted_qty, difference: i.difference,
        })),
      })));

      // Map move history
      setMoveHistory((moveData || []).map(m => ({
        id: m.id, type: m.type, referenceId: m.reference_id,
        reference: m.reference, productId: m.product_id,
        productName: m.product_name, quantity: m.quantity,
        fromLocation: m.from_location, toLocation: m.to_location,
        date: m.created_at,
      })));
    } catch (err) {
      console.error('Failed to fetch inventory data:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Dispatch-like function that writes to Supabase then refreshes ─
  const dispatch = useCallback(async (action) => {
    try {
      switch (action.type) {
        // ── Products ──
        case 'ADD_PRODUCT': {
          const p = action.payload;
          await supabase.from('products').insert({
            name: p.name, sku: p.sku, category_id: p.category,
            unit: p.unit, reorder_point: p.reorderPoint, reorder_qty: p.reorderQty,
          });
          break;
        }
        case 'UPDATE_PRODUCT': {
          const p = action.payload;
          await supabase.from('products').update({
            name: p.name, sku: p.sku, category_id: p.category,
            unit: p.unit, reorder_point: p.reorderPoint, reorder_qty: p.reorderQty,
          }).eq('id', p.id);
          break;
        }
        case 'DELETE_PRODUCT': {
          await supabase.from('products').delete().eq('id', action.payload);
          break;
        }

        // ── Categories ──
        case 'ADD_CATEGORY': {
          const c = action.payload;
          await supabase.from('categories').insert({ name: c.name, description: c.description });
          break;
        }
        case 'UPDATE_CATEGORY': {
          const c = action.payload;
          await supabase.from('categories').update({ name: c.name, description: c.description }).eq('id', c.id);
          break;
        }
        case 'DELETE_CATEGORY': {
          await supabase.from('categories').delete().eq('id', action.payload);
          break;
        }

        // ── Warehouses ──
        case 'ADD_WAREHOUSE': {
          const w = action.payload;
          const { data: newWh } = await supabase.from('warehouses').insert({ name: w.name, address: w.address }).select().single();
          if (newWh && w.locations?.length > 0) {
            await supabase.from('locations').insert(
              w.locations.map(l => ({ warehouse_id: newWh.id, name: l.name }))
            );
          }
          break;
        }
        case 'UPDATE_WAREHOUSE': {
          const w = action.payload;
          await supabase.from('warehouses').update({ name: w.name, address: w.address }).eq('id', w.id);
          // Sync locations: delete existing, re-insert
          await supabase.from('locations').delete().eq('warehouse_id', w.id);
          if (w.locations?.length > 0) {
            await supabase.from('locations').insert(
              w.locations.map(l => ({ warehouse_id: w.id, name: l.name }))
            );
          }
          break;
        }
        case 'DELETE_WAREHOUSE': {
          await supabase.from('warehouses').delete().eq('id', action.payload);
          break;
        }

        // ── Receipts ──
        case 'ADD_RECEIPT': {
          const r = action.payload;
          const { data: newRec } = await supabase.from('receipts').insert({
            reference: r.reference, supplier: r.supplier,
            warehouse_id: r.warehouseId, location_id: r.locationId, status: r.status,
          }).select().single();
          if (newRec && r.items?.length > 0) {
            await supabase.from('receipt_items').insert(
              r.items.map(i => ({ receipt_id: newRec.id, product_id: i.productId, quantity: i.quantity }))
            );
          }
          break;
        }
        case 'UPDATE_RECEIPT': {
          const r = action.payload;
          await supabase.from('receipts').update({
            supplier: r.supplier, warehouse_id: r.warehouseId,
            location_id: r.locationId, status: r.status,
          }).eq('id', r.id);
          await supabase.from('receipt_items').delete().eq('receipt_id', r.id);
          if (r.items?.length > 0) {
            await supabase.from('receipt_items').insert(
              r.items.map(i => ({ receipt_id: r.id, product_id: i.productId, quantity: i.quantity }))
            );
          }
          break;
        }
        case 'VALIDATE_RECEIPT': {
          const receipt = receipts.find(r => r.id === action.payload);
          if (!receipt || receipt.status === 'done') break;
          // Update stock levels
          for (const item of receipt.items) {
            const { data: existing } = await supabase.from('stock_levels')
              .select('*').eq('product_id', item.productId).eq('location_id', receipt.locationId).single();
            if (existing) {
              await supabase.from('stock_levels').update({ quantity: existing.quantity + item.quantity }).eq('id', existing.id);
            } else {
              await supabase.from('stock_levels').insert({ product_id: item.productId, location_id: receipt.locationId, quantity: item.quantity });
            }
            // Log move history
            const product = products.find(p => p.id === item.productId);
            const wh = warehouses.find(w => w.id === receipt.warehouseId);
            const loc = wh?.locations.find(l => l.id === receipt.locationId);
            await supabase.from('move_history').insert({
              type: 'receipt', reference_id: receipt.id, reference: receipt.reference,
              product_id: item.productId, product_name: product?.name || 'Unknown',
              quantity: item.quantity, from_location: null,
              to_location: `${loc?.name || 'Unknown'} (${wh?.name || 'Unknown'})`,
            });
          }
          await supabase.from('receipts').update({ status: 'done', validated_at: new Date().toISOString() }).eq('id', action.payload);
          break;
        }

        // ── Deliveries ──
        case 'ADD_DELIVERY': {
          const d = action.payload;
          const { data: newDel } = await supabase.from('deliveries').insert({
            reference: d.reference, customer: d.customer,
            warehouse_id: d.warehouseId, location_id: d.locationId, status: d.status,
          }).select().single();
          if (newDel && d.items?.length > 0) {
            await supabase.from('delivery_items').insert(
              d.items.map(i => ({ delivery_id: newDel.id, product_id: i.productId, quantity: i.quantity }))
            );
          }
          break;
        }
        case 'UPDATE_DELIVERY': {
          const d = action.payload;
          await supabase.from('deliveries').update({
            customer: d.customer, warehouse_id: d.warehouseId,
            location_id: d.locationId, status: d.status,
          }).eq('id', d.id);
          await supabase.from('delivery_items').delete().eq('delivery_id', d.id);
          if (d.items?.length > 0) {
            await supabase.from('delivery_items').insert(
              d.items.map(i => ({ delivery_id: d.id, product_id: i.productId, quantity: i.quantity }))
            );
          }
          break;
        }
        case 'VALIDATE_DELIVERY': {
          const delivery = deliveries.find(d => d.id === action.payload);
          if (!delivery || delivery.status === 'done') break;
          for (const item of delivery.items) {
            const { data: existing } = await supabase.from('stock_levels')
              .select('*').eq('product_id', item.productId).eq('location_id', delivery.locationId).single();
            if (existing) {
              await supabase.from('stock_levels').update({ quantity: Math.max(0, existing.quantity - item.quantity) }).eq('id', existing.id);
            }
            const product = products.find(p => p.id === item.productId);
            const wh = warehouses.find(w => w.id === delivery.warehouseId);
            const loc = wh?.locations.find(l => l.id === delivery.locationId);
            await supabase.from('move_history').insert({
              type: 'delivery', reference_id: delivery.id, reference: delivery.reference,
              product_id: item.productId, product_name: product?.name || 'Unknown',
              quantity: -item.quantity,
              from_location: `${loc?.name || 'Unknown'} (${wh?.name || 'Unknown'})`,
              to_location: null,
            });
          }
          await supabase.from('deliveries').update({ status: 'done', validated_at: new Date().toISOString() }).eq('id', action.payload);
          break;
        }

        // ── Transfers ──
        case 'ADD_TRANSFER': {
          const t = action.payload;
          const { data: newTrf } = await supabase.from('transfers').insert({
            reference: t.reference,
            source_warehouse_id: t.sourceWarehouseId, source_location_id: t.sourceLocationId,
            dest_warehouse_id: t.destWarehouseId, dest_location_id: t.destLocationId, status: t.status,
          }).select().single();
          if (newTrf && t.items?.length > 0) {
            await supabase.from('transfer_items').insert(
              t.items.map(i => ({ transfer_id: newTrf.id, product_id: i.productId, quantity: i.quantity }))
            );
          }
          break;
        }
        case 'UPDATE_TRANSFER': {
          const t = action.payload;
          await supabase.from('transfers').update({
            source_warehouse_id: t.sourceWarehouseId, source_location_id: t.sourceLocationId,
            dest_warehouse_id: t.destWarehouseId, dest_location_id: t.destLocationId, status: t.status,
          }).eq('id', t.id);
          await supabase.from('transfer_items').delete().eq('transfer_id', t.id);
          if (t.items?.length > 0) {
            await supabase.from('transfer_items').insert(
              t.items.map(i => ({ transfer_id: t.id, product_id: i.productId, quantity: i.quantity }))
            );
          }
          break;
        }
        case 'VALIDATE_TRANSFER': {
          const transfer = transfers.find(t => t.id === action.payload);
          if (!transfer || transfer.status === 'done') break;
          for (const item of transfer.items) {
            // Decrease source
            const { data: srcStock } = await supabase.from('stock_levels')
              .select('*').eq('product_id', item.productId).eq('location_id', transfer.sourceLocationId).single();
            if (srcStock) {
              await supabase.from('stock_levels').update({ quantity: Math.max(0, srcStock.quantity - item.quantity) }).eq('id', srcStock.id);
            }
            // Increase dest
            const { data: dstStock } = await supabase.from('stock_levels')
              .select('*').eq('product_id', item.productId).eq('location_id', transfer.destLocationId).single();
            if (dstStock) {
              await supabase.from('stock_levels').update({ quantity: dstStock.quantity + item.quantity }).eq('id', dstStock.id);
            } else {
              await supabase.from('stock_levels').insert({ product_id: item.productId, location_id: transfer.destLocationId, quantity: item.quantity });
            }
            const product = products.find(p => p.id === item.productId);
            const srcWh = warehouses.find(w => w.id === transfer.sourceWarehouseId);
            const srcLoc = srcWh?.locations.find(l => l.id === transfer.sourceLocationId);
            const dstWh = warehouses.find(w => w.id === transfer.destWarehouseId);
            const dstLoc = dstWh?.locations.find(l => l.id === transfer.destLocationId);
            await supabase.from('move_history').insert({
              type: 'transfer', reference_id: transfer.id, reference: transfer.reference,
              product_id: item.productId, product_name: product?.name || 'Unknown',
              quantity: item.quantity,
              from_location: `${srcLoc?.name || 'Unknown'} (${srcWh?.name || 'Unknown'})`,
              to_location: `${dstLoc?.name || 'Unknown'} (${dstWh?.name || 'Unknown'})`,
            });
          }
          await supabase.from('transfers').update({ status: 'done', validated_at: new Date().toISOString() }).eq('id', action.payload);
          break;
        }

        // ── Adjustments ──
        case 'ADD_ADJUSTMENT': {
          const a = action.payload;
          const { data: newAdj } = await supabase.from('adjustments').insert({
            reference: a.reference, warehouse_id: a.warehouseId,
            location_id: a.locationId, reason: a.reason, status: a.status,
          }).select().single();
          if (newAdj && a.items?.length > 0) {
            await supabase.from('adjustment_items').insert(
              a.items.map(i => ({
                adjustment_id: newAdj.id, product_id: i.productId,
                expected_qty: i.expectedQty, counted_qty: i.countedQty, difference: i.difference,
              }))
            );
          }
          break;
        }
        case 'VALIDATE_ADJUSTMENT': {
          const adj = adjustments.find(a => a.id === action.payload);
          if (!adj || adj.status === 'done') break;
          for (const item of adj.items) {
            const { data: existing } = await supabase.from('stock_levels')
              .select('*').eq('product_id', item.productId).eq('location_id', adj.locationId).single();
            if (existing) {
              await supabase.from('stock_levels').update({ quantity: item.countedQty }).eq('id', existing.id);
            } else {
              await supabase.from('stock_levels').insert({ product_id: item.productId, location_id: adj.locationId, quantity: item.countedQty });
            }
            const product = products.find(p => p.id === item.productId);
            const wh = warehouses.find(w => w.id === adj.warehouseId);
            const loc = wh?.locations.find(l => l.id === adj.locationId);
            await supabase.from('move_history').insert({
              type: 'adjustment', reference_id: adj.id, reference: adj.reference,
              product_id: item.productId, product_name: product?.name || 'Unknown',
              quantity: item.difference, from_location: null,
              to_location: `${loc?.name || 'Unknown'} (${wh?.name || 'Unknown'})`,
            });
          }
          await supabase.from('adjustments').update({ status: 'done', validated_at: new Date().toISOString() }).eq('id', action.payload);
          break;
        }

        default:
          console.warn('Unknown action type:', action.type);
          return;
      }
      // Refresh data after mutation
      await fetchAll();
    } catch (err) {
      console.error('Dispatch error:', err);
    }
  }, [fetchAll, products, warehouses, receipts, deliveries, transfers, adjustments]);

  // ─── Helper functions (same API as before) ──────────────────────
  function getProductStock(productId) {
    const locations = stockByLocation[productId] || {};
    return Object.values(locations).reduce((sum, qty) => sum + qty, 0);
  }

  function getLocationStock(productId, locationId) {
    return stockByLocation[productId]?.[locationId] || 0;
  }

  function getWarehouseName(warehouseId) {
    return warehouses.find(w => w.id === warehouseId)?.name || 'Unknown';
  }

  function getLocationName(warehouseId, locationId) {
    const wh = warehouses.find(w => w.id === warehouseId);
    return wh?.locations.find(l => l.id === locationId)?.name || 'Unknown';
  }

  function getCategoryName(categoryId) {
    return categories.find(c => c.id === categoryId)?.name || 'Uncategorized';
  }

  function getProductName(productId) {
    return products.find(p => p.id === productId)?.name || 'Unknown';
  }

  function getLowStockProducts() {
    return products.filter(p => {
      const stock = getProductStock(p.id);
      return stock <= (p.reorderPoint || 10);
    });
  }

  function getOutOfStockProducts() {
    return products.filter(p => getProductStock(p.id) === 0);
  }

  return (
    <InventoryContext.Provider value={{
      products, categories, warehouses, receipts, deliveries, transfers,
      adjustments, moveHistory, stockByLocation, loading, dispatch,
      getProductStock, getLocationStock, getWarehouseName, getLocationName,
      getCategoryName, getProductName, getLowStockProducts, getOutOfStockProducts,
      refetch: fetchAll,
    }}>
      {children}
    </InventoryContext.Provider>
  );
}
