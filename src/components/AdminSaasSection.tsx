'use client';

import React, { useState, useEffect } from 'react';
import {
  Crown,
  ShieldCheck,
  Check,
  X,
  Save,
  RefreshCw,
  Users,
  Store,
  DollarSign,
  Percent,
  Calculator,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Globe,
  Sliders,
  LifeBuoy,
} from 'lucide-react';
import { SAAS_AVAILABLE_FEATURES, SaasFeatureDefinition, calculateSaasPrices } from '@/lib/saasPricingHelper';
import AdminResellerSupportSection from '@/components/AdminResellerSupportSection';

export default function AdminSaasSection() {
  const [loading, setLoading] = useState<boolean>(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [resellers, setResellers] = useState<any[]>([]);
  const [savingPlans, setSavingPlans] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Active sub-tab
  const [subTab, setSubTab] = useState<'matrix' | 'resellers' | 'simulation' | 'support'>('matrix');

  // Simulation Calculator State
  const [simSupplierCost, setSimSupplierCost] = useState<number>(10);
  const [simPlatformPrice, setSimPlatformPrice] = useState<number>(20);
  const [simResellerRetailPrice, setSimResellerRetailPrice] = useState<number>(25);

  // Fetch Plans and Resellers
  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, resellersRes] = await Promise.all([
        fetch('/api/saas/plans'),
        fetch('/api/saas/resellers'),
      ]);

      const plansData = await plansRes.json();
      if (plansData.success && plansData.plans) {
        setPlans(plansData.plans);
      }

      const resellersData = await resellersRes.json();
      if (resellersData.success && resellersData.resellers) {
        setResellers(resellersData.resellers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toggle feature for a plan
  const toggleFeature = (planId: string, featureId: string) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          const currentFeatures: string[] = Array.isArray(p.features) ? p.features : [];
          const exists = currentFeatures.includes(featureId);
          const newFeatures = exists
            ? currentFeatures.filter((f) => f !== featureId)
            : [...currentFeatures, featureId];
          return { ...p, features: newFeatures };
        }
        return p;
      })
    );
  };

  // Update plan field (price, discount percent, etc.)
  const updatePlanField = (planId: string, field: string, value: any) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          return { ...p, [field]: value };
        }
        return p;
      })
    );
  };

  // Save Plans & Features Matrix
  const handleSavePlans = async () => {
    setSavingPlans(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    try {
      const res = await fetch('/api/saas/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la sauvegarde');
      }

      setSaveSuccessMsg('Offres et matrice de fonctionnalités enregistrées avec succès !');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      setSaveErrorMsg(err.message);
    } finally {
      setSavingPlans(false);
    }
  };

  // Update reseller plan or status
  const handleUpdateReseller = async (resellerId: string, updateData: any) => {
    try {
      const res = await fetch('/api/saas/resellers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resellerId, ...updateData }),
      });

      const data = await res.json();
      if (data.success) {
        setResellers((prev) =>
          prev.map((r) => (r.id === resellerId ? { ...r, ...updateData } : r))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs">
        Chargement de la gestion SaaS et des offres...
      </div>
    );
  }

  // Pre-sort plans Free, Starter, Pro
  const sortedPlans = [...plans].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <div className="space-y-6">
      {/* Header and Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-white">Gestion Plateforme SaaS & Abonnements</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configurez les 3 offres (Free, Starter, Pro), les réductions sur marge et cochez les fonctionnalités autorisées.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setSubTab('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subTab === 'matrix'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Matrice des Offres
            </button>
            <button
              onClick={() => setSubTab('resellers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subTab === 'resellers'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Revendeurs ({resellers.length})
            </button>
            <button
              onClick={() => setSubTab('simulation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                subTab === 'simulation'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Simulateur de Marges
            </button>
            <button
              onClick={() => setSubTab('support')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                subTab === 'support'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
              <span>Support Revendeurs</span>
            </button>
          </div>

          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {saveErrorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4" />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* SUB-TAB 1: MATRIX & PLAN CONFIG */}
      {subTab === 'matrix' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Plan Settings Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-base">{plan.name}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                      ({plan.id})
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      plan.id === 'pro'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : plan.id === 'starter'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    -{plan.marginDiscountPercent}% Marge
                  </span>
                </div>

                {/* Price & Discount Inputs */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Prix Mensuel ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={plan.priceMonthly}
                      onChange={(e) =>
                        updatePlanField(plan.id, 'priceMonthly', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Réduction Marge (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={plan.marginDiscountPercent}
                      onChange={(e) =>
                        updatePlanField(
                          plan.id,
                          'marginDiscountPercent',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Description de l'offre
                  </label>
                  <textarea
                    rows={2}
                    value={plan.description || ''}
                    onChange={(e) => updatePlanField(plan.id, 'description', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-sky-500 resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Feature Matrix Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Matrice des fonctionnalités par offre
                </h3>
                <p className="text-[11px] text-slate-400">
                  Cochez ou décochez les fonctionnalités autorisées pour chaque niveau d'abonnement.
                </p>
              </div>
              <button
                onClick={handleSavePlans}
                disabled={savingPlans}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingPlans ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 w-1/2">Fonctionnalité</th>
                    {sortedPlans.map((plan) => (
                      <th key={plan.id} className="py-3 px-4 text-center">
                        <span className="block text-white text-xs font-black">{plan.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono font-normal">
                          (-{plan.marginDiscountPercent}%)
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {SAAS_AVAILABLE_FEATURES.map((feature: SaasFeatureDefinition) => (
                    <tr key={feature.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs">{feature.name}</div>
                        <div className="text-[11px] text-slate-400 leading-snug">
                          {feature.description}
                        </div>
                      </td>
                      {sortedPlans.map((plan) => {
                        const isChecked = Array.isArray(plan.features) && plan.features.includes(feature.id);
                        return (
                          <td key={plan.id} className="py-3 px-4 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer p-1">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleFeature(plan.id, feature.id)}
                                className="w-5 h-5 rounded-md text-sky-500 bg-slate-950 border-slate-700 focus:ring-sky-500 focus:ring-offset-slate-900 cursor-pointer accent-sky-500"
                              />
                            </label>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex justify-end">
              <button
                onClick={handleSavePlans}
                disabled={savingPlans}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingPlans ? 'Enregistrement...' : 'Enregistrer les fonctionnalités'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RESELLERS LIST */}
      {subTab === 'resellers' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Revendeurs inscrits ({resellers.length})
              </h3>
              <p className="text-xs text-slate-400">
                Gérez les comptes des revendeurs, ajustez leur offre manuellement ou visitez leur boutique.
              </p>
            </div>
          </div>

          {resellers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs bg-slate-900/40 border border-slate-800 rounded-2xl">
              Aucun revendeur n'est encore inscrit.
            </div>
          ) : (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Revendeur & Boutique</th>
                      <th className="py-3 px-3">Sous-Domaine</th>
                      <th className="py-3 px-3">Offre Active</th>
                      <th className="py-3 px-3">Commandes</th>
                      <th className="py-3 px-3">Chiffre d'Affaires</th>
                      <th className="py-3 px-3 text-emerald-400">Solde Revendeur</th>
                      <th className="py-3 px-3">Statut</th>
                      <th className="py-3 px-4 text-right">Vitrine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {resellers.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{r.name}</div>
                          <div className="text-[11px] text-slate-400">{r.email}</div>
                          <div className="text-[10px] text-sky-400 font-medium">{r.storeName}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          /store/{r.subdomain}
                          {r.customDomain && (
                            <div className="text-[10px] text-purple-400 font-mono">
                              {r.customDomain}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={r.planId}
                            onChange={(e) =>
                              handleUpdateReseller(r.id, { planId: e.target.value })
                            }
                            className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-bold text-sky-400 focus:outline-none"
                          >
                            {sortedPlans.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (-{p.marginDiscountPercent}%)
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          {r.completedOrdersCount} / {r.ordersCount}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-white">
                          ${r.totalTurnover.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                          ${r.walletBalance.toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() =>
                              handleUpdateReseller(r.id, { isActive: !r.isActive })
                            }
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.isActive
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {r.isActive ? 'Actif' : 'Suspendu'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={`/store/${r.subdomain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-bold text-[11px] transition-all"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Visiter</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: SIMULATEUR DE MARGES */}
      {subTab === 'simulation' && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-black uppercase text-white tracking-wider">
                Simulateur de calcul financier des 3 offres
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Testez vos calculs en direct. La formule garantit que le coût fournisseur reste intact,
              et que les remises (0% Free, 35% Starter, 60% Pro) s'appliquent strictement sur la marge
              Super Admin.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  1. Coût Fournisseur Brut ($)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  value={simSupplierCost}
                  onChange={(e) => setSimSupplierCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  2. Prix Public Plateforme ($)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={simSupplierCost}
                  value={simPlatformPrice}
                  onChange={(e) => setSimPlatformPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  3. Prix Revente Client du Revendeur ($)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  value={simResellerRetailPrice}
                  onChange={(e) => setSimResellerRetailPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Results Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedPlans.map((plan) => {
              const res = calculateSaasPrices({
                supplierCost: simSupplierCost,
                baseSellingPrice: simPlatformPrice,
                discountPercent: plan.marginDiscountPercent,
                customSellingPrice: simResellerRetailPrice,
              });

              return (
                <div
                  key={plan.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white text-sm">{plan.name}</span>
                    <span className="text-[10px] font-black uppercase text-sky-400">
                      -{plan.marginDiscountPercent}% Marge
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Coût Fournisseur (Cs) :</span>
                      <span className="font-mono text-white">${res.supplierCost.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>Marge Initiale Plateforme :</span>
                      <span className="font-mono text-white">${res.superAdminMargin.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-indigo-300 font-medium">
                      <span>Remise accordée au revendeur :</span>
                      <span className="font-mono">-${res.discountAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between font-bold text-sky-400 pt-1 border-t border-slate-800">
                      <span>Prix Achat Grossiste Revendeur :</span>
                      <span className="font-mono">${res.resellerBuyPrice.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-amber-300">
                      <span>Prix Revente Client Final :</span>
                      <span className="font-mono">${res.resellerSellingPrice.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between font-black text-emerald-400 pt-1 border-t border-slate-800">
                      <span>Bénéfice Net Revendeur :</span>
                      <span className="font-mono">+${res.resellerProfit.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Gain Net Plateforme :</span>
                      <span className="font-mono">+${res.platformProfit.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: RESELLER SUPPORT & TICKETING */}
      {subTab === 'support' && (
        <div className="animate-in fade-in duration-200">
          <AdminResellerSupportSection />
        </div>
      )}
    </div>
  );
}
