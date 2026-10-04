'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  Filter,
  RefreshCcw,
  Globe,
  ArrowUpRight,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function AdminAnalyticsSection() {
  const [loading, setLoading] = useState<boolean>(true);
  const [timeframe, setTimeframe] = useState<string>('7d');
  const [selectedPath, setSelectedPath] = useState<string>('ALL');
  const [selectedDevice, setSelectedDevice] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [data, setData] = useState<{
    summary: {
      totalVisits: number;
      uniqueVisitors: number;
      todayVisits: number;
      deviceBreakdown: { mobile: number; desktop: number; tablet: number };
    };
    timeSeries: Array<{ date: string; visits: number; uniques: number }>;
    topPages: Array<{ path: string; count: number; percentage: number }>;
    topReferrers: Array<{ referrer: string; count: number; percentage: number }>;
    recentLogs: Array<{
      id: string;
      path: string;
      device: string;
      referrer: string;
      ipHash: string;
      createdAt: string;
    }>;
  } | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        timeframe,
        path: selectedPath,
        device: selectedDevice,
      });

      if (timeframe === 'custom' && startDate) {
        queryParams.set('startDate', startDate);
        if (endDate) queryParams.set('endDate', endDate);
      }

      const res = await fetch(`/api/admin/analytics?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error('Error loading analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, selectedPath, selectedDevice, startDate, endDate]);

  const maxSeriesVisits = data?.timeSeries ? Math.max(...data.timeSeries.map((t) => t.visits), 1) : 1;
  const totalDeviceCount = data?.summary
    ? data.summary.deviceBreakdown.mobile + data.summary.deviceBreakdown.desktop + data.summary.deviceBreakdown.tablet
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-sky-400 font-extrabold uppercase text-xs tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Statistiques & Fréquentation</span>
          </div>
          <h2 className="text-2xl font-black text-white">Analyse des Visites sur la Plateforme</h2>
          <p className="text-slate-400 text-xs mt-1">
            Suivez en temps réel l'audience de votre boutique, le trafic par page, les types d'appareils et la provenance de vos visiteurs.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-white font-bold text-xs flex items-center space-x-2 transition-all self-start md:self-auto"
        >
          <RefreshCcw className={`w-3.5 h-3.5 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center space-x-2 text-xs font-black uppercase text-slate-400 tracking-wider">
          <Filter className="w-4 h-4 text-sky-400" />
          <span>Filtres de Sélection d'Audience</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Timeframe Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Période Temporelle</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-sky-500 transition-colors"
            >
              <option value="today">Aujourd'hui</option>
              <option value="24h">Dernières 24 Heures</option>
              <option value="7d">7 Derniers Jours</option>
              <option value="30d">30 Derniers Jours</option>
              <option value="all">Tout l'Historique</option>
              <option value="custom">Plage Personnalisée</option>
            </select>
          </div>

          {/* Page Path Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Page Ciblée</label>
            <select
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-sky-500 transition-colors"
            >
              <option value="ALL">Toutes les Pages</option>
              <option value="/">Boutique Principale ( / )</option>
              <option value="/otp">Numéros OTP ( /otp )</option>
              <option value="/exclusifs">Produits Exclusifs ( /exclusifs )</option>
            </select>
          </div>

          {/* Device Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Appareil</label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-sky-500 transition-colors"
            >
              <option value="ALL">Tous les Appareils</option>
              <option value="mobile">Mobiles 📱</option>
              <option value="desktop">Ordinateurs 💻</option>
              <option value="tablet">Tablettes 📱</option>
            </select>
          </div>

          {/* Quick Stats Indicator */}
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Filtre Actif</span>
              <span className="text-xs font-extrabold text-sky-400">
                {timeframe === '7d' ? '7 Jours' : timeframe === '30d' ? '30 Jours' : timeframe}
              </span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>

        {/* Custom Date Pickers */}
        {timeframe === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">Date de début</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">Date de fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Visits Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Visites Totales</span>
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{data?.summary?.totalVisits ?? 0}</div>
          <span className="text-[11px] text-slate-500 font-bold block mt-1">Pages vues enregistrées</span>
        </div>

        {/* Unique Visitors Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Visiteurs Uniques</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{data?.summary?.uniqueVisitors ?? 0}</div>
          <span className="text-[11px] text-slate-500 font-bold block mt-1">Utilisateurs distincts</span>
        </div>

        {/* Today's Visits Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Visites Aujourd'hui</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">{data?.summary?.todayVisits ?? 0}</div>
          <span className="text-[11px] text-slate-500 font-bold block mt-1">Depuis minuit</span>
        </div>

        {/* Device Ratio Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Mobiles vs Desktop</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white flex items-baseline space-x-2">
            <span>{totalDeviceCount > 0 ? Math.round((data!.summary.deviceBreakdown.mobile / totalDeviceCount) * 100) : 0}%</span>
            <span className="text-xs font-bold text-slate-400">Mobile</span>
          </div>
          <span className="text-[11px] text-slate-500 font-bold block mt-1">
            {totalDeviceCount > 0 ? Math.round((data!.summary.deviceBreakdown.desktop / totalDeviceCount) * 100) : 0}% Ordinateurs
          </span>
        </div>
      </div>

      {/* Time Series Graph Section */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white font-extrabold text-sm">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>Évolution de la Fréquentation</span>
          </div>
          <span className="text-xs text-slate-400 font-bold">Visites & Visiteurs Uniques</span>
        </div>

        {data?.timeSeries && data.timeSeries.length > 0 ? (
          <div className="space-y-3 pt-2">
            {data.timeSeries.map((item, idx) => {
              const visitPct = Math.round((item.visits / maxSeriesVisits) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300 font-mono">{item.date}</span>
                    <div className="space-x-3 text-slate-400">
                      <span className="text-sky-400 font-black">{item.visits} visite(s)</span>
                      <span>({item.uniques} unique(s))</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800/80 p-0.5">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(visitPct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 text-xs font-bold">
            Aucune donnée de visite enregistrée pour cette sélection.
          </div>
        )}
      </div>

      {/* Pages & Referrers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-white font-extrabold text-sm">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Pages les Plus Visitées</span>
          </div>

          <div className="space-y-3">
            {data?.topPages && data.topPages.length > 0 ? (
              data.topPages.map((page, idx) => (
                <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <span className="text-xs font-black text-slate-500 w-5">#{idx + 1}</span>
                    <span className="text-xs font-bold text-white truncate max-w-xs">{page.path}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-sky-400 block">{page.count} visites</span>
                    <span className="text-[10px] text-slate-500 font-bold">{page.percentage}% de l'audience</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">Aucune page consultée</div>
            )}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-white font-extrabold text-sm">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Sources de Trafic / Référents</span>
          </div>

          <div className="space-y-3">
            {data?.topReferrers && data.topReferrers.length > 0 ? (
              data.topReferrers.map((ref, idx) => (
                <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <span className="text-xs font-black text-slate-500 w-5">#{idx + 1}</span>
                    <span className="text-xs font-bold text-slate-300 truncate max-w-xs">{ref.referrer}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-indigo-400 block">{ref.count} clics</span>
                    <span className="text-[10px] text-slate-500 font-bold">{ref.percentage}% du trafic</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">Aucune source externe enregistrée</div>
            )}
          </div>
        </div>
      </div>

      {/* Live Recent Visit Logs Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white font-extrabold text-sm">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Historique Récent des Visites en En Direct</span>
          </div>
          <span className="text-xs text-slate-400 font-bold">50 Derniers Accès</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-black text-[10px]">
                <th className="py-3 px-4">Horodatage</th>
                <th className="py-3 px-4">Page Consultée</th>
                <th className="py-3 px-4">Appareil</th>
                <th className="py-3 px-4">Source / Referrer</th>
                <th className="py-3 px-4 text-right">Identifiant Anonymisé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {data?.recentLogs && data.recentLogs.length > 0 ? (
                data.recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(log.createdAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{log.path}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900 border border-slate-700 text-sky-400">
                        {log.device === 'mobile' ? (
                          <>
                            <Smartphone className="w-3 h-3" />
                            <span>Mobile</span>
                          </>
                        ) : log.device === 'tablet' ? (
                          <>
                            <Tablet className="w-3 h-3" />
                            <span>Tablette</span>
                          </>
                        ) : (
                          <>
                            <Monitor className="w-3 h-3" />
                            <span>Desktop</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-xs">{log.referrer || 'Direct'}</td>
                    <td className="py-3 px-4 text-right font-mono text-[10px] text-slate-500">#{log.ipHash}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 font-bold">
                    Aucune visite récente enregistrée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
