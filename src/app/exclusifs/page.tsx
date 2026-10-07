'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SupportWidget from '@/components/SupportWidget';
import {
  Sparkles,
  ShoppingBag,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Search,
  Package,
  Ticket,
  Copy,
  Check,
  X,
  MessageCircle,
  ShieldCheck,
  Zap,
  Tag,
  Clock,
  User,
  PhoneCall,
  FileText,
} from 'lucide-react';
import { useCurrency } from '@/components/CurrencyContext';

export default function ExclusifsPage() {
  const { currency, formatPrice } = useCurrency();

  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');

  // Purchase Modal State
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [purchasing, setPurchasing] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Request Product Form State
  const [customerName, setCustomerName] = useState<string>('');
  const [contactInfo, setContactInfo] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [requestDescription, setRequestDescription] = useState<string>('');
  const [submittingRequest, setSubmittingRequest] = useState<boolean>(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  const categories = ['Tous', 'IA & APIs', 'Licences & Outils Dev', 'Mobile & Services', 'Abonnements & Comptes', 'Général'];

  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchManualProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products?manualOnly=true');
      const data = await res.json();
      if (data.success) {
        setProducts(shuffleArray(data.products || []));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchManualProducts();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantity < 1 || purchasing) return;

    setPurchasing(true);
    try {
      const res = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setCreatedOrder(data.order);
      } else {
        alert(data.message || 'Erreur lors de la création du ticket');
      }
    } catch (e: any) {
      alert(e.message || 'Erreur réseau');
    } finally {
      setPurchasing(false);
    }
  };

  const handleSubmitProductRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !contactInfo.trim() || !productName.trim() || submittingRequest) return;

    setSubmittingRequest(true);
    setRequestSuccess(null);
    setRequestError(null);

    try {
      const res = await fetch('/api/product-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          contactInfo: contactInfo.trim(),
          productName: productName.trim(),
          description: requestDescription.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRequestSuccess(data.message);
        setCustomerName('');
        setContactInfo('');
        setProductName('');
        setRequestDescription('');
      } else {
        setRequestError(data.message || 'Erreur lors de l\'envoi de la demande.');
      }
    } catch (e: any) {
      setRequestError(e.message || 'Erreur réseau.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'Tous' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = p.title.toLowerCase().includes(q);
      const descMatch = p.description ? p.description.toLowerCase().includes(q) : false;
      if (!titleMatch && !descMatch) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-800/60 glass-panel pt-12 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-5 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold tracking-wide shadow-lg shadow-emerald-500/10">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Offres Spéciales & Commandes Sur-Mesure</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl leading-tight">
            Produits Exclusifs & <span className="gradient-text">Demandes Spéciales</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Découvrez nos produits sélectionnés et gérés en direct. Vous recherchez un logiciel, un abonnement ou un service particulier qui n'est pas encore au catalogue ? Soumettez votre demande en 1 clic !
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-12">
        
        {/* Search & Category Filter */}
        <div className="space-y-4">
          <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
              <Package className="w-5 h-5 text-emerald-400" />
              <span>Catalogue des Produits Exclusifs</span>
            </h2>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un produit exclusif..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all shadow-sm ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-emerald-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid - 2 columns on mobile */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 sm:h-80 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800/80 space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Aucun produit exclusif dans cette catégorie</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Utilisez le formulaire ci-dessous pour nous demander d'ajouter le produit de votre choix !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredProducts.map((product) => {
              const priceUSD = product.sellingPrice || 0;
              return (
                <div
                  key={product.id}
                  className="bg-slate-900/90 border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl transition-all duration-200 hover:scale-[1.01] flex flex-col justify-between"
                >
                  {/* Image Display */}
                  <div className="relative h-32 sm:h-48 w-full bg-slate-950 overflow-hidden border-b border-slate-800">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e: any) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-3 sm:p-6 text-center">
                        <Sparkles className="w-6 h-6 sm:w-10 sm:h-10 text-emerald-400/60 mb-1 sm:mb-2 animate-pulse" />
                        <span className="text-[8px] sm:text-xs font-black uppercase tracking-wider text-emerald-400/80">
                          {product.category}
                        </span>
                      </div>
                    )}

                    {product.badge && (
                      <span className="absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase bg-emerald-500 text-slate-950 shadow-md">
                        {product.badge}
                      </span>
                    )}

                    <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[8px] sm:text-[10px] font-black uppercase">
                      {product.category}
                    </span>
                  </div>

                  {/* Content Details */}
                  <div className="p-3 sm:p-5 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1 sm:space-y-2">
                      <h3 className="text-xs sm:text-lg font-black text-white leading-snug line-clamp-2">
                        {product.title}
                      </h3>
                      {product.description && (
                        <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2.5 sm:pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[8px] sm:text-[9px] uppercase font-black tracking-wider text-slate-400 hidden sm:block mb-0.5">
                          Prix de Vente ({currency})
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm sm:text-xl font-black text-emerald-400 font-mono leading-tight">
                            {formatPrice(priceUSD)}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold hidden sm:block">
                            {currency === 'FCFA' ? `($${priceUSD.toFixed(2)} USD)` : `(${formatPrice(priceUSD, 'FCFA')})`}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setQuantity(1);
                          setCreatedOrder(null);
                        }}
                        className="px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 flex items-center justify-center space-x-1 sm:space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 w-full sm:w-auto"
                      >
                        <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                        <span>Commander</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SECTION FORMULAIRE : DEMANDER UN PRODUIT SUR-MESURE */}
        <section className="glass-panel p-6 sm:p-10 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold">
              <Send className="w-3.5 h-3.5" />
              <span>Service de Recherche Sur-Mesure</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Vous ne trouvez pas le produit ou l'abonnement recherché ?
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Soumettez-nous votre demande avec vos coordonnées. Notre équipe recherchera la meilleure offre disponible et vous recontactera directement (via WhatsApp ou Email) dès sa mise en ligne !
            </p>
          </div>

          <form onSubmit={handleSubmitProductRequest} className="space-y-5 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Votre Nom / Prénom ou Pseudo *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Jean Marc, Alex..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Coordonnées de Contact (WhatsApp / Email) *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: WhatsApp +225 0700000000 ou email@domaine.com"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nom du Produit ou Abonnement Recherché *</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Canva Pro Équipe, Adobe CC 1 An, Windows 11 Pro Key, Compte TradingView..."
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:border-emerald-500 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Détails ou Précisions Spécifiques (Optionnel)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Ex: Durée de 6 mois souhaitée, budget indicatif, urgence..."
                value={requestDescription}
                onChange={(e) => setRequestDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed shadow-inner"
              />
            </div>

            {requestSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{requestSuccess}</span>
              </div>
            )}

            {requestError && (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center space-x-2 animate-in zoom-in-95">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{requestError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submittingRequest}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center space-x-2 transition-all hover:scale-105"
            >
              {submittingRequest ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Envoyer ma Demande de Produit</span>
                </>
              )}
            </button>
          </form>
        </section>
      </main>

      {/* PURCHASE MODAL FOR EXCLUSIVE PRODUCTS */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setSelectedProduct(null);
                setCreatedOrder(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {!createdOrder ? (
              <>
                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Génération de Ticket de Commande
                  </span>
                  <h3 className="text-xl font-black text-white">{selectedProduct.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {selectedProduct.description || 'Commandez ce produit exclusif. Votre ticket de paiement sera généré immédiatement.'}
                  </p>
                </div>

                <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold">Prix unitaire :</span>
                      <span className="font-mono font-black text-emerald-400 text-sm">
                        {formatPrice(selectedProduct.sellingPrice)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-slate-400 font-bold">Quantité souhaitée :</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="bg-slate-900 border border-slate-800 text-white font-mono font-black rounded-xl px-3 py-1.5 w-20 text-center focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                      <span className="text-xs font-black text-white uppercase">Total à Payer :</span>
                      <span className="text-xl font-mono font-black text-emerald-400">
                        {formatPrice(selectedProduct.sellingPrice * quantity)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={purchasing}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center space-x-2 transition-all"
                    >
                      {purchasing ? (
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Ticket className="w-4 h-4 stroke-[3]" />
                          <span>Générer le Ticket de Paiement</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ticket Généré avec Succès</span>
                  </div>
                  <h3 className="text-xl font-black text-white">
                    Code Ticket : <span className="font-mono text-sky-400">{createdOrder.ticketCode}</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Veuillez effectuer votre virement pour valider votre commande de <strong className="text-white">{createdOrder.productTitle}</strong>.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <span className="text-slate-400 font-bold">Montant Total à Payer :</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {formatPrice(createdOrder.totalAmount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                      Code Ticket à Rappeler dans votre Virement :
                    </span>
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="font-mono font-black text-lg text-sky-400">{createdOrder.ticketCode}</span>
                      <button
                        onClick={() => copyToClipboard(createdOrder.ticketCode, 'ticket-copy')}
                        className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 font-bold text-xs flex items-center space-x-1 border border-sky-500/30 transition-all"
                      >
                        {copiedId === 'ticket-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === 'ticket-copy' ? 'Copié !' : 'Copier'}</span>
                      </button>
                    </div>
                  </div>

                  {createdOrder.paymentInstructions && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-xs font-extrabold text-white">Instructions de Règlement :</span>
                      <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                        {createdOrder.paymentInstructions}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      setCreatedOrder(null);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    J'ai Effectué le Paiement (Fermer)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <SupportWidget />
    </div>
  );
}
