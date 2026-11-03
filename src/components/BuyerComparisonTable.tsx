import React from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Star,
  Award,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/helpers';

interface BuyerComparisonTableProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onBuyNow: (product: Product, e: React.MouseEvent) => void;
}

export const BuyerComparisonTable: React.FC<BuyerComparisonTableProps> = ({
  products,
  onSelectProduct,
  onBuyNow,
}) => {
  // Curated US winners list
  const winners = [
    {
      award: 'Best Overall Cat Food',
      productId: 'prod-cat-food',
      testedMetric: 'Real Alaskan Salmon · 0% Grains · High Moisture Broth',
      idealFor: 'Indoor cats prone to hairballs or low hydration',
    },
    {
      award: 'Best Post-Workout Protein',
      productId: 'prod-gym-protein',
      testedMetric: '24g Isolate · 5.5g BCAAs · Instant Clump-Free Dissolve',
      idealFor: 'Lean muscle building & fast post-workout muscle repair',
    },
    {
      award: 'Best Smart Kitchen Appliance',
      productId: 'prod-kitchen-airfryer',
      testedMetric: 'Dual 5-Qt Baskets · Match Cook · 75% Less Fat',
      idealFor: 'Busy families cooking mains and sides together',
    },
    {
      award: 'Best Ultra-Wide Gaming Display',
      productId: 'prod-1',
      testedMetric: 'Dual QHD · 240Hz · Mini-LED 2,048 Dimming Zones',
      idealFor: 'Sim racing, flight simulators, and multi-window productivity',
    },
    {
      award: 'Best Noise-Canceling Audio',
      productId: 'prod-2',
      testedMetric: '8 ANC Microphones · 30-Hour Battery · Multipoint Connect',
      idealFor: 'Frequent flyers, commuters, and deep-focus work',
    },
  ];

  return (
    <section className="space-y-12">
      {/* Section 1: Comparison Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600">
              <Award className="w-4 h-4" />
              <span>Independent US Benchmark Matrix</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              2026 Amazon US Best Sellers Comparison
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Side-by-side lab results, Amazon customer satisfaction scores, and verified Prime deal prices across our top categories.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Updated Daily · US Verified Links</span>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="space-y-2">
          <p className="text-[11px] text-amber-700 sm:hidden flex items-center gap-1 font-semibold">
            <span>👉 Swipe table horizontally to see all specifications &amp; links</span>
          </p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[700px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Category Award</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Product &amp; Brand</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Lab Tested Highlight</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-center">Amazon Rating</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Prime Price</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-right">Direct Amazon Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {winners.map((win, idx) => {
                  const prod = products.find((p) => p.id === win.productId);
                  if (!prod) return null;
                  const discount = Math.round(((prod.price - prod.dealPrice) / prod.price) * 100);

                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      {/* Award Badge */}
                      <td className="py-4 px-4 align-middle">
                        <span className="font-extrabold text-slate-900 bg-amber-100/70 text-amber-950 px-2.5 py-1 rounded-md text-[11px] inline-block whitespace-nowrap">
                          {win.award}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 italic max-w-[150px]">
                          {win.idealFor}
                        </div>
                      </td>

                      {/* Product Name & Thumbnail */}
                      <td className="py-4 px-4 align-middle">
                        <div
                          onClick={() => onSelectProduct(prod)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                            <img
                              src={prod.image}
                              alt={prod.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="max-w-xs space-y-0.5">
                            <div className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                              {prod.title}
                            </div>
                            <div className="text-[11px] text-slate-500 font-semibold">{prod.brand}</div>
                          </div>
                        </div>
                      </td>

                      {/* Lab Metric */}
                      <td className="py-4 px-4 align-middle font-medium text-slate-700 max-w-xs">
                        <div className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug text-xs">{win.testedMetric}</span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-4 px-4 align-middle text-center">
                        <div className="inline-flex items-center gap-1 font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-mono tabular-nums">{prod.rating}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {prod.reviewCount.toLocaleString()} reviews
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 align-middle">
                        <div className="space-y-0.5">
                          <div className="font-mono font-extrabold text-slate-950 text-sm tabular-nums">
                            {formatCurrency(prod.dealPrice)}
                          </div>
                          {discount > 0 && (
                            <div className="text-[10px] text-emerald-600 font-bold">
                              Save {discount}% on Amazon
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Buy on Amazon CTA */}
                      <td className="py-4 px-4 align-middle text-right">
                        <button
                          onClick={(e) => onBuyNow(prod, e)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <span>Buy on Amazon</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 2: US Testing Methodology & Transparency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Real Retail Amazon US Purchasing
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We purchase every unit anonymously through Amazon Prime just like any US customer. We never accept cherry-picked manufacturer freebies or sponsored editorial placements.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Nutritional & Hardware Lab Checks
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our pet food tests inspect real protein percentages vs filler carrageenan; our gym protein tests verify banned substance compliance; our electronics undergo 100+ hour stress tests.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Zero Extra Cost & Official Prime Returns
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            When you click "Buy on Amazon", your checkout is processed directly by Amazon with all your standard Prime delivery benefits, manufacturer warranties, and hassle-free 30-day returns.
          </p>
        </div>
      </div>

      {/* Section 3: US Shopper FAQ Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Got Questions?
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950">
            Frequently Asked Questions for Amazon Shoppers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">
              Why is there no "Add to Cart" button on this site?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              We operate exclusively as a certified Amazon Associate curation platform. Instead of charging you markup or storing inventory, clicking <strong>"Buy on Amazon"</strong> directs you straight to the verified official Amazon storefront so you can use your existing Amazon account, 1-Click Buy, and Prime membership!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">
              How does the price compare to buying on Amazon directly?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              The prices are identical. In fact, our team constantly tracks Lightning Deals, Prime Coupons, and historical price drops so you can grab products when they hit their lowest 30-day price on Amazon.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">
              Are these products genuine with official manufacturer warranty?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Yes. All our links lead to the brand’s official flagship Amazon store (e.g. Optimum Nutrition, Ninja Official, Samsung Store, Herman Miller). This guarantees 100% genuine product authenticity with full factory warranty.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">
              Can I ask a specialist before purchasing?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Yes! Click the <strong>"Live Chat & WhatsApp"</strong> button on the bottom-right corner. You can ask our staff questions directly on the website, or connect immediately through WhatsApp, Instagram, or Messenger.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
