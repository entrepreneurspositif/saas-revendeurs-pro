'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
  Ticket,
  Headphones,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-50 dark:bg-[#070b14] border-t border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 text-xs mt-auto relative z-20 transition-colors">
      {/* Top Value Strip */}
      <div className="border-b border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-sky-500 dark:text-sky-400" />
              </div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold text-xs">Livraison Instantanée</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Accès et clés délivrés en direct</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold text-xs">Garantie & Remplacement</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Assistance et réactivation garanties</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold text-xs">Paiements 100% Sécurisés</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Mobile Money & Crypto chiffrés</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold text-xs">Support Client 7j/7</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Assistance humaine Telegram & Web</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-sky-500/30 bg-slate-100 dark:bg-slate-900 shadow-md flex items-center justify-center shrink-0">
                <img
                  src="/logo.jpg"
                  alt="Entrepreneurs Positifs"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                  ENTREPRENEURS <span className="text-sky-500 dark:text-sky-400">POSITIFS</span>
                </span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Grossiste & Fournisseur Digital Officiel
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              Plateforme professionnelle de distribution d&apos;abonnements numériques, licences logicielles, outils d&apos;intelligence artificielle et numéros SMS OTP au tarif grossiste direct.
            </p>

            {/* Live Operational Status */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>Tous les services sont opérationnels (99.9% uptime)</span>
            </div>
          </div>

          {/* Column 1: Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Catalogue & Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center space-x-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                  <span>Abonnements Streaming</span>
                </Link>
              </li>
              <li>
                <Link href="/otp" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center space-x-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>Numéros Virtuels OTP</span>
                </Link>
              </li>
              <li>
                <Link href="/exclusifs" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                  <span>Offres & Licences Exclusives</span>
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Foire Aux Questions (FAQ)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Reseller SaaS */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Espace Revendeur SaaS</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/reseller/register" className="hover:text-slate-900 dark:hover:text-white transition-colors text-sky-600 dark:text-sky-400 font-bold flex items-center space-x-1">
                  <span>Créer ma Boutique Revendeur</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/reseller/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Connexion Tableau de Bord
                </Link>
              </li>
              <li>
                <Link href="/reseller/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Gestion des Ventes & Retraits
                </Link>
              </li>
              <li>
                <Link href="/#reseller-features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Avantages & Marges Grossiste
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Assistance & Suivi</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://t.me/MakeMoney01_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center space-x-1.5 text-sky-600 dark:text-sky-400 font-semibold"
                >
                  <span>Bot Telegram Officiel</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-400">Support Client : 24/7 en direct</span>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-400">Garantie & Remplacement actif</span>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-400">Livraison automatique par Ticket</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Payment Methods Badges Strip */}
        <div className="pt-8 mt-8 border-t border-slate-200 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span className="font-bold text-slate-900 dark:text-white text-xs mr-1">Moyens de paiement acceptés :</span>
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-bold text-[10px] shadow-sm">
              Wave Mobile Money
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-bold text-[10px] shadow-sm">
              MTN Mobile Money
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-bold text-[10px] shadow-sm">
              Orange Money
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-bold text-[10px] shadow-sm">
              Moov Money
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-bold text-[10px] shadow-sm">
              Carte Bancaire (Visa/Mastercard)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-bold text-[10px] shadow-sm">
              Crypto (USDT / BTC)
            </span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-500 dark:text-slate-400">
            <span>&copy; {new Date().getFullYear()} Entrepreneurs Positifs. Tous droits réservés.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
