'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Palette, Check, Sparkles, Moon, Sun, Flame, Gem } from 'lucide-react';

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      id: 'cyberpunk',
      name: 'Cyberpunk Neon',
      description: 'Sombre & Futuriste - Bleu Électrique et Cyan',
      icon: Sparkles,
      previewBg: 'bg-slate-950',
      previewCard: 'bg-slate-900 border-sky-500/40 text-sky-400',
      accentColor: 'from-sky-500 to-indigo-600',
      badge: 'POPULAIRE',
    },
    {
      id: 'emerald',
      name: 'Émeraude Luxe',
      description: 'Nuit Émeraude, Accents Or & Menthe',
      icon: Gem,
      previewBg: 'bg-[#041210]',
      previewCard: 'bg-[#0a221f] border-amber-500/40 text-amber-400',
      accentColor: 'from-amber-400 to-emerald-500',
      badge: 'LUXE',
    },
    {
      id: 'violet',
      name: 'Sunset Violet',
      description: 'Violet Nuit & Rose Néon Vibrant',
      icon: Flame,
      previewBg: 'bg-[#0c0618]',
      previewCard: 'bg-[#1a0f35] border-pink-500/40 text-pink-400',
      accentColor: 'from-pink-500 to-purple-600',
      badge: 'NEON',
    },
    {
      id: 'light',
      name: 'Corporate Light',
      description: 'Thème Clair Épuré - Blanc & Bleu Royal',
      icon: Sun,
      previewBg: 'bg-slate-100',
      previewCard: 'bg-white border-blue-500/40 text-blue-600 shadow-md',
      accentColor: 'from-blue-600 to-emerald-600',
      badge: 'CLAIR',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Palette className="w-5 h-5 text-indigo-400" />
        <h3 className="text-base font-extrabold text-white">Sélection du Thème Visuel</h3>
      </div>
      <p className="text-xs text-slate-400">
        Choisissez le thème actif de la plateforme. Votre choix est appliqué instantanément sur la boutique et l'espace admin.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {themeOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id as any)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/15 shadow-xl shadow-indigo-500/15 ring-2 ring-indigo-500/40 scale-[1.02]'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Badge Top Right */}
              <div className="flex items-center justify-between w-full mb-3">
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-800 text-slate-300">
                  {opt.badge}
                </span>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-slate-700" />
                )}
              </div>

              {/* Theme Mini Preview Card */}
              <div className={`p-3 rounded-xl mb-3 ${opt.previewBg} border border-slate-800/80`}>
                <div className={`p-2 rounded-lg text-[10px] font-bold ${opt.previewCard} flex items-center justify-between`}>
                  <span>Abonnement Premium</span>
                  <span className="font-extrabold">$4.99</span>
                </div>
              </div>

              {/* Theme Name & Description */}
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center space-x-1.5">
                  <Icon className="w-4 h-4 text-indigo-400" />
                  <span>{opt.name}</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {opt.description}
                </p>
              </div>

              {/* Bottom Color Bar */}
              <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${opt.accentColor} mt-3`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
