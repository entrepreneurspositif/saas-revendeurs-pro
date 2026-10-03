'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ThemeSelector from '@/components/ThemeSelector';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Layers,
  RefreshCcw,
  Sliders,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Plus,
  Search,
  Zap,
  Activity,
  Edit,
  X,
  Palette,
  Key,
  Lock,
  LogOut,
  ArrowRight,
  AlertTriangle,
  Ticket,
  Check,
  FileText,
  Clock,
  Settings,
  KeyRound,
  MessageSquare,
  Send,
  Headphones,
  User,
  Coins,
  DollarSign,
  Smartphone,
  Sparkles,
  Tag,
  Percent,
  Gift,
  Trash2,
  Bell,
  Upload,
  Image as ImageIcon,
  Globe,
} from 'lucide-react';
import { useCurrency } from '@/components/CurrencyContext';

export default function AdminDashboardPage() {
  const { fcfaRate, updateFcfaRate, currency, setCurrency } = useCurrency();
  const [fcfaRateInput, setFcfaRateInput] = useState<number>(fcfaRate);
  const [savingCurrency, setSavingCurrency] = useState<boolean>(false);
  const [currencySavedMsg, setCurrencySavedMsg] = useState<string | null>(null);
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState<boolean>(false);

  // Password Change State
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [changingPassword, setChangingPassword] = useState<boolean>(false);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<{ message: string; success: boolean } | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'tickets' | 'support' | 'products' | 'manual_products' | 'payment_config' | 'settings' | 'themes' | 'suppliers' | 'overview' | 'comparison' | 'onlinesim' | 'product_requests' | 'marketing' | 'promos' | 'telegram' | 'pricing_rules'>('tickets');
  const [productRequests, setProductRequests] = useState<any[]>([]);

  // OnlineSIM OTP State
  const [onlineSimApiKey, setOnlineSimApiKey] = useState<string>('D7b35U1V9w7fAUr-wh87r8Bj-8k17Le4u-jGg3HshL-XY7kS1faZRZ9gQW');
  const [onlineSimUserId, setOnlineSimUserId] = useState<string>('780784');
  const [onlineSimMargin, setOnlineSimMargin] = useState<number>(30);
  const [onlineSimBalance, setOnlineSimBalanceState] = useState<number | null>(null);
  const [savingOnlineSim, setSavingOnlineSim] = useState<boolean>(false);
  const [onlineSimMsg, setOnlineSimMsg] = useState<{ message: string; success: boolean } | null>(null);

  // Marketing & Analytics State
  const [facebookPixelId, setFacebookPixelId] = useState<string>('');
  const [tiktokPixelId, setTiktokPixelId] = useState<string>('');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState<string>('');
  const [promoBannerActive, setPromoBannerActive] = useState<boolean>(true);
  const [promoBannerText, setPromoBannerText] = useState<string>('');
  const [promoBannerBg, setPromoBannerBg] = useState<string>('indigo');
  const [promoBannerLink, setPromoBannerLink] = useState<string>('/exclusifs');

  const [savingMarketing, setSavingMarketing] = useState<boolean>(false);
  const [marketingSavedMsg, setMarketingSavedMsg] = useState<string | null>(null);

  // UTM Campaign Generator State
  const [utmSource, setUtmSource] = useState<string>('facebook');
  const [utmMedium, setUtmMedium] = useState<string>('cpc');
  const [utmCampaign, setUtmCampaign] = useState<string>('lancement');
  const [utmPage, setUtmPage] = useState<string>('/');
  const [copiedUtm, setCopiedUtm] = useState<boolean>(false);

  // Promo Codes State
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [showCreatePromoModal, setShowCreatePromoModal] = useState<boolean>(false);
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [promoDiscountType, setPromoDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [promoDiscountValue, setPromoDiscountValue] = useState<string>('10');
  const [promoMinAmount, setPromoMinAmount] = useState<string>('0');
  const [promoMaxUses, setPromoMaxUses] = useState<string>('');
  const [promoExpiresAt, setPromoExpiresAt] = useState<string>('');
  const [savingPromo, setSavingPromo] = useState<boolean>(false);
  const [promoMsg, setPromoMsg] = useState<{ message: string; success: boolean } | null>(null);

  // Pricing Rules State
  const [pricingRules, setPricingRules] = useState<any[]>([
    { id: 'rule_1', minPrice: 0, maxPrice: 5, marginPercent: 75 },
    { id: 'rule_2', minPrice: 5.01, maxPrice: 20, marginPercent: 50 },
    { id: 'rule_3', minPrice: 20.01, maxPrice: 50, marginPercent: 40 },
    { id: 'rule_4', minPrice: 50.01, maxPrice: 100, marginPercent: 30 },
    { id: 'rule_5', minPrice: 100.01, maxPrice: 999999, marginPercent: 20 },
  ]);
  const [savingPricingRules, setSavingPricingRules] = useState<boolean>(false);
  const [pricingMsg, setPricingMsg] = useState<{ message: string; success: boolean } | null>(null);

  const fetchPricingRules = async () => {
    try {
      const res = await fetch('/api/admin/pricing-rules');
      const data = await res.json();
      if (data.success && Array.isArray(data.rules) && data.rules.length > 0) {
        setPricingRules(data.rules);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePricingRules = async (applyToProducts: boolean) => {
    setSavingPricingRules(true);
    setPricingMsg(null);
    try {
      const res = await fetch('/api/admin/pricing-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: pricingRules, applyToProducts }),
      });
      const data = await res.json();
      setPricingMsg({
        message: data.message || 'Règles enregistrées.',
        success: data.success,
      });
      if (data.success && applyToProducts) {
        fetchAdminData();
      }
    } catch (e: any) {
      setPricingMsg({ message: e.message || 'Erreur d\'enregistrement', success: false });
    } finally {
      setSavingPricingRules(false);
    }
  };

  const handleAddPricingRule = () => {
    const lastRule = pricingRules[pricingRules.length - 1];
    const newMin = lastRule ? Number((Number(lastRule.maxPrice) + 0.01).toFixed(2)) : 0;
    setPricingRules([
      ...pricingRules,
      {
        id: `rule_${Date.now()}`,
        minPrice: newMin,
        maxPrice: Number((newMin + 50).toFixed(2)),
        marginPercent: 25,
      },
    ]);
  };

  const handleDeletePricingRule = (id: string) => {
    if (pricingRules.length <= 1) {
      alert('Vous devez conserver au moins une règle de marge !');
      return;
    }
    setPricingRules(pricingRules.filter((r) => r.id !== id));
  };

  const handleRuleUpdate = (id: string, field: string, val: number) => {
    setPricingRules(
      pricingRules.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  // Supplier Top-up State
  const [topupSupplierModal, setTopupSupplierModal] = useState<any | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  const handleCopyText = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const getSupplierRechargeInfo = (supplier: any) => {
    if (!supplier) return null;
    const nameLower = (supplier.name || '').toLowerCase();
    const urlLower = (supplier.apiUrl || '').toLowerCase();
    const keyLower = (supplier.apiKey || '').toLowerCase();

    if (nameLower.includes('canboso') || urlLower.includes('canboso')) {
      return {
        title: 'Canboso API',
        botUrl: 'https://t.me/CanbosoBot',
        webUrl: 'https://canboso.com',
        instructions: "Rechargez votre portefeuille Canboso via leur Bot Telegram officiel @CanbosoBot ou sur le site web. Les dépôts USDT / Crypto ou Stars sont crédités en temps réel sur votre clé API.",
        contact: "@CanbosoBot sur Telegram",
      };
    }

    if (nameLower.includes('insight') || urlLower.includes('insight') || keyLower.startsWith('isk_')) {
      return {
        title: 'Insight Store Reseller API',
        botUrl: 'https://t.me/Insightsxstore',
        webUrl: 'https://api.insightxpro.store',
        instructions: "Rechargez votre portefeuille Insight Store via leur Bot Telegram @Insightsxstore (Commande /start -> Developer API & Top Up Wallet). Votre solde API sera crédité instantanément.",
        contact: "@Insightsxstore sur Telegram",
      };
    }

    if (nameLower.includes('hubx') || urlLower.includes('railway') || keyLower.startsWith('rsk_')) {
      return {
        title: 'Hubxstore Reseller API',
        botUrl: 'https://t.me/hubxstore_support',
        webUrl: 'https://open-greeting-glow-production.up.railway.app',
        instructions: "Effectuez votre rechargement de solde revendeur USDT (TRC20 / BEP20) sur la plateforme Hubxstore ou contactez directement l'assistance revendeur.",
        contact: "Support Hubxstore",
      };
    }

    return {
      title: supplier.name || 'Fournisseur API',
      botUrl: null,
      webUrl: supplier.apiUrl,
      instructions: "Rendez-vous sur la plateforme ou la boutique de ce fournisseur pour effectuer un virement/dépôt afin de créditer votre solde API.",
      contact: supplier.apiUrl,
    };
  };

  const fetchPromoCodes = async () => {
    try {
      const res = await fetch('/api/admin/promos');
      const data = await res.json();
      if (data.success) {
        setPromoCodes(data.promos || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim() || !promoDiscountValue) return;

    setSavingPromo(true);
    setPromoMsg(null);

    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCodeInput,
          discountType: promoDiscountType,
          discountValue: parseFloat(promoDiscountValue),
          minPurchaseAmount: parseFloat(promoMinAmount || '0'),
          maxUses: promoMaxUses ? parseInt(promoMaxUses) : null,
          expiresAt: promoExpiresAt || null,
        }),
      });

      const data = await res.json();
      setPromoMsg({
        message: data.message || 'Résultat de la création',
        success: data.success,
      });

      if (data.success) {
        setPromoCodeInput('');
        setPromoDiscountValue('10');
        setPromoMinAmount('0');
        setPromoMaxUses('');
        setPromoExpiresAt('');
        setShowCreatePromoModal(false);
        fetchPromoCodes();
      }
    } catch (e: any) {
      setPromoMsg({ message: e.message || 'Erreur de création', success: false });
    } finally {
      setSavingPromo(false);
    }
  };

  const handleTogglePromoActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentActive }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPromoCodes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce code promo ?')) return;
    try {
      const res = await fetch(`/api/admin/promos?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchPromoCodes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Telegram Bot State
  const [telegramBotToken, setTelegramBotToken] = useState<string>('');
  const [telegramChatId, setTelegramChatId] = useState<string>('');
  const [telegramEnabled, setTelegramEnabled] = useState<boolean>(true);
  const [savingTelegram, setSavingTelegram] = useState<boolean>(false);
  const [sendingTestTelegram, setSendingTestTelegram] = useState<boolean>(false);
  const [telegramMsg, setTelegramMsg] = useState<{ message: string; success: boolean } | null>(null);

  const fetchTelegramConfig = async () => {
    try {
      const res = await fetch('/api/admin/telegram');
      const data = await res.json();
      if (data.success && data.telegram) {
        setTelegramBotToken(data.telegram.botToken || '');
        setTelegramChatId(data.telegram.chatId || '');
        setTelegramEnabled(data.telegram.enabled ?? true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTelegram(true);
    setTelegramMsg(null);
    try {
      const res = await fetch('/api/admin/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: telegramBotToken,
          chatId: telegramChatId,
          enabled: telegramEnabled,
        }),
      });
      const data = await res.json();
      setTelegramMsg({
        message: data.message || 'Paramètres Telegram enregistrés.',
        success: data.success,
      });
    } catch (e: any) {
      setTelegramMsg({ message: e.message || 'Erreur d\'enregistrement', success: false });
    } finally {
      setSavingTelegram(false);
    }
  };

  const handleTestTelegram = async () => {
    setSendingTestTelegram(true);
    setTelegramMsg(null);
    try {
      const res = await fetch('/api/admin/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
        }),
      });
      const data = await res.json();
      setTelegramMsg({
        message: data.message || 'Test de notification effectué.',
        success: data.success,
      });
    } catch (e: any) {
      setTelegramMsg({ message: e.message || 'Erreur lors de l\'envoi du test', success: false });
    } finally {
      setSendingTestTelegram(false);
    }
  };

  const fetchOnlineSimConfig = async () => {
    try {
      const res = await fetch('/api/admin/onlinesim');
      const data = await res.json();
      if (data.success) {
        setOnlineSimApiKey(data.apiKey || '');
        setOnlineSimUserId(data.userId || '');
        setOnlineSimMargin(data.marginPercent || 30);
        if (data.balanceSuccess && data.balance !== undefined) {
          setOnlineSimBalanceState(data.balance);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveOnlineSim = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOnlineSim(true);
    setOnlineSimMsg(null);

    try {
      const res = await fetch('/api/admin/onlinesim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: onlineSimApiKey,
          userId: onlineSimUserId,
          marginPercent: onlineSimMargin,
        }),
      });

      const data = await res.json();
      setOnlineSimMsg({
        message: data.message || 'Configuration OnlineSIM enregistrée !',
        success: data.success,
      });

      if (data.success && data.balance !== undefined) {
        setOnlineSimBalanceState(data.balance);
      }
    } catch (e: any) {
      setOnlineSimMsg({
        message: e.message || 'Erreur lors de la mise à jour',
        success: false,
      });
    } finally {
      setSavingOnlineSim(false);
    }
  };

  const fetchMarketingSettings = async () => {
    try {
      const res = await fetch('/api/admin/marketing');
      const data = await res.json();
      if (data.success && data.marketing) {
        setFacebookPixelId(data.marketing.facebookPixelId || '');
        setTiktokPixelId(data.marketing.tiktokPixelId || '');
        setGoogleAnalyticsId(data.marketing.googleAnalyticsId || '');
        setPromoBannerActive(data.marketing.promoBannerActive ?? true);
        setPromoBannerText(data.marketing.promoBannerText || '');
        setPromoBannerBg(data.marketing.promoBannerBg || 'indigo');
        setPromoBannerLink(data.marketing.promoBannerLink || '/exclusifs');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMarketing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMarketing(true);
    setMarketingSavedMsg(null);
    try {
      const res = await fetch('/api/admin/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facebookPixelId,
          tiktokPixelId,
          googleAnalyticsId,
          promoBannerActive,
          promoBannerText,
          promoBannerBg,
          promoBannerLink,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMarketingSavedMsg('Configuration Marketing & Pixels enregistrée avec succès !');
        setTimeout(() => setMarketingSavedMsg(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingMarketing(false);
    }
  };

  // Support Chat State
  const [supportConversations, setSupportConversations] = useState<any[]>([]);
  const [selectedSupportTicket, setSelectedSupportTicket] = useState<string | null>(null);
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [adminReplyText, setAdminReplyText] = useState<string>('');
  const [sendingAdminReply, setSendingAdminReply] = useState<boolean>(false);
  const [togglingTicketStatus, setTogglingTicketStatus] = useState<boolean>(false);

  // Data states
  const [stats, setStats] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentOtpOrders, setRecentOtpOrders] = useState<any[]>([]);
  const [comparisonMap, setComparisonMap] = useState<Record<string, any[]>>({});
  const [overviewFilter, setOverviewFilter] = useState<'ALL' | 'ORDER' | 'OTP' | 'SUPPORT' | 'REQUEST'>('ALL');
  const [overviewSearch, setOverviewSearch] = useState<string>('');

  // Payment Instructions Config State
  const [paymentInstructions, setPaymentInstructions] = useState<string>('');
  const [savingInstructions, setSavingInstructions] = useState<boolean>(false);
  const [instructionsSavedMessage, setInstructionsSavedMessage] = useState<string | null>(null);

  // Ticket Validation & Cancellation State
  const [validatingTicketId, setValidatingTicketId] = useState<string | null>(null);
  const [cancellingTicketId, setCancellingTicketId] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Product Filters & Sorting State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState<string>('ALL');
  const [productStatusFilter, setProductStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISABLED' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [productSortBy, setProductSortBy] = useState<'NEWEST' | 'OLDEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'MARGIN_DESC' | 'TITLE_ASC' | 'TITLE_DESC'>('NEWEST');

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setImageState: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("L'image est trop volumineuse (maximum 5 Mo). Veuillez choisir une autre image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageState(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Order Filters & Sorting State
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'PENDING_PAYMENT' | 'COMPLETED' | 'CANCELLED' | 'FAILED'>('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [orderSortBy, setOrderSortBy] = useState<'NEWEST' | 'OLDEST' | 'AMOUNT_DESC' | 'AMOUNT_ASC'>('NEWEST');

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editSupplierProductId, setEditSupplierProductId] = useState<string>('');
  const [editImageUrl, setEditImageUrl] = useState<string>('');
  const [savingProduct, setSavingProduct] = useState<boolean>(false);

  // Add Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [newProdTitle, setNewProdTitle] = useState<string>('');
  const [newProdCategory, setNewProdCategory] = useState<string>('IA & APIs');
  const [newProdDescription, setNewProdDescription] = useState<string>('');
  const [newProdPrice, setNewProdPrice] = useState<number>(10);
  const [newProdBadge, setNewProdBadge] = useState<string>('');
  const [newProdImageUrl, setNewProdImageUrl] = useState<string>('');
  const [creatingProduct, setCreatingProduct] = useState<boolean>(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Add Supplier Modal State
  const [showAddSupplierModal, setShowAddSupplierModal] = useState<boolean>(false);
  const [newSupplierName, setNewSupplierName] = useState<string>('');
  const [newSupplierType, setNewSupplierType] = useState<string>('canboso');
  const [newSupplierUrl, setNewSupplierUrl] = useState<string>('');
  const [newSupplierKey, setNewSupplierKey] = useState<string>('');
  const [addingSupplier, setAddingSupplier] = useState<boolean>(false);

  // Testing Supplier state
  const [testingSupplierId, setTestingSupplierId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; message: string; success: boolean } | null>(null);

  const checkAuth = async () => {
    setCheckingAuth(true);
    try {
      const res = await fetch('/api/admin/auth');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        fetchAdminData();
        fetchPaymentInstructions();
        fetchOnlineSimConfig();
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error(e);
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setAdminPassword('');
        fetchAdminData();
        fetchPaymentInstructions();
      } else {
        setAuthError(data.message || 'Mot de passe incorrect');
      }
    } catch (e: any) {
      setAuthError(e.message || 'Erreur lors de la connexion');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeMessage(null);

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeMessage({
        message: 'Les nouveaux mots de passe ne correspondent pas !',
        success: false,
      });
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPasswordInput,
          newPassword: newPasswordInput,
        }),
      });

      const data = await res.json();
      setPasswordChangeMessage({
        message: data.message,
        success: data.success,
      });

      if (data.success) {
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
      }
    } catch (e: any) {
      setPasswordChangeMessage({
        message: e.message || 'Erreur lors de la modification',
        success: false,
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPaymentInstructions = async () => {
    try {
      const res = await fetch('/api/admin/payment-instructions');
      const data = await res.json();
      if (data.success) {
        setPaymentInstructions(data.instructions);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePaymentInstructions = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInstructions(true);
    setInstructionsSavedMessage(null);

    try {
      const res = await fetch('/api/admin/payment-instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructions: paymentInstructions }),
      });
      const data = await res.json();
      if (data.success) {
        setInstructionsSavedMessage('Instructions enregistrées et publiées pour les clients !');
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setSavingInstructions(false);
    }
  };

  useEffect(() => {
    setFcfaRateInput(fcfaRate);
  }, [fcfaRate]);

  const handleSaveCurrencySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCurrency(true);
    setCurrencySavedMsg(null);
    try {
      await updateFcfaRate(fcfaRateInput);
      setCurrencySavedMsg('Taux de conversion FCFA mis à jour et appliqué à toute la plateforme !');
    } catch (e: any) {
      console.error(e);
    } finally {
      setSavingCurrency(false);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
        setRecentOrders(statsData.recentOrders || []);
        setRecentOtpOrders(statsData.recentOtpOrders || []);
      }

      const prodRes = await fetch('/api/products?admin=true');
      const prodData = await prodRes.json();
      if (prodData.success) {
        setProducts(prodData.products || []);
      }

      const suppRes = await fetch('/api/suppliers');
      const suppData = await suppRes.json();
      if (suppData.success) {
        setSuppliers(suppData.suppliers || []);
      }

      const compRes = await fetch('/api/admin/comparison');
      const compData = await compRes.json();
      if (compData.success) {
        setComparisonMap(compData.comparisons || {});
      }

      fetchProductRequests();
      fetchMarketingSettings();
      fetchPromoCodes();
      fetchTelegramConfig();
      fetchPricingRules();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductRequests = async () => {
    try {
      const res = await fetch('/api/product-requests');
      const data = await res.json();
      if (data.success) {
        setProductRequests(data.requests || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProductRequestStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/product-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchProductRequests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProductRequest = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) return;
    try {
      const res = await fetch(`/api/product-requests?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchProductRequests();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSupportConversations = async () => {
    try {
      const res = await fetch('/api/support/messages?admin=true');
      const data = await res.json();
      if (data.success) {
        setSupportConversations(data.conversations || []);
        if (!selectedSupportTicket && data.conversations.length > 0) {
          setSelectedSupportTicket(data.conversations[0].ticketCode);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSupportMessages = async (ticketCode: string) => {
    try {
      const res = await fetch(`/api/support/messages?ticketCode=${encodeURIComponent(ticketCode)}`);
      const data = await res.json();
      if (data.success) {
        setSupportMessages(data.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !selectedSupportTicket || sendingAdminReply) return;

    const text = adminReplyText.trim();
    setAdminReplyText('');
    setSendingAdminReply(true);

    try {
      const res = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketCode: selectedSupportTicket,
          text,
          sender: 'ADMIN',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSupportMessages((prev) => [...prev, data.message]);
        fetchSupportConversations();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingAdminReply(false);
    }
  };

  const handleToggleTicketSupportStatus = async (ticketCode: string, currentStatus: string) => {
    if (!ticketCode || togglingTicketStatus) return;
    setTogglingTicketStatus(true);
    try {
      const action = currentStatus === 'RESOLVED' ? 'reopen' : 'close';
      const res = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketCode,
          action,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchSupportMessages(ticketCode);
        fetchSupportConversations();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingTicketStatus(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === 'support' && isAuthenticated) {
      fetchSupportConversations();
      if (selectedSupportTicket) {
        fetchSupportMessages(selectedSupportTicket);
      }
      interval = setInterval(() => {
        fetchSupportConversations();
        if (selectedSupportTicket) {
          fetchSupportMessages(selectedSupportTicket);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeTab, isAuthenticated, selectedSupportTicket]);

  const handleValidateTicket = async (orderId: string) => {
    setValidatingTicketId(orderId);

    try {
      const res = await fetch('/api/admin/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setValidatingTicketId(null);
    }
  };

  const handleCancelTicket = async (orderId: string) => {
    const reason = prompt(
      "Motif de l'annulation (ex: Paiement non reçu, montant incorrect) :",
      "Paiement non reçu ou invalidé"
    );
    if (reason === null) return; // user cancelled prompt

    setCancellingTicketId(orderId);
    try {
      const res = await fetch('/api/admin/tickets/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, reason: reason.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setCancellingTicketId(null);
    }
  };

  const handleValidateOtpTicket = async (orderId: string) => {
    setValidatingTicketId(orderId);

    try {
      const res = await fetch('/api/admin/otp/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (data.success) {
        fetchAdminData();
        fetchOnlineSimConfig();
      } else {
        alert(data.message || 'Erreur lors de la validation du ticket OTP');
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Erreur lors de la validation');
    } finally {
      setValidatingTicketId(null);
    }
  };

  const handleCancelOtpTicket = async (orderId: string) => {
    const reason = prompt(
      "Motif de l'annulation du ticket OTP (ex: Paiement non reçu) :",
      "Paiement non reçu ou invalidé"
    );
    if (reason === null) return; // user cancelled prompt

    setCancellingTicketId(orderId);
    try {
      const res = await fetch('/api/admin/otp/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, reason: reason.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      } else {
        alert(data.message || 'Erreur lors de l\'annulation');
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Erreur lors de l\'annulation');
    } finally {
      setCancellingTicketId(null);
    }
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle.trim() || newProdPrice <= 0 || creatingProduct) return;

    setCreatingProduct(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProdTitle.trim(),
          category: newProdCategory,
          description: newProdDescription.trim(),
          sellingPrice: newProdPrice,
          badge: newProdBadge.trim(),
          imageUrl: newProdImageUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddProductModal(false);
        setNewProdTitle('');
        setNewProdDescription('');
        setNewProdPrice(10);
        setNewProdBadge('');
        setNewProdImageUrl('');
        fetchAdminData();
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit du catalogue ?')) return;

    setDeletingProductId(productId);
    try {
      const res = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleSyncCatalog = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/suppliers/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncMessage(data.message);
        fetchAdminData();
      } else {
        setSyncMessage(`Erreur de synchronisation: ${data.message}`);
      }
    } catch (e: any) {
      setSyncMessage(`Erreur réseau: ${e.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleProductStatus = async (product: any) => {
    try {
      const newStatus = !product.isActive;
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, isActive: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, isActive: newStatus } : p))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSupplierStatus = async (supplier: any) => {
    try {
      const newStatus = !supplier.isActive;
      const res = await fetch('/api/suppliers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: supplier.id, isActive: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSuppliers((prev) =>
          prev.map((s) => (s.id === supplier.id ? { ...s, isActive: newStatus } : s))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEditProduct = (product: any) => {
    setEditingProduct(product);
    setEditPrice(product.sellingPrice);
    setEditIsActive(product.isActive);
    setEditSupplierProductId(product.activeSupplierProduct?.id || '');
    setEditImageUrl(product.imageUrl || '');
  };

  const handleSaveProductEdit = async () => {
    if (!editingProduct) return;
    setSavingProduct(true);

    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct.id,
          sellingPrice: editPrice,
          isActive: editIsActive,
          imageUrl: editImageUrl.trim() || undefined,
          activeSupplierProductId: editSupplierProductId || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingProduct(null);
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingSupplier(true);

    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSupplierName,
          type: newSupplierType,
          apiUrl: newSupplierUrl,
          apiKey: newSupplierKey,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddSupplierModal(false);
        setNewSupplierName('');
        setNewSupplierUrl('');
        setNewSupplierKey('');
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingSupplier(false);
    }
  };

  const handleTestSupplier = async (supplierId: string) => {
    setTestingSupplierId(supplierId);
    setTestResult(null);

    try {
      const res = await fetch('/api/suppliers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId }),
      });

      const data = await res.json();
      setTestResult({
        id: supplierId,
        message: data.message,
        success: data.success,
      });
      fetchAdminData();
    } catch (e: any) {
      setTestResult({
        id: supplierId,
        message: e.message || 'Échec du test de connexion',
        success: false,
      });
    } finally {
      setTestingSupplierId(null);
    }
  };

  const productCounts = {
    all: products.length,
    active: products.filter((p) => p.isActive).length,
    disabled: products.filter((p) => !p.isActive).length,
    inStock: products.filter((p) => p.stock > 0).length,
    outOfStock: products.filter((p) => p.stock <= 0).length,
  };

  const filteredAndSortedProducts = products
    .filter((p) => {
      if (productStatusFilter === 'ACTIVE' && !p.isActive) return false;
      if (productStatusFilter === 'DISABLED' && p.isActive) return false;
      if (productStatusFilter === 'IN_STOCK' && p.stock <= 0) return false;
      if (productStatusFilter === 'OUT_OF_STOCK' && p.stock > 0) return false;

      if (selectedCategory !== 'Tous' && p.category !== selectedCategory) return false;

      if (selectedSupplierFilter !== 'ALL') {
        if (selectedSupplierFilter === 'MANUAL') {
          if (p.activeSupplierId || p.activeSupplier) return false;
        } else {
          const suppId = p.activeSupplierId || p.activeSupplier?.id;
          if (suppId !== selectedSupplierFilter) return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        const catMatch = (p.category || '').toLowerCase().includes(q);
        const suppMatch = (p.activeSupplier?.name || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !catMatch && !suppMatch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (productSortBy === 'NEWEST') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (productSortBy === 'OLDEST') {
        return new Date(a.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (productSortBy === 'PRICE_ASC') {
        return a.sellingPrice - b.sellingPrice;
      }
      if (productSortBy === 'PRICE_DESC') {
        return b.sellingPrice - a.sellingPrice;
      }
      if (productSortBy === 'MARGIN_DESC') {
        const marginA = a.profitMargin !== undefined ? a.profitMargin : a.sellingPrice;
        const marginB = b.profitMargin !== undefined ? b.profitMargin : b.sellingPrice;
        return marginB - marginA;
      }
      if (productSortBy === 'TITLE_ASC') {
        return a.title.localeCompare(b.title);
      }
      if (productSortBy === 'TITLE_DESC') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });


  const orderCounts = {
    all: recentOrders.length,
    pending: recentOrders.filter((o) => o.status === 'PENDING_PAYMENT').length,
    completed: recentOrders.filter((o) => o.status === 'COMPLETED').length,
    cancelled: recentOrders.filter((o) => o.status === 'CANCELLED').length,
    failed: recentOrders.filter((o) => o.status !== 'PENDING_PAYMENT' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length,
  };

  const filteredAndSortedOrders = recentOrders
    .filter((ord) => {
      if (orderStatusFilter !== 'ALL') {
        if (orderStatusFilter === 'FAILED') {
          if (ord.status === 'PENDING_PAYMENT' || ord.status === 'COMPLETED' || ord.status === 'CANCELLED') return false;
        } else if (ord.status !== orderStatusFilter) {
          return false;
        }
      }

      if (orderSearchQuery.trim()) {
        const query = orderSearchQuery.trim().toLowerCase();
        const ticketMatch = (ord.ticketCode || '').toLowerCase().includes(query);
        const titleMatch = (ord.productTitle || '').toLowerCase().includes(query);
        const idMatch = (ord.id || '').toLowerCase().includes(query);
        if (!ticketMatch && !titleMatch && !idMatch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (orderSortBy === 'NEWEST') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (orderSortBy === 'OLDEST') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (orderSortBy === 'AMOUNT_DESC') {
        return b.totalAmount - a.totalAmount;
      }
      if (orderSortBy === 'AMOUNT_ASC') {
        return a.totalAmount - b.totalAmount;
      }
      return 0;
    });

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <RefreshCcw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Vérification des accès administrateur...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-lg shadow-indigo-500/20">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-white">Espace Administrateur Sécurisé</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Veuillez saisir votre mot de passe administrateur pour accéder à la console de gestion.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                  Mot de Passe Admin
                </label>
                <input
                  type="password"
                  required
                  placeholder="Mot de passe secret"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
              >
                {loggingIn ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Accéder à la Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  const pendingTicketsCount = recentOrders.filter(
    (o) => o.status === 'PENDING_PAYMENT'
  ).length;

  interface MenuItem {
    id: string;
    label: string;
    icon: any;
    description: string;
    badge?: string | null;
    badgeColor?: string | null;
  }

  const menuGroups: { title: string; items: MenuItem[] }[] = [
    {
      title: 'PILOTAGE',
      items: [
        {
          id: 'overview',
          label: "Vue d'Ensemble",
          icon: TrendingUp,
          description: 'Aperçu & statistiques',
          badge: null,
          badgeColor: null,
        },
      ],
    },
    {
      title: 'VENTES & CLIENTS',
      items: [
        {
          id: 'tickets',
          label: 'Commandes & Tickets',
          icon: Ticket,
          badge: pendingTicketsCount > 0 ? `${pendingTicketsCount} à valider` : null,
          badgeColor: 'amber',
          description: 'Validation des paiements',
        },
        {
          id: 'support',
          label: 'Messages Support',
          icon: MessageSquare,
          badge: supportConversations.length > 0 ? `${supportConversations.length}` : null,
          badgeColor: 'sky',
          description: 'Assistance live clients',
        },
        {
          id: 'product_requests',
          label: 'Demandes Clients',
          icon: Send,
          badge: productRequests.filter((r) => r.status === 'PENDING').length > 0
            ? `${productRequests.filter((r) => r.status === 'PENDING').length} nouvelle(s)`
            : null,
          badgeColor: 'emerald',
          description: 'Demandes sur-mesure',
        },
        {
          id: 'promos',
          label: 'Codes Promo & Coupons',
          icon: Tag,
          badge: promoCodes.filter((p) => p.isActive).length > 0 ? `${promoCodes.filter((p) => p.isActive).length} actif(s)` : null,
          badgeColor: 'emerald',
          description: 'Réductions en % ou FCFA/USD',
        },
      ],
    },
    {
      title: 'PRODUITS & FOURNISSEURS',
      items: [
        {
          id: 'manual_products',
          label: 'Produits Exclusifs & Manuels',
          icon: Sparkles,
          description: 'Catalogue d\'offres avec images',
          badge: products.filter((p) => !p.activeSupplierProduct).length > 0
            ? `${products.filter((p) => !p.activeSupplierProduct).length}`
            : null,
          badgeColor: 'emerald',
        },
        {
          id: 'products',
          label: 'Catalogue Global & Prix',
          icon: Package,
          description: 'Prix de vente & stock fournisseurs',
          badge: null,
          badgeColor: null,
        },
        {
          id: 'suppliers',
          label: 'Fournisseurs & APIs',
          icon: Activity,
          description: 'Clés Canboso & solde',
          badge: null,
          badgeColor: null,
        },
        {
          id: 'comparison',
          label: 'Matrice Comparative',
          icon: Sliders,
          description: "Comparateur d'offres",
          badge: null,
          badgeColor: null,
        },
        {
          id: 'pricing_rules',
          label: 'Marges & Tarification',
          icon: Percent,
          description: 'Marge % par tranche de prix',
          badge: `${pricingRules.length} tranche(s)`,
          badgeColor: 'indigo',
        },
      ],
    },
    {
      title: 'CONFIGURATION',
      items: [
        {
          id: 'payment_config',
          label: 'Instructions Paiement',
          icon: FileText,
          description: 'Mobile Money & IBAN',
          badge: null,
          badgeColor: null,
        },
        {
          id: 'themes',
          label: 'Thèmes Visuels',
          icon: Palette,
          description: 'Apparence boutique',
          badge: null,
          badgeColor: null,
        },
        {
          id: 'onlinesim',
          label: 'OnlineSIM & OTP',
          icon: Smartphone,
          description: 'Clé API, Solde & Marge %',
          badge: onlineSimBalance !== null ? `$${onlineSimBalance.toFixed(2)}` : 'OnlineSIM',
          badgeColor: 'sky',
        },
        {
          id: 'marketing',
          label: 'Marketing & Analytics',
          icon: Zap,
          description: 'Pixel Meta, TikTok, Google & Bandeau',
          badge: 'Nouveau',
          badgeColor: 'purple',
        },
        {
          id: 'telegram',
          label: 'Bot Telegram & Alertes',
          icon: Bell,
          description: 'Notifications & Validation 1-Clic',
          badge: telegramEnabled ? 'Actif' : 'Inactif',
          badgeColor: telegramEnabled ? 'emerald' : 'slate',
        },
        {
          id: 'settings',
          label: 'Sécurité & Devises',
          icon: KeyRound,
          description: 'Mot de passe & FCFA',
          badge: null,
          badgeColor: null,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Admin Top Header */}
      <section className="border-b border-slate-800/80 glass-panel py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 border border-indigo-500/30 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white">Console d'Administration</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  SESSION ACCORDÉE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Validez les tickets de paiement, fixez vos prix de vente et gérez les clés API fournisseurs.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSyncCatalog}
              disabled={syncing}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Synchronisation...' : 'Synchroniser Catalogue'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-rose-400 hover:text-rose-300 font-bold text-xs flex items-center space-x-1.5 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Sync Notification Banner */}
        {syncMessage && (
          <div className="max-w-7xl mx-auto mt-4 px-4 py-2.5 rounded-2xl bg-slate-900 border border-sky-500/30 text-sky-300 text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-sky-400" />
              <span>{syncMessage}</span>
            </div>
            <button onClick={() => setSyncMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* Main Admin Body with Categorized Sidebar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR NAVIGATION (3 cols) */}
          <aside className="lg:col-span-3 space-y-6">
            
            {/* Mobile Category Select */}
            <div className="lg:hidden glass-panel p-3.5 rounded-2xl border border-slate-800">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                Module de Gestion:
              </label>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
              >
                {menuGroups.flatMap((group) =>
                  group.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {group.title} → {item.label}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Desktop Navigation Sidebar */}
            <div className="hidden lg:block glass-panel rounded-3xl border border-slate-800/80 p-4 space-y-6 shadow-xl sticky top-24">
              {menuGroups.map((group, idx) => (
                <div key={group.title} className={idx > 0 ? 'pt-4 border-t border-slate-850' : ''}>
                  <h3 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
                    {group.title}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id as any)}
                          className={`w-full px-3 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all group ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center space-x-3 truncate">
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                                isActive
                                  ? 'bg-white/15 text-white'
                                  : 'bg-slate-900 text-slate-400 group-hover:text-white group-hover:bg-slate-800'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex flex-col text-left truncate">
                              <span className="font-extrabold truncate leading-tight">
                                {item.label}
                              </span>
                              <span
                                className={`text-[10px] font-normal truncate ${
                                  isActive ? 'text-indigo-100 opacity-90' : 'text-slate-500'
                                }`}
                              >
                                {item.description}
                              </span>
                            </div>
                          </div>

                          {item.badge && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                                item.badgeColor === 'amber'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* RIGHT CONTENT AREA (9 cols) */}
          <div className="lg:col-span-9 space-y-6">
        
        {/* TAB 1: TICKETS VALIDATION & ORDERS */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <Ticket className="w-5 h-5 text-sky-400" />
                  <span>Gestion & Validation des Tickets de Commande</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Filtrez et triez les commandes clients. Validez ou annulez les tickets en 1 clic.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400">
                  Affichage de <strong className="text-white">{filteredAndSortedOrders.length}</strong> sur <strong className="text-white">{recentOrders.length}</strong> tickets
                </span>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="glass-panel p-4 rounded-3xl border border-slate-800/80 space-y-3.5 shadow-xl">
              
              {/* Row 1: Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'ALL', label: 'Tous les tickets', count: orderCounts.all, color: 'bg-slate-800 text-white' },
                  { key: 'PENDING_PAYMENT', label: '⏳ En attente', count: orderCounts.pending, color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
                  { key: 'COMPLETED', label: '✅ Livrés', count: orderCounts.completed, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
                  { key: 'CANCELLED', label: '🚫 Refusés / Annulés', count: orderCounts.cancelled, color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
                  { key: 'FAILED', label: '⚠️ Échoués API', count: orderCounts.failed, color: 'bg-red-500/20 text-red-300 border-red-500/40' },
                ].map((st) => {
                  const isActive = orderStatusFilter === st.key;
                  return (
                    <button
                      key={st.key}
                      onClick={() => setOrderStatusFilter(st.key as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border ${
                        isActive
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-sky-400 shadow-md shadow-sky-500/20'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <span>{st.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {st.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Row 2: Search & Sort inputs */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher par Code Ticket (ex: TK-XXXXXX) ou Produit..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  {orderSearchQuery && (
                    <button
                      onClick={() => setOrderSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Trier par:</span>
                  <select
                    value={orderSortBy}
                    onChange={(e) => setOrderSortBy(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-sky-500"
                  >
                    <option value="NEWEST">📅 Plus récents (Date ↓)</option>
                    <option value="OLDEST">📅 Plus anciens (Date ↑)</option>
                    <option value="AMOUNT_DESC">💲 Montant élevé (Prix ↓)</option>
                    <option value="AMOUNT_ASC">💲 Montant bas (Prix ↑)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-4">Code Ticket</th>
                      <th className="px-5 py-4">Produit Commandé</th>
                      <th className="px-5 py-4 text-center">Quantité</th>
                      <th className="px-5 py-4 text-right">Montant Vente ($)</th>
                      <th className="px-5 py-4 text-center">Statut Paiement</th>
                      <th className="px-5 py-4 text-center">Action Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredAndSortedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-500">
                          {orderSearchQuery || orderStatusFilter !== 'ALL'
                            ? 'Aucun ticket ne correspond à vos filtres de recherche.'
                            : 'Aucun ticket de commande enregistré.'}
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedOrders.map((ord) => {
                        const isPending = ord.status === 'PENDING_PAYMENT';
                        const isCompleted = ord.status === 'COMPLETED';
                        const isCancelled = ord.status === 'CANCELLED';

                        return (
                          <tr key={ord.id} className="hover:bg-slate-900/70 transition-colors">
                            <td className="px-5 py-4">
                              <span className="font-mono font-black text-sky-400 text-sm bg-sky-500/10 px-2.5 py-1 rounded-xl border border-sky-500/20">
                                {ord.ticketCode || `TK-${ord.id.slice(-6)}`}
                              </span>
                              <span className="text-[10px] text-slate-500 block mt-1">
                                {new Date(ord.createdAt).toLocaleString('fr-FR')}
                              </span>
                            </td>

                            <td className="px-5 py-4 max-w-xs">
                              <div className="font-extrabold text-white text-xs leading-snug">{ord.productTitle}</div>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Fournisseur: {ord.supplier?.name || 'Canboso API'}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-center font-bold">
                              {ord.quantity}
                            </td>

                            <td className="px-5 py-4 text-right font-mono font-black text-emerald-400 text-sm">
                              ${ord.totalAmount.toFixed(2)}
                            </td>

                            <td className="px-5 py-4 text-center">
                              {isPending ? (
                                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center space-x-1 justify-center">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>EN ATTENTE DE PAIEMENT</span>
                                </span>
                              ) : isCompleted ? (
                                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1 justify-center">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>PAYÉ & LIVRÉ</span>
                                </span>
                              ) : isCancelled ? (
                                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center space-x-1 justify-center">
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>REFUSÉ / ANNULÉ</span>
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center space-x-1 justify-center">
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>ÉCHOUÉ</span>
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-4 text-center">
                              {isPending ? (
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    onClick={() => handleValidateTicket(ord.id)}
                                    disabled={validatingTicketId === ord.id || cancellingTicketId === ord.id}
                                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center space-x-1 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                                  >
                                    {validatingTicketId === ord.id ? (
                                      <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <>
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                        <span>Valider & Commander</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleCancelTicket(ord.id)}
                                    disabled={validatingTicketId === ord.id || cancellingTicketId === ord.id}
                                    className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center space-x-1 transition-all disabled:opacity-50"
                                    title="Refuser ou annuler le ticket"
                                  >
                                    {cancellingTicketId === ord.id ? (
                                      <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <>
                                        <X className="w-3.5 h-3.5" />
                                        <span>Annuler</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              ) : isCompleted ? (
                                <span className="text-[11px] text-slate-500 font-bold">Livré au client</span>
                              ) : isCancelled ? (
                                <span className="text-[11px] text-rose-400/80 font-bold">Ticket Annulé</span>
                              ) : (
                                <button
                                  onClick={() => handleCancelTicket(ord.id)}
                                  className="text-[11px] text-slate-400 hover:text-rose-400 underline font-bold"
                                >
                                  Refuser
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB SUPPORT: MESSAGES SUPPORT CLIENT */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                <span>Messagerie Support & Assistance Clients</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Répondez en direct aux questions des acheteurs qui ont initié une discussion avec leur code de ticket.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px] glass-panel rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
              
              {/* Left Column: Conversations List (4 cols) */}
              <div className="lg:col-span-4 border-r border-slate-800 flex flex-col bg-slate-950/60">
                <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Headphones className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Conversations ({supportConversations.length})
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-850 scrollbar-thin">
                  {supportConversations.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-400" />
                      <span>Aucune conversation active pour le moment.</span>
                    </div>
                  ) : (
                    supportConversations.map((conv) => {
                      const isSelected = selectedSupportTicket === conv.ticketCode;
                      return (
                        <button
                          key={conv.ticketCode}
                          onClick={() => {
                            setSelectedSupportTicket(conv.ticketCode);
                            fetchSupportMessages(conv.ticketCode);
                          }}
                          className={`w-full p-4 text-left transition-all flex flex-col space-y-1.5 ${
                            isSelected
                              ? 'bg-indigo-500/15 border-l-4 border-indigo-500 text-white'
                              : 'hover:bg-slate-900/60 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono font-black text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                                {conv.ticketCode}
                              </span>
                              {conv.supportStatus === 'RESOLVED' && (
                                <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center space-x-1">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>Résolu</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500">
                              {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>

                          <div className="font-extrabold text-xs text-white truncate">
                            {conv.productTitle}
                          </div>

                          <p className="text-[11px] text-slate-400 truncate">
                            {conv.lastMessage ? (
                              <span>
                                {conv.lastMessage.sender === 'ADMIN' ? 'Vous : ' : 'Client : '}
                                {conv.lastMessage.text}
                              </span>
                            ) : (
                              <span className="italic text-slate-500">Pas encore de message</span>
                            )}
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Chat Feed & Response (8 cols) */}
              <div className="lg:col-span-8 flex flex-col bg-slate-900/40">
                {selectedSupportTicket ? (
                  <>
                    {/* Active Conversation Header */}
                    {(() => {
                      const currentConv = supportConversations.find(c => c.ticketCode === selectedSupportTicket);
                      const isTicketResolved = currentConv?.supportStatus === 'RESOLVED';

                      return (
                        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-black text-sm text-sky-400">
                                Ticket : {selectedSupportTicket}
                              </span>
                              {isTicketResolved ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Résolu</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>En cours</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Produit : {currentConv?.productTitle || ''}
                            </p>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-800 text-indigo-300 border border-slate-700">
                              Commande : {currentConv?.status || 'PENDING'}
                            </span>

                            <button
                              onClick={() => handleToggleTicketSupportStatus(selectedSupportTicket, currentConv?.supportStatus || 'OPEN')}
                              disabled={togglingTicketStatus}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md ${
                                isTicketResolved
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                              }`}
                            >
                              {togglingTicketStatus ? (
                                <RefreshCcw className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>{isTicketResolved ? 'Rouvrir le Ticket' : 'Fermer le Ticket (Résolu)'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Messages Area */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin bg-slate-950/40">
                      {supportMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                          <MessageSquare className="w-10 h-10 mb-2 opacity-30 text-indigo-400" />
                          <p className="text-xs font-semibold text-slate-400">
                            Le client s'est connecté à ce ticket.
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Envoyez un message ci-dessous pour démarrer l'assistance.
                          </p>
                        </div>
                      ) : (
                        supportMessages.map((msg) => {
                          const isAdmin = msg.sender === 'ADMIN';
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                            >
                              <div className="flex items-center space-x-1.5 mb-1 px-1">
                                <span className="text-[10px] font-extrabold uppercase text-slate-400">
                                  {isAdmin ? '🛡️ Vous (Admin)' : '👤 Client Acheteur'}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  • {new Date(msg.createdAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <div
                                className={`max-w-[75%] px-4 py-3 rounded-2xl text-xs font-medium leading-relaxed shadow-md ${
                                  isAdmin
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                                    : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                                }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Reply Input Form */}
                    <form
                      onSubmit={handleSendAdminReply}
                      className="p-4 bg-slate-900 border-t border-slate-800 flex items-center space-x-3"
                    >
                      <input
                        type="text"
                        placeholder="Répondre au client en tant qu'Administrateur..."
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                      />
                      <button
                        type="submit"
                        disabled={sendingAdminReply || !adminReplyText.trim()}
                        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center space-x-2 transition-all"
                      >
                        {sendingAdminReply ? (
                          <RefreshCcw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Envoyer Réponse</span>
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                    Sélectionnez une conversation dans la liste pour voir les messages.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CATALOG & PRICING */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Filter Pills Header */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setProductStatusFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  productStatusFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>Tous les produits</span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px] font-black">
                  {productCounts.all}
                </span>
              </button>

              <button
                onClick={() => setProductStatusFilter('ACTIVE')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  productStatusFilter === 'ACTIVE'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Actifs</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px] font-black">
                  {productCounts.active}
                </span>
              </button>

              <button
                onClick={() => setProductStatusFilter('DISABLED')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  productStatusFilter === 'DISABLED'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>Désactivés</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px] font-black">
                  {productCounts.disabled}
                </span>
              </button>

              <button
                onClick={() => setProductStatusFilter('IN_STOCK')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  productStatusFilter === 'IN_STOCK'
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>📦 En stock</span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px] font-black">
                  {productCounts.inStock}
                </span>
              </button>

              <button
                onClick={() => setProductStatusFilter('OUT_OF_STOCK')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  productStatusFilter === 'OUT_OF_STOCK'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>⚠️ Rupture</span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px] font-black">
                  {productCounts.outOfStock}
                </span>
              </button>
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800/80">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Catégorie:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3.5 py-2 font-bold focus:outline-none focus:border-indigo-500"
                  >
                    {['Tous', 'IA & APIs', 'Licences & Outils Dev', 'Mobile & Services', 'Abonnements & Comptes'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Fournisseur:</span>
                  <select
                    value={selectedSupplierFilter}
                    onChange={(e) => setSelectedSupplierFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3.5 py-2 font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">Tous les fournisseurs</option>
                    <option value="MANUAL">Vente Manuelle (Sans API)</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Trier:</span>
                  <select
                    value={productSortBy}
                    onChange={(e) => setProductSortBy(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3.5 py-2 font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="NEWEST">Plus récents</option>
                    <option value="OLDEST">Plus anciens</option>
                    <option value="PRICE_ASC">Prix: Croissant</option>
                    <option value="PRICE_DESC">Prix: Décroissant</option>
                    <option value="MARGIN_DESC">Marge: Plus élevée</option>
                    <option value="TITLE_ASC">Titre: A-Z</option>
                    <option value="TITLE_DESC">Titre: Z-A</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Ajouter un Produit Manuel</span>
                </button>
              </div>

              <div className="relative w-full lg:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher titre, desc, fournisseur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="glass-panel rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-4">Statut</th>
                      <th className="px-5 py-4">Produit & Catégorie</th>
                      <th className="px-5 py-4">Fournisseur Actif</th>
                      <th className="px-5 py-4 text-right">Prix Grossiste</th>
                      <th className="px-5 py-4 text-right">Prix Vente Final</th>
                      <th className="px-5 py-4 text-right">Marge Nette ($ / %)</th>
                      <th className="px-5 py-4 text-center">Stock</th>
                      <th className="px-5 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredAndSortedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-8 text-center text-slate-500 font-bold">
                          Aucun produit trouvé avec ces critères de filtrage.
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedProducts.map((p) => {
                        const suppName = p.activeSupplier?.name || 'Vente Manuelle';
                        const isSuppActive = p.activeSupplier ? p.activeSupplier.isActive : true;

                        return (
                          <tr key={p.id} className="hover:bg-slate-900/70 transition-colors">
                            <td className="px-5 py-4">
                              <button
                                onClick={() => handleToggleProductStatus(p)}
                                title={p.isActive ? 'Désactiver le produit' : 'Activer le produit'}
                                className="focus:outline-none"
                              >
                                {p.isActive ? (
                                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-extrabold border border-emerald-500/30 flex items-center space-x-1.5">
                                    <ToggleRight className="w-4 h-4 text-emerald-400" />
                                    <span>ACTIF</span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400 font-extrabold border border-rose-500/30 flex items-center space-x-1.5">
                                    <ToggleLeft className="w-4 h-4 text-rose-400" />
                                    <span>DÉSACTIVÉ</span>
                                  </span>
                                )}
                              </button>
                            </td>

                            <td className="px-5 py-4 max-w-xs">
                              <div className="flex items-center space-x-3">
                                {p.imageUrl ? (
                                  <img src={p.imageUrl} alt={p.title} className="w-8 h-8 rounded-lg object-cover border border-slate-700 bg-slate-950 flex-shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs flex-shrink-0">
                                    📦
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-extrabold text-white text-xs leading-snug truncate">{p.title}</div>
                                  <div className="flex items-center space-x-1.5 mt-0.5">
                                    <span className="text-[10px] text-slate-400 font-bold">{p.category}</span>
                                    {p.badge && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                        {p.badge}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-sky-400">{suppName}</span>
                                <span className={`w-2 h-2 rounded-full ${isSuppActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                              </div>
                            </td>

                            <td className="px-5 py-4 text-right font-mono font-medium text-slate-400">
                              ${p.costPrice ? p.costPrice.toFixed(2) : '0.00'}
                            </td>

                            <td className="px-5 py-4 text-right">
                              <span className="font-mono font-black text-emerald-400 text-sm bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                                ${p.sellingPrice.toFixed(2)}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <div className="font-mono font-black text-indigo-300">
                                +${p.profitMargin ? p.profitMargin.toFixed(2) : p.sellingPrice.toFixed(2)}
                              </div>
                              <span className="text-[10px] text-slate-500 font-bold block">
                                (+{p.profitMarginPercent || '100'}%)
                              </span>
                            </td>

                            <td className="px-5 py-4 text-center font-bold">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] ${p.stock > 0 ? 'bg-slate-800 text-slate-300' : 'bg-rose-500/15 text-rose-400'}`}>
                                {p.stock}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  title="Modifier le prix ou les details"
                                  className="p-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  disabled={deletingProductId === p.id}
                                  title="Supprimer ce produit"
                                  className="p-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors disabled:opacity-50"
                                >
                                  {deletingProductId === p.id ? (
                                    <RefreshCcw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <X className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}

                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ADMIN SETTINGS & CURRENCY CONFIG */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Currency & Exchange Rate Config */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5">
              <div>
                <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <span>Devises & Taux de Conversion FCFA</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Définissez le taux de conversion FCFA pour 1 Dollar ($ USD). Tous les prix de la plateforme s'adapteront automatiquement.
                </p>
              </div>

              {currencySavedMsg && (
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{currencySavedMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveCurrencySettings} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Taux d'Échange FCFA pour $1.00 USD
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-amber-400 text-sm">FCFA</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={fcfaRateInput}
                      onChange={(e) => setFcfaRateInput(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-16 pr-4 py-3 text-sm font-extrabold text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Exemple: 650 FCFA signifie que $10.00 USD sera affiché à 6 500 FCFA.
                  </span>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Aperçu de Conversion Live:
                  </span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">$1.00 USD =</span>
                    <span className="font-extrabold text-amber-400">{fcfaRateInput.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">$10.00 USD =</span>
                    <span className="font-extrabold text-emerald-400">{(fcfaRateInput * 10).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingCurrency}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
                  >
                    {savingCurrency ? (
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Enregistrer le Taux FCFA</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Change Card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-5">
              <div>
                <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-indigo-400" />
                  <span>Changer le Mot de Passe Administrateur</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Modifiez le mot de passe requis pour vous connecter à la console d'administration.
                </p>
              </div>

              {passwordChangeMessage && (
                <div className={`p-3.5 rounded-2xl border text-xs flex items-center space-x-2 ${
                  passwordChangeMessage.success
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}>
                  {passwordChangeMessage.success ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                  <span>{passwordChangeMessage.message}</span>
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Mot de Passe Actuel
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Saisissez votre mot de passe actuel"
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Nouveau Mot de Passe
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 4 caractères"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Confirmer le Nouveau Mot de Passe
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Répétez le nouveau mot de passe"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                  >
                    {changingPassword ? (
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        <span>Enregistrer le Nouveau Mot de Passe</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB: PRICING MARGIN RULES CONFIG */}
        {activeTab === 'pricing_rules' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
                  <Percent className="w-6 h-6 text-indigo-400" />
                  <span>Configuration des Marges & Pourcentages de Vente</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Définissez la marge bénéficiaire (%) à appliquer automatiquement selon la tranche de prix d'achat du produit. Ces règles s'appliquent lors de la synchronisation avec les fournisseurs et peuvent être réappliquées à tout le catalogue.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddPricingRule}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center space-x-2 transition-all self-start sm:self-auto"
              >
                <span>+ Ajouter une tranche</span>
              </button>
            </div>

            {pricingMsg && (
              <div className={`p-4 rounded-2xl border text-xs flex items-center space-x-3 ${
                pricingMsg.success
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}>
                {pricingMsg.success ? <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
                <span className="font-semibold">{pricingMsg.message}</span>
              </div>
            )}

            {/* Rules Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Prix d'Achat Min ($)</th>
                    <th className="px-4 py-3">Prix d'Achat Max ($)</th>
                    <th className="px-4 py-3">Marge Bénéficiaire (%)</th>
                    <th className="px-4 py-3">Exemple de Calcul</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pricingRules.map((rule, idx) => {
                    const sampleCost = Number(rule.minPrice) > 0 ? Number(rule.minPrice) : 2.0;
                    const sampleSelling = (sampleCost * (1 + Number(rule.marginPercent) / 100)).toFixed(2);
                    return (
                      <tr key={rule.id || idx} className="hover:bg-slate-900/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={rule.minPrice}
                              onChange={(e) => handleRuleUpdate(rule.id, 'minPrice', parseFloat(e.target.value) || 0)}
                              className="w-28 bg-slate-900 border border-slate-800 rounded-xl pl-7 pr-3 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={rule.maxPrice}
                              onChange={(e) => handleRuleUpdate(rule.id, 'maxPrice', parseFloat(e.target.value) || 0)}
                              className="w-28 bg-slate-900 border border-slate-800 rounded-xl pl-7 pr-3 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">+</span>
                            <input
                              type="number"
                              step="1"
                              min="0"
                              value={rule.marginPercent}
                              onChange={(e) => handleRuleUpdate(rule.id, 'marginPercent', parseFloat(e.target.value) || 0)}
                              className="w-24 bg-slate-900 border border-slate-800 rounded-xl pl-7 pr-6 py-1.5 text-emerald-300 font-extrabold text-xs focus:outline-none focus:border-emerald-500"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          <div className="bg-slate-900 px-3 py-1.5 rounded-xl text-[11px] font-mono border border-slate-800/80 inline-block">
                            Achat <span className="text-amber-400">${sampleCost.toFixed(2)}</span> &rarr; Vente <span className="text-emerald-400 font-bold">${sampleSelling}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeletePricingRule(rule.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all"
                            title="Supprimer cette tranche"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
              <div className="text-xs text-slate-400">
                💡 <span className="font-semibold text-slate-300">Astuce :</span> Les tranches s'appliquent automatiquement sur les nouveaux produits et les synchronisations.
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={savingPricingRules}
                  onClick={() => handleSavePricingRules(false)}
                  className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  {savingPricingRules ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-emerald-400" />}
                  <span>Enregistrer les règles</span>
                </button>

                <button
                  type="button"
                  disabled={savingPricingRules}
                  onClick={() => handleSavePricingRules(true)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
                >
                  {savingPricingRules ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Enregistrer & Réappliquer à TOUS les produits</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PAYMENT INSTRUCTIONS CONFIG */}
        {activeTab === 'payment_config' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4 max-w-3xl">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Configuration des Instructions de Paiement</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Saisissez les numéros de paiement (Mobile Money, virement bancaire, crypto) qui s'afficheront sur le ticket du client.
              </p>
            </div>

            {instructionsSavedMessage && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{instructionsSavedMessage}</span>
              </div>
            )}

            <form onSubmit={handleSavePaymentInstructions} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                  Texte des Instructions de Paiement (Affiché sur les Tickets Clients)
                </label>
                <textarea
                  rows={10}
                  required
                  value={paymentInstructions}
                  onChange={(e) => setPaymentInstructions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingInstructions}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-500/20"
                >
                  {savingInstructions ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Enregistrer & Publier les Instructions</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: VISUAL THEMES SELECTOR */}
        {activeTab === 'themes' && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80">
            <ThemeSelector />
          </div>
        )}

        {/* TAB 6: SUPPLIERS & API KEYS */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-white">Gestion des Fournisseurs & Clés API</h2>
                <p className="text-xs text-slate-400">
                  Gérez vos fournisseurs enregistrés, testez la validité de leurs connexions API et activez/désactivez l'accès.
                </p>
              </div>

              <button
                onClick={() => setShowAddSupplierModal(true)}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Fournisseur</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suppliers.map((supp) => (
                <div key={supp.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-extrabold text-white">{supp.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {supp.type}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block mt-0.5 font-mono">{supp.apiUrl}</span>
                    </div>

                    <button
                      onClick={() => handleToggleSupplierStatus(supp)}
                      className="focus:outline-none"
                    >
                      {supp.isActive ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ACTIF</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 text-xs font-bold border border-rose-500/30 flex items-center space-x-1.5">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>DÉSACTIVÉ</span>
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fiabilité fournisseur:</span>
                      <span className="font-bold text-emerald-400">{supp.reliabilityScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Solde Fournisseur:</span>
                      <span className="font-bold text-sky-400">${supp.balance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <Key className="w-3 h-3" />
                        <span>Clé API:</span>
                      </span>
                      <code className="font-mono text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg text-[10px] border border-slate-800">
                        {supp.apiKey ? `${supp.apiKey.slice(0, 12)}...${supp.apiKey.slice(-4)}` : 'Non renseignée'}
                      </code>
                    </div>
                  </div>

                  {testResult && testResult.id === supp.id && (
                    <div className={`p-3 rounded-2xl text-xs font-medium border ${testResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                      {testResult.message}
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-850">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTestSupplier(supp.id)}
                        disabled={testingSupplierId === supp.id}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                      >
                        <RefreshCcw className={`w-3.5 h-3.5 ${testingSupplierId === supp.id ? 'animate-spin' : ''}`} />
                        <span>Tester Connexion</span>
                      </button>

                      <button
                        onClick={() => setTopupSupplierModal(supp)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center space-x-1 transition-all shadow-md shadow-emerald-600/20"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Recharger</span>
                      </button>
                    </div>

                    <button
                      onClick={handleSyncCatalog}
                      className="text-xs text-sky-400 hover:underline font-bold"
                    >
                      Synchroniser Produits
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Top Financial KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Chiffre d'Affaires</span>
                <h3 className="text-3xl font-black text-white mt-1.5">${stats.totalRevenue.toFixed(2)}</h3>
                <span className="text-[10px] text-slate-500 block mt-1 font-bold">{stats.totalOrdersCount} commandes globales</span>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Coût Grossistes</span>
                <h3 className="text-3xl font-black text-rose-400 mt-1.5">${stats.totalCost.toFixed(2)}</h3>
                <span className="text-[10px] text-slate-500 block mt-1 font-bold">Achats bruts auprès des fournisseurs</span>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Bénéfice Net Total</span>
                <h3 className="text-3xl font-black text-emerald-400 mt-1.5">+${stats.totalProfit.toFixed(2)}</h3>
                <span className="text-[10px] text-emerald-400 font-bold block mt-1">Marge brute: {stats.profitMarginPercent}%</span>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Fournisseurs Actifs</span>
                <h3 className="text-3xl font-black text-sky-400 mt-1.5">{stats.activeSuppliers} / {stats.totalSuppliers}</h3>
                <span className="text-[10px] text-sky-400 font-bold block mt-1">{stats.activeProducts} produits au catalogue</span>
              </div>
            </div>

            {/* Category Breakdown Counters */}
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <span>Répartition des Demandes & Activités</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveTab('tickets')}
                  className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-sky-500/50 cursor-pointer transition-all group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-white group-hover:text-sky-400 transition-colors">
                      🎟️ Commandes Produits
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {recentOrders.length}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div className="flex justify-between">
                      <span>En attente :</span>
                      <span className="font-bold text-amber-400">
                        {recentOrders.filter((o) => o.status === 'PENDING_PAYMENT').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Livrées :</span>
                      <span className="font-bold text-emerald-400">
                        {recentOrders.filter((o) => o.status === 'COMPLETED').length}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('onlinesim')}
                  className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-white group-hover:text-purple-400 transition-colors">
                      📱 Commandes OTP
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {recentOtpOrders.length}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div className="flex justify-between">
                      <span>À valider :</span>
                      <span className="font-bold text-amber-400">
                        {recentOtpOrders.filter((o) => o.status === 'PENDING_PAYMENT').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Code Reçu :</span>
                      <span className="font-bold text-emerald-400">
                        {recentOtpOrders.filter((o) => o.status === 'COMPLETED').length}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('support')}
                  className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors">
                      💬 Support Client
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {supportConversations.length}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div className="flex justify-between">
                      <span>En cours :</span>
                      <span className="font-bold text-amber-400">
                        {supportConversations.filter((c) => c.supportStatus !== 'RESOLVED').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Résolus :</span>
                      <span className="font-bold text-emerald-400">
                        {supportConversations.filter((c) => c.supportStatus === 'RESOLVED').length}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('product_requests')}
                  className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-white group-hover:text-amber-400 transition-colors">
                      ✨ Demandes Sur-Mesure
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {productRequests.length}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div className="flex justify-between">
                      <span>En attente :</span>
                      <span className="font-bold text-rose-400">
                        {productRequests.filter((r) => r.status === 'PENDING').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Traitées :</span>
                      <span className="font-bold text-sky-400">
                        {productRequests.filter((r) => r.status !== 'PENDING').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Unified Activity History Timeline Feed */}
            {(() => {
              const combinedActivities = [
                ...recentOrders.map((o) => ({
                  id: `ord-${o.id}`,
                  kind: 'ORDER' as const,
                  kindLabel: 'Commande Produit',
                  kindColor: 'sky',
                  code: o.ticketCode || `ORD-${o.id.slice(-6)}`,
                  title: o.productTitle,
                  subtitle: `Acheteur : ${o.user?.name || o.userId || 'Client'}`,
                  amount: `$${o.totalAmount.toFixed(2)}`,
                  status: o.status,
                  date: new Date(o.createdAt),
                  targetTab: 'tickets' as const,
                })),
                ...recentOtpOrders.map((o) => ({
                  id: `otp-${o.id}`,
                  kind: 'OTP' as const,
                  kindLabel: 'Numéro Virtuel OTP',
                  kindColor: 'purple',
                  code: o.ticketCode || `OTP-${o.id.slice(-6)}`,
                  title: `OTP ${o.service.toUpperCase()}`,
                  subtitle: `Tél: ${o.phone || 'En attente'}`,
                  amount: `$${o.sellingPrice.toFixed(2)}`,
                  status: o.status,
                  date: new Date(o.createdAt),
                  targetTab: 'onlinesim' as const,
                })),
                ...supportConversations.map((c) => ({
                  id: `supp-${c.ticketCode}`,
                  kind: 'SUPPORT' as const,
                  kindLabel: 'Ticket Support',
                  kindColor: 'indigo',
                  code: c.ticketCode,
                  title: c.productTitle || 'Support Live',
                  subtitle: c.lastMessage
                    ? `${c.lastMessage.sender === 'ADMIN' ? 'Vous : ' : 'Client : '}${c.lastMessage.text}`
                    : 'Discussion démarrée',
                  amount: null,
                  status: c.supportStatus === 'RESOLVED' ? 'RESOLVED' : 'OPEN',
                  date: new Date(c.lastMessage?.createdAt || c.createdAt),
                  targetTab: 'support' as const,
                })),
                ...productRequests.map((r) => ({
                  id: `req-${r.id}`,
                  kind: 'REQUEST' as const,
                  kindLabel: 'Demande Sur-Mesure',
                  kindColor: 'amber',
                  code: `REQ-${r.id.slice(-6)}`,
                  title: r.productName,
                  subtitle: `${r.customerName} (${r.contactInfo})`,
                  amount: null,
                  status: r.status,
                  date: new Date(r.createdAt),
                  targetTab: 'product_requests' as const,
                })),
              ].sort((a, b) => b.date.getTime() - a.date.getTime());

              const filteredActivities = combinedActivities.filter((act) => {
                if (overviewFilter !== 'ALL' && act.kind !== overviewFilter) return false;
                if (!overviewSearch.trim()) return true;
                const q = overviewSearch.toLowerCase().trim();
                return (
                  act.code.toLowerCase().includes(q) ||
                  act.title.toLowerCase().includes(q) ||
                  act.subtitle.toLowerCase().includes(q) ||
                  act.status.toLowerCase().includes(q)
                );
              });

              return (
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-sky-400" />
                        <span>Historique Global des Commandes & Demandes</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Vue chronologique complète des ventes, numéros OTP, tickets de support et requêtes produits.
                      </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-72">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Rechercher par code, client..."
                        value={overviewSearch}
                        onChange={(e) => setOverviewSearch(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                      />
                      {overviewSearch && (
                        <button
                          onClick={() => setOverviewSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
                    <button
                      onClick={() => setOverviewFilter('ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        overviewFilter === 'ALL'
                          ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>Tous les Événements</span>
                      <span className="px-1.5 py-0.2 rounded bg-white/20 text-[10px]">
                        {combinedActivities.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setOverviewFilter('ORDER')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        overviewFilter === 'ORDER'
                          ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>🎟️ Produits ({recentOrders.length})</span>
                    </button>

                    <button
                      onClick={() => setOverviewFilter('OTP')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        overviewFilter === 'OTP'
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>📱 OTP ({recentOtpOrders.length})</span>
                    </button>

                    <button
                      onClick={() => setOverviewFilter('SUPPORT')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        overviewFilter === 'SUPPORT'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>💬 Support ({supportConversations.length})</span>
                    </button>

                    <button
                      onClick={() => setOverviewFilter('REQUEST')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        overviewFilter === 'REQUEST'
                          ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>✨ Demandes ({productRequests.length})</span>
                    </button>
                  </div>

                  {/* Activity Timeline Table */}
                  <div className="overflow-x-auto">
                    {filteredActivities.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 text-xs">
                        Aucune activité correspondant aux critères de recherche.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-400">
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Référence</th>
                            <th className="py-3 px-4">Détails / Client</th>
                            <th className="py-3 px-4">Montant</th>
                            <th className="py-3 px-4">Statut</th>
                            <th className="py-3 px-4">Date & Heure</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {filteredActivities.map((act) => {
                            const isOrder = act.kind === 'ORDER';
                            const isOtp = act.kind === 'OTP';
                            const isSupport = act.kind === 'SUPPORT';
                            const isRequest = act.kind === 'REQUEST';

                            return (
                              <tr key={act.id} className="hover:bg-slate-900/60 transition-colors">
                                {/* Type Badge */}
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                                      isOrder
                                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                        : isOtp
                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                        : isSupport
                                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}
                                  >
                                    {act.kindLabel}
                                  </span>
                                </td>

                                {/* Code / Reference */}
                                <td className="py-3.5 px-4 font-mono font-bold text-sky-300 whitespace-nowrap">
                                  {act.code}
                                </td>

                                {/* Title & Subtitle */}
                                <td className="py-3.5 px-4">
                                  <div className="font-extrabold text-white">{act.title}</div>
                                  <div className="text-[11px] text-slate-400 truncate max-w-xs">
                                    {act.subtitle}
                                  </div>
                                </td>

                                {/* Amount */}
                                <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400 whitespace-nowrap">
                                  {act.amount || '—'}
                                </td>

                                {/* Status */}
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                                      act.status === 'COMPLETED' || act.status === 'FULFILLED' || act.status === 'RESOLVED'
                                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                        : act.status === 'PENDING' || act.status === 'PENDING_PAYMENT' || act.status === 'WAITING_SMS'
                                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                        : act.status === 'CONTACTED'
                                        ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                    }`}
                                  >
                                    {act.status === 'COMPLETED'
                                      ? 'LIVRÉ / VALIDE'
                                      : act.status === 'PENDING_PAYMENT'
                                      ? 'EN ATTENTE PAIEMENT'
                                      : act.status === 'WAITING_SMS'
                                      ? 'SMS EN ATTENTE'
                                      : act.status === 'RESOLVED'
                                      ? 'RÉSOLU'
                                      : act.status === 'OPEN'
                                      ? 'EN COURS'
                                      : act.status === 'CONTACTED'
                                      ? 'CONTACTÉ'
                                      : act.status === 'FULFILLED'
                                      ? 'TRAITÉ'
                                      : act.status}
                                  </span>
                                </td>

                                {/* Date */}
                                <td className="py-3.5 px-4 text-[11px] text-slate-400 whitespace-nowrap">
                                  {act.date.toLocaleString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </td>

                                {/* Quick Navigation Action */}
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <button
                                    onClick={() => {
                                      setActiveTab(act.targetTab);
                                      if (isSupport) {
                                        setSelectedSupportTicket(act.code);
                                      }
                                    }}
                                    className="px-3 py-1 rounded-xl text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors inline-flex items-center space-x-1"
                                  >
                                    <span>Gérer</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 8: MULTI-SUPPLIER COMPARISON */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-white">Comparateur Multi-Fournisseurs</h2>
              <p className="text-xs text-slate-400">
                Comparez les prix et le stock entre vos fournisseurs pour sélectionner l'offre la plus rentable.
              </p>
            </div>

            <div className="space-y-6">
              {Object.keys(comparisonMap).length === 0 ? (
                <div className="text-center py-12 glass-panel rounded-3xl text-slate-500 text-xs">
                  Aucune offre comparative enregistrée.
                </div>
              ) : (
                Object.entries(comparisonMap).map(([groupKey, offers]) => (
                  <div key={groupKey} className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
                    <h3 className="text-sm font-bold text-white capitalize">{groupKey}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {offers.map((off: any) => (
                        <div key={off.supplierProductId} className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-sky-400">{off.supplierName}</span>
                            <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold text-[10px]">
                              Fiabilité: {off.reliabilityScore}%
                            </span>
                          </div>

                          <div className="text-slate-300 font-medium">{off.productName}</div>

                          <div className="pt-2 border-t border-slate-850 flex justify-between items-center">
                            <div>
                              <span className="text-[9px] text-slate-500 block uppercase">Prix Grossiste</span>
                              <span className="font-black text-white text-sm">${off.costPrice.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 block uppercase">Stock</span>
                              <span className="font-black text-emerald-400">{off.stock}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 9: ONLINESIM OTP CONFIGURATION */}
        {activeTab === 'onlinesim' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-sky-400" />
                <span>Configuration Service OnlineSIM (Numéros Virtuels OTP)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Gérez vos identifiants d'API OnlineSIM, ajustez la marge de profit appliquée sur tous les tarifs OTP et vérifiez votre solde en temps réel.
              </p>
            </div>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Solde Compte OnlineSIM</span>
                <div className="text-2xl font-black text-sky-400 font-mono pt-1">
                  {onlineSimBalance !== null ? `$${onlineSimBalance.toFixed(2)} USD` : 'Connexion...'}
                </div>
                <span className="text-[10px] text-slate-500 font-bold block">Solde API disponible</span>
              </div>

              <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Marge Appliquée sur les Prix</span>
                <div className="text-2xl font-black text-emerald-400 font-mono pt-1">
                  +{onlineSimMargin}%
                </div>
                <span className="text-[10px] text-slate-500 font-bold block">Ajoutée sur tous les numéros</span>
              </div>

              <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">ID Utilisateur OnlineSIM</span>
                <div className="text-2xl font-black text-purple-400 font-mono pt-1">
                  #{onlineSimUserId}
                </div>
                <span className="text-[10px] text-slate-500 font-bold block">Compte grossiste configuré</span>
              </div>
            </div>

            {/* Config Form Card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Settings className="w-4 h-4 text-sky-400" />
                <span>Paramètres d'Intégration API</span>
              </h3>

              <form onSubmit={handleSaveOnlineSim} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Clé API OnlineSIM (API Key) *
                  </label>
                  <input
                    type="text"
                    required
                    value={onlineSimApiKey}
                    onChange={(e) => setOnlineSimApiKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Clé secrète de votre compte OnlineSIM pour la réservation et la vérification des SMS.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      User ID OnlineSIM *
                    </label>
                    <input
                      type="text"
                      required
                      value={onlineSimUserId}
                      onChange={(e) => setOnlineSimUserId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                      Marge Bénéficiaire sur les Prix OTP (%) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="500"
                      required
                      value={onlineSimMargin}
                      onChange={(e) => setOnlineSimMargin(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Ex: 30% ajoute 30% au prix d'achat grossiste d'OnlineSIM.
                    </span>
                  </div>
                </div>

                {onlineSimMsg && (
                  <div className={`p-3 rounded-2xl text-xs ${onlineSimMsg.success ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
                    {onlineSimMsg.message}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={fetchOnlineSimConfig}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold flex items-center space-x-1.5 transition-all"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    <span>Tester la Connexion & Actualiser le Solde</span>
                  </button>

                  <button
                    type="submit"
                    disabled={savingOnlineSim}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
                  >
                    {savingOnlineSim ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <span>Enregistrer les Paramètres</span>}
                  </button>
                </div>
              </form>
            </div>

            {/* OTP Activations History Table */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Ticket className="w-4 h-4 text-sky-400" />
                    <span>Dernières Activations & Commandes OTP</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Consultez la liste des numéros attribués et les SMS reçus par vos clients.
                  </p>
                </div>
                <button
                  onClick={fetchAdminData}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold flex items-center space-x-1"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Actualiser</span>
                </button>
              </div>

              {recentOtpOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs bg-slate-950/50 rounded-2xl border border-slate-800">
                  Aucune activation OTP enregistrée pour le moment.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Ticket</th>
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4">Numéro Attribué</th>
                        <th className="py-3 px-4">Code SMS Reçu</th>
                        <th className="py-3 px-4">Prix Grossiste / Vente</th>
                        <th className="py-3 px-4">Statut</th>
                        <th className="py-3 px-4 text-center">Action Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {recentOtpOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-sky-400">{o.ticketCode}</td>
                          <td className="py-3 px-4 font-extrabold text-white capitalize">{o.service} (Pays: {o.country})</td>
                          <td className="py-3 px-4 font-mono text-white font-bold">{o.phone || 'Non attribué'}</td>
                          <td className="py-3 px-4">
                            {o.smsCode ? (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-black border border-emerald-500/30">
                                {o.smsCode}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">En attente...</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span className="text-slate-400">${o.costPrice?.toFixed(2) || '0.30'}</span> /{' '}
                            <span className="text-emerald-400 font-black">${o.sellingPrice?.toFixed(2) || '0.45'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              o.status === 'COMPLETED'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : o.status === 'WAITING_SMS'
                                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                                : o.status === 'PENDING_PAYMENT'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}>
                              {o.status === 'COMPLETED'
                                ? 'SMS REÇU'
                                : o.status === 'WAITING_SMS'
                                ? 'ATTENTE SMS'
                                : o.status === 'PENDING_PAYMENT'
                                ? 'ATTENTE PAIEMENT'
                                : 'ANNULÉ / REFUSÉ'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {o.status === 'PENDING_PAYMENT' ? (
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleValidateOtpTicket(o.id)}
                                  disabled={validatingTicketId === o.id || cancellingTicketId === o.id}
                                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center space-x-1 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                                >
                                  {validatingTicketId === o.id ? (
                                    <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      <span>Valider & Lancer</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleCancelOtpTicket(o.id)}
                                  disabled={validatingTicketId === o.id || cancellingTicketId === o.id}
                                  className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center space-x-1 transition-all disabled:opacity-50"
                                >
                                  {cancellingTicketId === o.id ? (
                                    <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <>
                                      <X className="w-3.5 h-3.5" />
                                      <span>Refuser</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : o.status === 'WAITING_SMS' ? (
                              <span className="text-[11px] text-sky-400 font-bold">Actif sur OnlineSIM</span>
                            ) : o.status === 'COMPLETED' ? (
                              <span className="text-[11px] text-emerald-400 font-bold">SMS Livré</span>
                            ) : (
                              <span className="text-[11px] text-slate-500 font-bold">Ticket Annulé</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 10: MARKETING, PIXELS & BANNER CONFIGURATION */}
        {activeTab === 'marketing' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span>Centre Marketing, Pixels & Communication</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configurez vos pixels publicitaires (Meta Facebook, TikTok, Google Analytics), diffusez une bannière promotionnelle dynamique sur le site et générez des liens de campagne UTM traçables.
              </p>
            </div>

            {/* Notification alert message */}
            {marketingSavedMsg && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center space-x-3 text-emerald-400 text-xs font-bold animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{marketingSavedMsg}</span>
              </div>
            )}

            {/* Main Form for Pixels & Promo Banner */}
            <form onSubmit={handleSaveMarketing} className="space-y-6">
              
              {/* SECTION 1: PIXELS & TRACKING */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span>Pixels Publicitaires & Tracking d'Audience</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Meta / Facebook Pixel */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-white flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                        <span>Meta / Facebook Pixel</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${facebookPixelId.trim() ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
                        {facebookPixelId.trim() ? 'Actif' : 'Inactif'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        ID du Pixel Meta (FBQ)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 123456789012345"
                        value={facebookPixelId}
                        onChange={(e) => setFacebookPixelId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Suit automatiquement les vues de pages (`PageView`) et les conversions pour Facebook & Instagram Ads.
                    </p>
                  </div>

                  {/* TikTok Pixel */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-white flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-fuchsia-400" />
                        <span>TikTok Pixel</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${tiktokPixelId.trim() ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
                        {tiktokPixelId.trim() ? 'Actif' : 'Inactif'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        ID du Pixel TikTok (TTQ)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: C1234567890ABCDEF"
                        value={tiktokPixelId}
                        onChange={(e) => setTiktokPixelId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-fuchsia-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Optimise vos campagnes publicitaires TikTok Ads (`Pageview`, `CompletePayment`).
                    </p>
                  </div>

                  {/* Google Analytics / Tag Manager */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-white flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>Google Analytics (GA4)</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${googleAnalyticsId.trim() ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
                        {googleAnalyticsId.trim() ? 'Actif' : 'Inactif'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        ID de Mesure Google (G-XXXXXX)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: G-ABC123XYZ"
                        value={googleAnalyticsId}
                        onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Analyse le trafic global, les sources d'acquisition et le comportement du public en temps réel.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: BANNIÈRE PROMOTIONNELLE & COMMUNICATION SITE */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Bannière d'Annonce Promotionnelle (En-Tête du Site)</span>
                  </h3>

                  {/* Toggle Promo Banner */}
                  <button
                    type="button"
                    onClick={() => setPromoBannerActive(!promoBannerActive)}
                    className={`px-3 py-1.5 rounded-full text-xs font-black uppercase transition-all flex items-center space-x-1.5 ${
                      promoBannerActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <span>{promoBannerActive ? 'Bannière Activée' : 'Bannière Masquée'}</span>
                  </button>
                </div>

                {promoBannerActive && (
                  <div className="space-y-4 pt-2">
                    {/* Live Preview Card */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                        Aperçu en Direct de la Bannière
                      </label>
                      <div
                        className={`w-full py-2.5 px-4 rounded-2xl text-xs font-medium text-white flex items-center justify-between shadow-lg ${
                          promoBannerBg === 'emerald'
                            ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600'
                            : promoBannerBg === 'fire'
                            ? 'bg-gradient-to-r from-rose-600 via-red-600 to-orange-600'
                            : promoBannerBg === 'gold'
                            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950'
                            : promoBannerBg === 'purple'
                            ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600'
                            : 'bg-gradient-to-r from-indigo-600 via-sky-600 to-purple-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate mx-auto text-center">
                          <Sparkles className="w-4 h-4 shrink-0 text-amber-300 animate-bounce" />
                          <span className="font-extrabold tracking-wide">
                            {promoBannerText || '🔥 Saisissez votre texte d\'annonce promotionnelle ci-dessous...'}
                          </span>
                          <span className="inline-flex items-center space-x-1 font-black underline underline-offset-2 ml-2 bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                            <span>Découvrir</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                          Message de l'Annonce *
                        </label>
                        <input
                          type="text"
                          required
                          value={promoBannerText}
                          onChange={(e) => setPromoBannerText(e.target.value)}
                          placeholder="Ex: 🔥 Offre Spéciale: -20% sur tous les comptes avec le code POSITIF20 !"
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                          Style Visuel (Dégradé)
                        </label>
                        <select
                          value={promoBannerBg}
                          onChange={(e) => setPromoBannerBg(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="indigo">Indigo / Bleu (Standard)</option>
                          <option value="emerald">Émeraude / Cyan (Promo)</option>
                          <option value="fire">Feu / Flash (Urgence)</option>
                          <option value="gold">Or / Ambre (VIP)</option>
                          <option value="purple">Violet / Fuchsia (Événement)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        Lien de Destination du Clic
                      </label>
                      <input
                        type="text"
                        value={promoBannerLink}
                        onChange={(e) => setPromoBannerLink(e.target.value)}
                        placeholder="Ex: /exclusifs ou /otp ou /"
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Marketing Settings Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingMarketing}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:from-purple-500 hover:to-sky-400 text-white font-extrabold text-xs shadow-xl shadow-purple-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  {savingMarketing ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Enregistrer la Configuration Marketing</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* SECTION 3: GENERATEUR DE LIENS DE CAMPAGNE (UTM BUILDER) */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  <span>Générateur de Liens de Campagnes Pubs (UTM Builder)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Créez des liens traçables pour vos publicités Facebook Ads, TikTok Ads, statuts WhatsApp ou campagnes email afin de savoir exactement d'où proviennent vos acheteurs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Page d'Atterrissage
                  </label>
                  <select
                    value={utmPage}
                    onChange={(e) => setUtmPage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="/">Page d'Accueil (Boutique)</option>
                    <option value="/otp">Page Numéros OTP</option>
                    <option value="/exclusifs">Page Produits Exclusifs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Source de la Campagne (utm_source)
                  </label>
                  <select
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="facebook">Facebook Ads</option>
                    <option value="tiktok">TikTok Ads</option>
                    <option value="whatsapp">WhatsApp Direct / Status</option>
                    <option value="google">Google Search / Ads</option>
                    <option value="instagram">Instagram Bio / Story</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Support / Format (utm_medium)
                  </label>
                  <select
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="cpc">Publicité Payante (CPC)</option>
                    <option value="story">Story / Reels</option>
                    <option value="post">Publication / Banner</option>
                    <option value="group">Groupe / Communauté</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Nom de Campagne (utm_campaign)
                  </label>
                  <input
                    type="text"
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    placeholder="Ex: lancement_octobre"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Generated URL Result Box */}
              {(() => {
                const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://entrepreneurspositifs.com';
                const fullUrl = `${baseUrl}${utmPage}?utm_source=${encodeURIComponent(utmSource)}&utm_medium=${encodeURIComponent(utmMedium)}&utm_campaign=${encodeURIComponent(utmCampaign.trim() || 'lancement')}`;

                return (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="truncate w-full">
                      <span className="text-[10px] font-black text-slate-500 uppercase block mb-0.5">Lien Traçable Généré</span>
                      <span className="text-xs font-mono font-bold text-sky-400 truncate block">
                        {fullUrl}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(fullUrl);
                        setCopiedUtm(true);
                        setTimeout(() => setCopiedUtm(false), 3000);
                      }}
                      className="px-4 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 font-bold text-xs shrink-0 flex items-center space-x-1.5 transition-all"
                    >
                      {copiedUtm ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Lien Copié !</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5" />
                          <span>Copier le Lien</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB TELEGRAM: BOT TELEGRAM & NOTIFICATIONS INSTANTANEES */}
        {activeTab === 'telegram' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <Bell className="w-5 h-5 text-sky-400" />
                <span>Configuration du Bot Telegram & Notifications Admin</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Recevez des alertes instantanées sur votre smartphone à chaque vente, commande OTP, message support ou demande produit, et validez/refusez les tickets en 1 clic directement sur Telegram.
              </p>
            </div>

            {/* Notification alert message */}
            {telegramMsg && (
              <div
                className={`p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold ${
                  telegramMsg.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{telegramMsg.message}</span>
              </div>
            )}

            {/* Status overview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Statut du Service Telegram</span>
                <div className="text-xl font-black font-mono pt-1">
                  {telegramEnabled && telegramBotToken && telegramChatId ? (
                    <span className="text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Connecté & Actif</span>
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center space-x-1">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Incomplet / Désactivé</span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-bold block">Envoi automatique sur smartphone</span>
              </div>

              <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Boutons d'Approbation 1-Clic</span>
                <div className="text-xl font-black text-sky-400 font-mono pt-1">
                  Activés (Inline Keyboard)
                </div>
                <span className="text-[10px] text-slate-500 font-bold block">Validation instantanée depuis l'App</span>
              </div>

              <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Types d'Alertes Traitées</span>
                <div className="text-xl font-black text-purple-400 font-mono pt-1">
                  Ventes, OTP, Support, Demandes
                </div>
                <span className="text-[10px] text-slate-500 font-bold block">Couverture complète à 100%</span>
              </div>
            </div>

            {/* Main Form for Telegram Token & Chat ID */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-sky-400" />
                  <span>Identifiants du Bot & Canal Admin</span>
                </h3>

                {/* Toggle Enable Telegram */}
                <button
                  type="button"
                  onClick={() => setTelegramEnabled(!telegramEnabled)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase transition-all flex items-center space-x-1.5 ${
                    telegramEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  <span>{telegramEnabled ? 'Notifications Activées' : 'Notifications Désactivées'}</span>
                </button>
              </div>

              <form onSubmit={handleSaveTelegram} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Token du Bot Telegram (Bot Token) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Token fourni par <b>@BotFather</b> lors de la création de votre Bot Telegram.
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    ID du Chat Admin / Canal (Chat ID) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 987654321 ou @VotreCanalAdmin"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Votre ID d'utilisateur personnel ou l'identifiant du canal/groupe privé Telegram où vous recevrez les alertes.
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleTestTelegram}
                    disabled={sendingTestTelegram || !telegramBotToken || !telegramChatId}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
                  >
                    {sendingTestTelegram ? (
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Envoyer une Notification de Test</span>
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    disabled={savingTelegram}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                  >
                    {savingTelegram ? (
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Enregistrer les Identifiants</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Guide Step-by-Step for Telegram Setup */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Guide de Configuration Telegram en 30 secondes</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2">
                  <span className="font-extrabold text-sky-400 flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-black">1</span>
                    <span>Créer le Bot (@BotFather)</span>
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Ouvrez Telegram et cherchez le compte officiel <b>@BotFather</b>. Tapez <code>/newbot</code>, donnez un nom à votre bot et copiez le <b>API Token</b> généré.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2">
                  <span className="font-extrabold text-purple-400 flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-black">2</span>
                    <span>Obtenir votre Chat ID</span>
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Lancez la discussion avec votre nouveau bot ou envoyez un message au compte <b>@userinfobot</b> sur Telegram pour obtenir instantanément votre <b>Chat ID numérique</b> (ex: <code>987654321</code>).
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2">
                  <span className="font-extrabold text-emerald-400 flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">3</span>
                    <span>Tester & Valider</span>
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Collez le Token et l'ID Chat ci-dessus, enregistrez puis cliquez sur <b>"Envoyer une Notification de Test"</b>. Vous recevrez l'alerte sur Telegram avec le bouton de validation 1-Clic !
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB PROMOS: CODES PROMO & REDUCTIONS */}
        {activeTab === 'promos' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-emerald-400" />
                  <span>Gestion des Codes Promo & Coupons de Réduction</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Créez des remises en pourcentage ou en montant fixe (FCFA / USD) pour stimuler vos ventes et fidéliser vos acheteurs.
                </p>
              </div>

              <button
                onClick={() => setShowCreatePromoModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Créer un Code Promo</span>
              </button>
            </div>

            {/* Notification alert message */}
            {promoMsg && (
              <div
                className={`p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold ${
                  promoMsg.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}
              >
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{promoMsg.message}</span>
              </div>
            )}

            {/* Quick KPI Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel p-5 rounded-3xl border border-slate-800">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Codes Promo Actifs</span>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                  {promoCodes.filter((p) => p.isActive).length} / {promoCodes.length}
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Coupons disponibles à la caisse</span>
              </div>

              <div className="glass-panel p-5 rounded-3xl border border-slate-800">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Utilisations Totales</span>
                <div className="text-2xl font-black text-sky-400 font-mono mt-1">
                  {promoCodes.reduce((acc, p) => acc + (p.usedCount || 0), 0)}
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Remises appliquées lors d'achats</span>
              </div>

              <div className="glass-panel p-5 rounded-3xl border border-slate-800">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Type de Remise Populaire</span>
                <div className="text-2xl font-black text-purple-400 font-mono mt-1">
                  Pourcentage (%)
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">Offres les plus attractives</span>
              </div>
            </div>

            {/* Promo Codes Table */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span>Liste des Coupons & Codes Promo</span>
                </h3>

                <button
                  onClick={fetchPromoCodes}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold flex items-center space-x-1"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Actualiser</span>
                </button>
              </div>

              {promoCodes.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs bg-slate-950/50 rounded-2xl border border-slate-800 space-y-3">
                  <Tag className="w-8 h-8 mx-auto text-slate-600 opacity-50" />
                  <p className="font-semibold text-slate-400">Aucun code promo créé pour le moment.</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Cliquez sur "Créer un Code Promo" ci-dessus pour offrir des réductions en % ou en montant fixe à vos acheteurs.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-400">
                        <th className="py-3 px-4">Code Promo</th>
                        <th className="py-3 px-4">Type de Remise</th>
                        <th className="py-3 px-4">Valeur</th>
                        <th className="py-3 px-4">Min. Commande</th>
                        <th className="py-3 px-4">Utilisations</th>
                        <th className="py-3 px-4">Expiration</th>
                        <th className="py-3 px-4">Statut</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {promoCodes.map((p) => {
                        const isExpired = p.expiresAt && new Date(p.expiresAt) < new Date();
                        const isLimitReached = p.maxUses !== null && p.usedCount >= p.maxUses;

                        return (
                          <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                            {/* Code Badge */}
                            <td className="py-3.5 px-4 font-mono font-black text-sm text-emerald-400">
                              <span className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl tracking-wider uppercase">
                                {p.code}
                              </span>
                            </td>

                            {/* Type */}
                            <td className="py-3.5 px-4 text-slate-300 font-medium">
                              {p.discountType === 'PERCENTAGE' ? (
                                <span className="inline-flex items-center space-x-1 text-purple-400">
                                  <Percent className="w-3.5 h-3.5" />
                                  <span>Pourcentage (%)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 text-sky-400">
                                  <DollarSign className="w-3.5 h-3.5" />
                                  <span>Montant Fixe ($ / FCFA)</span>
                                </span>
                              )}
                            </td>

                            {/* Value */}
                            <td className="py-3.5 px-4 font-mono font-black text-white text-sm">
                              {p.discountType === 'PERCENTAGE' ? `-${p.discountValue}%` : `-$${p.discountValue.toFixed(2)}`}
                            </td>

                            {/* Minimum Purchase */}
                            <td className="py-3.5 px-4 text-slate-400">
                              {p.minPurchaseAmount > 0 ? `$${p.minPurchaseAmount.toFixed(2)}` : 'Aucun min.'}
                            </td>

                            {/* Uses */}
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                              {p.usedCount} / {p.maxUses !== null ? p.maxUses : '∞'}
                            </td>

                            {/* Expiration */}
                            <td className="py-3.5 px-4 text-slate-400">
                              {p.expiresAt
                                ? new Date(p.expiresAt).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })
                                : 'Sans limite'}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                                  isExpired || isLimitReached
                                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                    : p.isActive
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-500 border-slate-700'
                                }`}
                              >
                                {isExpired
                                  ? 'Expiré'
                                  : isLimitReached
                                  ? 'Limite atteinte'
                                  : p.isActive
                                  ? 'Actif'
                                  : 'Désactivé'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => handleTogglePromoActive(p.id, p.isActive)}
                                className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-colors ${
                                  p.isActive
                                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                }`}
                              >
                                {p.isActive ? 'Désactiver' : 'Activer'}
                              </button>

                              <button
                                onClick={() => handleDeletePromo(p.id)}
                                className="px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                                title="Supprimer le code promo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Create Promo Modal */}
            {showCreatePromoModal && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <Gift className="w-5 h-5 text-emerald-400" />
                      <span>Créer un Nouveau Code Promo</span>
                    </h3>
                    <button
                      onClick={() => setShowCreatePromoModal(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreatePromo} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        Code Promo (Ex: POSITIF10, REDUC20) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: POSITIF10"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 font-mono font-black text-white uppercase focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                          Type de Réduction *
                        </label>
                        <select
                          value={promoDiscountType}
                          onChange={(e) => setPromoDiscountType(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-3 text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="PERCENTAGE">Pourcentage (%)</option>
                          <option value="FIXED">Montant Fixe ($ / FCFA)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                          Valeur de la Remise *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="Ex: 10"
                          value={promoDiscountValue}
                          onChange={(e) => setPromoDiscountValue(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                          Montant Min. de Commande ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 0 (Sans min.)"
                          value={promoMinAmount}
                          onChange={(e) => setPromoMinAmount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 font-mono text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                          Limite d'Utilisations (Max)
                        </label>
                        <input
                          type="number"
                          placeholder="Ex: 50 (Vide = Illimité)"
                          value={promoMaxUses}
                          onChange={(e) => setPromoMaxUses(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 font-mono text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        Date d'Expiration (Optionnelle)
                      </label>
                      <input
                        type="date"
                        value={promoExpiresAt}
                        onChange={(e) => setPromoExpiresAt(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowCreatePromoModal(false)}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold"
                      >
                        Annuler
                      </button>

                      <button
                        type="submit"
                        disabled={savingPromo}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                      >
                        {savingPromo ? (
                          <RefreshCcw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Enregistrer le Code Promo</span>
                            <Check className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB PRODUCT REQUESTS: DEMANDES CLIENTS SUR-MESURE */}
        {activeTab === 'product_requests' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <Send className="w-5 h-5 text-emerald-400" />
                  <span>Demandes de Produits Sur-Mesure des Clients</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Consultez les requêtes de produits non disponibles au catalogue soumises par les clients avec leurs coordonnées.
                </p>
              </div>

              <button
                onClick={fetchProductRequests}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold flex items-center space-x-1.5 transition-all"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Actualiser les Demandes</span>
              </button>
            </div>

            <div className="glass-panel rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
              {productRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Aucune demande de produit soumise par un client pour le moment.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-5 py-4">Client</th>
                        <th className="px-5 py-4">Contact (WhatsApp / Email)</th>
                        <th className="px-5 py-4">Produit Recherché</th>
                        <th className="px-5 py-4">Description / Précisions</th>
                        <th className="px-5 py-4">Date</th>
                        <th className="px-5 py-4 text-center">Statut</th>
                        <th className="px-5 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {productRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-900/70 transition-colors">
                          <td className="px-5 py-4 font-bold text-white">
                            {req.customerName}
                          </td>
                          <td className="px-5 py-4 font-mono font-bold text-sky-400">
                            {req.contactInfo}
                          </td>
                          <td className="px-5 py-4 font-extrabold text-emerald-400">
                            {req.productName}
                          </td>
                          <td className="px-5 py-4 max-w-xs text-slate-300">
                            {req.description || <span className="text-slate-600 italic">Aucune précision</span>}
                          </td>
                          <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                            {new Date(req.createdAt).toLocaleString('fr-FR')}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              req.status === 'CONTACTED'
                                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                                : req.status === 'FULFILLED'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}>
                              {req.status === 'CONTACTED' ? 'CONTACTÉ' : req.status === 'FULFILLED' ? 'TRAITÉ / DISPO' : 'EN ATTENTE'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {req.status === 'PENDING' && (
                                <button
                                  onClick={() => handleUpdateProductRequestStatus(req.id, 'CONTACTED')}
                                  className="px-2.5 py-1 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 font-bold text-[11px]"
                                >
                                  Marquer Contacté
                                </button>
                              )}
                              {req.status !== 'FULFILLED' && (
                                <button
                                  onClick={() => handleUpdateProductRequestStatus(req.id, 'FULFILLED')}
                                  className="px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold text-[11px]"
                                >
                                  Marquer Traité
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteProductRequest(req.id)}
                                className="px-2.5 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-bold text-[11px]"
                              >
                                Supprimer
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB MANUAL PRODUCTS: PRODUITS EXCLUSIFS & MANUELS */}
        {activeTab === 'manual_products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>Gestion des Produits Exclusifs & Manuels</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Consultez, modifiez et ajoutez vos offres créées sur-mesure avec images affichées sur la vitrine <strong className="text-emerald-400">/exclusifs</strong>.
                </p>
              </div>

              <button
                onClick={() => {
                  setNewProdTitle('');
                  setNewProdDescription('');
                  setNewProdPrice(10);
                  setNewProdBadge('');
                  setNewProdImageUrl('');
                  setShowAddProductModal(true);
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Ajouter un Produit Exclusif</span>
              </button>
            </div>

            <div className="glass-panel rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl">
              {products.filter((p) => !p.activeSupplierProduct).length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs space-y-3">
                  <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>Aucun produit manuel ou exclusif enregistré pour le moment.</p>
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold"
                  >
                    + Créer votre premier produit exclusif
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-5 py-4">Visuel / Image</th>
                        <th className="px-5 py-4">Produit & Catégorie</th>
                        <th className="px-5 py-4">Prix de Vente</th>
                        <th className="px-5 py-4">Badge / Tag</th>
                        <th className="px-5 py-4 text-center">Statut Vitrine</th>
                        <th className="px-5 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {products
                        .filter((p) => !p.activeSupplierProduct)
                        .map((p) => (
                          <tr key={p.id} className="hover:bg-slate-900/70 transition-colors">
                            <td className="px-5 py-4">
                              <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                                {p.imageUrl ? (
                                  <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                                ) : (
                                  <Sparkles className="w-6 h-6 text-emerald-400/60" />
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-4 max-w-xs">
                              <div className="font-extrabold text-white text-sm">{p.title}</div>
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mt-0.5">
                                {p.category}
                              </span>
                              {p.description && (
                                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                                  {p.description}
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-4 font-mono">
                              <div className="font-black text-emerald-400 text-sm">
                                ${p.sellingPrice.toFixed(2)} USD
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold block">
                                {fcfaRate ? `${(p.sellingPrice * fcfaRate).toLocaleString('fr-FR')} FCFA` : ''}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              {p.badge ? (
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[10px] uppercase">
                                  {p.badge}
                                </span>
                              ) : (
                                <span className="text-slate-600 text-[10px] italic">Aucun badge</span>
                              )}
                            </td>

                            <td className="px-5 py-4 text-center">
                              <button
                                onClick={() => handleToggleProductStatus(p)}
                                className="focus:outline-none"
                              >
                                {p.isActive ? (
                                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                                    ACTIVÉ
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase">
                                    DÉSACTIVÉ
                                  </span>
                                )}
                              </button>
                            </td>

                            <td className="px-5 py-4 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center space-x-1"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>Modifier</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center space-x-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Supprimer</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
          </div>
        </div>
      </main>

      {/* ADD MANUAL PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddProductModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <Package className="w-5 h-5 text-emerald-400" />
              <span>Ajouter un Produit Manuellement</span>
            </h3>

            <p className="text-xs text-slate-400">
              Créez un nouveau produit qui sera immédiatement disponible sur la vitrine client.
            </p>

            <form onSubmit={handleCreateProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Titre du Produit *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Abonnement Netflix Premium 1 Mois, Canal+..."
                  value={newProdTitle}
                  onChange={(e) => setNewProdTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Catégorie *
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  >
                    {['IA & APIs', 'Licences & Outils Dev', 'Mobile & Services', 'Abonnements & Comptes', 'Général'].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Prix de Vente ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Badge ou Tag (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: POPULAIRE, NOUVEAU, PROMO..."
                  value={newProdBadge}
                  onChange={(e) => setNewProdBadge(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Image du Produit (Téléverser un fichier ou Lien URL)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Collez une URL d'image ou téléversez ci-dessous..."
                      value={newProdImageUrl}
                      onChange={(e) => setNewProdImageUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    {newProdImageUrl && (
                      <button
                        type="button"
                        onClick={() => setNewProdImageUrl('')}
                        className="p-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-xl text-xs font-bold transition-colors"
                        title="Effacer l'image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-2 border border-slate-700 transition-all shadow-sm">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>Téléverser une image...</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, setNewProdImageUrl)}
                      />
                    </label>
                    <span className="text-[10px] text-slate-400">PNG, JPG, WEBP (Max 5 Mo)</span>
                  </div>

                  {newProdImageUrl && (
                    <div className="flex items-center space-x-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 mt-2">
                      <img src={newProdImageUrl} alt="Aperçu du produit" className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-900 flex-shrink-0" />
                      <div className="text-[11px] text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Image prête pour le produit</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Description / Consignes de Livraison (Optionnel)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Compte privé avec accès garanti. Livraison par ticket après validation..."
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingProduct}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center space-x-2 transition-all"
                >
                  {creatingProduct ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Ajouter au Catalogue</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <Edit className="w-5 h-5 text-indigo-400" />
              <span>Modifier le Prix & Statut du Produit</span>
            </h3>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="font-extrabold text-white">{editingProduct.title}</div>
              <div className="flex justify-between text-slate-400">
                <span>Prix Grossiste Fournisseur:</span>
                <span className="font-bold text-slate-200">${editingProduct.costPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Prix de Vente Final ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-lg font-black text-emerald-400 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Marge nette calculée: <strong className="text-indigo-300">+${(editPrice - editingProduct.costPrice).toFixed(2)}</strong>
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Image du Produit (Téléverser un fichier ou Lien URL)
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Collez une URL d'image ou téléversez ci-dessous..."
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    {editImageUrl && (
                      <button
                        type="button"
                        onClick={() => setEditImageUrl('')}
                        className="p-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-xl text-xs font-bold transition-colors"
                        title="Effacer l'image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-2 border border-slate-700 transition-all shadow-sm">
                      <Upload className="w-4 h-4 text-indigo-400" />
                      <span>Téléverser une nouvelle image...</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, setEditImageUrl)}
                      />
                    </label>
                    <span className="text-[10px] text-slate-400">PNG, JPG, WEBP (Max 5 Mo)</span>
                  </div>

                  {editImageUrl && (
                    <div className="flex items-center space-x-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 mt-2">
                      <img src={editImageUrl} alt="Aperçu du produit" className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-900 flex-shrink-0" />
                      <div className="text-[11px] text-indigo-300 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Image mise à jour</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-white block">Activer le Produit sur la Boutique</span>
                  <span className="text-[10px] text-slate-400">Si désactivé, les clients ne pourront pas le voir ni l'acheter.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsActive(!editIsActive)}
                  className="focus:outline-none"
                >
                  {editIsActive ? (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-xl text-xs border border-emerald-500/30">
                      ACTIVÉ
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-rose-500/20 text-rose-400 font-bold rounded-xl text-xs border border-rose-500/30">
                      DÉSACTIVÉ
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveProductEdit}
                disabled={savingProduct}
                className="px-6 py-2.5 rounded-2xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-2 shadow-lg shadow-indigo-500/20"
              >
                {savingProduct && <RefreshCcw className="w-3.5 h-3.5 animate-spin" />}
                <span>Enregistrer les Modifications</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SUPPLIER MODAL */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowAddSupplierModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-white">Ajouter un Nouveau Fournisseur</h3>

            <form onSubmit={handleAddSupplier} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-extrabold uppercase text-[10px] tracking-wider mb-1">Nom du Fournisseur</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Canboso API, Fournisseur B"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-extrabold uppercase text-[10px] tracking-wider mb-1">Type Driver API</label>
                <select
                  value={newSupplierType}
                  onChange={(e) => setNewSupplierType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                >
                  <option value="canboso">Canboso API (REST / Telegram Buyer)</option>
                  <option value="custom_api">Fournisseur API Générique</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-extrabold uppercase text-[10px] tracking-wider mb-1">URL Base API</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: https://canboso.com"
                  value={newSupplierUrl}
                  onChange={(e) => setNewSupplierUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-extrabold uppercase text-[10px] tracking-wider mb-1">Clé API Fournie</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: tgb_2e65bb617446f..."
                  value={newSupplierKey}
                  onChange={(e) => setNewSupplierKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={addingSupplier}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-extrabold text-white shadow-lg shadow-indigo-500/20"
                >
                  {addingSupplier ? 'Création...' : 'Ajouter Fournisseur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPPLIER TOPUP MODAL */}
      {topupSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setTopupSupplierModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-extrabold text-white">
                  Recharger le Compte {topupSupplierModal.name}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Suivez les instructions du fournisseur pour créditer votre portefeuille API.
              </p>
            </div>

            {/* Current Balance Display */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 block">Solde Actuel en Direct</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  ${topupSupplierModal.balance !== undefined ? topupSupplierModal.balance.toFixed(2) : '0.00'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleTestSupplier(topupSupplierModal.id);
                  setTimeout(fetchAdminData, 1000);
                }}
                disabled={testingSupplierId === topupSupplierModal.id}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-sky-300 font-bold text-xs flex items-center space-x-1.5 transition-all border border-slate-700"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${testingSupplierId === topupSupplierModal.id ? 'animate-spin' : ''}`} />
                <span>Vérifier Solde API</span>
              </button>
            </div>

            {/* Recharge Instructions */}
            {(() => {
              const info = getSupplierRechargeInfo(topupSupplierModal);
              return (
                <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-850 text-xs">
                  <div className="font-extrabold text-amber-400 text-xs flex items-center space-x-1.5">
                    <span>📌 Procédure de Rechargement Officielle :</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {info?.instructions}
                  </p>
                  
                  <div className="pt-2 flex flex-col space-y-2">
                    {info?.botUrl && (
                      <a
                        href={info.botUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-center flex items-center justify-center space-x-2 shadow-lg shadow-sky-600/20"
                      >
                        <Send className="w-4 h-4" />
                        <span>Ouvrir {info.contact}</span>
                      </a>
                    )}
                    {info?.webUrl && (
                      <a
                        href={info.webUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-center flex items-center justify-center space-x-2 border border-slate-700"
                      >
                        <Globe className="w-4 h-4" />
                        <span>Accéder au Site Fournisseur</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setTopupSupplierModal(null)}
                className="px-6 py-2.5 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
