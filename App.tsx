import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ArrowDownCircle, ArrowUpCircle, Menu } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { InwardStock } from './components/InwardStock';
import { OutwardStock } from './components/OutwardStock';
import { getAppData, saveAppData } from './services/storageService';
import { AppData } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'inward' | 'outward'>('dashboard');
  const [data, setData] = useState<AppData>(getAppData());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    saveAppData(data);
  }, [data]);

  const handleUpdateData = (newData: AppData) => {
    setData(newData);
  };

  const NavItem = ({ view, icon: Icon, label }: { view: 'dashboard' | 'inward' | 'outward', icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-20">
        <h1 className="font-bold text-xl text-slate-800">InventoryFlow</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          <Menu />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-10 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <h1 className="text-2xl font-extrabold text-blue-600 hidden md:block mb-8">InventoryFlow</h1>
          <nav className="space-y-2">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="inward" icon={ArrowDownCircle} label="Inward Stock" />
            <NavItem view="outward" icon={ArrowUpCircle} label="Outward Stock" />
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-full p-6 border-t border-slate-100">
           <div className="text-xs text-slate-400">
             <p>Build v1.0.0</p>
             <p>© 2024 InventoryFlow</p>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 hidden md:block">
          <h2 className="text-3xl font-bold text-slate-800">
            {currentView === 'dashboard' && 'Business Overview'}
            {currentView === 'inward' && 'Manage Purchases'}
            {currentView === 'outward' && 'Manage Sales'}
          </h2>
          <p className="text-slate-500 mt-1">
            {currentView === 'dashboard' && 'Track your inventory, contacts, and performance.'}
            {currentView === 'inward' && 'Record incoming stock from suppliers.'}
            {currentView === 'outward' && 'Record outgoing stock to customers.'}
          </p>
        </header>

        <div className="transition-all duration-300">
          {currentView === 'dashboard' && (
            <Dashboard data={data} onUpdateData={handleUpdateData} />
          )}
          {currentView === 'inward' && (
            <InwardStock data={data} onUpdateData={handleUpdateData} />
          )}
          {currentView === 'outward' && (
            <OutwardStock data={data} onUpdateData={handleUpdateData} />
          )}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default App;