import {
  Product,
  ProductVariant,
  StoreSettings,
  OutboundClick,
  SocialChannel,
  PixelSettings,
  PixelEventLog,
} from '../types';
import { hasSupabase, supabase } from './supabase';
import { recordAnalyticsEvent } from './analytics';
import { loginAdmin as loginAdminRequest, logoutAdmin as logoutAdminRequest, verifyAdminSession } from './adminAuth';
import {
  getPublicSocialSettings,
  getPublicStoreSettings,
  savePublicSocialSettings,
  savePublicStoreSettings,
} from './siteSettings';
import monitorImg from '../assets/images/curved_gaming_monitor_1793432526940.jpg';
import headphonesImg from '../assets/images/wireless_anc_headphones_1793432526819.jpg';
import keyboardImg from '../assets/images/mechanical_keyboard_1793432527212.jpg';
import chairImg from '../assets/images/ergonomic_smart_chair_1793432527087.jpg';
import catFoodImg from '../assets/images/premium_cat_food_1793635553336.jpg';
import gymProteinImg from '../assets/images/gym_whey_protein_1793635553376.jpg';
import airFryerImg from '../assets/images/smart_air_fryer_1793635553057.jpg';

const MONITOR_IMG = monitorImg;
const HEADPHONES_IMG = headphonesImg;
const KEYBOARD_IMG = keyboardImg;
const CHAIR_IMG = chairImg;
const CAT_FOOD_IMG = catFoodImg;
const GYM_PROTEIN_IMG = gymProteinImg;
const AIR_FRYER_IMG = airFryerImg;
const DEFAULT_LOGO_URL = '/assets/brand/kefayaan-logo.jpg';
const LEGACY_LOGO_URL = '/assets/aistudio/DP_af5fa802.png';

const STORAGE_KEYS = {
  PRODUCTS: 'auragear_products_v2',
  SOCIAL_SETTINGS: 'auragear_social_settings_v1',
  STORE_SETTINGS: 'kefayaan_store_settings_v1',
  PIXEL_SETTINGS: 'kefayaan_pixel_settings_v1',
  PIXEL_LOGS: 'kefayaan_pixel_logs_v1',
};

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  shopName: 'Kefayaan',
  retailerName: 'Amazon',
  purchaseButtonLabel: 'Buy on Amazon',
  socialPreviewImageUrl: 'https://www.kefayaan.com/assets/social/kefayaan-share.jpg',
  tagline: 'Curated products and helpful buying guides',
  logoUrl: DEFAULT_LOGO_URL,
  amazonOfficialStoreUrl: 'https://link.amazon/B0dbjUEFY',
  defaultAffiliateTag: 'kefayaan-20',
  heroHeadline: 'Thoughtfully selected products, clearly presented.',
  heroSubtitle: 'Compare useful details, then visit the retailer for current price and availability.',
};

const DEFAULT_PIXEL_SETTINGS: PixelSettings = {
  facebookPixelId: '',
  facebookEnabled: true,
  tiktokPixelId: '',
  tiktokEnabled: true,
  googleTagId: '',
  googleEnabled: true,
  pinterestTagId: '2613147349496',
  pinterestEnabled: true,
  trackAsOrder: true,
  trackInitiateCheckout: true,
};

const DEFAULT_SOCIAL_SETTINGS: import('../types').SocialSettings = {
  whatsappNumber: '+8801873785288',
  facebookPageUsername: 'kefayaanofficial',
  instagramUsername: 'kefayaan_official',
  tiktokUsername: 'kefayaan',
  twitterUsername: 'kefayaan',
  visibleChannels: ['whatsapp', 'instagram', 'facebook', 'tiktok', 'twitter'],
  customLinks: [],
};

// Initial Seed Products
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-cat-food',
    title: "Nature's Harvest Grain-Free Wild Salmon & Organic Chicken Wet Cat Food (24 Cans)",
    slug: 'natures-harvest-grain-free-salmon-cat-food',
    brand: "Nature's Harvest",
    category: 'Cat Food & Pet Care',
    price: 46.99,
    dealPrice: 34.99,
    amazonUrl: 'https://link.amazon/B0dbjUEFY',
    affiliateTag: 'kefayaan-20',
    image: CAT_FOOD_IMG,
    gallery: [CAT_FOOD_IMG],
    variants: [
      {
        id: 'var-cat-24-3oz',
        name: '24 Cans (3 oz) - Wild Salmon & Chicken',
        optionType: 'Size & Flavor',
        price: 46.99,
        dealPrice: 34.99,
        amazonUrl: 'https://link.amazon/B0dbjUEFY',
        inStock: true,
      },
      {
        id: 'var-cat-24-5oz',
        name: '24 Cans (5.5 oz) - Wild Salmon Large Cans',
        optionType: 'Size & Flavor',
        price: 59.99,
        dealPrice: 48.99,
        amazonUrl: 'https://link.amazon/B0dbjUEFY',
        inStock: true,
      },
      {
        id: 'var-cat-12-12oz',
        name: '12 Cans (12.5 oz) - Multi-Protein Feast',
        optionType: 'Size & Flavor',
        price: 49.99,
        dealPrice: 39.99,
        amazonUrl: 'https://link.amazon/B0dbjUEFY',
        inStock: true,
      },
    ],
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=kYJv6uS8Vnk',
    rating: 4.9,
    reviewCount: 14920,

    features: [
      '#1 Ingredient: Real wild-caught Alaskan salmon & USDA organic chicken',
      'Grain-free formula with zero corn, wheat, soy, or artificial carrageenan',
      'Infused with Omega-3 & Omega-6 fatty acids for a silky coat and healthy joints',
      'High moisture broth formulation to support feline urinary tract hydration',
      'Review sourcing and manufacturing details on the retailer product page'
    ],
    description: 'A wet cat food option featuring salmon and chicken. Check the retailer listing for current ingredients, package details, and feeding guidance.',
    badge: "Amazon's Choice",
    inStock: true,
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-11-02T14:20:00Z',
  },
  {
    id: 'prod-gym-protein',
    title: 'Optimum Nutrition Gold Standard 100% Whey Protein Isolate (5 lbs, Vanilla Bean)',
    slug: 'optimum-nutrition-gold-standard-whey-protein',
    brand: 'Optimum Nutrition',
    category: 'Gym & Sports Nutrition',
    price: 84.99,
    dealPrice: 67.95,
    amazonUrl: 'https://link.amazon/B0dbjUEFY',
    affiliateTag: 'kefayaan-20',
    image: GYM_PROTEIN_IMG,
    gallery: [GYM_PROTEIN_IMG],
    variants: [
      {
        id: 'var-whey-5lb-vanilla',
        name: '5 lbs - Vanilla Bean',
        optionType: 'Weight & Flavor',
        price: 84.99,
        dealPrice: 67.95,
        amazonUrl: 'https://link.amazon/B0dbjUEFY',
        inStock: true,
      },
      {
        id: 'var-whey-5lb-choc',
        name: '5 lbs - Double Rich Chocolate',
        optionType: 'Weight & Flavor',
        price: 84.99,
        dealPrice: 67.95,
        amazonUrl: 'https://link.amazon/B0dbjUEFY',
        inStock: true,
      },
      {
        id: 'var-whey-2lb-straw',
        name: '2 lbs - Delicious Strawberry',
        optionType: 'Weight & Flavor',
        price: 44.99,
        dealPrice: 36.99,
        amazonUrl: 'https://link.amazon/B0dbjUEFY',
        inStock: true,
      },
      {
        id: 'var-whey-10lb-choc',
        name: '10 lbs Bag - Extreme Milk Chocolate',
        optionType: 'Weight & Flavor',
        price: 159.99,
        dealPrice: 129.99,
        amazonUrl: 'https://link.amazon/B0dbjUEFY',
        inStock: true,
      },
    ],
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=FjC3L4s80pY',
    rating: 4.8,
    reviewCount: 52140,
    features: [
      '24 grams of pure whey protein isolate per scoop to fuel lean muscle growth',
      '5.5g naturally occurring BCAAs and 11g of naturally occurring essential amino acids',
      'Instantized micro-filtered powder mixes effortlessly in shaker with zero clumps',
      'Informed Choice certified — tested for banned substances',
      'Low sugar (1g) and low carb (3g) keto-friendly nutritional profile'
    ],
    description: 'The world’s most trusted post-workout supplement. Gold Standard 100% Whey uses primary Whey Protein Isolates to maximize absorption speed, muscle recovery, and workout endurance.',
    badge: '',
    inStock: true,
    createdAt: '2026-10-22T09:00:00Z',
    updatedAt: '2026-11-02T15:10:00Z',
  },
  {
    id: 'prod-kitchen-airfryer',
    title: 'Ninja Foodi XL DualZone 10-Qt 2-Basket Digital Smart Air Fryer with Match Cook',
    slug: 'ninja-foodi-xl-dualzone-smart-air-fryer',
    brand: 'Ninja',
    category: 'Home & Kitchen Gadgets',
    price: 229.99,
    dealPrice: 179.99,
    amazonUrl: 'https://link.amazon/B0dbjUEFY',
    affiliateTag: 'kefayaan-20',
    image: AIR_FRYER_IMG,
    gallery: [AIR_FRYER_IMG],
    variants: [
      {
        id: 'var-ninja-10qt-blk',
        name: '10-Qt DualZone (Matte Black)',
        optionType: 'Capacity & Finish',
        price: 229.99,
        dealPrice: 179.99,
        amazonUrl: 'https://link.amazon/B0dbjUEFY',
        inStock: true,
      },
      {
        id: 'var-ninja-8qt-ss',
        name: '8-Qt DualZone (Stainless Steel)',
        optionType: 'Capacity & Finish',
        price: 199.99,
        dealPrice: 159.99,
        amazonUrl: 'https://link.amazon/B0dbjUEFY',
        inStock: true,
      },
    ],
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=r_r2N6F5Zlg',
    rating: 4.8,
    reviewCount: 38400,
    features: [
      '2 independent 5-qt nonstick baskets cook 2 foods, 2 ways, and finish together',
      'Smart Finish & Match Cook technology syncs cook settings across dual zones',
      '6 versatile cooking programs: Air Fry, Air Broil, Roast, Bake, Reheat, Dehydrate',
      'Cuts up to 75% less fat than traditional deep-frying methods',
      'Dishwasher-safe nonstick crisper plates and easy-to-clean glass view windows'
    ],
    description: 'Transform your daily meal prep. The dual independent zones let you roast chicken wings at 400°F on the left while air-frying crispy french fries at 375°F on the right, finishing at the exact same second.',
    badge: "Editor's Choice",
    inStock: true,
    createdAt: '2026-10-25T11:00:00Z',
    updatedAt: '2026-11-02T16:00:00Z',
  },
  {
    id: 'prod-1',
    title: 'Samsung Odyssey Neo G9 49" Curved Dual QHD 240Hz Mini-LED Gaming Monitor',
    slug: 'samsung-odyssey-neo-g9',
    brand: 'Samsung',
    category: 'Tech & Smart Gadgets',
    price: 1399.99,
    dealPrice: 999.99,
    amazonUrl: 'https://www.amazon.com/dp/B096CHRNYZ?tag=auragear-20',
    affiliateTag: 'auragear-20',
    image: MONITOR_IMG,
    gallery: [MONITOR_IMG],
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=0rZ-rLd5m9E',
    rating: 4.8,
    reviewCount: 3410,
    features: [
      'Quantum Mini-LED 240Hz refresh rate with 1ms response',
      'Dual QHD (5120 x 1440) 1000R curved ultra-wide panel',
      'Quantum HDR2000 with 2,048 local dimming zones',
      'CoreSync futuristic rear ambient lighting system',
      'Auto Source Switch+ and HDMI 2.1 support'
    ],
    description: 'Immerse yourself completely in cutting-edge simulation, gaming, and multi-window productivity with the groundbreaking Odyssey Neo G9. Features industry-leading Mini-LED backlighting.',
    badge: 'Trending Deal',
    inStock: true,
    createdAt: '2026-10-15T10:00:00Z',
    updatedAt: '2026-10-30T14:20:00Z',
  },
  {
    id: 'prod-2',
    title: 'Sony WH-1000XM5 Premium Noise Canceling Wireless Headphones',
    slug: 'sony-wh-1000xm5-wireless',
    brand: 'Sony',
    category: 'Tech & Smart Gadgets',
    price: 399.99,
    dealPrice: 328.00,
    amazonUrl: 'https://www.amazon.com/dp/B09XS7JWHH?tag=auragear-20',
    affiliateTag: 'auragear-20',
    image: HEADPHONES_IMG,
    gallery: [HEADPHONES_IMG],
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=1bEomA3hN4o',
    rating: 4.9,
    reviewCount: 12890,
    features: [
      'Dual processors and 8 microphones for supreme noise cancellation',
      'Up to 30-hour battery life with 3-minute quick charging for 3 hours playback',
      'Crystal-clear hands-free calling with 4 beamforming microphones',
      'Ultra-comfortable, lightweight soft fit leather styling',
      'Multipoint connection to switch effortlessly between devices'
    ],
    description: 'The standard for audiophiles and travelers alike. Industry-leading noise cancellation engineered with two processors and carbon fiber composite drivers for pristine high frequencies.',
    badge: "Amazon's Choice",
    inStock: true,
    createdAt: '2026-10-12T08:00:00Z',
    updatedAt: '2026-10-31T01:10:00Z',
  },
  {
    id: 'prod-3',
    title: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard (QMK/VIA)',
    slug: 'keychron-q1-pro-mechanical',
    brand: 'Keychron',
    category: 'Tech & Smart Gadgets',
    price: 219.99,
    dealPrice: 189.99,
    amazonUrl: 'https://www.amazon.com/dp/B0BVTN5M4T?tag=auragear-20',
    affiliateTag: 'auragear-20',
    image: KEYBOARD_IMG,
    gallery: [KEYBOARD_IMG],
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=wKk_i89m_c0',
    rating: 4.7,
    reviewCount: 940,
    features: [
      'Full CNC aluminum 6063 body with double-gasket acoustic mount',
      'Bluetooth 5.1 & Type-C wired dual connectivity',
      'Hot-swappable PCB supporting both 3-pin and 5-pin MX switches',
      'KSA double-shot PBT keycaps with Mac & Windows layout support',
      'South-facing RGB backlight and precision rotary encoder knob'
    ],
    description: 'Crafted for enthusiasts who demand tactile perfection and acoustics. The double-gasket design delivers deep, thocky acoustics with custom programmability via QMK/VIA.',
    badge: 'Trending Deal',
    inStock: true,
    createdAt: '2026-10-18T14:30:00Z',
    updatedAt: '2026-10-29T11:45:00Z',
  },
  {
    id: 'prod-4',
    title: 'Herman Miller Aeron Ergonomic Chair - Graphite Mineral Polished',
    slug: 'herman-miller-aeron-chair',
    brand: 'Herman Miller',
    category: 'Home & Workstation',
    price: 1695.00,
    dealPrice: 1440.75,
    amazonUrl: 'https://www.amazon.com/dp/B01MQO5A64?tag=auragear-20',
    affiliateTag: 'auragear-20',
    image: CHAIR_IMG,
    gallery: [CHAIR_IMG],
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=Kz6-8X78d-k',
    rating: 4.9,
    reviewCount: 2105,
    features: [
      '8Z Pellicle breathable suspension elastomeric mesh',
      'PostureFit SL dual-pad adjustable sacral and lumbar support',
      'Harmonic 2 tilt mechanism moves naturally with your body',
      'Fully adjustable 4D armrests with supple polyurethane pads',
      'Over 90% recyclable construction designed for 12+ years daily use'
    ],
    description: 'The gold standard of posture health and modern office design. Features zonal tension distribution to eliminate pressure points and maintain ideal blood circulation.',
    badge: 'Top Rated',
    inStock: true,
    createdAt: '2026-10-08T09:15:00Z',
    updatedAt: '2026-10-28T16:00:00Z',
  },
];

class StoreService {
  private products: Product[] = [];
  private listeners: (() => void)[] = [];
  private productsReady = false;
  private adminUsername = '';
  private visitorSessionId = '';
  private visitorSessionLastActivity = 0;
  private lastRecordedVisitorSessionId = '';

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', () => {
        this.reloadFromStorage();
        this.notify();
      });
      window.setInterval(() => {
        void this.syncCloudSocialSettings();
        void this.syncCloudStoreSettings();
      }, 30_000);
    }
  }

  private init() {
    try {
      const savedProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (savedProds) {
        const loaded: Product[] = JSON.parse(savedProds);
        this.products = loaded.map((p) => {
          const lower = `${p.title} ${p.brand}`.toLowerCase();
          let cat = p.category;
          if (cat === 'Desk & Displays' || !cat) {
            if (/cat|salmon|dog|pet|buffalo|wilderness|kitten|food|treat/i.test(lower)) {
              cat = 'Cat Food & Pet Care';
            } else if (/whey|protein|gym|workout|isolate|creatine|bcaa/i.test(lower)) {
              cat = 'Gym & Sports Nutrition';
            } else if (/fryer|cook|kitchen|ninja|oven|pot|blender/i.test(lower)) {
              cat = 'Home & Kitchen Gadgets';
            } else if (/monitor|headphone|keyboard|audio|oled|earphone/i.test(lower)) {
              cat = 'Tech & Smart Gadgets';
            } else if (/chair|desk|ergonomic|herman/i.test(lower)) {
              cat = 'Home & Workstation';
            } else {
              cat = 'Cat Food & Pet Care';
            }
          }
          return {
            ...p,
            category: cat,
            gallery: p.gallery && p.gallery.length ? p.gallery : [p.image],
            variants: p.variants && Array.isArray(p.variants) ? p.variants : [],
          };
        });
      } else {
        this.products = INITIAL_PRODUCTS;
      }

      if (!savedProds && !this.products.length) {
        this.products = INITIAL_PRODUCTS;
      }

      this.saveProducts(false);

      localStorage.removeItem('auragear_clicks_v1');
      localStorage.removeItem('auragear_visitors_v1');
    } catch {
      this.products = INITIAL_PRODUCTS;
    }

    this.syncCloudProducts();
    void this.syncCloudSocialSettings();
    void this.syncCloudStoreSettings();
  }

  private async syncCloudSocialSettings(): Promise<void> {
    try {
      const settings = await getPublicSocialSettings();
      if (!settings) return;
      this.saveSocialSettingsLocally(settings);
      this.notify();
    } catch (error) {
      console.warn('Cloud social settings could not be loaded', error);
    }
  }

  private async syncCloudStoreSettings(): Promise<void> {
    try {
      const settings = await getPublicStoreSettings();
      if (!settings) return;
      this.updateStoreSettings(settings);
    } catch (error) {
      console.warn('Cloud storefront settings could not be loaded', error);
    }
  }

  private async syncCloudProducts() {
    if (!hasSupabase || !supabase) {
      this.productsReady = true;
      this.notify();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('payload')
        .order('updated_at', { ascending: false });
      if (error) {
        console.warn('Supabase products table check failed', error);
        return;
      }

      const loadedProducts = (data || [])
        .map((row) => row.payload)
        .filter(Boolean)
        .flatMap((payload) => Array.isArray(payload) ? payload : [payload]);

      if (loadedProducts.length > 0) {
        this.products = loadedProducts.map((p) => ({
          ...p,
          category: p.category || 'Cat Food & Pet Care',
          gallery: p.gallery && p.gallery.length ? p.gallery : [p.image],
          variants: p.variants && Array.isArray(p.variants) ? p.variants : [],
        }));
        this.saveProducts(false);
        this.notify();
        return;
      }

      const { error: insertError } = await supabase
        .from('products')
        .upsert({ id: 'default', payload: this.products, updated_at: new Date().toISOString() }, { onConflict: 'id' });
      if (insertError) {
        console.warn('Supabase seed insert failed', insertError);
      }
    } catch (error) {
      console.warn('Supabase connection check failed', error);
    } finally {
      this.productsReady = true;
      this.notify();
    }
  }

  public areProductsReady(): boolean {
    return this.productsReady;
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // --- Visitor Session Recording ---
  public recordVisitorSession(page = '/') {
    try {
      const sessionId = this.getVisitorSessionId();
      if (sessionId === this.lastRecordedVisitorSessionId) return;
      this.lastRecordedVisitorSessionId = sessionId;
      const device = this.getDeviceType();
      void recordAnalyticsEvent({ type: 'visitor', sessionId, device, page })
        .catch((error: unknown) => {
          if (this.lastRecordedVisitorSessionId === sessionId) this.lastRecordedVisitorSessionId = '';
          console.error('Visitor analytics could not be recorded', error);
        });
    } catch (error) {
      console.error('Visitor analytics could not be recorded', error);
    }
  }

  private getVisitorSessionId(): string {
    const now = Date.now();
    const sessionTimeoutMs = 30 * 60 * 1000;
    if (this.visitorSessionId && now - this.visitorSessionLastActivity <= sessionTimeoutMs) {
      this.visitorSessionLastActivity = now;
      try {
        sessionStorage.setItem('kefayaan_analytics_session', JSON.stringify({
          id: this.visitorSessionId,
          lastActivity: now,
        }));
      } catch (error) {
        console.warn('Analytics session could not be cached in this browser', error);
      }
      return this.visitorSessionId;
    }

    let sessionId = '';
    try {
      const saved = sessionStorage.getItem('kefayaan_analytics_session');
      const parsed = saved ? JSON.parse(saved) as { id?: unknown; lastActivity?: unknown } : null;
      if (
        parsed &&
        typeof parsed.id === 'string' &&
        /^[A-Za-z0-9_-]{12,128}$/.test(parsed.id) &&
        typeof parsed.lastActivity === 'number' &&
        parsed.lastActivity <= now &&
        now - parsed.lastActivity <= sessionTimeoutMs
      ) {
        sessionId = parsed.id;
      }
    } catch (error) {
      console.warn('Saved analytics session could not be read', error);
    }
    if (!sessionId) sessionId = `sess_${now}_${Math.random().toString(36).substring(2, 12)}`;
    this.visitorSessionId = sessionId;
    this.visitorSessionLastActivity = now;
    try {
      sessionStorage.setItem('kefayaan_analytics_session', JSON.stringify({
        id: sessionId,
        lastActivity: now,
      }));
    } catch (error) {
      console.warn('Analytics session could not be cached in this browser', error);
    }
    return sessionId;
  }

  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    if (window.innerWidth < 768) return 'mobile';
    if (window.innerWidth < 1024) return 'tablet';
    return 'desktop';
  }

  // --- Products CRUD ---
  public getProducts(): Product[] {
    return [...this.products];
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  public saveProduct(product: Partial<Product> & { title: string; price: number; dealPrice: number; amazonUrl: string }): Product {
    const isNew = !product.id;
    let saved: Product;

    if (isNew) {
      const primaryImg = product.image || (product.gallery && product.gallery[0]) || CAT_FOOD_IMG;
      const galleryList = product.gallery && product.gallery.length
        ? product.gallery.slice(0, 20)
        : [primaryImg];

      saved = {
        id: `prod-${Date.now()}`,
        title: product.title,
        slug: product.slug || product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        brand: product.brand || 'Featured Brand',
        category: product.category || 'Cat Food & Pet Care',
        price: Number(product.price),
        dealPrice: Number(product.dealPrice || product.price),
        amazonUrl: product.amazonUrl,
        affiliateTag: product.affiliateTag || 'kefayaan-20',
        image: primaryImg,
        gallery: galleryList,
        variants: Array.isArray(product.variants) ? product.variants : [],
        videoType: product.videoType || 'none',
        videoUrl: product.videoUrl || '',
        rating: typeof product.rating === 'number' && !isNaN(product.rating) ? product.rating : 0,
        reviewCount: typeof product.reviewCount === 'number' && !isNaN(product.reviewCount) ? product.reviewCount : 0,
        features: product.features || [],
        description: product.description || '',
        badge: product.badge || '',
        isBestSeller: product.isBestSeller === true,
        productButtonLabel: product.productButtonLabel?.trim() || undefined,
        inStock: product.inStock !== undefined ? product.inStock : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.products.unshift(saved);
    } else {
      const idx = this.products.findIndex(p => p.id === product.id);
      if (idx !== -1) {
        const primaryImg = product.image || (product.gallery && product.gallery[0]) || this.products[idx].image;
        const galleryList = product.gallery && product.gallery.length
          ? product.gallery.slice(0, 20)
          : this.products[idx].gallery;

        saved = {
          ...this.products[idx],
          ...product,
          image: primaryImg,
          gallery: galleryList,
          variants: Array.isArray(product.variants) ? product.variants : (this.products[idx].variants || []),
          price: Number(product.price),
          dealPrice: Number(product.dealPrice || product.price),
          rating: typeof product.rating === 'number' && !isNaN(product.rating) ? product.rating : (this.products[idx].rating ?? 4.8),
          reviewCount: typeof product.reviewCount === 'number' && !isNaN(product.reviewCount) ? product.reviewCount : (this.products[idx].reviewCount ?? 1500),
          updatedAt: new Date().toISOString(),
        };
        this.products[idx] = saved;
      } else {
        throw new Error('Product not found');
      }
    }

    this.saveProducts();
    this.persistProductsToSupabase();
    this.notify();
    return saved;
  }

  public deleteProduct(id: string): boolean {
    const prevLen = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    if (this.products.length !== prevLen) {
      this.saveProducts();
      this.notify();
      return true;
    }
    return false;
  }

  // --- Outbound Retailer Click Tracking ---
  public trackAmazonClick(productId: string, customUrl?: string): OutboundClick {
    const prod = this.products.find(p => p.id === productId);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const monthStr = dateStr.substring(0, 7);

    const device = this.getDeviceType();

    const targetUrl = customUrl || (prod ? prod.amazonUrl : 'https://amazon.com');
    const browser = navigator.userAgent.includes('Firefox')
      ? 'Firefox'
      : navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')
        ? 'Safari'
        : navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other';

    const clickRecord: OutboundClick = {
      id: `clk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId,
      productTitle: prod ? prod.title : (productId === 'kefayaan-official-store' ? 'Kefayaan retailer storefront' : 'Direct Showcase Link'),
      timestamp: now.toISOString(),
      date: dateStr,
      month: monthStr,
      targetUrl,
      device,
      browser,
    };

    void recordAnalyticsEvent({
      type: 'outbound_click',
      eventId: clickRecord.id,
      sessionId: this.getVisitorSessionId(),
      productId: clickRecord.productId,
      productTitle: clickRecord.productTitle,
      targetUrl: clickRecord.targetUrl,
      device,
      browser,
    }).catch((error: unknown) => console.error('Retailer click analytics could not be recorded', error));
    return clickRecord;
  }

  // --- Admin Authentication ---
  public getAdminAuth() {
    return { isAuthenticated: Boolean(this.adminUsername), username: this.adminUsername };
  }

  public async verifyAdminSession(): Promise<void> {
    const session = await verifyAdminSession();
    this.adminUsername = session?.username || '';
    this.notify();
  }

  public async loginAdmin(username: string, pass: string): Promise<boolean> {
    const session = await loginAdminRequest(username.trim(), pass);
    this.adminUsername = session.username;
    this.notify();
    return true;
  }

  public async logoutAdmin(): Promise<void> {
    await logoutAdminRequest();
    this.adminUsername = '';
    this.notify();
  }

  // --- Social Accounts & Connections Management ---
  public getSocialSettings(): import('../types').SocialSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOCIAL_SETTINGS);
      const settings = saved ? { ...DEFAULT_SOCIAL_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SOCIAL_SETTINGS };
      if (settings.whatsappNumber === '+1 (800) 555-0199') {
        settings.whatsappNumber = DEFAULT_SOCIAL_SETTINGS.whatsappNumber;
      }
      return settings;
    } catch {
      return DEFAULT_SOCIAL_SETTINGS;
    }
  }

  public async updateSocialSettings(settings: Partial<import('../types').SocialSettings>) {
    const current = this.getSocialSettings();
    const updated = { ...current, ...settings };
    this.saveSocialSettingsLocally(updated);
    this.notify();
    const saved = await savePublicSocialSettings(updated);
    this.saveSocialSettingsLocally(saved);
    this.notify();
    return saved;
  }

  private saveSocialSettingsLocally(settings: import('../types').SocialSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SOCIAL_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.warn('Local social settings cache could not be saved', error);
    }
  }

  public getSocialUrl(channel: SocialChannel, message?: string, customHandle?: string): string {
    const s = this.getSocialSettings();
    const text = encodeURIComponent(message || 'Hello! I am inquiring about a curated product from Kefayaan.');
    
    switch (channel) {
      case 'whatsapp': {
        const rawNumber = customHandle || s.whatsappNumber;
        const cleanPhone = rawNumber.replace(/[^0-9]/g, '') || '8801873785288';
        return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`;
      }
      case 'instagram': {
        const handle = (customHandle || s.instagramUsername).replace(/^@/, '');
        return `https://instagram.com/${handle}`;
      }
      case 'facebook': {
        const page = (customHandle || s.facebookPageUsername).replace(/^@/, '');
        return `https://m.me/${page}`;
      }
      case 'tiktok': {
        const user = (customHandle || s.tiktokUsername).replace(/^@/, '');
        return `https://www.tiktok.com/@${user}`;
      }
      case 'twitter': {
        const handle = (customHandle || s.twitterUsername).replace(/^@/, '');
        return `https://twitter.com/messages/compose?recipient_id=${handle}&text=${text}`;
      }
      default:
        return '#';
    }
  }

  // --- Store Settings & Retailer Store Link ---
  public getStoreSettings(): StoreSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STORE_SETTINGS);
      if (saved) {
        const savedSettings = JSON.parse(saved) as Partial<StoreSettings>;
        const migratedSettings = savedSettings.logoUrl === LEGACY_LOGO_URL
          ? { ...savedSettings, logoUrl: DEFAULT_LOGO_URL }
          : savedSettings;
        return { ...DEFAULT_STORE_SETTINGS, ...migratedSettings };
      }
    } catch {}
    return { ...DEFAULT_STORE_SETTINGS };
  }

  public updateStoreSettings(settings: Partial<StoreSettings>): StoreSettings {
    const current = this.getStoreSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(STORAGE_KEYS.STORE_SETTINGS, JSON.stringify(updated));
    } catch (error) {
      console.warn('Store settings cache could not be saved', error);
    }
    this.notify();
    return updated;
  }

  public async saveStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const updated = this.updateStoreSettings(settings);
    const publicSettings = await savePublicStoreSettings({
      retailerName: updated.retailerName,
      purchaseButtonLabel: updated.purchaseButtonLabel,
      amazonOfficialStoreUrl: updated.amazonOfficialStoreUrl,
      socialPreviewImageUrl: updated.socialPreviewImageUrl,
    });
    return this.updateStoreSettings(publicSettings);
  }

  public trackOfficialStoreClick(): OutboundClick {
    const settings = this.getStoreSettings();
    return this.trackAmazonClick('kefayaan-official-store', settings.amazonOfficialStoreUrl);
  }

  // --- Ad Pixel Settings & Event Logs (Meta, TikTok, Google) ---
  public getPixelSettings(): PixelSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PIXEL_SETTINGS);
      if (saved) {
        const settings = { ...DEFAULT_PIXEL_SETTINGS, ...JSON.parse(saved) };
        if (settings.pinterestTagId === '2613020754632') {
          settings.pinterestTagId = DEFAULT_PIXEL_SETTINGS.pinterestTagId;
          localStorage.setItem(STORAGE_KEYS.PIXEL_SETTINGS, JSON.stringify(settings));
        }
        return settings;
      }
    } catch {}
    return { ...DEFAULT_PIXEL_SETTINGS };
  }

  public updatePixelSettings(settings: Partial<PixelSettings>): PixelSettings {
    const current = this.getPixelSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(STORAGE_KEYS.PIXEL_SETTINGS, JSON.stringify(updated));
    } catch {}
    this.notify();
    return updated;
  }

  public getPixelLogs(): PixelEventLog[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PIXEL_LOGS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [];
  }

  public recordPixelEvent(event: PixelEventLog): void {
    try {
      const logs = this.getPixelLogs();
      logs.unshift(event);
      localStorage.setItem(STORAGE_KEYS.PIXEL_LOGS, JSON.stringify(logs.slice(0, 500)));
      this.notify();
    } catch {}
  }

  public clearPixelLogs(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PIXEL_LOGS);
      this.notify();
    } catch {}
  }

  // --- Multi-tab / Multi-window Synchronization ---
  public reloadFromStorage() {
    try {
      const savedProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (savedProds) this.products = JSON.parse(savedProds);

    } catch {}
  }

  // --- Persistence Handlers ---
  private persistProductsToSupabase() {
    if (!hasSupabase || !supabase) return;

    void (async () => {
      try {
        const payload = this.products;
        const { error } = await supabase.from('products').upsert({ id: 'default', payload, updated_at: new Date().toISOString() }, { onConflict: 'id' });
        if (error) {
          console.warn('Supabase product persistence failed', error);
        }
      } catch (error) {
        console.warn('Supabase product persistence error', error);
      }
    })();
  }

  private saveProducts(persistToCloud = true) {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
    if (persistToCloud) this.persistProductsToSupabase();
  }

  public resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem('auragear_clicks_v1');
    localStorage.removeItem('auragear_visitors_v1');
    this.init();
    this.notify();
  }
}

export const store = new StoreService();
