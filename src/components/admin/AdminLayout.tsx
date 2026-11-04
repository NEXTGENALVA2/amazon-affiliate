import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Globe,
  LogOut,
  Settings,
  Plus,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { Product } from '../../types';
import { store } from '../../services/store';
import { AdminOverview } from './AdminOverview';
import { AdminProducts } from './AdminProducts';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminSocialAccounts } from './AdminSocialAccounts';
import { AdminVercelGuide } from './AdminVercelGuide';
import { AdminProductFormModal } from './AdminProductFormModal';
import { AdminPixelTracking } from './AdminPixelTracking';

interface AdminLayoutProps {
  onBackToStore: () => void;
  onLogout: () => void;
}

export type AdminTab = 'overview' | 'products' | 'analytics' | 'socials' | 'pixels' | 'vercel';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToStore, onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const loadData = () => {
    setProducts(store.getProducts());
  };

  useEffect(() => {
    loadData();
    const unsub = store.subscribe(loadData);
    return () => {
      unsub();
    };
  }, []);

  const handleSaveProduct = (prodData: any) => {
    store.saveProduct(prodData);
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-950 text-white border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
              <img
                src="/assets/aistudio/DP_af5fa802.png"
                alt="Kefayaan"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white truncate">Kefayaan</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono uppercase text-amber-400 font-semibold shrink-0">
                  Admin
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">Official Associate</p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <a
              href={store.getStoreSettings().amazonOfficialStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
              title="Amazon Official Store"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Amazon Store</span>
            </a>

            <button
              onClick={onBackToStore}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="View Public Store"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden md:inline">View Public Store</span>
              <span className="md:hidden hidden sm:inline">Store</span>
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip (Horizontal Touch Scroll with active styles) */}
        <div className="border-t border-slate-900 bg-slate-950/80">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center gap-1.5 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                activeTab === 'products'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products &amp; Videos</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                activeTab === 'analytics'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('socials')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                activeTab === 'socials'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Social Accounts</span>
            </button>

            <button
              onClick={() => setActiveTab('pixels')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                activeTab === 'pixels'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Ad Pixels</span>
            </button>

            <button
              onClick={() => setActiveTab('vercel')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                activeTab === 'vercel'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Vercel &amp; Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'overview' && (
          <AdminOverview
            products={products}
            onNavigate={(t) => setActiveTab(t)}
            onOpenAddProduct={() => setIsAddProductOpen(true)}
          />
        )}

        {activeTab === 'products' && (
          <AdminProducts products={products} onRefresh={loadData} />
        )}

        {activeTab === 'analytics' && <AdminAnalytics />}

        {activeTab === 'socials' && <AdminSocialAccounts />}

        {activeTab === 'pixels' && <AdminPixelTracking />}

        {activeTab === 'vercel' && <AdminVercelGuide />}
      </main>

      {/* Add Product Modal Shortcut */}
      <AdminProductFormModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSave={handleSaveProduct}
      />
    </div>
  );
};
