import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Users, Package, TrendingUp, AlertCircle, Plus, BrainCircuit 
} from 'lucide-react';
import { AppData, Product, Contact, ContactType, Transaction, TransactionType } from '../types';
import { analyzeInventory } from '../services/geminiService';

interface DashboardProps {
  data: AppData;
  onUpdateData: (newData: AppData) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onUpdateData }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'contacts'>('overview');
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
  const [newContact, setNewContact] = useState<Partial<Contact>>({ type: ContactType.BUYER });

  // Compute Analytics
  const lowStockProducts = data.products.filter(p => p.currentStock <= p.minStock);
  
  // Sales by Product for Last 3 Months
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const salesDataMap = new Map<string, number>();
  data.transactions
    .filter(t => t.type === TransactionType.OUTWARD && new Date(t.date) >= threeMonthsAgo)
    .forEach(t => {
      t.items.forEach(item => {
        const current = salesDataMap.get(item.productName) || 0;
        salesDataMap.set(item.productName, current + item.quantity);
      });
    });

  const chartData = Array.from(salesDataMap.entries())
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales) // Sort by most sold
    .slice(0, 5); // Top 5

  const generateInsights = async () => {
    setLoadingAi(true);
    const result = await analyzeInventory(data);
    setAiInsight(result);
    setLoadingAi(false);
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.buyingPrice || !newProduct.sellingPrice) return;
    const product: Product = {
      id: crypto.randomUUID(),
      name: newProduct.name,
      sku: newProduct.sku,
      category: newProduct.category || 'General',
      currentStock: newProduct.currentStock || 0,
      minStock: newProduct.minStock || 5,
      buyingPrice: Number(newProduct.buyingPrice),
      sellingPrice: Number(newProduct.sellingPrice),
    };
    onUpdateData({ ...data, products: [...data.products, product] });
    setNewProduct({});
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.email) return;
    const contact: Contact = {
      id: crypto.randomUUID(),
      name: newContact.name,
      type: newContact.type || ContactType.BUYER,
      email: newContact.email,
      phone: newContact.phone || '',
    };
    onUpdateData({ ...data, contacts: [...data.contacts, contact] });
    setNewContact({ type: ContactType.BUYER });
  };

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="flex space-x-4 border-b border-slate-200 pb-2">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Overview & Analytics
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Manage Products
        </button>
        <button 
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${activeTab === 'contacts' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Manage Contacts
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* KPI Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Products</p>
                  <h3 className="text-2xl font-bold text-slate-800">{data.products.length}</h3>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Package size={20} />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Low Stock Alerts</p>
                  <h3 className="text-2xl font-bold text-red-600">{lowStockProducts.length}</h3>
                </div>
                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <AlertCircle size={20} />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Contacts</p>
                  <h3 className="text-2xl font-bold text-slate-800">{data.contacts.length}</h3>
                </div>
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <Users size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <TrendingUp className="mr-2" size={20} />
              Top Selling Products (Last 3 Months)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Units Sold" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights Section */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl shadow-sm border border-indigo-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-indigo-900 flex items-center">
                <BrainCircuit className="mr-2" size={20} />
                AI Business Insights
              </h3>
              <button 
                onClick={generateInsights}
                disabled={loadingAi}
                className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700 disabled:opacity-50"
              >
                {loadingAi ? 'Analyzing...' : 'Generate Analysis'}
              </button>
            </div>
            <div className="text-sm text-indigo-800 leading-relaxed min-h-[150px]">
              {aiInsight ? (
                <div className="prose prose-sm prose-indigo whitespace-pre-line">
                  {aiInsight}
                </div>
              ) : (
                <p className="italic opacity-60">Click "Generate Analysis" to get a smart summary of your stock levels and sales trends powered by Gemini.</p>
              )}
            </div>
          </div>
          
          {/* Order History Preview */}
          <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Order History</h3>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Contact</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.slice(0, 5).map(tx => (
                      <tr key={tx.id} className="bg-white border-b hover:bg-slate-50">
                        <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${tx.type === TransactionType.INWARD ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">{tx.contactName}</td>
                        <td className="px-6 py-4">${tx.totalAmount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className="text-green-600 flex items-center gap-1 text-xs">Completed</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <Plus size={18} className="mr-2" />
              Add New Product
            </h3>
            <div className="space-y-4">
              <input 
                type="text" placeholder="Product Name" 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newProduct.name || ''} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              />
              <input 
                type="text" placeholder="SKU" 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newProduct.sku || ''} onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
              />
              <input 
                type="text" placeholder="Category" 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newProduct.category || ''} onChange={e => setNewProduct({...newProduct, category: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="number" placeholder="Buy Price" 
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProduct.buyingPrice || ''} onChange={e => setNewProduct({...newProduct, buyingPrice: parseFloat(e.target.value)})}
                />
                <input 
                  type="number" placeholder="Sell Price" 
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newProduct.sellingPrice || ''} onChange={e => setNewProduct({...newProduct, sellingPrice: parseFloat(e.target.value)})}
                />
              </div>
              <input 
                type="number" placeholder="Initial Stock" 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newProduct.currentStock || ''} onChange={e => setNewProduct({...newProduct, currentStock: parseInt(e.target.value)})}
              />
               <input 
                type="number" placeholder="Min Stock Level" 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newProduct.minStock || ''} onChange={e => setNewProduct({...newProduct, minStock: parseInt(e.target.value)})}
              />
              <button 
                onClick={handleAddProduct}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Create Product
              </button>
            </div>
          </div>
          
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Product Catalog</h3>
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Buy Price</th>
                    <th className="px-4 py-3">Sell Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                      <td className="px-4 py-3">{p.sku}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.currentStock <= p.minStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {p.currentStock}
                        </span>
                      </td>
                      <td className="px-4 py-3">${p.buyingPrice}</td>
                      <td className="px-4 py-3">${p.sellingPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <Plus size={18} className="mr-2" />
              Add New Contact
            </h3>
            <div className="space-y-4">
              <input 
                type="text" placeholder="Full Name / Company" 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newContact.name || ''} onChange={e => setNewContact({...newContact, name: e.target.value})}
              />
              <select 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newContact.type} onChange={e => setNewContact({...newContact, type: e.target.value as ContactType})}
              >
                <option value={ContactType.BUYER}>Buyer</option>
                <option value={ContactType.SELLER}>Seller</option>
              </select>
              <input 
                type="email" placeholder="Email Address" 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newContact.email || ''} onChange={e => setNewContact({...newContact, email: e.target.value})}
              />
              <input 
                type="text" placeholder="Phone Number" 
                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newContact.phone || ''} onChange={e => setNewContact({...newContact, phone: e.target.value})}
              />
              <button 
                onClick={handleAddContact}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Create Contact
              </button>
            </div>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Contact Directory</h3>
             <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.contacts.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                      <td className="px-4 py-3">
                         <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.type === ContactType.SELLER ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {c.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">{c.email}</td>
                      <td className="px-4 py-3">{c.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};