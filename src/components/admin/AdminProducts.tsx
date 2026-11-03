import React, { useState } from 'react';
import {
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Video,
  Play,
  MousePointerClick,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { AdminProductFormModal } from './AdminProductFormModal';
import { store } from '../../services/store';

interface AdminProductsProps {
  products: Product[];
  onRefresh: () => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ products, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      store.deleteProduct(id);
      onRefresh();
    }
  };

  const handleSave = (savedData: any) => {
    store.saveProduct(savedData);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Curated Amazon Product Catalog</h2>
          <p className="text-xs text-slate-500">
            Manage your affiliate items, custom video reviews, and direct Buy Now links
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search catalog by title or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-950"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-950"
        >
          <option value="all">All Departments</option>
          <option value="Cat Food & Pet Care">Cat Food & Pet Care</option>
          <option value="Gym & Sports Nutrition">Gym & Sports Nutrition</option>
          <option value="Tech & Smart Gadgets">Tech & Smart Gadgets</option>
          <option value="Home & Kitchen Gadgets">Home & Kitchen Gadgets</option>
          <option value="Home & Workstation">Home & Workstation</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Product</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Pricing</th>
                <th className="py-3 px-4 font-semibold">Video Review</th>
                <th className="py-3 px-4 font-semibold text-center">Amazon Clicks</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No products found. Click "Add New Product" to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Media & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="max-w-xs space-y-0.5">
                          <div className="font-bold text-slate-900 line-clamp-1">{prod.title}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>{prod.brand}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1 font-medium">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                              <span className="font-mono text-slate-700">{prod.rating !== undefined ? Number(prod.rating).toFixed(1) : '4.8'}</span>
                              <span className="text-slate-400 font-mono">({prod.reviewCount !== undefined ? Number(prod.reviewCount).toLocaleString() : '1,500'})</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {prod.category}
                    </td>

                    {/* Pricing */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="font-mono font-bold text-slate-950 tabular-nums">
                          {formatCurrency(prod.dealPrice)}
                        </div>
                        {prod.price > prod.dealPrice && (
                          <div className="text-[10px] text-slate-400 line-through font-mono tabular-nums">
                            {formatCurrency(prod.price)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Video Review Status */}
                    <td className="py-3 px-4">
                      {prod.videoType !== 'none' && prod.videoUrl ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-medium">
                          <Play className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                          <span className="capitalize">{prod.videoType}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No video</span>
                      )}
                    </td>

                    {/* Amazon Clicks */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs tabular-nums">
                        <MousePointerClick className="w-3 h-3" />
                        {store.getProductClicks(prod.id)}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={prod.amazonUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Open Amazon link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id, prod.title)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      <AdminProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        productToEdit={editingProduct}
      />
    </div>
  );
};
