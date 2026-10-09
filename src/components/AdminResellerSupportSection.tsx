'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  User,
  Store,
  Tag,
  AlertCircle,
  ChevronRight,
  LifeBuoy,
  Check,
} from 'lucide-react';

interface ResellerMessage {
  id: string;
  senderRole: 'RESELLER' | 'SUPER_ADMIN';
  senderName: string;
  message: string;
  createdAt: string;
}

interface ResellerTicket {
  id: string;
  ticketCode: string;
  tenantId: string;
  subject: string;
  category: string;
  priority: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  tenant?: {
    id: string;
    name: string;
    email: string;
    storeName: string;
    subdomain: string;
    planId: string;
    planStatus: string;
    walletBalance: number;
  };
  messages: ResellerMessage[];
}

export default function AdminResellerSupportSection() {
  const [tickets, setTickets] = useState<ResellerTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 });

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Ticket
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [resolveOnReply, setResolveOnReply] = useState<boolean>(false);
  const [sendingReply, setSendingReply] = useState<boolean>(false);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'ALL') params.set('status', filterStatus);
      if (filterPriority !== 'ALL') params.set('priority', filterPriority);
      if (filterCategory !== 'ALL') params.set('category', filterCategory);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/reseller-support?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets || []);
        if (data.stats) setStats(data.stats);

        // Keep selection or default to first if none
        if (data.tickets && data.tickets.length > 0) {
          if (!selectedTicketId || !data.tickets.some((t: any) => t.id === selectedTicketId)) {
            setSelectedTicketId(data.tickets[0].id);
          }
        } else {
          setSelectedTicketId(null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filterStatus, filterPriority, filterCategory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicketId, tickets]);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  const handleSendReply = async () => {
    if (!selectedTicketId || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch(`/api/admin/reseller-support/${selectedTicketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: replyText.trim(),
          newStatus: resolveOnReply ? 'RESOLVED' : 'IN_PROGRESS',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReplyText('');
        // Update ticket locally
        setTickets((prev) =>
          prev.map((t) => (t.id === selectedTicketId ? data.ticket : t))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/reseller-support/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? data.ticket : t))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">Ouvert</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-500/20 text-sky-400 border border-sky-500/30">En cours</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Résolu</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-400 border border-slate-700">Fermé</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">🔴 Urgente</span>;
      case 'HIGH':
        return <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">🟠 Haute</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-bold text-sky-400 flex items-center gap-1">🔵 Moyenne</span>;
      case 'LOW':
      default:
        return <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">⚪ Basse</span>;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'ORDERS':
        return 'Commandes Clients';
      case 'COMMISSIONS':
        return 'Retraits & Solde';
      case 'TECHNICAL':
        return 'Problème Technique';
      case 'CATALOG':
        return 'Catalogue & Tarifs';
      case 'GENERAL':
      default:
        return 'Question Générale';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase mb-1">
            <span>Total Tickets</span>
            <LifeBuoy className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.total}</div>
          <span className="text-[10px] text-slate-500">Demandes revendeurs</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20">
          <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase mb-1">
            <span>En Attente / Ouverts</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{stats.open}</div>
          <span className="text-[10px] text-slate-500">Nécessite réponse</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-sky-500/20">
          <div className="flex items-center justify-between text-sky-400 text-xs font-bold uppercase mb-1">
            <span>En Traitement</span>
            <MessageSquare className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400">{stats.inProgress}</div>
          <span className="text-[10px] text-slate-500">Discussion active</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase mb-1">
            <span>Résolus</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats.resolved}</div>
          <span className="text-[10px] text-slate-500">Succès clôturés</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Chercher par code, boutique ou sujet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
              className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-64"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="OPEN">Ouverts</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="RESOLVED">Résolus</option>
            <option value="CLOSED">Fermés</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">Toutes priorités</option>
            <option value="URGENT">Urgente</option>
            <option value="HIGH">Haute</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="LOW">Basse</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">Toutes catégories</option>
            <option value="ORDERS">Commandes Clients</option>
            <option value="COMMISSIONS">Retraits & Solde</option>
            <option value="TECHNICAL">Problème Technique</option>
            <option value="CATALOG">Catalogue & Tarifs</option>
            <option value="GENERAL">Question Générale</option>
          </select>
        </div>

        <button
          onClick={fetchTickets}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
          title="Actualiser les tickets"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[580px]">
        {/* Left Column: Tickets List (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex flex-col h-[650px] overflow-hidden">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400 px-2 py-1 mb-2 flex items-center justify-between">
            <span>Conversations ({tickets.length})</span>
            {loading && <span className="text-[10px] text-sky-400 lowercase animate-pulse">chargement...</span>}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {tickets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <LifeBuoy className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-bold text-slate-400">Aucun ticket trouvé</p>
                <p className="text-[11px] mt-1">Aucune demande correspondant à vos filtres actuels.</p>
              </div>
            ) : (
              tickets.map((t) => {
                const isSelected = t.id === selectedTicketId;
                const lastMsg = t.messages[t.messages.length - 1];

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-slate-800 border-sky-500/50 shadow-md ring-1 ring-sky-500/20'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-[10px] font-bold text-sky-400 px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                        {t.ticketCode}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {getPriorityBadge(t.priority)}
                        {getStatusBadge(t.status)}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{t.subject}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                        <Store className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="font-semibold text-slate-300 truncate">
                          {t.tenant?.storeName || t.tenant?.name || 'Revendeur'}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[10px] text-slate-500 truncate">/store/{t.tenant?.subdomain}</span>
                      </div>
                    </div>

                    {lastMsg && (
                      <div className="text-[11px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded-lg line-clamp-1 flex items-center justify-between">
                        <span className="truncate">
                          <strong className="text-slate-300">
                            {lastMsg.senderRole === 'SUPER_ADMIN' ? 'Vous : ' : `${lastMsg.senderName} : `}
                          </strong>
                          {lastMsg.message}
                        </span>
                        <span className="text-[9px] text-slate-500 shrink-0 ml-2 font-mono">
                          {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col h-[650px] overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                      {selectedTicket.ticketCode}
                    </span>
                    <span className="text-xs text-slate-400">
                      {getCategoryLabel(selectedTicket.category)}
                    </span>
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                  <h3 className="text-sm font-black text-white">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span className="text-indigo-400 font-bold">{selectedTicket.tenant?.storeName}</span>
                    <span>({selectedTicket.tenant?.name})</span>
                    <span className="text-slate-600">•</span>
                    <span className="font-mono text-[11px] text-slate-500">{selectedTicket.tenant?.email}</span>
                  </div>
                </div>

                {/* Status Switcher Action */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400">Statut :</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                    disabled={updatingStatus}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="OPEN">Ouvert</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="RESOLVED">Résolu</option>
                    <option value="CLOSED">Fermé</option>
                  </select>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar bg-slate-950/30">
                {selectedTicket.messages.map((m) => {
                  const isSuperAdmin = m.senderRole === 'SUPER_ADMIN';

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isSuperAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        {isSuperAdmin ? (
                          <>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] font-black text-purple-400 flex items-center gap-1 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                              <Shield className="w-3 h-3" /> Super Admin
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] font-black text-sky-400 flex items-center gap-1 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                              <Store className="w-3 h-3" /> {m.senderName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </>
                        )}
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                          isSuperAdmin
                            ? 'bg-gradient-to-r from-purple-950/70 to-indigo-950/80 border border-purple-500/30 text-purple-100 rounded-tr-none shadow-md'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input Box */}
              <div className="p-3 border-t border-slate-800 bg-slate-950/90">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400">
                    Répondre au revendeur :
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-400 hover:text-white">
                    <input
                      type="checkbox"
                      checked={resolveOnReply}
                      onChange={(e) => setResolveOnReply(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>Marquer comme résolu à l'envoi</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    placeholder="Écrivez votre réponse ici... (Ctrl+Entrée pour envoyer)"
                    className="flex-1 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyText.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all shrink-0 self-end shadow-lg shadow-sky-500/10"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingReply ? '...' : 'Envoyer'}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <MessageSquare className="w-12 h-12 mb-3 text-slate-600" />
              <h4 className="text-sm font-bold text-white mb-1">Aucune conversation sélectionnée</h4>
              <p className="text-xs max-w-sm text-slate-400">
                Sélectionnez un ticket dans la liste de gauche pour consulter l'historique et apporter votre assistance au revendeur.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
