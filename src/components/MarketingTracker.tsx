'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function MarketingTracker() {
  const pathname = usePathname();
  const [pixels, setPixels] = useState<{
    facebookPixelId?: string;
    tiktokPixelId?: string;
    googleAnalyticsId?: string;
  }>({});

  useEffect(() => {
    fetch('/api/admin/marketing')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.marketing) {
          setPixels(data.marketing);

          // Inject Meta / Facebook Pixel
          if (data.marketing.facebookPixelId && !window.fbq) {
            initFacebookPixel(data.marketing.facebookPixelId);
          }

          // Inject TikTok Pixel
          if (data.marketing.tiktokPixelId && !window.ttq) {
            initTikTokPixel(data.marketing.tiktokPixelId);
          }

          // Inject Google Analytics / Tag Manager
          if (data.marketing.googleAnalyticsId && !window.gtag) {
            initGoogleAnalytics(data.marketing.googleAnalyticsId);
          }
        }
      })
      .catch((err) => console.error('Error fetching marketing pixel config:', err));
  }, []);

  // Track PageView on route changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.fbq) window.fbq('track', 'PageView');
      if (window.ttq) window.ttq.page();
      if (window.gtag && pixels.googleAnalyticsId) {
        window.gtag('config', pixels.googleAnalyticsId, { page_path: pathname });
      }
    }
  }, [pathname, pixels]);

  return null;
}

// Meta / Facebook Pixel Injector
function initFacebookPixel(pixelId: string) {
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
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  if (window.fbq) {
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }
}

// TikTok Pixel Injector
function initTikTokPixel(pixelId: string) {
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
      (o.type = 'text/javascript'), (o.async = !0), (o.src = i + '?sdkid=' + e + '&lib=' + t);
      var a = document.getElementsByTagName('script')[0];
      a.parentNode?.insertBefore(o, a);
    };
  })(window, document, 'ttq');
  /* eslint-enable */

  if (window.ttq) {
    window.ttq.load(pixelId);
    window.ttq.page();
  }
}

// Google Analytics / Tag Manager Injector
function initGoogleAnalytics(gaId: string) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    (window.dataLayer as any[]).push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', gaId);
}

// Declare global types for TS
declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    ttq?: any;
    TiktokAnalyticsObject?: any;
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}
