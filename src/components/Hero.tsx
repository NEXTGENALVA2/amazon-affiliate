import React from 'react';
import {
  Search,
  CheckCircle2,
  Play,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Star,
  Flame,
  Award,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/helpers';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: string[];
  trendingProduct?: Product;
  onOpenFeaturedVideo: (product?: Product) => void;
  onBuyFeatured: (product: Product, e: React.MouseEvent) => void;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
  trendingProduct,
  onOpenFeaturedVideo,
  onBuyFeatured,
}) => {
  const spotlight = trendingProduct || {
    id: 'prod-cat-food',
    title: "Nature's Harvest Grain-Free Wild Salmon & Organic Chicken Wet Cat Food (24 Cans)",
    brand: "Nature's Harvest",
    category: 'Cat Food & Pet Care',
    price: 46.99,
    dealPrice: 34.99,
    amazonUrl: 'https://www.amazon.com/dp/B084G26X19?tag=auragear-20',
    image: '/src/assets/images/premium_cat_food_1793635553336.jpg',
    rating: 4.9,
    reviewCount: 14920,
    badge: "Amazon's Choice",
  } as Product;

  const discountPercent = Math.round(
    ((spotlight.price - spotlight.dealPrice) / spotlight.price) * 100
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white border-b border-slate-800">
      {/* Live US Amazon Trending Deals Ticker */}
      <div className="bg-amber-400 text-slate-950 text-xs py-2 px-4 border-b border-amber-300 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-extrabold uppercase tracking-wider text-[11px] bg-slate-950 text-white px-2 py-0.5 rounded">
              <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
              Amazon US Movers & Shakers
            </span>
            <span className="text-xs font-semibold">
              Trending Today: Up to 40% Off Cat Food & Pet Essentials · Optimum Nutrition Whey Protein · Ninja Dual Air Fryer · OLED Monitors
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px] font-bold text-slate-900">
            <span>Free 2-Day Prime Shipping Verified</span>
            <span>·</span>
            <span>Austin & Seattle Testing Labs</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14">
        {/* Main 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: US Media Brand Headline & Search */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-amber-300 font-semibold backdrop-blur-sm">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kefayaan (کفایان) · Verified Amazon Associate Partner</span>
                </div>
                <a
                  href="https://link.amazon/B0dbjUEFY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-sm"
                >
                  <span>Amazon Official Storefront</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12] text-balance">
                Verified Amazon Best Sellers, Curated by Kefayaan.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Skip the sponsored noise. We benchmark Amazon US’s top-selling pet food, gym nutrition, smart kitchen gadgets, and tech electronics with hands-on tests, full variants, and 1-click official checkout.
              </p>
            </div>


            {/* Quick Department Selector Pills */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Explore Verified US Amazon Departments:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onSelectCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white border border-white/10'
                    }`}
                  >
                    {cat === 'All' ? 'All Best Sellers' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Search Bar */}
            <div className="relative max-w-xl pt-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Amazon US bestsellers (e.g. Cat Food, Whey Protein, Air Fryer, Monitor)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-24 py-3.5 text-sm bg-white/10 border border-white/20 rounded-xl shadow-inner text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-slate-900 transition-all backdrop-blur-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick trending search suggestions */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
              <span className="text-[11px] font-medium text-slate-500">Popular Searches:</span>
              <button
                onClick={() => onSearchChange('Cat Food')}
                className="hover:text-amber-400 underline decoration-slate-600 underline-offset-2"
              >
                Salmon Cat Food
              </button>
              <span>·</span>
              <button
                onClick={() => onSearchChange('Protein')}
                className="hover:text-amber-400 underline decoration-slate-600 underline-offset-2"
              >
                Whey Protein Isolate
              </button>
              <span>·</span>
              <button
                onClick={() => onSearchChange('Air Fryer')}
                className="hover:text-amber-400 underline decoration-slate-600 underline-offset-2"
              >
                Dual Air Fryer
              </button>
              <span>·</span>
              <button
                onClick={() => onSearchChange('Headphones')}
                className="hover:text-amber-400 underline decoration-slate-600 underline-offset-2"
              >
                Noise-Canceling
              </button>
            </div>
          </div>

          {/* Right Column: "Today's #1 Spotlight Amazon Deal" Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md p-5 shadow-2xl space-y-4">
              {/* Card Header Badge */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  Today's Top Amazon US Deal
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Verified 2 Hours Ago</span>
              </div>

              {/* Product Media */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-white/10 group">
                <img
                  src={spotlight.image}
                  alt={spotlight.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end p-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded">
                      {spotlight.category}
                    </span>
                    <h3 className="text-sm font-bold text-white line-clamp-1">
                      {spotlight.title}
                    </h3>
                  </div>
                </div>

                {/* Video Play Button */}
                <button
                  onClick={() => onOpenFeaturedVideo(spotlight)}
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shadow-xl transition-transform hover:scale-110 cursor-pointer"
                  aria-label="Play video review"
                >
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                </button>
              </div>

              {/* Rating & Pricing Row */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
                    <span className="font-mono">{spotlight.rating}</span>
                    <span className="text-slate-400 font-normal">
                      ({spotlight.reviewCount.toLocaleString()} Amazon ratings)
                    </span>
                  </div>
                  <span className="text-emerald-400 font-bold text-[11px] bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    In Stock &amp; Prime
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pt-2 border-t border-white/10">
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
                        {formatCurrency(spotlight.dealPrice)}
                      </span>
                      {spotlight.price > spotlight.dealPrice && (
                        <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                          {formatCurrency(spotlight.price)}
                        </span>
                      )}
                    </div>
                    {discountPercent > 0 && (
                      <span className="text-[11px] font-bold text-emerald-400 block">
                        Save {discountPercent}% instant Amazon discount
                      </span>
                    )}
                  </div>

                  {/* Direct Buy Now Button */}
                  <button
                    onClick={(e) => onBuyFeatured(spotlight, e)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-transform hover:scale-102 cursor-pointer active:scale-95"
                  >
                    <span>Buy on Amazon</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Editorial Trust Strip Below Split */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 sm:bg-transparent sm:border-0">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">40+ Hours Lab Testing</div>
              <div className="text-[11px] text-slate-400">Nutritional &amp; hardware checks</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 sm:bg-transparent sm:border-0">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">Zero Sponsored Bias</div>
              <div className="text-[11px] text-slate-400">100% editorially independent</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 sm:bg-transparent sm:border-0">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">Live Amazon Price Sync</div>
              <div className="text-[11px] text-slate-400">Updated hourly for deal alerts</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 sm:bg-transparent sm:border-0">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">Official Prime Benefits</div>
              <div className="text-[11px] text-slate-400">Full 30-day Amazon returns</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
