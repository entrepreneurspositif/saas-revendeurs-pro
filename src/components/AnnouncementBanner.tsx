'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, X } from 'lucide-react';

interface BannerConfig {
  promoBannerActive: boolean;
  promoBannerText: string;
  promoBannerBg: string;
  promoBannerLink: string;
}

export default function AnnouncementBanner() {
  const [config, setConfig] = useState<BannerConfig | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('dismiss_promo_banner') === 'true';
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    fetch('/api/admin/marketing')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.marketing) {
          setConfig(data.marketing);
        }
      })
      .catch((err) => console.error('Error loading promo banner config:', err));
  }, []);

  if (dismissed || !config || !config.promoBannerActive) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('dismiss_promo_banner', 'true');
  };

  const getBgGradient = (style: string) => {
    switch (style) {
      case 'emerald':
        return 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600';
      case 'fire':
        return 'bg-gradient-to-r from-rose-600 via-red-600 to-orange-600';
      case 'gold':
        return 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950';
      case 'purple':
        return 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600';
      case 'indigo':
      default:
        return 'bg-gradient-to-r from-indigo-600 via-sky-600 to-purple-700';
    }
  };

  return (
    <div className={`relative w-full ${getBgGradient(config.promoBannerBg)} text-white py-2 px-4 shadow-lg text-xs font-medium z-50`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2 truncate mx-auto text-center">
          <Sparkles className="w-4 h-4 shrink-0 animate-bounce text-amber-300" />
          <span className="font-extrabold tracking-wide truncate">
            {config.promoBannerText}
          </span>

          {config.promoBannerLink && (
            <Link
              href={config.promoBannerLink}
              className="inline-flex items-center space-x-1 font-black underline underline-offset-2 ml-2 hover:opacity-90 shrink-0 bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded-full transition-all text-[11px]"
            >
              <span>Découvrir</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
          title="Fermer la bannière"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
