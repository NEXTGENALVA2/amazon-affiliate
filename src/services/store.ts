import {
  Product,
  ProductVariant,
  StoreSettings,
  OutboundClick,
  VisitorLog,
  Conversation,
  ChatMessage,
  SocialChannel,
  PixelSettings,
  PixelEventLog,
} from '../types';
import { hasSupabase, supabase } from './supabase';
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

const STORAGE_KEYS = {
  PRODUCTS: 'auragear_products_v2',
  CLICKS: 'auragear_clicks_v1',
  VISITORS: 'auragear_visitors_v1',
  CONVERSATIONS: 'auragear_conversations_v1',
  ADMIN_AUTH: 'auragear_admin_auth_v1',
  ADMIN_CREDS: 'auragear_admin_creds_v1',
  SOCIAL_SETTINGS: 'auragear_social_settings_v1',
  STORE_SETTINGS: 'kefayaan_store_settings_v1',
  PIXEL_SETTINGS: 'kefayaan_pixel_settings_v1',
  PIXEL_LOGS: 'kefayaan_pixel_logs_v1',
};

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  shopName: 'Kefayaan',
  tagline: 'Amazon US Official Storefront & Verified Deals',
  logoUrl: '/assets/aistudio/DP_af5fa802.png',
  amazonOfficialStoreUrl: 'https://link.amazon/B0dbjUEFY',
  defaultAffiliateTag: 'kefayaan-20',
  officialStoreClicksCount: 328,
  heroHeadline: 'Verified US Amazon Best Sellers, Curated by Kefayaan.',
  heroSubtitle: 'Every product is hand-tested, lab-benchmarked, and backed by direct Amazon Prime delivery with official manufacturer warranty.',
};

const DEFAULT_PIXEL_SETTINGS: PixelSettings = {
  facebookPixelId: '',
  facebookEnabled: true,
  tiktokPixelId: '',
  tiktokEnabled: true,
  googleTagId: '',
  googleEnabled: true,
  trackAsOrder: true, // Buy Now is treated as Purchase / Order for Ads optimization
  trackInitiateCheckout: true,
};

const DEFAULT_SOCIAL_SETTINGS: import('../types').SocialSettings = {
  whatsappNumber: '+1 (800) 555-0199',
  facebookPageUsername: 'kefayaanofficial',
  instagramUsername: 'kefayaan_official',
  tiktokUsername: 'kefayaan',
  twitterUsername: 'kefayaan',
  autoReplyEnabled: true,
  autoReplyMessage: 'Thank you for messaging Kefayaan! An Amazon product specialist has received your inquiry and will reply shortly.',
  webhookUrl: '',
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
      'Veterinarian recommended and certified Made in USA in FDA-inspected facilities'
    ],
    description: 'The #1 bestselling wet cat food in the US pet category. Formulated by veterinary animal nutritionists, Nature’s Harvest delivers pure, unprocessed animal protein with zero filler grains for optimal feline vitality.',
    badge: "Amazon's Choice",
    inStock: true,
    clicksCount: 388,
    viewsCount: 4890,
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
      'Informed Choice certified — tested banned-substance free for US competitive athletes',
      'Low sugar (1g) and low carb (3g) keto-friendly nutritional profile'
    ],
    description: 'The world’s most trusted post-workout supplement. Gold Standard 100% Whey uses primary Whey Protein Isolates to maximize absorption speed, muscle recovery, and workout endurance.',
    badge: '#1 Best Seller',
    inStock: true,
    clicksCount: 512,
    viewsCount: 6310,
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
    clicksCount: 426,
    viewsCount: 5200,
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
    clicksCount: 142,
    viewsCount: 1890,
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
    clicksCount: 318,
    viewsCount: 4210,
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
    clicksCount: 204,
    viewsCount: 2750,
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
    clicksCount: 98,
    viewsCount: 1640,
    createdAt: '2026-10-08T09:15:00Z',
    updatedAt: '2026-10-28T16:00:00Z',
  },
];

// Helper to generate seed historical data for analytics
const generateHistoricalData = () => {
  const visitors: VisitorLog[] = [];
  const clicks: OutboundClick[] = [];
  const devices: ('desktop' | 'mobile' | 'tablet')[] = ['desktop', 'desktop', 'mobile', 'mobile', 'tablet'];

  const now = new Date('2026-10-31T00:41:30Z');

  // Generate for past 35 days to allow full month + daily views
  for (let i = 34; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const monthStr = dateStr.substring(0, 7);

    // 80 to 220 visitors per day
    const dayVisitors = 95 + Math.floor(Math.sin(i * 0.7) * 45) + (i % 7 === 0 ? 55 : 20);
    for (let v = 0; v < dayVisitors; v++) {
      const hour = Math.floor(Math.random() * 24);
      const dev = devices[Math.floor(Math.random() * devices.length)];
      visitors.push({
        id: `vis-${dateStr}-${v}`,
        sessionId: `sess-${dateStr}-${v}`,
        timestamp: `${dateStr}T${hour.toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00Z`,
        date: dateStr,
        month: monthStr,
        hour,
        device: dev,
        page: v % 5 === 0 ? '/reviews' : '/',
      });

      // Around 12% to 22% of visitors click an Amazon affiliate button
      if (Math.random() < 0.16) {
        const prod = INITIAL_PRODUCTS[Math.floor(Math.random() * INITIAL_PRODUCTS.length)];
        clicks.push({
          id: `clk-${dateStr}-${v}`,
          productId: prod.id,
          productTitle: prod.title,
          timestamp: `${dateStr}T${hour.toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00Z`,
          date: dateStr,
          month: monthStr,
          targetUrl: prod.amazonUrl,
          device: dev,
          browser: 'Chrome / Safari',
        });
      }
    }
  }

  return { visitors, clicks };
};

// Initial Seed Social Conversations across channels
const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    customerName: 'Marcus Vance',
    customerHandle: '+1 (415) 890-2341',
    channel: 'whatsapp',
    lastMessage: 'Hi! Is the Odyssey Neo G9 discount still available with Amazon Prime delivery?',
    lastUpdated: '10 mins ago',
    unreadCount: 1,
    status: 'open',
    productId: 'prod-1',
    productTitle: 'Samsung Odyssey Neo G9 49" Curved Dual QHD Gaming Monitor',
    messages: [
      {
        id: 'msg-101',
        conversationId: 'conv-1',
        sender: 'customer',
        channel: 'whatsapp',
        customerName: 'Marcus Vance',
        customerHandle: '+1 (415) 890-2341',
        text: 'Hi! Is the Odyssey Neo G9 discount still available with Amazon Prime delivery?',
        timestamp: '2026-10-31T00:31:00Z',
        isRead: false,
        productId: 'prod-1',
        productTitle: 'Samsung Odyssey Neo G9 49" Curved Dual QHD Gaming Monitor',
      },
    ],
  },
  {
    id: 'conv-2',
    customerName: 'Elena Rostova',
    customerHandle: '@elena_studios',
    channel: 'instagram',
    lastMessage: 'Could you tell me if the Keychron Q1 Pro comes with tactile banana switches?',
    lastUpdated: '35 mins ago',
    unreadCount: 1,
    status: 'open',
    productId: 'prod-3',
    productTitle: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
    messages: [
      {
        id: 'msg-201',
        conversationId: 'conv-2',
        sender: 'customer',
        channel: 'instagram',
        customerName: 'Elena Rostova',
        customerHandle: '@elena_studios',
        text: 'Hey! Loved your review on the Keychron Q1. Could you tell me if the Keychron Q1 Pro comes with tactile banana switches or just reds on Amazon?',
        timestamp: '2026-10-31T00:05:00Z',
        isRead: false,
        productId: 'prod-3',
      },
    ],
  },
  {
    id: 'conv-3',
    customerName: 'David Chen',
    customerHandle: 'david.chen.tech',
    channel: 'facebook',
    lastMessage: 'Thank you for the quick verification on the Herman Miller warranty!',
    lastUpdated: '2 hours ago',
    unreadCount: 0,
    status: 'replied',
    productId: 'prod-4',
    productTitle: 'Herman Miller Aeron Ergonomic Chair',
    messages: [
      {
        id: 'msg-301',
        conversationId: 'conv-3',
        sender: 'customer',
        channel: 'facebook',
        customerName: 'David Chen',
        customerHandle: 'david.chen.tech',
        text: 'Does Herman Miller honor the 12-year warranty when ordered directly through the official Amazon flagship store link you provided?',
        timestamp: '2026-10-30T22:15:00Z',
        isRead: true,
        productId: 'prod-4',
      },
      {
        id: 'msg-302',
        conversationId: 'conv-3',
        sender: 'admin',
        channel: 'facebook',
        customerName: 'Admin Support',
        text: 'Yes David! The link on our page directs specifically to the official Herman Miller Storefront on Amazon, which includes the genuine 12-year 3-shift warranty.',
        timestamp: '2026-10-30T22:25:00Z',
        isRead: true,
      },
      {
        id: 'msg-303',
        conversationId: 'conv-3',
        sender: 'customer',
        channel: 'facebook',
        customerName: 'David Chen',
        customerHandle: 'david.chen.tech',
        text: 'Thank you for the quick verification on the Herman Miller warranty!',
        timestamp: '2026-10-30T22:30:00Z',
        isRead: true,
      },
    ],
  },
  {
    id: 'conv-4',
    customerName: 'Jordan Sparks',
    customerHandle: '@desksetupdaily',
    channel: 'tiktok',
    lastMessage: 'Dropped a comment on your video review! Buying this setup.',
    lastUpdated: '4 hours ago',
    unreadCount: 0,
    status: 'replied',
    messages: [
      {
        id: 'msg-401',
        conversationId: 'conv-4',
        sender: 'customer',
        channel: 'tiktok',
        customerName: 'Jordan Sparks',
        customerHandle: '@desksetupdaily',
        text: 'Dropped a comment on your video review! Buying this setup. Thanks for the direct link!',
        timestamp: '2026-10-30T20:40:00Z',
        isRead: true,
      },
      {
        id: 'msg-402',
        sender: 'admin',
        conversationId: 'conv-4',
        channel: 'tiktok',
        customerName: 'Admin Support',
        text: 'Awesome to hear Jordan! Enjoy the setup and tag us when it arrives!',
        timestamp: '2026-10-30T20:55:00Z',
        isRead: true,
      },
    ],
  },
  {
    id: 'conv-5',
    customerName: 'Kavita Patel',
    customerHandle: '@kavita_p_dev',
    channel: 'twitter',
    lastMessage: 'Are the XM5 headphones comfortable with glasses for 8+ hours?',
    lastUpdated: '5 hours ago',
    unreadCount: 1,
    status: 'open',
    productId: 'prod-2',
    productTitle: 'Sony WH-1000XM5 Premium Noise Canceling Wireless Headphones',
    messages: [
      {
        id: 'msg-501',
        conversationId: 'conv-5',
        sender: 'customer',
        channel: 'twitter',
        customerName: 'Kavita Patel',
        customerHandle: '@kavita_p_dev',
        text: 'Saw your Sony XM5 feature. Are the XM5 headphones comfortable with glasses for 8+ hours?',
        timestamp: '2026-10-30T19:10:00Z',
        isRead: false,
        productId: 'prod-2',
      },
    ],
  },
  {
    id: 'conv-6',
    customerName: 'Guest Visitor #4891',
    customerHandle: 'Web Session',
    channel: 'website',
    lastMessage: 'Can I connect two laptops to the Samsung Odyssey Neo G9 simultaneously?',
    lastUpdated: 'Just now',
    unreadCount: 1,
    status: 'open',
    productId: 'prod-1',
    productTitle: 'Samsung Odyssey Neo G9 49" Curved Dual QHD Gaming Monitor',
    messages: [
      {
        id: 'msg-601',
        conversationId: 'conv-6',
        sender: 'customer',
        channel: 'website',
        customerName: 'Guest Visitor #4891',
        customerHandle: 'Web Session',
        text: 'Can I connect two laptops to the Samsung Odyssey Neo G9 simultaneously using Picture-by-Picture mode?',
        timestamp: '2026-10-31T00:38:00Z',
        isRead: false,
        productId: 'prod-1',
      },
    ],
  },
];

class StoreService {
  private products: Product[] = [];
  private clicks: OutboundClick[] = [];
  private visitors: VisitorLog[] = [];
  private conversations: Conversation[] = [];
  private listeners: (() => void)[] = [];
  private productsReady = false;

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', () => {
        this.reloadFromStorage();
        this.notify();
      });
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

      // Clicks & Visitors
      const savedClicks = localStorage.getItem(STORAGE_KEYS.CLICKS);
      const savedVisitors = localStorage.getItem(STORAGE_KEYS.VISITORS);

      if (savedClicks && savedVisitors) {
        this.clicks = JSON.parse(savedClicks);
        this.visitors = JSON.parse(savedVisitors);
      } else {
        const { visitors, clicks } = generateHistoricalData();
        this.visitors = visitors;
        this.clicks = clicks;
        this.saveVisitors();
        this.saveClicks();
      }

      // Conversations
      const savedConvs = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (savedConvs) {
        this.conversations = JSON.parse(savedConvs);
      } else {
        this.conversations = INITIAL_CONVERSATIONS;
        this.saveConversations();
      }
    } catch {
      this.products = INITIAL_PRODUCTS;
      const { visitors, clicks } = generateHistoricalData();
      this.visitors = visitors;
      this.clicks = clicks;
      this.conversations = INITIAL_CONVERSATIONS;
    }

    this.recordVisitorSession();
    this.syncCloudProducts();
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
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const monthStr = dateStr.substring(0, 7);
      let sessionId = sessionStorage.getItem('auragear_sess_id');
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        sessionStorage.setItem('auragear_sess_id', sessionId);
      }

      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      const device = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

      const newLog: VisitorLog = {
        id: `vis_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sessionId,
        timestamp: now.toISOString(),
        date: dateStr,
        month: monthStr,
        hour: now.getHours(),
        device,
        page,
      };

      this.visitors.push(newLog);
      this.saveVisitors();
      this.notify();
    } catch (e) {
      console.warn('Could not record session', e);
    }
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
        rating: typeof product.rating === 'number' && !isNaN(product.rating) ? product.rating : 4.8,
        reviewCount: typeof product.reviewCount === 'number' && !isNaN(product.reviewCount) ? product.reviewCount : 1500,
        features: product.features && product.features.length ? product.features : ['100% genuine product', 'Amazon Prime 2-day delivery eligible'],
        description: product.description || '',
        badge: product.badge || '',
        inStock: product.inStock !== undefined ? product.inStock : true,
        clicksCount: 0,
        viewsCount: 0,
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

  // --- Outbound Click Tracking (Amazon Affiliate Buy Now) ---
  public getProductClicks(productId: string): number {
    const prod = this.products.find(p => p.id === productId);
    const loggedClicks = this.clicks.filter(c => c.productId === productId).length;
    return Math.max(prod?.clicksCount || 0, loggedClicks);
  }

  public trackAmazonClick(productId: string, customUrl?: string): OutboundClick {
    const prod = this.products.find(p => p.id === productId);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const monthStr = dateStr.substring(0, 7);

    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const device = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

    const targetUrl = customUrl || (prod ? prod.amazonUrl : 'https://amazon.com');

    const clickRecord: OutboundClick = {
      id: `clk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId,
      productTitle: prod ? prod.title : (productId === 'kefayaan-official-store' ? 'Amazon Official Storefront' : 'Direct Showcase Link'),
      timestamp: now.toISOString(),
      date: dateStr,
      month: monthStr,
      targetUrl,
      device,
      browser: navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') ? 'Safari' : 'Chrome',
    };

    this.clicks.unshift(clickRecord);
    this.saveClicks();

    // Increment click count on product
    if (prod) {
      prod.clicksCount = (prod.clicksCount || 0) + 1;
      this.saveProducts();
    }

    this.notify();
    return clickRecord;
  }

  // --- OmniChannel Chat System ---
  public getConversations(): Conversation[] {
    return [...this.conversations];
  }

  public getConversationById(id: string): Conversation | undefined {
    return this.conversations.find(c => c.id === id);
  }

  public sendCustomerMessage(
    channel: SocialChannel,
    customerName: string,
    customerHandle: string,
    text: string,
    productId?: string,
    productTitle?: string
  ): { conversation: Conversation; message: ChatMessage } {
    let conv = this.conversations.find(c => c.channel === channel && c.customerHandle === customerHandle);

    const now = new Date().toISOString();
    const msgId = `msg_${Date.now()}`;

    const newMsg: ChatMessage = {
      id: msgId,
      conversationId: conv ? conv.id : `conv_${Date.now()}`,
      sender: 'customer',
      channel,
      customerName,
      customerHandle,
      text,
      timestamp: now,
      isRead: false,
      productId,
      productTitle,
    };

    if (conv) {
      conv.messages.push(newMsg);
      conv.lastMessage = text;
      conv.lastUpdated = 'Just now';
      conv.unreadCount += 1;
      conv.status = 'open';
      if (productId) {
        conv.productId = productId;
        conv.productTitle = productTitle;
      }
    } else {
      conv = {
        id: newMsg.conversationId,
        customerName,
        customerHandle,
        channel,
        lastMessage: text,
        lastUpdated: 'Just now',
        unreadCount: 1,
        status: 'open',
        productId,
        productTitle,
        messages: [newMsg],
      };
      this.conversations.unshift(conv);
    }

    this.saveConversations();
    this.notify();
    return { conversation: conv, message: newMsg };
  }

  public receiveExternalWebhook(payload: {
    channel?: SocialChannel;
    customerName?: string;
    customerHandle?: string;
    text?: string;
    message?: string;
    sender?: string;
    phone?: string;
  }) {
    const channel: SocialChannel = payload.channel || 'whatsapp';
    const customerName = payload.customerName || payload.sender || 'Customer';
    const customerHandle = payload.customerHandle || payload.phone || (channel === 'whatsapp' ? '+880 1712-345678' : '@customer_dm');
    const text = payload.text || payload.message || 'Hello! I am inquiring about a product from your Facebook/WhatsApp page.';

    return this.sendCustomerMessage(channel, customerName, customerHandle, text);
  }

  public sendAdminReply(conversationId: string, text: string): ChatMessage | null {
    const conv = this.conversations.find(c => c.id === conversationId);
    if (!conv) return null;

    const now = new Date().toISOString();
    const reply: ChatMessage = {
      id: `msg_adm_${Date.now()}`,
      conversationId,
      sender: 'admin',
      channel: conv.channel,
      customerName: 'AuraGear Support',
      text,
      timestamp: now,
      isRead: true,
    };

    conv.messages.push(reply);
    conv.lastMessage = `You: ${text}`;
    conv.lastUpdated = 'Just now';
    conv.unreadCount = 0;
    conv.status = 'replied';

    this.saveConversations();
    this.notify();
    return reply;
  }

  public markConversationRead(conversationId: string) {
    const conv = this.conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.unreadCount = 0;
      conv.messages.forEach(m => (m.isRead = true));
      this.saveConversations();
      this.notify();
    }
  }

  public updateConversationStatus(conversationId: string, status: 'open' | 'replied' | 'archived') {
    const conv = this.conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.status = status;
      this.saveConversations();
      this.notify();
    }
  }

  // --- Analytics & Visitor Queries with Filters ---
  public getAnalytics(filterPeriod: 'today' | '7days' | 'this_month' | '30days' | 'yearly' | 'all') {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7);

    let filteredVisitors = [...this.visitors];
    let filteredClicks = [...this.clicks];

    const d7 = new Date(now);
    d7.setDate(d7.getDate() - 7);
    const d7Str = d7.toISOString().split('T')[0];

    const d30 = new Date(now);
    d30.setDate(d30.getDate() - 30);
    const d30Str = d30.toISOString().split('T')[0];

    const yearStart = `${now.getFullYear()}-01-01`;

    if (filterPeriod === 'today') {
      filteredVisitors = this.visitors.filter(v => v.date === todayStr);
      filteredClicks = this.clicks.filter(c => c.date === todayStr);
    } else if (filterPeriod === '7days') {
      filteredVisitors = this.visitors.filter(v => v.date >= d7Str);
      filteredClicks = this.clicks.filter(c => c.date >= d7Str);
    } else if (filterPeriod === 'this_month') {
      filteredVisitors = this.visitors.filter(v => v.month === currentMonthStr);
      filteredClicks = this.clicks.filter(c => c.month === currentMonthStr);
    } else if (filterPeriod === '30days') {
      filteredVisitors = this.visitors.filter(v => v.date >= d30Str);
      filteredClicks = this.clicks.filter(c => c.date >= d30Str);
    } else if (filterPeriod === 'yearly') {
      filteredVisitors = this.visitors.filter(v => v.date >= yearStart);
      filteredClicks = this.clicks.filter(c => c.date >= yearStart);
    }

    const totalVisitors = filteredVisitors.length;
    const uniqueSessions = new Set(filteredVisitors.map(v => v.sessionId)).size;
    const totalClicks = filteredClicks.length;
    const clickRate = totalVisitors > 0 ? ((totalClicks / totalVisitors) * 100).toFixed(1) : '0.0';

    // Grouping by Date for charts
    const dateMap: Record<string, { date: string; visitors: number; clicks: number }> = {};

    filteredVisitors.forEach(v => {
      if (!dateMap[v.date]) {
        dateMap[v.date] = { date: v.date, visitors: 0, clicks: 0 };
      }
      dateMap[v.date].visitors += 1;
    });

    filteredClicks.forEach(c => {
      if (!dateMap[c.date]) {
        dateMap[c.date] = { date: c.date, visitors: 0, clicks: 0 };
      }
      dateMap[c.date].clicks += 1;
    });

    const timeSeries = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

    // Device breakdown
    const devices = {
      desktop: filteredVisitors.filter(v => v.device === 'desktop').length,
      mobile: filteredVisitors.filter(v => v.device === 'mobile').length,
      tablet: filteredVisitors.filter(v => v.device === 'tablet').length,
    };

    // Product Clicks Ranking
    const productClickMap: Record<string, { id: string; title: string; clicks: number }> = {};
    filteredClicks.forEach(c => {
      if (!productClickMap[c.productId]) {
        productClickMap[c.productId] = { id: c.productId, title: c.productTitle, clicks: 0 };
      }
      productClickMap[c.productId].clicks += 1;
    });

    const topClickedProducts = Object.values(productClickMap).sort((a, b) => b.clicks - a.clicks);

    // Estimated Commission (assuming average order price $280 and 3.5% Amazon associate fee)
    const estimatedEarnings = (totalClicks * 0.085 * 280 * 0.035).toFixed(2);

    return {
      totalVisitors,
      uniqueSessions,
      totalClicks,
      clickRate,
      estimatedEarnings,
      timeSeries,
      devices,
      topClickedProducts,
      recentClicks: filteredClicks.slice(0, 20),
    };
  }

  // --- Admin Authentication ---
  public getAdminAuth() {
    try {
      const auth = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
      return auth ? JSON.parse(auth) : { isAuthenticated: false, username: '' };
    } catch {
      return { isAuthenticated: false, username: '' };
    }
  }

  public getAdminCredentials() {
    try {
      const creds = localStorage.getItem(STORAGE_KEYS.ADMIN_CREDS);
      return creds ? JSON.parse(creds) : { username: 'admin', password: 'admin123' };
    } catch {
      return { username: 'admin', password: 'admin123' };
    }
  }

  public updateAdminCredentials(newUsername: string, newPassword: string) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_CREDS, JSON.stringify({ username: newUsername, password: newPassword }));
  }

  public loginAdmin(username: string, pass: string): boolean {
    const creds = this.getAdminCredentials();
    if (username.trim() === creds.username && pass === creds.password) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify({ isAuthenticated: true, username }));
      this.notify();
      return true;
    }
    return false;
  }

  public logoutAdmin() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    this.notify();
  }

  // --- Social Accounts & Connections Management ---
  public getSocialSettings(): import('../types').SocialSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOCIAL_SETTINGS);
      return saved ? { ...DEFAULT_SOCIAL_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SOCIAL_SETTINGS;
    } catch {
      return DEFAULT_SOCIAL_SETTINGS;
    }
  }

  public updateSocialSettings(settings: Partial<import('../types').SocialSettings>) {
    const current = this.getSocialSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SOCIAL_SETTINGS, JSON.stringify(updated));
    this.notify();
    return updated;
  }

  public getSocialUrl(channel: SocialChannel, message?: string, customHandle?: string): string {
    const s = this.getSocialSettings();
    const text = encodeURIComponent(message || 'Hello! I am inquiring about a curated tech product on Amazon from AuraGear.');
    
    switch (channel) {
      case 'whatsapp': {
        const rawNumber = customHandle || s.whatsappNumber;
        const cleanPhone = rawNumber.replace(/[^0-9]/g, '') || '18005550199';
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

  // --- Store Settings & Amazon Official Store Link ---
  public getStoreSettings(): StoreSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STORE_SETTINGS);
      if (saved) {
        return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {}
    return { ...DEFAULT_STORE_SETTINGS };
  }

  public updateStoreSettings(settings: Partial<StoreSettings>): StoreSettings {
    const current = this.getStoreSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(STORAGE_KEYS.STORE_SETTINGS, JSON.stringify(updated));
    } catch {}
    this.notify();
    return updated;
  }

  public trackOfficialStoreClick(): OutboundClick {
    const settings = this.getStoreSettings();
    const count = (settings.officialStoreClicksCount || 0) + 1;
    this.updateStoreSettings({ officialStoreClicksCount: count });
    return this.trackAmazonClick('kefayaan-official-store', settings.amazonOfficialStoreUrl);
  }

  // --- Ad Pixel Settings & Event Logs (Meta, TikTok, Google) ---
  public getPixelSettings(): PixelSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PIXEL_SETTINGS);
      if (saved) {
        return { ...DEFAULT_PIXEL_SETTINGS, ...JSON.parse(saved) };
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

      const savedClicks = localStorage.getItem(STORAGE_KEYS.CLICKS);
      if (savedClicks) this.clicks = JSON.parse(savedClicks);

      const savedVisitors = localStorage.getItem(STORAGE_KEYS.VISITORS);
      if (savedVisitors) this.visitors = JSON.parse(savedVisitors);

      const savedConvs = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (savedConvs) this.conversations = JSON.parse(savedConvs);
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

  private saveClicks() {
    try {
      localStorage.setItem(STORAGE_KEYS.CLICKS, JSON.stringify(this.clicks.slice(0, 1500)));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  private saveVisitors() {
    try {
      localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(this.visitors.slice(0, 3000)));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  private saveConversations() {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(this.conversations));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  public resetToDefaults() {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CLICKS);
    localStorage.removeItem(STORAGE_KEYS.VISITORS);
    localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
    this.init();
    this.notify();
  }
}

export const store = new StoreService();
