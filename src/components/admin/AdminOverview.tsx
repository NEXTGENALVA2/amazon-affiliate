import React from 'react';
import {
  Users,
  MousePointerClick,
  Plus,
  ArrowRight,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { Product } from '../../types';
import { store } from '../../services/store';
import { formatCurrency } from '../../utils/helpers';

interface AdminOverviewProps {
  products: Product[];
  onNavigate: (tab: 'overview' | 'products' | 'analytics' | 'socials' | 'pixels' | 'vercel') => void;
  onOpenAddProduct: () => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  products,
  onNavigate,
  onOpenAddProduct,
}) => {
  const todayAnalytics = store.getAnalytics('today');
  const monthAnalytics = store.getAnalytics('this_month');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-xs font-semibold">
            <span>Amazon Affiliate &amp; Ad Showcase Management</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Kefayaan Control Center
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Live visitor analytics, outbound Amazon Buy Now click tracking, and Meta/TikTok/Google ad pixel conversions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenAddProduct}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Product</span>
          </button>
          <button
            onClick={() => onNavigate('vercel')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <span>Vercel Connection Guide</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Today's Visitors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Today&apos;s Visitors</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono tabular-nums">
            {todayAnalytics.totalVisitors}
          </div>
          <div className="text-[11px] text-slate-500">
            {todayAnalytics.uniqueSessions} unique devices logged today
          </div>
        </div>

        {/* This Month's Visitors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Visitors</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-mono tabular-nums">
            {monthAnalytics.totalVisitors.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">
            Total active monthly site traffic
          </div>
        </div>

        {/* Total Outbound Amazon Clicks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Amazon Buy Now Clicks</span>
            <MousePointerClick className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono tabular-nums">
            {todayAnalytics.totalClicks.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">
            {monthAnalytics.totalClicks.toLocaleString()} total clicks recorded this month
          </div>
        </div>

      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Left Column: Quick Product Management */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Active Amazon Products</h3>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {products.slice(0, 4).map((p) => {
              const liveClicks = store.getProductClicks(p.id);
              return (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{p.title}</p>
                      <p className="text-[11px] text-slate-500">
                        {p.category} · <span className="font-mono text-slate-700 font-semibold">{formatCurrency(p.dealPrice)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono font-bold text-amber-600 tabular-nums">
                      {liveClicks} clicks
                    </span>
                    <a
                      href={p.amazonUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-slate-900"
                      title="Open Amazon URL"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
