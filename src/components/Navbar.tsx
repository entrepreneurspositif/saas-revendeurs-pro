'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, ShieldCheck, Smartphone, Sparkles, Menu, X } from 'lucide-react';

import { useCurrency } from '@/components/CurrencyContext';

export default function Navbar() {
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu whenever pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    {
      href: '/',
      label: 'Boutique',
      icon: ShoppingBag,
      activeColor: 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20',
      iconColor: 'text-sky-400',
    },
    {
      href: '/otp',
      label: 'Numéros OTP',
      icon: Smartphone,
      activeColor: 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20',
      iconColor: 'text-sky-400',
    },
    {
      href: '/exclusifs',
      label: 'Produits Exclusifs',
      icon: Sparkles,
      activeColor: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
  ];

  const isAdminRoute = pathname.startsWith('/fatjo&prudo');

  return (
    <>
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 shadow-2xl backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          
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
                <span className="text-xs sm:text-base lg:text-lg font-black tracking-tight text-white group-hover:text-sky-400 transition-colors">
                  ENTREPRENEURS <span className="text-sky-400">POSITIFS</span>
                </span>
                <span className="inline-block px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  PRO
                </span>
              </div>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide">
                Fournisseur Direct & Officiel
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    isActive
                      ? item.activeColor
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.iconColor}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {isAdminRoute && (
              <Link
                href="/fatjo&prudo"
                className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
                <span>Espace Admin</span>
              </Link>
            )}
          </nav>

          {/* Right Controls: Currency Switcher & Mobile Menu Toggle */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Currency Switcher (FCFA vs USD) */}
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

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-sky-400" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2 pt-1 pb-0.5">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? item.activeColor
                      : 'text-slate-300 bg-slate-900/50 hover:bg-slate-800/80 hover:text-white border border-slate-800/60'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-slate-800'}`}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.iconColor}`} />
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {isAdminRoute && (
              <Link
                href="/fatjo&prudo"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all bg-gradient-to-r from-indigo-600 to-purple-600 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/20"
              >
                <div className="p-1.5 rounded-lg bg-white/20">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <span>Espace Admin</span>
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}

