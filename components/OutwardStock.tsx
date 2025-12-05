import React, { useState } from 'react';
import { AppData, CartItem, ContactType, Transaction, TransactionType } from '../types';
import { ShoppingBag, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

interface OutwardStockProps {
  data: AppData;
  onUpdateData: (newData: AppData) => void;
}

export const OutwardStock: React.FC<OutwardStockProps> = ({ data, onUpdateData }) => {
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const buyers = data.contacts.filter(c => c.type === ContactType.BUYER);
  
  const addToCart = () => {
    setErrorMsg('');
    if (!selectedProductId || quantity <= 0) return;
    const product = data.products.find(p => p.id === selectedProductId);
    if (!product) return;

    // Check availability (Product Stock - Amount already in cart)
    const inCart = cart.find(c => c.productId === product.id)?.quantity || 0;
    if (product.currentStock < (quantity + inCart)) {
      setErrorMsg(`Insufficient stock! Only ${product.currentStock - inCart} remaining.`);
      return;
    }

    const existingItem = cart.find(item => item.productId === selectedProductId);
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === selectedProductId 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        price: product.sellingPrice // Outward uses selling price
      }]);
    }
    setQuantity(1);
    setSelectedProductId('');
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.productId !== id));
  };

  const completeOrder = () => {
    if (!selectedBuyerId || cart.length === 0) return;
    
    const buyer = data.contacts.find(c => c.id === selectedBuyerId);
    if(!buyer) return;

    // 1. Create Transaction
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type: TransactionType.OUTWARD,
      contactId: buyer.id,
      contactName: buyer.name,
      date: new Date().toISOString(),
      items: [...cart],
      totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    // 2. Update Stock
    const updatedProducts = data.products.map(p => {
      const cartItem = cart.find(c => c.productId === p.id);
      if (cartItem) {
        return { ...p, currentStock: p.currentStock - cartItem.quantity };
      }
      return p;
    });

    onUpdateData({
      ...data,
      products: updatedProducts,
      transactions: [transaction, ...data.transactions]
    });

    setCart([]);
    setSelectedBuyerId('');
    setSuccessMsg(`Stock Outward to ${buyer.name} completed successfully!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
          <ShoppingBag className="mr-3 text-blue-600" />
          Outward Stock (Sales)
        </h2>
        
        {successMsg && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
            <CheckCircle className="mr-2" size={20} />
            {successMsg}
          </div>
        )}
        
        {errorMsg && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
            <AlertTriangle className="mr-2" size={20} />
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Buyer</label>
            <select 
              className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedBuyerId}
              onChange={e => setSelectedBuyerId(e.target.value)}
            >
              <option value="">-- Choose Buyer --</option>
              {buyers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
             <h3 className="font-semibold text-slate-700 mb-3">Add Products to Sale</h3>
             <div className="flex gap-2 mb-2">
                <select 
                  className="flex-1 p-2 border border-slate-200 rounded-lg text-sm"
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                >
                  <option value="">Select Product</option>
                  {data.products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.currentStock === 0}>
                       {p.name} (Stock: {p.currentStock}) - ${p.sellingPrice}
                    </option>
                  ))}
                </select>
                <input 
                  type="number" min="1"
                  className="w-20 p-2 border border-slate-200 rounded-lg text-sm"
                  value={quantity}
                  onChange={e => setQuantity(parseInt(e.target.value))}
                />
             </div>
             <button 
               onClick={addToCart}
               className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex justify-center items-center"
             >
               <Plus size={16} className="mr-2" /> Add to Sale
             </button>
          </div>
        </div>

        {/* Cart Review */}
        {cart.length > 0 && (
          <div className="border-t border-slate-100 pt-6">
            <h3 className="font-bold text-slate-800 mb-4">Sale Summary</h3>
            <div className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-right">Price</th>
                    <th className="px-4 py-2 text-right">Qty</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {cart.map(item => (
                    <tr key={item.productId}>
                      <td className="px-4 py-3 font-medium">{item.productName}</td>
                      <td className="px-4 py-3 text-right">${item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-bold">${(item.price * item.quantity).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeFromCart(item.productId)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold text-slate-800">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right">Grand Total:</td>
                    <td className="px-4 py-3 text-right">${cartTotal.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={completeOrder}
                disabled={!selectedBuyerId}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all"
              >
                Confirm Sale
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};