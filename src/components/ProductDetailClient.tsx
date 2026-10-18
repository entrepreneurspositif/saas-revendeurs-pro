'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Share2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Ticket,
  Clock,
  ArrowRight,
  Headphones,
  Lock,
  Plus,
  Minus,
  Star,
  ExternalLink,
  Store,
  BadgeCheck,
  X,
} from 'lucide-react';
import { useCurrency } from '@/components/CurrencyContext';

interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  sellingPrice: number;
  stock: number;
  isAvailable: boolean;
  isActive: boolean;
  isExclusive: boolean;
  imageUrl?: string | null;
  requiresCustomerInfo?: boolean;
  customerInfoPrompt?: string | null;
  updatedAt?: Date | string;
}

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { currency, formatPrice } = useCurrency();

  const [quantity, setQuantity] = useState<number>(1);
  const [customerAccounts, setCustomerAccounts] = useState<string>('');
  const [creatingTicket, setCreatingTicket] = useState<boolean>(false);
  const [createdTicketResult, setCreatedTicketResult] = useState<any | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [copiedTicket, setCopiedTicket] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [payingWithFeexPay, setPayingWithFeexPay] = useState<boolean>(false);
  const [payingWithMoneroo, setPayingWithMoneroo] = useState<boolean>(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const stock = typeof product.stock === 'number' ? product.stock : 999;
  const isAvailable =
    product.isAvailable !== undefined
      ? Boolean(product.isAvailable && product.isActive !== false && stock > 0)
      : Boolean(product.isActive !== false && stock > 0);

  // Handle Share Product
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : `https://abonnementspro.com/product/${product.slug}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Découvrez ${product.title} au tarif grossiste sur Abonnements Pro !`,
          url,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Create Ticket
  const handleCreateTicket = async () => {
    if (!isAvailable || quantity < 1 || creatingTicket) return;
    if (product.requiresCustomerInfo && !customerAccounts.trim()) {
      alert(`Veuillez renseigner : ${product.customerInfoPrompt || 'les informations de compte requises'}`);
      return;
    }

    setCreatingTicket(true);
    setTicketError(null);
    try {
      const res = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          customerAccounts: customerAccounts.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Impossible de créer la commande.');
      }
      setCreatedTicketResult(data);
    } catch (e: any) {
      setTicketError(e.message || 'Erreur réseau lors de la commande.');
    } finally {
      setCreatingTicket(false);
    }
  };

  // Pay with FeexPay
  const handlePayWithFeexPay = async (ticketCode: string) => {
    if (!ticketCode || payingWithFeexPay) return;
    setPayingWithFeexPay(true);
    try {
      const res = await fetch('/api/feexpay/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode }),
      });
      const data = await res.json();
      if (!data.success || !data.paymentUrl) {
        alert(data.message || 'Erreur lors de l\'initialisation FeexPay.');
        return;
      }
      window.location.href = data.paymentUrl;
    } catch (e) {
      alert('Erreur réseau lors de l\'initialisation du paiement.');
    } finally {
      setPayingWithFeexPay(false);
    }
  };

  // Pay with Moneroo
  const handlePayWithMoneroo = async (ticketCode: string) => {
    if (!ticketCode || payingWithMoneroo) return;
    setPayingWithMoneroo(true);
    try {
      const res = await fetch('/api/moneroo/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode }),
      });
      const data = await res.json();
      if (!data.success || !data.checkoutUrl) {
        alert(data.message || 'Erreur lors de l\'initialisation Moneroo.');
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch (e) {
      alert('Erreur réseau lors de l\'initialisation du paiement.');
    } finally {
      setPayingWithMoneroo(false);
    }
  };

  const copyTicketCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  const faqs = [
    {
      q: `Comment s'effectue la livraison de ${product.title} ?`,
      a: 'La livraison est 100% automatique et instantanée. Dès que votre règlement par Mobile Money (MTN, Moov, Orange, Wave) ou Carte Bancaire est confirmé par le système, vos identifiants ou liens d\'invitation s\'affichent directement sur votre écran et vous pouvez les consulter à tout moment grâce à votre code ticket sécurisé.',
    },
    {
      q: 'Quels sont les moyens de paiement acceptés ?',
      a: 'Nous acceptons les règlements par Mobile Money en Afrique (MTN Mobile Money, Moov Money, Orange Money, Celtiis Cash, Wave), par Carte Bancaire internationale (Visa, Mastercard) et par Cryptomonnaies.',
    },
    {
      q: 'Ce produit bénéficie-t-il d\'une garantie ?',
      a: 'Absolument. Tous nos accès sont testés et vérifiés avant livraison. En cas de problème ou de question, notre équipe support est joignable 24/7 sur le chat ou par WhatsApp.',
    },
    {
      q: 'Puis-je commander en grande quantité ou devenir revendeur ?',
      a: 'Oui ! Abonnements Pro propose un programme revendeur complet qui vous permet d\'avoir votre propre boutique personnalisée, de fixer librement vos marges et d\'acheter à tarif grossiste exclusif.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap pb-1">
          <Link href="/" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
            Accueil
          </Link>
          <span>/</span>
          <Link href={`/?category=${encodeURIComponent(product.category || 'Tous')}`} className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
            {product.category || 'Abonnements'}
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-white font-bold truncate max-w-[200px] sm:max-w-md">
            {product.title}
          </span>
        </nav>

        {/* Product Hero 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN (7 COLS): Image/Banner + Full Presentation + FAQs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Visual Header / Product Image Container */}
            <div className="bg-white dark:bg-[#0a0f1d] rounded-3xl border border-slate-200 dark:border-white/[0.08] p-6 sm:p-8 shadow-sm dark:shadow-xl relative overflow-hidden space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  {product.category || 'Digital'}
                </span>

                <div className="flex items-center space-x-2">
                  {isAvailable ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                      <span>En Stock ({stock > 900 ? 'Disponible' : `${stock} disponibles`})</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400" />
                      <span>Rupture temporaire</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Product Featured Image if present, otherwise Premium Banner */}
              {product.imageUrl ? (
                <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#070b14] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center p-4">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="max-h-full max-w-full object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="w-full h-48 sm:h-60 rounded-2xl bg-gradient-to-br from-sky-950/40 via-indigo-950/30 to-purple-950/40 border border-sky-500/20 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/10">
                    <Package className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs uppercase font-mono tracking-widest text-sky-400 font-bold">Produit Officiel Vérifié</div>
                    <div className="text-sm text-slate-300 font-medium">Activation 24/7 Immédiate</div>
                  </div>
                </div>
              )}

              {/* H1 Title & Reviews */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {product.title}
                </h1>

                {/* Rating & Trust Strip */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                  <div className="flex items-center space-x-1 text-amber-500 font-bold">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-slate-800 dark:text-white ml-1">4.9/5</span>
                    <span className="text-slate-400 font-normal">(128 avis vérifiés)</span>
                  </div>

                  <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>

                  <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <BadgeCheck className="w-4 h-4" />
                    <span>Fournisseur Officiel Direct</span>
                  </span>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-3 pt-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-500" />
                  <span>Description & Caractéristiques du Service</span>
                </h2>
                <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-white/[0.02] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06]">
                  {product.description || 'Abonnement officiel garanti avec livraison et activation automatique 24/7. Clés API et comptes premium délivrés en direct après confirmation.'}
                </div>
              </div>

              {/* Service Guarantees Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-sky-500/5 border border-sky-500/15 space-y-1">
                  <div className="flex items-center space-x-2 text-sky-600 dark:text-sky-400 font-bold text-xs">
                    <Zap className="w-4 h-4 shrink-0" />
                    <span>Livraison &lt; 2 min</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Système automatisé connecté 24/7.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Garantie & Support</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Comptes vérifiés avant chaque remise.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/15 space-y-1">
                  <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-bold text-xs">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Mobile Money & CB</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Transactions sécurisées et chiffrées.
                  </p>
                </div>
              </div>
            </div>

            {/* Product FAQs Section (SEO FAQPage) */}
            <div className="bg-white dark:bg-[#0a0f1d] rounded-3xl border border-slate-200 dark:border-white/[0.08] p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-4">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Headphones className="w-4 h-4 text-sky-500" />
                <span>Questions Fréquentes sur {product.title}</span>
              </h2>

              <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div key={idx} className="py-3.5">
                      <button
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between text-left gap-3 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-sky-500 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed pl-1">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (5 COLS): Pricing & Direct Purchase Box */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            <div className="bg-white dark:bg-[#0a0f1d] rounded-3xl border border-slate-200 dark:border-white/[0.08] p-6 sm:p-8 shadow-lg dark:shadow-2xl space-y-6">
              
              {/* Header Box */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Tarif Officiel Garanti
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-sans">
                    {formatPrice(product.sellingPrice * quantity)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium font-mono">
                    {currency === 'FCFA'
                      ? `($${(product.sellingPrice * quantity).toFixed(2)} USD)`
                      : `(${formatPrice(product.sellingPrice * quantity, 'FCFA')})`}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Quantité Souhaitée
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-slate-200 dark:border-white/[0.12] rounded-xl bg-slate-50 dark:bg-slate-950 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-black text-xs text-slate-900 dark:text-white font-mono">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                      disabled={quantity >= stock}
                      className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {stock > 900 ? 'Livraison instantanée' : `Max: ${stock} en stock`}
                  </span>
                </div>
              </div>

              {/* Customer Account Prompt (if applicable) */}
              {product.requiresCustomerInfo && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                  <label className="block text-xs font-bold text-sky-500">
                    {product.customerInfoPrompt || 'Informations de compte requises'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerAccounts}
                    onChange={(e) => setCustomerAccounts(e.target.value)}
                    placeholder="Ex: votre_email@exemple.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/[0.12] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  />
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Nécessaire pour l&apos;activation directe sur votre compte.
                  </p>
                </div>
              )}

              {/* Direct Purchase Button */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleCreateTicket}
                  disabled={!isAvailable || creatingTicket}
                  className={`w-full py-3.5 px-6 rounded-2xl text-sm font-black flex items-center justify-center space-x-2 transition-all shadow-xl ${
                    isAvailable
                      ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white shadow-sky-500/25 hover:scale-[1.02] cursor-pointer'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  {creatingTicket ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Ticket className="w-4 h-4 stroke-[2.5]" />
                  )}
                  <span>
                    {creatingTicket
                      ? 'Création du ticket...'
                      : isAvailable
                      ? 'Commander & Payer en Ligne'
                      : 'Produit Temporairement Épuisé'}
                  </span>
                </button>

                {ticketError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{ticketError}</span>
                  </div>
                )}

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/[0.1] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  {copiedShare ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Share2 className="w-4 h-4 text-slate-400" />
                  )}
                  <span>{copiedShare ? 'Lien produit copié !' : 'Partager ce produit'}</span>
                </button>
              </div>

              {/* Payment Methods Trust Bar */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block text-center">
                  Moyens de Paiement Disponibles
                </span>
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]">
                    MTN Money
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]">
                    Moov Money
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]">
                    Orange Money
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]">
                    Wave
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]">
                    Carte Bancaire
                  </span>
                </div>
              </div>

              {/* Reseller Callout Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center space-x-2 text-amber-500 font-bold text-xs">
                  <Store className="w-4 h-4 shrink-0" />
                  <span>Vous souhaitez revendre cet abonnement ?</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  Créez votre propre boutique sur <strong className="text-amber-500 font-bold">sous-domaine.abonnementspro.com</strong> et bénéficiez de réductions grossistes exclusives jusqu&apos;à -30%.
                </p>
                <Link
                  href="/reseller/register"
                  className="inline-flex items-center space-x-1 text-xs font-black text-amber-500 hover:text-amber-400 transition-colors pt-1"
                >
                  <span>Devenir Revendeur Pro</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS SECTION (INTERNAL LINKING FOR GOOGLE SEO) */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Autres abonnements dans la catégorie &ldquo;{product.category}&rdquo;
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Découvrez nos offres recommandées avec livraison instantanée garantie.
                </p>
              </div>

              <Link
                href={`/?category=${encodeURIComponent(product.category || 'Tous')}`}
                className="text-xs font-bold text-sky-500 hover:text-sky-400 flex items-center gap-1"
              >
                <span>Voir tout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  className="group rounded-2xl bg-white dark:bg-[#0a0f1d] hover:bg-slate-50 dark:hover:bg-[#0d1427] border border-slate-200 dark:border-white/[0.08] hover:border-sky-500/40 p-4 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-xl relative overflow-hidden"
                >
                  <div className="space-y-2">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]">
                      {rel.category || 'Digital'}
                    </span>
                    <Link href={`/product/${rel.slug}`} className="block">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors line-clamp-2">
                        {rel.title}
                      </h3>
                    </Link>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {formatPrice(rel.sellingPrice)}
                    </span>
                    <Link
                      href={`/product/${rel.slug}`}
                      className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[11px] transition-all shadow-sm"
                    >
                      Voir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Ticket Created Modal with Payment Options */}
      {createdTicketResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <Ticket className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-sm">Commande Initiée avec Succès</h3>
              </div>
              <button
                onClick={() => setCreatedTicketResult(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-2 py-2">
              <span className="text-xs text-slate-500">Votre Code Ticket de Commande :</span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl font-mono font-black text-sky-500 bg-sky-500/10 px-4 py-1.5 rounded-xl border border-sky-500/30">
                  {createdTicketResult.ticketCode}
                </span>
                <button
                  onClick={() => copyTicketCode(createdTicketResult.ticketCode)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                  title="Copier le code"
                >
                  {copiedTicket ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Conservez précieusement ce code pour suivre votre commande et afficher vos identifiants.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block text-center">
                Choisissez votre moyen de paiement sécurisé :
              </span>

              {/* FeexPay Direct Button */}
              <button
                onClick={() => handlePayWithFeexPay(createdTicketResult.ticketCode)}
                disabled={payingWithFeexPay}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                {payingWithFeexPay ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4 stroke-[2.5]" />
                )}
                <span>Payer par Mobile Money (MTN, Moov, Wave, Celtiis)</span>
              </button>

              {/* Moneroo Direct Button */}
              <button
                onClick={() => handlePayWithMoneroo(createdTicketResult.ticketCode)}
                disabled={payingWithMoneroo}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
              >
                {payingWithMoneroo ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <Globe className="w-4 h-4 stroke-[2.5]" />
                )}
                <span>Payer par Carte Bancaire ou Orange Money (Moneroo)</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setCreatedTicketResult(null)}
                className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                Fermer et payer plus tard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
