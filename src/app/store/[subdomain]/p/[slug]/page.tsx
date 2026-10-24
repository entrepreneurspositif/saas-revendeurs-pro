'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingBag,
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
  ArrowRight,
  Clock,
  Ticket,
  X,
  CreditCard,
  Send,
  Star,
  Lock,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  HelpCircle,
  Flame,
  TrendingUp,
  Share2,
  Tag,
  Gift,
  ArrowLeft,
  Users,
} from 'lucide-react';
import { useCurrency } from '@/components/CurrencyContext';

// Theme styles matching the reseller's brand
const THEME_STYLES: Record<string, any> = {
  'cyber-dark': {
    bgRoot: 'bg-[#090d16]',
    bgHeader: 'bg-[#0b1120]/90 border-slate-800',
    bgCard: 'bg-slate-900/90',
    cardBorder: 'border-slate-800',
    cardHoverBorder: 'hover:border-sky-500/50',
    accentGradient: 'from-sky-500 to-indigo-600',
    accentText: 'text-sky-400',
    badgeStyle: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  },
  'emerald-luxury': {
    bgRoot: 'bg-[#040d0a]',
    bgHeader: 'bg-[#061713]/90 border-emerald-950',
    bgCard: 'bg-[#081d17]/90',
    cardBorder: 'border-emerald-900/40',
    cardHoverBorder: 'hover:border-emerald-500/50',
    accentGradient: 'from-emerald-500 to-teal-600',
    accentText: 'text-emerald-400',
    badgeStyle: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  'neon-violet': {
    bgRoot: 'bg-[#0b0816]',
    bgHeader: 'bg-[#120d24]/90 border-purple-950',
    bgCard: 'bg-[#17102e]/90',
    cardBorder: 'border-purple-900/40',
    cardHoverBorder: 'hover:border-purple-500/50',
    accentGradient: 'from-violet-500 to-fuchsia-600',
    accentText: 'text-purple-400',
    badgeStyle: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  'ocean-deep': {
    bgRoot: 'bg-[#070e1e]',
    bgHeader: 'bg-[#0a1631]/90 border-blue-950',
    bgCard: 'bg-[#0d1c3e]/90',
    cardBorder: 'border-blue-900/40',
    cardHoverBorder: 'hover:border-blue-500/50',
    accentGradient: 'from-blue-600 to-cyan-500',
    accentText: 'text-blue-400',
    badgeStyle: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  'amber-gold': {
    bgRoot: 'bg-[#0c0905]',
    bgHeader: 'bg-[#171207]/90 border-amber-950',
    bgCard: 'bg-[#1e1709]/90',
    cardBorder: 'border-amber-900/40',
    cardHoverBorder: 'hover:border-amber-500/50',
    accentGradient: 'from-amber-500 to-yellow-500',
    accentText: 'text-amber-400',
    badgeStyle: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  'crimson-dark': {
    bgRoot: 'bg-[#100608]',
    bgHeader: 'bg-[#1b0a0e]/90 border-rose-950',
    bgCard: 'bg-[#230c12]/90',
    cardBorder: 'border-rose-900/40',
    cardHoverBorder: 'hover:border-rose-500/50',
    accentGradient: 'from-rose-500 to-red-600',
    accentText: 'text-rose-400',
    badgeStyle: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  },
  'clean-slate': {
    bgRoot: 'bg-[#0f141c]',
    bgHeader: 'bg-[#161d27]/90 border-slate-800',
    bgCard: 'bg-[#1b2330]/90',
    cardBorder: 'border-slate-800',
    cardHoverBorder: 'hover:border-slate-500',
    accentGradient: 'from-slate-500 to-zinc-600',
    accentText: 'text-slate-300',
    badgeStyle: 'bg-slate-700/40 text-slate-300 border-slate-600',
  },
};

export default function ResellerProductSalesPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params?.subdomain as string;
  const slug = params?.slug as string;
  const { currency, formatPrice, setCurrency } = useCurrency();

  // Data states
  const [loading, setLoading] = useState<boolean>(true);
  const [storeData, setStoreData] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Checkout Form State
  const [quantity, setQuantity] = useState<number>(1);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerAccounts, setCustomerAccounts] = useState<string>('');
  const [creatingTicket, setCreatingTicket] = useState<boolean>(false);
  const [createdTicketResult, setCreatedTicketResult] = useState<any | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);

  // Online Payment State
  const [payingGateway, setPayingGateway] = useState<'FEEXPAY' | 'MONEROO' | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // FOMO Countdown Timer (14m 30s)
  const [timeLeft, setTimeLeft] = useState<number>(14 * 60 + 35);

  // Social Proof Popup State
  const [socialPopup, setSocialPopup] = useState<{ name: string; city: string; time: string } | null>(null);

  // Accordion FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Scrolled state for floating mobile CTA
  const [showFloatingCta, setShowFloatingCta] = useState<boolean>(false);

  // Countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 14 * 60 + 59));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Social proof rotation effect
  useEffect(() => {
    const buyers = [
      { name: 'Koffi A.', city: 'Lomé', time: 'il y a 2 min' },
      { name: 'Aminata D.', city: 'Dakar', time: 'il y a 4 min' },
      { name: 'Ibrahim S.', city: 'Abidjan', time: 'il y a 6 min' },
      { name: 'Moussa T.', city: 'Bamako', time: 'il y a 8 min' },
      { name: 'Grace M.', city: 'Cotonou', time: 'il y a 3 min' },
      { name: 'Junior K.', city: 'Douala', time: 'il y a 5 min' },
    ];

    let index = 0;
    const interval = setInterval(() => {
      setSocialPopup(buyers[index % buyers.length]);
      index++;
      setTimeout(() => setSocialPopup(null), 4500);
    }, 14000);

    return () => clearInterval(interval);
  }, []);

  // Scroll listener for sticky mobile CTA
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowFloatingCta(true);
      } else {
        setShowFloatingCta(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Store and Product Data
  useEffect(() => {
    if (!subdomain) return;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/tenant/storefront?subdomain=${encodeURIComponent(subdomain)}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Boutique introuvable');
        }

        setStoreData(data.store);

        // Find product matching slug or id
        const matched = data.products.find(
          (p: any) => p.slug === slug || p.id === slug || p.slug === decodeURIComponent(slug)
        );

        if (!matched) {
          throw new Error('Ce produit n\'est plus disponible ou a été retiré de la boutique.');
        }

        setProduct(matched);

        // Filter other products for upsell
        const others = data.products.filter((p: any) => p.id !== matched.id).slice(0, 3);
        setRelatedProducts(others);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [subdomain, slug]);

  // Pixels tracking injection
  useEffect(() => {
    if (!storeData || !product) return;

    // Trigger ViewContent on Facebook Pixel
    try {
      if ((window as any).fbq) {
        (window as any).fbq('track', 'ViewContent', {
          content_name: product.title,
          content_type: 'product',
          value: product.sellingPrice,
          currency: currency || 'XOF',
        });
      }
    } catch (e) {}

    // Trigger ViewContent on TikTok Pixel
    try {
      if ((window as any).ttq) {
        (window as any).ttq.track('ViewContent', {
          content_name: product.title,
          content_type: 'product',
          value: product.sellingPrice,
          currency: currency || 'XOF',
        });
      }
    } catch (e) {}
  }, [storeData, product, currency]);

  // Theme presets
  const activePresetKey = storeData?.themePreset || 'cyber-dark';
  const currentTheme = THEME_STYLES[activePresetKey] || THEME_STYLES['cyber-dark'];
  const activeFont = storeData?.fontFamily || 'Inter';
  const activeBtnColor = storeData?.buttonColor || '#0284c7';
  const activeBtnTextColor = storeData?.buttonTextColor || '#ffffff';
  const activeBtnRadius = storeData?.buttonRadius || 'rounded-xl';

  // Handle Order Ticket Submission
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (quantity < 1) return;

    setCreatingTicket(true);
    setTicketError(null);
    setCreatedTicketResult(null);

    try {
      const res = await fetch('/api/tenant/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          productId: product.id,
          quantity,
          customerEmail,
          customerName,
          customerAccounts,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la création de la commande');
      }

      setCreatedTicketResult(data);

      // Track Purchase / InitiateCheckout Event
      try {
        if ((window as any).fbq) {
          (window as any).fbq('track', 'Purchase', {
            content_name: `Ticket #${data.order?.ticketCode || data.ticketCode}`,
            content_type: 'product_order',
            value: (product.sellingPrice || 0) * quantity,
            currency: currency || 'XOF',
          });
        }
        if ((window as any).ttq) {
          (window as any).ttq.track('CompletePayment', {
            content_name: `Ticket #${data.order?.ticketCode || data.ticketCode}`,
            value: (product.sellingPrice || 0) * quantity,
            currency: currency || 'XOF',
          });
        }
      } catch (e) {}
    } catch (err: any) {
      setTicketError(err.message);
    } finally {
      setCreatingTicket(false);
    }
  };

  // Handle Online Payment
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
        throw new Error(data.message || `Échec d'initialisation du paiement ${gateway}`);
      }

      window.location.href = data.paymentUrl;
    } catch (err: any) {
      setPaymentError(err.message || 'Erreur lors de la redirection vers le paiement.');
      setPayingGateway(null);
    }
  };

  // Handle WhatsApp Order Trigger
  const handleWhatsAppOrder = (ticketCode?: string) => {
    const rawPhone = storeData?.contactWhatsApp || storeData?.contactPhone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    if (!cleanPhone) {
      alert("Le revendeur n'a pas renseigné son numéro WhatsApp. Veuillez procéder au paiement en ligne.");
      return;
    }

    const total = (product.sellingPrice || 0) * quantity;
    const code = ticketCode || createdTicketResult?.order?.ticketCode || createdTicketResult?.ticketCode || 'NOUVELLE-COMMANDE';

    const message = `Bonjour ${storeData?.storeName || 'Service Client'} ! 👋\n\nJe souhaite valider ma commande :\n📦 *Produit :* ${product.title}\n🔢 *Quantité :* ${quantity}\n💰 *Total :* ${formatPrice(total)}\n👤 *Nom :* ${customerName || 'Client'}\n🎟️ *Ticket :* #${code}\n\nMerci de m'indiquer la démarche pour recevoir mes accès rapidement !`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const copyTicketCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2500);
  };

  const scrollToCheckout = () => {
    const el = document.getElementById('checkout-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Chargement de la page de vente...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white px-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
          <h1 className="text-xl font-bold">Produit non disponible</h1>
          <p className="text-xs text-slate-400">{error || 'Le produit demandé est introuvable.'}</p>
          <Link
            href={`/store/${subdomain}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à la boutique</span>
          </Link>
        </div>
      </div>
    );
  }

  // Savings calculation (assume regular market price is ~2x or +60%)
  const unitPrice = product.sellingPrice || 0;
  const regularPrice = Math.round(unitPrice * 1.6);
  const total = unitPrice * quantity;
  const inStock = product.stock > 0 && product.isAvailable;

  const faqs = [
    {
      q: 'Comment vais-je recevoir mes accès après commande ?',
      a: 'La livraison est ultra-rapide ! Dès validation de votre paiement (par Mobile Money ou virement), votre ticket est mis à jour instantanément avec vos identifiants ou votre clé de licence. Vous pouvez également recevoir vos accès directement par WhatsApp.',
    },
    {
      q: 'Est-ce un compte officiel et sécurisé ?',
      a: 'Oui, à 100%. Tous nos abonnements et clés proviennent de distributeurs officiels certifiés. Vous bénéficiez d\'un compte privé sans risque de coupure ni d\'interruption.',
    },
    {
      q: 'Que se passe-t-il si j\'ai un problème avec mon compte ?',
      a: 'Chaque commande est couverte par notre Garantie Totale de Remplacement. Notre assistance client est joignable 7j/7 sur WhatsApp pour vous dépanner ou remplacer vos accès immédiatement en cas de besoin.',
    },
    {
      q: 'Quels sont les modes de paiement acceptés ?',
      a: 'Nous acceptons tous les moyens de paiement locaux par Mobile Money (Wave, Orange Money, MTN Moov Money) ainsi que les cartes bancaires et crypto selon la passerelle disponible.',
    },
  ];

  return (
    <div
      style={{ fontFamily: activeFont }}
      className={`min-h-screen ${currentTheme.bgRoot} text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white`}
    >
      {/* 1. TOP URGENCY / FOMO BANNER */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white text-xs font-black py-2 px-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 tracking-wide text-[11px] sm:text-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="font-extrabold uppercase flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-current" /> Vente Flash Spéciale :
            </span>
            <span className="hidden sm:inline font-medium text-rose-100">
              Tarif réduit garanti pendant encore
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/20 font-mono font-black text-amber-300 tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatCountdown(timeLeft)}</span>
            </div>
            <button
              onClick={scrollToCheckout}
              className="hidden md:inline-flex items-center gap-1 bg-white text-rose-700 px-3 py-0.5 rounded-lg text-[11px] font-black uppercase hover:bg-rose-50 transition-all shadow-sm"
            >
              Profiter de l'offre
            </button>
          </div>
        </div>
      </div>

      {/* 2. STORE HEADER & NAVIGATION */}
      <header className={`py-4 px-4 sm:px-8 border-b ${currentTheme.cardBorder} backdrop-blur-xl sticky top-9 z-40 bg-slate-950/80`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link
            href={`/store/${subdomain}`}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline">Toute la boutique</span>
          </Link>

          {/* Store Logo & Branding */}
          <Link href={`/store/${subdomain}`} className="flex items-center gap-2.5">
            {storeData?.logoUrl ? (
              <img
                src={storeData.logoUrl}
                alt={storeData.storeName}
                className="w-8 h-8 rounded-xl object-contain bg-slate-800 p-0.5"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                {storeData?.storeName?.charAt(0) || 'B'}
              </div>
            )}
            <div>
              <span className="font-extrabold text-white text-sm block leading-none">
                {storeData?.storeName || 'Boutique Pro'}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" /> Vendeur Vérifié
              </span>
            </div>
          </Link>

          {/* Currency Switcher */}
          <div className="flex items-center gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="XOF">XOF (FCFA)</option>
              <option value="XAF">XAF (FCFA)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>
      </header>

      {/* 3. HERO PRODUCT SHOWCASE + DIRECT CHECKOUT FORM */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: Visual, Trust & Features (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Category & Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${currentTheme.badgeStyle}`}>
                {product.category || 'Abonnement Digital'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> Économisez 60%
              </span>
              {(product.deliveryType === 'AUTOMATIC' || product.category === 'Méthode') && (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" /> Livraison &lt; 2 min
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Rating Stars & Buyers Proof */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs font-bold text-white ml-1">4.9 / 5</span>
              </div>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-300 flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5 text-sky-400" /> +140 clients satisfaits
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Fonctionnel & Garanti
              </span>
            </div>

            {/* Product Image Card */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group">
              <div className="aspect-video w-full relative flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-600">
                    <Package className="w-16 h-16 mb-2 opacity-50" />
                    <span className="text-xs uppercase font-bold tracking-widest">Abonnement Certifié</span>
                  </div>
                )}
                {/* Floating stock pill */}
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>En Stock : Expédition Immédiate</span>
                </div>
              </div>
            </div>

            {/* Checklist: What's included */}
            <div className={`${currentTheme.bgCard} p-6 rounded-3xl border ${currentTheme.cardBorder} space-y-4 shadow-xl`}>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Ce qui est inclus dans votre achat :</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2.5 text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Accès complet et privé sans coupure</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Livraison automatique en 2 minutes</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Garantie de remplacement 100% offerte</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Support VIP par WhatsApp 7j/7</span>
                </div>
              </div>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className={`${currentTheme.bgCard} p-6 rounded-3xl border ${currentTheme.cardBorder} space-y-3`}>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Description du produit
                </h3>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: The High-Converting Direct Checkout Funnel (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div
              id="checkout-card"
              className={`${currentTheme.bgCard} rounded-3xl border-2 border-sky-500/40 p-6 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-xl`}
            >
              {/* Highlight gradient border top */}
              <div className="h-1.5 w-full bg-gradient-to-r from-sky-400 via-indigo-500 to-rose-500 absolute top-0 left-0" />

              {!createdTicketResult ? (
                /* ORDER FORM BEFORE SUBMISSION */
                <form onSubmit={handleCreateOrder} className="space-y-5">
                  {/* Pricing Box */}
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-slate-400">Tarif Promotionnel :</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-slate-500 line-through font-mono">
                          {formatPrice(regularPrice)}
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                          {formatPrice(unitPrice)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Économie immédiate
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        -{formatPrice(regularPrice - unitPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>Quantité :</span>
                      <span className="text-[11px] text-slate-400">
                        Total : <strong className="text-white font-mono">{formatPrice(total)}</strong>
                      </span>
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-800 rounded-xl bg-slate-950 p-1">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="w-8 h-8 rounded-lg bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center font-bold text-base"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-black text-sm text-white font-mono">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => q + 1)}
                          className="w-8 h-8 rounded-lg bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center font-bold text-base"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-400 leading-tight">
                        Achat sécurisé & délivré sur le même ticket
                      </span>
                    </div>
                  </div>

                  {/* Customer Information Inputs */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Votre Nom / Prénom <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ex: Kouamé Jean"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Numéro WhatsApp ou Email <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Ex: +225 07000000 ou email@gmail.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition-all"
                      />
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Pour recevoir vos identifiants et le suivi de commande.
                      </span>
                    </div>

                    {/* Conditional input: Upgrade account info */}
                    {product.requiresCustomerInfo && (
                      <div>
                        <label className="block text-[11px] font-bold text-amber-300 mb-1 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{product.customerInfoPrompt || 'Compte à upgrader :'}</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={customerAccounts}
                          onChange={(e) => setCustomerAccounts(e.target.value)}
                          placeholder={product.customerInfoPlaceholder || 'Email / Mot de passe de votre compte à upgrader'}
                          className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition-all"
                        />
                      </div>
                    )}
                  </div>

                  {ticketError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{ticketError}</span>
                    </div>
                  )}

                  {/* Main CTA Button */}
                  <button
                    type="submit"
                    disabled={creatingTicket || !inStock}
                    style={{
                      backgroundColor: activeBtnColor,
                      color: activeBtnTextColor,
                    }}
                    className={`w-full py-4 ${activeBtnRadius} font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer`}
                  >
                    {creatingTicket ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Création du ticket...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current" />
                        <span>Commander Maintenant • {formatPrice(total)}</span>
                      </>
                    )}
                  </button>

                  {/* Alternative Direct WhatsApp Order Button */}
                  {(storeData?.contactWhatsApp || storeData?.contactPhone) && (
                    <button
                      type="button"
                      onClick={() => handleWhatsAppOrder()}
                      className="w-full py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Commander directement par WhatsApp</span>
                    </button>
                  )}

                  {/* Trust guarantees under CTA */}
                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span>Paiement 100% Sécurisé</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RefreshCcw className="w-3 h-3 text-sky-400" />
                      <span>Garantie Remplacement</span>
                    </div>
                  </div>
                </form>
              ) : (
                /* ORDER CREATED SUCCESS & PAYMENT GATEWAYS */
                <div className="space-y-5 animate-fadeIn">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-white text-base">Commande Enregistrée !</h4>
                    <p className="text-xs text-slate-300">
                      Votre ticket de commande a été généré avec succès.
                    </p>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-xs">
                      <span className="text-slate-400">Code Ticket :</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sky-400">
                          #{createdTicketResult.order?.ticketCode || createdTicketResult.ticketCode}
                        </span>
                        <button
                          onClick={() => copyTicketCode(createdTicketResult.order?.ticketCode || createdTicketResult.ticketCode)}
                          className="text-slate-400 hover:text-white"
                        >
                          {copiedTicket ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  {/* Payment Options Selection */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Choisissez votre moyen de règlement :
                    </div>

                    {/* Online Payment FeexPay */}
                    <button
                      onClick={() =>
                        handleInitiateOnlinePayment(
                          createdTicketResult.order?.ticketCode || createdTicketResult.ticketCode,
                          'FEEXPAY'
                        )
                      }
                      disabled={payingGateway !== null}
                      className="w-full p-3.5 rounded-xl border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-left flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-sky-500 text-slate-950 flex items-center justify-center font-black">
                          <Zap className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">Paiement Mobile Money Direct</div>
                          <div className="text-[10px] text-slate-400">Wave, Orange Money, MTN, Moov (FeexPay)</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Online Payment Moneroo */}
                    <button
                      onClick={() =>
                        handleInitiateOnlinePayment(
                          createdTicketResult.order?.ticketCode || createdTicketResult.ticketCode,
                          'MONEROO'
                        )
                      }
                      disabled={payingGateway !== null}
                      className="w-full p-3.5 rounded-xl border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-left flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-500 text-white flex items-center justify-center font-black">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">Moneroo (Mobile Money & Carte)</div>
                          <div className="text-[10px] text-slate-400">Paiement multi-pays instantané</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Confirm via WhatsApp button */}
                    <button
                      onClick={() =>
                        handleWhatsAppOrder(
                          createdTicketResult.order?.ticketCode || createdTicketResult.ticketCode
                        )
                      }
                      className="w-full p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-left flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">Confirmer & Payer par WhatsApp</div>
                          <div className="text-[10px] text-slate-400">Envoyer le ticket au vendeur pour activation</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Manual Payment Instructions if configured */}
                  {storeData?.paymentInstructions && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                      <div className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Instructions de paiement manuel :</span>
                      </div>
                      <p className="text-slate-300 text-[11px] whitespace-pre-line leading-relaxed">
                        {storeData.paymentInstructions}
                      </p>
                    </div>
                  )}

                  {/* Reset order button */}
                  <button
                    onClick={() => {
                      setCreatedTicketResult(null);
                      setPaymentError(null);
                    }}
                    className="w-full text-center text-xs text-slate-400 hover:text-white pt-2 block"
                  >
                    Passer une autre commande
                  </button>
                </div>
              )}
            </div>

            {/* Support guarantee badge */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Commande garantie par le réseau Abonnements Pro</span>
            </div>
          </div>
        </div>

        {/* 4. REASSURANCE & GUARANTEE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
          <div className={`${currentTheme.bgCard} p-5 rounded-2xl border ${currentTheme.cardBorder} space-y-2`}>
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Activation Immédiate</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Vos accès sont générés en temps réel dès la validation de votre paiement.
            </p>
          </div>

          <div className={`${currentTheme.bgCard} p-5 rounded-2xl border ${currentTheme.cardBorder} space-y-2`}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Garantie Totale</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Remplacement gratuit immédiat pendant toute la durée de validité de votre abonnement.
            </p>
          </div>

          <div className={`${currentTheme.bgCard} p-5 rounded-2xl border ${currentTheme.cardBorder} space-y-2`}>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Comptes 100% Privés</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Vos informations et vos espaces restent strictement personnels et protégés.
            </p>
          </div>

          <div className={`${currentTheme.bgCard} p-5 rounded-2xl border ${currentTheme.cardBorder} space-y-2`}>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Support Réactif 7j/7</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Une équipe d'assistance dédiée sur WhatsApp pour répondre à toutes vos questions.
            </p>
          </div>
        </div>

        {/* 5. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
        <div className={`${currentTheme.bgCard} p-6 sm:p-8 rounded-3xl border ${currentTheme.cardBorder} space-y-6 shadow-xl`}>
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-white">Questions Fréquentes</h3>
            <p className="text-xs text-slate-400">
              Tout ce que vous devez savoir avant de passer commande en toute sérénité.
            </p>
          </div>

          <div className="max-w-2xl mx-auto divide-y divide-slate-800">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="py-4">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left font-bold text-xs sm:text-sm text-white hover:text-sky-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 ml-2">
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="mt-2.5 text-xs text-slate-300 leading-relaxed pr-8 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. RELATED PRODUCTS / CROSS-SELL */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">D'autres clients ont aussi commandé :</h3>
                <p className="text-xs text-slate-400">Découvrez les autres offres populaires de la boutique.</p>
              </div>
              <Link
                href={`/store/${subdomain}`}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <span>Voir tout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/store/${subdomain}/p/${rel.slug || rel.id}`}
                  className={`${currentTheme.bgCard} p-4 rounded-2xl border ${currentTheme.cardBorder} hover:border-sky-500/50 transition-all hover:-translate-y-1 group flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <div className="aspect-video rounded-xl bg-slate-950 overflow-hidden relative">
                      {rel.imageUrl ? (
                        <img
                          src={rel.imageUrl}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 font-black text-lg">
                          {rel.title.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] text-sky-400 font-bold uppercase">{rel.category}</div>
                      <h4 className="font-bold text-xs text-white group-hover:text-sky-400 transition-colors truncate">
                        {rel.title}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800">
                    <span className="font-mono font-black text-white text-sm">
                      {formatPrice(rel.sellingPrice)}
                    </span>
                    <span className="text-[10px] font-bold text-sky-400 flex items-center gap-1">
                      Commander <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 7. LIVE SOCIAL PROOF NOTIFICATION TOAST */}
      {socialPopup && (
        <div className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40 bg-slate-900/95 border border-sky-500/40 p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-slideUp max-w-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="text-white font-bold leading-snug">
              {socialPopup.name} ({socialPopup.city})
            </div>
            <div className="text-[10px] text-slate-400">
              A commandé il y a {socialPopup.time}
            </div>
          </div>
        </div>
      )}

      {/* 8. FLOATING STICKY MOBILE CTA BAR */}
      {showFloatingCta && !createdTicketResult && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 p-3 sm:hidden backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 animate-slideUp">
          <div className="min-w-0">
            <div className="font-extrabold text-white text-xs truncate">{product.title}</div>
            <div className="text-sm font-black text-emerald-400 font-mono">
              {formatPrice(unitPrice)}
            </div>
          </div>
          <button
            onClick={scrollToCheckout}
            style={{
              backgroundColor: activeBtnColor,
              color: activeBtnTextColor,
            }}
            className={`px-5 py-2.5 ${activeBtnRadius} font-black text-xs uppercase tracking-wider shrink-0 shadow-lg`}
          >
            Acheter
          </button>
        </div>
      )}

      {/* 9. FOOTER */}
      <footer className={`mt-auto border-t ${currentTheme.cardBorder} py-8 px-4 text-center text-xs text-slate-500`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} {storeData?.storeName || 'Boutique'}. Tous droits réservés.
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Paiements Sécurisés</span>
            <span>•</span>
            <span>Support 7j/7</span>
            <span>•</span>
            <Link href={`/store/${subdomain}`} className="hover:text-white">
              Boutique Complète
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
