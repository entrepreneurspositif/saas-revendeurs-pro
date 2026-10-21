'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Wand2,
  Check,
  Copy,
  RotateCcw,
  X,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  FileText,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface AiDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  category: string;
  initialDescription: string;
  onApply: (enhancedDescription: string) => void;
}

export default function AiDescriptionModal({
  isOpen,
  onClose,
  productTitle,
  category,
  initialDescription,
  onApply,
}: AiDescriptionModalProps) {
  const [title, setTitle] = useState(productTitle);
  const [draft, setDraft] = useState(initialDescription);
  const [tone, setTone] = useState<'sales' | 'short' | 'technical' | 'guide'>(
    category === 'Méthode' ? 'guide' : 'sales'
  );
  const [instantDelivery, setInstantDelivery] = useState(true);
  const [warranty, setWarranty] = useState(true);
  const [multiDevice, setMultiDevice] = useState(true);
  const [official, setOfficial] = useState(true);

  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(productTitle || '');
      setDraft(initialDescription || '');
      setTone(category === 'Méthode' ? 'guide' : 'sales');
      setCopied(false);
      setErrorMsg(null);

      // If there's already a title, trigger initial generation immediately
      if (productTitle && productTitle.trim()) {
        handleGenerate(productTitle, initialDescription, category === 'Méthode' ? 'guide' : 'sales');
      } else {
        setGeneratedText(initialDescription || '');
      }
    }
  }, [isOpen, productTitle, category, initialDescription]);

  const handleGenerate = async (
    customTitle = title,
    customDraft = draft,
    customTone = tone
  ) => {
    if (!customTitle || !customTitle.trim()) {
      setErrorMsg('Veuillez indiquer au moins le titre du produit.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/ai-enhance-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: customTitle.trim(),
          category,
          draft: customDraft.trim(),
          tone: customTone,
          options: {
            instantDelivery,
            warranty,
            multiDevice,
            official,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.description) {
        setGeneratedText(data.description);
      } else {
        setErrorMsg(data.message || 'Impossible de générer la description.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erreur réseau lors de la génération.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!generatedText.trim()) return;
    onApply(generatedText.trim());
    onClose();
  };

  const insertSnippet = (snippet: string) => {
    setGeneratedText((prev) => (prev ? `${prev}\n• ${snippet}` : `• ${snippet}`));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-violet-950/40 via-slate-900 to-indigo-950/30">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md shadow-violet-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Assistant IA : Rédaction de Description
                </h3>
                <span className="text-[10px] uppercase font-black tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">
                  Conversion & Vente
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Structurez et optimisez vos fiches produits avec une mise en page persuasive.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Split Controls & Preview) */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-between">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Options & Configuration Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            {/* Tone selector */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-violet-400" />
                <span>Style rédactionnel</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'sales', label: '🚀 Complet & Vendeur', desc: 'Accroche + puces + garanties' },
                  { id: 'short', label: '⚡ Court & Percutant', desc: 'Direct, 4-5 lignes clés' },
                  { id: 'technical', label: '⚙️ Spécifications & Specs', desc: 'Détails des accès et specs' },
                  { id: 'guide', label: '📚 Méthode & Guide', desc: 'Pour tutoriels et formations' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      const newTone = item.id as any;
                      setTone(newTone);
                      handleGenerate(title, draft, newTone);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      tone === item.id
                        ? 'bg-violet-600/20 border-violet-500/60 text-violet-200 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-[11px] truncate">{item.label}</div>
                    <div className="text-[9px] text-slate-400 truncate">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox guarantees */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Éléments de réassurance à inclure</span>
              </label>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={instantDelivery}
                    onChange={(e) => setInstantDelivery(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-[11px]">⚡ Livraison instantanée</span>
                </label>

                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={warranty}
                    onChange={(e) => setWarranty(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-[11px]">🛡️ Garantie & Support 7j/7</span>
                </label>

                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={multiDevice}
                    onChange={(e) => setMultiDevice(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-[11px]">📱 Multi-appareils (PC/TV)</span>
                </label>

                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={official}
                    onChange={(e) => setOfficial(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-[11px]">✅ Compte 100% Officiel</span>
                </label>
              </div>

              {/* Quick regenerator with current checks */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={loading}
                  className="w-full py-2 px-3 rounded-xl bg-violet-600/30 hover:bg-violet-600/40 text-violet-200 border border-violet-500/40 font-bold flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Optimisation en cours...' : 'Mettre à jour avec ces options'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Optional: Admin draft / notes input */}
          <details className="group bg-slate-950/40 rounded-2xl border border-slate-800/80 p-3">
            <summary className="text-[11px] font-bold text-slate-400 cursor-pointer hover:text-slate-200 flex items-center justify-between">
              <span>✍️ Personnaliser les consignes ou brouillon initial (Optionnel)</span>
              <span className="text-[10px] text-violet-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-3 space-y-2">
              <textarea
                rows={2}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ex: Compte privé 4K, 1 mois garanti, pas besoin de VPN, profil réservé..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-mono"
              />
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={loading}
                className="text-xs font-bold text-violet-300 hover:text-violet-200 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Régénérer en incorporant ces notes</span>
              </button>
            </div>
          </details>

          {/* Result Text Area with Quick Inserts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Description générée (Éditable directement ci-dessous)</span>
              </label>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white flex items-center space-x-1.5 font-bold text-[11px] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={10}
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
                placeholder="La description générée s'affichera ici..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-2xl p-4 text-xs font-sans text-slate-200 leading-relaxed focus:outline-none shadow-inner"
              />
              {loading && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center space-y-2 text-violet-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-violet-400" />
                  <span className="text-xs font-bold">L'IA rédige votre description...</span>
                </div>
              )}
            </div>

            {/* Quick snippet chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-bold text-slate-500">Ajouter rapidement :</span>
              {[
                'Activation immédiate 24/7',
                'Garantie remplacement 100%',
                'Compatible Smart TV, PC, Mobile',
                'Support WhatsApp & Email',
                'Sans utilisation de VPN',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => insertSnippet(chip)}
                  className="text-[10px] bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white px-2 py-0.5 rounded-lg border border-slate-700/60 transition-colors"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Annuler
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Régénérer</span>
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={!generatedText.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-violet-600/30 flex items-center space-x-2 transition-all disabled:opacity-50 hover:scale-[1.02]"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Appliquer au Produit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
