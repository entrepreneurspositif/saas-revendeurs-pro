'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  TrendingUp,
  Package,
  Layers,
  Settings,
  DollarSign,
  ShoppingCart,
  Crown,
  Zap,
  Globe,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Edit,
  Eye,
  EyeOff,
  Search,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Palette,
  Phone,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Shield,
  Percent,
  Coins,
  RefreshCw,
  Sliders,
  Ticket,
  KeyRound,
  X,
  Smartphone,
  Upload,
  Image as ImageIcon,
  Type,
  MousePointerClick,
  Trash2,
  Pipette,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Send,
  CreditCard,
  LifeBuoy,
  Clock,
  Plus,
  LayoutGrid,
  List,
  CheckSquare,
  Square,
  Flame,
  Bot,
  Menu,
} from 'lucide-react';
import { useCurrency } from '@/components/CurrencyContext';
import BulkProductPricingModal from '@/components/BulkProductPricingModal';

const THEME_PRESETS = [
  {
    id: 'cyber-dark',
    name: 'Cyber Dark',
    description: 'Sombre futuriste, néon cyan & contrastes technologiques',
    bgPreview: 'from-slate-950 via-slate-900 to-sky-950',
    primaryColor: '#0ea5e9',
    badge: 'Populaire',
    borderClass: 'border-sky-500/30',
    accentName: 'sky',
  },
  {
    id: 'emerald-luxury',
    name: 'Émeraude Luxe',
    description: 'Noir minéral noble & reflets vert émeraude prestigieux',
    bgPreview: 'from-[#06140f] via-slate-950 to-[#022016]',
    primaryColor: '#10b981',
    badge: 'Prestige',
    borderClass: 'border-emerald-500/30',
    accentName: 'emerald',
  },
  {
    id: 'neon-violet',
    name: 'Neon Sunset',
    description: 'Ambiance nocturne cyberpunk, pourpre électrique & fuchsia',
    bgPreview: 'from-[#0d0b1a] via-slate-950 to-[#1e1035]',
    primaryColor: '#a855f7',
    badge: 'Tendance',
    borderClass: 'border-purple-500/30',
    accentName: 'violet',
  },
  {
    id: 'ocean-deep',
    name: 'Ocean Deep',
    description: 'Bleu cobalt royal profond & reflets cyan océanique',
    bgPreview: 'from-[#0b1329] via-slate-950 to-[#0c1e4a]',
    primaryColor: '#2563eb',
    badge: 'Classique',
    borderClass: 'border-blue-500/30',
    accentName: 'indigo',
  },
  {
    id: 'amber-gold',
    name: 'Or Noir & Ambre',
    description: 'Charbon chaud premium & éclats dorés haute joaillerie',
    bgPreview: 'from-[#0c0a09] via-slate-950 to-[#271c08]',
    primaryColor: '#f59e0b',
    badge: 'VIP',
    borderClass: 'border-amber-500/30',
    accentName: 'amber',
  },
  {
    id: 'crimson-dark',
    name: 'Crimson Passion',
    description: 'Noir rubis vibrant & reflets rouge carmin dynamiques',
    bgPreview: 'from-[#14080a] via-slate-950 to-[#2e0910]',
    primaryColor: '#ef4444',
    badge: 'Énergie',
    borderClass: 'border-rose-500/30',
    accentName: 'rose',
  },
  {
    id: 'clean-slate',
    name: 'Ardoise Studio',
    description: 'Minimalisme chic, tons graphite neutres & blanc argenté',
    bgPreview: 'from-slate-900 via-slate-950 to-zinc-900',
    primaryColor: '#94a3b8',
    badge: 'Épuré',
    borderClass: 'border-slate-700',
    accentName: 'slate',
  },
];

const PRODUCT_TEMPLATES = [
  {
    id: 'grid-modern',
    name: 'Grille E-Commerce Moderne',
    badge: 'Recommandé',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    description: 'Cartes visuelles immersives avec grande bannière 16:9, zoom fluide au survol, badges d\'état complets (Auto, VIP, Stock) et présentation riche.',
    features: ['Vignettes visuelles 16:9', 'Badges Auto & VIP animés', 'Prix & bouton en bas de carte', '3 à 4 colonnes réactives'],
  },
  {
    id: 'list-compact',
    name: 'Liste Compacte & Rapide',
    badge: 'Haute Conversion',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description: 'Format tableau/catalogue horizontal ultra-rapide. Maximise les commandes immédiates sur mobile et idéal pour les gros catalogues.',
    features: ['Miniature carrée 48px', 'Délai "Livraison < 2 min"', 'Lignes horizontales compactes', 'Achat en 1 clic sans scroll'],
  },
  {
    id: 'pricing-saas',
    name: 'Vitrine SaaS & Formules Pro',
    badge: 'Style SaaS B2B',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    description: 'Cartes type grille de tarifs SaaS avec bordure dégradée, prix en grand format, liste d\'avantages vérifiés avec coches et bouton pleine largeur.',
    features: ['Bordure dégradée lumineuse', 'Tarif pro mis en avant', 'Coches d\'avantages garantis (✓)', 'CTA pleine largeur percutant'],
  },
  {
    id: 'minimal-glass',
    name: 'Minimaliste & Glass Luxe',
    badge: 'Design Épuré',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    description: 'Design épuré et ultra-moderne effet verre poli. Typographie fine, reflets subtils et focus absolu sur la valeur du produit.',
    features: ['Effet verre translucide', 'Bordures fines & reflets', 'Design épuré tech luxury', 'Bouton capsule sobre'],
  },
  {
    id: 'marketplace-flash',
    name: 'Marketplace Gaming & Ventes Flash',
    badge: 'Style Eneba / G2A',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    description: 'Ambiance marketplace & gaming percutante avec étiquettes de remise rouge vif (-50%), jauges de stock en temps réel et effet d\'urgence.',
    features: ['Tag de réduction animé (-50%)', 'Jauge de stock en direct', 'Effet d\'urgence & rareté', 'Achat éclair instantané'],
  },
  {
    id: 'agency-ai',
    name: 'Studio IA & Tech Cyberpunk',
    badge: 'Design Futuriste',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    description: 'Design ultra-technologique aux reflets néon cyan et violet, idéal pour valoriser les outils d\'IA (ChatGPT, Midjourney, Canva Pro, CapCut) et logiciels pro.',
    features: ['Bordures néon cyan & violettes', 'Typographie tech monospace', 'Bouton lumineux avec halo', 'Tags IA & Licences officielles'],
  },
  {
    id: 'whatsapp-express',
    name: 'Catalogue WhatsApp & Mobile-First',
    badge: 'Spécial Afrique Mobile',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description: 'Format cartes sociales ultra-rapides conçu pour smartphone. Intègre un double bouton : Commande directe sur le site ou Commande directe par WhatsApp pré-rempli.',
    features: ['Double CTA : Site + WhatsApp', 'Format vertical très fluide', 'Chargement ultra-léger', 'Message WhatsApp pré-rempli'],
  },
];

const AVAILABLE_FONTS = [
  { id: 'Inter', name: 'Inter', desc: 'Standard moderne, lisibilité parfaite' },
  { id: 'Poppins', name: 'Poppins', desc: 'Géométrique, chaleureuse & percutante' },
  { id: 'Montserrat', name: 'Montserrat', desc: 'Élégance premium & majuscules royales' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', desc: 'Design tech & ultra-moderne' },
  { id: 'Outfit', name: 'Outfit', desc: 'Futuriste, légère & équilibrée' },
  { id: 'Roboto', name: 'Roboto', desc: 'Universelle, claire & intemporelle' },
];

const BUTTON_RADIUS_OPTIONS = [
  { id: 'rounded-full', name: 'Pilule (Max)', className: 'rounded-full' },
  { id: 'rounded-xl', name: 'Moderne (Arrondi chic)', className: 'rounded-xl' },
  { id: 'rounded-lg', name: 'Doux (Carré adouci)', className: 'rounded-lg' },
  { id: 'rounded-none', name: 'Brutaliste (Droit)', className: 'rounded-none' },
];

const BUTTON_COLOR_PRESETS = [
  { name: 'Cyan Tech', color: '#0284c7' },
  { name: 'Émeraude', color: '#10b981' },
  { name: 'Violet Néon', color: '#8b5cf6' },
  { name: 'Ambre Doré', color: '#f59e0b' },
  { name: 'Rose Fushia', color: '#f43f5e' },
  { name: 'Bleu Royal', color: '#2563eb' },
  { name: 'Rouge Feu', color: '#dc2626' },
  { name: 'Noir Carbone', color: '#0f172a' },
  { name: 'Blanc Pur', color: '#ffffff' },
];

interface NavItem {
  id: 'overview' | 'products' | 'storefront' | 'subscription' | 'orders' | 'wallet' | 'marketing' | 'support';
  label: string;
  shortLabel: string;
  icon: any;
  description: string;
  badge?: string | number | null;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function ResellerDashboardPage() {
  const router = useRouter();
  const { formatPrice, formatBoth, currency, setCurrency } = useCurrency();

  const [loading, setLoading] = useState<boolean>(true);
  const [reseller, setReseller] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'storefront' | 'subscription' | 'orders' | 'wallet' | 'marketing' | 'support'>('overview');

  // Copy feedback
  const [copiedLink, setCopiedLink] = useState(false);

  // Products Tab State
  const [resellerCatalogMode, setResellerCatalogMode] = useState<'PRODUCTS' | 'EXCLUSIVE' | 'OTP'>('PRODUCTS');
  const [products, setProducts] = useState<any[]>([]);
  const [hasExclusiveFeature, setHasExclusiveFeature] = useState<boolean>(false);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [searchProduct, setSearchProduct] = useState<string>('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('Tous');
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});
  const [productPage, setProductPage] = useState<number>(1);
  const [productsPerPage, setProductsPerPage] = useState<number>(15);

  useEffect(() => {
    setProductPage(1);
  }, [searchProduct, productCategoryFilter, resellerCatalogMode]);

  // Reseller OTP Catalog State
  const [otpCountries, setOtpCountries] = useState<any[]>([]);
  const [otpServices, setOtpServices] = useState<any[]>([]);
  const [selectedOtpCountry, setSelectedOtpCountry] = useState<string>('1');
  const [loadingOtp, setLoadingOtp] = useState<boolean>(false);
  const [searchOtp, setSearchOtp] = useState<string>('');
  const [otpCategoryFilter, setOtpCategoryFilter] = useState<string>('Tous');
  const [editedVisibility, setEditedVisibility] = useState<Record<string, boolean>>({});
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [productSaveMsg, setProductSaveMsg] = useState<{ id: string; success: boolean; text: string } | null>(null);
  const [copiedPageSlug, setCopiedPageSlug] = useState<string | null>(null);
  // Reseller Products Bulk Pricing & Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showBulkPricingModal, setShowBulkPricingModal] = useState<boolean>(false);
  const [savingAllProducts, setSavingAllProducts] = useState<boolean>(false);
  const [productBulkMsg, setProductBulkMsg] = useState<string | null>(null);
  const [editedOtpPrices, setEditedOtpPrices] = useState<Record<string, number>>({});
  const [editedOtpVisibility, setEditedOtpVisibility] = useState<Record<string, boolean>>({});
  const [globalApplyOtp, setGlobalApplyOtp] = useState<Record<string, boolean>>({});
  const [savingOtpCode, setSavingOtpCode] = useState<string | null>(null);
  const [otpSaveMsg, setOtpSaveMsg] = useState<{ code: string; success: boolean; text: string } | null>(null);
  const [savingAllOtp, setSavingAllOtp] = useState<boolean>(false);
  const [otpBulkMsg, setOtpBulkMsg] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Storefront Tab State
  const [storeSettings, setStoreSettings] = useState<any>({
    storeName: '',
    tagline: '',
    subdomain: '',
    customDomain: '',
    logoUrl: '',
    bannerUrl: '',
    themeColor: 'sky',
    themePreset: 'cyber-dark',
    productTemplate: 'grid-modern',
    fontFamily: 'Inter',
    buttonColor: '#0ea5e9',
    buttonTextColor: '#ffffff',
    buttonRadius: 'rounded-xl',
    contactEmail: '',
    contactPhone: '',
    contactWhatsApp: '',
    contactTelegram: '',
    bannerAnnouncement: '',
    paymentInstructions: '',
    facebookPixelId: '',
    tiktokPixelId: '',
    googleAnalyticsId: '',
    welcomeMessage: '',
    floatingChatEnabled: true,
  });
  const [savingStore, setSavingStore] = useState<boolean>(false);
  const [storeMsg, setStoreMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);
  const [uploadLogoError, setUploadLogoError] = useState<string | null>(null);

  // Marketing & Traffic Analytics State
  const [marketingSubTab, setMarketingSubTab] = useState<'analytics' | 'pixels' | 'telegram'>('analytics');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false);
  const [marketingSettings, setMarketingSettings] = useState<any>({
    facebookPixelId: '',
    tiktokPixelId: '',
    googleAnalyticsId: '',
    welcomeMessage: '',
    floatingChatEnabled: true,
  });
  const [savingMarketing, setSavingMarketing] = useState<boolean>(false);
  const [marketingMsg, setMarketingMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Reseller Telegram Notifications State
  const [telegramSettings, setTelegramSettings] = useState({
    botToken: '',
    chatId: '',
    enabled: false,
    notifyOnNewOrder: true,
    notifyOnOtpOrder: true,
    notifyOnSupportReply: true,
    notifyOnPayout: true,
    platformBotUsername: '',
  });
  const [loadingTelegram, setLoadingTelegram] = useState<boolean>(false);
  const [savingTelegram, setSavingTelegram] = useState<boolean>(false);
  const [testingTelegram, setTestingTelegram] = useState<boolean>(false);
  const [telegramMsg, setTelegramMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [telegramTestMsg, setTelegramTestMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Payment Gateways State (FeexPay & Moneroo Dynamic Payments)
  const [gatewaySettings, setGatewaySettings] = useState<any>({
    customGatewayEnabled: false,
    feexpayApiKey: '',
    feexpayShopId: '',
    feexpayEnabled: false,
    monerooSecretKey: '',
    monerooEnabled: false,
  });
  const [savingGateways, setSavingGateways] = useState<boolean>(false);
  const [gatewayMsg, setGatewayMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [showSecretKey, setShowSecretKey] = useState<boolean>(false);

  // Orders & Tickets Tab State
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStats, setOrderStats] = useState<any>({
    totalOrders: 0,
    completedOrders: 0,
    totalTurnover: 0,
    totalProfit: 0,
    walletBalance: 0,
  });
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'PENDING_PAYMENT' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [orderTypeFilter, setOrderTypeFilter] = useState<'ALL' | 'PRODUCT' | 'OTP'>('ALL');
  const [validatingOrderId, setValidatingOrderId] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [orderActionMsg, setOrderActionMsg] = useState<{ id: string; success: boolean; text: string } | null>(null);
  const [credentialsModal, setCredentialsModal] = useState<{ title: string; credentials: string; ticketCode: string } | null>(null);

  // Subscription Tab State
  const [saasPlans, setSaasPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(false);
  const [upgradingPlanId, setUpgradingPlanId] = useState<string | null>(null);
  const [planMsg, setPlanMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutPlan, setCheckoutPlan] = useState<any | null>(null);
  const [subscribingMethod, setSubscribingMethod] = useState<'WALLET' | 'FEEXPAY' | 'MONEROO' | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [activatedSuccessBanner, setActivatedSuccessBanner] = useState<string | null>(null);

  // Support Tab State
  const [resellerTickets, setResellerTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState<boolean>(false);
  const [ticketStats, setTicketStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 });
  const [selectedResellerTicketId, setSelectedResellerTicketId] = useState<string | null>(null);
  const [resellerReplyText, setResellerReplyText] = useState<string>('');
  const [sendingResellerReply, setSendingResellerReply] = useState<boolean>(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState<boolean>(false);
  const [newTicketSubject, setNewTicketSubject] = useState<string>('');
  const [newTicketCategory, setNewTicketCategory] = useState<string>('GENERAL');
  const [newTicketPriority, setNewTicketPriority] = useState<string>('MEDIUM');
  const [newTicketMessage, setNewTicketMessage] = useState<string>('');
  const [creatingTicket, setCreatingTicket] = useState<boolean>(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);
  const [ticketFilterStatus, setTicketFilterStatus] = useState<string>('ALL');

  // Payouts & Withdrawals State
  const [payouts, setPayouts] = useState<any[]>([]);
  const [payoutStats, setPayoutStats] = useState({
    totalWithdrawn: 0,
    pendingWithdrawn: 0,
  });
  const [loadingPayouts, setLoadingPayouts] = useState<boolean>(false);
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [payoutMethod, setPayoutMethod] = useState<string>('MTN Mobile Money');
  const [payoutDetails, setPayoutDetails] = useState<string>('');
  const [submittingPayout, setSubmittingPayout] = useState<boolean>(false);
  const [payoutMsg, setPayoutMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Upload Logo Handler
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadLogoError('Fichier trop lourd (max 5 Mo)');
      return;
    }

    setUploadingLogo(true);
    setUploadLogoError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/reseller/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur d\'upload');
      setStoreSettings((prev: any) => ({ ...prev, logoUrl: data.url }));
    } catch (err: any) {
      setUploadLogoError(err.message);
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  // Fetch Session & Profile
  const fetchSession = async () => {
    try {
      const res = await fetch('/api/reseller/auth');
      const data = await res.json();
      if (!data.authenticated || !data.reseller) {
        router.push('/reseller/login');
        return;
      }
      setReseller(data.reseller);
      setStoreSettings({
        storeName: data.reseller.storeName || '',
        tagline: data.reseller.tagline || '',
        subdomain: data.reseller.subdomain || '',
        customDomain: data.reseller.customDomain || '',
        logoUrl: data.reseller.logoUrl || '',
        bannerUrl: data.reseller.bannerUrl || '',
        themeColor: data.reseller.themeColor || 'sky',
        themePreset: data.reseller.themePreset || 'cyber-dark',
        productTemplate: data.reseller.productTemplate || 'grid-modern',
        fontFamily: data.reseller.fontFamily || 'Inter',
        buttonColor: data.reseller.buttonColor || '#0ea5e9',
        buttonTextColor: data.reseller.buttonTextColor || '#ffffff',
        buttonRadius: data.reseller.buttonRadius || 'rounded-xl',
        contactEmail: data.reseller.contactEmail || '',
        contactPhone: data.reseller.contactPhone || '',
        contactWhatsApp: data.reseller.contactWhatsApp || '',
        contactTelegram: data.reseller.contactTelegram || '',
        bannerAnnouncement: data.reseller.bannerAnnouncement || '',
        paymentInstructions: data.reseller.paymentInstructions || '',
        facebookPixelId: data.reseller.facebookPixelId || '',
        tiktokPixelId: data.reseller.tiktokPixelId || '',
        googleAnalyticsId: data.reseller.googleAnalyticsId || '',
        welcomeMessage: data.reseller.welcomeMessage || '',
        floatingChatEnabled: data.reseller.floatingChatEnabled !== false,
      });
      setMarketingSettings({
        facebookPixelId: data.reseller.facebookPixelId || '',
        tiktokPixelId: data.reseller.tiktokPixelId || '',
        googleAnalyticsId: data.reseller.googleAnalyticsId || '',
        welcomeMessage: data.reseller.welcomeMessage || '',
        floatingChatEnabled: data.reseller.floatingChatEnabled !== false,
      });
      setGatewaySettings({
        customGatewayEnabled: Boolean(data.reseller.customGatewayEnabled),
        feexpayApiKey: data.reseller.feexpayApiKey || '',
        feexpayShopId: data.reseller.feexpayShopId || '',
        feexpayEnabled: Boolean(data.reseller.feexpayEnabled),
        monerooSecretKey: data.reseller.monerooSecretKey || '',
        monerooEnabled: Boolean(data.reseller.monerooEnabled),
      });
    } catch (e) {
      router.push('/reseller/login');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Products
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/reseller/products');
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
        if (data.tenantPlan) {
          setHasExclusiveFeature(Boolean(data.tenantPlan.hasExclusiveFeature));
        }
        const prices: Record<string, number> = {};
        const vis: Record<string, boolean> = {};
        data.products.forEach((p: any) => {
          prices[p.id] = p.resellerSellingPrice;
          vis[p.id] = p.isEnabled;
        });
        setEditedPrices(prices);
        setEditedVisibility(vis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch Orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/reseller/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        if (data.stats) setOrderStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch Plans
  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await fetch('/api/reseller/subscription');
      const data = await res.json();
      if (data.success && data.plans) {
        setSaasPlans(data.plans);
        if (data.walletBalance !== undefined) {
          setReseller((prev: any) => prev ? { ...prev, walletBalance: data.walletBalance } : prev);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Fetch OTP Tariffs
  const fetchOtpTariffs = async (countryCode: string) => {
    setLoadingOtp(true);
    try {
      const res = await fetch(`/api/reseller/otp/services?country=${countryCode}`);
      const data = await res.json();
      if (data.success) {
        setOtpCountries(data.countries || []);
        setOtpServices(data.services || []);
        const prices: Record<string, number> = {};
        const vis: Record<string, boolean> = {};
        data.services.forEach((s: any) => {
          const key = `${countryCode}_${s.code.toLowerCase()}`;
          prices[key] = s.sellingPrice;
          vis[key] = s.isEnabled;
        });
        setEditedOtpPrices((prev) => ({ ...prev, ...prices }));
        setEditedOtpVisibility((prev) => ({ ...prev, ...vis }));
      }
    } catch (e) {
      console.error('Error fetching OTP tariffs for reseller:', e);
    } finally {
      setLoadingOtp(false);
    }
  };

  // Fetch Traffic & Conversion Analytics
  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch('/api/reseller/analytics');
      const data = await res.json();
      if (data.success && data.analytics) {
        setAnalyticsData(data.analytics);
      }
    } catch (e) {
      console.error('Error fetching analytics:', e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Handle Save Marketing & Pixels
  const handleSaveMarketing = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingMarketing(true);
    setMarketingMsg(null);
    try {
      const res = await fetch('/api/reseller/marketing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(marketingSettings),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur lors de l\'enregistrement');
      setMarketingMsg({ success: true, text: 'Paramètres marketing et pixels enregistrés avec succès !' });
      setStoreSettings((prev: any) => ({ ...prev, ...marketingSettings }));
    } catch (err: any) {
      setMarketingMsg({ success: false, text: err.message });
    } finally {
      setSavingMarketing(false);
      setTimeout(() => setMarketingMsg(null), 4000);
    }
  };

  // Save Payment Gateways Handler
  const handleSaveGateways = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingGateways(true);
    setGatewayMsg(null);
    try {
      const res = await fetch('/api/reseller/gateways', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gatewaySettings),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur lors de l\'enregistrement');
      setGatewayMsg({ success: true, text: 'Vos clés API et passerelles ont été enregistrées avec succès !' });
      setReseller((prev: any) => ({ ...prev, ...gatewaySettings }));
    } catch (err: any) {
      setGatewayMsg({ success: false, text: err.message });
    } finally {
      setSavingGateways(false);
      setTimeout(() => setGatewayMsg(null), 4000);
    }
  };

  // Fetch Reseller Support Tickets
  const fetchResellerTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch('/api/reseller/support');
      const data = await res.json();
      if (data.success && data.tickets) {
        setResellerTickets(data.tickets);
        if (data.stats) setTicketStats(data.stats);
        if (data.tickets.length > 0) {
          setSelectedResellerTicketId((prev) => prev || data.tickets[0].id);
        }
      }
    } catch (e) {
      console.error('Error fetching reseller tickets:', e);
    } finally {
      setLoadingTickets(false);
    }
  };

  // Handle Create Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) {
      setTicketError('Veuillez renseigner le sujet et votre message');
      return;
    }
    setCreatingTicket(true);
    setTicketError(null);
    try {
      const res = await fetch('/api/reseller/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newTicketSubject.trim(),
          category: newTicketCategory,
          priority: newTicketPriority,
          message: newTicketMessage.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur lors de la création');

      setTicketSuccess('Votre ticket a été créé avec succès ! Le Super Admin a été averti.');
      setNewTicketSubject('');
      setNewTicketMessage('');
      setShowNewTicketModal(false);
      await fetchResellerTickets();
      if (data.ticket) setSelectedResellerTicketId(data.ticket.id);
      setTimeout(() => setTicketSuccess(null), 4000);
    } catch (err: any) {
      setTicketError(err.message);
    } finally {
      setCreatingTicket(false);
    }
  };

  // Handle Send Reply from Reseller
  const handleSendResellerReply = async () => {
    if (!selectedResellerTicketId || !resellerReplyText.trim()) return;
    setSendingResellerReply(true);
    try {
      const res = await fetch(`/api/reseller/support/${selectedResellerTicketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: resellerReplyText.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur lors de l\'envoi');

      setResellerReplyText('');
      await fetchResellerTickets();
    } catch (err: any) {
      console.error('Error sending reply:', err);
    } finally {
      setSendingResellerReply(false);
    }
  };

  // Fetch Reseller Telegram Settings
  const fetchTelegramSettings = async () => {
    setLoadingTelegram(true);
    try {
      const res = await fetch('/api/reseller/telegram');
      const data = await res.json();
      if (data.success && data.telegram) {
        setTelegramSettings(data.telegram);
      }
    } catch (e) {
      console.error('Error fetching telegram settings:', e);
    } finally {
      setLoadingTelegram(false);
    }
  };

  // Save Reseller Telegram Settings
  const handleSaveTelegram = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingTelegram(true);
    setTelegramMsg(null);
    try {
      const res = await fetch('/api/reseller/telegram', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telegramSettings),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur lors de l\'enregistrement');
      setTelegramMsg({ success: true, text: 'Vos paramètres de notifications Telegram ont été enregistrés avec succès !' });
      setReseller((prev: any) => ({ ...prev, ...telegramSettings }));
    } catch (err: any) {
      setTelegramMsg({ success: false, text: err.message });
    } finally {
      setSavingTelegram(false);
      setTimeout(() => setTelegramMsg(null), 4000);
    }
  };

  // Test Reseller Telegram Notification
  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    setTelegramTestMsg(null);
    try {
      const res = await fetch('/api/reseller/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: telegramSettings.chatId,
          botToken: telegramSettings.botToken,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Échec de l\'envoi du test');
      setTelegramTestMsg({ success: true, text: data.message || 'Notification de test reçue sur Telegram avec succès !' });
    } catch (err: any) {
      setTelegramTestMsg({ success: false, text: err.message });
    } finally {
      setTestingTelegram(false);
      setTimeout(() => setTelegramTestMsg(null), 5000);
    }
  };

  // Fetch Reseller Payouts
  const fetchPayouts = async () => {
    setLoadingPayouts(true);
    try {
      const res = await fetch('/api/reseller/payouts');
      const data = await res.json();
      if (data.success) {
        setPayouts(data.payouts || []);
        setPayoutStats({
          totalWithdrawn: data.totalWithdrawn || 0,
          pendingWithdrawn: data.pendingWithdrawn || 0,
        });
        if (data.walletBalance !== undefined) {
          setReseller((prev: any) =>
            prev
              ? {
                  ...prev,
                  walletBalance: data.walletBalance,
                  totalEarnings: data.totalEarnings ?? prev.totalEarnings,
                }
              : prev
          );
        }
      }
    } catch (e) {
      console.error('Error fetching payouts:', e);
    } finally {
      setLoadingPayouts(false);
    }
  };

  // Submit Payout Request
  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(payoutAmount);
    if (isNaN(numAmount) || numAmount < 1) {
      setPayoutMsg({ success: false, text: 'Le montant minimum de retrait est de $1.00 USD.' });
      return;
    }
    if (!payoutDetails.trim()) {
      setPayoutMsg({
        success: false,
        text: 'Veuillez renseigner vos coordonnées de réception (Numéro Mobile Money ou Adresse USDT).',
      });
      return;
    }

    setSubmittingPayout(true);
    setPayoutMsg(null);
    try {
      const res = await fetch('/api/reseller/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          paymentMethod: payoutMethod,
          paymentDetails: payoutDetails.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la demande de retrait');
      }
      setPayoutMsg({ success: true, text: data.message });
      setPayoutAmount('');
      setPayoutDetails('');
      fetchPayouts();
    } catch (err: any) {
      setPayoutMsg({ success: false, text: err.message });
    } finally {
      setSubmittingPayout(false);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchResellerTickets();
    fetchPayouts();
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      const activated = urlParams.get('activated');
      const planParam = urlParams.get('plan');
      if (tabParam === 'subscription') {
        setActiveTab('subscription');
      } else if (tabParam === 'support') {
        setActiveTab('support');
      } else if (tabParam === 'wallet') {
        setActiveTab('wallet');
      }
      if (activated === 'true') {
        setActiveTab('subscription');
        setActivatedSuccessBanner(planParam || 'Votre nouvelle offre');
      }
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
      if (reseller?.subdomain) fetchOtpTariffs(selectedOtpCountry);
    }
    if (activeTab === 'orders' || activeTab === 'overview') fetchOrders();
    if (activeTab === 'subscription') fetchPlans();
    if (activeTab === 'wallet' || activeTab === 'overview') fetchPayouts();
    if (activeTab === 'marketing') {
      fetchAnalytics();
      fetchTelegramSettings();
    }
    if (activeTab === 'support') fetchResellerTickets();
  }, [activeTab, reseller?.subdomain]);

  useEffect(() => {
    if (activeTab === 'products' && resellerCatalogMode === 'OTP' && reseller?.subdomain) {
      fetchOtpTariffs(selectedOtpCountry);
    }
  }, [selectedOtpCountry, resellerCatalogMode]);

  // Handle Logout
  const handleLogout = async () => {
    await fetch('/api/reseller/auth', { method: 'DELETE' });
    router.push('/reseller/login');
  };

  // Copy Store Link
  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const sub = reseller?.subdomain || '';
    const storeUrl = origin.includes('abonnementspro.com')
      ? `https://${sub}.abonnementspro.com`
      : `${origin}/store/${sub}`;
    navigator.clipboard.writeText(storeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Copy Dedicated Product Sales Funnel Link (for WhatsApp / Ads)
  const handleCopyProductSalesPageLink = (slugOrId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const sub = reseller?.subdomain || '';
    const pageUrl = origin.includes('abonnementspro.com')
      ? `https://${sub}.abonnementspro.com/p/${slugOrId}`
      : `${origin}/store/${sub}/p/${slugOrId}`;
    navigator.clipboard.writeText(pageUrl);
    setCopiedPageSlug(slugOrId);
    setTimeout(() => setCopiedPageSlug(null), 2500);
  };

  // Save Single Product
  const handleSaveProduct = async (prodId: string) => {
    setSavingProductId(prodId);
    setProductSaveMsg(null);
    try {
      const res = await fetch('/api/reseller/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: prodId,
          customSellingPrice: editedPrices[prodId],
          isEnabled: editedVisibility[prodId],
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur');
      setProductSaveMsg({ id: prodId, success: true, text: 'Enregistré !' });
      // Update local product list calculation
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === prodId) {
            const newPrice = editedPrices[prodId];
            const newProfit = Math.max(0, newPrice - p.resellerBuyPrice);
            return {
              ...p,
              resellerSellingPrice: newPrice,
              resellerProfit: parseFloat(newProfit.toFixed(2)),
              isEnabled: editedVisibility[prodId],
              hasCustomPrice: true,
            };
          }
          return p;
        })
      );
    } catch (err: any) {
      setProductSaveMsg({ id: prodId, success: false, text: err.message });
    } finally {
      setSavingProductId(null);
      setTimeout(() => setProductSaveMsg(null), 3000);
    }
  };

  // Apply Bulk Product Pricing from Modal
  const handleBulkApplyPricing = async (
    updates: { productId: string; customSellingPrice: number | null; isEnabled?: boolean }[]
  ) => {
    setSavingAllProducts(true);
    setProductBulkMsg(null);
    try {
      const res = await fetch('/api/reseller/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulkUpdates: updates }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur lors de la mise à jour');

      const updatesMap = new Map(updates.map((u) => [u.productId, u]));
      const newEditedPrices = { ...editedPrices };
      const newEditedVis = { ...editedVisibility };

      setProducts((prev) =>
        prev.map((p) => {
          const u = updatesMap.get(p.id);
          if (!u) return p;
          const newPrice = u.customSellingPrice ?? p.baseSellingPrice;
          newEditedPrices[p.id] = newPrice;
          if (u.isEnabled !== undefined) newEditedVis[p.id] = u.isEnabled;
          const newProfit = Math.max(0, newPrice - p.resellerBuyPrice);
          return {
            ...p,
            resellerSellingPrice: newPrice,
            resellerProfit: parseFloat(newProfit.toFixed(2)),
            isEnabled: u.isEnabled !== undefined ? u.isEnabled : p.isEnabled,
            hasCustomPrice: u.customSellingPrice !== null,
          };
        })
      );
      setEditedPrices(newEditedPrices);
      setEditedVisibility(newEditedVis);
      setSelectedProductIds([]);
      setProductBulkMsg(data.message || `${updates.length} articles mis à jour avec succès !`);
      setTimeout(() => setProductBulkMsg(null), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingAllProducts(false);
    }
  };

  // Save all manual inline product edits in one click
  const handleSaveAllProductsOnPage = async () => {
    setSavingAllProducts(true);
    setProductBulkMsg(null);
    try {
      const bulkUpdates = products.map((p) => ({
        productId: p.id,
        customSellingPrice: editedPrices[p.id] ?? p.resellerSellingPrice,
        isEnabled: editedVisibility[p.id] !== undefined ? editedVisibility[p.id] : p.isEnabled,
      }));

      const res = await fetch('/api/reseller/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulkUpdates }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur');

      // Update local product calculations
      setProducts((prev) =>
        prev.map((p) => {
          const newPrice = editedPrices[p.id] ?? p.resellerSellingPrice;
          const newProfit = Math.max(0, newPrice - p.resellerBuyPrice);
          return {
            ...p,
            resellerSellingPrice: newPrice,
            resellerProfit: parseFloat(newProfit.toFixed(2)),
            isEnabled: editedVisibility[p.id] !== undefined ? editedVisibility[p.id] : p.isEnabled,
            hasCustomPrice: true,
          };
        })
      );

      setProductBulkMsg('Tous les tarifs et visibilités du catalogue ont été enregistrés avec succès !');
      setTimeout(() => setProductBulkMsg(null), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingAllProducts(false);
    }
  };

  // Toggle visibility in bulk for selected products
  const handleToggleSelectedVisibility = async (enable: boolean) => {
    if (selectedProductIds.length === 0) return;
    setSavingAllProducts(true);
    setProductBulkMsg(null);
    try {
      const bulkUpdates = selectedProductIds.map((id) => ({
        productId: id,
        customSellingPrice: editedPrices[id] ?? null,
        isEnabled: enable,
      }));

      const res = await fetch('/api/reseller/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulkUpdates }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur');

      const newVis = { ...editedVisibility };
      selectedProductIds.forEach((id) => {
        newVis[id] = enable;
      });
      setEditedVisibility(newVis);
      setProducts((prev) =>
        prev.map((p) => (selectedProductIds.includes(p.id) ? { ...p, isEnabled: enable } : p))
      );
      setProductBulkMsg(
        `${selectedProductIds.length} article(s) ${enable ? 'activé(s)' : 'masqué(s)'} sur votre vitrine !`
      );
      setTimeout(() => setProductBulkMsg(null), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingAllProducts(false);
    }
  };

  // Toggle selection for a single product
  const toggleSelectProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Save Single OTP Service
  const handleSaveOtpService = async (serviceCode: string) => {
    const key = `${selectedOtpCountry}_${serviceCode.toLowerCase()}`;
    setSavingOtpCode(serviceCode);
    setOtpSaveMsg(null);
    try {
      const isGlobal = Boolean(globalApplyOtp[serviceCode.toLowerCase()]);
      const currentPrice = editedOtpPrices[key];
      const currentVis = editedOtpVisibility[key] !== false;

      const res = await fetch('/api/reseller/otp/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceCode: serviceCode,
          country: selectedOtpCountry,
          customSellingPrice: currentPrice,
          isEnabled: currentVis,
          applyAllCountries: isGlobal,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur');
      setOtpSaveMsg({ code: serviceCode, success: true, text: 'Enregistré !' });

      // Update local state
      setOtpServices((prev) =>
        prev.map((s) => {
          if (s.code.toLowerCase() === serviceCode.toLowerCase()) {
            const newPrice = currentPrice ?? s.sellingPrice;
            const newProfit = Math.max(0, newPrice - s.resellerBuyPrice);
            return {
              ...s,
              sellingPrice: newPrice,
              resellerProfit: parseFloat(newProfit.toFixed(2)),
              isEnabled: currentVis,
              hasCustomPrice: true,
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      setOtpSaveMsg({ code: serviceCode, success: false, text: err.message });
    } finally {
      setSavingOtpCode(null);
      setTimeout(() => setOtpSaveMsg(null), 3000);
    }
  };

  // Toggle All OTP Services on/off for current country
  const handleToggleAllOtpServices = async (enable: boolean) => {
    setSavingAllOtp(true);
    setOtpBulkMsg(null);
    try {
      const res = await fetch('/api/reseller/otp/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: enable ? 'ENABLE_ALL' : 'DISABLE_ALL',
          country: selectedOtpCountry,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur');
      const newVis = { ...editedOtpVisibility };
      otpServices.forEach((s) => {
        newVis[`${selectedOtpCountry}_${s.code.toLowerCase()}`] = enable;
      });
      setEditedOtpVisibility(newVis);
      setOtpServices((prev) => prev.map((s) => ({ ...s, isEnabled: enable })));
      setOtpBulkMsg(data.message);
      setTimeout(() => setOtpBulkMsg(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingAllOtp(false);
    }
  };

  // Save All OTP Services changes at once
  const handleSaveAllOtpOnPage = async () => {
    setSavingAllOtp(true);
    setOtpBulkMsg(null);
    try {
      const bulkUpdates = otpServices.map((s) => {
        const key = `${selectedOtpCountry}_${s.code.toLowerCase()}`;
        return {
          serviceCode: s.code,
          country: selectedOtpCountry,
          customSellingPrice: editedOtpPrices[key] ?? s.sellingPrice,
          isEnabled: editedOtpVisibility[key] !== undefined ? editedOtpVisibility[key] : s.isEnabled,
          applyAllCountries: Boolean(globalApplyOtp[s.code.toLowerCase()]),
        };
      });

      const res = await fetch('/api/reseller/otp/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulkUpdates }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur');

      setOtpBulkMsg('Tous les tarifs et visibilités OTP ont été enregistrés !');
      setTimeout(() => setOtpBulkMsg(null), 4000);
      fetchOtpTariffs(selectedOtpCountry);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingAllOtp(false);
    }
  };

  // Save Store Settings
  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStore(true);
    setStoreMsg(null);
    try {
      const res = await fetch('/api/reseller/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeSettings),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur');
      setStoreMsg({ success: true, text: data.message || 'Vitrine enregistrée !' });
      // Refresh session
      fetchSession();
    } catch (err: any) {
      setStoreMsg({ success: false, text: err.message });
    } finally {
      setSavingStore(false);
    }
  };

  // Change Subscription Plan to Free
  const handleSwitchToFree = async () => {
    setUpgradingPlanId('free');
    setPlanMsg(null);
    try {
      const res = await fetch('/api/reseller/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: 'free' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Erreur');
      setPlanMsg({ success: true, text: data.message });
      fetchSession();
      fetchPlans();
      fetchProducts();
    } catch (err: any) {
      setPlanMsg({ success: false, text: err.message });
    } finally {
      setUpgradingPlanId(null);
    }
  };

  // Execute Subscription Checkout via chosen payment method
  const handleExecuteSubscription = async (method: 'WALLET' | 'FEEXPAY' | 'MONEROO') => {
    if (!checkoutPlan) return;
    setSubscribingMethod(method);
    setCheckoutError(null);

    try {
      const res = await fetch('/api/reseller/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: checkoutPlan.id,
          billingInterval,
          paymentMethod: method,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors du traitement du paiement');
      }

      // If redirect URL from gateway
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      // If direct wallet debit
      setPlanMsg({ success: true, text: data.message });
      setActivatedSuccessBanner(checkoutPlan.name);
      setCheckoutPlan(null);
      fetchSession();
      fetchPlans();
      fetchProducts();
    } catch (err: any) {
      setCheckoutError(err.message || 'Une erreur est survenue.');
    } finally {
      setSubscribingMethod(null);
    }
  };

  // Validate Ticket Handler
  const handleValidateTicket = async (orderId: string, ticketCode: string) => {
    setValidatingOrderId(orderId);
    setOrderActionMsg(null);
    try {
      const res = await fetch('/api/reseller/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, ticketCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la validation');
      }
      setOrderActionMsg({ id: orderId, success: true, text: 'Ticket validé & livré !' });
      // Update order in state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: 'COMPLETED', deliveredCredentials: data.deliveredCredentials }
            : o
        )
      );
      // Refresh session for wallet balance
      fetchSession();
      fetchOrders();
    } catch (err: any) {
      setOrderActionMsg({ id: orderId, success: false, text: err.message });
    } finally {
      setValidatingOrderId(null);
      setTimeout(() => setOrderActionMsg(null), 4000);
    }
  };

  // Cancel Ticket Handler
  const handleCancelTicket = async (orderId: string, ticketCode: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce ticket ?')) return;
    setCancellingOrderId(orderId);
    setOrderActionMsg(null);
    try {
      const res = await fetch('/api/reseller/tickets/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, ticketCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de l\'annulation');
      }
      setOrderActionMsg({ id: orderId, success: true, text: 'Ticket annulé' });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
      );
      fetchOrders();
    } catch (err: any) {
      setOrderActionMsg({ id: orderId, success: false, text: err.message });
    } finally {
      setCancellingOrderId(null);
      setTimeout(() => setOrderActionMsg(null), 4000);
    }
  };

  // Validate OTP Ticket Handler
  const handleValidateOtpTicket = async (orderId: string, ticketCode: string) => {
    setValidatingOrderId(orderId);
    setOrderActionMsg(null);
    try {
      const res = await fetch('/api/reseller/otp/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, ticketCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la validation OTP');
      }
      setOrderActionMsg({ id: orderId, success: true, text: 'Ticket OTP activé avec succès ! Numéro attribué.' });
      fetchSession();
      fetchOrders();
    } catch (err: any) {
      setOrderActionMsg({ id: orderId, success: false, text: err.message });
    } finally {
      setValidatingOrderId(null);
      setTimeout(() => setOrderActionMsg(null), 4000);
    }
  };

  // Cancel OTP Ticket Handler
  const handleCancelOtpTicket = async (orderId: string, ticketCode: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce ticket OTP ?')) return;
    setCancellingOrderId(orderId);
    setOrderActionMsg(null);
    try {
      const res = await fetch('/api/reseller/otp/tickets/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, ticketCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de l\'annulation OTP');
      }
      setOrderActionMsg({ id: orderId, success: true, text: 'Ticket OTP annulé' });
      fetchOrders();
    } catch (err: any) {
      setOrderActionMsg({ id: orderId, success: false, text: err.message });
    } finally {
      setCancellingOrderId(null);
      setTimeout(() => setOrderActionMsg(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Chargement de votre espace revendeur...</p>
        </div>
      </div>
    );
  }

  const currentPlan = reseller?.plan;
  const sub = reseller?.subdomain || '';
  const storeUrl = typeof window !== 'undefined'
    ? (window.location.origin.includes('abonnementspro.com')
        ? `https://${sub}.abonnementspro.com`
        : `${window.location.origin}/store/${sub}`)
    : `https://${sub}.abonnementspro.com`;

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (resellerCatalogMode === 'EXCLUSIVE' && !p.isExclusive) return false;
    if (resellerCatalogMode === 'PRODUCTS' && p.isExclusive) return false;

    const matchCat = productCategoryFilter === 'Tous' || p.category === productCategoryFilter;
    const matchSearch =
      searchProduct === '' ||
      p.title.toLowerCase().includes(searchProduct.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchProduct.toLowerCase()));
    return matchCat && matchSearch;
  });

  // Paginated products in dashboard
  const totalDashboardProductPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const dashboardProductStartIndex = (productPage - 1) * productsPerPage;
  const dashboardProductEndIndex = Math.min(dashboardProductStartIndex + productsPerPage, filteredProducts.length);
  const paginatedDashboardProducts = filteredProducts.slice(dashboardProductStartIndex, dashboardProductEndIndex);

  const categories = ['Tous', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const isAllCurrentPageSelected =
    paginatedDashboardProducts.length > 0 &&
    paginatedDashboardProducts.every((p) => selectedProductIds.includes(p.id));

  const toggleSelectAllCurrentPage = () => {
    if (isAllCurrentPageSelected) {
      const pageIds = paginatedDashboardProducts.map((p) => p.id);
      setSelectedProductIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedDashboardProducts.map((p) => p.id);
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const modifiedProductsCount = products.filter((p) => {
    const priceChanged =
      editedPrices[p.id] !== undefined &&
      Math.abs(editedPrices[p.id] - p.resellerSellingPrice) > 0.001;
    const visChanged =
      editedVisibility[p.id] !== undefined && editedVisibility[p.id] !== p.isEnabled;
    return priceChanged || visChanged;
  }).length;

  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING_PAYMENT').length;
  const pendingTicketsCount = resellerTickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  const switchTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const NAV_GROUPS: NavGroup[] = [
    {
      title: 'Activité & Ventes',
      items: [
        {
          id: 'overview' as const,
          label: "Vue d'ensemble",
          shortLabel: 'Accueil',
          icon: TrendingUp,
          description: 'Cockpit de pilotage & métriques clés',
          badge: null,
          badgeColor: '',
        },
        {
          id: 'products' as const,
          label: 'Catalogue & Marges',
          shortLabel: 'Catalogue',
          icon: Package,
          description: 'Articles, prix grossiste & marges',
          badge: products.length > 0 ? products.length : null,
          badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
        },
        {
          id: 'orders' as const,
          label: 'Commandes & Tickets',
          shortLabel: 'Commandes',
          icon: ShoppingCart,
          description: 'Suivi et livraisons clients',
          badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} attente` : orders.length > 0 ? orders.length : null,
          badgeColor: pendingOrdersCount > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-slate-300 border-slate-700',
        },
        {
          id: 'wallet' as const,
          label: 'Finances & Retraits',
          shortLabel: 'Portefeuille',
          icon: Coins,
          description: 'Solde & demandes de paiement',
          badge: reseller?.walletBalance ? `$${(reseller.walletBalance).toFixed(0)}` : null,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
      ],
    },
    {
      title: 'Boutique & Marketing',
      items: [
        {
          id: 'storefront' as const,
          label: 'Boutique & Design',
          shortLabel: 'Boutique',
          icon: Store,
          description: '7 templates, couleurs, logo & paiements',
          badge: '7 Styles',
          badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        },
        {
          id: 'marketing' as const,
          label: 'Marketing & Pixels',
          shortLabel: 'Marketing',
          icon: Share2,
          description: 'Pixels Facebook/TikTok & Telegram',
          badge: null,
          badgeColor: '',
        },
      ],
    },
    {
      title: 'Compte & Partenariat',
      items: [
        {
          id: 'subscription' as const,
          label: 'Abonnement Grossiste',
          shortLabel: 'Abonnement',
          icon: Crown,
          description: `Plan ${currentPlan?.name || 'Free'} & remises d'usine`,
          badge: currentPlan?.id === 'pro' ? 'VIP' : currentPlan?.id === 'starter' ? 'STARTER' : 'STANDARD',
          badgeColor: currentPlan?.id === 'pro' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        },
        {
          id: 'support' as const,
          label: 'Support & Assistance',
          shortLabel: 'Support',
          icon: LifeBuoy,
          description: 'Assistance directe Super Admin',
          badge: pendingTicketsCount > 0 ? `${pendingTicketsCount}` : null,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        },
      ],
    },
  ];

  const currentTabMeta = NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === activeTab) || NAV_GROUPS[0].items[0];
  const CurrentTabIcon = currentTabMeta.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white pb-20 lg:pb-0">
      {/* Top Header - Executive SaaS Design */}
      <header className="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Left: Mobile Menu Button + Brand & Subdomain */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger button for mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all shrink-0"
              title="Ouvrir le menu de navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-black text-base shrink-0">
              {reseller?.storeName ? reseller.storeName.charAt(0).toUpperCase() : 'R'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-white text-sm sm:text-base tracking-tight truncate">
                  {reseller?.storeName || 'Ma Boutique'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  En ligne
                </span>
                <button
                  onClick={() => switchTab('subscription')}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 ${
                    currentPlan?.id === 'pro'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : currentPlan?.id === 'starter'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                  title="Gérer mon abonnement et mes remises"
                >
                  Plan {currentPlan?.name || 'Free'}
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono truncate">
                <span className="text-sky-400 font-bold">{reseller?.subdomain}.abonnementspro.com</span>
              </div>
            </div>
          </div>

          {/* Right: Currency Switcher, Solde, Store link & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-sky-500 cursor-pointer hidden sm:block"
              title="Devise d'affichage"
            >
              <option value="XOF">XOF (FCFA)</option>
              <option value="XAF">XAF (FCFA)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>

            {/* Quick Wallet Pill */}
            <button
              onClick={() => switchTab('wallet')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-xs transition-all group"
              title="Voir mon portefeuille et demander un retrait"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-slate-400 hidden sm:inline">Solde :</span>
              <span className="font-mono font-bold text-amber-400">
                ${(reseller?.walletBalance || 0).toFixed(2)}
              </span>
            </button>

            {/* View Store Button */}
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20"
            >
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden md:inline">Voir ma vitrine</span>
            </a>

            {/* Share / Copy Link */}
            <button
              onClick={handleCopyLink}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Copier le lien public de ma boutique"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden lg:inline">{copiedLink ? 'Copié !' : 'Partager'}</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Déconnexion"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Quitter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container: Desktop Sidebar + Content Area */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 gap-6 items-start">
        {/* ======================================================== */}
        {/* DESKTOP SIDEBAR (Visible on lg+)                        */}
        {/* ======================================================== */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-20 bg-slate-900/80 border border-slate-800/80 rounded-3xl p-4 shadow-xl backdrop-blur-xl space-y-5">
          {/* Navigation Groups */}
          <div className="space-y-4">
            {NAV_GROUPS.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {group.title}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => switchTab(item.id)}
                        className={`w-full px-3 py-2 rounded-2xl text-xs font-bold flex items-center justify-between transition-all group ${
                          isActive
                            ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20 font-black'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-110 text-slate-950' : 'text-slate-400 group-hover:text-white'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold shrink-0 border ${
                              isActive
                                ? 'bg-slate-950/20 text-slate-950 border-slate-950/30'
                                : item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
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

          {/* Mini Wallet Card on Sidebar */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Solde Disponible</span>
              <div className="text-xl font-black text-amber-400 font-mono">
                ${(reseller?.walletBalance || 0).toFixed(2)}
              </div>
              <button
                onClick={() => switchTab('wallet')}
                className="w-full mt-1 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Demander un retrait</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* MAIN TAB CONTENT CONTAINER                              */}
        {/* ======================================================== */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Active Section Breadcrumb & Quick Toolbar */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
                <CurrentTabIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-white leading-tight">
                  {currentTabMeta.label}
                </h1>
                <p className="text-[11px] text-slate-400">
                  {currentTabMeta.description}
                </p>
              </div>
            </div>

            {/* Quick Contextual Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {activeTab === 'products' && (
                <button
                  onClick={() => setShowBulkPricingModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Ajuster en bloc</span>
                </button>
              )}
              {activeTab === 'orders' && (
                <button
                  onClick={fetchOrders}
                  disabled={loadingOrders}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                  <span>Actualiser</span>
                </button>
              )}
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Tester ma vitrine</span>
              </a>
            </div>
          </div>

        {/* TAB 1: OVERVIEW - COCKPIT PRO */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Hero Welcome Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Vitrine Ouverte 24h/24
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      Plan {currentPlan?.name || 'Free'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      Template : {PRODUCT_TEMPLATES.find((t) => t.id === (storeSettings.productTemplate || 'grid-modern'))?.name || 'Grille'}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Bonjour, {reseller?.name} 👋
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                    Bienvenue sur votre cockpit revendeur. Suivez vos commandes, ajustez vos marges et partagez votre vitrine logicielle officielle pour générer des ventes.
                  </p>

                  {/* Public link bar */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-sky-400 max-w-full truncate">
                      <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{storeUrl}</span>
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Lien copié' : 'Copier'}</span>
                    </button>
                    <a
                      href={storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Tester ma vitrine</span>
                    </a>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('products')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Package className="w-4 h-4 text-sky-400" />
                    <span>Ajuster mes prix</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('storefront')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Store className="w-4 h-4 text-amber-400" />
                    <span>Changer mon design</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('wallet')}
                    className="col-span-2 sm:col-span-1 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <span>Retirer mes gains</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Executive KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Turnover */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Chiffre d'Affaires
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  ${orderStats.totalTurnover.toFixed(2)}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>Volume brut des ventes</span>
                </div>
              </div>

              {/* Net Profit */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Bénéfice Net
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                  +${orderStats.totalProfit.toFixed(2)}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Gains nets réels (100% à vous)</span>
                </div>
              </div>

              {/* Orders */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Commandes
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {orderStats.completedOrders}{' '}
                  <span className="text-base text-slate-500 font-normal">/ {orderStats.totalOrders}</span>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          orderStats.totalOrders > 0
                            ? Math.round((orderStats.completedOrders / orderStats.totalOrders) * 100)
                            : 100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {orderStats.totalOrders > 0
                      ? `${Math.round((orderStats.completedOrders / orderStats.totalOrders) * 100)}% livrées avec succès`
                      : 'Prêt à recevoir des commandes'}
                  </span>
                </div>
              </div>

              {/* Available Balance */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Solde Retirable
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
                  ${(reseller?.walletBalance || 0).toFixed(2)}
                </div>
                <button
                  onClick={() => setActiveTab('wallet')}
                  className="mt-2 text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Demander un virement</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Quick Launch Checklist (4-Step Store Health) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Guide de Configuration & Santé de votre Boutique
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500">4 étapes clés</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {/* Step 1 */}
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Étape 1</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="font-bold text-white text-xs">Vitrine Opérationnelle</div>
                  <p className="text-[11px] text-sky-400 font-mono truncate">{reseller?.subdomain}.abonnementspro.com</p>
                </div>

                {/* Step 2 */}
                <div
                  onClick={() => setActiveTab('storefront')}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-sky-500/40 cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-sky-400 font-bold uppercase">Étape 2</span>
                    <Store className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="font-bold text-white text-xs group-hover:text-sky-300 transition-colors">
                    Template & Design
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {PRODUCT_TEMPLATES.find((t) => t.id === (storeSettings.productTemplate || 'grid-modern'))?.name || 'Grille Moderne'}
                  </p>
                </div>

                {/* Step 3 */}
                <div
                  onClick={() => setActiveTab('products')}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Étape 3</span>
                    <Package className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="font-bold text-white text-xs group-hover:text-amber-300 transition-colors">
                    Catalogue & Marges
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {products.length} articles disponibles
                  </p>
                </div>

                {/* Step 4 */}
                <div
                  onClick={() => setActiveTab('storefront')}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">Étape 4</span>
                    <CreditCard className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="font-bold text-white text-xs group-hover:text-indigo-300 transition-colors">
                    Paiements Clients
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {storeSettings.feexpayEnabled ? 'FeexPay Actif' : storeSettings.monerooEnabled ? 'Moneroo Actif' : 'Virement direct ticket'}
                  </p>
                </div>
              </div>
            </div>

            {/* Split: Recent Orders (65%) & Wholesale Discount Card (35%) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Recent Orders Activity (2 cols on lg) */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-sky-400" />
                    <h3 className="font-bold text-sm text-white">Dernières Commandes Clients</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    <span>Voir tout ({orders.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl bg-slate-950/60 border border-slate-800/80 p-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Aucune commande pour le moment</div>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                        Partagez le lien de votre vitrine sur WhatsApp, Telegram ou vos réseaux pour enregistrer vos premières ventes.
                      </p>
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Partager ma boutique</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400">
                          <th className="pb-2.5">Ticket</th>
                          <th className="pb-2.5">Article</th>
                          <th className="pb-2.5">Client</th>
                          <th className="pb-2.5">Prix</th>
                          <th className="pb-2.5 text-emerald-400">Bénéfice</th>
                          <th className="pb-2.5">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium">
                        {orders.slice(0, 5).map((o) => {
                          const isSuccess = o.status === 'COMPLETED' || o.status === 'VALIDATED';
                          const isPending = o.status === 'PENDING_PAYMENT' || o.status === 'PENDING';
                          return (
                            <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="py-2.5 font-mono text-sky-400 font-bold">
                                {o.ticketCode || o.id.slice(0, 8)}
                              </td>
                              <td className="py-2.5 text-white font-bold max-w-[150px] truncate" title={o.productTitle}>
                                {o.productTitle}
                              </td>
                              <td className="py-2.5 text-slate-400 max-w-[120px] truncate">
                                {o.customerEmail || o.customerName || 'Anonyme'}
                              </td>
                              <td className="py-2.5 font-mono font-bold text-white">
                                ${(o.totalAmount || o.unitSellingPrice || 0).toFixed(2)}
                              </td>
                              <td className="py-2.5 font-mono font-bold text-emerald-400">
                                +${(o.profitMargin || 0).toFixed(2)}
                              </td>
                              <td className="py-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    isSuccess
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : isPending
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  }`}
                                >
                                  {isSuccess ? 'Livré' : isPending ? 'En attente' : o.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Right Column: Wholesale Discount & Plan Box */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-purple-400" />
                      Statut Grossiste
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                      Plan {currentPlan?.name || 'Free'}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white leading-snug">
                    {currentPlan?.id === 'pro'
                      ? 'Tarif Grossiste VIP Activé'
                      : currentPlan?.id === 'starter'
                      ? 'Tarif Grossiste Starter Activé'
                      : 'Tarif Standard Plateforme'}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Votre marge commerciale est maximale : vous achetez à prix d'usine déduit et vous fixez librement votre prix de vente client.
                  </p>

                  {/* Clean Visual Calculation Scheme */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-[11px] font-mono">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Prix Public Catalogue</span>
                      <span>100%</span>
                    </div>
                    <div className="flex justify-between items-center text-sky-400 font-bold">
                      <span>Votre Remise Plan {currentPlan?.name}</span>
                      <span>
                        {currentPlan?.id === 'pro' ? 'Jusqu\'à ~30%' : currentPlan?.id === 'starter' ? 'Jusqu\'à ~20%' : 'Standard'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-emerald-400 font-black">
                      <span>Votre Marge Nette</span>
                      <span>100% conservée</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('subscription')}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all shadow-sm"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gérer mon abonnement</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS & CUSTOM PRICING */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white">Catalogue & Marges Revendeur</h2>
                <p className="text-xs text-slate-400">
                  Définissez vos prix de vente au client final. Vous bénéficiez d'une remise grossiste active ({currentPlan?.name} : {currentPlan?.id === 'pro' ? 'jusqu\'à ~25-30% de réduction réelle' : currentPlan?.id === 'starter' ? 'jusqu\'à ~15-20% de réduction réelle' : 'Tarifs catalogue de base'}).
                </p>
              </div>

              {/* Sub-tab Switcher: Products vs Exclusive vs OTP */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-2xl flex-wrap">
                <button
                  onClick={() => setResellerCatalogMode('PRODUCTS')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    resellerCatalogMode === 'PRODUCTS'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Articles & Abonnements ({products.filter((p) => !p.isExclusive).length})</span>
                </button>

                <button
                  onClick={() => setResellerCatalogMode('EXCLUSIVE')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    resellerCatalogMode === 'EXCLUSIVE'
                      ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-md'
                      : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Produits Exclusifs VIP ({products.filter((p) => p.isExclusive).length})</span>
                </button>

                <button
                  onClick={() => {
                    setResellerCatalogMode('OTP');
                    if (reseller?.subdomain) fetchOtpTariffs(selectedOtpCountry);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    resellerCatalogMode === 'OTP'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Numéros OTP ({otpServices.length})</span>
                </button>
              </div>
            </div>

            {(resellerCatalogMode === 'PRODUCTS' || resellerCatalogMode === 'EXCLUSIVE') && (
              <div className="space-y-4">
                {/* Exclusive VIP Banner if mode is EXCLUSIVE */}
                {resellerCatalogMode === 'EXCLUSIVE' && !hasExclusiveFeature && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Option Premium Starter & Pro
                        </span>
                        <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          Catalogue Produits Exclusifs & VIP
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                        Ces articles premium à très forte marge (Canva Pro À Vie, Comptes IA Privés, Licences VIP) sont réservés aux abonnés <strong className="text-amber-400">Starter</strong> et <strong className="text-purple-400">Pro</strong>. En formule Free, vos clients ne peuvent pas encore voir ces produits sur votre vitrine.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('subscription')}
                      className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 flex items-center gap-1.5 transition-all"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>Débloquer le catalogue VIP</span>
                    </button>
                  </div>
                )}

                {resellerCatalogMode === 'EXCLUSIVE' && hasExclusiveFeature && (
                  <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="text-xs text-slate-300">
                      <strong className="text-purple-300 font-bold">Catalogue VIP Débloqué :</strong> Ces articles exclusifs sont activés pour votre vitrine avec vos marges personnalisées.
                    </div>
                  </div>
                )}
                {/* Search & Filter & Bulk Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={searchProduct}
                        onChange={(e) => setSearchProduct(e.target.value)}
                        placeholder="Chercher un article..."
                        className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={fetchProducts}
                      disabled={loadingProducts}
                      className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                      title="Actualiser"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingProducts ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {/* Bulk Pricing Trigger & Save All Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setShowBulkPricingModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-sky-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black text-xs shadow-md shadow-sky-500/10 flex items-center gap-1.5 transition-all"
                      title="Ouvrir le configurateur de tarifs en masse"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>⚡ Ajuster les prix en bloc</span>
                    </button>

                    <button
                      onClick={handleSaveAllProductsOnPage}
                      disabled={savingAllProducts || loadingProducts}
                      className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                      title="Enregistrer toutes les modifications manuelles de la page"
                    >
                      {savingAllProducts ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>
                        Enregistrer tout
                        {modifiedProductsCount > 0 ? ` (${modifiedProductsCount})` : ''}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Bulk Status message */}
                {productBulkMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{productBulkMsg}</span>
                  </div>
                )}

                {/* Selection Bar when items are selected */}
                {selectedProductIds.length > 0 && (
                  <div className="p-3 bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in shadow-xl">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                        {selectedProductIds.length}
                      </span>
                      <span className="font-bold text-white">
                        {selectedProductIds.length} article(s) sélectionné(s)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setShowBulkPricingModal(true)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Ajuster les prix de la sélection</span>
                      </button>

                      <button
                        onClick={() => handleToggleSelectedVisibility(true)}
                        disabled={savingAllProducts}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-all"
                        title="Activer ces articles sur la vitrine"
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1" />
                        Tout afficher
                      </button>

                      <button
                        onClick={() => handleToggleSelectedVisibility(false)}
                        disabled={savingAllProducts}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all"
                        title="Masquer ces articles de la vitrine"
                      >
                        <EyeOff className="w-3.5 h-3.5 inline mr-1" />
                        Tout masquer
                      </button>

                      <button
                        onClick={() => setSelectedProductIds([])}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                      >
                        <X className="w-3.5 h-3.5 inline mr-0.5" />
                        Désélectionner
                      </button>
                    </div>
                  </div>
                )}

            {/* Products Table */}
            {loadingProducts ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Chargement des articles et calcul des tarifs...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Aucun article trouvé.
              </div>
            ) : (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={isAllCurrentPageSelected}
                            onChange={toggleSelectAllCurrentPage}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            title="Sélectionner tous les articles de cette page"
                          />
                        </th>
                        <th className="py-3 px-4">Article</th>
                        <th className="py-3 px-3">Catégorie</th>
                        <th className="py-3 px-3">Prix Public Base</th>
                        <th className="py-3 px-3 text-sky-400">Votre Prix Achat Grossiste (Remise Plan {currentPlan?.name})</th>
                        <th className="py-3 px-3 text-amber-400">Votre Prix Vente Client</th>
                        <th className="py-3 px-3 text-emerald-400">Votre Marge Nette</th>
                        <th className="py-3 px-3 text-center">Affiché Vitrine</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {paginatedDashboardProducts.map((p) => {
                        const currentSelling = editedPrices[p.id] ?? p.resellerSellingPrice;
                        const currentVis = editedVisibility[p.id] ?? p.isEnabled;
                        const netProfit = Math.max(0, currentSelling - p.resellerBuyPrice);
                        const isSaving = savingProductId === p.id;
                        const msg = productSaveMsg?.id === p.id ? productSaveMsg : null;

                        return (
                          <tr
                            key={p.id}
                            className={`hover:bg-slate-800/30 transition-colors ${
                              selectedProductIds.includes(p.id) ? 'bg-sky-950/20' : ''
                            }`}
                          >
                            <td className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={selectedProductIds.includes(p.id)}
                                onChange={() => toggleSelectProduct(p.id)}
                                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {p.imageUrl ? (
                                  <img
                                    src={p.imageUrl}
                                    alt={p.title}
                                    className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-800"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                                    <Package className="w-4 h-4" />
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <div className="font-bold text-white max-w-[200px] truncate">
                                      {p.title}
                                    </div>
                                    {p.isExclusive && (
                                      <span className="shrink-0 px-1.5 py-0.2 rounded-md bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
                                        <Sparkles className="w-2.5 h-2.5 text-amber-400" /> VIP
                                      </span>
                                    )}
                                    {(p.deliveryType === 'AUTOMATIC' || p.category === 'Méthode') && (
                                      <span className="shrink-0 px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5">
                                        <Zap className="w-2.5 h-2.5 text-amber-400" /> Auto
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {p.stock > 0 ? `${p.stock} en stock` : 'Disponible'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-400">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px]">
                                {p.category}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-400 font-mono">
                              ${p.baseSellingPrice.toFixed(2)}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-mono font-bold text-sky-400">
                                ${p.resellerBuyPrice.toFixed(2)}
                              </div>
                              {p.realDiscountPercent > 0 ? (
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold font-mono mt-0.5 border border-emerald-500/20">
                                  -{p.realDiscountPercent}% (-${p.discountAmount ? p.discountAmount.toFixed(2) : '0.00'})
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-500 font-mono">Tarif standard</div>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-500">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min={p.resellerBuyPrice}
                                  value={currentSelling}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setEditedPrices((prev) => ({ ...prev, [p.id]: val }));
                                  }}
                                  className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                                +${netProfit.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {p.isExclusive && !hasExclusiveFeature ? (
                                <button
                                  onClick={() => setActiveTab('subscription')}
                                  title="Passez au Plan Starter ou Pro pour activer sur votre vitrine"
                                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center gap-1 mx-auto"
                                >
                                  <span>🔒 Plan Starter/Pro</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    const nextVal = !currentVis;
                                    setEditedVisibility((prev) => ({ ...prev, [p.id]: nextVal }));
                                  }}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                    currentVis
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                                  }`}
                                >
                                  {currentVis ? 'Actif' : 'Masqué'}
                                </button>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Copy Sales Page Funnel Link */}
                                <button
                                  type="button"
                                  onClick={() => handleCopyProductSalesPageLink(p.slug || p.id)}
                                  title="Copier le lien Page de Vente directe (Tunnel Pub TikTok/FB & WhatsApp)"
                                  className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm"
                                >
                                  {copiedPageSlug === (p.slug || p.id) ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400 font-bold">Lien copié !</span>
                                    </>
                                  ) : (
                                    <>
                                      <Share2 className="w-3 h-3" />
                                      <span className="hidden xl:inline">Page Pub/WhatsApp</span>
                                    </>
                                  )}
                                </button>

                                {/* Preview Sales Page in new tab */}
                                <a
                                  href={
                                    typeof window !== 'undefined' && window.location.hostname.includes('localhost')
                                      ? `http://${reseller?.subdomain}.localhost:3000/p/${p.slug || p.id}`
                                      : `https://${reseller?.subdomain}.abonnementspro.com/p/${p.slug || p.id}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Ouvrir la page de vente dans un nouvel onglet"
                                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700/80"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>

                                {msg && (
                                  <span
                                    className={`text-[10px] font-bold ${
                                      msg.success ? 'text-emerald-400' : 'text-rose-400'
                                    }`}
                                  >
                                    {msg.text}
                                  </span>
                                )}
                                <button
                                  onClick={() => handleSaveProduct(p.id)}
                                  disabled={isSaving}
                                  className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-[11px] transition-all disabled:opacity-50 shadow-sm"
                                >
                                  {isSaving ? '...' : 'Sauvegarder'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Dashboard Products Pagination Bar */}
                {filteredProducts.length > 0 && (
                  <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>
                        Affichage de <strong className="text-white font-mono">{dashboardProductStartIndex + 1}</strong> à{' '}
                        <strong className="text-white font-mono">{dashboardProductEndIndex}</strong> sur{' '}
                        <strong className="text-white font-mono">{filteredProducts.length}</strong> articles
                      </span>

                      <div className="flex items-center gap-1.5 ml-2">
                        <span className="hidden sm:inline">Par page :</span>
                        <select
                          value={productsPerPage}
                          onChange={(e) => {
                            setProductsPerPage(Number(e.target.value));
                            setProductPage(1);
                          }}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                        >
                          <option value={10}>10</option>
                          <option value={15}>15</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </select>
                      </div>
                    </div>

                    {totalDashboardProductPages > 1 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                          disabled={productPage === 1}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-all"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Précédent</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalDashboardProductPages }, (_, i) => i + 1)
                            .filter((page) => page === 1 || page === totalDashboardProductPages || Math.abs(page - productPage) <= 1)
                            .reduce((acc: (number | string)[], page, idx, arr) => {
                              if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push('...');
                              acc.push(page);
                              return acc;
                            }, [])
                            .map((item, idx) => {
                              if (item === '...') {
                                return (
                                  <span key={`dash-dots-${idx}`} className="px-1 text-slate-600">
                                    ...
                                  </span>
                                );
                              }
                              const pageNum = item as number;
                              const isActive = pageNum === productPage;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setProductPage(pageNum)}
                                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                                    isActive
                                      ? 'bg-sky-500 text-white font-mono shadow-md shadow-sky-500/20'
                                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                        </div>

                        <button
                          onClick={() => setProductPage((p) => Math.min(totalDashboardProductPages, p + 1))}
                          disabled={productPage === totalDashboardProductPages}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-all"
                        >
                          <span className="hidden sm:inline">Suivant</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
              </div>
            )}

            {/* VIEW B: OTP SERVICES TABLE */}
            {resellerCatalogMode === 'OTP' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                  {/* Country Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">Pays :</span>
                    <select
                      value={selectedOtpCountry}
                      onChange={(e) => setSelectedOtpCountry(e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                    >
                      {otpCountries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name} ({c.prefix})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search & Category filter */}
                  <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        value={searchOtp}
                        onChange={(e) => setSearchOtp(e.target.value)}
                        placeholder="Rechercher WhatsApp, Telegram..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <select
                      value={otpCategoryFilter}
                      onChange={(e) => setOtpCategoryFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {['Tous', 'Messagerie', 'Réseaux Sociaux', 'IA & APIs', 'Finance', 'Comptes & Outils'].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => fetchOtpTariffs(selectedOtpCountry)}
                      disabled={loadingOtp}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                      title="Actualiser"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingOtp ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {/* Bulk Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAllOtpServices(true)}
                      disabled={savingAllOtp || loadingOtp}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold transition-all disabled:opacity-50"
                      title="Activer tous les services de ce pays sur votre boutique"
                    >
                      Tout Activer
                    </button>
                    <button
                      onClick={() => handleToggleAllOtpServices(false)}
                      disabled={savingAllOtp || loadingOtp}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-bold transition-all disabled:opacity-50"
                      title="Masquer tous les services de ce pays sur votre boutique"
                    >
                      Tout Masquer
                    </button>
                    <button
                      onClick={handleSaveAllOtpOnPage}
                      disabled={savingAllOtp || loadingOtp}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-[11px] transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {savingAllOtp ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      Enregistrer tout
                    </button>
                  </div>
                </div>

                {/* Bulk Status message */}
                {otpBulkMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{otpBulkMsg}</span>
                  </div>
                )}

                {loadingOtp ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Chargement des tarifs OTP pour ce pays...
                  </div>
                ) : otpServices.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Aucun service OTP trouvé pour ce pays.
                  </div>
                ) : (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                            <th className="py-3 px-4">Service OTP</th>
                            <th className="py-3 px-3">Catégorie</th>
                            <th className="py-3 px-3">Prix Public Base</th>
                            <th className="py-3 px-3 text-sky-400">Votre Prix Achat Grossiste (Remise Plan {currentPlan?.name})</th>
                            <th className="py-3 px-3 text-amber-400">Votre Prix Vente Client</th>
                            <th className="py-3 px-3 text-emerald-400">Votre Marge Nette</th>
                            <th className="py-3 px-3 text-center">Affiché Vitrine</th>
                            <th className="py-3 px-3 text-center">Portée</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {otpServices
                            .filter((s) => {
                              const matchCat = otpCategoryFilter === 'Tous' || s.category === otpCategoryFilter;
                              const matchSearch =
                                searchOtp === '' ||
                                s.name.toLowerCase().includes(searchOtp.toLowerCase()) ||
                                s.code.toLowerCase().includes(searchOtp.toLowerCase());
                              return matchCat && matchSearch;
                            })
                            .map((s) => {
                              const key = `${selectedOtpCountry}_${s.code.toLowerCase()}`;
                              const currentSelling = editedOtpPrices[key] ?? s.sellingPrice;
                              const currentVis = editedOtpVisibility[key] !== undefined ? editedOtpVisibility[key] : s.isEnabled;
                              const netProfit = Math.max(0, currentSelling - s.resellerBuyPrice);
                              const isSaving = savingOtpCode === s.code;
                              const msg = otpSaveMsg?.code === s.code ? otpSaveMsg : null;
                              const isGlobal = Boolean(globalApplyOtp[s.code.toLowerCase()]);

                              return (
                                <tr key={s.code} className="hover:bg-slate-800/30 transition-colors">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                        <Smartphone className="w-3.5 h-3.5" />
                                      </div>
                                      <div>
                                        <span className="font-bold text-white capitalize block">{s.name}</span>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                          {s.stock > 0 ? `${s.stock} en stock` : 'Disponible'}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 text-slate-400">
                                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px]">
                                      {s.category}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 font-mono text-slate-400">
                                    ${s.baseSellingPrice.toFixed(2)}
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="font-mono font-bold text-sky-400">
                                      ${s.resellerBuyPrice.toFixed(2)}
                                    </div>
                                    {s.realDiscountPercent > 0 ? (
                                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold font-mono mt-0.5 border border-emerald-500/20">
                                        -{s.realDiscountPercent}% (-${s.discountAmount ? s.discountAmount.toFixed(2) : '0.00'})
                                      </div>
                                    ) : (
                                      <div className="text-[10px] text-slate-500 font-mono">Tarif standard</div>
                                    )}
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-slate-500">$</span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        min={s.resellerBuyPrice}
                                        value={currentSelling}
                                        onChange={(e) => {
                                          const val = parseFloat(e.target.value) || 0;
                                          setEditedOtpPrices((prev) => ({ ...prev, [key]: val }));
                                        }}
                                        className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                                      />
                                    </div>
                                  </td>
                                  <td className="py-3 px-3">
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                                      +${netProfit.toFixed(2)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-center">
                                    <button
                                      onClick={() => {
                                        const nextVal = !currentVis;
                                        setEditedOtpVisibility((prev) => ({ ...prev, [key]: nextVal }));
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                        currentVis
                                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                      }`}
                                    >
                                      {currentVis ? 'Actif' : 'Masqué'}
                                    </button>
                                  </td>
                                  <td className="py-3 px-3 text-center">
                                    <label className="inline-flex items-center gap-1 cursor-pointer text-[10px] text-slate-400 hover:text-white" title="Appliquer ce réglage à tous les pays">
                                      <input
                                        type="checkbox"
                                        checked={isGlobal}
                                        onChange={(e) => {
                                          setGlobalApplyOtp((prev) => ({
                                            ...prev,
                                            [s.code.toLowerCase()]: e.target.checked,
                                          }));
                                        }}
                                        className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950"
                                      />
                                      <span>Tous pays</span>
                                    </label>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {msg && (
                                        <span
                                          className={`text-[10px] font-bold ${
                                            msg.success ? 'text-emerald-400' : 'text-rose-400'
                                          }`}
                                        >
                                          {msg.text}
                                        </span>
                                      )}
                                      <button
                                        onClick={() => handleSaveOtpService(s.code)}
                                        disabled={isSaving}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all disabled:opacity-50"
                                      >
                                        {isSaving ? '...' : 'Sauvegarder'}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STOREFRONT CUSTOMIZATION */}
        {activeTab === 'storefront' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-black text-white">Personnalisation de la Vitrine</h2>
              <p className="text-xs text-slate-400">
                Configurez l'identité, les coordonnées, les couleurs et le domaine de votre boutique.
              </p>
            </div>

            {storeMsg && (
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-2 ${
                  storeMsg.success
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }`}
              >
                {storeMsg.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{storeMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveStore} className="space-y-6 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl">
              {/* Store Identity */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-sky-400 border-b border-slate-800 pb-2">
                  Identité de la Boutique
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Nom de la boutique
                    </label>
                    <input
                      type="text"
                      required
                      value={storeSettings.storeName}
                      onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Sous-domaine (slug)
                    </label>
                    <input
                      type="text"
                      required
                      value={storeSettings.subdomain}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                    <span className="text-[10px] text-sky-400 font-mono font-bold">
                      Lien officiel : https://{storeSettings.subdomain || 'votre-nom'}.abonnementspro.com
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Slogan / Description courte
                  </label>
                  <input
                    type="text"
                    value={storeSettings.tagline}
                    onChange={(e) => setStoreSettings({ ...storeSettings, tagline: e.target.value })}
                    placeholder="Boutique officielle de licences et abonnements digitaux"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Bannière d'annonce défilante (Message flash)
                  </label>
                  <input
                    type="text"
                    value={storeSettings.bannerAnnouncement}
                    onChange={(e) => setStoreSettings({ ...storeSettings, bannerAnnouncement: e.target.value })}
                    placeholder="🔥 Promo de la semaine : -20% sur tous les abonnements Canva Pro !"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Custom Domain (Pro feature) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-purple-400">
                    Nom de Domaine Personnalisé
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300">
                    Offre Pro
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Votre nom de domaine propre (ex: boutique-abonnement.com)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      disabled={currentPlan?.id !== 'pro'}
                      value={storeSettings.customDomain}
                      onChange={(e) => setStoreSettings({ ...storeSettings, customDomain: e.target.value })}
                      placeholder="shop.maboutique.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                  {currentPlan?.id !== 'pro' ? (
                    <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5" />
                      Passez à l'offre Pro pour connecter votre propre nom de domaine.
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Pointez votre enregistrement CNAME DNS vers notre plateforme.
                    </p>
                  )}
                </div>
              </div>

              {/* Branding Visuals & Themes */}
              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400">
                      Identité Visuelle, Thème & Design
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Personnalisation complète de votre boutique
                  </span>
                </div>

                {/* 1. Logo Upload & URL */}
                <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-sky-400" />
                      <span>Logo de votre boutique</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">PNG, JPG, SVG ou WebP (max 5 Mo)</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Logo Preview */}
                    <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden shrink-0 relative group shadow-inner">
                      {storeSettings.logoUrl ? (
                        <>
                          <img
                            src={storeSettings.logoUrl}
                            alt="Logo boutique"
                            className="w-full h-full object-contain p-1.5"
                          />
                          <button
                            type="button"
                            onClick={() => setStoreSettings({ ...storeSettings, logoUrl: '' })}
                            className="absolute inset-0 bg-slate-950/80 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-[10px] font-bold"
                            title="Supprimer le logo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-2">
                          <Store className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                          <span className="text-[9px] text-slate-500 font-medium">Aucun</span>
                        </div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="cursor-pointer px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingLogo ? 'Téléversement en cours...' : 'Téléverser un logo'}</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                            disabled={uploadingLogo}
                            onChange={handleLogoFileUpload}
                            className="hidden"
                          />
                        </label>
                        {storeSettings.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setStoreSettings({ ...storeSettings, logoUrl: '' })}
                            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Retirer</span>
                          </button>
                        )}
                      </div>

                      {uploadLogoError && (
                        <p className="text-[11px] text-rose-400 font-medium">{uploadLogoError}</p>
                      )}

                      {/* Manual URL input fallback */}
                      <div className="relative">
                        <input
                          type="url"
                          value={storeSettings.logoUrl}
                          onChange={(e) => setStoreSettings({ ...storeSettings, logoUrl: e.target.value })}
                          placeholder="Ou collez directement l'URL d'une image (https://...)"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Theme Presets Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Thème de la Boutique (Ambiance Visuelle)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">7 thèmes complets prédéfinis</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {THEME_PRESETS.map((t) => {
                      const isSelected = (storeSettings.themePreset || 'cyber-dark') === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setStoreSettings({ ...storeSettings, themePreset: t.id, themeColor: t.accentName })}
                          className={`cursor-pointer p-3.5 rounded-2xl border transition-all text-left relative overflow-hidden group ${
                            isSelected
                              ? `bg-slate-900 border-sky-400 shadow-lg shadow-sky-500/10 ring-1 ring-sky-400`
                              : `bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40`
                          }`}
                        >
                          {/* Mini gradient bar indicator */}
                          <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${t.bgPreview} mb-2.5`} />

                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-white text-xs flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-sm"
                                style={{ backgroundColor: t.primaryColor }}
                              />
                              {t.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-slate-800 text-slate-400">
                              {t.badge}
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-400 leading-tight">
                            {t.description}
                          </p>

                          {isSelected && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Typography & Google Fonts */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Type className="w-4 h-4 text-purple-400" />
                      <span>Police d'écriture (Typographie de la boutique)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Google Fonts haute lisibilité</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {AVAILABLE_FONTS.map((f) => {
                      const isSelected = (storeSettings.fontFamily || 'Inter') === f.id;
                      return (
                        <div
                          key={f.id}
                          onClick={() => setStoreSettings({ ...storeSettings, fontFamily: f.id })}
                          className={`cursor-pointer p-3 rounded-2xl border transition-all text-left ${
                            isSelected
                              ? 'bg-purple-950/20 border-purple-400 ring-1 ring-purple-400 text-white shadow-md'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black">{f.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">{f.desc}</p>
                          <div className="mt-2 text-[11px] font-bold text-slate-300 border-t border-slate-800/80 pt-1.5 truncate">
                            Aa Bb 1234 € $
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Button Customization: Colors & Radius */}
                <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <MousePointerClick className="w-4 h-4 text-emerald-400" />
                      <span>Personnalisation des Boutons</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Couleurs & Arrondis</span>
                  </div>

                  {/* Button Color Preset Palette */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-2">
                      Couleur du bouton principal :
                    </label>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {BUTTON_COLOR_PRESETS.map((p) => {
                        const isSelected = storeSettings.buttonColor === p.color;
                        return (
                          <button
                            key={p.color}
                            type="button"
                            onClick={() => setStoreSettings({ ...storeSettings, buttonColor: p.color })}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                              isSelected ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-950' : 'hover:scale-110'
                            }`}
                            style={{ backgroundColor: p.color }}
                            title={p.name}
                          >
                            {isSelected && (
                              <Check
                                className={`w-3.5 h-3.5 ${
                                  p.color === '#ffffff' ? 'text-slate-950' : 'text-white'
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}

                      {/* Custom Hex Color Picker */}
                      <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-800">
                        <input
                          type="color"
                          value={storeSettings.buttonColor || '#0ea5e9'}
                          onChange={(e) => setStoreSettings({ ...storeSettings, buttonColor: e.target.value })}
                          className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                          title="Couleur personnalisée"
                        />
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          {storeSettings.buttonColor || '#0ea5e9'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Button Text Color & Radius Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Text Color */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                        Couleur du texte du bouton :
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setStoreSettings({ ...storeSettings, buttonTextColor: '#ffffff' })}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                            storeSettings.buttonTextColor === '#ffffff'
                              ? 'bg-slate-900 border-white text-white shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          Blanc (#ffffff)
                        </button>
                        <button
                          type="button"
                          onClick={() => setStoreSettings({ ...storeSettings, buttonTextColor: '#0f172a' })}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                            storeSettings.buttonTextColor === '#0f172a'
                              ? 'bg-slate-900 border-white text-white shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          Sombre (#0f172a)
                        </button>
                      </div>
                    </div>

                    {/* Button Radius */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                        Forme / Arrondi des boutons :
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {BUTTON_RADIUS_OPTIONS.map((r) => {
                          const isSelected = (storeSettings.buttonRadius || 'rounded-xl') === r.id;
                          return (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => setStoreSettings({ ...storeSettings, buttonRadius: r.id })}
                              className={`py-2 px-2.5 ${r.className} border text-xs font-bold transition-all text-center ${
                                isSelected
                                  ? 'bg-slate-900 border-sky-400 text-white shadow-sm'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              {r.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Product Display Templates Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-sky-400" />
                      <span>Template d'Affichage des Produits (Page de Vente)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">7 styles de vitrine haute conversion</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Définissez la manière dont vos abonnements et licences sont mis en scène pour vos clients sur votre boutique publique. Vos visiteurs peuvent aussi basculer d'un mode à l'autre en 1 clic.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    {PRODUCT_TEMPLATES.map((tmpl) => {
                      const isSelected = (storeSettings.productTemplate || 'grid-modern') === tmpl.id;
                      const Icon =
                        tmpl.id === 'grid-modern'
                          ? LayoutGrid
                          : tmpl.id === 'list-compact'
                          ? List
                          : tmpl.id === 'pricing-saas'
                          ? Layers
                          : tmpl.id === 'minimal-glass'
                          ? Sparkles
                          : tmpl.id === 'marketplace-flash'
                          ? Flame
                          : tmpl.id === 'agency-ai'
                          ? Bot
                          : MessageSquare;

                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => setStoreSettings({ ...storeSettings, productTemplate: tmpl.id })}
                          className={`cursor-pointer p-4 rounded-2xl border transition-all text-left relative overflow-hidden flex flex-col justify-between ${
                            isSelected
                              ? 'bg-slate-900/90 border-sky-400 shadow-xl shadow-sky-500/10 ring-1 ring-sky-400'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                          }`}
                        >
                          <div>
                            {/* Card Header with Icon & Badge */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-white text-xs leading-snug">
                                    {tmpl.name}
                                  </div>
                                  <span
                                    className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] font-bold border mt-0.5 ${tmpl.badgeColor}`}
                                  >
                                    {tmpl.badge}
                                  </span>
                                </div>
                              </div>

                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                              {tmpl.description}
                            </p>

                            {/* Feature highlights */}
                            <div className="space-y-1 mb-3 pt-2 border-t border-slate-800/60">
                              {tmpl.features.map((feat, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-300">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                  <span>{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Mini visual wireframe mockup preview */}
                          <div className="pt-2 border-t border-slate-800/80">
                            {tmpl.id === 'grid-modern' && (
                              <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-slate-950 border border-slate-800/60">
                                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                                  <div className="h-4 rounded bg-sky-500/20 w-full" />
                                  <div className="h-1.5 rounded bg-slate-700 w-3/4" />
                                  <div className="h-1.5 rounded bg-amber-400/40 w-1/2" />
                                </div>
                                <div className="p-1.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                                  <div className="h-4 rounded bg-emerald-500/20 w-full" />
                                  <div className="h-1.5 rounded bg-slate-700 w-3/4" />
                                  <div className="h-1.5 rounded bg-amber-400/40 w-1/2" />
                                </div>
                              </div>
                            )}

                            {tmpl.id === 'list-compact' && (
                              <div className="space-y-1.5 p-2 rounded-lg bg-slate-950 border border-slate-800/60">
                                <div className="flex items-center gap-2 p-1 rounded bg-slate-900 border border-slate-800">
                                  <div className="w-3.5 h-3.5 rounded bg-emerald-500/30 shrink-0" />
                                  <div className="h-1.5 rounded bg-slate-700 flex-1" />
                                  <div className="w-8 h-2 rounded bg-sky-500/40 shrink-0" />
                                </div>
                                <div className="flex items-center gap-2 p-1 rounded bg-slate-900 border border-slate-800">
                                  <div className="w-3.5 h-3.5 rounded bg-sky-500/30 shrink-0" />
                                  <div className="h-1.5 rounded bg-slate-700 flex-1" />
                                  <div className="w-8 h-2 rounded bg-sky-500/40 shrink-0" />
                                </div>
                              </div>
                            )}

                            {tmpl.id === 'pricing-saas' && (
                              <div className="p-2 rounded-lg bg-slate-950 border border-purple-500/30 space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <div className="h-2 rounded bg-purple-400/40 w-1/3" />
                                  <div className="h-2 rounded bg-emerald-400/40 w-1/4" />
                                </div>
                                <div className="h-3 rounded bg-white/20 w-1/2" />
                                <div className="h-1.5 rounded bg-slate-700 w-full" />
                                <div className="h-2.5 rounded bg-purple-500/40 w-full" />
                              </div>
                            )}

                            {tmpl.id === 'minimal-glass' && (
                              <div className="p-2 rounded-lg bg-gradient-to-br from-white/5 to-white/0 border border-white/10 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="h-1.5 rounded bg-white/40 w-1/3" />
                                  <div className="w-2 h-2 rounded-full bg-amber-400/60" />
                                </div>
                                <div className="h-2 rounded bg-white/60 w-2/3" />
                                <div className="h-2 rounded-full bg-white/20 w-1/2 ml-auto" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Live Interactive Mockup Preview */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                      Aperçu en direct de votre vitrine
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Template : {PRODUCT_TEMPLATES.find((p) => p.id === (storeSettings.productTemplate || 'grid-modern'))?.name} | Thème : {storeSettings.themePreset || 'Cyber Dark'}
                    </span>
                  </div>

                  {/* Mock Store Header & Dynamic Template Card */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-inner">
                    {/* Mock Navbar */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        {storeSettings.logoUrl ? (
                          <img
                            src={storeSettings.logoUrl}
                            alt="Logo"
                            className="w-8 h-8 rounded-lg object-contain bg-slate-950 border border-slate-800"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-md"
                            style={{ backgroundColor: storeSettings.buttonColor || '#0ea5e9' }}
                          >
                            {(storeSettings.storeName || 'B').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-black text-white text-xs leading-none">
                            {storeSettings.storeName || 'Ma Boutique'}
                          </div>
                          <div className="text-[9px] text-slate-400">
                            {storeSettings.tagline || 'Licences et abonnements officiels'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        Suivre mon Ticket
                      </button>
                    </div>

                    {/* DYNAMIC PRODUCT PREVIEW ACCORDING TO TEMPLATE */}
                    {storeSettings.productTemplate === 'list-compact' ? (
                      /* List Compact Mockup */
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                            <Zap className="w-5 h-5 text-sky-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs truncate">Canva Pro - Compte Privé</span>
                              <span className="px-1.5 py-0.2 text-[8px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                ⚡ Livraison &lt; 2 min
                              </span>
                            </div>
                            <div className="text-[9px] text-slate-400 truncate">Graphisme &amp; Création • 12 en stock</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-xs font-black text-amber-300">$9.99 USD</div>
                            <div className="text-[8px] text-slate-500">Paiement unique</div>
                          </div>
                          <button
                            type="button"
                            style={{
                              backgroundColor: storeSettings.buttonColor || '#0ea5e9',
                              color: storeSettings.buttonTextColor || '#ffffff',
                            }}
                            className={`px-3 py-1.5 ${storeSettings.buttonRadius || 'rounded-xl'} font-bold text-xs shadow-md transition-transform hover:scale-105`}
                          >
                            Commander
                          </button>
                        </div>
                      </div>
                    ) : storeSettings.productTemplate === 'pricing-saas' ? (
                      /* Pricing SaaS Mockup */
                      <div className="p-4 rounded-2xl bg-slate-950/90 border border-purple-500/30 shadow-lg relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            ⭐ Formule Pro Vérifiée
                          </span>
                          <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Stock Immédiat
                          </span>
                        </div>

                        <div className="mb-3">
                          <h4 className="text-sm font-black text-white">ChatGPT Plus &amp; Codex API</h4>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-xl font-black text-white">$14.99</span>
                            <span className="text-[10px] text-slate-400 font-semibold">/ formule complète</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 mb-4 text-[10px] text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>Accès officiel garanti &amp; sans partage</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>Livraison automatisée instantanée (&lt; 2 min)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>Support VIP et assistance dédiée</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          style={{
                            backgroundColor: storeSettings.buttonColor || '#0ea5e9',
                            color: storeSettings.buttonTextColor || '#ffffff',
                          }}
                          className={`w-full py-2.5 ${storeSettings.buttonRadius || 'rounded-xl'} font-bold text-xs shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-1.5`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Obtenir cette formule</span>
                        </button>
                      </div>
                    ) : storeSettings.productTemplate === 'minimal-glass' ? (
                      /* Minimal Glass Mockup */
                      <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 shadow-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                            Licence Officielle
                          </span>
                          <span className="text-xs font-black text-white">$12.50 USD</span>
                        </div>

                        <div>
                          <div className="font-bold text-white text-sm">Adobe Creative Cloud 1 An</div>
                          <p className="text-[10px] text-slate-400 mt-0.5">Activation directe sur votre compte personnel Adobe.</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <span className="text-[9px] text-slate-400 flex items-center gap-1">
                            <Shield className="w-3 h-3 text-sky-400" />
                            Vendeur Vérifié
                          </span>
                          <button
                            type="button"
                            style={{
                              backgroundColor: storeSettings.buttonColor || '#0ea5e9',
                              color: storeSettings.buttonTextColor || '#ffffff',
                            }}
                            className={`px-4 py-1.5 ${storeSettings.buttonRadius || 'rounded-full'} font-bold text-xs shadow-md transition-all hover:opacity-90`}
                          >
                            Acheter maintenant
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Default Grid Modern Mockup */
                      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                        <div className="h-16 rounded-xl bg-gradient-to-r from-sky-600/30 via-indigo-600/30 to-purple-600/30 border border-slate-800 flex items-center justify-between p-3 relative overflow-hidden">
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30">
                              ⚡ Auto
                            </span>
                            <div className="font-black text-white text-xs">Spotify Premium Personnel</div>
                          </div>
                          <span className="px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-[9px] font-bold text-emerald-400">
                            En Stock
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 pt-1">
                          <div>
                            <div className="text-[10px] text-slate-400">Livraison immédiate via Ticket sécurisé</div>
                            <div className="text-xs font-black text-amber-300 mt-0.5">$9.99 USD</div>
                          </div>

                          <button
                            type="button"
                            style={{
                              backgroundColor: storeSettings.buttonColor || '#0ea5e9',
                              color: storeSettings.buttonTextColor || '#ffffff',
                            }}
                            className={`px-4 py-2 ${storeSettings.buttonRadius || 'rounded-xl'} font-bold text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Commander</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
                  Coordonnées Support Client (Affichées sur la vitrine)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Numéro WhatsApp Client
                    </label>
                    <input
                      type="text"
                      value={storeSettings.contactWhatsApp}
                      onChange={(e) => setStoreSettings({ ...storeSettings, contactWhatsApp: e.target.value })}
                      placeholder="+229 90 00 00 00"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Pseudo Telegram Support
                    </label>
                    <input
                      type="text"
                      value={storeSettings.contactTelegram}
                      onChange={(e) => setStoreSettings({ ...storeSettings, contactTelegram: e.target.value })}
                      placeholder="@MonSupportTelegram"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Email de contact
                    </label>
                    <input
                      type="email"
                      value={storeSettings.contactEmail}
                      onChange={(e) => setStoreSettings({ ...storeSettings, contactEmail: e.target.value })}
                      placeholder="support@maboutique.com"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="text"
                      value={storeSettings.contactPhone}
                      onChange={(e) => setStoreSettings({ ...storeSettings, contactPhone: e.target.value })}
                      placeholder="+229 01 02 03 04"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Instructions for Tickets */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2">
                  Instructions de Règlement pour vos Tickets Clients
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Texte affiché à vos acheteurs lors de la création d'un ticket :
                  </label>
                  <textarea
                    rows={4}
                    value={storeSettings.paymentInstructions || ''}
                    onChange={(e) => setStoreSettings({ ...storeSettings, paymentInstructions: e.target.value })}
                    placeholder="Exemple :&#10;1. Effectuez votre paiement par Wave au +225 07 00 00 00 ou Moov/MTN au +229 90 00 00 00&#10;2. Précisez impérativement votre CODE TICKET comme motif&#10;3. Envoyez la capture sur WhatsApp pour livraison immédiate."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-sans leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Vos clients liront ces instructions directement sur leur ticket de commande pour savoir où effectuer leur règlement.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={savingStore}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
                >
                  {savingStore ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: SUBSCRIPTION / PLANS COMPARISON & PAYMENT */}
        {activeTab === 'subscription' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Success Activation Banner */}
            {activatedSuccessBanner && (
              <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-lg shadow-emerald-500/10 animate-in fade-in">
                <div className="flex items-center gap-2.5 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    🎉 Félicitations ! Votre abonnement <strong>{activatedSuccessBanner}</strong> est actif. Vos remises grossistes sont immédiatement appliquées sur tout votre catalogue !
                  </span>
                </div>
                <button
                  onClick={() => setActivatedSuccessBanner(null)}
                  className="p-1 hover:text-white text-emerald-400 rounded-lg hover:bg-emerald-500/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="text-center max-w-xl mx-auto space-y-3">
              <h2 className="text-xl font-black text-white">Nos Offres d'Abonnement Revendeur</h2>
              <p className="text-xs text-slate-400">
                Augmentez vos marges bénéficiaires avec des remises grossistes directes sur tous vos produits et débloquez l'ensemble des fonctionnalités exclusives.
              </p>

              {/* Monthly vs Yearly Billing Switcher */}
              <div className="inline-flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
                <button
                  type="button"
                  onClick={() => setBillingInterval('monthly')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    billingInterval === 'monthly'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Facturation Mensuelle
                </button>
                <button
                  type="button"
                  onClick={() => setBillingInterval('yearly')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    billingInterval === 'yearly'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Facturation Annuelle</span>
                  <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full">
                    -2 mois offerts !
                  </span>
                </button>
              </div>
            </div>

            {planMsg && (
              <div
                className={`max-w-md mx-auto p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-2 ${
                  planMsg.success
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }`}
              >
                {planMsg.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{planMsg.text}</span>
              </div>
            )}

            {/* Plans Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {saasPlans.map((p) => {
                const isCurrent = currentPlan?.id === p.id;
                const isUpgrading = upgradingPlanId === p.id;
                const planPrice = billingInterval === 'yearly' ? p.priceYearly : p.priceMonthly;

                // Real discount badge text
                const realDiscountText =
                  p.id === 'pro'
                    ? 'Jusqu\'à ~25-30% de remise réelle sur les produits'
                    : p.id === 'starter'
                    ? 'Jusqu\'à ~15-20% de remise réelle sur les produits'
                    : '0% de réduction (Tarifs catalogue de base)';

                return (
                  <div
                    key={p.id}
                    className={`rounded-3xl p-6 flex flex-col justify-between border relative transition-all ${
                      isCurrent
                        ? 'bg-slate-900 border-sky-500 shadow-xl shadow-sky-500/15 ring-2 ring-sky-500/30'
                        : p.id === 'pro'
                        ? 'bg-slate-900/90 border-purple-500/50 hover:border-purple-500 shadow-lg shadow-purple-500/5'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-500 text-white shadow-md">
                        Votre offre active
                      </div>
                    )}

                    {p.id === 'pro' && !isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md">
                        Recommandé VIP
                      </div>
                    )}

                    <div>
                      {/* Plan Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-black text-white">{p.name}</span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                            p.marginDiscountPercent > 0
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {p.id === 'pro' ? 'Grossiste VIP' : p.id === 'starter' ? 'Grossiste Pro' : 'Standard'}
                        </span>
                      </div>

                      {/* Real Discount Badge on Products */}
                      <div className="mb-3">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                            p.id === 'pro'
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                              : p.id === 'starter'
                              ? 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                              : 'bg-slate-800/80 text-slate-400 border-slate-700'
                          }`}
                        >
                          💎 {realDiscountText}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 min-h-[44px] leading-relaxed">{p.description}</p>

                      {/* Pricing Display */}
                      <div className="my-5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                        {billingInterval === 'yearly' ? (
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-white">${p.priceYearly}</span>
                              <span className="text-xs text-slate-400"> / an</span>
                            </div>
                            {p.priceYearly > 0 ? (
                              <div className="text-[11px] text-emerald-400 font-medium mt-1">
                                Soit ~${(p.priceYearly / 12).toFixed(2)}/mois (2 mois offerts !)
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-500 mt-1">Gratuit à vie</div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-white">${p.priceMonthly}</span>
                              <span className="text-xs text-slate-400"> / mois</span>
                            </div>
                            {p.priceYearly > 0 && (
                              <div className="text-[11px] text-slate-500 mt-1">
                                Facturation mensuelle sans engagement
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Features List */}
                      <div className="space-y-2.5 border-t border-slate-800 pt-4 mb-6">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                          Avantages & Fonctionnalités :
                        </span>
                        {Array.isArray(p.features) && p.features.length > 0 ? (
                          p.features.map((featKey: string) => (
                            <div key={featKey} className="flex items-center gap-2 text-xs text-slate-300">
                              <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              <span className="capitalize">{featKey.replace(/_/g, ' ')}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-500 italic">Fonctionnalités standard</div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-3 rounded-xl font-bold text-xs bg-slate-800 text-slate-400 cursor-default flex items-center justify-center gap-1.5 border border-slate-700"
                      >
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Offre actuellement active</span>
                      </button>
                    ) : p.id === 'free' ? (
                      <button
                        onClick={handleSwitchToFree}
                        disabled={isUpgrading}
                        className="w-full py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700 flex items-center justify-center gap-2"
                      >
                        {isUpgrading ? 'Passage en cours...' : 'Passer à l\'offre Free (Gratuit)'}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setCheckoutPlan(p);
                          setCheckoutError(null);
                        }}
                        className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                          p.id === 'pro'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white shadow-purple-500/20'
                            : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>
                          Activer l'offre {p.name} (${planPrice})
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ============================================================ */}
            {/* SUBSCRIPTION PAYMENT MODAL (WALLET, FEEXPAY, MONEROO)       */}
            {/* ============================================================ */}
            {checkoutPlan && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
                  <button
                    onClick={() => {
                      if (!subscribingMethod) setCheckoutPlan(null);
                    }}
                    disabled={subscribingMethod !== null}
                    className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Header */}
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      <Crown className="w-3 h-3" />
                      <span>Activation d'Abonnement</span>
                    </div>
                    <h3 className="text-lg font-black text-white">
                      Offre {checkoutPlan.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Sélectionnez la période de facturation et votre moyen de paiement sécurisé.
                    </p>
                  </div>

                  {checkoutError && (
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                      {checkoutError}
                    </div>
                  )}

                  {/* Interval Switcher inside Modal */}
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Période de facturation :
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBillingInterval('monthly')}
                        disabled={subscribingMethod !== null}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                          billingInterval === 'monthly'
                            ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        Mensuel (${checkoutPlan.priceMonthly}/m)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBillingInterval('yearly')}
                        disabled={subscribingMethod !== null}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                          billingInterval === 'yearly'
                            ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        Annuel (${checkoutPlan.priceYearly}/an) 🎁
                      </button>
                    </div>
                  </div>

                  {/* Total Amount Summary */}
                  {(() => {
                    const priceUsd = billingInterval === 'yearly' ? checkoutPlan.priceYearly : checkoutPlan.priceMonthly;
                    const priceXof = Math.max(50, Math.round(priceUsd * 650));
                    const walletBal = reseller?.walletBalance || 0;
                    const canPayWallet = walletBal >= priceUsd;

                    return (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-400 block font-medium">Montant total à régler :</span>
                            <span className="text-[11px] text-slate-500">
                              ~{priceXof.toLocaleString()} FCFA (XOF)
                            </span>
                          </div>
                          <span className="text-2xl font-black text-emerald-400 font-mono">
                            ${priceUsd.toFixed(2)} USD
                          </span>
                        </div>

                        {/* Payment Options Header */}
                        <div className="space-y-2.5">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-300 block">
                            Choisissez votre moyen de paiement :
                          </span>

                          {/* OPTION 1: WALLET BALANCE */}
                          <div
                            className={`p-3.5 rounded-2xl border transition-all ${
                              canPayWallet
                                ? 'bg-slate-950 border-emerald-500/40 hover:border-emerald-500'
                                : 'bg-slate-950/60 border-slate-800 opacity-80'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-bold text-white">Solde du Portefeuille Revendeur</span>
                              </div>
                              <span className="text-xs font-mono font-bold text-emerald-400">
                                Dispo : ${walletBal.toFixed(2)}
                              </span>
                            </div>

                            {canPayWallet ? (
                              <button
                                type="button"
                                onClick={() => handleExecuteSubscription('WALLET')}
                                disabled={subscribingMethod !== null}
                                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                              >
                                {subscribingMethod === 'WALLET' ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Débit en cours...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Payer avec mon Portefeuille (${priceUsd.toFixed(2)})</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="text-[11px] text-rose-400 bg-rose-500/10 px-2.5 py-1.5 rounded-xl border border-rose-500/20">
                                Solde insuffisant (${walletBal.toFixed(2)} / ${priceUsd.toFixed(2)} requis). Utilisez une passerelle en ligne ci-dessous :
                              </div>
                            )}
                          </div>

                          {/* OPTION 2: FEEXPAY ONLINE PAYMENT */}
                          <button
                            type="button"
                            onClick={() => handleExecuteSubscription('FEEXPAY')}
                            disabled={subscribingMethod !== null}
                            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#008080]/20 via-[#008080]/10 to-slate-950 border border-[#008080]/50 hover:border-[#008080] text-left transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-between group shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#008080]/30 border border-[#008080]/60 flex items-center justify-center text-[#00E5FF]">
                                <CreditCard className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-xs font-black text-white block group-hover:text-[#00E5FF] transition-colors">
                                  Payer avec FeexPay
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Mobile Money (MTN, Moov, Orange, Wave) & Carte Bancaire
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-black text-[#00E5FF] font-mono shrink-0 pl-2">
                              {subscribingMethod === 'FEEXPAY' ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                `${priceXof.toLocaleString()} FCFA`
                              )}
                            </span>
                          </button>

                          {/* OPTION 3: MONEROO ONLINE PAYMENT */}
                          <button
                            type="button"
                            onClick={() => handleExecuteSubscription('MONEROO')}
                            disabled={subscribingMethod !== null}
                            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#5046E5]/20 via-[#5046E5]/10 to-slate-950 border border-[#5046E5]/50 hover:border-[#5046E5] text-left transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-between group shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#5046E5]/30 border border-[#5046E5]/60 flex items-center justify-center text-[#A5B4FC]">
                                <Zap className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-xs font-black text-white block group-hover:text-[#A5B4FC] transition-colors">
                                  Payer avec Moneroo
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Mobile Money, Carte Bancaire Internationale & Crypto
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-black text-[#A5B4FC] font-mono shrink-0 pl-2">
                              {subscribingMethod === 'MONEROO' ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                `${priceXof.toLocaleString()} FCFA`
                              )}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ORDERS & TICKETS */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-sky-400" />
                  <span>Gestion des Tickets & Commandes</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Gérez les tickets de commande créés par vos acheteurs. Validez les paiements reçus pour déclencher la livraison automatique.
                </p>
              </div>

              {/* Status & Type Filter Tabs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                {/* Type Filter */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setOrderTypeFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      orderTypeFilter === 'ALL'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tous ({orders.length})
                  </button>
                  <button
                    onClick={() => setOrderTypeFilter('PRODUCT')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                      orderTypeFilter === 'PRODUCT'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Package className="w-3 h-3" />
                    <span>Produits ({orders.filter((o) => o.type === 'PRODUCT').length})</span>
                  </button>
                  <button
                    onClick={() => setOrderTypeFilter('OTP')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                      orderTypeFilter === 'OTP'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-emerald-400 hover:text-emerald-300'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>OTP ({orders.filter((o) => o.type === 'OTP').length})</span>
                  </button>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setOrderStatusFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      orderStatusFilter === 'ALL'
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Tous ({orders.length})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter('PENDING_PAYMENT')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      orderStatusFilter === 'PENDING_PAYMENT'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300'
                    }`}
                  >
                    En attente ({orders.filter((o) => o.status === 'PENDING_PAYMENT').length})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter('COMPLETED')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      orderStatusFilter === 'COMPLETED'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-900 border border-slate-800 text-emerald-400 hover:text-emerald-300'
                    }`}
                  >
                    Livrées ({orders.filter((o) => o.status === 'COMPLETED').length})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter('CANCELLED')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      orderStatusFilter === 'CANCELLED'
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300'
                    }`}
                  >
                    Annulées ({orders.filter((o) => o.status === 'CANCELLED').length})
                  </button>
                  <button
                    onClick={fetchOrders}
                    disabled={loadingOrders}
                    className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    title="Rafraîchir"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {orderActionMsg && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  orderActionMsg.success
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }`}
              >
                {orderActionMsg.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{orderActionMsg.text}</span>
              </div>
            )}

            {loadingOrders ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Chargement des commandes...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs bg-slate-900/40 border border-slate-800 rounded-2xl">
                Aucune commande pour le moment sur votre vitrine. Partagez votre lien public pour générer vos premiers tickets !
              </div>
            ) : (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Ticket</th>
                        <th className="py-3 px-3">Article / Service</th>
                        <th className="py-3 px-3">Client</th>
                        <th className="py-3 px-3">Montant Client</th>
                        <th className="py-3 px-3 text-emerald-400">Votre Bénéfice Net</th>
                        <th className="py-3 px-3">Statut</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-4 text-right">Action / Validation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {orders
                        .filter((o) => {
                          if (orderTypeFilter !== 'ALL' && o.type !== orderTypeFilter) return false;
                          if (orderStatusFilter === 'ALL') return true;
                          return o.status === orderStatusFilter;
                        })
                        .map((o) => {
                          const isValidating = validatingOrderId === o.id;
                          const isCancelling = cancellingOrderId === o.id;

                          return (
                            <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-sky-400">
                                    {o.ticketCode}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                      o.type === 'OTP'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                    }`}
                                  >
                                    {o.type === 'OTP' ? 'OTP' : 'Produit'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-3 font-bold text-white max-w-[200px]">
                                <div className="truncate">{o.productTitle}</div>
                                {o.customerAccounts && (
                                  <div className="mt-1 px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-[10px] font-mono text-sky-300 truncate" title={o.customerAccounts}>
                                    📋 Info client : {o.customerAccounts}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-3 text-slate-400">
                                {o.customerEmail}
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-white">
                                ${o.totalAmount.toFixed(2)}
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                                +${o.resellerProfit.toFixed(2)}
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    o.status === 'COMPLETED'
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : o.status === 'WAITING_SMS'
                                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                      : o.status === 'CANCELLED' || o.status === 'FAILED'
                                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  }`}
                                >
                                  {o.status === 'COMPLETED'
                                    ? 'LIVRÉ'
                                    : o.status === 'WAITING_SMS'
                                    ? 'EN ATTENTE SMS'
                                    : o.status === 'CANCELLED'
                                    ? 'ANNULÉ'
                                    : 'EN ATTENTE'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-500 text-[11px]">
                                {new Date(o.createdAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* OTP ACTIONS */}
                                  {o.type === 'OTP' ? (
                                    <>
                                      {o.status === 'PENDING_PAYMENT' && (
                                        <>
                                          <button
                                            onClick={() => handleValidateOtpTicket(o.id, o.ticketCode)}
                                            disabled={isValidating || isCancelling}
                                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-sm transition-all disabled:opacity-50"
                                            title="Valider le paiement et attribuer le numéro OnlineSIM"
                                          >
                                            {isValidating ? (
                                              <RefreshCw className="w-3 h-3 animate-spin" />
                                            ) : (
                                              <Smartphone className="w-3 h-3" />
                                            )}
                                            <span>Activer Numéro</span>
                                          </button>
                                          <button
                                            onClick={() => handleCancelOtpTicket(o.id, o.ticketCode)}
                                            disabled={isValidating || isCancelling}
                                            className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all disabled:opacity-50"
                                            title="Annuler le ticket OTP"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}

                                      {(o.status === 'WAITING_SMS' || o.status === 'COMPLETED') && (
                                        <button
                                          onClick={() =>
                                            setCredentialsModal({
                                              title: o.productTitle,
                                              credentials: `Numéro Virtuel : ${o.phone || 'Non renseigné'}\n${
                                                o.smsCode ? `Code SMS Reçu : ${o.smsCode}\n` : 'En attente de réception SMS...\n'
                                              }${o.fullSms ? `Message complet : ${o.fullSms}` : ''}`,
                                              ticketCode: o.ticketCode,
                                            })
                                          }
                                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1 transition-all"
                                        >
                                          <Smartphone className="w-3 h-3" />
                                          <span>{o.smsCode ? 'Code SMS' : 'Numéro'}</span>
                                        </button>
                                      )}

                                      {o.status === 'CANCELLED' && (
                                        <span className="text-[11px] text-slate-500 italic">Annulé</span>
                                      )}
                                    </>
                                  ) : (
                                    /* PRODUCT ACTIONS */
                                    <>
                                      {o.status === 'PENDING_PAYMENT' && (
                                        <>
                                          <button
                                            onClick={() => handleValidateTicket(o.id, o.ticketCode)}
                                            disabled={isValidating || isCancelling}
                                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all disabled:opacity-50"
                                            title="Valider le paiement et commander auprès du fournisseur"
                                          >
                                            {isValidating ? (
                                              <RefreshCw className="w-3 h-3 animate-spin" />
                                            ) : (
                                              <Check className="w-3 h-3" />
                                            )}
                                            <span>Valider & Livrer</span>
                                          </button>
                                          <button
                                            onClick={() => handleCancelTicket(o.id, o.ticketCode)}
                                            disabled={isValidating || isCancelling}
                                            className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all disabled:opacity-50"
                                            title="Annuler le ticket"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}

                                      {o.status === 'COMPLETED' && o.deliveredCredentials && (
                                        <button
                                          onClick={() =>
                                            setCredentialsModal({
                                              title: o.productTitle,
                                              credentials: o.deliveredCredentials,
                                              ticketCode: o.ticketCode,
                                            })
                                          }
                                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-[11px] flex items-center gap-1 transition-all"
                                        >
                                          <KeyRound className="w-3 h-3" />
                                          <span>Identifiants</span>
                                        </button>
                                      )}

                                      {o.status === 'CANCELLED' && (
                                        <span className="text-[11px] text-slate-500 italic">Annulé</span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Credentials Viewer Modal */}
        {credentialsModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">
                    Identifiants livrés ({credentialsModal.ticketCode})
                  </h3>
                </div>
                <button
                  onClick={() => setCredentialsModal(null)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-400 font-bold">
                Article : <span className="text-white">{credentialsModal.title}</span>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-mono whitespace-pre-wrap break-all leading-relaxed">
                {credentialsModal.credentials}
              </pre>

              <button
                onClick={() => setCredentialsModal(null)}
                className="w-full py-2.5 rounded-xl bg-sky-500 text-white font-bold text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: WALLET & EARNINGS */}
        {activeTab === 'wallet' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-white">Votre Portefeuille Revendeur & Paiements</h2>
              <p className="text-xs text-slate-400">
                Suivez vos commissions nettes accumulées, demandez un versement et configurez vos passerelles de paiement dynamique.
              </p>
            </div>

            {/* 1. Balances & Withdrawals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Solde Retirable</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  ${(reseller?.walletBalance || 0).toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  {currency === 'FCFA' ? formatPrice(reseller?.walletBalance || 0) : 'Disponible immédiatement'}
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">En Attente</span>
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-sky-400 font-mono">
                  ${(payoutStats.pendingWithdrawn || 0).toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-500 block">Retraits en cours de traitement</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Retiré</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-indigo-400 font-mono">
                  ${(payoutStats.totalWithdrawn || 0).toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-500 block">Déjà versé sur vos comptes</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gains Cumulés</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  ${(reseller?.totalEarnings || 0).toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-500 block">Commissions totales générées</span>
              </div>
            </div>

            {/* Withdrawal Request Form */}
            <form onSubmit={handleRequestPayout} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                    <span>Demander un Retrait de vos Commissions</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Recevez vos gains par Mobile Money (MTN, Moov, Orange, Wave) ou USDT (TRC20 / BEP20). Seuil minimum : $1.00 USD.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchPayouts}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingPayouts ? 'animate-spin' : ''}`} />
                  <span>Actualiser</span>
                </button>
              </div>

              {payoutMsg && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                    payoutMsg.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  {payoutMsg.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                  <span>{payoutMsg.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Montant ($ USD) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setPayoutAmount(String((reseller?.walletBalance || 0).toFixed(2)))}
                      className="text-[10px] font-black text-sky-400 hover:text-sky-300"
                    >
                      Tout retirer (${(reseller?.walletBalance || 0).toFixed(2)})
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={reseller?.walletBalance || 0}
                    required
                    placeholder="Ex: 25.00"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Moyen de Réception *
                  </label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="MTN Mobile Money">⚡ MTN Mobile Money (Auto FeexPay)</option>
                    <option value="Moov Money">⚡ Moov Money (Auto FeexPay)</option>
                    <option value="Celtiis Bénin">⚡ Celtiis Cash Bénin (Auto FeexPay)</option>
                    <option value="Orange Money">⚡ Orange Money (Auto FeexPay)</option>
                    <option value="Wave">⚡ Wave Mobile Money (Auto FeexPay)</option>
                    <option value="Togocom T-Money">⚡ Togocom / T-Money (Auto FeexPay)</option>
                    <option value="USDT (TRC20)">💎 Crypto USDT (TRC20)</option>
                    <option value="USDT (BEP20)">💎 Crypto USDT (BEP20)</option>
                    <option value="Virement / Autre">🏦 Virement / Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Numéro Mobile Money (avec indicatif) ou Adresse USDT *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 2290197000000 ou 2250700000000"
                    value={payoutDetails}
                    onChange={(e) => setPayoutDetails(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-slate-400">
                  ⚡ Virements Mobile Money exécutés automatiquement via FeexPay (ou validés par le Super Admin au-delà du plafond de sécurité).
                </p>
                <button
                  type="submit"
                  disabled={submittingPayout || (reseller?.walletBalance || 0) < 1}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  {submittingPayout ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4" />
                      <span>Demander le Retrait</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Payout History Table */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>Historique de vos Demandes de Retrait ({payouts.length})</span>
                </h3>
              </div>

              {payouts.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                  Aucune demande de retrait effectuée pour le moment.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-400">
                        <th className="py-3 px-3">Référence & Date</th>
                        <th className="py-3 px-3">Montant</th>
                        <th className="py-3 px-3">Moyen & Coordonnées</th>
                        <th className="py-3 px-3">Statut</th>
                        <th className="py-3 px-3">Note / Preuve Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {payouts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-mono font-black text-sky-400 block">{p.reference}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(p.createdAt).toLocaleString('fr-FR')}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-black text-emerald-400 text-sm">
                            ${p.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-white block">{p.paymentMethod}</span>
                            <span className="font-mono text-[11px] text-slate-400 break-all">{p.paymentDetails}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                                p.status === 'APPROVED'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : p.status === 'REJECTED'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {p.status === 'APPROVED'
                                ? '✅ PAYÉ & VALIDÉ'
                                : p.status === 'REJECTED'
                                ? '❌ REFUSÉ (RECRÉDITÉ)'
                                : '⏳ EN ATTENTE'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-300 max-w-[200px]">
                            {p.adminNote ? (
                              <span className="text-[11px] text-slate-300">{p.adminNote}</span>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">En attente de traitement...</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 2. DYNAMIC PAYMENT GATEWAYS (FEEXPAY & MONEROO) */}
            <form onSubmit={handleSaveGateways} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-sky-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Paiement Dynamique & Clés API Personnalisées
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Intégrez vos propres clés API marchandes FeexPay ou Moneroo sur votre boutique.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      gatewaySettings.customGatewayEnabled
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${gatewaySettings.customGatewayEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    <span>{gatewaySettings.customGatewayEnabled ? 'Passerelles Personnalisées' : 'Compte Super Admin (Défaut)'}</span>
                  </span>
                </div>
              </div>

              {/* Explanatory Banner */}
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-slate-300 space-y-2 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-sky-300">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>Comment fonctionne la répartition automatique des fonds ?</span>
                </div>
                <p>
                  • <strong>Lors du paiement en ligne</strong> : Votre boutique reçoit uniquement sa <strong>commission nette de vente</strong> créditée directement dans votre solde retirable, et le reste (coût grossiste + marge plateforme) transite vers le Super Admin.
                </p>
                <p className="text-slate-400">
                  • <strong>Si vous n'avez pas encore de clés API</strong> : Le compte du Super Admin est utilisé par défaut pour encaisser le paiement. Vos commissions s'accumulent automatiquement dans votre portefeuille ci-dessus, et le reversement de votre solde se fera manuellement par le Super Admin sur votre Mobile Money ou compte bancaire.
                </p>
              </div>

              {/* Feedback Alert */}
              {gatewayMsg && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150 ${
                    gatewayMsg.success
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                  }`}
                >
                  {gatewayMsg.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{gatewayMsg.text}</span>
                </div>
              )}

              {/* Master Toggle */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Activer mes propres passerelles de paiement dynamique</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Activez cette option pour que votre vitrine utilise vos propres identifiants marchands ci-dessous.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gatewaySettings.customGatewayEnabled}
                    onChange={(e) =>
                      setGatewaySettings({
                        ...gatewaySettings,
                        customGatewayEnabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. FeexPay Configuration */}
                <div className={`p-5 rounded-2xl border space-y-4 transition-all ${
                  gatewaySettings.feexpayEnabled ? 'bg-slate-950 border-sky-500/40 shadow-lg shadow-sky-500/5' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">
                        FeexPay (Mobile Money & CB)
                      </h4>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gatewaySettings.feexpayEnabled}
                        onChange={(e) =>
                          setGatewaySettings({ ...gatewaySettings, feexpayEnabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Permet d'accepter MTN Mobile Money, Moov Money, Wave, Orange Money et Cartes Bancaires en zone FCFA (Bénin, Côte d'Ivoire, Sénégal, etc.).
                  </p>

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Clé API FeexPay (API Key)
                      </label>
                      <input
                        type="text"
                        value={gatewaySettings.feexpayApiKey}
                        onChange={(e) =>
                          setGatewaySettings({ ...gatewaySettings, feexpayApiKey: e.target.value })
                        }
                        placeholder="fp_live_..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        ID Boutique FeexPay (Shop ID)
                      </label>
                      <input
                        type="text"
                        value={gatewaySettings.feexpayShopId}
                        onChange={(e) =>
                          setGatewaySettings({ ...gatewaySettings, feexpayShopId: e.target.value })
                        }
                        placeholder="673db709..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Moneroo Configuration */}
                <div className={`p-5 rounded-2xl border space-y-4 transition-all ${
                  gatewaySettings.monerooEnabled ? 'bg-slate-950 border-purple-500/40 shadow-lg shadow-purple-500/5' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">
                        Moneroo (International & Crypto)
                      </h4>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gatewaySettings.monerooEnabled}
                        onChange={(e) =>
                          setGatewaySettings({ ...gatewaySettings, monerooEnabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Passerelle globale multi-devises supportant les paiements internationaux par Cartes Visa/Mastercard, Mobile Money panafricain et Crypto.
                  </p>

                  <div className="space-y-3 pt-1">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-300">
                          Clé Secrète Moneroo (Secret Key)
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          className="text-[10px] text-sky-400 hover:text-sky-300 font-bold"
                        >
                          {showSecretKey ? 'Masquer' : 'Afficher'}
                        </button>
                      </div>
                      <input
                        type={showSecretKey ? 'text' : 'password'}
                        value={gatewaySettings.monerooSecretKey}
                        onChange={(e) =>
                          setGatewaySettings({ ...gatewaySettings, monerooSecretKey: e.target.value })
                        }
                        placeholder="pvk_live_..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[10px] text-slate-400">
                      Rendez-vous sur votre dashboard Moneroo (Moneroo.io) &gt; Développeurs &gt; Clés d'API pour copier votre clé secrète de production.
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingGateways}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
                >
                  {savingGateways ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Enregistrer mes Clés de Paiement</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 7: MARKETING & VISITS */}
        {activeTab === 'marketing' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Sub-tab switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-2">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Croissance & Analyse d'Audience</span>
                </div>
                <h2 className="text-xl font-black text-white">Centre Marketing, Pixels & Analyse du Trafic</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mesurez l'audience de votre vitrine, intégrez vos balises de tracking publicitaire et engagez vos acheteurs.
                </p>
              </div>

              {/* Sub-tabs buttons */}
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
                <button
                  onClick={() => setMarketingSubTab('analytics')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    marketingSubTab === 'analytics'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Statistiques & Visites</span>
                </button>

                <button
                  onClick={() => setMarketingSubTab('pixels')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    marketingSubTab === 'pixels'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Pixels & Communication</span>
                </button>

                <button
                  onClick={() => setMarketingSubTab('telegram')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    marketingSubTab === 'telegram'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>Notifications Telegram</span>
                  {telegramSettings.enabled && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>
              </div>
            </div>

            {/* ============================================================ */}
            {/* SUB-TAB 1: TRAFFIC & CONVERSION ANALYTICS                    */}
            {/* ============================================================ */}
            {marketingSubTab === 'analytics' && (
              <div className="space-y-6">
                {/* Refresh Header */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Données consolidées de votre boutique publique <span className="font-mono text-sky-400 font-bold">{reseller?.subdomain}.abonnementspro.com</span>
                  </div>
                  <button
                    onClick={fetchAnalytics}
                    disabled={loadingAnalytics}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingAnalytics ? 'animate-spin' : ''}`} />
                    <span>Actualiser</span>
                  </button>
                </div>

                {/* 4 KPI Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* KPI 1: Visites Totales */}
                  <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-sky-500/30 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Visites Totales</span>
                      <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {analyticsData?.totalVisits?.toLocaleString() ?? 0}
                    </div>
                    <div className="text-[11px] text-slate-500">Pages vues sur votre vitrine</div>
                  </div>

                  {/* KPI 2: Visiteurs Uniques */}
                  <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Visiteurs Uniques</span>
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono">
                      {analyticsData?.uniqueVisitors?.toLocaleString() ?? 0}
                    </div>
                    <div className="text-[11px] text-slate-500">Clients / sessions distinctes</div>
                  </div>

                  {/* KPI 3: Ventes & Tickets */}
                  <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tickets & Ventes</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                      {analyticsData?.totalOrdersCount ?? 0}
                    </div>
                    <div className="text-[11px] text-emerald-400/80 font-medium">
                      dont {analyticsData?.completedOrdersCount ?? 0} payées & validées
                    </div>
                  </div>

                  {/* KPI 4: Taux de Conversion */}
                  <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Taux de Conversion</span>
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <Percent className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                      {analyticsData?.conversionRate ?? 0}%
                    </div>
                    <div className="text-[11px] text-slate-500">Ratio commandes / visiteurs</div>
                  </div>
                </div>

                {/* 14-Day Traffic Evolution Bar Chart */}
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-sky-400" />
                        <span>Évolution du Trafic (14 Derniers Jours)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Volume quotidien des visites enregistrées sur votre boutique.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-gradient-to-t from-sky-600 to-cyan-400 inline-block" />
                        Visites par jour
                      </span>
                    </div>
                  </div>

                  {/* Interactive Bar Chart */}
                  <div className="pt-6 pb-2">
                    {(() => {
                      const timeline: any[] = analyticsData?.timeline || [];
                      const maxVisits = Math.max(1, ...timeline.map((t) => t.visits || 0));

                      return (
                        <div className="h-52 flex items-end gap-1.5 sm:gap-3 justify-between border-b border-slate-800 pb-2 px-1">
                          {timeline.map((item, idx) => {
                            const visits = item.visits || 0;
                            const heightPct = Math.max(10, Math.round((visits / maxVisits) * 100));
                            const dateLabel = item.date ? item.date.slice(5) : '';

                            return (
                              <div
                                key={item.date || idx}
                                className="flex-1 flex flex-col items-center justify-end h-full group relative"
                              >
                                {/* Tooltip on hover */}
                                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-950 text-white text-[10px] font-bold py-1 px-2 rounded-lg border border-slate-700 shadow-xl whitespace-nowrap z-20">
                                  {item.date} : <span className="text-sky-400">{visits} visite{visits > 1 ? 's' : ''}</span>
                                </div>

                                {/* Count label atop bar */}
                                {visits > 0 && (
                                  <span className="text-[10px] text-sky-300 font-mono font-bold mb-1 group-hover:scale-110 transition-transform">
                                    {visits}
                                  </span>
                                )}

                                {/* Bar */}
                                <div
                                  style={{ height: `${heightPct}%` }}
                                  className={`w-full max-w-[38px] rounded-t-lg transition-all duration-300 ${
                                    visits > 0
                                      ? 'bg-gradient-to-t from-sky-600 via-sky-500 to-cyan-400 shadow-lg shadow-sky-500/20 group-hover:from-sky-500 group-hover:to-cyan-300'
                                      : 'bg-slate-800/40'
                                  }`}
                                />

                                {/* Date Label */}
                                <span className="text-[10px] text-slate-500 group-hover:text-slate-300 font-mono mt-2 transition-colors">
                                  {dateLabel}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Grid 2 Columns: Devices & Referrers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Device Breakdown */}
                  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-indigo-400" />
                      <span>Appareils des Visiteurs</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Supports utilisés pour consulter votre catalogue d'abonnements et de numéros OTP.
                    </p>

                    {(() => {
                      const desktop = analyticsData?.devices?.desktop || 0;
                      const mobile = analyticsData?.devices?.mobile || 0;
                      const tablet = analyticsData?.devices?.tablet || 0;
                      const totalDevices = Math.max(1, desktop + mobile + tablet);
                      const mobilePct = Math.round((mobile / totalDevices) * 100);
                      const desktopPct = Math.round((desktop / totalDevices) * 100);
                      const tabletPct = Math.round((tablet / totalDevices) * 100);

                      return (
                        <div className="space-y-4 pt-2">
                          {/* Mobile */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-200 flex items-center gap-2">
                                📱 Smartphone / Mobile
                              </span>
                              <span className="font-mono text-slate-400">
                                <strong className="text-white">{mobile}</strong> ({mobilePct}%)
                              </span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                              <div
                                style={{ width: `${mobilePct}%` }}
                                className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full transition-all duration-500"
                              />
                            </div>
                          </div>

                          {/* Desktop */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-200 flex items-center gap-2">
                                💻 Ordinateur / Desktop
                              </span>
                              <span className="font-mono text-slate-400">
                                <strong className="text-white">{desktop}</strong> ({desktopPct}%)
                              </span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                              <div
                                style={{ width: `${desktopPct}%` }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                              />
                            </div>
                          </div>

                          {/* Tablet */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-200 flex items-center gap-2">
                                📟 Tablette
                              </span>
                              <span className="font-mono text-slate-400">
                                <strong className="text-white">{tablet}</strong> ({tabletPct}%)
                              </span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                              <div
                                style={{ width: `${tabletPct}%` }}
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Right Column: Traffic Sources / Referrers */}
                  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span>Origine & Canaux de Trafic</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      D'où proviennent vos visiteurs avant d'atterrir sur votre boutique.
                    </p>

                    <div className="space-y-2 pt-1">
                      {analyticsData?.topReferrers && analyticsData.topReferrers.length > 0 ? (
                        analyticsData.topReferrers.map((ref: any, idx: number) => (
                          <div
                            key={ref.source || idx}
                            className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-mono font-bold">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-slate-200">{ref.source}</span>
                            </div>
                            <span className="font-mono font-black text-sky-400">
                              {ref.count} visite{ref.count > 1 ? 's' : ''}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-xs text-slate-500">
                          Aucune visite externe détectée pour le moment. Partagez votre lien de boutique pour démarrer !
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section Top Ordered Products */}
                {analyticsData?.topProducts && analyticsData.topProducts.length > 0 && (
                  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-400" />
                      <span>Articles les Plus Commandés sur Votre Vitrine</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {analyticsData.topProducts.map((p: any, idx: number) => (
                        <div
                          key={p.name || idx}
                          className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Top #{idx + 1}</span>
                            <h4 className="font-bold text-xs text-white line-clamp-1">{p.name}</h4>
                            <span className="text-[11px] text-slate-400 block">{p.ordersCount} commande{p.ordersCount > 1 ? 's' : ''}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-emerald-400 font-mono">
                              {formatPrice(p.totalRevenue)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* SUB-TAB 2: MARKETING PIXELS & COMMUNICATION CHAT             */}
            {/* ============================================================ */}
            {marketingSubTab === 'pixels' && (
              <form onSubmit={handleSaveMarketing} className="space-y-6">
                {/* Feedback message */}
                {marketingMsg && (
                  <div
                    className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150 ${
                      marketingMsg.success
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {marketingMsg.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>{marketingMsg.text}</span>
                  </div>
                )}

                {/* Card 1: Advertising Tracking Pixels */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-sky-400" />
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">
                        Pixels de Traçage Publicitaire
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Événements suivis : PageView, ViewContent, Purchase
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ajoutez vos identifiants de pixels marketing. Les scripts officiels seront automatiquement injectés sur votre vitrine publique pour mesurer les conversions de vos publicités et optimiser votre retargeting.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                    {/* Meta / Facebook Pixel */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-200">
                          Meta (Facebook / Instagram) Pixel
                        </label>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            marketingSettings.facebookPixelId
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {marketingSettings.facebookPixelId ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={marketingSettings.facebookPixelId}
                        onChange={(e) =>
                          setMarketingSettings({ ...marketingSettings, facebookPixelId: e.target.value })
                        }
                        placeholder="Ex: 123456789012345"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                      />
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Trace automatiquement les conversions de vos campagnes Facebook et Instagram Ads.
                      </p>
                    </div>

                    {/* TikTok Pixel */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-200">
                          TikTok Pixel ID
                        </label>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            marketingSettings.tiktokPixelId
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {marketingSettings.tiktokPixelId ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={marketingSettings.tiktokPixelId}
                        onChange={(e) =>
                          setMarketingSettings({ ...marketingSettings, tiktokPixelId: e.target.value })
                        }
                        placeholder="Ex: C12345ABCDEF67890"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                      />
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Idéal pour analyser les clics provenant de vidéos TikTok et mesurer le ROI publicitaire.
                      </p>
                    </div>

                    {/* Google Analytics 4 */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-200">
                          Google Analytics (GA4 / GTM)
                        </label>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            marketingSettings.googleAnalyticsId
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {marketingSettings.googleAnalyticsId ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={marketingSettings.googleAnalyticsId}
                        onChange={(e) =>
                          setMarketingSettings({ ...marketingSettings, googleAnalyticsId: e.target.value })
                        }
                        placeholder="Ex: G-XXXXXXXXXX ou GTM-XXXXXXX"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                      />
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Mesure complète de l'audience et du temps passé avec Google Tag Manager ou GA4.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Communication Center & Floating Support Widget */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">
                        Centre de Communication & Support Flottant
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Bouton interactif d'assistance client sur votre vitrine
                    </span>
                  </div>

                  {/* Toggle Switch */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Activer le Bouton Flottant d'Assistance</span>
                        {marketingSettings.floatingChatEnabled ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        ) : null}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Affiche un widget flottant en bas à droite de votre vitrine pour que les clients puissent vous contacter d'un clic.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={marketingSettings.floatingChatEnabled}
                        onChange={(e) =>
                          setMarketingSettings({
                            ...marketingSettings,
                            floatingChatEnabled: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {/* Welcome Message Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300">
                      Message d'Accueil du Support (Popup d'Assistance)
                    </label>
                    <textarea
                      rows={3}
                      value={marketingSettings.welcomeMessage}
                      onChange={(e) =>
                        setMarketingSettings({ ...marketingSettings, welcomeMessage: e.target.value })
                      }
                      placeholder="Bonjour ! 👋 Besoin d'aide pour passer commande, valider un paiement ou recevoir votre code SMS ? Écrivez-nous directement :"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-sans"
                    />
                    <p className="text-[11px] text-slate-500">
                      Ce message s'affiche dans la bulle d'assistance au-dessus des boutons WhatsApp, Telegram et Email.
                    </p>
                  </div>

                  {/* Contact Channels Reminder */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Canaux de Contact Actifs sur Votre Vitrine
                    </span>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-slate-400">WhatsApp :</span>
                        <strong className="text-white">
                          {storeSettings.contactWhatsApp || 'Non configuré'}
                        </strong>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                        <Send className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-slate-400">Telegram :</span>
                        <strong className="text-white">
                          {storeSettings.contactTelegram || 'Non configuré'}
                        </strong>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-slate-400">Email :</span>
                        <strong className="text-white">
                          {storeSettings.contactEmail || 'Non configuré'}
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab('storefront')}
                        className="text-xs text-sky-400 hover:underline font-medium ml-1"
                      >
                        Modifier ces numéros dans Vitrine →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingMarketing}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-sky-500/20 transition-all disabled:opacity-50"
                  >
                    {savingMarketing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Enregistrer les Paramètres Marketing & Pixels</span>
                  </button>
                </div>
              </form>
            )}

            {/* SUB-TAB 3: NOTIFICATIONS TELEGRAM */}
            {marketingSubTab === 'telegram' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Feedback notifications */}
                {telegramMsg && (
                  <div
                    className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in ${
                      telegramMsg.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {telegramMsg.success ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                    )}
                    <span className="text-xs font-semibold">{telegramMsg.text}</span>
                  </div>
                )}

                {telegramTestMsg && (
                  <div
                    className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in ${
                      telegramTestMsg.success
                        ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    {telegramTestMsg.success ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                    )}
                    <span className="text-xs font-semibold">{telegramTestMsg.text}</span>
                  </div>
                )}

                {/* Hero / Banner with Main Toggle */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-sky-950/40 via-slate-900 to-indigo-950/40 border border-sky-500/20 shadow-xl space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 shadow-lg shadow-sky-500/10">
                        <Send className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-white">
                            Alertes & Notifications Telegram en Direct
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              telegramSettings.enabled
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {telegramSettings.enabled ? 'Actif' : 'Désactivé'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                          Recevez instantanément vos alertes de ventes avec votre bénéfice net calculé, les commandes de numéros virtuels OTP et les réponses du Super Admin directement sur Telegram.
                        </p>
                      </div>
                    </div>

                    {/* Master Switch */}
                    <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800/80 shrink-0 self-start md:self-center">
                      <span className="text-xs font-bold text-white">
                        {telegramSettings.enabled ? 'Notifications Activées' : 'Activer Telegram'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={telegramSettings.enabled}
                          onChange={(e) =>
                            setTelegramSettings({ ...telegramSettings, enabled: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                      </label>
                    </div>
                  </div>

                  {/* Quick Setup Onboarding Helper Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-sky-950/20 border border-sky-500/20 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
                        <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-[11px]">1</span>
                        <span>Démarrer le Bot de la Plateforme</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Pour que Telegram autorise l'envoi de messages vers votre compte, vous devez d'abord lancer le bot une seule fois avec la commande <b>/start</b>.
                      </p>
                      {telegramSettings.platformBotUsername ? (
                        <a
                          href={`https://t.me/${telegramSettings.platformBotUsername}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 text-sky-300 text-xs font-bold transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Ouvrir @{telegramSettings.platformBotUsername} sur Telegram</span>
                        </a>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">
                          Bot officiel Telegram géré automatiquement par la plateforme.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 border-t md:border-t-0 md:border-l border-sky-500/20 pt-3 md:pt-0 md:pl-4">
                      <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
                        <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-[11px]">2</span>
                        <span>Obtenir votre Chat ID Telegram</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Envoyez n'importe quel message au bot Telegram gratuit{' '}
                        <a
                          href="https://t.me/userinfobot"
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-400 hover:underline font-mono font-bold"
                        >
                          @userinfobot
                        </a>
                        {' '}pour copier votre <b>Id numérique</b> (ex: <code>123456789</code>) et collez-le ci-dessous.
                      </p>
                      <p className="text-[11px] text-slate-400">
                        🔒 Vous n'avez pas besoin de configurer votre propre bot BotFather, tout est prêt à l'emploi !
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Fields Card */}
                <form onSubmit={handleSaveTelegram} className="space-y-6">
                  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                    <div className="border-b border-slate-800 pb-3">
                      <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-sky-400" />
                        <span>Identifiants de Connexion Telegram</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Renseignez votre Chat ID pour lier vos alertes personnelles ou votre canal privé.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Telegram Chat ID */}
                      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            <span>Chat ID Telegram</span>
                            <span className="text-rose-400">*</span>
                          </label>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              telegramSettings.chatId
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {telegramSettings.chatId ? 'Configuré' : 'Requis'}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={telegramSettings.chatId}
                          onChange={(e) =>
                            setTelegramSettings({ ...telegramSettings, chatId: e.target.value })
                          }
                          placeholder="Ex: 123456789 ou -100123456789"
                          className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                        />
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          ID de votre compte utilisateur ou d'un canal Telegram où le bot a été ajouté comme administrateur.
                        </p>
                      </div>

                      {/* Custom Bot Token (Optional) */}
                      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-200">
                            Bot Token Personnalisé (Optionnel)
                          </label>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                            {telegramSettings.botToken ? 'Bot Dédié' : 'Bot de la Plateforme (Défaut)'}
                          </span>
                        </div>
                        <input
                          type="password"
                          value={telegramSettings.botToken}
                          onChange={(e) =>
                            setTelegramSettings({ ...telegramSettings, botToken: e.target.value })
                          }
                          placeholder="Ex: 7123456789:AAH..."
                          className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                        />
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Laissez vide pour utiliser le bot sécurisé de la plateforme. Renseignez uniquement si vous souhaitez utiliser votre propre BotFather dédié.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Event Toggles Card */}
                  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-sky-400" />
                          <span>Événements à Notifier</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Sélectionnez précisément les types d'alertes que vous désirez recevoir sur Telegram.
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        Temps réel 24/7
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Event 1: New Orders */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-3 hover:border-slate-700/80 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-emerald-400 shrink-0" />
                            <h5 className="text-xs font-bold text-white">Ventes Produits & Abonnements</h5>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Alerte immédiate à chaque vente avec le code ticket, l'article et votre bénéfice net calculé.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={telegramSettings.notifyOnNewOrder}
                            onChange={(e) =>
                              setTelegramSettings({ ...telegramSettings, notifyOnNewOrder: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      {/* Event 2: OTP Orders */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-3 hover:border-slate-700/80 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
                            <h5 className="text-xs font-bold text-white">Numéros Virtuels SMS (OTP)</h5>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Notification dès qu'un client achète ou active un numéro SMS temporaire sur votre vitrine.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={telegramSettings.notifyOnOtpOrder}
                            onChange={(e) =>
                              setTelegramSettings({ ...telegramSettings, notifyOnOtpOrder: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                        </label>
                      </div>

                      {/* Event 3: Support Replies */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-3 hover:border-slate-700/80 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <LifeBuoy className="w-4 h-4 text-indigo-400 shrink-0" />
                            <h5 className="text-xs font-bold text-white">Réponses du Support Super Admin</h5>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Soyez prévenu dès que l'administrateur vous répond sur l'espace d'assistance dédié.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={telegramSettings.notifyOnSupportReply}
                            onChange={(e) =>
                              setTelegramSettings({ ...telegramSettings, notifyOnSupportReply: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                        </label>
                      </div>

                      {/* Event 4: Payouts */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-3 hover:border-slate-700/80 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                            <h5 className="text-xs font-bold text-white">Portefeuille & Reversements</h5>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Alertes lors de la validation de vos retraits et des crédits importants sur votre solde.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={telegramSettings.notifyOnPayout}
                            onChange={(e) =>
                              setTelegramSettings({ ...telegramSettings, notifyOnPayout: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    {/* Test Button */}
                    <button
                      type="button"
                      onClick={handleTestTelegram}
                      disabled={testingTelegram || !telegramSettings.chatId}
                      className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {testingTelegram ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                      ) : (
                        <Send className="w-4 h-4 text-sky-400" />
                      )}
                      <span>Tester l'envoi sur Telegram</span>
                    </button>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={savingTelegram}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-sky-500/20 transition-all disabled:opacity-50"
                    >
                      {savingTelegram ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>Enregistrer la Configuration Telegram</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: SUPPORT & TICKETING */}
        {activeTab === 'support' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Success banner */}
            {ticketSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{ticketSuccess}</span>
              </div>
            )}

            {/* Header info */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-900/30 via-slate-900 to-indigo-900/30 border border-sky-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <LifeBuoy className="w-5 h-5 text-sky-400" />
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    Assistance & Support Dédié Revendeur
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  Un besoin technique, une question sur vos marges ou une commande client ? Discutez en direct avec le Super Admin.
                </p>
              </div>

              <button
                onClick={() => {
                  setNewTicketSubject('');
                  setNewTicketMessage('');
                  setTicketError(null);
                  setShowNewTicketModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Ouvrir un Nouveau Ticket</span>
              </button>
            </div>

            {/* Telegram Notification reminder banner in Support tab */}
            <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <p className="text-xs text-slate-300">
                  <b className="text-white">Ne manquez aucune réponse :</b> Activez les alertes Telegram pour recevoir une notification en direct dès que le Super Admin répond à vos tickets.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('marketing');
                  setMarketingSubTab('telegram');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 text-sky-300 font-bold text-xs whitespace-nowrap self-start sm:self-auto transition-all"
              >
                Configurer Telegram →
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Total Tickets</div>
                <div className="text-2xl font-black text-white mt-1">{ticketStats.total}</div>
                <span className="text-[10px] text-slate-500">Historique complet</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20">
                <div className="text-[10px] font-bold text-amber-400 uppercase">En Attente</div>
                <div className="text-2xl font-black text-amber-400 mt-1">{ticketStats.open}</div>
                <span className="text-[10px] text-slate-500">Réponse attendue</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-sky-500/20">
                <div className="text-[10px] font-bold text-sky-400 uppercase">En Cours</div>
                <div className="text-2xl font-black text-sky-400 mt-1">{ticketStats.inProgress}</div>
                <span className="text-[10px] text-slate-500">Discussion active</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20">
                <div className="text-[10px] font-bold text-emerald-400 uppercase">Résolus</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{ticketStats.resolved}</div>
                <span className="text-[10px] text-slate-500">Problèmes réglés</span>
              </div>
            </div>

            {/* Two-Column Chat & Tickets View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[580px]">
              {/* Left Column: Tickets List */}
              <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-3 flex flex-col h-[650px] overflow-hidden">
                {/* List Filter & Refresh */}
                <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800">
                  <select
                    value={ticketFilterStatus}
                    onChange={(e) => setTicketFilterStatus(e.target.value)}
                    className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 font-bold focus:outline-none"
                  >
                    <option value="ALL">Tous les statuts</option>
                    <option value="OPEN">Ouverts</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="RESOLVED">Résolus</option>
                    <option value="CLOSED">Fermés</option>
                  </select>

                  <button
                    onClick={fetchResellerTickets}
                    disabled={loadingTickets}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-all"
                    title="Actualiser"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingTickets ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Ticket Cards */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {loadingTickets ? (
                    <div className="py-12 text-center text-xs text-slate-500">
                      Chargement de vos tickets...
                    </div>
                  ) : resellerTickets.filter((t) => ticketFilterStatus === 'ALL' || t.status === ticketFilterStatus).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                      <LifeBuoy className="w-8 h-8 mb-2 opacity-40 text-sky-400" />
                      <p className="text-xs font-bold text-slate-300">Aucun ticket pour le moment</p>
                      <p className="text-[11px] mt-1 text-slate-500">
                        Besoin d'aide ? Cliquez sur &quot;Ouvrir un Nouveau Ticket&quot; pour échanger avec le Super Admin.
                      </p>
                    </div>
                  ) : (
                    resellerTickets
                      .filter((t) => ticketFilterStatus === 'ALL' || t.status === ticketFilterStatus)
                      .map((t) => {
                        const isSelected = t.id === selectedResellerTicketId;
                        const lastMsg = t.messages?.[t.messages.length - 1];

                        return (
                          <button
                            key={t.id}
                            onClick={() => setSelectedResellerTicketId(t.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
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
                                {t.priority === 'URGENT' && <span className="text-[10px] text-rose-400 font-bold">🔴 Urgente</span>}
                                {t.priority === 'HIGH' && <span className="text-[10px] text-amber-400 font-bold">🟠 Haute</span>}
                                {t.priority === 'MEDIUM' && <span className="text-[10px] text-sky-400 font-bold">🔵 Normale</span>}
                                {t.priority === 'LOW' && <span className="text-[10px] text-slate-400 font-bold">⚪ Basse</span>}

                                {t.status === 'OPEN' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                    Ouvert
                                  </span>
                                )}
                                {t.status === 'IN_PROGRESS' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-500/20 text-sky-400 border border-sky-500/30">
                                    En cours
                                  </span>
                                )}
                                {t.status === 'RESOLVED' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    Résolu
                                  </span>
                                )}
                                {t.status === 'CLOSED' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-400 border border-slate-700">
                                    Fermé
                                  </span>
                                )}
                              </div>
                            </div>

                            <h4 className="text-xs font-bold text-white line-clamp-1">{t.subject}</h4>

                            {lastMsg && (
                              <div className="text-[11px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded-lg line-clamp-1 flex items-center justify-between">
                                <span className="truncate">
                                  <strong className={lastMsg.senderRole === 'SUPER_ADMIN' ? 'text-purple-300' : 'text-slate-300'}>
                                    {lastMsg.senderRole === 'SUPER_ADMIN' ? 'Super Admin : ' : 'Vous : '}
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

              {/* Right Column: Chat Conversation Thread */}
              <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col h-[650px] overflow-hidden">
                {(() => {
                  const activeT = resellerTickets.find((t) => t.id === selectedResellerTicketId);
                  if (!activeT) {
                    return (
                      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                        <MessageSquare className="w-12 h-12 mb-3 text-slate-600" />
                        <h4 className="text-sm font-bold text-white mb-1">Aucun ticket sélectionné</h4>
                        <p className="text-xs max-w-sm text-slate-400">
                          Sélectionnez un ticket dans la liste pour lire les échanges ou ouvrez un nouveau ticket pour obtenir de l'assistance.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <>
                      {/* Thread Top Bar */}
                      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                              {activeT.ticketCode}
                            </span>
                            <span className="text-xs text-slate-400">
                              {activeT.category === 'ORDERS'
                                ? 'Commandes'
                                : activeT.category === 'COMMISSIONS'
                                ? 'Commissions & Retraits'
                                : activeT.category === 'TECHNICAL'
                                ? 'Technique'
                                : activeT.category === 'CATALOG'
                                ? 'Catalogue'
                                : 'Général'}
                            </span>
                            {activeT.priority === 'URGENT' && <span className="text-[10px] text-rose-400 font-bold">🔴 Urgente</span>}
                            {activeT.priority === 'HIGH' && <span className="text-[10px] text-amber-400 font-bold">🟠 Haute</span>}
                            {activeT.priority === 'MEDIUM' && <span className="text-[10px] text-sky-400 font-bold">🔵 Normale</span>}
                            {activeT.priority === 'LOW' && <span className="text-[10px] text-slate-400 font-bold">⚪ Basse</span>}
                          </div>
                          <h3 className="text-sm font-black text-white">{activeT.subject}</h3>
                        </div>

                        <div>
                          {activeT.status === 'OPEN' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              En attente Super Admin
                            </span>
                          )}
                          {activeT.status === 'IN_PROGRESS' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-sky-500/20 text-sky-400 border border-sky-500/30">
                              En cours de traitement
                            </span>
                          )}
                          {activeT.status === 'RESOLVED' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Résolu
                            </span>
                          )}
                          {activeT.status === 'CLOSED' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-slate-800 text-slate-400 border border-slate-700">
                              Fermé
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Messages Thread */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar bg-slate-950/30">
                        {activeT.messages?.map((m: any) => {
                          const isSuperAdmin = m.senderRole === 'SUPER_ADMIN';

                          return (
                            <div
                              key={m.id}
                              className={`flex flex-col ${isSuperAdmin ? 'items-start' : 'items-end'}`}
                            >
                              <div className="flex items-center gap-1.5 mb-1 px-1">
                                {isSuperAdmin ? (
                                  <>
                                    <span className="text-[10px] font-black text-purple-400 flex items-center gap-1 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                                      <Shield className="w-3 h-3" /> Super Admin
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="text-[10px] font-black text-sky-400 flex items-center gap-1 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                                      Vous
                                    </span>
                                  </>
                                )}
                              </div>

                              <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                                  isSuperAdmin
                                    ? 'bg-gradient-to-r from-purple-950/70 to-indigo-950/80 border border-purple-500/30 text-purple-100 rounded-tl-none shadow-md'
                                    : 'bg-sky-600/20 border border-sky-500/30 text-white rounded-tr-none shadow-md'
                                }`}
                              >
                                {m.message}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Reply Box */}
                      <div className="p-3 border-t border-slate-800 bg-slate-950/90">
                        <div className="flex gap-2">
                          <textarea
                            rows={2}
                            value={resellerReplyText}
                            onChange={(e) => setResellerReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                e.preventDefault();
                                handleSendResellerReply();
                              }
                            }}
                            placeholder="Écrivez votre message au Super Admin... (Ctrl+Entrée pour envoyer)"
                            className="flex-1 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                          />
                          <button
                            onClick={handleSendResellerReply}
                            disabled={sendingResellerReply || !resellerReplyText.trim()}
                            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all shrink-0 self-end shadow-lg shadow-sky-500/10"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{sendingResellerReply ? '...' : 'Envoyer'}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Create New Ticket */}
        {showNewTicketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Nouveau Ticket de Support</h3>
                    <p className="text-[11px] text-slate-400">Votre demande sera directement transmise au Super Admin</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewTicketModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleCreateTicket} className="p-5 space-y-4 overflow-y-auto">
                {ticketError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{ticketError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                    Sujet de la demande *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTicketSubject}
                    onChange={(e) => setNewTicketSubject(e.target.value)}
                    placeholder="Ex: Problème livraison commande #1234, Question commission..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                      Catégorie
                    </label>
                    <select
                      value={newTicketCategory}
                      onChange={(e) => setNewTicketCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="GENERAL">Question Générale</option>
                      <option value="ORDERS">Commande Client</option>
                      <option value="COMMISSIONS">Commissions & Retraits</option>
                      <option value="TECHNICAL">Problème Technique</option>
                      <option value="CATALOG">Catalogue & Tarifs</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                      Priorité
                    </label>
                    <select
                      value={newTicketPriority}
                      onChange={(e) => setNewTicketPriority(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="LOW">Basse</option>
                      <option value="MEDIUM">Normale</option>
                      <option value="HIGH">Haute</option>
                      <option value="URGENT">Urgente (Bloquant)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                    Message détaillé *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newTicketMessage}
                    onChange={(e) => setNewTicketMessage(e.target.value)}
                    placeholder="Décrivez précisément votre demande, référence de commande si applicable..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowNewTicketModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={creatingTicket || !newTicketSubject.trim() || !newTicketMessage.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
                  >
                    {creatingTicket ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{creatingTicket ? 'Création en cours...' : 'Envoyer & Notifier le Super Admin'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Product Pricing Modal */}
        <BulkProductPricingModal
          isOpen={showBulkPricingModal}
          onClose={() => setShowBulkPricingModal(false)}
          products={products}
          selectedProductIds={selectedProductIds}
          categories={categories}
          onApply={handleBulkApplyPricing}
        />
      </main>
    </div>

    {/* ======================================================== */}
    {/* MOBILE OFF-CANVAS SLIDE-OVER DRAWER                     */}
    {/* ======================================================== */}
    {mobileMenuOpen && (
      <div className="lg:hidden fixed inset-0 z-50 flex">
        {/* Backdrop blur */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-fadeIn transition-opacity"
        />

        {/* Drawer content */}
        <div className="relative w-4/5 max-w-xs bg-slate-900 border-r border-slate-800 h-full p-5 flex flex-col justify-between shadow-2xl z-10 animate-slideRight overflow-y-auto">
          <div className="space-y-6">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                  {reseller?.storeName ? reseller.storeName.charAt(0).toUpperCase() : 'R'}
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-white text-xs truncate">
                    {reseller?.storeName || 'Ma Boutique'}
                  </div>
                  <div className="text-[10px] text-sky-400 font-mono truncate">
                    {reseller?.subdomain}.abonnementspro.com
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Items Grouped */}
            <div className="space-y-5">
              {NAV_GROUPS.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1.5">
                  <div className="text-[9px] font-black uppercase tracking-wider text-slate-500 px-2">
                    {group.title}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = activeTab === item.id;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => switchTab(item.id)}
                          className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                            isActive
                              ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold font-mono border ${
                                isActive
                                  ? 'bg-slate-950/20 text-slate-950 border-slate-950/30'
                                  : item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
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
          </div>

          {/* Drawer Footer */}
          <div className="pt-4 border-t border-slate-800 space-y-2 mt-6">
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Voir ma vitrine en ligne</span>
            </a>

            <button
              onClick={handleLogout}
              className="w-full py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ======================================================== */}
    {/* MOBILE BOTTOM APP DOCK BAR (Visible on screens < lg)    */}
    {/* ======================================================== */}
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl px-3 py-2 flex items-center justify-between shadow-2xl">
      <button
        onClick={() => switchTab('overview')}
        className={`flex flex-col items-center gap-1 transition-all flex-1 ${
          activeTab === 'overview' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <TrendingUp className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">Accueil</span>
      </button>

      <button
        onClick={() => switchTab('products')}
        className={`flex flex-col items-center gap-1 transition-all flex-1 relative ${
          activeTab === 'products' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Package className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">Catalogue</span>
      </button>

      <button
        onClick={() => switchTab('orders')}
        className={`flex flex-col items-center gap-1 transition-all flex-1 relative ${
          activeTab === 'orders' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">Commandes</span>
        {pendingOrdersCount > 0 && (
          <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center animate-bounce">
            {pendingOrdersCount}
          </span>
        )}
      </button>

      <button
        onClick={() => switchTab('wallet')}
        className={`flex flex-col items-center gap-1 transition-all flex-1 ${
          activeTab === 'wallet' ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Coins className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">Finances</span>
      </button>

      <button
        onClick={() => setMobileMenuOpen(true)}
        className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-all flex-1"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">Menu</span>
      </button>
    </nav>
  </div>
);
}
