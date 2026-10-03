'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import SupportWidget from '@/components/SupportWidget';
import {
  Smartphone,
  Search,
  Check,
  Copy,
  RefreshCcw,
  ShieldCheck,
  Zap,
  Globe,
  MessageSquare,
  MessageCircle,
  Bot,
  Layers,
  KeyRound,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Ticket,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

import { useCurrency } from '@/components/CurrencyContext';

export default function OtpServicesPage() {
  const { currency, formatPrice } = useCurrency();
  const [countries, setCountries] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [loading, setLoading] = useState<boolean>(true);

  // Active Activation State
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [ordering, setOrdering] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(900);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [payingWithFeexPay, setPayingWithFeexPay] = useState<boolean>(false);

  // Ticket Lookup State
  const [lookupCode, setLookupCode] = useState<string>('');
  const [showLookupModal, setShowLookupModal] = useState<boolean>(false);
  const [searchingLookup, setSearchingLookup] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const categories = ['Tous', 'Messagerie', 'Réseaux Sociaux', 'IA & APIs', 'Finance', 'Comptes & Outils'];

  const fetchTariffs = async (countryCode: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/otp/tariffs?country=${countryCode}`);
      const data = await res.json();
      if (data.success) {
        setCountries(data.countries || []);
        setServices(data.services || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTariffs(selectedCountry);
  }, [selectedCountry]);

  // Live polling for active OTP Order (handles PENDING_PAYMENT & WAITING_SMS)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeOrder && (activeOrder.status === 'WAITING_SMS' || activeOrder.status === 'PENDING_PAYMENT')) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/otp/state?ticketCode=${encodeURIComponent(activeOrder.ticketCode)}`);
          const data = await res.json();
          if (data.success && data.order) {
            setActiveOrder(data.order);
            if (data.order.timeRemaining) {
              setTimeRemaining(data.order.timeRemaining);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [activeOrder]);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeOrder && activeOrder.status === 'WAITING_SMS' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeOrder, timeRemaining]);

  const handleBuyNumber = async (serviceCode: string) => {
    setOrdering(true);
    try {
      const res = await fetch('/api/otp/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: serviceCode,
          country: selectedCountry,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveOrder({
          ticketCode: data.ticketCode,
          service: data.service,
          country: data.country,
          sellingPrice: data.totalAmount,
          paymentInstructions: data.paymentInstructions,
          status: data.status || 'PENDING_PAYMENT',
        });
        setShowPaymentModal(true);
        setTimeRemaining(900);
      } else {
        alert(data.message || 'Erreur de réservation du numéro');
      }
    } catch (e: any) {
      alert(e.message || 'Erreur réseau');
    } finally {
      setOrdering(false);
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
        alert(data.message || 'Erreur lors de l\'initialisation FeexPay.');
        return;
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      const checkoutUrl = `https://feexpay.me/pay?id=${data.shopId}&token=${data.apiKey}&amount=${data.amountXOF}&custom_id=${encodeURIComponent(data.ticketCode)}&callback_url=${encodeURIComponent(data.callbackUrl)}`;
      window.location.href = checkoutUrl;
    } catch (e: any) {
      alert(e.message || 'Erreur réseau lors de la connexion à FeexPay.');
    } finally {
      setPayingWithFeexPay(false);
    }
  };

  const handleLookupTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupCode.trim()) return;
    setSearchingLookup(true);
    setLookupError(null);

    try {
      const res = await fetch(`/api/otp/state?ticketCode=${encodeURIComponent(lookupCode.trim())}`);
      const data = await res.json();
      if (data.success && data.order) {
        setActiveOrder(data.order);
        setShowLookupModal(false);
        setLookupCode('');
      } else {
        setLookupError(data.message || 'Commande OTP introuvable.');
      }
    } catch (e: any) {
      setLookupError(e.message || 'Erreur de recherche.');
    } finally {
      setSearchingLookup(false);
    }
  };

  const handleAction = async (action: 'revise' | 'finish') => {
    if (!activeOrder) return;
    try {
      const res = await fetch('/api/otp/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketCode: activeOrder.ticketCode,
          action,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (action === 'finish') {
          setActiveOrder(null);
        } else {
          setActiveOrder((prev: any) => ({ ...prev, status: 'WAITING_SMS', smsCode: null }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredServices = services.filter((s) => {
    if (selectedCategory !== 'Tous' && s.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = s.name.toLowerCase().includes(q);
      const codeMatch = s.code.toLowerCase().includes(q);
      if (!nameMatch && !codeMatch) return false;
    }
    return true;
  });

  const selectedCountryObj = countries.find((c) => c.code === selectedCountry) || {
    name: 'États-Unis',
    flag: '🇺🇸',
    prefix: '+1',
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-slate-950">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-800/60 glass-panel pt-12 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-5 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-bold tracking-wide shadow-lg shadow-sky-500/10">
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span>Numéros Virtuels OTP - SMS Réception Instantanée</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl leading-tight">
            Vérification par SMS &{' '}
            <span className="gradient-text">Création de Comptes</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Obtenez des numéros virtuels pour activer vos comptes (WhatsApp, Telegram, OpenAI, Google, Instagram, TikTok...) en quelques secondes avec réception de code SMS en temps réel.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowLookupModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-md"
            >
              <Ticket className="w-4 h-4 text-sky-400" />
              <span>Suivre une Activation (Code OTP)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Country & Search Selection Bar */}
        <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Country Dropdown */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center space-x-1.5">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Pays de provenance:</span>
            </span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-sky-500 cursor-pointer shadow-inner w-full sm:w-auto"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                  {c.flag} {c.name} ({c.prefix})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un service (ex: WhatsApp, Telegram, ChatGPT)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 shadow-inner"
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
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-slate-950 font-black shadow-sky-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Active Activation Live Banner / Panel if order present */}
        {activeOrder && (
          activeOrder.status === 'PENDING_PAYMENT' ? (
            <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-amber-500/10 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                      Activation OTP • En Attente de Validation du Paiement
                    </span>
                    <h3 className="text-lg font-black text-white capitalize">
                      Ticket Code: <span className="font-mono text-sky-400">{activeOrder.ticketCode}</span> ({activeOrder.service})
                    </h3>
                  </div>
                </div>

                <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Vérification Paiement en Cours</span>
                </span>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Montant à régler:</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {formatPrice(activeOrder.sellingPrice || activeOrder.totalAmount || 0.45)}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(activeOrder.ticketCode, 'pending-ticket')}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-400 text-xs font-bold flex items-center space-x-2 transition-all self-start sm:self-auto"
                  >
                    {copiedId === 'pending-ticket' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedId === 'pending-ticket' ? 'Code Ticket Copié !' : 'Copier Code Ticket'}</span>
                  </button>
                </div>

                {activeOrder.paymentInstructions && (
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold text-white flex items-center space-x-1.5">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>Instructions de Règlement :</span>
                    </span>
                    <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {activeOrder.paymentInstructions}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-xs text-slate-400 bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl">
                  <RefreshCcw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                  <span>
                    Vérification automatique en direct... Dès confirmation du règlement par l'administrateur, votre numéro virtuel s'attribuera immédiatement sur cet écran sans rafraîchir.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setShowLookupModal(true)}
                  className="text-xs font-bold text-slate-400 hover:text-white underline"
                >
                  Rechercher un autre ticket
                </button>
                <button
                  onClick={() => setActiveOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Masquer ce volet
                </button>
              </div>
            </div>
          ) : activeOrder.status === 'CANCELLED' || activeOrder.status === 'FAILED' ? (
            <div className="bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                    <X className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Ticket <span className="font-mono text-rose-400">{activeOrder.ticketCode}</span> Refusé / Annulé
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeOrder.errorMessage || 'Le paiement n\'a pas pu être validé ou la demande a été annulée.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border-2 border-sky-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-sky-500/10 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                    <Smartphone className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider">
                      Activation SMS en Cours • Code Ticket: {activeOrder.ticketCode}
                    </span>
                    <h3 className="text-lg font-black text-white capitalize">
                      {activeOrder.service} ({selectedCountryObj.flag} {selectedCountryObj.name})
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-amber-400">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>Temps restant: {formatSeconds(timeRemaining)}</span>
                </div>
              </div>

              {/* Phone Number Display Box */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Numéro Virtuel Attribué (Copier & Coller dans l'application)
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wide">
                    {activeOrder.phone || 'Génération...'}
                  </span>
                </div>

                {activeOrder.phone && (
                  <button
                    onClick={() => copyToClipboard(activeOrder.phone, 'active-phone')}
                    className="px-5 py-2.5 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 font-bold text-xs flex items-center space-x-2 border border-sky-500/30 transition-all"
                  >
                    {copiedId === 'active-phone' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedId === 'active-phone' ? 'Numéro Copié !' : 'Copier le numéro'}</span>
                  </button>
                )}
              </div>

              {/* Received SMS / Waiting Live Indicator */}
              {activeOrder.smsCode ? (
                <div className="bg-gradient-to-r from-emerald-500/20 via-slate-900 to-sky-500/20 border-2 border-emerald-500/50 p-5 rounded-2xl space-y-3 animate-in zoom-in-95">
                  <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>SMS et Code OTP Reçu avec Succès !</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-emerald-500/30">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400">Code de vérification (OTP):</span>
                      <span className="block text-3xl font-black font-mono text-emerald-400 tracking-wider pt-0.5">
                        {activeOrder.smsCode}
                      </span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(activeOrder.smsCode, 'active-code')}
                      className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      {copiedId === 'active-code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedId === 'active-code' ? 'Code Copié !' : 'Copier le Code OTP'}</span>
                    </button>
                  </div>

                  {activeOrder.fullSms && (
                    <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                      <span className="text-[10px] text-slate-500 block font-sans">Message SMS complet:</span>
                      {activeOrder.fullSms}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 text-center space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-sky-400 text-sm font-extrabold">
                    <RefreshCcw className="w-4 h-4 animate-spin text-sky-400" />
                    <span>En attente de réception du SMS...</span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Envoyez le code de vérification SMS depuis l'application vers le numéro <strong className="text-white font-mono">{activeOrder.phone}</strong>. Le code apparaîtra automatiquement ici dès réception.
                  </p>
                </div>
              )}

              {/* Actions Bar */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => handleAction('revise')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-all"
                >
                  Demander un autre SMS
                </button>
                <button
                  onClick={() => handleAction('finish')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-slate-950 font-black text-xs hover:from-sky-400 hover:to-indigo-500 transition-all"
                >
                  Terminer l'activation
                </button>
              </div>
            </div>
          )
        )}

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-44 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse p-5" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800/80 space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Aucun service trouvé</h3>
            <p className="text-xs text-slate-400">Essayez une autre recherche ou modifiez le pays sélectionné.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => {
              const priceUSD = service.sellingPriceUSD || service.priceUSD || 0.35;
              return (
                <div
                  key={service.code}
                  className="bg-slate-900/90 border border-slate-800/80 hover:border-sky-500/40 rounded-3xl p-5 shadow-xl transition-all duration-200 hover:scale-[1.01] flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {service.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {service.stock > 0 ? `${service.stock} disponibles` : 'Épuisé'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                        <span>{service.name}</span>
                      </h3>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {selectedCountryObj.flag} {selectedCountryObj.name} ({selectedCountryObj.prefix})
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-4">
                    <div>
                      <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block mb-0.5">
                        Prix activation ({currency})
                      </span>
                      <div className="flex flex-col">
                        <span className="text-lg font-black text-emerald-400 leading-tight">
                          {formatPrice(priceUSD)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          {currency === 'FCFA' ? `($${priceUSD.toFixed(2)} USD)` : `(${formatPrice(priceUSD, 'FCFA')})`}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyNumber(service.code)}
                      disabled={ordering}
                      className="px-4 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 flex items-center space-x-1.5 shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all hover:scale-105"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Obtenir</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* TICKET LOOKUP MODAL */}
      {showLookupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => setShowLookupModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <Ticket className="w-5 h-5 text-sky-400" />
                <span>Retrouver une Activation OTP par Ticket</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Saisissez votre code de ticket OTP (ex: OTP-784920) pour afficher votre numéro et lire votre SMS.
              </p>
            </div>

            <form onSubmit={handleLookupTicket} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Ex: OTP-784920"
                value={lookupCode}
                onChange={(e) => setLookupCode(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-white font-mono uppercase focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={searchingLookup}
                className="px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center space-x-1 transition-all"
              >
                {searchingLookup ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <span>Rechercher</span>}
              </button>
            </form>

            {lookupError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {lookupError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ORDER CREATED PAYMENT MODAL */}
      {showPaymentModal && activeOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Commande Enregistrée</span>
              </div>
              <h3 className="text-xl font-black text-white">
                Ticket OTP <span className="font-mono text-sky-400">{activeOrder.ticketCode}</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Effectuez votre règlement pour valider votre commande de numéro virtuel pour <strong className="text-white capitalize">{activeOrder.service}</strong>.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <span className="text-xs text-slate-400 font-bold">Montant Total à Payer :</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {formatPrice(activeOrder.sellingPrice || activeOrder.totalAmount || 0.45)}
                </span>
              </div>

              {/* FeexPay Instant Payment Option */}
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-emerald-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-white flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Paiement Instantané FeexPay</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    MTN, Moov, Wave, CB
                  </span>
                </div>
                <button
                  onClick={() => handlePayWithFeexPay(activeOrder.ticketCode)}
                  disabled={payingWithFeexPay}
                  className="w-full py-2.5 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
                >
                  {payingWithFeexPay ? (
                    <>
                      <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Connexion FeexPay...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current text-slate-950" />
                      <span>Payer par FeexPay ({Math.round((activeOrder.sellingPrice || activeOrder.totalAmount || 0.45) * 650).toLocaleString()} FCFA)</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                  Code Ticket à Rappeler dans votre Virement :
                </span>
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="font-mono font-black text-lg text-sky-400">{activeOrder.ticketCode}</span>
                  <button
                    onClick={() => copyToClipboard(activeOrder.ticketCode, 'modal-ticket')}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 font-bold text-xs flex items-center space-x-1 border border-sky-500/30 transition-all"
                  >
                    {copiedId === 'modal-ticket' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'modal-ticket' ? 'Copié !' : 'Copier'}</span>
                  </button>
                </div>
              </div>

              {activeOrder.paymentInstructions && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-extrabold text-slate-300">Autre Option : Instructions de Règlement Manuel</span>
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                    {activeOrder.paymentInstructions}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black text-xs shadow-lg shadow-sky-500/20 transition-all"
              >
                J'ai Effectué le Paiement (Suivre l'Activation)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Support Widget */}
      <SupportWidget />
    </div>
  );
}
