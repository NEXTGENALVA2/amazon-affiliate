/**
 * Multi-Platform Ad Pixel Tracking Service
 * Supports:
 * - Meta Pixel (Facebook Ads) -> PageView, ViewContent, InitiateCheckout, Purchase
 * - TikTok Pixel (TikTok Ads) -> PageView, ViewContent, InitiateCheckout, CompletePayment
 * - Google Tag / GA4 / Google Ads -> page_view, view_item, begin_checkout, purchase
 */

import { Product, PixelSettings, PixelEventLog } from '../types';
import { store } from './store';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    ttq?: any;
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

class PixelTrackingService {
  private initialized = false;

  public initialize(settings?: PixelSettings) {
    if (typeof window === 'undefined') return;

    const currentSettings = settings || store.getPixelSettings();

    // 1. Initialize Meta / Facebook Pixel
    if (currentSettings.facebookEnabled && currentSettings.facebookPixelId) {
      this.injectFacebookPixel(currentSettings.facebookPixelId);
    }

    // 2. Initialize TikTok Pixel
    if (currentSettings.tiktokEnabled && currentSettings.tiktokPixelId) {
      this.injectTikTokPixel(currentSettings.tiktokPixelId);
    }

    // 3. Initialize Google Tag
    if (currentSettings.googleEnabled && currentSettings.googleTagId) {
      this.injectGoogleTag(currentSettings.googleTagId);
    }

    this.initialized = true;
  }

  // --- Meta (Facebook) Pixel Injection ---
  private injectFacebookPixel(pixelId: string) {
    if (document.getElementById('meta-pixel-script')) return;

    try {
      /* eslint-disable */
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.id = 'meta-pixel-script';
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */

      if (window.fbq) {
        window.fbq('init', pixelId.trim());
        window.fbq('track', 'PageView');
      }
    } catch (e) {
      console.warn('Meta Pixel initialization warning:', e);
    }
  }

  // --- TikTok Pixel Injection ---
  private injectTikTokPixel(pixelId: string) {
    if (document.getElementById('tiktok-pixel-script')) return;

    try {
      /* eslint-disable */
      (function (w: any, d: any, t: any) {
        w.TiktokAnalyticsObject = t;
        var ttq = (w[t] = w[t] || []);
        ttq.methods = [
          'page',
          'track',
          'identify',
          'instances',
          'debug',
          'on',
          'off',
          'once',
          'ready',
          'alias',
          'group',
          'enableCookie',
          'disableCookie',
        ];
        ttq.setAndDefer = function (t: any, e: any) {
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        };
        for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
        ttq.instance = function (t: any) {
          for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++)
            ttq.setAndDefer(e, ttq.methods[n]);
          return e;
        };
        ttq.load = function (e: any, n: any) {
          var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
          (ttq._i = ttq._i || {})[e] = [];
          ttq._i[e]._u = i;
          ttq._t = ttq._t || {};
          ttq._t[e] = +new Date();
          ttq._o = ttq._o || {};
          ttq._o[e] = n || {};
          var o = document.createElement('script');
          o.type = 'text/javascript';
          o.async = !0;
          o.src = i + '?sdkid=' + e + '&lib=' + t;
          o.id = 'tiktok-pixel-script';
          var a = document.getElementsByTagName('script')[0];
          a.parentNode?.insertBefore(o, a);
        };

        ttq.load(pixelId.trim());
        ttq.page();
      })(window, document, 'ttq');
      /* eslint-enable */
    } catch (e) {
      console.warn('TikTok Pixel initialization warning:', e);
    }
  }

  // --- Google Tag Injection ---
  private injectGoogleTag(tagId: string) {
    if (document.getElementById('google-tag-script')) return;

    try {
      const script = document.createElement('script');
      script.id = 'google-tag-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${tagId.trim()}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer?.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', tagId.trim());
    } catch (e) {
      console.warn('Google Tag initialization warning:', e);
    }
  }

  // --- Event Tracking: View Content ---
  public trackViewContent(product: Product) {
    const settings = store.getPixelSettings();
    const value = product.dealPrice || product.price || 0;

    // Meta
    if (settings.facebookEnabled && window.fbq) {
      try {
        window.fbq('track', 'ViewContent', {
          content_name: product.title,
          content_category: product.category,
          content_ids: [product.id],
          content_type: 'product',
          value,
          currency: 'USD',
        });
      } catch {}
    }

    // TikTok
    if (settings.tiktokEnabled && window.ttq) {
      try {
        window.ttq.track('ViewContent', {
          content_id: product.id,
          content_type: 'product',
          content_name: product.title,
          price: value,
          value,
          currency: 'USD',
        });
      } catch {}
    }

    // Google
    if (settings.googleEnabled && window.gtag) {
      try {
        window.gtag('event', 'view_item', {
          currency: 'USD',
          value,
          items: [
            {
              item_id: product.id,
              item_name: product.title,
              item_category: product.category,
              price: value,
            },
          ],
        });
      } catch {}
    }
  }

  // --- Event Tracking: Buy Now Click (Treated as Purchase/Order for Ads) ---
  public trackBuyNow(product: Product, targetUrl?: string, customPrice?: number) {
    const settings = store.getPixelSettings();
    const value = customPrice !== undefined ? customPrice : product.dealPrice || product.price || 0;
    const now = new Date().toISOString();

    // 1. Meta (Facebook) Tracking
    if (settings.facebookEnabled) {
      try {
        if (settings.trackAsOrder) {
          // Treated as Purchase for ads optimization
          if (window.fbq) {
            window.fbq('track', 'Purchase', {
              content_name: product.title,
              content_category: product.category,
              content_ids: [product.id],
              content_type: 'product',
              value,
              currency: 'USD',
            });
          }
          store.recordPixelEvent({
            id: `px_fb_${Date.now()}`,
            timestamp: now,
            platform: 'facebook',
            eventName: 'Purchase (Order)',
            productTitle: product.title,
            productId: product.id,
            value,
            currency: 'USD',
            status: window.fbq ? 'fired' : 'simulated',
          });
        }

        if (settings.trackInitiateCheckout) {
          if (window.fbq) {
            window.fbq('track', 'InitiateCheckout', {
              content_name: product.title,
              content_ids: [product.id],
              content_type: 'product',
              value,
              currency: 'USD',
            });
          }
          store.recordPixelEvent({
            id: `px_fb_ic_${Date.now()}`,
            timestamp: now,
            platform: 'facebook',
            eventName: 'InitiateCheckout',
            productTitle: product.title,
            productId: product.id,
            value,
            currency: 'USD',
            status: window.fbq ? 'fired' : 'simulated',
          });
        }
      } catch (e) {
        console.warn('Meta Pixel track error:', e);
      }
    }

    // 2. TikTok Tracking
    if (settings.tiktokEnabled) {
      try {
        if (settings.trackAsOrder) {
          // CompletePayment is TikTok's conversion purchase event
          if (window.ttq) {
            window.ttq.track('CompletePayment', {
              content_id: product.id,
              content_type: 'product',
              content_name: product.title,
              quantity: 1,
              price: value,
              value,
              currency: 'USD',
            });
          }
          store.recordPixelEvent({
            id: `px_tt_${Date.now()}`,
            timestamp: now,
            platform: 'tiktok',
            eventName: 'CompletePayment (Order)',
            productTitle: product.title,
            productId: product.id,
            value,
            currency: 'USD',
            status: window.ttq ? 'fired' : 'simulated',
          });
        }

        if (settings.trackInitiateCheckout) {
          if (window.ttq) {
            window.ttq.track('InitiateCheckout', {
              content_id: product.id,
              content_type: 'product',
              content_name: product.title,
              quantity: 1,
              price: value,
              value,
              currency: 'USD',
            });
          }
          store.recordPixelEvent({
            id: `px_tt_ic_${Date.now()}`,
            timestamp: now,
            platform: 'tiktok',
            eventName: 'InitiateCheckout',
            productTitle: product.title,
            productId: product.id,
            value,
            currency: 'USD',
            status: window.ttq ? 'fired' : 'simulated',
          });
        }
      } catch (e) {
        console.warn('TikTok Pixel track error:', e);
      }
    }

    // 3. Google Tag Tracking
    if (settings.googleEnabled) {
      try {
        if (settings.trackAsOrder) {
          const transactionId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          if (window.gtag) {
            window.gtag('event', 'purchase', {
              transaction_id: transactionId,
              value,
              currency: 'USD',
              items: [
                {
                  item_id: product.id,
                  item_name: product.title,
                  item_category: product.category,
                  price: value,
                  quantity: 1,
                },
              ],
            });
            window.gtag('event', 'conversion', {
              send_to: settings.googleTagId,
              value,
              currency: 'USD',
              transaction_id: transactionId,
            });
          }
          store.recordPixelEvent({
            id: `px_gg_${Date.now()}`,
            timestamp: now,
            platform: 'google',
            eventName: 'purchase (Conversion)',
            productTitle: product.title,
            productId: product.id,
            value,
            currency: 'USD',
            status: window.gtag ? 'fired' : 'simulated',
          });
        }

        if (settings.trackInitiateCheckout) {
          if (window.gtag) {
            window.gtag('event', 'begin_checkout', {
              value,
              currency: 'USD',
              items: [
                {
                  item_id: product.id,
                  item_name: product.title,
                  item_category: product.category,
                  price: value,
                  quantity: 1,
                },
              ],
            });
          }
          store.recordPixelEvent({
            id: `px_gg_bc_${Date.now()}`,
            timestamp: now,
            platform: 'google',
            eventName: 'begin_checkout',
            productTitle: product.title,
            productId: product.id,
            value,
            currency: 'USD',
            status: window.gtag ? 'fired' : 'simulated',
          });
        }
      } catch (e) {
        console.warn('Google Tag track error:', e);
      }
    }
  }

  // --- Manual Test Fire for Admin Verification ---
  public testFireAll() {
    const dummyProduct: Product = {
      id: 'test-pixel-prod',
      title: 'Kefayaan Ad Pixel Test Product',
      slug: 'test-pixel',
      brand: 'Kefayaan',
      category: 'Cat Food & Pet Care',
      price: 49.99,
      dealPrice: 39.99,
      amazonUrl: 'https://link.amazon/B0dbjUEFY',
      image: '',
      gallery: [],
      videoType: 'none',
      rating: 5,
      reviewCount: 1,
      features: [],
      description: 'Test fire payload',
      inStock: true,
      clicksCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.trackBuyNow(dummyProduct, 'https://link.amazon/B0dbjUEFY', 39.99);
  }
}

export const pixelService = new PixelTrackingService();
