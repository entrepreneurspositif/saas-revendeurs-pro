/**
 * Centralized Input Sanitization and Anti-XSS / Anti-Injection Protection.
 * Protects forms, API endpoints, Telegram notifications, and database persistence.
 */

// Known Out-of-Band (OAST) / Blind XSS / Data Exfiltration probe domains
const MALICIOUS_DOMAINS = [
  'webhook.site',
  'burpcollaborator.net',
  'oastify.com',
  'oast.fun',
  'oast.live',
  'oast.site',
  'oast.online',
  'oast.pro',
  'interact.sh',
  'requestcatcher.com',
  'pipedream.net',
  'canarytokens.com',
  'hookbin.com',
  'ngrok.io',
  'ngrok-free.app',
  'localtunnel.me',
  'beeceptor.com',
  'postb.in',
  'requestbin.com',
  'ptsecurity.com',
];

// Dangerous HTML tags, event handlers, and pseudo-protocols
const MALICIOUS_TAGS_REGEX = /<\s*(script|iframe|object|embed|svg|img|link|style|meta|base|form|input|button|body|html|head|applet|audio|video)/i;
const MALICIOUS_HANDLERS_REGEX = /\bon\w+\s*=/i; // onerror=, onload=, onclick=, etc.
const MALICIOUS_PROTOCOLS_REGEX = /(javascript|vbscript|data\s*:\s*text\/html)\s*:/i;

/**
 * Checks whether an input contains known malicious payloads, XSS injections, or exfiltration domains.
 */
export function isMaliciousPayload(input: any): boolean {
  if (input === null || input === undefined) return false;
  const str = String(input).trim();
  if (!str) return false;

  const lower = str.toLowerCase();

  // 1. Check known exfiltration domains
  for (const domain of MALICIOUS_DOMAINS) {
    if (lower.includes(domain)) {
      return true;
    }
  }

  // 2. Check dangerous HTML tags
  if (MALICIOUS_TAGS_REGEX.test(str)) {
    return true;
  }

  // 3. Check event handlers (onerror=, onload=, etc.)
  if (MALICIOUS_HANDLERS_REGEX.test(str)) {
    return true;
  }

  // 4. Check dangerous pseudo-protocols
  if (MALICIOUS_PROTOCOLS_REGEX.test(str)) {
    return true;
  }

  return false;
}

/**
 * Strips HTML tags, control characters, null bytes, and dangerous protocols from a single-line text input.
 */
export function sanitizeText(input: any, maxLength = 250): string {
  if (input === null || input === undefined) return '';
  let str = String(input);

  // Remove null bytes and invisible control characters (except common whitespace)
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Strip all HTML tags
  str = str.replace(/<[^>]*>/g, '');

  // Strip remaining angle brackets
  str = str.replace(/[<>]/g, '');

  // Disarm pseudo-protocols
  str = str.replace(/javascript\s*:/gi, '');
  str = str.replace(/vbscript\s*:/gi, '');
  str = str.replace(/data\s*:\s*text\/html/gi, '');

  // Normalize excessive spaces and single line
  str = str.replace(/\s+/g, ' ').trim();

  // Enforce max length
  if (maxLength && str.length > maxLength) {
    str = str.slice(0, maxLength).trim();
  }

  return str;
}

/**
 * Sanitizes multi-line text (e.g. descriptions, support messages, instructions).
 * Preserves normal line breaks while stripping HTML, scripts, and control characters.
 */
export function sanitizeMultilineText(input: any, maxLength = 2000): string {
  if (input === null || input === undefined) return '';
  let str = String(input);

  // Remove null bytes and non-printable control characters
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Strip all HTML tags
  str = str.replace(/<[^>]*>/g, '');

  // Strip remaining angle brackets
  str = str.replace(/[<>]/g, '');

  // Disarm pseudo-protocols
  str = str.replace(/javascript\s*:/gi, '');
  str = str.replace(/vbscript\s*:/gi, '');
  str = str.replace(/data\s*:\s*text\/html/gi, '');

  // Normalize excessive newlines (max 2 consecutive)
  str = str.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  // Enforce max length
  if (maxLength && str.length > maxLength) {
    str = str.slice(0, maxLength).trim();
  }

  return str;
}

/**
 * Escapes characters for safe HTML rendering (prevents XSS when interpolated into HTML).
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Clean and validate email string: removes newlines (prevents header injection),
 * strips angle brackets and quotes, and enforces max length.
 */
export function sanitizeEmail(email: any): string {
  if (!email) return '';
  let str = String(email).trim().toLowerCase();
  str = str.replace(/[\r\n\t]/g, '');
  str = str.replace(/[<>"']/g, '');
  if (str.length > 150) {
    str = str.slice(0, 150);
  }
  return str;
}
