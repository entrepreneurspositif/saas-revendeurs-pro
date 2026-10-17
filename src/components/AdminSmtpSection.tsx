'use client';

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertTriangle, Send, RefreshCw, KeyRound, Sparkles, ShieldCheck, Info } from 'lucide-react';

export default function AdminSmtpSection() {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);

  const [host, setHost] = useState<string>('smtp.gmail.com');
  const [port, setPort] = useState<string>('465');
  const [secure, setSecure] = useState<boolean>(true);
  const [user, setUser] = useState<string>('');
  const [pass, setPass] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  const [testEmail, setTestEmail] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ success: boolean; text: string } | null>(null);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/smtp');
      const data = await res.json();
      if (data.success && data.config) {
        if (data.config.host) setHost(data.config.host);
        if (data.config.port) setPort(data.config.port);
        setSecure(Boolean(data.config.secure));
        if (data.config.user) setUser(data.config.user);
        if (data.config.pass) setPass(data.config.pass);
        if (data.config.from) setFrom(data.config.from);
        setIsConfigured(data.config.isConfigured);
        if (!testEmail && data.config.user) setTestEmail(data.config.user);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleApplyPreset = (type: 'gmail' | 'brevo' | 'hostinger') => {
    if (type === 'gmail') {
      setHost('smtp.gmail.com');
      setPort('465');
      setSecure(true);
      if (!from && user) setFrom(`Plateforme Revendeurs <${user}>`);
    } else if (type === 'brevo') {
      setHost('smtp-relay.brevo.com');
      setPort('587');
      setSecure(false);
    } else if (type === 'hostinger') {
      setHost('smtp.hostinger.com');
      setPort('465');
      setSecure(true);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host,
          port,
          secure,
          user,
          pass,
          from: from || user,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de l\'enregistrement');
      }

      setIsConfigured(Boolean(host && user && pass));
      setStatusMsg({ success: true, text: 'Configuration SMTP enregistrée avec succès !' });
      fetchConfig();
    } catch (err: any) {
      setStatusMsg({ success: false, text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setTesting(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          testEmail: testEmail || user,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Échec de l\'envoi du test');
      }

      setStatusMsg({ success: true, text: data.message });
    } catch (err: any) {
      setStatusMsg({ success: false, text: err.message });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs">
        Chargement de la configuration e-mail...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Serveur E-mail & Récupération de Compte (SMTP)</h3>
              <p className="text-xs text-slate-400">
                Permet d&apos;envoyer automatiquement les codes de vérification à 6 chiffres dans les boîtes e-mail (Gmail, Outlook, etc.) des revendeurs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                isConfigured
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
              }`}
            >
              {isConfigured ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SMTP Configuré</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Non configuré (codes via Telegram uniquement)</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
              statusMsg.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {statusMsg.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Quick Presets */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Remplissage rapide :</span>
          </span>
          <button
            type="button"
            onClick={() => handleApplyPreset('gmail')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all flex items-center gap-1.5"
          >
            <span>Gmail (Recommandé)</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('brevo')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all flex items-center gap-1.5"
          >
            <span>Brevo / Sendinblue</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('hostinger')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all flex items-center gap-1.5"
          >
            <span>Hostinger Webmail</span>
          </button>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSave} className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h4 className="text-sm font-black text-white uppercase tracking-wider">Paramètres de Connexion</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Hôte SMTP (Host)
              </label>
              <input
                type="text"
                required
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="smtp.gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Port SMTP
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="465 ou 587"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setSecure(!secure)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    secure
                      ? 'bg-sky-500/20 border-sky-500/40 text-sky-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                  title="Sécurisé SSL/TLS"
                >
                  {secure ? 'SSL (465)' : 'TLS (587)'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Utilisateur / Email SMTP
              </label>
              <input
                type="text"
                required
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="votre-email@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Mot de Passe d&apos;Application SMTP
              </label>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Pour Gmail : utilisez un « Mot de passe d&apos;application » de 16 caractères.
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Nom & Email Expéditeur (From)
              </label>
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Plateforme Revendeurs <contact@votredomaine.com>"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chiffrement AES / TLS</span>
            </span>
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span>Enregistrer la Configuration</span>
            </button>
          </div>
        </form>

        {/* Test & Help Box */}
        <div className="space-y-4">
          {/* Test Email Box */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Tester l&apos;Envoi</span>
            </h4>
            <p className="text-xs text-slate-400">
              Envoyez un e-mail de test immédiat pour valider que vos identifiants fonctionnent.
            </p>

            <div className="space-y-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="votre-email@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleTestEmail}
                disabled={testing || !isConfigured}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Envoyer un E-mail Test</span>
              </button>
            </div>
          </div>

          {/* Guide for Gmail */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
              <Info className="w-4 h-4 shrink-0" />
              <span>Comment utiliser un compte Gmail ?</span>
            </div>
            <ol className="text-[11px] text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Activez la validation en 2 étapes sur votre compte Google.</li>
              <li>
                Accédez à{' '}
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline font-bold"
                >
                  Mots de passe des applications Google
                </a>
                .
              </li>
              <li>Nommez l&apos;application « Plateforme Revendeur ».</li>
              <li>Copiez le mot de passe généré de 16 lettres et collez-le ci-dessus.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
