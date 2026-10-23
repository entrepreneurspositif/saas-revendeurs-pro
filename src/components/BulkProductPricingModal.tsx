'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Zap,
  TrendingUp,
  Percent,
  DollarSign,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';

export interface BulkProductItem {
  id: string;
  title: string;
  category: string;
  imageUrl?: string;
  baseSellingPrice: number;
  resellerBuyPrice: number;
  resellerSellingPrice: number;
  resellerProfit: number;
  isEnabled: boolean;
  isExclusive?: boolean;
}

export interface BulkProductPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: BulkProductItem[];
  selectedProductIds: string[];
  categories: string[];
  onApply: (
    updates: { productId: string; customSellingPrice: number | null; isEnabled?: boolean }[]
  ) => Promise<void>;
}

type PricingMode =
  | 'MARGIN_PERCENT'
  | 'MARGIN_FIXED'
  | 'CURRENT_PERCENT'
  | 'CURRENT_FIXED'
  | 'RESET_DEFAULT';

type ScopeMode = 'ALL' | 'CATEGORY' | 'SELECTED';
type RoundingMode = 'none' | '99' | '90' | '50' | 'ceil';

export default function BulkProductPricingModal({
  isOpen,
  onClose,
  products,
  selectedProductIds,
  categories,
  onApply,
}: BulkProductPricingModalProps) {
  // Scope selection
  const [scope, setScope] = useState<ScopeMode>(() =>
    selectedProductIds.length > 0 ? 'SELECTED' : 'ALL'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(() =>
    categories.find((c) => c !== 'Tous') || 'Tous'
  );

  // Pricing Mode & Value
  const [mode, setMode] = useState<PricingMode>('MARGIN_PERCENT');
  const [numericValue, setNumericValue] = useState<number>(30); // Default 30% margin
  const [rounding, setRounding] = useState<RoundingMode>('99'); // Default psychological pricing (.99)

  // Search filter inside preview table
  const [previewSearch, setPreviewSearch] = useState<string>('');

  // Individual overrides inside preview table
  const [manualOverrides, setManualOverrides] = useState<Record<string, number>>({});

  // Loading & feedback
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset state when opening/closing or scope change
  React.useEffect(() => {
    if (isOpen) {
      if (selectedProductIds.length > 0) {
        setScope('SELECTED');
      } else {
        setScope('ALL');
      }
      setManualOverrides({});
      setErrorMsg(null);
    }
  }, [isOpen, selectedProductIds.length]);

  if (!isOpen) return null;

  // Filter products based on chosen scope
  const targetProducts = products.filter((p) => {
    if (scope === 'SELECTED') {
      return selectedProductIds.includes(p.id);
    }
    if (scope === 'CATEGORY') {
      if (selectedCategory === 'Tous') return true;
      return p.category === selectedCategory;
    }
    return true; // 'ALL'
  });

  // Helper: Apply rounding rule
  const applyRounding = (price: number, roundType: RoundingMode): number => {
    if (roundType === 'none') return parseFloat(price.toFixed(2));
    const floorInt = Math.floor(price);
    if (roundType === 'ceil') return Math.ceil(price);
    if (roundType === '99') {
      const candidate = floorInt + 0.99;
      return candidate < price ? floorInt + 1.99 : candidate;
    }
    if (roundType === '90') {
      const candidate = floorInt + 0.9;
      return candidate < price ? floorInt + 1.9 : candidate;
    }
    if (roundType === '50') {
      return parseFloat((Math.round(price * 2) / 2).toFixed(2));
    }
    return parseFloat(price.toFixed(2));
  };

  // Helper: Calculate simulated new price for a product
  const computeNewPrice = (p: BulkProductItem): { newPrice: number; isDefault: boolean } => {
    // If reseller manually tweaked this in preview table:
    if (manualOverrides[p.id] !== undefined) {
      return {
        newPrice: Math.max(p.resellerBuyPrice, manualOverrides[p.id]),
        isDefault: false,
      };
    }

    if (mode === 'RESET_DEFAULT') {
      return {
        newPrice: p.baseSellingPrice,
        isDefault: true,
      };
    }

    let calculated = p.resellerSellingPrice;

    if (mode === 'MARGIN_PERCENT') {
      // Selling price = Buy price + X% margin
      const margin = p.resellerBuyPrice * (Math.max(0, numericValue) / 100);
      calculated = p.resellerBuyPrice + margin;
    } else if (mode === 'MARGIN_FIXED') {
      // Selling price = Buy price + X$ fixed margin
      calculated = p.resellerBuyPrice + Math.max(0, numericValue);
    } else if (mode === 'CURRENT_PERCENT') {
      // Selling price = Current selling price * (1 + X%)
      calculated = p.resellerSellingPrice * (1 + numericValue / 100);
    } else if (mode === 'CURRENT_FIXED') {
      // Selling price = Current selling price + X$
      calculated = p.resellerSellingPrice + numericValue;
    }

    // Apply psychological rounding
    calculated = applyRounding(calculated, rounding);

    // Floor protection: never sell below buy price!
    const finalPrice = Math.max(p.resellerBuyPrice, parseFloat(calculated.toFixed(2)));

    return {
      newPrice: finalPrice,
      isDefault: false,
    };
  };

  // Preview simulations list
  const simulatedItems = targetProducts.map((p) => {
    const { newPrice, isDefault } = computeNewPrice(p);
    const oldProfit = Math.max(0, p.resellerSellingPrice - p.resellerBuyPrice);
    const newProfit = Math.max(0, newPrice - p.resellerBuyPrice);
    const profitDiff = newProfit - oldProfit;
    const marginPercent =
      p.resellerBuyPrice > 0 ? ((newProfit / p.resellerBuyPrice) * 100).toFixed(0) : '0';

    return {
      product: p,
      oldPrice: p.resellerSellingPrice,
      newPrice,
      oldProfit,
      newProfit,
      profitDiff,
      marginPercent,
      isDefault,
    };
  });

  // Filter preview list by search
  const filteredSimulations = simulatedItems.filter((item) => {
    if (!previewSearch.trim()) return true;
    const query = previewSearch.toLowerCase();
    return (
      item.product.title.toLowerCase().includes(query) ||
      item.product.category.toLowerCase().includes(query)
    );
  });

  // Global aggregate stats
  const totalTargetCount = simulatedItems.length;
  const avgOldMargin =
    totalTargetCount > 0
      ? (simulatedItems.reduce((acc, curr) => acc + curr.oldProfit, 0) / totalTargetCount).toFixed(2)
      : '0.00';
  const avgNewMargin =
    totalTargetCount > 0
      ? (simulatedItems.reduce((acc, curr) => acc + curr.newProfit, 0) / totalTargetCount).toFixed(2)
      : '0.00';
  const totalProjectedGain = simulatedItems
    .reduce((acc, curr) => acc + curr.newProfit, 0)
    .toFixed(2);

  // Apply Handler
  const handleConfirm = async () => {
    if (totalTargetCount === 0) {
      setErrorMsg('Aucun produit sélectionné pour cette opération.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const updates = simulatedItems.map((item) => ({
        productId: item.product.id,
        customSellingPrice: item.isDefault ? null : item.newPrice,
        isEnabled: item.product.isEnabled,
      }));

      await onApply(updates);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur est survenue lors de la mise à jour.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-pricing-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[760px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER (PINNED) */}
        <div className="shrink-0 px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-sky-500 flex items-center justify-center text-slate-950 shadow-lg shadow-sky-500/20 font-black">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="bulk-pricing-modal-title" className="text-base font-black text-white">
                  Ajustement des Prix en Masse
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Tarifs & Marges
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Calculez et appliquez instantanément vos marges de revente sur tout ou partie de votre catalogue.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY (SCROLLABLE) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-slate-200">
          {/* STEP 1: TARGET SCOPE */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              1. Choisir les articles à modifier
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScope('ALL')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  scope === 'ALL'
                    ? 'bg-sky-500/10 border-sky-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Tout le catalogue</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 font-mono">
                    {products.length}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Applique la règle à tous les articles actifs
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScope('CATEGORY')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  scope === 'CATEGORY'
                    ? 'bg-sky-500/10 border-sky-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Par catégorie</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 font-mono">
                    {categories.filter((c) => c !== 'Tous').length}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Ciblez un rayon spécifique (Streaming, IA, etc.)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScope('SELECTED')}
                disabled={selectedProductIds.length === 0}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  scope === 'SELECTED'
                    ? 'bg-sky-500/10 border-sky-500 text-white shadow-md'
                    : selectedProductIds.length === 0
                    ? 'opacity-40 bg-slate-950/30 border-slate-800/50 cursor-not-allowed'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-white flex items-center justify-between">
                  <span>Sélection ({selectedProductIds.length})</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
                    Cochés
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {selectedProductIds.length > 0
                    ? `Modifier les ${selectedProductIds.length} articles sélectionnés`
                    : 'Cochez des cases dans le tableau'}
                </div>
              </button>
            </div>

            {/* Category dropdown if CATEGORY is selected */}
            {scope === 'CATEGORY' && (
              <div className="pt-2 flex items-center gap-2">
                <span className="text-slate-400 font-bold">Catégorie cible :</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-sky-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === 'Tous' ? 'Toutes les catégories' : c}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* STEP 2: PRICING STRATEGY */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              2. Définir la règle de tarification
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode('MARGIN_PERCENT');
                  if (numericValue <= 0) setNumericValue(30);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  mode === 'MARGIN_PERCENT'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-400" />
                  <span>Marge % sur prix grossiste</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Ex: Achat $10 + 30% = Vente $13.00</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('MARGIN_FIXED');
                  if (numericValue <= 0) setNumericValue(3);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  mode === 'MARGIN_FIXED'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Marge $ sur prix grossiste</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Ex: Achat $10 + $3.00 = Vente $13.00</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('CURRENT_PERCENT');
                  if (numericValue <= 0) setNumericValue(10);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  mode === 'CURRENT_PERCENT'
                    ? 'bg-sky-500/10 border-sky-500 text-sky-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-400" />
                  <span>Ajuster prix actuel en %</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Ex: +10% ou -5% sur les prix actuels</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('CURRENT_FIXED');
                  if (numericValue <= 0) setNumericValue(2);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  mode === 'CURRENT_FIXED'
                    ? 'bg-sky-500/10 border-sky-500 text-sky-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-sky-400" />
                  <span>Ajuster prix actuel en $</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Ex: +$1.50 ou -$1.00 sur les prix actuels</p>
              </button>

              <button
                type="button"
                onClick={() => setMode('RESET_DEFAULT')}
                className={`p-2.5 rounded-xl border text-left transition-all sm:col-span-2 md:col-span-2 ${
                  mode === 'RESET_DEFAULT'
                    ? 'bg-purple-500/10 border-purple-500 text-purple-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                  <span>Rétablir les prix recommandés de base</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Supprime les tarifs personnalisés et réaligne sur les prix catalogue conseillés
                </p>
              </button>
            </div>

            {/* Input & Quick Chips (if not reset default) */}
            {mode !== 'RESET_DEFAULT' && (
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
                    <span className="text-slate-400 font-mono font-bold">
                      {mode.includes('PERCENT') ? '%' : '$'}
                    </span>
                    <input
                      type="number"
                      step={mode.includes('PERCENT') ? '1' : '0.1'}
                      value={numericValue}
                      onChange={(e) => setNumericValue(parseFloat(e.target.value) || 0)}
                      className="w-24 bg-transparent text-white font-mono font-bold text-sm focus:outline-none"
                    />
                  </div>

                  {/* Preset Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-500 text-[10px] font-bold">Raccourcis :</span>
                    {mode === 'MARGIN_PERCENT' &&
                      [15, 25, 30, 40, 50, 75, 100].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setNumericValue(val)}
                          className={`px-2 py-1 rounded-lg font-mono text-[11px] font-bold transition-all ${
                            numericValue === val
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          +{val}%
                        </button>
                      ))}

                    {mode === 'MARGIN_FIXED' &&
                      [1, 2, 3, 5, 10, 15].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setNumericValue(val)}
                          className={`px-2 py-1 rounded-lg font-mono text-[11px] font-bold transition-all ${
                            numericValue === val
                              ? 'bg-emerald-500 text-slate-950 font-black'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          +${val}
                        </button>
                      ))}

                    {mode === 'CURRENT_PERCENT' &&
                      [5, 10, 15, 20, -5, -10].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setNumericValue(val)}
                          className={`px-2 py-1 rounded-lg font-mono text-[11px] font-bold transition-all ${
                            numericValue === val
                              ? 'bg-sky-500 text-white font-black'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {val > 0 ? `+${val}%` : `${val}%`}
                        </button>
                      ))}

                    {mode === 'CURRENT_FIXED' &&
                      [1, 2, 3, 5, -1, -2].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setNumericValue(val)}
                          className={`px-2 py-1 rounded-lg font-mono text-[11px] font-bold transition-all ${
                            numericValue === val
                              ? 'bg-sky-500 text-white font-black'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {val > 0 ? `+$${val}` : `-$${Math.abs(val)}`}
                        </button>
                      ))}
                  </div>
                </div>

                {/* STEP 3: PSYCHOLOGICAL ROUNDING */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-slate-400 font-bold text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Arrondi psychologique :
                  </span>
                  {[
                    { id: '99', label: '.99 $ (Recommandé)', example: 'ex: 9.99 $' },
                    { id: '90', label: '.90 $', example: 'ex: 9.90 $' },
                    { id: '50', label: '.50 / .00 $', example: 'ex: 9.50 $' },
                    { id: 'ceil', label: 'Entier supérieur', example: 'ex: 10.00 $' },
                    { id: 'none', label: 'Aucun (centimes exacts)', example: 'ex: 9.43 $' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRounding(r.id as RoundingMode)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        rounding === r.id
                          ? 'bg-slate-800 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SUMMARY STATS BANNER */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gradient-to-r from-sky-950/30 via-slate-900 to-amber-950/20 p-3.5 rounded-2xl border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-black">Articles Ciblés</div>
              <div className="text-base font-black text-white font-mono">{totalTargetCount}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-black">Marge Moyenne Avant</div>
              <div className="text-base font-black text-slate-300 font-mono">${avgOldMargin}</div>
            </div>
            <div>
              <div className="text-[10px] text-amber-400 uppercase font-black">Marge Moyenne Après</div>
              <div className="text-base font-black text-amber-300 font-mono flex items-center gap-1">
                <span>${avgNewMargin}</span>
                {parseFloat(avgNewMargin) >= parseFloat(avgOldMargin) ? (
                  <span className="text-[10px] text-emerald-400 font-bold">▲</span>
                ) : (
                  <span className="text-[10px] text-rose-400 font-bold">▼</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-400 uppercase font-black">Bénéfice Net Projeté</div>
              <div className="text-base font-black text-emerald-400 font-mono">
                +${totalProjectedGain}
              </div>
            </div>
          </div>

          {/* STEP 4: LIVE SIMULATION TABLE */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                3. Aperçu en direct & Sécurité Anti-perte ({simulatedItems.length} articles)
              </label>

              {/* Search filter in preview */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filtrer l'aperçu..."
                  value={previewSearch}
                  onChange={(e) => setPreviewSearch(e.target.value)}
                  className="pl-8 pr-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden max-h-[220px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 text-[10px] font-bold uppercase sticky top-0 z-10 backdrop-blur-sm">
                    <th className="py-2.5 px-3">Article</th>
                    <th className="py-2.5 px-2 text-sky-400 font-mono">Achat Grossiste</th>
                    <th className="py-2.5 px-2 text-slate-400 font-mono">Prix Actuel</th>
                    <th className="py-2.5 px-2 text-amber-400 font-mono">Nouveau Prix Simulée</th>
                    <th className="py-2.5 px-2 text-emerald-400 font-mono text-right">Marge Nette ($ / %)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredSimulations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                        Aucun article ne correspond à ce filtre.
                      </td>
                    </tr>
                  ) : (
                    filteredSimulations.map((item) => (
                      <tr key={item.product.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            {item.product.imageUrl ? (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.title}
                                className="w-6 h-6 rounded-md object-cover border border-slate-800"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-slate-400">
                                <Package className="w-3 h-3" />
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-white max-w-[190px] truncate">
                                {item.product.title}
                              </div>
                              <span className="text-[10px] text-slate-500">
                                {item.product.category}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-2 font-mono text-sky-400 font-bold">
                          ${item.product.resellerBuyPrice.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 font-mono text-slate-400 line-through">
                          ${item.oldPrice.toFixed(2)}
                        </td>
                        <td className="py-2 px-2 font-mono font-bold text-amber-300">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min={item.product.resellerBuyPrice}
                              value={item.newPrice}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setManualOverrides((prev) => ({
                                  ...prev,
                                  [item.product.id]: val,
                                }));
                              }}
                              className="w-18 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-2 font-mono font-bold text-emerald-400 text-right">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            +${item.newProfit.toFixed(2)} (+{item.marginPercent}%)
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-emerald-400 font-bold">Protection anti-perte active :</strong>{' '}
                Aucun prix ne peut descendre en-dessous de votre prix d'achat grossiste.
              </span>
            </div>
          </div>

          {/* ERROR ALERT */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* FOOTER (PINNED) */}
        <div className="shrink-0 px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            <strong className="text-white font-mono">{totalTargetCount}</strong> article(s) recevront
            cette nouvelle tarification.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-colors"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || totalTargetCount === 0}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Appliquer & Enregistrer ({totalTargetCount})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
