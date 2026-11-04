export interface ProductVariant {
  id: string;
  name: string;
  optionType?: string;
  price?: number;
  dealPrice?: number;
  amazonUrl?: string;
  image?: string;
  gallery?: string[];
  sku?: string;
  inStock?: boolean;
}

export interface StoreSettings {
  shopName: string;
  tagline: string;
  logoUrl: string;
  amazonOfficialStoreUrl: string;
  defaultAffiliateTag: string;
  officialStoreClicksCount: number;
  heroHeadline: string;
  heroSubtitle: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  dealPrice: number;
  amazonUrl: string;
  affiliateTag?: string;
  image: string;
  gallery: string[];
  variants?: ProductVariant[];
  videoType: 'youtube' | 'direct' | 'none';
  videoUrl?: string;
  rating: number;
  reviewCount: number;
  features: string[];
  description: string;
  badge?: string;
  inStock: boolean;
  clicksCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}


export interface OutboundClick {
  id: string;
  productId: string;
  productTitle: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  targetUrl: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
}

export interface VisitorLog {
  id: string;
  sessionId: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  hour: number;
  device: 'desktop' | 'mobile' | 'tablet';
  page: string;
  ipMasked?: string;
}

export type SocialChannel = 'whatsapp' | 'instagram' | 'facebook' | 'tiktok' | 'twitter';

export interface AnalyticsFilter {
  period: 'today' | '7days' | 'this_month' | '30days' | 'yearly' | 'all';
}

export interface SocialSettings {
  whatsappNumber: string;
  facebookPageUsername: string;
  instagramUsername: string;
  tiktokUsername: string;
  twitterUsername: string;
  visibleChannels: SocialChannel[];
  customLinks: SocialLink[];
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
}

export interface PixelSettings {
  facebookPixelId: string;
  facebookEnabled: boolean;
  tiktokPixelId: string;
  tiktokEnabled: boolean;
  googleTagId: string; // e.g. G-XXXXXXX or AW-XXXXXXX
  googleEnabled: boolean;
  trackAsOrder: boolean; // Treat "Buy on Amazon" click as Purchase/Order for ads optimization
  trackInitiateCheckout: boolean; // Also send InitiateCheckout event
}

export interface PixelEventLog {
  id: string;
  timestamp: string;
  platform: 'facebook' | 'tiktok' | 'google';
  eventName: string; // 'Purchase', 'InitiateCheckout', 'ViewContent', etc.
  productTitle: string;
  productId: string;
  value: number;
  currency: string;
  status: 'fired' | 'simulated';
}
