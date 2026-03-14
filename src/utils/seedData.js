import { generateId } from './helpers';

const CATEGORIES = ['Raw Materials', 'Finished Goods', 'Packaging', 'Tools & Equipment', 'Electronics'];
const UNITS = ['kg', 'pcs', 'liters', 'meters', 'boxes'];

export function getSeedData() {
  const warehouses = [
    { id: 'wh1', name: 'Main Warehouse', address: '123 Industrial Ave, Building A', locations: [
      { id: 'loc1', name: 'Rack A' },
      { id: 'loc2', name: 'Rack B' },
      { id: 'loc3', name: 'Cold Storage' },
    ]},
    { id: 'wh2', name: 'Production Floor', address: '123 Industrial Ave, Building B', locations: [
      { id: 'loc4', name: 'Assembly Line 1' },
      { id: 'loc5', name: 'Assembly Line 2' },
    ]},
    { id: 'wh3', name: 'Distribution Center', address: '456 Logistics Blvd', locations: [
      { id: 'loc6', name: 'Shipping Bay' },
      { id: 'loc7', name: 'Returns Area' },
    ]},
  ];

  const categories = CATEGORIES.map((name, i) => ({
    id: `cat${i + 1}`,
    name,
    description: `Category for ${name.toLowerCase()}`,
    productCount: 0,
  }));

  const products = [
    { id: 'p1', name: 'Steel Rods', sku: 'RAW-0001', category: 'cat1', unit: 'kg', reorderPoint: 50, reorderQty: 200, createdAt: new Date('2026-01-15').toISOString() },
    { id: 'p2', name: 'Aluminum Sheets', sku: 'RAW-0002', category: 'cat1', unit: 'pcs', reorderPoint: 30, reorderQty: 100, createdAt: new Date('2026-01-18').toISOString() },
    { id: 'p3', name: 'Office Chairs', sku: 'FIN-0001', category: 'cat2', unit: 'pcs', reorderPoint: 10, reorderQty: 50, createdAt: new Date('2026-02-01').toISOString() },
    { id: 'p4', name: 'Standing Desks', sku: 'FIN-0002', category: 'cat2', unit: 'pcs', reorderPoint: 5, reorderQty: 20, createdAt: new Date('2026-02-05').toISOString() },
    { id: 'p5', name: 'Cardboard Boxes (Large)', sku: 'PKG-0001', category: 'cat3', unit: 'pcs', reorderPoint: 100, reorderQty: 500, createdAt: new Date('2026-02-10').toISOString() },
    { id: 'p6', name: 'Bubble Wrap Roll', sku: 'PKG-0002', category: 'cat3', unit: 'meters', reorderPoint: 50, reorderQty: 200, createdAt: new Date('2026-02-12').toISOString() },
    { id: 'p7', name: 'Power Drill', sku: 'TOL-0001', category: 'cat4', unit: 'pcs', reorderPoint: 5, reorderQty: 10, createdAt: new Date('2026-02-15').toISOString() },
    { id: 'p8', name: 'Circuit Boards', sku: 'ELC-0001', category: 'cat5', unit: 'pcs', reorderPoint: 20, reorderQty: 100, createdAt: new Date('2026-02-20').toISOString() },
    { id: 'p9', name: 'LED Panels', sku: 'ELC-0002', category: 'cat5', unit: 'pcs', reorderPoint: 15, reorderQty: 50, createdAt: new Date('2026-02-22').toISOString() },
    { id: 'p10', name: 'Copper Wire', sku: 'RAW-0003', category: 'cat1', unit: 'meters', reorderPoint: 100, reorderQty: 500, createdAt: new Date('2026-02-25').toISOString() },
  ];

  // Stock by location: { productId: { locationId: quantity } }
  const stockByLocation = {
    'p1': { 'loc1': 150, 'loc4': 30 },
    'p2': { 'loc1': 80, 'loc2': 20 },
    'p3': { 'loc2': 25, 'loc6': 10 },
    'p4': { 'loc2': 8 },
    'p5': { 'loc1': 200, 'loc6': 150 },
    'p6': { 'loc1': 120 },
    'p7': { 'loc4': 12, 'loc5': 8 },
    'p8': { 'loc3': 45 },
    'p9': { 'loc3': 8 },       // Low stock
    'p10': { 'loc1': 60 },     // Low stock
  };

  const receipts = [
    {
      id: 'rec1', reference: 'REC-001', supplier: 'Steel Corp Ltd.', warehouseId: 'wh1', locationId: 'loc1',
      status: 'done', items: [{ productId: 'p1', quantity: 200 }],
      createdAt: new Date('2026-02-01').toISOString(), validatedAt: new Date('2026-02-02').toISOString(),
    },
    {
      id: 'rec2', reference: 'REC-002', supplier: 'PackagePro', warehouseId: 'wh1', locationId: 'loc1',
      status: 'done', items: [{ productId: 'p5', quantity: 300 }, { productId: 'p6', quantity: 150 }],
      createdAt: new Date('2026-02-10').toISOString(), validatedAt: new Date('2026-02-11').toISOString(),
    },
    {
      id: 'rec3', reference: 'REC-003', supplier: 'ElectroSupply', warehouseId: 'wh1', locationId: 'loc3',
      status: 'waiting', items: [{ productId: 'p8', quantity: 100 }, { productId: 'p9', quantity: 50 }],
      createdAt: new Date('2026-03-10').toISOString(), validatedAt: null,
    },
  ];

  const deliveries = [
    {
      id: 'del1', reference: 'DEL-001', customer: 'Office Solutions Inc.', warehouseId: 'wh1', locationId: 'loc2',
      status: 'done', items: [{ productId: 'p3', quantity: 10 }],
      createdAt: new Date('2026-02-15').toISOString(), validatedAt: new Date('2026-02-16').toISOString(),
    },
    {
      id: 'del2', reference: 'DEL-002', customer: 'TechStart Ltd.', warehouseId: 'wh3', locationId: 'loc6',
      status: 'ready', items: [{ productId: 'p4', quantity: 3 }, { productId: 'p3', quantity: 5 }],
      createdAt: new Date('2026-03-05').toISOString(), validatedAt: null,
    },
  ];

  const transfers = [
    {
      id: 'tr1', reference: 'TRF-001', 
      sourceWarehouseId: 'wh1', sourceLocationId: 'loc1', 
      destWarehouseId: 'wh2', destLocationId: 'loc4',
      status: 'done', items: [{ productId: 'p1', quantity: 50 }],
      createdAt: new Date('2026-02-05').toISOString(), validatedAt: new Date('2026-02-05').toISOString(),
    },
  ];

  const adjustments = [
    {
      id: 'adj1', reference: 'ADJ-001', warehouseId: 'wh1', locationId: 'loc1',
      status: 'done', reason: 'Damaged goods',
      items: [{ productId: 'p1', expectedQty: 155, countedQty: 150, difference: -5 }],
      createdAt: new Date('2026-02-20').toISOString(), validatedAt: new Date('2026-02-20').toISOString(),
    },
  ];

  const moveHistory = [
    { id: 'mv1', type: 'receipt', referenceId: 'rec1', reference: 'REC-001', productId: 'p1', productName: 'Steel Rods', quantity: 200, fromLocation: null, toLocation: 'Rack A (Main Warehouse)', date: new Date('2026-02-02').toISOString() },
    { id: 'mv2', type: 'receipt', referenceId: 'rec2', reference: 'REC-002', productId: 'p5', productName: 'Cardboard Boxes (Large)', quantity: 300, fromLocation: null, toLocation: 'Rack A (Main Warehouse)', date: new Date('2026-02-11').toISOString() },
    { id: 'mv3', type: 'receipt', referenceId: 'rec2', reference: 'REC-002', productId: 'p6', productName: 'Bubble Wrap Roll', quantity: 150, fromLocation: null, toLocation: 'Rack A (Main Warehouse)', date: new Date('2026-02-11').toISOString() },
    { id: 'mv4', type: 'transfer', referenceId: 'tr1', reference: 'TRF-001', productId: 'p1', productName: 'Steel Rods', quantity: 50, fromLocation: 'Rack A (Main Warehouse)', toLocation: 'Assembly Line 1 (Production Floor)', date: new Date('2026-02-05').toISOString() },
    { id: 'mv5', type: 'delivery', referenceId: 'del1', reference: 'DEL-001', productId: 'p3', productName: 'Office Chairs', quantity: 10, fromLocation: 'Rack B (Main Warehouse)', toLocation: null, date: new Date('2026-02-16').toISOString() },
    { id: 'mv6', type: 'adjustment', referenceId: 'adj1', reference: 'ADJ-001', productId: 'p1', productName: 'Steel Rods', quantity: -5, fromLocation: null, toLocation: 'Rack A (Main Warehouse)', date: new Date('2026-02-20').toISOString() },
  ];

  return { warehouses, categories, products, stockByLocation, receipts, deliveries, transfers, adjustments, moveHistory };
}
