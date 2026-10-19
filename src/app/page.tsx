'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SupportWidget from '@/components/SupportWidget';
import FormattedCredentials from '@/components/FormattedCredentials';
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
  Bot,
  Code2,
  Smartphone,
  KeyRound,
  Layers,
  X,
  Plus,
  Minus,
  Ticket,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  FileText,
  Globe,
  Star,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Headphones,
  Store,
  ArrowUpRight,
  User,
  BadgeCheck,
} from 'lucide-react';

import { useCurrency } from '@/components/CurrencyContext';

export default function StorefrontPage() {
  const { currency, formatPrice } = useCurrency();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK'>('ALL');
  const [sortBy, setSortBy] = useState<'RANDOM' | 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'TITLE_ASC'>('RANDOM');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(9);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Helper for shuffling product array randomly
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Purchase / Ticket Modal State
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [customerAccounts, setCustomerAccounts] = useState<string>('');
  const [creatingTicket, setCreatingTicket] = useState<boolean>(false);
  const [createdTicketResult, setCreatedTicketResult] = useState<any | null>(null);
  const [payingWithFeexPay, setPayingWithFeexPay] = useState<boolean>(false);
  const [payingWithMoneroo, setPayingWithMoneroo] = useState<boolean>(false);
  const [payingWithCustomGateway, setPayingWithCustomGateway] = useState<boolean>(false);

  // Dynamic Active Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<any>({
    manual: { enabled: true, instructions: '' },
    feexpay: { enabled: true },
    moneroo: { enabled: true },
    custom: { enabled: false, name: 'Passerelle 2' },
  });

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch('/api/payment-methods');
      const data = await res.json();
      if (data.success && data.methods) {
        setPaymentMethods(data.methods);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Ticket Lookup Modal State
  const [showLookupModal, setShowLookupModal] = useState<boolean>(false);
  const [lookupTicketCode, setLookupTicketCode] = useState<string>('');
  const [searchingTicket, setSearchingTicket] = useState<boolean>(false);
  const [ticketLookupResult, setTicketLookupResult] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Copy Feedback State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { name: 'Tous', icon: Layers, label: 'Tous les abonnements' },
    { name: 'Abonnements & Comptes', icon: KeyRound, label: 'Streaming & Divertissement' },
    { name: 'IA & APIs', icon: Bot, label: 'Intelligence Artificielle & Clés' },
    { name: 'Licences & Outils Dev', icon: Code2, label: 'Outils Pro & Bureautique' },
    { name: 'Mobile & Services', icon: Smartphone, label: 'Services Mobile' },
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(shuffleArray(data.products || []));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const performLookupByCode = async (code: string) => {
    if (!code.trim()) return;
    setLookupTicketCode(code.trim());
    setShowLookupModal(true);
    setSearchingTicket(true);
    setLookupError(null);
    setTicketLookupResult(null);

    try {
      const res = await fetch(`/api/tickets/lookup?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (data.success) {
        setTicketLookupResult(data.order);
      } else {
        setLookupError(data.message || 'Ticket non trouvé');
      }
    } catch (e: any) {
      setLookupError(e.message || 'Erreur de recherche');
    } finally {
      setSearchingTicket(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchPaymentMethods();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ticketParam = params.get('ticket') || params.get('ticketCode') || params.get('code');
      if (ticketParam) {
        performLookupByCode(ticketParam);
      }
    }
  }, []);

  const handleOpenPurchase = (product: any) => {
    setSelectedProduct(product);
    setQuantity(1);
    setCustomerAccounts('');
    setCreatedTicketResult(null);
  };

  const handleCreateTicket = async () => {
    if (!selectedProduct || quantity < 1 || creatingTicket) return;
    if (selectedProduct.requiresCustomerInfo && !customerAccounts.trim()) {
      alert(`Veuillez renseigner : ${selectedProduct.customerInfoPrompt || 'les informations requises'}`);
      return;
    }

    setCreatingTicket(true);
    try {
      const res = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity,
          customerAccounts: customerAccounts.trim() || undefined,
        }),
      });

      const data = await res.json();
      setCreatedTicketResult(data);
    } catch (e) {
      console.error(e);
      setCreatedTicketResult({ success: false, message: 'Erreur réseau lors de la création du ticket.' });
    } finally {
      setCreatingTicket(false);
    }
  };

  const handlePayWithFeexPay = async (ticketCode: string) => {
    if (!ticketCode) return;
    setPayingWithFeexPay(true);
    try {
      const res = await fetch('/api/feexpay/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Erreur lors de l\'initialisation du paiement FeexPay.');
        return;
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      alert(data.message || 'Erreur de paiement FeexPay.');
    } catch (e: any) {
      alert(e.message || 'Erreur réseau lors de la connexion à FeexPay.');
    } finally {
      setPayingWithFeexPay(false);
    }
  };

  const handlePayWithMoneroo = async (ticketCode: string) => {
    if (!ticketCode) return;
    setPayingWithMoneroo(true);
    try {
      const res = await fetch('/api/moneroo/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Erreur lors de l\'initialisation de Moneroo.');
        return;
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      alert(data.message || 'Erreur de paiement Moneroo.');
    } catch (e: any) {
      alert(e.message || 'Erreur réseau lors de la connexion à Moneroo.');
    } finally {
      setPayingWithMoneroo(false);
    }
  };

  const handlePayWithCustomGateway = async (ticketCode: string) => {
    if (!ticketCode) return;
    setPayingWithCustomGateway(true);
    try {
      const res = await fetch('/api/custom-gateway/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Erreur lors de l\'initialisation de la passerelle.');
        return;
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      alert(data.message || 'Erreur de paiement.');
    } catch (e: any) {
      alert(e.message || 'Erreur réseau.');
    } finally {
      setPayingWithCustomGateway(false);
    }
  };

  const handleLookupTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupTicketCode.trim()) return;
    setSearchingTicket(true);
    setLookupError(null);
    setTicketLookupResult(null);

    try {
      const res = await fetch(`/api/tickets/lookup?code=${encodeURIComponent(lookupTicketCode.trim())}`);
      const data = await res.json();
      if (data.success) {
        setTicketLookupResult(data.order);
      } else {
        setLookupError(data.message || 'Ticket non trouvé');
      }
    } catch (e: any) {
      setLookupError(e.message || 'Erreur de recherche');
    } finally {
      setSearchingTicket(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAndSortedProducts = products
    .filter((p) => {
      if (selectedCategory !== 'Tous' && p.category !== selectedCategory) return false;
      if (stockFilter === 'IN_STOCK' && (p.stock <= 0 || !p.isAvailable)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        const catMatch = (p.category || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !catMatch) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'RANDOM') return 0;
      if (sortBy === 'NEWEST') return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      if (sortBy === 'PRICE_ASC') return a.sellingPrice - b.sellingPrice;
      if (sortBy === 'PRICE_DESC') return b.sellingPrice - a.sellingPrice;
      if (sortBy === 'TITLE_ASC') return a.title.localeCompare(b.title);
      return 0;
    });

  const totalItems = filteredAndSortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  const getVisiblePageNumbers = (current: number, total: number): (number | string)[] => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, '...', total];
    if (current >= total - 2) return [1, '...', total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const faqItems = [
    {
      q: 'Combien de temps faut-il pour recevoir mes identifiants après le paiement ?',
      a: 'La livraison est instantanée ou effectuée en moins de 2 minutes ! Dès que votre paiement par Mobile Money (Wave, MTN, Orange, Moov) ou Crypto est validé, vos accès s\'affichent directement sur votre ticket de commande sécurisé et restent consultables à tout moment.',
    },
    {
      q: 'Que se passe-t-il en cas de problème avec mon compte ou ma clé ?',
      a: 'Tous nos comptes bénéficient d\'une Garantie de Fonctionnement & Remplacement. Si vous rencontrez la moindre anomalie (mot de passe invalide, déconnexion), notre support Telegram ou Web remplace immédiatement votre compte sur simple transmission de votre Code Ticket.',
    },
    {
      q: 'Quels pays et réseaux Mobile Money sont acceptés ?',
      a: 'Nous acceptons Wave, MTN MoMo, Orange Money, Moov Money et les cartes bancaires Visa/Mastercard dans toute la zone UEMOA/CEMAC (Bénin, Côte d\'Ivoire, Sénégal, Cameroun, Togo, Mali, Burkina Faso, etc.) ainsi que les cryptomonnaies USDT TRC20/BEP20 pour l\'international.',
    },
    {
      q: 'Comment fonctionne le suivi de commande par Code Ticket ?',
      a: 'Chaque commande dispose d\'un identifiant unique (ex: TK-849201). Il vous suffit de cliquer sur "Suivre ma Commande" en haut de page, d\'entrer ce code, et vous retrouvez vos identifiants, votre statut de validation et vos instructions à toute heure.',
    },
    {
      q: 'Puis-je revendre vos abonnements à mes propres clients avec ma propre boutique ?',
      a: 'Oui, parfaitement ! Notre plateforme SaaS Revendeur vous permet d\'ouvrir votre propre boutique en ligne avec votre marque, vos propres prix de vente, vos coordonnées et un sous-domaine offert. Vous profitez de remises grossiste jusqu\'à -60% et retirez vos bénéfices quand vous voulez.',
    },
  ];

  const testimonials = [
    {
      name: 'Wilfried Kouassi',
      role: 'Revendeur SaaS & Entrepreneur',
      city: 'Abidjan, Côte d\'Ivoire',
      rating: 5,
      product: 'Boutique Revendeur Pro',
      comment:
        'J\'ai lancé ma boutique sous-domaine la semaine dernière. J\'ai déjà fait plus de 28 ventes d\'abonnements Netflix et Canva Pro. Les marges sont réelles et les retraits vers mon compte Wave arrivent sans délai.',
    },
    {
      name: 'Marc-Aurèle D.',
      role: 'Directeur d\'Agence Marketing',
      city: 'Cotonou, Bénin',
      rating: 5,
      product: 'ChatGPT Plus & Canva Pro',
      comment:
        'Tous mes graphistes et rédacteurs utilisent les comptes fournis par Entrepreneurs Positifs. Zéro coupure en 4 mois. Service client hyper réactif sur Telegram. Rien à voir avec les revendeurs douteux sur Facebook.',
    },
    {
      name: 'Aminata Sow',
      role: 'Étudiante & Freelance',
      city: 'Dakar, Sénégal',
      rating: 5,
      product: 'Spotify & ChatGPT Plus',
      comment:
        'Paiement par Orange Money ultra simple, ticket généré direct et accès fonctionnel en 1 minute. La garantie de remplacement donne une vraie tranquillité d\'esprit. Je recommande à 100%.',
    },
  ];

  // Schema.org FAQPage for Google Rich Snippets directly in SERP
  const homeFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 font-sans selection:bg-sky-500 selection:text-white transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }}
      />
      <Navbar />

      {/* HERO SECTION - REFINED FINTECH & SAAS LOOK */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 bg-grid-pattern border-b border-slate-200 dark:border-white/[0.08]">
        {/* Soft Radial Ambient Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-gradient-to-b from-sky-500/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center space-y-7 relative z-10">
          
          {/* Verified Official Supplier Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span className="text-slate-900 dark:text-white font-bold">Grossiste & Distributeur Officiel</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-sky-600 dark:text-sky-400 font-medium">+15 000 Commandes Validées</span>
          </div>

          {/* Master Headline */}
          <div className="space-y-3 max-w-4xl">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Abonnements & Licences Numériques au{' '}
              <span className="gradient-accent">Tarif Grossiste Direct</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
              Économisez jusqu&apos;à 70% sur vos accès Netflix, ChatGPT Plus, Canva Pro, Spotify, outils d&apos;IA et licences logicielles. 
              Livraison automatisée en moins de 2 minutes avec <strong className="text-slate-900 dark:text-white font-semibold">Assistance & Remplacement Garanti</strong>.
            </p>
          </div>

          {/* In-Hero Quick Search Bar */}
          <div className="w-full max-w-xl">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl opacity-20 group-hover:opacity-40 transition-all blur-sm" />
              <div className="relative bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-white/[0.12] rounded-2xl p-1.5 flex items-center shadow-xl">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Rechercher : Netflix, ChatGPT, Canva, Spotify, Windows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white mr-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <a
                    href="#catalogue"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs shrink-0 flex items-center space-x-1 shadow-md shadow-sky-500/20"
                  >
                    <span>Explorer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Keyword Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-600 dark:text-slate-500 mr-1">Populaire :</span>
              {['Netflix', 'ChatGPT Plus', 'Canva Pro', 'Spotify', 'Windows 11', 'Numéros OTP'].map((kw) => (
                <button
                  key={kw}
                  onClick={() => {
                    setSearchQuery(kw);
                    const el = document.getElementById('catalogue');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-slate-300 font-medium transition-all shadow-sm dark:shadow-none"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#catalogue"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Voir le Catalogue Complet</span>
            </a>

            <button
              onClick={() => {
                setShowLookupModal(true);
                setTicketLookupResult(null);
                setLookupError(null);
                setLookupTicketCode('');
              }}
              className="px-5 py-3 rounded-xl bg-white dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-white font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-sm dark:shadow-none"
            >
              <Ticket className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>Suivre ma Commande (Code Ticket)</span>
            </button>

            <Link
              href="/reseller/register"
              className="px-4 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-all"
            >
              <Store className="w-4 h-4" />
              <span>Devenir Revendeur SaaS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST & KEY METRICS STRIP */}
      <section className="border-b border-slate-200 dark:border-white/[0.08] bg-white/70 dark:bg-[#090e1a]/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex items-center space-x-3.5 shadow-sm dark:shadow-none">
              <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-sky-500 dark:text-sky-400" />
              </div>
              <div>
                <span className="block text-slate-900 dark:text-white font-black text-base sm:text-lg tracking-tight">&lt; 2 Minutes</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Livraison automatique par Ticket</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex items-center space-x-3.5 shadow-sm dark:shadow-none">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <span className="block text-slate-900 dark:text-white font-black text-base sm:text-lg tracking-tight">Garantie & Remplacement</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Remplacement ou réactivation immédiate</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex items-center space-x-3.5 shadow-sm dark:shadow-none">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              </div>
              <div>
                <span className="block text-slate-900 dark:text-white font-black text-base sm:text-lg tracking-tight">100% Sécurisé</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Wave, MTN, Orange, Moov, USDT</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex items-center space-x-3.5 shadow-sm dark:shadow-none">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <span className="block text-slate-900 dark:text-white font-black text-base sm:text-lg tracking-tight">4.9 / 5 Étoiles</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Avis vérifiés de nos clients réguliers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOGUE SECTION */}
      <main id="catalogue" className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-white/[0.08] pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Boutique Grossiste Officielle</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Abonnements & Licences en Direct
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Choisissez votre formule. Les accès sont vérifiés avant chaque livraison pour garantir 100% de fiabilité.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={fetchProducts}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm dark:shadow-none"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Rafraîchir les Stocks</span>
            </button>
          </div>
        </div>

        {/* Category Pills Navigation */}
        <div className="bg-white dark:bg-white/[0.02] p-2 rounded-2xl border border-slate-200 dark:border-white/[0.06] shadow-sm">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20 font-black'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Toolbar: Search, Stock Filter, Sort */}
        <div className="bg-white dark:bg-white/[0.02] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-white/[0.06] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Stock Availability Toggle */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl p-1">
              <button
                onClick={() => setStockFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  stockFilter === 'ALL'
                    ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tous les produits
              </button>
              <button
                onClick={() => setStockFilter('IN_STOCK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  stockFilter === 'IN_STOCK'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                En stock uniquement
              </button>
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">Tri :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="RANDOM" className="bg-white text-slate-900 dark:bg-[#0c1222] dark:text-white">Découverte (Aléatoire)</option>
                <option value="NEWEST" className="bg-white text-slate-900 dark:bg-[#0c1222] dark:text-white">Nouveautés</option>
                <option value="PRICE_ASC" className="bg-white text-slate-900 dark:bg-[#0c1222] dark:text-white">Prix : Croissant</option>
                <option value="PRICE_DESC" className="bg-white text-slate-900 dark:bg-[#0c1222] dark:text-white">Prix : Décroissant</option>
                <option value="TITLE_ASC" className="bg-white text-slate-900 dark:bg-[#0c1222] dark:text-white">Titre A-Z</option>
              </select>
            </div>
          </div>

          {/* Results Count & Items per page */}
          <div className="flex items-center justify-between md:justify-end space-x-3 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>
              <strong className="text-slate-900 dark:text-white">{totalItems}</strong> produit(s) trouvé(s)
            </span>
            <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-2.5 py-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Par page :</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-sky-600 dark:text-sky-400 focus:outline-none cursor-pointer"
              >
                <option value={9} className="bg-white text-slate-900 dark:bg-[#0c1222] dark:text-white">9</option>
                <option value={18} className="bg-white text-slate-900 dark:bg-[#0c1222] dark:text-white">18</option>
                <option value={36} className="bg-white text-slate-900 dark:bg-[#0c1222] dark:text-white">36</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-72 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] animate-pulse"
              />
            ))}
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-white/[0.02] rounded-3xl border border-slate-200 dark:border-white/[0.06] space-y-4 shadow-sm">
            <Package className="w-14 h-14 text-slate-400 dark:text-slate-600 mx-auto stroke-[1.2]" />
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Aucun produit ne correspond</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto">
              Essayez de modifier votre recherche ou de réinitialiser vos filtres de catégorie.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Tous');
                setSearchQuery('');
                setStockFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 text-xs font-bold border border-sky-500/20 transition-all inline-block"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {paginatedProducts.map((product) => {
              const stock = product.stock || 0;
              const isAvailable = product.isAvailable && stock > 0;

              return (
                <div
                  key={product.id}
                  className="top-edge-highlight group rounded-2xl bg-white dark:bg-[#0a0f1d]/90 hover:bg-slate-50 dark:hover:bg-[#0d1427] border border-slate-200 dark:border-white/[0.08] hover:border-sky-500/40 p-3.5 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-xl dark:shadow-md hover:shadow-sky-500/5 relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category + Stock Tag */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08] truncate max-w-[90px] sm:max-w-none">
                        {product.category || 'Digital'}
                      </span>

                      {isAvailable ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center space-x-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                          <span>En stock ({stock})</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 flex items-center space-x-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400" />
                          <span>Rupture temporaire</span>
                        </span>
                      )}
                    </div>

                    {/* Product Title */}
                    <Link href={`/product/${product.slug}`} className="block group/title">
                      <h3 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white group-hover/title:text-sky-600 dark:group-hover/title:text-sky-400 transition-colors line-clamp-2 leading-snug">
                        {product.title}
                      </h3>
                    </Link>

                    {/* Description preview */}
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                      {product.description || 'Abonnement officiel garanti avec livraison et activation automatique 24/7.'}
                    </p>

                    {/* Trust Micro-Badges */}
                    <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                        <BadgeCheck className="w-3 h-3 text-sky-500 dark:text-sky-400" />
                        <span>Compte Garanti</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                        <span>Livraison &lt; 2 min</span>
                      </span>
                    </div>
                  </div>

                  {/* Price & Action Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 hidden sm:block">
                        Tarif Grossiste
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm sm:text-xl font-black text-emerald-600 dark:text-emerald-400 leading-tight">
                          {formatPrice(product.sellingPrice)}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold hidden sm:block">
                          {currency === 'FCFA'
                            ? `($${product.sellingPrice.toFixed(2)} USD)`
                            : `(${formatPrice(product.sellingPrice, 'FCFA')})`}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenPurchase(product)}
                      disabled={!isAvailable}
                      className={`px-3 sm:px-5 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-md w-full sm:w-auto ${
                        isAvailable
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold shadow-sky-500/20 hover:scale-[1.02]'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Ticket className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{isAvailable ? 'Commander' : 'Épuisé'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] mt-8 shadow-sm">
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
              Page <strong className="text-slate-900 dark:text-white">{validPage}</strong> sur <strong className="text-slate-900 dark:text-white">{totalPages}</strong>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={validPage === 1}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Précédent</span>
              </button>

              <div className="flex items-center space-x-1">
                {getVisiblePageNumbers(validPage, totalPages).map((item, index) => {
                  if (typeof item === 'string') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-1 text-xs text-slate-400 dark:text-slate-500 font-bold select-none">
                        ...
                      </span>
                    );
                  }
                  const isActive = item === validPage;
                  return (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                        isActive
                          ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.06]'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={validPage === totalPages}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <span>Suivant</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* SECTION: COMMENT ÇA FONCTIONNE (3 ÉTAPES CLAIRES) */}
      <section className="border-t border-slate-200 dark:border-white/[0.08] bg-slate-100/60 dark:bg-[#090e1a]/60 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">Processus Transparent</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Comment obtenir vos abonnements en 3 étapes ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Un système pensé pour être ultra-simple, sécurisé et rapide pour tous les utilisateurs en Afrique et à l&apos;international.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] relative space-y-4 shadow-sm">
              <span className="text-3xl font-black text-sky-500/25 dark:text-sky-500/30">01</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Choisissez votre Produit</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Parcourez notre catalogue et sélectionnez votre abonnement (Netflix, ChatGPT, Canva, Spotify, etc.) avec la durée souhaitée.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] relative space-y-4 shadow-sm">
              <span className="text-3xl font-black text-indigo-500/25 dark:text-indigo-500/30">02</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Paiement Mobile Money ou Crypto</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Réglez en 1 clic par Wave, MTN MoMo, Orange Money, Moov ou Crypto USDT. La transaction est 100% chiffrée et sécurisée.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] relative space-y-4 shadow-sm">
              <span className="text-3xl font-black text-emerald-500/25 dark:text-emerald-500/30">03</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Identifiants Livrés Immédiatement</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Votre Code Ticket est généré et vos accès vous sont délivrés instantanément avec les instructions d&apos;utilisation complètes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: DEVENIR REVENDEUR SAAS (B2B SHOWCASE) */}
      <section className="border-t border-slate-200 dark:border-white/[0.08] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50 dark:bg-gradient-to-b dark:from-[#0a1224] dark:to-[#070b14]">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl border border-sky-500/30 p-8 sm:p-12 bg-white dark:bg-sky-500/[0.03] backdrop-blur-xl relative overflow-hidden space-y-8 shadow-lg dark:shadow-none">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold">
                <Store className="w-3.5 h-3.5" />
                <span>Opportunité Entrepreneur Digital</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Lancez votre Propre Boutique d&apos;Abonnements en 2 Minutes
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                Rejoignez notre réseau de revendeurs certifiés : recevez votre propre site e-commerce avec votre marque, 
                un sous-domaine offert, vos propres prix de revente et encaissez vos bénéfices directement via Mobile Money.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
                <span className="block text-sky-600 dark:text-sky-400 font-bold text-sm">Jusqu&apos;à -60%</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Réductions grossiste exclusives</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
                <span className="block text-emerald-600 dark:text-emerald-400 font-bold text-sm">Sous-Domaine Offert</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Vitrine clé en main personnalisée</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
                <span className="block text-purple-600 dark:text-purple-400 font-bold text-sm">100% Vos Marges</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Définissez librement vos prix</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
                <span className="block text-amber-600 dark:text-amber-400 font-bold text-sm">Retraits Instantanés</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Paiement Mobile Money automatique</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/reseller/register"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/25 flex items-center space-x-2"
              >
                <span>Créer ma Boutique Revendeur</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/reseller/login"
                className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/[0.1] text-slate-800 dark:text-white font-bold text-xs sm:text-sm"
              >
                <span>Connexion Espace Revendeur</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: TÉMOIGNAGES CLIENTS VÉRIFIÉS */}
      <section className="border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#090e1a]/40 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">Avis Vérifiés</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Ce que disent nos clients réguliers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Des centaines d&apos;utilisateurs, créateurs et agences nous font confiance au quotidien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between space-y-4 shadow-sm dark:shadow-none"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal italic">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{t.name}</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.role} &bull; {t.city}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-semibold border border-sky-500/20">
                    Achat Vérifié
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: FOIRE AUX QUESTIONS (FAQ) */}
      <section id="faq" className="border-t border-slate-200 dark:border-white/[0.08] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">Assistance & Clarté</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Foire Aux Questions (FAQ)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Retrouvez toutes les réponses aux questions les plus fréquentes sur nos services et la livraison.
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  >
                    <span>{item.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/[0.04] pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CREATE TICKET MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-white/[0.12] rounded-3xl max-w-lg w-full max-w-[calc(100vw-1.5rem)] max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.08]"
            >
              <X className="w-5 h-5" />
            </button>

            {!createdTicketResult ? (
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider">
                    Commande d&apos;Abonnement
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 leading-snug">
                    {selectedProduct.title}
                  </h3>
                </div>

                {/* Complete Product Description Display */}
                {selectedProduct.description && (
                  <div className="bg-slate-50 dark:bg-[#070b14] p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                      <span>Détails & Instructions du Produit</span>
                    </span>
                    <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                      {selectedProduct.description}
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 dark:bg-[#070b14] p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Tarif unitaire :</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatPrice(selectedProduct.sellingPrice)} ({currency === 'FCFA' ? `$${selectedProduct.sellingPrice.toFixed(2)} USD` : formatPrice(selectedProduct.sellingPrice, 'FCFA')})
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Garantie active :</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Garantie & Remplacement Inclus</span>
                    </span>
                  </div>
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Quantité
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-800 dark:text-white font-bold flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-black text-slate-900 dark:text-white px-4">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedProduct.stock || 1, quantity + 1))}
                      className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-800 dark:text-white font-bold flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Customer Info Required for Supplier */}
                {selectedProduct.requiresCustomerInfo && (
                  <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 space-y-2">
                    <label className="block text-xs font-black text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                      📋 {selectedProduct.customerInfoPrompt || 'Informations requises pour le compte'} *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder={selectedProduct.customerInfoPlaceholder || 'Ex: Votre email à upgrader, identifiant ou numéro...'}
                      value={customerAccounts}
                      onChange={(e) => setCustomerAccounts(e.target.value)}
                      className="w-full bg-white dark:bg-[#070b14] border border-sky-300 dark:border-sky-500/40 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Ces informations permettront d&apos;activer votre abonnement directement.
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase">Montant Total :</span>
                    <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatPrice(selectedProduct.sellingPrice * quantity)}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
                      {currency === 'FCFA' ? `($${(selectedProduct.sellingPrice * quantity).toFixed(2)} USD)` : `(${formatPrice(selectedProduct.sellingPrice * quantity, 'FCFA')})`}
                    </span>
                  </div>

                  <button
                    onClick={handleCreateTicket}
                    disabled={creatingTicket}
                    className="px-6 py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white flex items-center space-x-2 shadow-lg shadow-sky-500/25 disabled:opacity-50 transition-all"
                  >
                    {creatingTicket ? (
                      <>
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                        <span>Génération du ticket...</span>
                      </>
                    ) : (
                      <>
                        <Ticket className="w-4 h-4 stroke-[2.5]" />
                        <span>Générer mon Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Created Ticket & Payment Instructions Display */
              <div className="space-y-4 pt-1">
                {createdTicketResult.success ? (
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-500 dark:text-sky-400 flex items-center justify-center mx-auto border border-sky-500/30">
                        <Ticket className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Ticket de Commande Généré !</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Procédez au paiement ci-dessous pour que votre commande soit validée automatiquement.
                      </p>
                    </div>

                    {/* Ticket Code Box */}
                    <div className="bg-slate-50 dark:bg-[#070b14] p-4 rounded-2xl border border-sky-500/30 text-center space-y-1 relative">
                      <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider">
                        VOTRE CODE DE TICKET PERSONNEL
                      </span>
                      <div className="flex items-center justify-center space-x-3 pt-1">
                        <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-wider">
                          {createdTicketResult.ticketCode}
                        </span>
                        <button
                          onClick={() => copyToClipboard(createdTicketResult.ticketCode, 'created-ticket')}
                          className="px-3 py-1 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold hover:bg-sky-500/30 flex items-center space-x-1"
                        >
                          {copiedId === 'created-ticket' ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === 'created-ticket' ? 'Copié !' : 'Copier'}</span>
                        </button>
                      </div>
                    </div>

                    {/* FeexPay Automated Payment Box */}
                    {paymentMethods?.feexpay?.enabled && (
                      <div className="bg-slate-50 dark:bg-[#070b14] p-4 rounded-2xl border border-emerald-500/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">Paiement Mobile Money Direct</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            Wave, MTN, Orange, Moov, CB
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          Validation instantanée 24/7. Dès la confirmation par votre opérateur, vos identifiants s&apos;affichent immédiatement.
                        </p>

                        <button
                          onClick={() => handlePayWithFeexPay(createdTicketResult.ticketCode)}
                          disabled={payingWithFeexPay}
                          className="w-full py-3 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
                        >
                          {payingWithFeexPay ? (
                            <>
                              <RefreshCcw className="w-4 h-4 animate-spin" />
                              <span>Connexion à la passerelle...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 fill-current text-slate-950" />
                              <span>Payer par Mobile Money ({Math.round(createdTicketResult.totalAmount * 650).toLocaleString()} FCFA)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Moneroo Automated Payment Box */}
                    {paymentMethods?.moneroo?.enabled && (
                      <div className="bg-slate-50 dark:bg-[#070b14] p-4 rounded-2xl border border-purple-500/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse" />
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white">Passerelle Moneroo</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                            Mobile Money & Carte
                          </span>
                        </div>

                        <button
                          onClick={() => handlePayWithMoneroo(createdTicketResult.ticketCode)}
                          disabled={payingWithMoneroo}
                          className="w-full py-3 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all"
                        >
                          {payingWithMoneroo ? (
                            <>
                              <RefreshCcw className="w-4 h-4 animate-spin" />
                              <span>Connexion à Moneroo...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4 text-white" />
                              <span>Payer par Moneroo ({Math.round(createdTicketResult.totalAmount * 650).toLocaleString()} FCFA)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Manual Payment Instructions Box */}
                    {paymentMethods?.manual?.enabled && (
                      <div className="bg-slate-50 dark:bg-[#070b14] p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] space-y-2 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-white/[0.06]">
                          <span className="font-bold text-slate-700 dark:text-slate-300">Instructions de Paiement Manuel (${createdTicketResult.totalAmount.toFixed(2)})</span>
                        </div>
                        <pre className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed text-[11px] bg-white dark:bg-[#0c1222] p-3 rounded-xl border border-slate-200 dark:border-white/[0.08]">
                          {createdTicketResult.paymentInstructions}
                        </pre>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-800 dark:text-white font-bold rounded-2xl text-xs transition-colors"
                    >
                      Fermer la fenêtre
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Erreur lors de la création</h3>
                    <p className="text-xs text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 p-3 rounded-2xl border border-rose-200 dark:border-rose-500/20">
                      {createdTicketResult.message}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TICKET LOOKUP MODAL */}
      {showLookupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-white/[0.12] rounded-3xl max-w-lg w-full max-w-[calc(100vw-1.5rem)] max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl relative space-y-5">
            
            <button
              onClick={() => setShowLookupModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.08]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <Ticket className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                <span>Suivre ma Commande (Code Ticket)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Entrez votre code de ticket (ex: TK-784920) pour vérifier l&apos;état ou accéder à vos identifiants.
              </p>
            </div>

            <form onSubmit={handleLookupTicket} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Ex: TK-784920"
                value={lookupTicketCode}
                onChange={(e) => setLookupTicketCode(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/[0.1] rounded-2xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={searchingTicket}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs flex items-center space-x-1 transition-all"
              >
                {searchingTicket ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <span>Rechercher</span>}
              </button>
            </form>

            {lookupError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            {ticketLookupResult && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-white/[0.08]">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{ticketLookupResult.product?.title || 'Produit Digital'}</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Code: {ticketLookupResult.ticketCode}</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                      ticketLookupResult.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : ticketLookupResult.status === 'CANCELLED'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {ticketLookupResult.status === 'COMPLETED'
                      ? 'Livré & Validé'
                      : ticketLookupResult.status === 'CANCELLED'
                      ? 'Annulé'
                      : 'En attente de paiement'}
                  </span>
                </div>

                {ticketLookupResult.status === 'CANCELLED' ? (
                  <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Ce ticket a été annulé</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Motif : {ticketLookupResult.errorMessage || "Paiement non reçu ou invalidé par l'administrateur."}
                    </p>
                  </div>
                ) : ticketLookupResult.status === 'PENDING_PAYMENT' ? (
                  <div className="space-y-3">
                    {paymentMethods?.feexpay?.enabled && (
                      <div className="bg-slate-50 dark:bg-[#070b14] p-3.5 rounded-xl border border-emerald-500/40 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                            <span>Payer par Mobile Money (FeexPay)</span>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Wave, MTN, Orange, Moov
                          </span>
                        </div>
                        <button
                          onClick={() => handlePayWithFeexPay(ticketLookupResult.ticketCode)}
                          disabled={payingWithFeexPay}
                          className="w-full py-2.5 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
                        >
                          {payingWithFeexPay ? (
                            <>
                              <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                              <span>Connexion à FeexPay...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 fill-current text-slate-950" />
                              <span>Payer par FeexPay ({Math.round(ticketLookupResult.totalAmount * 650).toLocaleString()} FCFA)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {paymentMethods?.moneroo?.enabled && (
                      <div className="bg-slate-50 dark:bg-[#070b14] p-3.5 rounded-xl border border-purple-500/40 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse" />
                            <span>Payer par Moneroo</span>
                          </span>
                        </div>
                        <button
                          onClick={() => handlePayWithMoneroo(ticketLookupResult.ticketCode)}
                          disabled={payingWithMoneroo}
                          className="w-full py-2.5 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white flex items-center justify-center space-x-2"
                        >
                          {payingWithMoneroo ? (
                            <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <span>Payer par Moneroo ({Math.round(ticketLookupResult.totalAmount * 650).toLocaleString()} FCFA)</span>
                          )}
                        </button>
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Instructions de Paiement Manuel</span>
                      <div className="bg-slate-50 dark:bg-[#070b14] p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans">
                        {ticketLookupResult.paymentInstructions}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Delivered Article Credentials */
                  <div className="pt-1">
                    <FormattedCredentials credentials={ticketLookupResult.deliveredCredentials} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Support Live Widget */}
      <SupportWidget />

      {/* Footer */}
      <Footer />
    </div>
  );
}
