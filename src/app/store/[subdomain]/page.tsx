'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Copy,
  Check,
  Package,
  Sparkles,
  RefreshCcw,
  ShieldCheck,
  Globe,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  Layers,
  ArrowRight,
  Clock,
  Ticket,
  X,
  CreditCard,
  Send,
  Eye,
  KeyRound,
  Smartphone,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Hash,
} from 'lucide-react';
import { useCurrency } from '@/components/CurrencyContext';

export default function TenantStorefrontPage() {
  const params = useParams();
  const subdomain = params?.subdomain as string;
  const { currency, formatPrice, setCurrency } = useCurrency();

  const [loading, setLoading] = useState<boolean>(true);
  const [storeData, setStoreData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Global Mode Switcher: Products vs Exclusive vs OTP
  const [catalogMode, setCatalogMode] = useState<'PRODUCTS' | 'EXCLUSIVE' | 'OTP'>('PRODUCTS');

  // Product Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'PRICE_ASC' | 'PRICE_DESC'>('DEFAULT');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Products Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);

  // OTP Filters & Tariffs State
  const [otpCountries, setOtpCountries] = useState<any[]>([]);
  const [otpServices, setOtpServices] = useState<any[]>([]);
  const [selectedOtpCountry, setSelectedOtpCountry] = useState<string>('1');
  const [selectedOtpCategory, setSelectedOtpCategory] = useState<string>('Tous');
  const [otpSearchQuery, setOtpSearchQuery] = useState<string>('');
  const [loadingOtp, setLoadingOtp] = useState<boolean>(false);

  // OTP Pagination State
  const [currentOtpPage, setCurrentOtpPage] = useState<number>(1);
  const [otpItemsPerPage, setOtpItemsPerPage] = useState<number>(16);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy, inStockOnly, catalogMode]);

  useEffect(() => {
    setCurrentOtpPage(1);
  }, [selectedOtpCountry, selectedOtpCategory, otpSearchQuery]);

  // Product Ticket Creation Modal State
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerAccounts, setCustomerAccounts] = useState<string>('');
  const [creatingTicket, setCreatingTicket] = useState<boolean>(false);
  const [createdTicketResult, setCreatedTicketResult] = useState<any | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);

  // OTP Ticket Creation Modal State
  const [selectedOtpService, setSelectedOtpService] = useState<any | null>(null);
  const [otpCustomerEmail, setOtpCustomerEmail] = useState<string>('');
  const [otpCustomerName, setOtpCustomerName] = useState<string>('');
  const [otpCustomerPhone, setOtpCustomerPhone] = useState<string>('');
  const [creatingOtpTicket, setCreatingOtpTicket] = useState<boolean>(false);
  const [createdOtpTicketResult, setCreatedOtpTicketResult] = useState<any | null>(null);
  const [otpTicketError, setOtpTicketError] = useState<string | null>(null);
  const [copiedOtpTicket, setCopiedOtpTicket] = useState(false);

  // Universal Ticket Lookup Modal State (Both TK- and OTP-)
  const [showLookupModal, setShowLookupModal] = useState<boolean>(false);
  const [lookupTicketCode, setLookupTicketCode] = useState<string>('');
  const [searchingTicket, setSearchingTicket] = useState<boolean>(false);
  const [ticketLookupResult, setTicketLookupResult] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);
  const [copiedOtpCode, setCopiedOtpCode] = useState(false);
  const [copiedOtpPhone, setCopiedOtpPhone] = useState(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);

  // Online Payment Processing State
  const [payingGateway, setPayingGateway] = useState<'FEEXPAY' | 'MONEROO' | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paidSuccessAlert, setPaidSuccessAlert] = useState<boolean>(false);

  const otpCategories = ['Tous', 'Messagerie', 'Réseaux Sociaux', 'IA & APIs', 'Finance', 'Comptes & Outils'];

  // Fetch Storefront Data
  const fetchStorefront = async () => {
    if (!subdomain) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tenant/storefront?subdomain=${encodeURIComponent(subdomain)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Boutique introuvable');
      }
      setStoreData(data.store);
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch OTP Tariffs for the Tenant
  const fetchOtpTariffs = async (countryCode: string) => {
    if (!subdomain) return;
    setLoadingOtp(true);
    try {
      const res = await fetch(
        `/api/tenant/otp/tariffs?subdomain=${encodeURIComponent(subdomain)}&country=${encodeURIComponent(countryCode)}`
      );
      const data = await res.json();
      if (data.success) {
        setOtpCountries(data.countries || []);
        setOtpServices(data.services || []);
      }
    } catch (err: any) {
      console.error('Error fetching tenant OTP tariffs:', err);
    } finally {
      setLoadingOtp(false);
    }
  };

  useEffect(() => {
    fetchStorefront();
  }, [subdomain]);

  useEffect(() => {
    if (subdomain) {
      fetchOtpTariffs(selectedOtpCountry);
    }
  }, [subdomain, selectedOtpCountry]);

  // Live polling when viewing an active OTP ticket in Lookup modal
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (
      ticketLookupResult &&
      ticketLookupResult.isOtp &&
      ticketLookupResult.status === 'WAITING_SMS'
    ) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/tenant/otp/tickets/lookup?code=${encodeURIComponent(ticketLookupResult.ticketCode)}&subdomain=${encodeURIComponent(subdomain)}`
          );
          const data = await res.json();
          if (data.success && data.order) {
            setTicketLookupResult({ ...data.order, isOtp: true });
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [ticketLookupResult, subdomain]);

  // 1. Boutique Visit Tracking (Analytics)
  useEffect(() => {
    if (!subdomain) return;
    try {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: typeof window !== 'undefined' ? window.location.pathname : '',
          subdomain,
          referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
        }),
      }).catch(() => {});
    } catch (e) {
      // ignore
    }
  }, [subdomain]);

  // 2. Marketing Pixels Injection (Meta FB, TikTok, Google Analytics)
  useEffect(() => {
    if (!storeData) return;

    // A. Meta / Facebook Pixel
    if (storeData.facebookPixelId && typeof window !== 'undefined') {
      const fbId = String(storeData.facebookPixelId).trim();
      if (fbId && !(window as any).fbq) {
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
      }
      try {
        if ((window as any).fbq) {
          (window as any).fbq('init', fbId);
          (window as any).fbq('track', 'PageView');
        }
      } catch (e) {}
    }

    // B. TikTok Pixel
    if (storeData.tiktokPixelId && typeof window !== 'undefined') {
      const ttId = String(storeData.tiktokPixelId).trim();
      if (ttId && !(window as any).ttq) {
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
            ttq._i = ttq._i || {};
            ttq._i[e] = [];
            ttq._i[e]._u = i;
            ttq._t = ttq._t || {};
            ttq._t[e] = +new Date();
            ttq._o = ttq._o || {};
            ttq._o[e] = n || {};
            var o = d.createElement('script');
            o.type = 'text/javascript';
            o.async = !0;
            o.src = i + '?sdkid=' + e + '&lib=' + t;
            var a = d.getElementsByTagName('script')[0];
            a.parentNode.insertBefore(o, a);
          };
        })(window, document, 'ttq');
      }
      try {
        if ((window as any).ttq) {
          (window as any).ttq.load(ttId);
          (window as any).ttq.page();
        }
      } catch (e) {}
    }

    // C. Google Analytics 4 (GA4 / GTM)
    if (storeData.googleAnalyticsId && typeof window !== 'undefined') {
      const gaId = String(storeData.googleAnalyticsId).trim();
      const scriptId = 'ga4-gtag-script';
      if (gaId && !document.getElementById(scriptId)) {
        const s = document.createElement('script');
        s.id = scriptId;
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(s);

        (window as any).dataLayer = (window as any).dataLayer || [];
        function gtag(...args: any[]) {
          (window as any).dataLayer.push(arguments);
        }
        (window as any).gtag = gtag;
        gtag('js', new Date());
        gtag('config', gaId);
      }
    }
  }, [storeData]);

  // Helper to trigger pixel conversion events
  const triggerPixelEvent = (
    eventName: 'ViewContent' | 'Purchase',
    payload: {
      content_name?: string;
      content_type?: string;
      value?: number;
      currency?: string;
    }
  ) => {
    try {
      if (typeof window === 'undefined') return;
      // Meta FB Pixel
      if ((window as any).fbq) {
        (window as any).fbq('track', eventName, payload);
      }
      // TikTok Pixel
      if ((window as any).ttq) {
        (window as any).ttq.track(eventName === 'Purchase' ? 'CompletePayment' : 'ViewContent', {
          content_name: payload.content_name,
          content_type: payload.content_type,
          value: payload.value,
          currency: payload.currency || 'XOF',
        });
      }
      // Google Analytics
      if ((window as any).gtag) {
        if (eventName === 'Purchase') {
          (window as any).gtag('event', 'purchase', {
            transaction_id: payload.content_name,
            value: payload.value,
            currency: payload.currency || 'XOF',
          });
        } else {
          (window as any).gtag('event', 'view_item', {
            items: [{ item_name: payload.content_name, price: payload.value }],
          });
        }
      }
    } catch (e) {
      console.debug('Pixel track error:', e);
    }
  };

  // Handle Product Ticket Creation
  const handleCreateProductTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setCreatingTicket(true);
    setTicketError(null);
    setCreatedTicketResult(null);

    try {
      const res = await fetch('/api/tenant/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          productId: selectedProduct.id,
          quantity,
          customerEmail,
          customerName,
          customerAccounts,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la création du ticket');
      }

      setCreatedTicketResult(data);

      // Pixel Track Purchase Event
      triggerPixelEvent('Purchase', {
        content_name: `Ticket #${data.order?.ticketCode || data.ticketCode}`,
        content_type: 'product_order',
        value: (selectedProduct.sellingPrice || 0) * quantity,
        currency,
      });
    } catch (err: any) {
      setTicketError(err.message);
    } finally {
      setCreatingTicket(false);
    }
  };

  // Handle OTP Ticket Creation
  const handleCreateOtpTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOtpService) return;
    setCreatingOtpTicket(true);
    setOtpTicketError(null);
    setCreatedOtpTicketResult(null);

    try {
      const res = await fetch('/api/tenant/otp/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          service: selectedOtpService.code,
          country: selectedOtpCountry,
          customerEmail: otpCustomerEmail,
          customerName: otpCustomerName,
          customerPhone: otpCustomerPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la création du ticket OTP');
      }

      setCreatedOtpTicketResult(data);

      // Pixel Track Purchase Event
      triggerPixelEvent('Purchase', {
        content_name: `OTP #${data.order?.ticketCode || data.ticketCode}`,
        content_type: 'otp_order',
        value: selectedOtpService.sellingPrice || 0.45,
        currency,
      });
    } catch (err: any) {
      setOtpTicketError(err.message);
    } finally {
      setCreatingOtpTicket(false);
    }
  };

  // Universal Ticket Lookup (Handles both TK- and OTP-)
  const handleLookupTicket = async (codeToSearch?: string) => {
    const rawCode = (codeToSearch || lookupTicketCode || '').trim();
    if (!rawCode) return;

    setSearchingTicket(true);
    setLookupError(null);
    setTicketLookupResult(null);

    const isExplicitOtp = rawCode.toUpperCase().startsWith('OTP-');

    try {
      if (isExplicitOtp) {
        // Query OTP endpoint directly
        const res = await fetch(
          `/api/tenant/otp/tickets/lookup?code=${encodeURIComponent(rawCode)}&subdomain=${encodeURIComponent(subdomain)}`
        );
        const data = await res.json();
        if (data.success && data.order) {
          setTicketLookupResult({ ...data.order, isOtp: true });
          return;
        } else {
          throw new Error(data.message || 'Ticket OTP introuvable');
        }
      }

      // Try regular product ticket first
      const prodRes = await fetch(
        `/api/tenant/tickets/lookup?code=${encodeURIComponent(rawCode)}&subdomain=${encodeURIComponent(subdomain)}`
      );
      const prodData = await prodRes.json();

      if (prodData.success && prodData.order) {
        setTicketLookupResult({ ...prodData.order, isOtp: false });
        return;
      }

      // Fallback: try OTP lookup in case prefix was omitted
      const otpRes = await fetch(
        `/api/tenant/otp/tickets/lookup?code=${encodeURIComponent(rawCode)}&subdomain=${encodeURIComponent(subdomain)}`
      );
      const otpData = await otpRes.json();

      if (otpData.success && otpData.order) {
        setTicketLookupResult({ ...otpData.order, isOtp: true });
        return;
      }

      throw new Error('Aucun ticket trouvé avec ce code sur cette boutique.');
    } catch (err: any) {
      setLookupError(err.message);
    } finally {
      setSearchingTicket(false);
    }
  };

  // Check URL parameters on mount for direct ticket lookup or payment return
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code') || urlParams.get('ticket');
    const lookup = urlParams.get('lookup');
    const paid = urlParams.get('paid');

    if (paid === 'true') {
      setPaidSuccessAlert(true);
    }

    if (code && (lookup === 'true' || paid === 'true')) {
      setLookupTicketCode(code);
      setShowLookupModal(true);
      handleLookupTicket(code);
    }
  }, [subdomain]);

  // Handle initiating online payment via FeexPay or Moneroo
  const handleInitiateOnlinePayment = async (ticketCode: string, gateway: 'FEEXPAY' | 'MONEROO') => {
    if (!ticketCode) return;
    setPayingGateway(gateway);
    setPaymentError(null);

    try {
      const endpoint = gateway === 'FEEXPAY' ? '/api/feexpay/init' : '/api/moneroo/init';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.paymentUrl) {
        throw new Error(data.message || `Échec d'initialisation du paiement ${gateway === 'FEEXPAY' ? 'FeexPay' : 'Moneroo'}`);
      }

      // Redirect user to payment checkout page
      window.location.href = data.paymentUrl;
    } catch (err: any) {
      setPaymentError(err.message || 'Erreur lors de la redirection vers le paiement.');
      setPayingGateway(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Ouverture de la boutique...</p>
        </div>
      </div>
    );
  }

  if (error || !storeData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white px-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl bg-slate-900 border border-slate-800">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
          <h1 className="text-xl font-bold">Boutique introuvable</h1>
          <p className="text-xs text-slate-400">
            {error || 'La boutique demandée n\'existe pas ou a été désactivée.'}
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  // Filter & Sort Products
  const currentCatalogProducts = products.filter((p) => {
    if (catalogMode === 'EXCLUSIVE') return Boolean(p.isExclusive);
    if (catalogMode === 'PRODUCTS') return !p.isExclusive;
    return true;
  });

  const productCategories = ['Tous', ...Array.from(new Set(currentCatalogProducts.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = currentCatalogProducts
    .filter((p) => {
      const matchCat = selectedCategory === 'Tous' || p.category === selectedCategory;
      const matchSearch =
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStock = inStockOnly ? (p.stock > 0 && p.isAvailable) : true;
      return matchCat && matchSearch && matchStock;
    })
    .sort((a, b) => {
      if (sortBy === 'PRICE_ASC') return a.sellingPrice - b.sellingPrice;
      if (sortBy === 'PRICE_DESC') return b.sellingPrice - a.sellingPrice;
      return 0;
    });

  // Products Pagination Calculation
  const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const productStartIndex = (currentPage - 1) * itemsPerPage;
  const productEndIndex = Math.min(productStartIndex + itemsPerPage, filteredProducts.length);
  const paginatedProducts = filteredProducts.slice(productStartIndex, productEndIndex);

  // Filter OTP Services
  const filteredOtpServices = otpServices.filter((s) => {
    const matchCat = selectedOtpCategory === 'Tous' || s.category === selectedOtpCategory;
    const matchSearch =
      otpSearchQuery === '' ||
      s.name.toLowerCase().includes(otpSearchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(otpSearchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // OTP Pagination Calculation
  const totalOtpPages = Math.max(1, Math.ceil(filteredOtpServices.length / otpItemsPerPage));
  const otpStartIndex = (currentOtpPage - 1) * otpItemsPerPage;
  const otpEndIndex = Math.min(otpStartIndex + otpItemsPerPage, filteredOtpServices.length);
  const paginatedOtpServices = filteredOtpServices.slice(otpStartIndex, otpEndIndex);

  const selectedCountryObj = otpCountries.find((c) => c.code === selectedOtpCountry) || {
    flag: '🇺🇸',
    name: 'États-Unis',
    prefix: '+1',
  };

  // Theme presets & dynamic visual styling
  const THEME_STYLES: Record<string, {
    bgRoot: string;
    bgHeader: string;
    bgHero: string;
    bgCard: string;
    cardBorder: string;
    cardHoverBorder: string;
    accentGradient: string;
    accentText: string;
    badgeStyle: string;
  }> = {
    'cyber-dark': {
      bgRoot: 'bg-slate-950',
      bgHeader: 'bg-slate-900/90 border-slate-800',
      bgHero: 'bg-slate-900/30 border-slate-800/80',
      bgCard: 'bg-slate-900/80',
      cardBorder: 'border-slate-800',
      cardHoverBorder: 'hover:border-sky-500/50',
      accentGradient: 'from-sky-500 to-indigo-600',
      accentText: 'text-sky-400',
      badgeStyle: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    },
    'emerald-luxury': {
      bgRoot: 'bg-[#040d0a]',
      bgHeader: 'bg-[#061713]/90 border-emerald-950',
      bgHero: 'bg-[#061713]/40 border-emerald-950/60',
      bgCard: 'bg-[#081d17]/80',
      cardBorder: 'border-emerald-900/40',
      cardHoverBorder: 'hover:border-emerald-500/50',
      accentGradient: 'from-emerald-500 to-teal-600',
      accentText: 'text-emerald-400',
      badgeStyle: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    'neon-violet': {
      bgRoot: 'bg-[#0b0816]',
      bgHeader: 'bg-[#120d24]/90 border-purple-950',
      bgHero: 'bg-[#120d24]/40 border-purple-950/60',
      bgCard: 'bg-[#17102e]/80',
      cardBorder: 'border-purple-900/40',
      cardHoverBorder: 'hover:border-purple-500/50',
      accentGradient: 'from-violet-500 to-fuchsia-600',
      accentText: 'text-purple-400',
      badgeStyle: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    'ocean-deep': {
      bgRoot: 'bg-[#070e1e]',
      bgHeader: 'bg-[#0a1631]/90 border-blue-950',
      bgHero: 'bg-[#0a1631]/40 border-blue-950/60',
      bgCard: 'bg-[#0d1c3e]/80',
      cardBorder: 'border-blue-900/40',
      cardHoverBorder: 'hover:border-blue-500/50',
      accentGradient: 'from-blue-600 to-cyan-500',
      accentText: 'text-blue-400',
      badgeStyle: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    'amber-gold': {
      bgRoot: 'bg-[#0c0905]',
      bgHeader: 'bg-[#171207]/90 border-amber-950',
      bgHero: 'bg-[#171207]/40 border-amber-950/60',
      bgCard: 'bg-[#1e1709]/80',
      cardBorder: 'border-amber-900/40',
      cardHoverBorder: 'hover:border-amber-500/50',
      accentGradient: 'from-amber-500 to-yellow-500',
      accentText: 'text-amber-400',
      badgeStyle: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    'crimson-dark': {
      bgRoot: 'bg-[#100608]',
      bgHeader: 'bg-[#1b0a0e]/90 border-rose-950',
      bgHero: 'bg-[#1b0a0e]/40 border-rose-950/60',
      bgCard: 'bg-[#230c12]/80',
      cardBorder: 'border-rose-900/40',
      cardHoverBorder: 'hover:border-rose-500/50',
      accentGradient: 'from-rose-500 to-red-600',
      accentText: 'text-rose-400',
      badgeStyle: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
    'clean-slate': {
      bgRoot: 'bg-[#0f141c]',
      bgHeader: 'bg-[#161d27]/90 border-slate-800',
      bgHero: 'bg-[#161d27]/40 border-slate-800/80',
      bgCard: 'bg-[#1b2330]/80',
      cardBorder: 'border-slate-800',
      cardHoverBorder: 'hover:border-slate-500',
      accentGradient: 'from-slate-500 to-zinc-600',
      accentText: 'text-slate-300',
      badgeStyle: 'bg-slate-700/40 text-slate-300 border-slate-600',
    },
  };

  const activePresetKey = storeData.themePreset || 'cyber-dark';
  const currentTheme = THEME_STYLES[activePresetKey] || THEME_STYLES['cyber-dark'];
  const activeFont = storeData.fontFamily || 'Inter';
  const activeBtnColor = storeData.buttonColor || '#0284c7';
  const activeBtnTextColor = storeData.buttonTextColor || '#ffffff';
  const activeBtnRadius = storeData.buttonRadius || 'rounded-xl';

  const fontHref = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(activeFont).replace(/%20/g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;

  return (
    <div
      className={`min-h-screen ${currentTheme.bgRoot} text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white transition-colors duration-300`}
      style={{ fontFamily: `'${activeFont}', sans-serif` }}
    >
      {/* Dynamic Google Font import */}
      <link rel="stylesheet" href={fontHref} key={activeFont} />

      {/* Announcement Banner */}
      {storeData.bannerAnnouncement && (
        <div className={`py-2 px-4 bg-gradient-to-r ${currentTheme.accentGradient} text-white text-xs font-bold text-center shadow-md`}>
          {storeData.bannerAnnouncement}
        </div>
      )}

      {/* Header / Navbar */}
      <header className={`sticky top-0 z-40 ${currentTheme.bgHeader} border-b backdrop-blur-xl transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Store Name */}
          <div className="flex items-center gap-3">
            {storeData.logoUrl ? (
              <img
                src={storeData.logoUrl}
                alt={storeData.storeName}
                className={`w-10 h-10 ${activeBtnRadius === 'rounded-full' ? 'rounded-full' : 'rounded-xl'} object-cover border border-slate-700/60 shadow-md`}
              />
            ) : (
              <div
                className={`w-10 h-10 ${activeBtnRadius === 'rounded-full' ? 'rounded-full' : 'rounded-xl'} flex items-center justify-center font-black text-white text-lg shadow-lg`}
                style={{ backgroundColor: activeBtnColor }}
              >
                {storeData.storeName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="font-black text-base sm:text-lg text-white tracking-tight">
                {storeData.storeName}
              </h1>
              <p className="text-[10px] text-slate-400 max-w-[180px] sm:max-w-xs truncate">
                {storeData.tagline || 'Boutique officielle de licences et numéros virtuels'}
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Suivre mon Ticket Button */}
            <button
              onClick={() => {
                setShowLookupModal(true);
                setLookupError(null);
                setTicketLookupResult(null);
              }}
              className={`px-3 py-1.5 ${activeBtnRadius} bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm`}
              style={{ color: activeBtnColor }}
              title="Suivre un ticket ou récupérer une commande / code SMS"
            >
              <Ticket className="w-3.5 h-3.5" style={{ color: activeBtnColor }} />
              <span className="hidden sm:inline">Suivre un Ticket</span>
            </button>

            {/* Currency Selector */}
            <div className="bg-slate-950 border border-slate-800 p-0.5 rounded-xl flex items-center">
              <button
                onClick={() => setCurrency('FCFA')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  currency === 'FCFA'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                FCFA
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  currency === 'USD'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                USD
              </button>
            </div>

            {/* Contact WhatsApp */}
            {storeData.contactWhatsApp && (
              <a
                href={`https://wa.me/${storeData.contactWhatsApp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Contact</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className={`relative py-8 px-4 sm:px-6 lg:px-8 border-b ${currentTheme.bgHero} overflow-hidden`}>
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-gradient-to-r ${currentTheme.accentGradient} opacity-15 blur-3xl pointer-events-none`} />
        <div className="max-w-4xl mx-auto text-center space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800/80 text-slate-300 border border-slate-700/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Catalogue Officiel • Licences, Logiciels & Numéros OTP Virtuels</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Bienvenue sur <span style={{ color: activeBtnColor }}>{storeData.storeName}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            {storeData.tagline || 'Commandez vos licences, abonnements et numéros de vérification SMS en toute sécurité.'}
          </p>

          {/* MAIN CATALOG NAVIGATION TABS */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => {
                setCatalogMode('PRODUCTS');
                setSelectedCategory('Tous');
              }}
              style={catalogMode === 'PRODUCTS' ? {
                backgroundColor: activeBtnColor,
                color: activeBtnTextColor,
              } : {}}
              className={`px-4 sm:px-5 py-2.5 ${activeBtnRadius} text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg ${
                catalogMode === 'PRODUCTS'
                  ? 'ring-2 ring-white/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Abonnements & Logiciels ({products.filter((p) => !p.isExclusive).length})</span>
            </button>

            {products.some((p) => p.isExclusive) && (
              <button
                onClick={() => {
                  setCatalogMode('EXCLUSIVE');
                  setSelectedCategory('Tous');
                }}
                className={`px-4 sm:px-5 py-2.5 ${activeBtnRadius} text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg ${
                  catalogMode === 'EXCLUSIVE'
                    ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white ring-2 ring-amber-400/40 font-black shadow-purple-900/40'
                    : 'bg-slate-900 border border-amber-500/30 text-amber-300 hover:text-amber-200 hover:border-amber-400'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Produits Exclusifs VIP ({products.filter((p) => p.isExclusive).length})</span>
              </button>
            )}

            <button
              onClick={() => {
                setCatalogMode('OTP');
                setSelectedCategory('Tous');
              }}
              style={catalogMode === 'OTP' ? {
                backgroundColor: activeBtnColor,
                color: activeBtnTextColor,
              } : {}}
              className={`px-4 sm:px-5 py-2.5 ${activeBtnRadius} text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg ${
                catalogMode === 'OTP'
                  ? 'ring-2 ring-white/20 font-black'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Numéros Virtuels OTP & SMS ({otpServices.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* ============================================================ */}
        {/* MODE 1: PRODUCTS & LICENSES                                  */}
        {/* ============================================================ */}
        {(catalogMode === 'PRODUCTS' || catalogMode === 'EXCLUSIVE') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* VIP Exclusive Banner */}
            {catalogMode === 'EXCLUSIVE' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900/60 border border-amber-500/30 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    Sélection Privée & Offres Exclusives VIP
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Haute Qualité Garantie
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Comptes premium privés, abonnements à vie et accès réservés. Chaque commande bénéficie d'une activation prioritaire et d'un support dédié via votre code ticket.
                  </p>
                </div>
              </div>
            )}
            {/* Search & Filters Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un logiciel, un compte, une licence..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Controls: Stock toggle & Sorting */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* In Stock toggle */}
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 hover:border-slate-700">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
                  />
                  <span>En stock uniquement</span>
                </label>

                {/* Sort selector */}
                <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="DEFAULT" className="bg-slate-900 text-white">Tri : Pertinence</option>
                    <option value="PRICE_ASC" className="bg-slate-900 text-white">Prix : Croissant</option>
                    <option value="PRICE_DESC" className="bg-slate-900 text-white">Prix : Décroissant</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {productCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={selectedCategory === cat ? {
                    backgroundColor: activeBtnColor,
                    color: activeBtnTextColor,
                  } : {}}
                  className={`px-3.5 py-1.5 ${activeBtnRadius} text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'shadow-md ring-1 ring-white/20'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs bg-slate-900/40 border border-slate-800 rounded-3xl">
                Aucun article ne correspond à votre recherche dans cette catégorie.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {paginatedProducts.map((p) => {
                  const inStock = p.stock > 0 && p.isAvailable;
                  return (
                    <div
                      key={p.id}
                      className={`${currentTheme.bgCard} ${currentTheme.cardBorder} ${currentTheme.cardHoverBorder} rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-xl group`}
                    >
                      <div className="space-y-3">
                        {/* Image / Thumbnail */}
                        <div className="aspect-video w-full rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden relative flex items-center justify-center">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="text-slate-600 font-black text-2xl uppercase">
                              {p.title.charAt(0)}
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className="absolute top-2 right-2 flex items-center gap-1">
                            {p.isExclusive && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-md flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> VIP
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                inStock
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {inStock ? (p.badge || 'EN STOCK') : 'ÉPUISÉ'}
                            </span>
                          </div>
                        </div>

                        {/* Title & Category */}
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${currentTheme.accentText}`}>
                            {p.category}
                          </span>
                          <h3 className="font-bold text-sm text-white line-clamp-2 mt-0.5" title={p.title}>
                            {p.title}
                          </h3>
                        </div>

                        {/* Description */}
                        {p.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>
                        )}
                      </div>

                      {/* Footer: Price & CTA */}
                      <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Prix client</span>
                          <span className="text-base font-black text-white font-mono">
                            {formatPrice(p.sellingPrice)}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setQuantity(1);
                            setCustomerEmail('');
                            setCustomerName('');
                            setCustomerAccounts('');
                            setCreatedTicketResult(null);
                            setTicketError(null);
                            triggerPixelEvent('ViewContent', {
                              content_name: p.title || p.name,
                              content_type: 'product',
                              value: p.sellingPrice,
                              currency,
                            });
                          }}
                          disabled={!inStock}
                          style={{
                            backgroundColor: activeBtnColor,
                            color: activeBtnTextColor,
                          }}
                          className={`px-3.5 py-2 ${activeBtnRadius} font-bold text-xs flex items-center gap-1.5 transition-all shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none`}
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Commander</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Products Pagination Controls */}
            {filteredProducts.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/80">
                {/* Counter & items per page */}
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>
                    Affichage de <strong className="text-white font-mono">{productStartIndex + 1}</strong> à{' '}
                    <strong className="text-white font-mono">{productEndIndex}</strong> sur{' '}
                    <strong className="text-white font-mono">{filteredProducts.length}</strong> article{filteredProducts.length > 1 ? 's' : ''}
                  </span>

                  <div className="flex items-center gap-1.5 ml-1">
                    <span className="hidden md:inline">Par page :</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      <option value={8}>8</option>
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={36}>36</option>
                    </select>
                  </div>
                </div>

                {/* Page Navigation Buttons */}
                {totalProductPages > 1 && (
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    <button
                      onClick={() => {
                        setCurrentPage((prev) => Math.max(1, prev - 1));
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 ${activeBtnRadius} text-xs font-bold bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-all`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Précédent</span>
                    </button>

                    {Array.from({ length: totalProductPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return (
                          page === 1 ||
                          page === totalProductPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .reduce((acc: (number | string)[], page, idx, arr) => {
                        if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                          acc.push('...');
                        }
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((item, idx) => {
                        if (item === '...') {
                          return (
                            <span key={`dots-${idx}`} className="px-1 text-xs text-slate-500">
                              ...
                            </span>
                          );
                        }
                        const pageNum = item as number;
                        const isActive = pageNum === currentPage;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 380, behavior: 'smooth' });
                            }}
                            style={
                              isActive
                                ? {
                                    backgroundColor: activeBtnColor,
                                    color: activeBtnTextColor,
                                  }
                                : {}
                            }
                            className={`w-8 h-8 ${activeBtnRadius} text-xs font-bold transition-all flex items-center justify-center ${
                              isActive
                                ? 'shadow-md ring-1 ring-white/20'
                                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                    <button
                      onClick={() => {
                        setCurrentPage((prev) => Math.min(totalProductPages, prev + 1));
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                      disabled={currentPage === totalProductPages}
                      className={`px-3 py-1.5 ${activeBtnRadius} text-xs font-bold bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-all`}
                    >
                      <span className="hidden sm:inline">Suivant</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE 2: OTP / VIRTUAL NUMBERS                                */}
        {/* ============================================================ */}
        {catalogMode === 'OTP' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-slate-900 to-teal-500/10 border border-emerald-500/30 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Zap className="w-3 h-3 fill-current" />
                  <span>Activation SMS Instantanée</span>
                </div>
                <h3 className="text-lg font-black text-white">
                  Numéros Virtuels pour Vérification de Comptes (OTP)
                </h3>
                <p className="text-xs text-slate-400 max-w-xl">
                  Sélectionnez votre pays et votre service (WhatsApp, Telegram, ChatGPT, etc.). Votre ticket généré permettra d'obtenir votre numéro et de recevoir votre SMS en direct.
                </p>
              </div>

              {/* Country Selector Dropdown */}
              <div className="bg-slate-950 border border-slate-800 p-2 rounded-2xl flex items-center gap-2 self-start md:self-auto">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />
                <select
                  value={selectedOtpCountry}
                  onChange={(e) => setSelectedOtpCountry(e.target.value)}
                  className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer pr-2"
                >
                  {otpCountries.map((c) => (
                    <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                      {c.flag} {c.name} ({c.prefix})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* OTP Filter Bar: Search & Category pills */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search in OTP services */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={otpSearchQuery}
                    onChange={(e) => setOtpSearchQuery(e.target.value)}
                    placeholder="Chercher un service (WhatsApp, Telegram, OpenAI...)"
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span>Pays actif :</span>
                  <span className="font-bold text-white font-mono">
                    {selectedCountryObj.flag} {selectedCountryObj.name} ({selectedCountryObj.prefix})
                  </span>
                </div>
              </div>

              {/* OTP Category pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {otpCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedOtpCategory(cat)}
                    style={selectedOtpCategory === cat ? {
                      backgroundColor: activeBtnColor,
                      color: activeBtnTextColor,
                    } : {}}
                    className={`px-3.5 py-1.5 ${activeBtnRadius} text-xs font-bold whitespace-nowrap transition-all ${
                      selectedOtpCategory === cat
                        ? 'shadow-md ring-1 ring-white/20'
                        : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* OTP Services Grid */}
            {loadingOtp ? (
              <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <RefreshCcw className="w-6 h-6 animate-spin text-emerald-400" />
                <span>Chargement des tarifs et disponibilités...</span>
              </div>
            ) : filteredOtpServices.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs bg-slate-900/40 border border-slate-800 rounded-3xl">
                Aucun service OTP disponible pour ce pays ou ce filtre.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedOtpServices.map((s) => (
                  <div
                    key={s.code}
                    className={`${currentTheme.bgCard} ${currentTheme.cardBorder} hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-xl group`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-emerald-400 text-sm group-hover:scale-105 transition-transform">
                            <Smartphone className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white capitalize leading-tight">
                              {s.name}
                            </h4>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                              {s.category}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {s.stock > 0 ? `${s.stock} dispo` : 'Stock limité'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                        <span>{selectedCountryObj.flag}</span>
                        <span>{selectedCountryObj.name} ({selectedCountryObj.prefix})</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Tarif</span>
                        <span className="text-base font-black text-emerald-400 font-mono">
                          {formatPrice(s.sellingPrice || 0.45)}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedOtpService(s);
                          setOtpCustomerEmail('');
                          setOtpCustomerName('');
                          setOtpCustomerPhone('');
                          setCreatedOtpTicketResult(null);
                          setOtpTicketError(null);
                          triggerPixelEvent('ViewContent', {
                            content_name: `OTP ${s.name} (${selectedCountryObj.name})`,
                            content_type: 'otp',
                            value: s.sellingPrice || 0.45,
                            currency,
                          });
                        }}
                        style={{
                          backgroundColor: activeBtnColor,
                          color: activeBtnTextColor,
                        }}
                        className={`px-3.5 py-2 ${activeBtnRadius} font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all`}
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Obtenir</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* OTP Pagination Controls */}
            {filteredOtpServices.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/80">
                {/* Counter & items per page */}
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>
                    Affichage de <strong className="text-white font-mono">{otpStartIndex + 1}</strong> à{' '}
                    <strong className="text-white font-mono">{otpEndIndex}</strong> sur{' '}
                    <strong className="text-white font-mono">{filteredOtpServices.length}</strong> service{filteredOtpServices.length > 1 ? 's' : ''} OTP
                  </span>

                  <div className="flex items-center gap-1.5 ml-1">
                    <span className="hidden md:inline">Par page :</span>
                    <select
                      value={otpItemsPerPage}
                      onChange={(e) => {
                        setOtpItemsPerPage(Number(e.target.value));
                        setCurrentOtpPage(1);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value={8}>8</option>
                      <option value={16}>16</option>
                      <option value={32}>32</option>
                      <option value={48}>48</option>
                    </select>
                  </div>
                </div>

                {/* Page Navigation Buttons */}
                {totalOtpPages > 1 && (
                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    <button
                      onClick={() => {
                        setCurrentOtpPage((prev) => Math.max(1, prev - 1));
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                      disabled={currentOtpPage === 1}
                      className={`px-3 py-1.5 ${activeBtnRadius} text-xs font-bold bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-all`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Précédent</span>
                    </button>

                    {Array.from({ length: totalOtpPages }, (_, i) => i + 1)
                      .filter((page) => {
                        return (
                          page === 1 ||
                          page === totalOtpPages ||
                          Math.abs(page - currentOtpPage) <= 1
                        );
                      })
                      .reduce((acc: (number | string)[], page, idx, arr) => {
                        if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                          acc.push('...');
                        }
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((item, idx) => {
                        if (item === '...') {
                          return (
                            <span key={`otp-dots-${idx}`} className="px-1 text-xs text-slate-500">
                              ...
                            </span>
                          );
                        }
                        const pageNum = item as number;
                        const isActive = pageNum === currentOtpPage;
                        return (
                          <button
                            key={`otp-page-${pageNum}`}
                            onClick={() => {
                              setCurrentOtpPage(pageNum);
                              window.scrollTo({ top: 380, behavior: 'smooth' });
                            }}
                            style={
                              isActive
                                ? {
                                    backgroundColor: activeBtnColor,
                                    color: activeBtnTextColor,
                                  }
                                : {}
                            }
                            className={`w-8 h-8 ${activeBtnRadius} text-xs font-bold transition-all flex items-center justify-center ${
                              isActive
                                ? 'shadow-md ring-1 ring-white/20'
                                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                    <button
                      onClick={() => {
                        setCurrentOtpPage((prev) => Math.min(totalOtpPages, prev + 1));
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                      disabled={currentOtpPage === totalOtpPages}
                      className={`px-3 py-1.5 ${activeBtnRadius} text-xs font-bold bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-all`}
                    >
                      <span className="hidden sm:inline">Suivant</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* MODAL 1: PRODUCT TICKET CREATION                             */}
      {/* ============================================================ */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {!createdTicketResult ? (
              <>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    <Ticket className="w-3 h-3" />
                    <span>Création de Ticket de Commande</span>
                  </div>
                  <h3 className="text-lg font-black text-white">{selectedProduct.title}</h3>
                  <p className="text-xs text-slate-400">
                    Complétez vos coordonnées pour générer votre ticket et recevoir vos accès.
                  </p>
                </div>

                {ticketError && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                    {ticketError}
                  </div>
                )}

                <form onSubmit={handleCreateProductTicket} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Votre Nom *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ex: Jean Dupont"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Votre Email *</label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Ex: client@email.com"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 font-bold">Quantité</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-white text-sm">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 font-bold">Total à payer :</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      {formatPrice(selectedProduct.sellingPrice * quantity)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingTicket}
                    style={{
                      backgroundColor: activeBtnColor,
                      color: activeBtnTextColor,
                    }}
                    className={`w-full py-3 ${activeBtnRadius} font-bold text-xs shadow-lg transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2`}
                  >
                    {creatingTicket ? (
                      <>
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                        <span>Génération du ticket en cours...</span>
                      </>
                    ) : (
                      <>
                        <Ticket className="w-4 h-4" />
                        <span>Confirmer & Obtenir mon Ticket</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success Created View */
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-black">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ticket Créé avec Succès !</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Code Ticket :</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(createdTicketResult.ticketCode);
                        setCopiedTicket(true);
                        setTimeout(() => setCopiedTicket(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 font-mono font-black text-sm border border-slate-700"
                    >
                      {copiedTicket ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{createdTicketResult.ticketCode}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-900 pt-2">
                    <span className="text-xs text-slate-400">Montant :</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">
                      {formatPrice(createdTicketResult.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Online Payment Options (FeexPay & Moneroo) */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-purple-950/40 border border-sky-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-black text-white">Règlement Immédiat en Ligne</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Validation Instantanée
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Payez directement par Mobile Money (MTN, Moov, Orange, Wave) ou Carte Bancaire pour activer et recevoir vos accès immédiatement.
                  </p>

                  {paymentError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                      {paymentError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleInitiateOnlinePayment(createdTicketResult.ticketCode, 'FEEXPAY')}
                      disabled={payingGateway !== null}
                      className="flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl bg-[#008080]/20 hover:bg-[#008080]/30 border border-[#008080]/60 text-white font-bold text-xs transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-sm"
                    >
                      {payingGateway === 'FEEXPAY' ? (
                        <RefreshCcw className="w-3.5 h-3.5 animate-spin text-[#00E5FF]" />
                      ) : (
                        <CreditCard className="w-3.5 h-3.5 text-[#00E5FF]" />
                      )}
                      <span>{payingGateway === 'FEEXPAY' ? 'Redirection FeexPay...' : 'Payer avec FeexPay'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInitiateOnlinePayment(createdTicketResult.ticketCode, 'MONEROO')}
                      disabled={payingGateway !== null}
                      className="flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl bg-[#5046E5]/20 hover:bg-[#5046E5]/30 border border-[#5046E5]/60 text-white font-bold text-xs transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-sm"
                    >
                      {payingGateway === 'MONEROO' ? (
                        <RefreshCcw className="w-3.5 h-3.5 animate-spin text-[#A5B4FC]" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-[#A5B4FC]" />
                      )}
                      <span>{payingGateway === 'MONEROO' ? 'Redirection Moneroo...' : 'Payer avec Moneroo'}</span>
                    </button>
                  </div>
                </div>

                {/* Payment instructions */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-white flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Instructions de Règlement Manuel :</span>
                  </span>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {createdTicketResult.paymentInstructions}
                  </div>
                </div>

                {/* Direct WhatsApp notify */}
                {createdTicketResult.resellerWhatsApp && (
                  <a
                    href={`https://wa.me/${createdTicketResult.resellerWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Bonjour, je viens de créer le ticket ${createdTicketResult.ticketCode} pour "${createdTicketResult.productTitle}" d'un montant de $${createdTicketResult.totalAmount}. Voici mes informations de paiement.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Notifier le Vendeur sur WhatsApp</span>
                  </a>
                )}

                <div className="pt-2 flex justify-between items-center">
                  <button
                    onClick={() => {
                      const code = createdTicketResult.ticketCode;
                      setSelectedProduct(null);
                      setLookupTicketCode(code);
                      setShowLookupModal(true);
                      handleLookupTicket(code);
                    }}
                    className="text-xs text-sky-400 hover:underline font-bold"
                  >
                    Suivre en direct ce ticket
                  </button>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: OTP TICKET CREATION                                 */}
      {/* ============================================================ */}
      {selectedOtpService && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedOtpService(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {!createdOtpTicketResult ? (
              <>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Smartphone className="w-3 h-3" />
                    <span>Numéro Virtuel OTP • {selectedCountryObj.flag} {selectedCountryObj.name}</span>
                  </div>
                  <h3 className="text-lg font-black text-white capitalize">
                    {selectedOtpService.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Renseignez vos coordonnées pour recevoir votre ticket OTP et activer la ligne.
                  </p>
                </div>

                {otpTicketError && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                    {otpTicketError}
                  </div>
                )}

                <form onSubmit={handleCreateOtpTicket} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Votre Nom *</label>
                    <input
                      type="text"
                      required
                      value={otpCustomerName}
                      onChange={(e) => setOtpCustomerName(e.target.value)}
                      placeholder="Ex: Paul Koffi"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Votre Email *</label>
                      <input
                        type="email"
                        required
                        value={otpCustomerEmail}
                        onChange={(e) => setOtpCustomerEmail(e.target.value)}
                        placeholder="Ex: client@email.com"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp / Tél (optionnel)</label>
                      <input
                        type="text"
                        value={otpCustomerPhone}
                        onChange={(e) => setOtpCustomerPhone(e.target.value)}
                        placeholder="+229 90 00 00 00"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 font-bold">Montant à régler :</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">
                      {formatPrice(selectedOtpService.sellingPrice || 0.45)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingOtpTicket}
                    style={{
                      backgroundColor: activeBtnColor,
                      color: activeBtnTextColor,
                    }}
                    className={`w-full py-3 ${activeBtnRadius} font-bold text-xs shadow-lg transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2`}
                  >
                    {creatingOtpTicket ? (
                      <>
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                        <span>Génération du ticket OTP...</span>
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-4 h-4" />
                        <span>Confirmer & Obtenir mon Ticket OTP</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success Created View */
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-black">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ticket OTP Généré !</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Code Ticket OTP :</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(createdOtpTicketResult.ticketCode);
                        setCopiedOtpTicket(true);
                        setTimeout(() => setCopiedOtpTicket(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-mono font-black text-sm border border-slate-700"
                    >
                      {copiedOtpTicket ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{createdOtpTicketResult.ticketCode}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-900 pt-2">
                    <span className="text-xs text-slate-400">Montant :</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">
                      {formatPrice(createdOtpTicketResult.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Online Payment Options (FeexPay & Moneroo) */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-sky-950/40 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black text-white">Règlement Immédiat en Ligne</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Activation Directe
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Payez en ligne pour recevoir automatiquement votre numéro de téléphone virtuel et afficher le code SMS sans délai.
                  </p>

                  {paymentError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                      {paymentError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleInitiateOnlinePayment(createdOtpTicketResult.ticketCode, 'FEEXPAY')}
                      disabled={payingGateway !== null}
                      className="flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl bg-[#008080]/20 hover:bg-[#008080]/30 border border-[#008080]/60 text-white font-bold text-xs transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-sm"
                    >
                      {payingGateway === 'FEEXPAY' ? (
                        <RefreshCcw className="w-3.5 h-3.5 animate-spin text-[#00E5FF]" />
                      ) : (
                        <CreditCard className="w-3.5 h-3.5 text-[#00E5FF]" />
                      )}
                      <span>{payingGateway === 'FEEXPAY' ? 'Redirection FeexPay...' : 'Payer avec FeexPay'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInitiateOnlinePayment(createdOtpTicketResult.ticketCode, 'MONEROO')}
                      disabled={payingGateway !== null}
                      className="flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl bg-[#5046E5]/20 hover:bg-[#5046E5]/30 border border-[#5046E5]/60 text-white font-bold text-xs transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-sm"
                    >
                      {payingGateway === 'MONEROO' ? (
                        <RefreshCcw className="w-3.5 h-3.5 animate-spin text-[#A5B4FC]" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-[#A5B4FC]" />
                      )}
                      <span>{payingGateway === 'MONEROO' ? 'Redirection Moneroo...' : 'Payer avec Moneroo'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black text-white flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Instructions de Règlement Manuel :</span>
                  </span>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {createdOtpTicketResult.paymentInstructions}
                  </div>
                </div>

                {createdOtpTicketResult.resellerWhatsApp && (
                  <a
                    href={`https://wa.me/${createdOtpTicketResult.resellerWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Bonjour, je viens de créer le ticket OTP ${createdOtpTicketResult.ticketCode} pour "${createdOtpTicketResult.serviceName}" d'un montant de $${createdOtpTicketResult.totalAmount}. Voici mon règlement.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Notifier le Vendeur sur WhatsApp</span>
                  </a>
                )}

                <div className="pt-2 flex justify-between items-center">
                  <button
                    onClick={() => {
                      const code = createdOtpTicketResult.ticketCode;
                      setSelectedOtpService(null);
                      setLookupTicketCode(code);
                      setShowLookupModal(true);
                      handleLookupTicket(code);
                    }}
                    className="text-xs text-sky-400 hover:underline font-bold"
                  >
                    Suivre en direct ce ticket
                  </button>
                  <button
                    onClick={() => setSelectedOtpService(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: UNIVERSAL TICKET LOOKUP & CREDENTIALS / SMS VIEWER  */}
      {/* ============================================================ */}
      {showLookupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowLookupModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-sky-400" />
                <span>Suivre mon Ticket ou Récupérer mes Accès</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Saisissez votre code ticket (ex: TK-123456 ou OTP-789101) pour suivre votre commande et afficher vos identifiants ou votre code SMS.
              </p>
            </div>

            {paidSuccessAlert && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-3 text-emerald-300 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Paiement en ligne confirmé ! Votre ticket a été validé avec succès.</span>
                </div>
                <button
                  onClick={() => setPaidSuccessAlert(false)}
                  className="p-1 text-emerald-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookupTicket();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                required
                placeholder="Ex: TK-458921 ou OTP-784920"
                value={lookupTicketCode}
                onChange={(e) => setLookupTicketCode(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={searchingTicket}
                style={{
                  backgroundColor: activeBtnColor,
                  color: activeBtnTextColor,
                }}
                className={`px-5 py-2.5 ${activeBtnRadius} font-bold text-xs flex items-center gap-1.5 transition-all shadow-md hover:brightness-110 disabled:opacity-50`}
              >
                {searchingTicket ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <span>Vérifier</span>}
              </button>
            </form>

            {lookupError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {lookupError}
              </div>
            )}

            {/* RESULTS VIEW */}
            {ticketLookupResult && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                {/* 1. Header with Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                      {ticketLookupResult.isOtp ? 'Ticket OTP' : 'Ticket Produit'}
                    </span>
                    <span className="font-mono font-black text-base text-white">
                      {ticketLookupResult.ticketCode}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black tracking-wider ${
                      ticketLookupResult.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : ticketLookupResult.status === 'WAITING_SMS'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : ticketLookupResult.status === 'CANCELLED'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {ticketLookupResult.status === 'COMPLETED'
                      ? 'LIVRÉ'
                      : ticketLookupResult.status === 'WAITING_SMS'
                      ? 'EN ATTENTE SMS'
                      : ticketLookupResult.status === 'CANCELLED'
                      ? 'ANNULÉ'
                      : 'EN ATTENTE PAIEMENT'}
                  </span>
                </div>

                {/* 2. CASE: PRODUCT TICKET - COMPLETED */}
                {!ticketLookupResult.isOtp && ticketLookupResult.status === 'COMPLETED' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4" />
                        <span>Vos Identifiants & Accès Livrés :</span>
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(ticketLookupResult.deliveredCredentials || '');
                          setCopiedCredentials(true);
                          setTimeout(() => setCopiedCredentials(false), 2000);
                        }}
                        className="text-[11px] font-bold text-sky-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedCredentials ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCredentials ? 'Copié !' : 'Copier tout'}</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 text-xs font-mono text-emerald-300 whitespace-pre-wrap selection:bg-emerald-500 selection:text-black">
                      {ticketLookupResult.deliveredCredentials || 'Aucun identifiant renseigné.'}
                    </div>
                  </div>
                )}

                {/* 3. CASE: OTP TICKET - WAITING_SMS OR COMPLETED */}
                {ticketLookupResult.isOtp && (ticketLookupResult.status === 'WAITING_SMS' || ticketLookupResult.status === 'COMPLETED') && (
                  <div className="space-y-4">
                    {/* Assigned Phone Card */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Votre Numéro Virtuel Attribué :
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-white font-mono">
                          {ticketLookupResult.phone || 'Génération du numéro...'}
                        </span>
                        {ticketLookupResult.phone && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(ticketLookupResult.phone);
                              setCopiedOtpPhone(true);
                              setTimeout(() => setCopiedOtpPhone(false), 2000);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 text-xs font-bold flex items-center gap-1 border border-slate-700"
                          >
                            {copiedOtpPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>Copier le Numéro</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* SMS Code Display */}
                    {ticketLookupResult.status === 'COMPLETED' && ticketLookupResult.smsCode ? (
                      <div className="p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 text-center space-y-3">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block">
                          🎉 Code SMS Reçu !
                        </span>
                        <div className="text-4xl font-black text-white font-mono tracking-widest py-1">
                          {ticketLookupResult.smsCode}
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(ticketLookupResult.smsCode);
                            setCopiedOtpCode(true);
                            setTimeout(() => setCopiedOtpCode(false), 2000);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                        >
                          {copiedOtpCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedOtpCode ? 'Code Copié !' : 'Copier le Code SMS'}</span>
                        </button>

                        {ticketLookupResult.fullSms && (
                          <p className="text-[11px] text-slate-400 pt-2 border-t border-emerald-500/20 font-mono">
                            Message complet : "{ticketLookupResult.fullSms}"
                          </p>
                        )}
                      </div>
                    ) : (
                      /* Live waiting animation */
                      <div className="p-4 rounded-2xl bg-slate-950 border border-sky-500/30 text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 text-sky-400 text-xs font-bold">
                          <RefreshCcw className="w-4 h-4 animate-spin" />
                          <span>En attente de réception du SMS...</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Utilisez le numéro ci-dessus dans l'application ({ticketLookupResult.service}). Le code SMS s'affichera ici dès réception automatique.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. CASE: PENDING PAYMENT */}
                {ticketLookupResult.status === 'PENDING_PAYMENT' && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                      Votre paiement n'a pas encore été validé. Vous pouvez régler immédiatement en ligne ci-dessous ou utiliser les instructions manuelles :
                    </div>

                    {/* Online Payment Options */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-purple-950/40 border border-sky-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-sky-400" />
                          <span className="text-xs font-black text-white">Règlement Immédiat en Ligne</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Validation Instantanée
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Payez directement en Mobile Money (MTN, Moov, Orange, Wave) ou Carte Bancaire pour validation immédiate de votre commande.
                      </p>

                      {paymentError && (
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                          {paymentError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleInitiateOnlinePayment(ticketLookupResult.ticketCode, 'FEEXPAY')}
                          disabled={payingGateway !== null}
                          className="flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl bg-[#008080]/20 hover:bg-[#008080]/30 border border-[#008080]/60 text-white font-bold text-xs transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-sm"
                        >
                          {payingGateway === 'FEEXPAY' ? (
                            <RefreshCcw className="w-3.5 h-3.5 animate-spin text-[#00E5FF]" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5 text-[#00E5FF]" />
                          )}
                          <span>{payingGateway === 'FEEXPAY' ? 'Redirection FeexPay...' : 'Régler avec FeexPay'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInitiateOnlinePayment(ticketLookupResult.ticketCode, 'MONEROO')}
                          disabled={payingGateway !== null}
                          className="flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl bg-[#5046E5]/20 hover:bg-[#5046E5]/30 border border-[#5046E5]/60 text-white font-bold text-xs transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 shadow-sm"
                        >
                          {payingGateway === 'MONEROO' ? (
                            <RefreshCcw className="w-3.5 h-3.5 animate-spin text-[#A5B4FC]" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 text-[#A5B4FC]" />
                          )}
                          <span>{payingGateway === 'MONEROO' ? 'Redirection Moneroo...' : 'Régler avec Moneroo'}</span>
                        </button>
                      </div>
                    </div>

                    {ticketLookupResult.paymentInstructions && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400">Ou instructions de paiement manuel :</span>
                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap font-sans">
                          {ticketLookupResult.paymentInstructions}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Storefront Footer */}
      <footer className={`mt-auto border-t ${currentTheme.cardBorder} ${currentTheme.bgHeader} py-8 px-4 sm:px-6 lg:px-8 transition-colors`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            {storeData.logoUrl ? (
              <img
                src={storeData.logoUrl}
                alt={storeData.storeName}
                className={`w-7 h-7 ${activeBtnRadius === 'rounded-full' ? 'rounded-full' : 'rounded-lg'} object-cover border border-slate-700/60`}
              />
            ) : (
              <div
                className={`w-7 h-7 ${activeBtnRadius === 'rounded-full' ? 'rounded-full' : 'rounded-lg'} flex items-center justify-center font-bold text-white text-xs`}
                style={{ backgroundColor: activeBtnColor }}
              >
                {storeData.storeName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-bold text-slate-200">{storeData.storeName}</span>
            <span>— Boutique officielle propulsée par la plateforme</span>
          </div>

          <div className="flex items-center gap-4">
            {storeData.contactEmail && (
              <a href={`mailto:${storeData.contactEmail}`} className="hover:text-white flex items-center gap-1 transition-colors">
                <Mail className="w-3.5 h-3.5" />
                <span>{storeData.contactEmail}</span>
              </a>
            )}
            {storeData.contactWhatsApp && (
              <a
                href={`https://wa.me/${storeData.contactWhatsApp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}
            {storeData.contactTelegram && (
              <a
                href={`https://t.me/${storeData.contactTelegram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sky-400 flex items-center gap-1 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </a>
            )}
          </div>
        </div>
      </footer>

      {/* Floating Support Chat Widget */}
      {storeData.floatingChatEnabled !== false &&
        (storeData.contactWhatsApp || storeData.contactTelegram || storeData.contactEmail) && (
          <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Expanded Chat Popup Card */}
            {chatOpen && (
              <div className="mb-3 w-80 sm:w-96 rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl p-5 space-y-4 animate-in slide-in-from-bottom-5 fade-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    {storeData.logoUrl ? (
                      <img
                        src={storeData.logoUrl}
                        alt={storeData.storeName}
                        className="w-10 h-10 rounded-2xl object-cover border border-slate-700 shadow-sm"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-md"
                        style={{ backgroundColor: activeBtnColor }}
                      >
                        {storeData.storeName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-black text-white text-sm">{storeData.storeName}</h4>
                      <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Support & Service Client
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setChatOpen(false)}
                    className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Welcome Message Bubble */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                  {storeData.welcomeMessage ||
                    "Bonjour ! 👋 Besoin d'aide pour passer commande, valider un paiement ou recevoir votre code SMS ? Contactez-nous directement :"}
                </div>

                {/* Action buttons */}
                <div className="space-y-2 pt-1">
                  {storeData.contactWhatsApp && (
                    <a
                      href={`https://wa.me/${storeData.contactWhatsApp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-emerald-600/20 transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 fill-current" />
                        <span>Discuter sur WhatsApp</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                    </a>
                  )}

                  {storeData.contactTelegram && (
                    <a
                      href={`https://t.me/${storeData.contactTelegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-sky-600/20 transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        <span>Contacter sur Telegram</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                    </a>
                  )}

                  {storeData.contactEmail && (
                    <a
                      href={`mailto:${storeData.contactEmail}`}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Envoyer un email</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Floating Trigger Button */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              style={{ backgroundColor: activeBtnColor, color: activeBtnTextColor }}
              className={`p-3.5 sm:px-4 sm:py-3.5 ${activeBtnRadius} shadow-2xl flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all ring-4 ring-black/30 group`}
              title="Assistance & Support Client"
            >
              {chatOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <>
                  <div className="relative">
                    <MessageSquare className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
                  </div>
                  <span className="hidden sm:inline font-bold text-xs">Besoin d'aide ?</span>
                </>
              )}
            </button>
          </div>
        )}
    </div>
  );
}
