'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, ShieldCheck, Smartphone, Sparkles, Menu, X, Store, Ticket, ArrowUpRight, Headphones, Sun, Moon } from 'lucide-react';
import { useCurrency } from '@/components/CurrencyContext';
import { useTheme } from '@/components/ThemeProvider';

export default function Navbar() {
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  const { isDark, toggleDarkLight } = useTheme();
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
    },
    {
      href: '/otp',
      label: 'Numéros OTP',
      icon: Smartphone,
    },
    {
      href: '/exclusifs',
      label: 'Offres Exclusives',
      icon: Sparkles,
    },
  ];

  const isAdminRoute = pathname.startsWith('/fatjo&prudo');

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#070b14]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Brand Logo & Tagline */}
          <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.12] bg-slate-100 dark:bg-[#0c1222] shadow-sm group-hover:border-sky-500/50 transition-all duration-200">
              <img
                src="/logo.jpg"
                alt="Entrepreneurs Positifs"
                className="w-full h-full object-cover"
              />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-[#070b14]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                  ENTREPRENEURS <span className="text-sky-500 dark:text-sky-400">POSITIFS</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  PRO
                </span>
              </div>
              <span className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                Grossiste & Fournisseur Officiel
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/90 dark:bg-white/[0.03] p-1 rounded-xl border border-slate-200 dark:border-white/[0.06] shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    isActive
                      ? 'bg-white dark:bg-white/[0.1] text-slate-900 dark:text-white border border-slate-200 dark:border-white/[0.12] shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-500 dark:text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {isAdminRoute && (
              <Link
                href="/fatjo&prudo"
                className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-300" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Right Controls: Theme Toggle + Reseller CTA + Currency + Mobile Menu */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleDarkLight}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 transition-all"
              title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
              aria-label="Basculer le thème"
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Currency Switcher (FCFA vs USD) */}
            <div className="bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] p-0.5 rounded-xl flex items-center">
              <button
                onClick={() => setCurrency('FCFA')}
                className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all ${
                  currency === 'FCFA'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Afficher les prix en Franc CFA"
              >
                FCFA
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all ${
                  currency === 'USD'
                    ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Afficher les prix en Dollar USD ($)"
              >
                USD
              </button>
            </div>

            {/* Reseller SaaS Portal CTA */}
            <Link
              href="/reseller/dashboard"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02]"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Espace Revendeur</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-sky-500 dark:text-sky-400" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-white/[0.08] bg-white/95 dark:bg-[#070b14]/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2.5 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-1 pt-1">
              Navigation Rapide
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-100 dark:bg-white/[0.1] text-slate-900 dark:text-white border border-slate-200 dark:border-white/[0.12]'
                      : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-500 dark:text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] space-y-2">
              <Link
                href="/reseller/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs shadow-md shadow-sky-500/20"
              >
                <Store className="w-4 h-4" />
                <span>Espace Revendeur SaaS</span>
              </Link>

              <a
                href="https://t.me/MakeMoney01_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                <Headphones className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                <span>Assistance Telegram 24/7</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
