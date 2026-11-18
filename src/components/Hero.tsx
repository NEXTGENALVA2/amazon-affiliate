import React from 'react';
import {
  CheckCircle2,
  Play,
  Star,
  ExternalLink,
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrency, getYouTubeEmbedUrl } from '../utils/helpers';

interface HeroProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: { name: string; count: number }[];
  trendingProduct?: Product;
  showSpotlight: boolean;
  onOpenFeaturedVideo: (product?: Product) => void;
  onBuyFeatured: (product: Product, e: React.MouseEvent) => void;
  retailerName: string;
  purchaseButtonLabel: string;
}

export const Hero: React.FC<HeroProps> = ({
  selectedCategory,
  onSelectCategory,
  categories,
  trendingProduct,
  showSpotlight,
  onOpenFeaturedVideo,
  onBuyFeatured,
  retailerName,
  purchaseButtonLabel,
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
    badge: '',
  } as Product;

  const discountPercent = Math.round(
    ((spotlight.price - spotlight.dealPrice) / spotlight.price) * 100
  );
  const youtubeEmbedUrl = spotlight.videoUrl ? getYouTubeEmbedUrl(spotlight.videoUrl) : null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white border-b border-slate-800">
      {/* Store introduction */}
      <div className="bg-amber-400 text-slate-950 text-xs py-2 px-4 border-b border-amber-300 font-medium">
        <div className="max-w-7xl mx-auto text-center font-semibold">
          Find useful products, compare details, and shop with the retailer you choose.
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-10 sm:pb-14">
        {/* Main 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Store introduction */}
          <div className={`${showSpotlight ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6`}>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-amber-300 font-semibold backdrop-blur-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kefayaan · Thoughtful product picks</span>
                </div>
              </div>

              <h1 className="text-[1.8rem] sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12] text-balance">
                Discover products that fit your everyday needs.
              </h1>

              <p className="text-sm sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Browse by category, compare the details that matter, and continue to {retailerName} to check current price and availability.
              </p>
            </div>
            {/* Category Selector */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Browse categories
              </span>
              <div id="departments" className="flex flex-wrap items-center gap-2">
                {categories.map(({ name, count }) => (
                  <button
                    key={name}
                    onClick={() => onSelectCategory(name)}
                    aria-pressed={selectedCategory === name}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === name
                        ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white border border-white/10'
                    }`}
                  >
                    {name === 'All' ? 'All categories' : name}
                    <span className="ml-1.5 opacity-70">({count})</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Featured product */}
          {showSpotlight && <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md p-5 shadow-2xl space-y-4">
              {/* Card Header Badge */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                  Featured product
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{retailerName}</span>
              </div>

              {/* Product Media */}
              <div className="relative mx-auto aspect-[9/16] w-full max-w-sm rounded-xl overflow-hidden bg-slate-950 border border-white/10 group">
                {youtubeEmbedUrl ? (
                  <iframe
                    src={`${youtubeEmbedUrl}?controls=0&modestbranding=1&rel=0`}
                    title={`Video review for ${spotlight.title}`}
                    className="pointer-events-none absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : (
                  <img
                    src={spotlight.image}
                    alt={spotlight.title}
                    className="h-full w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                )}
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
                      ({spotlight.reviewCount.toLocaleString()} ratings)
                    </span>
                  </div>
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
                        Save {discountPercent}% compared with the listed price
                      </span>
                    )}
                  </div>

                  {/* Direct Buy Now Button */}
                  <button
                    onClick={(e) => onBuyFeatured(spotlight, e)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-transform hover:scale-102 cursor-pointer active:scale-95"
                  >
                    <span>{spotlight.productButtonLabel?.trim() || purchaseButtonLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>}
        </div>

        {/* Store information */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 sm:bg-transparent sm:border-0">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">Clear product details</div>
              <div className="text-[11px] text-slate-400">Review key features before you shop</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 sm:bg-transparent sm:border-0">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <ExternalLink className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">Retailer checkout</div>
              <div className="text-[11px] text-slate-400">Purchases are completed on {retailerName}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 sm:bg-transparent sm:border-0">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">Price transparency</div>
              <div className="text-[11px] text-slate-400">Confirm current prices with the retailer</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 sm:bg-transparent sm:border-0">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">Helpful categories</div>
              <div className="text-[11px] text-slate-400">Browse products by interest</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
