'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';

import { useCurrency } from '@/components/CurrencyContext';

export default function Navbar() {
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 shadow-2xl overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group shrink-0">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-sky-500/40 shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-all duration-200 bg-slate-950">
              <img
                src="/logo.jpg"
                alt="Entrepreneurs Positifs Logo"
                className="w-full h-full object-cover"
              />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-sm sm:text-lg font-black tracking-tight text-white group-hover:text-sky-400 transition-colors">
                  ENTREPRENEURS <span className="text-sky-400">POSITIFS</span>
                </span>
                <span className="hidden xs:inline-block px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  PRO
                </span>
              </div>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide">
                Fournisseur Direct & Officiel
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 shrink-0">
            <Link
              href="/"
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold flex items-center space-x-1.5 transition-all ${
                pathname === '/'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Boutique</span>
            </Link>

            <Link
              href="/otp"
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold flex items-center space-x-1.5 transition-all ${
                pathname === '/otp'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span>Numéros OTP</span>
            </Link>

            <Link
              href="/exclusifs"
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold flex items-center space-x-1.5 transition-all ${
                pathname === '/exclusifs'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Produits Exclusifs</span>
            </Link>

            {pathname.startsWith('/fatjo&prudo') && (
              <Link
                href="/fatjo&prudo"
                className="px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold flex items-center space-x-1.5 transition-all bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
                <span className="hidden xs:inline">Espace Admin</span>
                <span className="xs:hidden">Admin</span>
              </Link>
            )}
          </nav>

          {/* Controls: Currency Switcher (FCFA vs USD) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            <div className="bg-slate-900/90 border border-slate-800 p-0.5 rounded-xl flex items-center shadow-inner">
              <button
                onClick={() => setCurrency('FCFA')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all ${
                  currency === 'FCFA'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Afficher les prix en Franc CFA"
              >
                FCFA
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all ${
                  currency === 'USD'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Afficher les prix en Dollar USD ($)"
              >
                USD
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
