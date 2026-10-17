'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Store,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  KeyRound,
  Send,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

function ResellerLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'REQUEST' | 'RESET'>('REQUEST');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [botUsername, setBotUsername] = useState<string | null>(null);

  // Check URL params for direct recovery link from Telegram bot
  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const urlCode = searchParams.get('code');

    if (urlEmail) {
      setForgotEmail(urlEmail);
      if (urlCode) {
        setForgotCode(urlCode);
        setForgotStep('RESET');
        setShowForgotModal(true);
      }
    }

    // Fetch bot username info
    fetch('/api/reseller/auth/forgot-password')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.botUsername) {
          setBotUsername(d.botUsername);
        }
      })
      .catch(() => {});
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/reseller/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Échec de connexion');
      }

      router.push('/reseller/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);
    setForgotLoading(true);

    try {
      const res = await fetch('/api/reseller/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REQUEST_CODE', email: forgotEmail }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la demande du code');
      }

      if (data.botUsername) {
        setBotUsername(data.botUsername);
      }

      setForgotMsg({ success: true, text: data.message });
      setForgotStep('RESET');
    } catch (err: any) {
      setForgotMsg({ success: false, text: err.message });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);

    if (forgotNewPassword.length < 6) {
      setForgotMsg({ success: false, text: 'Le mot de passe doit comporter au moins 6 caractères.' });
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotMsg({ success: false, text: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch('/api/reseller/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESET_PASSWORD',
          email: forgotEmail,
          code: forgotCode,
          newPassword: forgotNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Échec de la réinitialisation');
      }

      setForgotMsg({ success: true, text: data.message });
      setTimeout(() => {
        router.push('/reseller/dashboard');
      }, 1200);
    } catch (err: any) {
      setForgotMsg({ success: false, text: err.message });
    } finally {
      setForgotLoading(false);
    }
  };

  const getTelegramBotResetUrl = () => {
    if (!botUsername) return null;
    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (cleanEmail) {
      return `https://t.me/${botUsername}?start=reset_${encodeURIComponent(cleanEmail)}`;
    }
    return `https://t.me/${botUsername}?start=reset`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-all">
              <Store className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Espace Revendeur SaaS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Connectez-vous à votre tableau de bord et gérez votre boutique en ligne
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="revendeur@exemple.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Accès sécurisé 24/7</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (email && !forgotEmail) setForgotEmail(email);
                  setForgotMsg(null);
                  setShowForgotModal(true);
                }}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Accéder à mon espace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Vous n&apos;avez pas encore de boutique ?{' '}
              <Link href="/reseller/register" className="text-sky-400 hover:text-sky-300 font-bold ml-1">
                Créer une boutique revendeur
              </Link>
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/50">
            <span className="block text-sky-400 font-black text-sm">Jusqu&apos;à 60%</span>
            <span className="text-[10px] text-slate-400">Réduction Pro</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/50">
            <span className="block text-emerald-400 font-black text-sm">100% Vos Prix</span>
            <span className="text-[10px] text-slate-400">Marge libre</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/50">
            <span className="block text-purple-400 font-black text-sm">Sous-Domaine</span>
            <span className="text-[10px] text-slate-400">Vitrine clé en main</span>
          </div>
        </div>
      </div>

      {/* MODAL: MOT DE PASSE OUBLIÉ & RÉCUPÉRATION INTELLIGENTE */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => {
                setShowForgotModal(false);
                setForgotMsg(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold mb-1">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Récupération Automatique 24/7</span>
              </div>
              <h3 className="text-lg font-black text-white">
                {forgotStep === 'REQUEST' ? 'Récupérer votre compte' : 'Définir un nouveau mot de passe'}
              </h3>
              <p className="text-xs text-slate-400">
                {forgotStep === 'REQUEST'
                  ? 'Obtenez votre code de sécurité immédiatement via Email ou notre Bot Telegram.'
                  : `Entrez le code à 6 chiffres reçu pour l'adresse ${forgotEmail}.`}
              </p>
            </div>

            {forgotMsg && (
              <div
                className={`p-3.5 rounded-2xl border text-xs font-bold flex items-start gap-2 ${
                  forgotMsg.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {forgotMsg.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <span>{forgotMsg.text}</span>
              </div>
            )}

            {/* STEP 1: REQUEST CODE */}
            {forgotStep === 'REQUEST' ? (
              <form onSubmit={handleRequestResetCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Votre Adresse Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="revendeur@exemple.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {forgotLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Générer mon Code de Sécurité</span>
                    </>
                  )}
                </button>

                {/* Instant Telegram Bot Option */}
                {botUsername && (
                  <div className="pt-2 border-t border-slate-800 text-center space-y-2">
                    <p className="text-[11px] text-slate-400">
                      ⚡ <strong>Option Instantanée :</strong> Recevez votre code en 2 secondes directement sur Telegram !
                    </p>
                    <a
                      href={getTelegramBotResetUrl() || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span>Ouvrir le Bot Telegram (@{botUsername})</span>
                    </a>
                  </div>
                )}
              </form>
            ) : (
              /* STEP 2: VERIFY CODE & SET NEW PASSWORD */
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Code à 6 chiffres
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotStep('REQUEST')}
                      className="text-[11px] text-sky-400 hover:underline"
                    >
                      Renvoyer un code
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Ex: 749201"
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg font-mono font-black tracking-widest text-sky-400 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Nouveau Mot de Passe
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimum 6 caractères"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Confirmer le Nouveau Mot de Passe
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Répétez le mot de passe"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {forgotLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Réinitialiser & Me Connecter</span>
                    </>
                  )}
                </button>

                {/* Instant Telegram Bot Option in Step 2 */}
                {botUsername && (
                  <div className="pt-2 border-t border-slate-800 text-center space-y-2">
                    <p className="text-[11px] text-slate-400">
                      Pas reçu l&apos;e-mail ? Obtenez votre code en 2 secondes sur Telegram :
                    </p>
                    <a
                      href={getTelegramBotResetUrl() || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span>Obtenir mon code via @{botUsername}</span>
                    </a>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResellerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
          Chargement...
        </div>
      }
    >
      <ResellerLoginContent />
    </Suspense>
  );
}
