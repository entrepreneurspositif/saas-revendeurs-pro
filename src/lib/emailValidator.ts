import dns from 'dns';

// Comprehensive set of known disposable & temporary email domains and patterns
const DISPOSABLE_DOMAINS = new Set<string>([
  // Popular Disposable Services
  'mailinator.com', 'mailinater.com', 'suremail.info', 'spamherelots.com', 'binkmail.com',
  'safetymail.info', 'chogmail.com', 'chammy.info', 'spambooger.com', 'tradermail.info',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.fr.nf', 'courriel.fr.nf',
  'moncourrier.fr.nf', 'monemail.fr.nf', 'monmail.fr.nf', 'hide.biz.st', 'mymail.infos.st',
  'temp-mail.org', 'tempmail.com', 'tempmail.net', 'tempmail.ninja', 'tempmailaddress.com',
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minmail.com',
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz',
  'sharklasers.com', 'guerrillamailblock.com', 'pokemail.net', 'spam4.me', 'grr.la',
  'throwawaymail.com', 'trashmail.com', 'trashmail.net', 'trashmail.me', 'rcpt.at',
  'dispostable.com', 'fakeinbox.com', 'getairmail.com', 'mohmal.com', 'mohmal.im',
  'burnermail.io', 'inboxkitten.com', 'crazymailing.com', 'tempail.com', 'tmail.com',
  'generator.email', 'mytemp.email', 'minuteinbox.com', 'emailondeck.com', 'dropmail.me',
  'tempinbox.com', 'nada.ltd', 'getnada.com', 'abclinks.biz',
  'armyspy.com', 'cuvox.de', 'dayrep.com', 'fleckens.hu', 'gustr.com',
  'jourrapide.com', 'rhyta.com', 'superrito.com', 'teleworm.us', 'einrot.com',
  // Common fake/test domains
  'example.com', 'example.org', 'example.net', 'test.com', 'test.fr', 'fake.com',
  'invalid.com', 'localhost.com', 'dummy.com', 'spam.com', 'nowhere.com',
  // Aggregated disposable domains
  '0-mail.com', '0815.ru', '0clickemail.com', '0wnd.net', '0wnd.org',
  '10mail.org', '123-m.com', '1blackhole.com', '1pad.de', '20minutemail.com',
  '2prong.com', '30minutemail.com', '3d-painting.com', '4warding.com', '4warding.net',
  '4warding.org', 'anonymousbox.com', 'antichef.com', 'antichef.net', 'antispam.de',
  'baxomale.ht.cx', 'beefmilk.com', 'brefmail.com', 'bsnow.net', 'bugmenot.com',
  'bupkis.org', 'cachedot.net', 'cashette.com', 'centermail.com', 'centermail.net',
  'chacuo.net', 'clipmail.eu', 'cmail.club', 'correo.blogos.net', 'cosmorph.com',
  'courrieltemporaire.com', 'curryjunk.com', 'cust.in', 'dacoolest.com', 'dandikmail.com',
  'deadaddress.com', 'deadspam.com', 'despam.it', 'despammed.com', 'devnullmail.com',
  'dfgh.net', 'disposableinbox.com', 'disposeamail.com', 'dodgeit.com', 'dodgit.com',
  'dontextend.com', 'dontreg.com', 'dontsendmespam.de', 'drdrb.net', 'dump-email.info',
  'dumpmail.de', 'dumpymail.com', 'e4ward.com', 'easytrashmail.com', 'email60.com',
  'emailias.com', 'emailmiser.com', 'emailtemporario.com.br', 'emailto.de', 'emailx.at.tf',
  'emailxfer.com', 'ephemail.net', 'etranquil.com', 'eyepaste.com', 'fakemailgenerator.com',
  'fastcheetah.com', 'fastmail.fm', 'filzmail.com', 'fixmail.be', 'flaimail.com',
  'flyspam.com', 'frapmail.com', 'front14.org', 'fuckme.im', 'fudgerub.com',
  'get1mail.com', 'getonemail.com', 'ghostletters.com', 'gishpuppy.com', 'greensloth.com',
  'haltospam.com', 'hararak.com', 'hatespam.org', 'hidemail.de', 'hotpop.com',
  'hulapla.de', 'hushmail.me', 'ieatspam.com', 'iknowwhereyoulive.com', 'inboxclean.com',
  'incognitotube.com', 'incognitomail.org', 'instant-mail.de', 'instantemailaddress.com',
  'jetable.com', 'jetable.net', 'jetable.org', 'kasmail.com', 'klassmaster.com',
  'klzlk.com', 'koszmail.pl', 'kurzepost.de', 'lifebyfood.com', 'link2mail.net',
  'litedrop.com', 'lookugly.com', 'lopl.com', 'm-a-i-l.biz', 'mail-temporaire.fr',
  'mail-temporaire.net', 'mail333.com', 'mail4trash.com', 'mailbidon.com', 'mailcatch.com',
  'maileater.com', 'mailexpire.com', 'mailhazard.com', 'mailhazard.us', 'mailimate.com',
  'mailinc.net', 'mailisdead.com', 'mailjunk.com', 'mailme.dk', 'mailme.lat',
  'mailmetrash.com', 'mailmoat.com', 'mailnesia.com', 'mailnull.com', 'mailorg.org',
  'mailpoof.com', 'mailref.com', 'mailslite.com', 'mailslurp.com', 'mailtemp.info',
  'mailtothis.com', 'mailtrash.net', 'mailzipper.com', 'meltmail.com', 'messagebeamer.de',
  'misterpin.com', 'monemail.net', 'monmail.com', 'mycleaninbox.net', 'mytrashmail.com',
  'netmails.net', 'netzidiot.de', 'noclickemail.com', 'nomail.xl.cx', 'nospam.ze.tc',
  'nospam4.us', 'nospambox.org', 'nospammail.net', 'notsharingmy.info', 'nowmymail.com',
  'nwldx.com', 'objectmail.com', 'oneoffmail.com', 'onewaymail.com', 'owlpic.com',
  'pookmail.com', 'postinbox.com', 'quickinbox.com', 'quickmail.info', 'rcpt.at',
  'recursor.net', 'regcode.org', 'remail.org', 'rtrtr.com', 'sbcglobal.at',
  'sendfree.com', 'shieldedmail.com', 'shiftmail.com', 'shortmail.net', 'sinnlos-mail.de',
  'slopsbox.com', 'smartjunkmail.com', 'smashmail.de', 'snkmail.com', 'sofimail.com',
  'sofort-mail.de', 'sogetthis.com', 'soodonims.com', 'spambob.com', 'spambob.net',
  'spambob.org', 'spambog.com', 'spambog.de', 'spambog.ru', 'spambox.info',
  'spambox.us', 'spamcan.net', 'spamcon.org', 'spamcorptastic.com', 'spamcowboy.com',
  'spamday.com', 'spamex.com', 'spamfree24.org', 'spamgourmet.com', 'spamgourmet.net',
  'spamgourmet.org', 'spamhole.com', 'spamify.com', 'spaminator.de', 'spaminator.org',
  'spamkill.info', 'spaml.de', 'spaml.net', 'spaml.org', 'spamlife.org',
  'spammotel.com', 'spamoff.de', 'spampaste.com', 'spamprefix.com', 'spamspot.com',
  'spamtrap.ro', 'spamweed.com', 'speed.1s.fr', 'spoofmail.de', 'squizzy.de',
  'ssoia.com', 'subdimension.com', 'superstachel.de', 'suremail.info', 'tafmail.com',
  'tagmail.com', 'tarikmail.com', 'teleworm.com', 'temporaryforwarding.com', 'temporaryinbox.com',
  'temporarymail.com', 'tempomail.fr', 'tempsky.com', 'thankyou2010.com', 'thelimestones.com',
  'thisisnotmyrealemail.com', 'tikamail.com', 'tinemail.com', 'tmailor.com', 'tradermail.info',
  'trash-amil.com', 'trash-mail.at', 'trash-mail.com', 'trash-mail.de', 'trash-me.com',
  'trashcanmail.com', 'trashmail.at', 'trashmail.de', 'trashmail.io', 'trashmail.net',
  'trashmail.org', 'trashymail.com', 'tyldd.com', 'uggsrock.com', 'uplinkmail.com',
  'uroid.com', 'validdatasync.com', 'venompen.com', 'veryrealemail.com', 'vidavee.com',
  'wegwerfadresse.de', 'wegwerfemail.de', 'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org',
  'wh4f.org', 'whyspam.me', 'willhackforfood.biz', 'wuzup.net', 'wuzupmail.net',
  'xagloo.com', 'xemaps.com', 'xents.com', 'xmaily.com', 'xoxy.net', 'yep.it',
  'yogamaven.com', 'yomail.info', 'yuurok.com', 'zehnminutenmail.de', 'zippymail.info',
  'zxcvbnm.co.uk',
]);

export interface EmailValidationResult {
  isValid: boolean;
  cleanEmail: string;
  domain: string;
  error?: string;
  isDisposable?: boolean;
  hasValidMx?: boolean;
}

/**
 * Validates an email address format, checks against disposable email blacklists,
 * and verifies that the domain has valid, working MX (mail exchange) records.
 */
export async function validateEmail(emailInput: string, checkMx: boolean = true): Promise<EmailValidationResult> {
  if (!emailInput || typeof emailInput !== 'string') {
    return { isValid: false, cleanEmail: '', domain: '', error: 'Adresse e-mail requise.' };
  }

  const cleanEmail = emailInput.trim().toLowerCase();

  // 1. Strict RFC 5322 regex check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleanEmail) || cleanEmail.length > 254) {
    return {
      isValid: false,
      cleanEmail,
      domain: '',
      error: 'Format d\'adresse e-mail invalide. Exemple valide : contact@votredomaine.com',
    };
  }

  const parts = cleanEmail.split('@');
  if (parts.length !== 2) {
    return { isValid: false, cleanEmail, domain: '', error: 'Format d\'adresse e-mail invalide.' };
  }

  const [localPart, domain] = parts;

  if (localPart.length > 64 || domain.length > 253) {
    return { isValid: false, cleanEmail, domain, error: 'Adresse e-mail trop longue.' };
  }

  // 2. Check disposable/temporary email blacklist
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      cleanEmail,
      domain,
      isDisposable: true,
      error: 'Les adresses e-mail temporaires ou jetables (disposable emails) sont strictement interdites sur la plateforme. Veuillez utiliser une adresse e-mail personnelle ou professionnelle valide.',
    };
  }

  // Check subdomains of known disposable services (e.g. *.mailinator.com, *.yopmail.com)
  for (const disp of ['mailinator.com', 'yopmail.com', 'tempmail.com', 'guerrillamail.com', 'trashmail.com', '10minutemail.com']) {
    if (domain.endsWith('.' + disp)) {
      return {
        isValid: false,
        cleanEmail,
        domain,
        isDisposable: true,
        error: 'Les adresses e-mail temporaires ou jetables sont strictement interdites.',
      };
    }
  }

  // 3. DNS MX Record Resolution (to eliminate fake domains, test domains, and non-existent domains)
  if (checkMx) {
    try {
      // Timeout promise for DNS lookup (max 2.5 seconds to keep registrations fast)
      const resolveWithTimeout = Promise.race([
        dns.promises.resolveMx(domain),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('DNS_TIMEOUT')), 2500)
        ),
      ]);

      const mxRecords = await resolveWithTimeout;

      if (!mxRecords || mxRecords.length === 0) {
        return {
          isValid: false,
          cleanEmail,
          domain,
          hasValidMx: false,
          error: `Le domaine "${domain}" n'a aucun serveur de messagerie (MX) configuré. Veuillez utiliser une adresse e-mail existante et fonctionnelle.`,
        };
      }

      // Check for RFC 7505 Null MX (a single record with exchange: "." or empty string indicating the domain does not accept email)
      const hasRealMx = mxRecords.some(
        (rec) => rec.exchange && rec.exchange.trim() !== '' && rec.exchange.trim() !== '.'
      );

      if (!hasRealMx) {
        return {
          isValid: false,
          cleanEmail,
          domain,
          hasValidMx: false,
          error: `Le domaine "${domain}" ne reçoit pas d'e-mails (Null MX). Veuillez utiliser une adresse réelle.`,
        };
      }

      // Check if the MX exchange itself belongs to a disposable service
      const isDisposableMx = mxRecords.some((rec) => {
        const ex = (rec.exchange || '').toLowerCase();
        return (
          ex.includes('mailinator') ||
          ex.includes('guerrillamail') ||
          ex.includes('yopmail') ||
          ex.includes('trashmail') ||
          ex.includes('tempmail') ||
          ex.includes('dropmail')
        );
      });

      if (isDisposableMx) {
        return {
          isValid: false,
          cleanEmail,
          domain,
          isDisposable: true,
          error: 'Le serveur de messagerie de ce domaine est un service temporaire jetable non autorisé.',
        };
      }
    } catch (err: any) {
      // If domain doesn't exist (ENOTFOUND or ENODATA)
      if (err.code === 'ENOTFOUND' || err.code === 'ENODATA' || err.code === 'ESERVFAIL') {
        return {
          isValid: false,
          cleanEmail,
          domain,
          hasValidMx: false,
          error: `Le domaine de messagerie "@${domain}" est introuvable ou n'existe pas. Veuillez corriger votre adresse e-mail.`,
        };
      }
      // On DNS timeout or transient network glitch, let it pass rather than blocking legitimate users
      console.warn(`DNS check warning for ${domain}:`, err.message);
    }
  }

  return {
    isValid: true,
    cleanEmail,
    domain,
    hasValidMx: true,
  };
}
