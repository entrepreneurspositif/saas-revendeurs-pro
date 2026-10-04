'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
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
} from 'lucide-react';

import { useCurrency } from '@/components/CurrencyContext';

export default function StorefrontPage() {
  const { currency, formatPrice, formatBoth } = useCurrency();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'TITLE_ASC' | 'TITLE_DESC'>('NEWEST');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(9);

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
    { name: 'Tous', icon: Layers },
    { name: 'IA & APIs', icon: Bot },
    { name: 'Licences & Outils Dev', icon: Code2 },
    { name: 'Mobile & Services', icon: Smartphone },
    { name: 'Abonnements & Comptes', icon: KeyRound },
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
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

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      alert(`Passerelle ${data.gatewayName || ''} activée pour le ticket ${data.ticketCode}.`);
    } catch (e: any) {
      alert(e.message || 'Erreur de connexion à la passerelle.');
    } finally {
      setPayingWithCustomGateway(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, stockFilter, sortBy, itemsPerPage]);


  const handleOpenPurchase = (product: any) => {
    setSelectedProduct(product);
    setQuantity(1);
    setCustomerAccounts('');
    setCreatedTicketResult(null);
  };

  const handleCreateTicket = async () => {
    if (!selectedProduct) return;
    setCreatingTicket(true);
    setCreatedTicketResult(null);

    try {
      const res = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity,
          customerAccounts,
        }),
      });

      const data = await res.json();
      setCreatedTicketResult(data);
    } catch (e: any) {
      setCreatedTicketResult({
        success: false,
        message: e.message || 'Erreur réseau lors de la génération du ticket.',
      });
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
        alert(data.message || 'Erreur lors de l\'initialisation de FeexPay.');
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
      if (sortBy === 'NEWEST') {
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      }
      if (sortBy === 'PRICE_ASC') {
        return a.sellingPrice - b.sellingPrice;
      }
      if (sortBy === 'PRICE_DESC') {
        return b.sellingPrice - a.sellingPrice;
      }
      if (sortBy === 'TITLE_ASC') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'TITLE_DESC') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

  const totalItems = filteredAndSortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  const getVisiblePageNumbers = (current: number, total: number): (number | string)[] => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, '...', total];
    }
    if (current >= total - 2) {
      return [1, '...', total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950">

      <Navbar />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden border-b border-slate-800/60 glass-panel pt-14 pb-16 px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-bold tracking-wide shadow-lg shadow-sky-500/10">
            <Ticket className="w-4 h-4 text-sky-400" />
            <span>Système de Ticket & Validation de Paiement</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.15]">
            Abonnements & Produits Digitaux{' '}
            <span className="gradient-text">au Meilleur Prix</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Sélectionnez votre produit, obtenez votre ticket de commande avec les instructions de paiement. 
            Une fois validé par l'admin, vos accès et clés sont livrés automatiquement sur votre ticket.
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setShowLookupModal(true);
                setTicketLookupResult(null);
                setLookupError(null);
                setLookupTicketCode('');
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-xl shadow-sky-500/20 transition-all group"
            >
              <Ticket className="w-4 h-4 stroke-[2.5]" />
              <span>Suivre un Ticket / Récupérer mon Article</span>
            </button>

            <button
              onClick={fetchProducts}
              className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white font-bold text-xs flex items-center space-x-2 transition-all"
            >
              <RefreshCcw className="w-4 h-4 text-slate-400" />
              <span>Actualiser Catalogue</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Category Navigation */}
        <div className="glass-panel p-3.5 rounded-2xl border border-slate-800/80 shadow-lg">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-slate-950 font-black shadow-md shadow-sky-500/20'
                      : 'bg-slate-900/70 text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Toolbar & Search */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 shadow-lg">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Stock Availability Filter */}
            <div className="flex items-center space-x-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setStockFilter('ALL')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  stockFilter === 'ALL'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tous les articles
              </button>
              <button
                onClick={() => setStockFilter('IN_STOCK')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  stockFilter === 'IN_STOCK'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                En stock uniquement
              </button>
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-400 shrink-0">Trier:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[11px] sm:text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="NEWEST" className="bg-slate-900 text-white">Plus récents</option>
                <option value="OLDEST" className="bg-slate-900 text-white">Plus anciens</option>
                <option value="PRICE_ASC" className="bg-slate-900 text-white">Prix: Croissant</option>
                <option value="PRICE_DESC" className="bg-slate-900 text-white">Prix: Décroissant</option>
                <option value="TITLE_ASC" className="bg-slate-900 text-white">Titre: A-Z</option>
                <option value="TITLE_DESC" className="bg-slate-900 text-white">Titre: Z-A</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-[11px] sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Items Per Page */}
            <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 shrink-0">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-400">Afficher:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-transparent text-[11px] sm:text-xs font-bold text-sky-400 focus:outline-none cursor-pointer"
              >
                <option value={6} className="bg-slate-900 text-white">6</option>
                <option value={9} className="bg-slate-900 text-white">9</option>
                <option value={12} className="bg-slate-900 text-white">12</option>
                <option value={24} className="bg-slate-900 text-white">24</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 px-1 font-bold">
          <span>
            Affichage de <strong className="text-white">{totalItems > 0 ? startIndex + 1 : 0}</strong> à{' '}
            <strong className="text-white">{endIndex}</strong> sur <strong className="text-sky-400">{totalItems}</strong> produit(s)
          </span>
          {stockFilter === 'IN_STOCK' && (
            <span className="text-emerald-400 text-[11px] flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Filtre "En stock" actif</span>
            </span>
          )}
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 rounded-3xl bg-slate-900/40 animate-pulse border border-slate-800/60" />
            ))}
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl border border-slate-800/80 space-y-3">
            <Package className="w-14 h-14 text-slate-600 mx-auto stroke-1" />
            <h3 className="text-xl font-extrabold text-white">Aucun produit trouvé</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              Aucun produit ne correspond à vos critères de filtre ou de recherche actuels.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Tous');
                setSearchQuery('');
                setStockFilter('ALL');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 text-xs font-bold border border-sky-500/20 transition-all inline-block"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.map((product) => {
              const stock = product.stock || 0;
              const isAvailable = product.isAvailable;

              return (
                <div
                  key={product.id}
                  className="glass-card rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group border border-slate-800/90 hover:border-sky-500/40"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-800/80 text-slate-300 tracking-wider border border-slate-700/50">
                        {product.category}
                      </span>

                      {stock > 0 ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Stock: {stock}</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          <span>Épuisé</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-white group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug mb-2">
                      {product.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-6">
                      {product.description || 'Compte premium avec livraison et activation automatique garantie.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block mb-0.5">
                        Prix de vente ({currency})
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-emerald-400 leading-tight">
                          {formatPrice(product.sellingPrice)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          {currency === 'FCFA' ? `($${product.sellingPrice.toFixed(2)} USD)` : `(${formatPrice(product.sellingPrice, 'FCFA')})`}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenPurchase(product)}
                      disabled={!isAvailable}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all shadow-lg ${
                        isAvailable
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black shadow-sky-500/20 hover:scale-[1.02]'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Ticket className="w-4 h-4 stroke-[2.5]" />
                      <span>{isAvailable ? 'Commander Ticket' : 'Rupture'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Responsive Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 glass-panel p-3.5 sm:p-4 rounded-2xl border border-slate-800/80 mt-8 shadow-xl">
            <div className="text-xs text-slate-400 font-bold text-center sm:text-left">
              Page <span className="text-white font-extrabold">{validPage}</span> sur{' '}
              <span className="text-white font-extrabold">{totalPages}</span>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={validPage === 1}
                className="px-3 sm:px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 sm:space-x-1.5 transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden xs:inline">Précédent</span>
              </button>

              <div className="flex items-center space-x-1">
                {getVisiblePageNumbers(validPage, totalPages).map((item, index) => {
                  if (typeof item === 'string') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-1 text-xs text-slate-500 font-bold select-none">
                        ...
                      </span>
                    );
                  }
                  const isActive = item === validPage;
                  return (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center ${
                        isActive
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-slate-950 font-black shadow-md shadow-sky-500/20 scale-105'
                          : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
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
                className="px-3 sm:px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 sm:space-x-1.5 transition-all shadow-sm"
              >
                <span className="hidden xs:inline">Suivant</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </main>


      {/* CREATE TICKET MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-w-[calc(100vw-1.5rem)] max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {!createdTicketResult ? (
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider">
                    Génération de Ticket de Commande
                  </span>
                  <h3 className="text-lg font-extrabold text-white mt-1 leading-snug">
                    {selectedProduct.title}
                  </h3>
                </div>

                {/* Complete Product Description Display */}
                {selectedProduct.description && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-400" />
                      <span>Description Complète du Produit</span>
                    </span>
                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                      {selectedProduct.description}
                    </div>
                  </div>
                )}

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Prix unitaire:</span>
                    <span className="font-extrabold text-emerald-400 text-sm">
                      {formatPrice(selectedProduct.sellingPrice)} ({currency === 'FCFA' ? `$${selectedProduct.sellingPrice.toFixed(2)} USD` : formatPrice(selectedProduct.sellingPrice, 'FCFA')})
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Validation paiement:</span>
                    <span className="font-bold text-sky-400 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Vérification Admin requise</span>
                    </span>
                  </div>
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                    Quantité
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-black text-white px-4">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedProduct.stock || 1, quantity + 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-black uppercase">Montant Total À Payer:</span>
                    <span className="block text-xl font-black text-sky-400">
                      {formatPrice(selectedProduct.sellingPrice * quantity)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block">
                      {currency === 'FCFA' ? `($${(selectedProduct.sellingPrice * quantity).toFixed(2)} USD)` : `(${formatPrice(selectedProduct.sellingPrice * quantity, 'FCFA')})`}
                    </span>
                  </div>

                  <button
                    onClick={handleCreateTicket}
                    disabled={creatingTicket}
                    className="px-6 py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 flex items-center space-x-2 shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all"
                  >
                    {creatingTicket ? (
                      <>
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                        <span>Génération du ticket...</span>
                      </>
                    ) : (
                      <>
                        <Ticket className="w-4 h-4 stroke-[2.5]" />
                        <span>Obtenir mon Ticket</span>
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
                      <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto border border-sky-500/30">
                        <Ticket className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-extrabold text-white">Ticket de Commande Généré !</h3>
                      <p className="text-xs text-slate-400">
                        Payer le montant ci-dessous en suivant les instructions, puis l'admin validera votre ticket.
                      </p>
                    </div>

                    {/* Ticket Code Box */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-sky-500/30 text-center space-y-1 relative">
                      <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider">
                        VOTRE CODE DE TICKET (À CONSERVER)
                      </span>
                      <div className="flex items-center justify-center space-x-3 pt-1">
                        <span className="text-2xl font-black font-mono text-emerald-400 tracking-wider">
                          {createdTicketResult.ticketCode}
                        </span>
                        <button
                          onClick={() => copyToClipboard(createdTicketResult.ticketCode, 'created-ticket')}
                          className="px-3 py-1 rounded-xl bg-sky-500/20 text-sky-400 text-xs font-bold hover:bg-sky-500/30 flex items-center space-x-1"
                        >
                          {copiedId === 'created-ticket' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === 'created-ticket' ? 'Copié !' : 'Copier'}</span>
                        </button>
                      </div>
                    </div>

                    {/* FeexPay Automated Payment Box */}
                    {paymentMethods?.feexpay?.enabled && (
                      <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 space-y-3 shadow-lg shadow-emerald-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-extrabold text-xs text-white">Paiement Automatique Instantané</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            FeexPay (MTN, Moov, Wave, CB)
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Payez automatiquement par Mobile Money ou Carte Bancaire. Vos accès seront livrés <b>automatiquement en 1-clic</b> dès la confirmation.
                        </p>

                        <button
                          onClick={() => handlePayWithFeexPay(createdTicketResult.ticketCode)}
                          disabled={payingWithFeexPay}
                          className="w-full py-3 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
                        >
                          {payingWithFeexPay ? (
                            <>
                              <RefreshCcw className="w-4 h-4 animate-spin" />
                              <span>Connexion à FeexPay...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 fill-current text-slate-950" />
                              <span>Payer par FeexPay ({Math.round(createdTicketResult.totalAmount * 650).toLocaleString()} FCFA)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Moneroo Automated Payment Box */}
                    {paymentMethods?.moneroo?.enabled && (
                      <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/40 space-y-3 shadow-lg shadow-purple-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
                            <span className="font-extrabold text-xs text-white">Passerelle Globale Moneroo</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            Moneroo (Mobile Money Int., CB)
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Paiement rapide et sécurisé par Mobile Money International, Carte Bancaire ou Crypto via Moneroo.
                        </p>

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

                    {/* Custom 2nd Gateway Automated Payment Box */}
                    {paymentMethods?.custom?.enabled && (
                      <div className="bg-slate-950 p-4 rounded-2xl border border-sky-500/40 space-y-3 shadow-lg shadow-sky-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                            <span className="font-extrabold text-xs text-white">Payer via {paymentMethods.custom.name}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                            Passerelle Partenaire
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {paymentMethods.custom.instructions || `Effectuez votre paiement via ${paymentMethods.custom.name}.`}
                        </p>

                        <button
                          onClick={() => handlePayWithCustomGateway(createdTicketResult.ticketCode)}
                          disabled={payingWithCustomGateway}
                          className="w-full py-3 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all"
                        >
                          {payingWithCustomGateway ? (
                            <>
                              <RefreshCcw className="w-4 h-4 animate-spin" />
                              <span>Connexion en cours...</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-4 h-4" />
                              <span>Payer par {paymentMethods.custom.name} ({Math.round(createdTicketResult.totalAmount * 650).toLocaleString()} FCFA)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Manual Payment Instructions Box */}
                    {paymentMethods?.manual?.enabled && (
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <span className="font-bold text-slate-300">Instructions de Paiement Manuel (${createdTicketResult.totalAmount.toFixed(2)})</span>
                        </div>
                        <pre className="text-slate-300 whitespace-pre-wrap font-sans leading-relaxed text-[11px] bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                          {createdTicketResult.paymentInstructions}
                        </pre>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-2xl text-xs transition-colors"
                    >
                      Fermer la fenêtre
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-extrabold text-white">Erreur lors de la création</h3>
                    <p className="text-xs text-rose-300 bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-w-[calc(100vw-1.5rem)] max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl relative space-y-5">
            
            <button
              onClick={() => setShowLookupModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <Ticket className="w-5 h-5 text-sky-400" />
                <span>Suivre un Ticket / Récupérer mon Article</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Entrez votre code de ticket (ex: TK-784920) pour vérifier l'état du paiement ou afficher vos clés d'accès.
              </p>
            </div>

            <form onSubmit={handleLookupTicket} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Ex: TK-784920"
                value={lookupTicketCode}
                onChange={(e) => setLookupTicketCode(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-white font-mono uppercase focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={searchingTicket}
                className="px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center space-x-1 transition-all"
              >
                {searchingTicket ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <span>Rechercher</span>}
              </button>
            </form>

            {lookupError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {lookupError}
              </div>
            )}

            {/* Lookup Result Card */}
            {ticketLookupResult && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs animate-in fade-in duration-150">
                <div className="flex justify-between items-start pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="font-extrabold text-white text-sm">{ticketLookupResult.productTitle}</h4>
                    <span className="text-[10px] text-slate-500">Code Ticket: {ticketLookupResult.ticketCode}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                    ticketLookupResult.status === 'COMPLETED'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : ticketLookupResult.status === 'CANCELLED'
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}>
                    {ticketLookupResult.status === 'COMPLETED'
                      ? 'PAYÉ & LIVRÉ'
                      : ticketLookupResult.status === 'CANCELLED'
                      ? 'PAIEMENT REFUSÉ / ANNULÉ'
                      : 'EN ATTENTE DE PAIEMENT'}
                  </span>
                </div>

                {ticketLookupResult.productDescription && (
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center space-x-1">
                      <FileText className="w-3 h-3 text-sky-400" />
                      <span>Description de l'Article</span>
                    </span>
                    <p className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {ticketLookupResult.productDescription}
                    </p>
                  </div>
                )}

                {ticketLookupResult.status === 'CANCELLED' ? (
                  <div className="space-y-2">
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 space-y-1">
                      <span className="font-extrabold text-xs block text-rose-400">
                        🚫 Demande de Commande Refusée ou Annulée
                      </span>
                      <p className="text-[11px] text-slate-300">
                        Motif : {ticketLookupResult.errorMessage || "Paiement non reçu ou invalidé par l'administrateur."}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center">
                      Besoin d'aide ? Utilisez le bouton <strong className="text-sky-400">Support Live</strong> en bas à droite pour contacter l'admin.
                    </p>
                  </div>
                ) : ticketLookupResult.status === 'PENDING_PAYMENT' ? (
                  <div className="space-y-3">
                    {/* FeexPay Instant Automated Payment Box */}
                    {paymentMethods?.feexpay?.enabled && (
                      <div className="bg-slate-900/90 p-3.5 rounded-xl border border-emerald-500/40 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-white flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Payer Instantanément via FeexPay</span>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            MTN, Moov, Wave, CB
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

                    {/* Moneroo Instant Automated Payment Box */}
                    {paymentMethods?.moneroo?.enabled && (
                      <div className="bg-slate-900/90 p-3.5 rounded-xl border border-purple-500/40 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-white flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                            <span>Payer via Moneroo (Mobile Money Int., CB)</span>
                          </span>
                          <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                            Moneroo
                          </span>
                        </div>
                        <button
                          onClick={() => handlePayWithMoneroo(ticketLookupResult.ticketCode)}
                          disabled={payingWithMoneroo}
                          className="w-full py-2.5 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all"
                        >
                          {payingWithMoneroo ? (
                            <>
                              <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                              <span>Connexion à Moneroo...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-white" />
                              <span>Payer par Moneroo ({Math.round(ticketLookupResult.totalAmount * 650).toLocaleString()} FCFA)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Autre Option : Instructions de Paiement Manuel</span>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 whitespace-pre-wrap font-sans">
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
    </div>
  );
}
