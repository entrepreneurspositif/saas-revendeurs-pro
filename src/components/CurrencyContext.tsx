'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type CurrencyType = 'FCFA' | 'USD';

interface CurrencyContextType {
  currency: CurrencyType;
  fcfaRate: number;
  setCurrency: (c: CurrencyType) => void;
  updateFcfaRate: (rate: number) => Promise<void>;
  formatPrice: (amountInUSD: number, forceCurrency?: CurrencyType) => string;
  formatBoth: (amountInUSD: number) => { fcfa: string; usd: string };
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'FCFA',
  fcfaRate: 650,
  setCurrency: () => {},
  updateFcfaRate: async () => {},
  formatPrice: (amt) => `${Math.round(amt * 650).toLocaleString('fr-FR')} FCFA`,
  formatBoth: (amt) => ({
    fcfa: `${Math.round(amt * 650).toLocaleString('fr-FR')} FCFA`,
    usd: `$${amt.toFixed(2)}`,
  }),
  loading: true,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyType>('FCFA');
  const [fcfaRate, setFcfaRateState] = useState<number>(650);
  const [loading, setLoading] = useState<boolean>(true);

  // Load saved preference or default
  useEffect(() => {
    const savedCurrency = localStorage.getItem('user_currency') as CurrencyType;
    if (savedCurrency && ['FCFA', 'USD'].includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }

    const fetchCurrencySettings = async () => {
      try {
        const res = await fetch('/api/currency');
        const data = await res.json();
        if (data.success) {
          if (data.fcfaRate) setFcfaRateState(data.fcfaRate);
          if (!savedCurrency && data.defaultCurrency) {
            setCurrencyState(data.defaultCurrency as CurrencyType);
          }
        }
      } catch (e) {
        console.error('Error fetching currency config:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencySettings();
  }, []);

  const setCurrency = (c: CurrencyType) => {
    setCurrencyState(c);
    localStorage.setItem('user_currency', c);
  };

  const updateFcfaRate = async (newRate: number) => {
    setFcfaRateState(newRate);
    try {
      await fetch('/api/currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fcfaRate: newRate }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const formatPrice = (amountInUSD: number, forceCurrency?: CurrencyType): string => {
    const curr = forceCurrency || currency;
    if (curr === 'FCFA') {
      const fcfaValue = Math.round(amountInUSD * fcfaRate);
      return `${fcfaValue.toLocaleString('fr-FR')} FCFA`;
    }
    return `$${amountInUSD.toFixed(2)}`;
  };

  const formatBoth = (amountInUSD: number) => {
    const fcfaValue = Math.round(amountInUSD * fcfaRate);
    return {
      fcfa: `${fcfaValue.toLocaleString('fr-FR')} FCFA`,
      usd: `$${amountInUSD.toFixed(2)}`,
    };
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        fcfaRate,
        setCurrency,
        updateFcfaRate,
        formatPrice,
        formatBoth,
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
