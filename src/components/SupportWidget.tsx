'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Ticket,
  ShieldCheck,
  RefreshCw,
  User,
  Headphones,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  LogOut,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  ticketCode: string;
  sender: 'CUSTOMER' | 'ADMIN';
  text: string;
  createdAt: string;
}

interface TicketInfo {
  ticketCode: string;
  productTitle: string;
  status: string;
  supportStatus?: string;
  quantity: number;
  createdAt: string;
}

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketInput, setTicketInput] = useState('');
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Restore saved ticket code from session storage on mount
  useEffect(() => {
    const savedCode = sessionStorage.getItem('support_ticket_code');
    if (savedCode) {
      verifyTicket(savedCode);
    }
  }, []);

  // Poll messages every 3 seconds when chat is open and ticket is verified
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && ticketInfo) {
      fetchMessages(ticketInfo.ticketCode);
      interval = setInterval(() => {
        fetchMessages(ticketInfo.ticketCode);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isOpen, ticketInfo]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const verifyTicket = async (codeToVerify: string) => {
    const code = codeToVerify.trim().toUpperCase();
    if (!code) {
      setErrorMsg('Veuillez entrer un code de ticket.');
      return;
    }

    setVerifying(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/support/verify-ticket?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (data.success && data.order) {
        setTicketInfo(data.order);
        sessionStorage.setItem('support_ticket_code', data.order.ticketCode);
        fetchMessages(data.order.ticketCode);
      } else {
        setErrorMsg(data.error || 'Code de ticket introuvable.');
        setTicketInfo(null);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Erreur lors de la vérification du ticket.');
    } finally {
      setVerifying(false);
    }
  };

  const fetchMessages = async (code: string) => {
    try {
      const res = await fetch(`/api/support/messages?ticketCode=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        if (data.order && data.order.supportStatus) {
          setTicketInfo((prev) => (prev ? { ...prev, supportStatus: data.order.supportStatus } : prev));
        }
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticketInfo || sending) return;

    const textToSend = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const res = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketCode: ticketInfo.ticketCode,
          text: textToSend,
          sender: 'CUSTOMER',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        if (data.supportStatus) {
          setTicketInfo((prev) => (prev ? { ...prev, supportStatus: data.supportStatus } : prev));
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleLogoutTicket = () => {
    setTicketInfo(null);
    setMessages([]);
    setTicketInput('');
    sessionStorage.removeItem('support_ticket_code');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center space-x-3 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white px-4 py-3.5 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 border border-white/20 active:scale-95"
        >
          <div className="relative">
            <Headphones className="w-6 h-6 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <span className="font-extrabold text-sm tracking-wide hidden sm:inline">
            Support Client
          </span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[540px] bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-700 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-wide flex items-center space-x-2">
                  <span>Support Client Live</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 font-bold">
                    En ligne
                  </span>
                </h3>
                <p className="text-[11px] text-sky-100 opacity-90">
                  {ticketInfo ? `Ticket : ${ticketInfo.ticketCode}` : 'Vérification requise'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {ticketInfo && (
                <button
                  onClick={handleLogoutTicket}
                  title="Changer de ticket"
                  className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {!ticketInfo ? (
            /* Ticket Verification Screen */
            <div className="flex-1 p-6 flex flex-col justify-center items-center text-center bg-slate-950/60">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500/20 to-purple-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4 shadow-lg shadow-sky-500/10">
                <Ticket className="w-8 h-8" />
              </div>

              <h4 className="text-base font-extrabold text-white mb-1">
                Accéder au Support
              </h4>
              <p className="text-xs text-slate-400 mb-6 max-w-xs leading-relaxed">
                Veuillez entrer le **Code de Ticket** de votre commande pour discuter avec notre équipe support.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  verifyTicket(ticketInput);
                }}
                className="w-full space-y-4"
              >
                <div className="relative">
                  <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ex: TK-XXXXXX"
                    value={ticketInput}
                    onChange={(e) => {
                      setTicketInput(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold text-white uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-2 text-red-400 text-xs font-medium text-left">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={verifying || !ticketInput.trim()}
                  className="w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {verifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Lancer la Discussion</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Chat Screen */
            <div className="flex-1 flex flex-col justify-between bg-slate-950/40">
              
              {/* Product Info Bar */}
              <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="font-semibold text-slate-300 truncate">
                    {ticketInfo.productTitle}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {ticketInfo.supportStatus === 'RESOLVED' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>RÉSOLU</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-800 text-sky-400 border border-slate-700">
                      EN COURS
                    </span>
                  )}
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin">
                {ticketInfo.supportStatus === 'RESOLVED' && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-[11px] text-center font-medium leading-relaxed">
                    ✅ Ce ticket a été marqué comme résolu par l'équipe support. Envoyez un nouveau message ci-dessous si vous désirez rouvrir la discussion.
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                    <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-sky-400" />
                    <p className="text-xs font-medium text-slate-400">
                      Posez votre question ci-dessous.
                    </p>
                    <p className="text-[10px] text-slate-500">
                      L'administrateur vous répondra directement ici.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isCustomer = msg.sender === 'CUSTOMER';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isCustomer ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div className="flex items-center space-x-1 mb-1 px-1">
                          <span className="text-[9px] font-extrabold uppercase text-slate-400">
                            {isCustomer ? 'Vous' : '🛡️ Support Admin'}
                          </span>
                          <span className="text-[9px] text-slate-500">
                            • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div
                          className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                            isCustomer
                              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-tr-none'
                              : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2"
              >
                <input
                  type="text"
                  placeholder="Écrivez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-md shadow-sky-500/20 disabled:opacity-50 transition-all"
                >
                  {sending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
