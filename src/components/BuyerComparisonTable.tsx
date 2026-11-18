import React from 'react';
import { ExternalLink, Star } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/helpers';

interface BuyerComparisonTableProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onBuyNow: (product: Product, e: React.MouseEvent) => void;
  retailerName: string;
  purchaseButtonLabel: string;
  shopName: string;
}

export const BuyerComparisonTable: React.FC<BuyerComparisonTableProps> = ({
  products,
  onSelectProduct,
  onBuyNow,
  retailerName,
  purchaseButtonLabel,
  shopName,
}) => (
  <section className="space-y-8">
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-8">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Product overview</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
          Compare products at a glance
        </h2>
        <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
          Product details and listed prices can change. Check the retailer's page for current information.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full min-w-[640px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <th className="px-4 py-3 font-bold">Category</th>
              <th className="px-4 py-3 font-bold">Product</th>
              <th className="px-4 py-3 text-center font-bold">Customer rating</th>
              <th className="px-4 py-3 font-bold">Listed price</th>
              <th className="px-4 py-3 text-right font-bold">{retailerName}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 text-slate-600">{product.category}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onSelectProduct(product)}
                    className="text-left font-semibold text-slate-900 hover:text-amber-700"
                  >
                    {product.title}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  {product.rating > 0 ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {Number(product.rating).toFixed(1)}
                      {product.reviewCount > 0 && (
                        <span className="text-slate-400">({Number(product.reviewCount).toLocaleString()})</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-slate-400">Not provided</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono font-bold text-slate-900">{formatCurrency(product.dealPrice)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={(event) => onBuyNow(product, event)}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-amber-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-amber-500"
                  >
                    {product.productButtonLabel?.trim() || purchaseButtonLabel}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-900">How do purchases work?</h3>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          Kefayaan links to product pages on {retailerName}. Orders, payment, shipping, and returns are handled by the retailer.
        </p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-900">Are prices guaranteed?</h3>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          No. Prices and availability may change. Confirm the latest details on {retailerName} before ordering.
        </p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-900">Affiliate disclosure</h3>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          {retailerName.toLowerCase() === 'amazon'
            ? `As an Amazon Associate, ${shopName} earns from qualifying purchases.`
            : `${shopName} may earn a commission from qualifying purchases through ${retailerName} links.`}
        </p>
      </article>
    </div>
  </section>
);
