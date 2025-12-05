import { AppData, ContactType, TransactionType } from '../types';

const STORAGE_KEY = 'inventory_flow_data_v1';

const INITIAL_DATA: AppData = {
  products: [
    { id: '1', name: 'Wireless Mouse', sku: 'WM-001', category: 'Electronics', currentStock: 45, minStock: 10, buyingPrice: 15, sellingPrice: 29.99 },
    { id: '2', name: 'Mechanical Keyboard', sku: 'MK-102', category: 'Electronics', currentStock: 12, minStock: 5, buyingPrice: 60, sellingPrice: 120 },
    { id: '3', name: 'USB-C Cable (2m)', sku: 'CB-200', category: 'Accessories', currentStock: 100, minStock: 20, buyingPrice: 2, sellingPrice: 9.99 },
    { id: '4', name: 'Monitor Stand', sku: 'MS-500', category: 'Office', currentStock: 8, minStock: 5, buyingPrice: 25, sellingPrice: 55 },
  ],
  contacts: [
    { id: '101', name: 'TechSupplies Inc.', type: ContactType.SELLER, email: 'sales@techsupplies.com', phone: '555-0101' },
    { id: '102', name: 'Global Gadgets', type: ContactType.SELLER, email: 'orders@globalgadgets.com', phone: '555-0102' },
    { id: '201', name: 'John Doe', type: ContactType.BUYER, email: 'john@example.com', phone: '555-0201' },
    { id: '202', name: 'Acme Corp', type: ContactType.BUYER, email: 'procurement@acme.com', phone: '555-0202' },
  ],
  transactions: [
    // Pre-populate some history for the last 3 months
    {
      id: 'tx-1',
      type: TransactionType.INWARD,
      contactId: '101',
      contactName: 'TechSupplies Inc.',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(), // 2 months ago
      items: [{ productId: '1', productName: 'Wireless Mouse', quantity: 50, price: 15 }],
      totalAmount: 750
    },
    {
      id: 'tx-2',
      type: TransactionType.OUTWARD,
      contactId: '201',
      contactName: 'John Doe',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
      items: [{ productId: '1', productName: 'Wireless Mouse', quantity: 2, price: 29.99 }],
      totalAmount: 59.98
    },
    {
      id: 'tx-3',
      type: TransactionType.OUTWARD,
      contactId: '202',
      contactName: 'Acme Corp',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      items: [
        { productId: '2', productName: 'Mechanical Keyboard', quantity: 5, price: 120 },
        { productId: '4', productName: 'Monitor Stand', quantity: 2, price: 55 }
      ],
      totalAmount: 710
    }
  ]
};

export const getAppData = (): AppData => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return INITIAL_DATA;
};

export const saveAppData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};