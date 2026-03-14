import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInventory } from '../contexts/InventoryContext';
import { Plus, Search, Package, Filter } from 'lucide-react';
import { searchFilter, getStockLevel, getStockLevelLabel } from '../utils/helpers';

export default function Products() {
  const inv = useInventory();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  const filtered = useMemo(() => {
    let items = [...inv.products];
    if (search) items = searchFilter(items, search, ['name', 'sku']);
    if (categoryFilter !== 'all') items = items.filter(p => p.category === categoryFilter);
    if (stockFilter !== 'all') {
      items = items.filter(p => {
        const level = getStockLevel(inv.getProductStock(p.id), p.reorderPoint);
        return level === stockFilter;
      });
    }
    return items;
  }, [inv.products, search, categoryFilter, stockFilter, inv]);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <div className="page-subtitle">{inv.products.length} products in inventory</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 200, maxWidth: 360 }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ minWidth: 160 }}>
          <option value="all">All Categories</option>
          {inv.categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select className="form-select" value={stockFilter} onChange={e => setStockFilter(e.target.value)} style={{ minWidth: 140 }}>
          <option value="all">All Stock Levels</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state glass-card" style={{ padding: 60 }}>
          <Package size={48} className="empty-state-icon" />
          <div className="empty-state-title">No products found</div>
          <div className="empty-state-desc">
            {search || categoryFilter !== 'all' || stockFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first product to get started'}
          </div>
          {!search && categoryFilter === 'all' && stockFilter === 'all' && (
            <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
              <Plus size={18} /> Add Product
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Reorder Point</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const stock = inv.getProductStock(p.id);
                const level = getStockLevel(stock, p.reorderPoint);
                return (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/products/${p.id}`)}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td><code style={{ color: 'var(--color-accent)', background: 'var(--color-accent-light)', padding: '2px 6px', borderRadius: 4, fontSize: 'var(--font-size-xs)' }}>{p.sku}</code></td>
                    <td>{inv.getCategoryName(p.category)}</td>
                    <td>{p.unit}</td>
                    <td style={{ fontWeight: 600 }}>{stock}</td>
                    <td>
                      <div className="stock-level">
                        <span className={`stock-dot ${level}`} />
                        <span style={{
                          fontSize: 'var(--font-size-xs)',
                          color: level === 'in-stock' ? 'var(--color-emerald)' : level === 'low-stock' ? 'var(--color-amber)' : 'var(--color-rose)',
                        }}>
                          {getStockLevelLabel(level)}
                        </span>
                      </div>
                    </td>
                    <td>{p.reorderPoint}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/products/${p.id}/edit`); }}>
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
