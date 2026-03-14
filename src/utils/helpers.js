export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function generateSKU(category, index) {
  const prefix = (category || 'GEN').substring(0, 3).toUpperCase();
  return `${prefix}-${String(index || Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
}

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric' 
  });
}

export function formatDateTime(date) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

export const STATUS = {
  DRAFT: 'draft',
  WAITING: 'waiting',
  READY: 'ready',
  DONE: 'done',
  CANCELED: 'canceled',
};

export const OPERATION_TYPES = {
  RECEIPT: 'receipt',
  DELIVERY: 'delivery',
  TRANSFER: 'transfer',
  ADJUSTMENT: 'adjustment',
};

export function getStatusColor(status) {
  switch (status) {
    case STATUS.DRAFT: return 'draft';
    case STATUS.WAITING: return 'waiting';
    case STATUS.READY: return 'ready';
    case STATUS.DONE: return 'done';
    case STATUS.CANCELED: return 'canceled';
    default: return 'draft';
  }
}

export function getStatusLabel(status) {
  switch (status) {
    case STATUS.DRAFT: return 'Draft';
    case STATUS.WAITING: return 'Waiting';
    case STATUS.READY: return 'Ready';
    case STATUS.DONE: return 'Done';
    case STATUS.CANCELED: return 'Canceled';
    default: return status;
  }
}

export function getOperationLabel(type) {
  switch (type) {
    case OPERATION_TYPES.RECEIPT: return 'Receipt';
    case OPERATION_TYPES.DELIVERY: return 'Delivery';
    case OPERATION_TYPES.TRANSFER: return 'Transfer';
    case OPERATION_TYPES.ADJUSTMENT: return 'Adjustment';
    default: return type;
  }
}

export function searchFilter(items, query, fields) {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter(item =>
    fields.some(field => {
      const val = item[field];
      return val && val.toString().toLowerCase().includes(q);
    })
  );
}

export function getStockLevel(quantity, reorderPoint) {
  if (quantity <= 0) return 'out-of-stock';
  if (quantity <= (reorderPoint || 10)) return 'low-stock';
  return 'in-stock';
}

export function getStockLevelLabel(level) {
  switch (level) {
    case 'out-of-stock': return 'Out of Stock';
    case 'low-stock': return 'Low Stock';
    case 'in-stock': return 'In Stock';
    default: return level;
  }
}

export function calculateTotalStock(product, stockByLocation) {
  if (!stockByLocation) return product.initialStock || 0;
  return Object.values(stockByLocation).reduce((sum, qty) => sum + qty, 0);
}
