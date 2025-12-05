export enum ContactType {
  BUYER = 'BUYER',
  SELLER = 'SELLER'
}

export interface Contact {
  id: string;
  name: string;
  type: ContactType;
  email: string;
  phone: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  buyingPrice: number;
  sellingPrice: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // For Inward: Buying Price, For Outward: Selling Price
}

export enum TransactionType {
  INWARD = 'INWARD',
  OUTWARD = 'OUTWARD'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  contactId: string;
  contactName: string;
  date: string; // ISO String
  items: CartItem[];
  totalAmount: number;
}

export interface AppData {
  products: Product[];
  contacts: Contact[];
  transactions: Transaction[];
}