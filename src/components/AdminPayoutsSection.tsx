'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Search,
  AlertTriangle,
  DollarSign,
  Send,
  Store,
} from 'lucide-react';

export default function AdminPayoutsSection({
  onPendingCountChange,
}: {
  onPendingCountChange?: (count: number) => void;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [stats, setStats] = useState<{
    totalCount: number;
    pendingCount: number;
    pendingAmount: number;
    approvedCount: number;
    approvedAmount: number;
    rejectedCount: number;
  }>({
    totalCount: 0,
    pendingCount: 0,
    pendingAmount: 0,
    approvedCount: 0,
    approvedAmount: 0,
    rejectedCount: 0,
  });

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/payouts');
      const data = await res.json();
      if (data.success) {
        setPayouts(data.payouts || []);
        if (data.stats) {
          setStats(data.stats);
          if (onPendingCountChange) {
            onPendingCountChange(data.stats.pendingCount || 0);
          }
        }
      }
    } catch (e) {
      console.error('Error loading payouts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleProcessPayout = async (payoutId: string, action: 'APPROVE' | 'REJECT') => {
    const note = adminNotes[payoutId] || '';
    if (action === 'REJECT' && !note.trim()) {
      const confirmNoNote = window.confirm(
        'Voulez-vous vraiment refuser ce retrait sans préciser de motif ? Le solde sera recrédité au revendeur.'
      );
      if (!confirmNoNote) return;
    }

    setProcessingId(payoutId);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payoutId,
          action,
          adminNote: note,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors du traitement du retrait');
      }

      setFeedbackMsg({ type: 'success', text: data.message });
      await fetchPayouts();
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPayouts = payouts.filter((p) => {
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = (p.reference || '').toLowerCase().includes(q);
      const matchStore = (p.tenant?.storeName || '').toLowerCase().includes(q);
      const matchName = (p.tenant?.name || '').toLowerCase().includes(q);
      const matchDetails = (p.paymentDetails || '').toLowerCase().includes(q);
      const matchMethod = (p.paymentMethod || '').toLowerCase().includes(q);
      return matchRef || matchStore || matchName || matchDetails || matchMethod;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-black tracking-wider text-amber-300">
              En Attente de Paiement
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2 font-mono">
            ${stats.pendingAmount.toFixed(2)}
          </p>
          <p className="text-[11px] text-amber-300/80 mt-1 font-bold">
            {stats.pendingCount} demande{stats.pendingCount > 1 ? 's' : ''} à traiter
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-black tracking-wider text-emerald-300">
              Total Versé (Payé)
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2 font-mono">
            ${stats.approvedAmount.toFixed(2)}
          </p>
          <p className="text-[11px] text-emerald-300/80 mt-1 font-bold">
            {stats.approvedCount} retrait{stats.approvedCount > 1 ? 's' : ''} validé{stats.approvedCount > 1 ? 's' : ''}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/25">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-black tracking-wider text-rose-300">
              Refusés & Recrédités
            </span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2 font-mono">{stats.rejectedCount}</p>
          <p className="text-[11px] text-rose-300/80 mt-1">Solde remis sur le wallet revendeur</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-black tracking-wider text-slate-400">
              Total Historique
            </span>
            <Wallet className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2 font-mono">{stats.totalCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Toutes demandes confondues</p>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Filter Bar & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: `Tous (${stats.totalCount})` },
            { id: 'PENDING', label: `En attente (${stats.pendingCount})` },
            { id: 'APPROVED', label: `Payés (${stats.approvedCount})` },
            { id: 'REJECTED', label: `Refusés (${stats.rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === tab.id
                  ? 'bg-sky-500 text-white shadow'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Réf, boutique, numéro, adresse..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:border-sky-500 outline-none"
            />
          </div>
          <button
            onClick={fetchPayouts}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            title="Rafraîchir les retraits"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Payouts List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-slate-900 border border-slate-800 rounded-2xl">
          Chargement des demandes de retrait revendeurs...
        </div>
      ) : filteredPayouts.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-2xl">
          Aucune demande de retrait trouvée pour ce filtre.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayouts.map((p) => {
            const isPending = p.status === 'PENDING';
            const isApproved = p.status === 'APPROVED';

            return (
              <div
                key={p.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isPending
                    ? 'bg-slate-900 border-amber-500/40 shadow-lg shadow-amber-950/10'
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Reseller & Payout Info */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-sky-400">
                        {p.reference}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isApproved
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isPending
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isApproved
                          ? 'Payé & Validé'
                          : isPending
                          ? 'En attente de versement'
                          : 'Refusé & Recrédité'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Demandé le{' '}
                        {new Date(p.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-white font-bold">
                        <Store className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{p.tenant?.storeName || 'Boutique'}</span>
                        <span className="text-slate-500 font-normal">({p.tenant?.name})</span>
                      </div>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">
                        Solde restant wallet :{' '}
                        <strong className="text-emerald-400 font-mono">
                          ${(p.tenant?.walletBalance || 0).toFixed(2)}
                        </strong>
                      </span>
                    </div>

                    {/* Payment Method & Copyable Destination */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
                        {p.paymentMethod}
                      </span>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white">
                        <span>{p.paymentDetails}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(p.id, p.paymentDetails)}
                          className="text-slate-400 hover:text-sky-400 transition-colors"
                          title="Copier les coordonnées"
                        >
                          {copiedId === p.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {p.adminNote && (
                      <p className="text-[11px] text-slate-400 bg-slate-950/60 border border-slate-800/80 px-3 py-1.5 rounded-lg">
                        <strong className="text-slate-300">Note Admin :</strong> {p.adminNote}
                      </p>
                    )}
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Montant à verser
                      </span>
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        ${p.amount.toFixed(2)} USD
                      </span>
                    </div>

                    {isPending && (
                      <div className="w-full sm:w-auto flex flex-col gap-2 min-w-[280px]">
                        <input
                          type="text"
                          value={adminNotes[p.id] || ''}
                          onChange={(e) =>
                            setAdminNotes((prev) => ({ ...prev, [p.id]: e.target.value }))
                          }
                          placeholder="Réf transfert (ID Tx) ou motif de refus..."
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-sky-500 outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={processingId === p.id}
                            onClick={() => handleProcessPayout(p.id, 'APPROVE')}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Valider & Payé</span>
                          </button>
                          <button
                            type="button"
                            disabled={processingId === p.id}
                            onClick={() => handleProcessPayout(p.id, 'REJECT')}
                            className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 disabled:opacity-50 text-rose-300 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Refuser</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
