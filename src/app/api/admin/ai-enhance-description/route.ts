import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface EnhanceRequest {
  title: string;
  category?: string;
  draft?: string;
  tone?: 'sales' | 'short' | 'technical' | 'guide';
  options?: {
    instantDelivery?: boolean;
    warranty?: boolean;
    multiDevice?: boolean;
    official?: boolean;
  };
}

/**
 * Intelligent French e-commerce copywriting engine for digital goods.
 * Works instantly with zero latency, zero external API costs,
 * and produces persuasive, high-converting descriptions.
 */
function generateExpertDescription({
  title,
  category = 'Général',
  draft = '',
  tone = 'sales',
  options = {},
}: EnhanceRequest): string {
  const cleanTitle = (title || 'Service Premium').trim();
  const cleanDraft = (draft || '').trim();
  const lowerTitle = cleanTitle.toLowerCase();
  const lowerDraft = cleanDraft.toLowerCase();
  const lowerCat = (category || '').toLowerCase();

  const includeInstantDelivery = options.instantDelivery !== false;
  const includeWarranty = options.warranty !== false;
  const includeMultiDevice = options.multiDevice !== false;
  const includeOfficial = options.official !== false;

  // Extract detected attributes from draft notes
  const has4K = /4k|ultra hd|uhd|1080p|full hd|hd/i.test(cleanTitle + ' ' + cleanDraft);
  const hasScreens = /(1|2|4|5)\s*(écran|ecran|screen|profil|profile|compte|appareil|device)/i.exec(cleanDraft);
  const detectedScreens = hasScreens ? hasScreens[0] : null;

  const hasDuration = /(1|2|3|6|12)\s*(mois|an|ans|semaine|jours|day|month|year)|(à vie|lifetime)/i.exec(cleanTitle + ' ' + cleanDraft);
  const detectedDuration = hasDuration ? hasDuration[0] : null;

  const isPrivate = /privé|prive|private|perso|personnel|dédié|dedie|sur votre mail/i.test(cleanTitle + ' ' + cleanDraft);
  const isUpgrade = /upgrade|invitation|sur votre compte|votre propre|renouvelable/i.test(cleanTitle + ' ' + cleanDraft);

  // Identify product category family
  const isStreaming = /netflix|spotify|youtube|disney|prime|deezer|apple music|crunchyroll|iptv|canal|paramount|hbo|max|tidal|peacock/i.test(lowerTitle);
  const isAI = /chatgpt|gpt|openai|claude|anthropic|midjourney|canva|capcut|adobe|freepik|copilot|cursor|elevenlabs|runway|perplexity|sora/i.test(lowerTitle) || lowerCat.includes('ia');
  const isLicenceOrDev = /windows|office|microsoft|vpn|nordvpn|expressvpn|surfshark|cyberghost|antivirus|kaspersky|jetbrains|license|licence|clé|cle|key|rdp|vps/i.test(lowerTitle) || lowerCat.includes('dev') || lowerCat.includes('licence');
  const isMethod = /méthode|methode|guide|formation|ebook|tuto|tutoriel|stratégie|systeme/i.test(lowerTitle) || lowerCat.includes('méthode') || lowerCat.includes('methode');
  const isOTP = /otp|sms|sim|virtuel|onlinesim|numéro|numero|whatsapp|telegram/i.test(lowerTitle) || lowerCat.includes('mobile');

  // Specific features bullet generator
  const featureBullets: string[] = [];

  if (isStreaming) {
    if (isPrivate) {
      featureBullets.push('• Compte 100% privé et réservé à votre usage exclusif');
    } else {
      featureBullets.push('• Accès direct et profil sécurisé avec code PIN personnel');
    }
    if (has4K) {
      featureBullets.push('• Qualité maximale 4K Ultra HD & son spatial Dolby Atmos');
    } else {
      featureBullets.push('• Qualité vidéo Haute Définition (HD / 4K selon compatibilité)');
    }
    featureBullets.push('• Téléchargement hors ligne pour regarder vos contenus partout');
    if (detectedScreens) {
      featureBullets.push(`• Accès configuré pour : ${detectedScreens}`);
    }
    if (includeMultiDevice) {
      featureBullets.push('• Compatible Smart TV, Boîtier Android, Apple TV, PC, Mac et Smartphones');
    }
  } else if (isAI) {
    if (isUpgrade) {
      featureBullets.push('• Activation directe ou invitation sur votre propre compte');
    } else {
      featureBullets.push('• Accès complet et sans restriction à la version Pro / Plus');
    }
    featureBullets.push('• Vitesse de réponse ultra-rapide et accès prioritaire sans file d\'attente');
    featureBullets.push('• Débloquez toutes les fonctionnalités avancées (génération illimitée, modèles récents, plugins)');
    if (includeMultiDevice) {
      featureBullets.push('• Utilisation fluide sur navigateur web, application mobile et desktop');
    }
  } else if (isLicenceOrDev) {
    featureBullets.push('• Clé d\'activation officielle et authentique (licence 100% légitime)');
    featureBullets.push('• Activation en ligne instantanée directement auprès de l\'éditeur');
    featureBullets.push('• Toutes les mises à jour officielles et correctifs de sécurité inclus');
    featureBullets.push('• Installation propre sans logiciel tiers ni modification système');
  } else if (isMethod) {
    featureBullets.push('• Guide complet étape par étape, clair et immédiatement actionnable');
    featureBullets.push('• Liens secrets, plateformes méconnues et ressources exclusives fournis');
    featureBullets.push('• Testé et validé : méthode 100% fonctionnelle en 2026');
    featureBullets.push('• Accessible à tous : aucun niveau technique avancé requis');
  } else if (isOTP) {
    featureBullets.push('• Numéro virtuel temporaire dédié et sécurisé pour vérification par SMS');
    featureBullets.push('• Réception rapide du code de validation en temps réel');
    featureBullets.push('• Compatible avec les plateformes majeures (WhatsApp, Telegram, Google, etc.)');
  } else {
    featureBullets.push('• Produit digital vérifié et certifié prêt à l\'emploi');
    featureBullets.push('• Accès complet à l\'ensemble des fonctionnalités premium');
    if (includeMultiDevice) {
      featureBullets.push('• Compatible avec tous vos appareils habituels');
    }
  }

  // Include user's own draft points if provided
  if (cleanDraft) {
    // If user provided bullets or short lines, clean and integrate them
    const draftLines = cleanDraft
      .split('\n')
      .map((l) => l.trim().replace(/^[-*•]\s*/, ''))
      .filter((l) => l.length > 5 && !featureBullets.some((b) => b.toLowerCase().includes(l.toLowerCase())));

    if (draftLines.length > 0 && draftLines.length <= 4) {
      draftLines.forEach((line) => {
        featureBullets.push(`• ${line}`);
      });
    }
  }

  // Guarantee bullets
  const deliveryBullet = includeInstantDelivery
    ? '• ⚡ Livraison Instantanée : Réception de vos accès immédiatement après confirmation de commande'
    : '• 📦 Livraison Rapide : Traitement prioritaire de votre commande';

  const warrantyBullet = includeWarranty
    ? `• 🛡️ Garantie de Remplacement : Assistance dédiée et remplacement 100% garanti en cas de souci${detectedDuration ? ` (durée : ${detectedDuration})` : ''}`
    : '• 🛡️ Garantie Service Vérifié';

  const supportBullet = '• 💬 Support Client Réactif : Disponible 7j/7 pour vous accompagner à tout moment';

  // Assemble based on Tone
  if (tone === 'short') {
    return [
      `💎 ${cleanTitle.toUpperCase()}`,
      '',
      `Profitez d'un accès premium officiel et vérifié au meilleur tarif :`,
      featureBullets.slice(0, 3).join('\n'),
      '',
      deliveryBullet,
      warrantyBullet,
      supportBullet,
    ].join('\n');
  }

  if (tone === 'technical') {
    return [
      `⚙️ SPÉCIFICATIONS TECHNIQUES : ${cleanTitle.toUpperCase()}`,
      '',
      `📋 DÉTAILS DE L'OFFRE :`,
      `• Type de produit : ${category}`,
      detectedDuration ? `• Durée de validité : ${detectedDuration}` : '• Durée : Conforme à l\'offre choisie',
      isPrivate ? '• Type d\'accès : Compte privé exclusif' : '• Type d\'accès : Accès officiel vérifié',
      has4K ? '• Résolution max : 4K Ultra HD / HDR' : '• Résolution / Qualité : Haute Définition maximale',
      '',
      `🚀 CARACTÉRISTIQUES INCLUSES :`,
      featureBullets.join('\n'),
      '',
      `🔒 CONFORMITÉ & LIVRAISON :`,
      deliveryBullet,
      warrantyBullet,
      supportBullet,
    ].join('\n');
  }

  if (tone === 'guide' || isMethod) {
    return [
      `📚 GUIDE & MÉTHODE PRATIQUE : ${cleanTitle.toUpperCase()}`,
      '',
      `Accédez sans attendre à la méthode complète pas-à-pas pour réussir sans perdre de temps.`,
      '',
      `🎯 CE QUE VOUS ALLEZ DÉCOUVRIR :`,
      featureBullets.join('\n'),
      '',
      `⚡ ACCÈS IMMÉDIAT :`,
      `• 🔓 Déblocage automatique du guide complet sur votre ticket client immédiatement après le paiement`,
      `• 📱 Consultation illimitée 24/7 sur smartphone, tablette ou ordinateur`,
      warrantyBullet,
      supportBullet,
    ].join('\n');
  }

  // Default: 'sales' (Complet & Vendeur - high converting)
  const introHook = isMethod
    ? `Découvrez la méthode exclusive pour débloquer ${cleanTitle} en toute simplicité et obtenir des résultats immédiats.`
    : `Obtenez votre accès officiel à ${cleanTitle} au meilleur tarif du web, avec activation immédiate et garantie totale de fonctionnement !`;

  return [
    `💎 ${cleanTitle.toUpperCase()}`,
    '',
    introHook,
    '',
    `🚀 CE QUI EST INCLUS DANS VOTRE COMMANDE :`,
    featureBullets.join('\n'),
    '',
    `⚡ LIVRAISON & ACTIVATION :`,
    deliveryBullet,
    `• 🔑 Instructions claires et simples fournies pour une mise en service en moins de 2 minutes`,
    '',
    `🛡️ GARANTIE & SÉRÉNITÉ :`,
    warrantyBullet,
    supportBullet,
    includeOfficial ? `• ✅ Produit 100% authentique et conforme aux standards de sécurité` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Optional AI caller if OPENAI_API_KEY or GEMINI_API_KEY is available.
 */
async function callExternalAI(
  prompt: string,
  systemInstructions: string
): Promise<string | null> {
  // Check OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemInstructions },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 650,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) return content;
      }
    } catch (err) {
      console.warn('OpenAI enhancement fallback:', err);
    }
  }

  // Check Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstructions }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 650, temperature: 0.7 },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (content) return content;
      }
    } catch (err) {
      console.warn('Gemini enhancement fallback:', err);
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const authCookie = req.cookies.get('admin_session')?.value;
    const isLocalDev = process.env.NODE_ENV !== 'production';

    // Allow authenticated admin
    if (authCookie !== 'authenticated_admin_session_token_2026' && !isLocalDev) {
      return NextResponse.json({ success: false, message: 'Non autorisé' }, { status: 401 });
    }

    const body: EnhanceRequest = await req.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { success: false, message: 'Le titre du produit est requis pour générer une description.' },
        { status: 400 }
      );
    }

    let enhancedDescription: string | null = null;

    // Attempt external LLM if available
    const hasExternalKey = Boolean(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY);
    if (hasExternalKey) {
      const systemInstructions = `Tu es un expert copywriter e-commerce spécialisé dans la vente de produits digitaux, abonnements (Netflix, Canva, ChatGPT, Spotify...), licences logicielles et méthodes sur la boutique "Abonnements Pro".
Règles strictes :
- Rédige en français parfait, moderne, rassurant et très vendeur.
- Formate le texte avec des sauts de ligne clairs, des puces unicode (•) et des titres en majuscules avec émojis (ex: 💎 TITRE, 🚀 CE QUI EST INCLUS :, ⚡ LIVRAISON & ACTIVATION :, 🛡️ GARANTIE & ASSISTANCE :).
- N'utilise PAS de markdown lourd comme les doubles astérisques ** ou les dièses ## car le texte sera affiché en texte brut préformaté (whitespace-pre-line).
- Mets en avant : la qualité officielle garantie, la rapidité de livraison instantanée par email et ticket, la garantie de remplacement et le support 7j/7.
- Si des notes ou brouillons sont fournis, intègre-les avec élégance.`;

      const prompt = `Produit : ${body.title}
Catégorie : ${body.category || 'Général'}
Style demandé : ${body.tone || 'sales'}
Brouillon / Notes fournies par le vendeur : ${body.draft || 'Aucune note, génère une description complète et vendeuse'}`;

      enhancedDescription = await callExternalAI(prompt, systemInstructions);
    }

    // Heuristic generator fallback (100% reliable, zero delay, top quality)
    if (!enhancedDescription) {
      enhancedDescription = generateExpertDescription(body);
    }

    // Generate alternative ideas / tags
    const suggestions = [
      '⚡ Livraison instantanée 24/7',
      '🛡️ Garantie de remplacement 100%',
      '💎 Compte officiel garanti',
      '💬 Support client 7j/7',
    ];

    return NextResponse.json({
      success: true,
      description: enhancedDescription,
      suggestions,
      engine: hasExternalKey && enhancedDescription ? 'ai_llm' : 'expert_heuristic',
    });
  } catch (error: any) {
    console.error('Error enhancing product description:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Erreur lors de la génération de la description' },
      { status: 500 }
    );
  }
}
