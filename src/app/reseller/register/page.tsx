'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Lock, Mail, User, Globe, ArrowRight, Check, Zap, Crown, Shield, CreditCard } from 'lucide-react';

export default function ResellerRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'starter' | 'pro'>('starter');
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'FEEXPAY' | 'MONEROO'>('FEEXPAY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planPrices = {
    free: { monthly: 0, yearly: 0 },
    starter: { monthly: 19, yearly: 190 },
    pro: { monthly: 49, yearly: 490 },
  };

  const currentPriceUsd =
    selectedPlan === 'free'
      ? 0
      : billingInterval === 'yearly'
      ? planPrices[selectedPlan].yearly
      : planPrices[selectedPlan].monthly;

  const currentPriceXof = Math.max(50, Math.round(currentPriceUsd * 650));

  const handleSubdomainChange = (val: string) => {
    const clean = val
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '');
    setSubdomain(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/reseller/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name,
          email,
          password,
          storeName,
          subdomain,
          planId: selectedPlan,
          billingInterval,
          paymentMethod: selectedPlan === 'free' ? undefined : paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la création du compte');
      }

      // If online payment is required, redirect immediately to the checkout gateway
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      if (data.redirectTo) {
        router.push(data.redirectTo);
        return;
      }

      router.push('/reseller/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-all">
              <Store className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Lancez Votre Propre Boutique SaaS
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Revendez des centaines de licences et abonnements digitaux sous votre propre marque avec vos propres marges bénéficiaires.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nom Complet
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!storeName) setStoreName(`Boutique ${e.target.value}`);
                      if (!subdomain) handleSubdomainChange(e.target.value);
                    }}
                    placeholder="Marc Dubois"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Adresse Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marc@exemple.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Mot de passe sécurisé
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                🔒 En cas d&apos;oubli, vous pourrez récupérer votre compte instantanément en 1 clic via notre Bot Telegram ou par email.
              </p>
            </div>

            {/* Store Information */}
            <div className="pt-2 border-t border-slate-800/80">
              <h3 className="text-xs font-black uppercase tracking-wider text-sky-400 mb-3">
                Configuration de votre vitrine
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Nom de votre boutique
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="TechStore Premium"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Sous-Domaine Souhaité
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={subdomain}
                      onChange={(e) => handleSubdomainChange(e.target.value)}
                      placeholder="techstore"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Adresse : <span className="text-sky-400 font-mono font-bold">https://{subdomain || 'votre-nom'}.abonnementspro.com</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Plan Selection */}
            <div className="pt-2 border-t border-slate-800/80">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 mb-3">
                Choisissez votre offre revendeur
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Free Plan */}
                <div
                  onClick={() => setSelectedPlan('free')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedPlan === 'free'
                      ? 'bg-sky-500/10 border-sky-500 shadow-md shadow-sky-500/10'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white">Free</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                      0% Réduc
                    </span>
                  </div>
                  <div className="text-lg font-black text-white mb-2">0 $</div>
                  <ul className="text-[11px] text-slate-400 space-y-1">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      Fixer ses propres prix
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      Sous-domaine dédié
                    </li>
                  </ul>
                </div>

                {/* Starter Plan */}
                <div
                  onClick={() => setSelectedPlan('starter')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                    selectedPlan === 'starter'
                      ? 'bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/15'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-600 text-white">
                    Populaire
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-indigo-300">Starter</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      -35% Marge
                    </span>
                  </div>
                  <div className="text-lg font-black text-white mb-2">19 $/mois</div>
                  <ul className="text-[11px] text-slate-400 space-y-1">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      35% remise sur marge
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      Logo, Bannière & Thèmes
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      Pixels Facebook & TikTok
                    </li>
                  </ul>
                </div>

                {/* Pro Plan */}
                <div
                  onClick={() => setSelectedPlan('pro')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedPlan === 'pro'
                      ? 'bg-purple-500/10 border-purple-500 shadow-lg shadow-purple-500/15'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-purple-300">Pro VIP</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      -60% Marge
                    </span>
                  </div>
                  <div className="text-lg font-black text-white mb-2">49 $/mois</div>
                  <ul className="text-[11px] text-slate-400 space-y-1">
                    <li className="flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      60% remise max marge
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      Nom de domaine propre
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      Support & Sync prioritaire
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* If paid plan is chosen, show billing interval and payment gateway selection */}
            {selectedPlan !== 'free' && (
              <div className="pt-2 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Règlement sécurisé de votre abonnement
                  </h3>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setBillingInterval('monthly')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        billingInterval === 'monthly'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Mensuel
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingInterval('yearly')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        billingInterval === 'yearly'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Annuel (-17%) 🎁
                    </button>
                  </div>
                </div>

                {/* Amount Summary */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      Montant à régler pour l&apos;offre {selectedPlan === 'starter' ? 'Starter' : 'Pro VIP'} :
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Facturation {billingInterval === 'yearly' ? 'annuelle (12 mois)' : 'mensuelle (30 jours)'} • Sans engagement
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-400 font-mono block">
                      ${currentPriceUsd} USD
                    </span>
                    <span className="text-[10px] text-emerald-500/80 font-mono font-bold">
                      ~{currentPriceXof.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>

                {/* Payment Gateway Options */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Moyen de paiement sécurisé :
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* FeexPay */}
                    <div
                      onClick={() => setPaymentMethod('FEEXPAY')}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        paymentMethod === 'FEEXPAY'
                          ? 'bg-[#008080]/15 border-[#008080] shadow-md shadow-[#008080]/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#008080]/30 border border-[#008080]/50 flex items-center justify-center text-[#00E5FF] shrink-0">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white">FeexPay</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300">
                              Recommandé
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            Mobile Money & Carte Bancaire
                          </span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        paymentMethod === 'FEEXPAY' ? 'border-sky-400 bg-sky-500 text-slate-950' : 'border-slate-700'
                      }`}>
                        {paymentMethod === 'FEEXPAY' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Moneroo */}
                    <div
                      onClick={() => setPaymentMethod('MONEROO')}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        paymentMethod === 'MONEROO'
                          ? 'bg-[#5046E5]/15 border-[#5046E5] shadow-md shadow-[#5046E5]/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#5046E5]/30 border border-[#5046E5]/50 flex items-center justify-center text-[#A5B4FC] shrink-0">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-white block">Moneroo</span>
                          <span className="text-[10px] text-slate-400 block">
                            Multi-devises Afrique & International
                          </span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        paymentMethod === 'MONEROO' ? 'border-sky-400 bg-sky-500 text-slate-950' : 'border-slate-700'
                      }`}>
                        {paymentMethod === 'MONEROO' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-[11px] text-amber-300">
                  <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    🔒 Dès la validation de votre paiement, l&apos;offre sera activée instantanément sur votre boutique avec votre remise grossiste exclusive ({selectedPlan === 'starter' ? '-35%' : '-60%'} de marge).
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : selectedPlan === 'free' ? (
                <>
                  <span>Créer ma boutique gratuitement</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>
                    Créer ma boutique & Payer l&apos;offre {selectedPlan === 'starter' ? 'Starter' : 'Pro VIP'} (${currentPriceUsd} USD)
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Vous avez déjà un compte revendeur ?{' '}
              <Link href="/reseller/login" className="text-sky-400 hover:text-sky-300 font-bold ml-1">
                Se connecter à mon espace
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
