'use client';

import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Package, Truck } from 'lucide-react';

interface FormattedCredentialsProps {
  credentials: any;
  className?: string;
}

export default function FormattedCredentials({ credentials, className = '' }: FormattedCredentialsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!credentials) {
    return (
      <div className="text-slate-500 text-xs italic p-3 bg-slate-900/60 rounded-xl border border-slate-800">
        Aucune information de commande disponible.
      </div>
    );
  }

  // Parse if string is JSON
  let parsedData: any = credentials;
  if (typeof credentials === 'string') {
    const trimmed = credentials.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        parsedData = JSON.parse(trimmed);
      } catch (e) {
        parsedData = credentials;
      }
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Safe stringify helper that NEVER returns [object Object]
  const safeStringify = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);

    if (typeof val === 'object') {
      // If object has a simple string id/code/ref property, extract it directly
      if (val.id && typeof val.id !== 'object') return String(val.id);
      if (val.code && typeof val.code !== 'object') return String(val.code);
      if (val.ref && typeof val.ref !== 'object') return String(val.ref);

      if (Array.isArray(val)) {
        return val.map((v) => safeStringify(v)).join('\n');
      }

      return Object.entries(val)
        .map(([k, v]) => `${k}: ${safeStringify(v)}`)
        .join('\n');
    }

    return String(val);
  };

  // Helper to extract Order Ref and Delivery content
  let orderInfo: string | null = null;
  let deliveryInfo: any = null;

  if (typeof parsedData === 'object' && parsedData !== null && !Array.isArray(parsedData)) {
    // Look for Order reference
    const orderKey = Object.keys(parsedData).find((k) =>
      ['order', 'order_id', 'orderid', 'orderref', 'purchaseid', 'transaction_id', 'transactionid', 'id', 'ref'].some(
        (sub) => k.toLowerCase() === sub || k.toLowerCase().includes(sub)
      )
    );

    if (orderKey && parsedData[orderKey]) {
      orderInfo = safeStringify(parsedData[orderKey]);
    }

    // Look for Delivery content
    const deliveryKey = Object.keys(parsedData).find((k) =>
      ['delivery', 'data', 'credentials', 'items', 'accounts', 'content', 'result', 'code', 'license'].some(
        (sub) => k.toLowerCase() === sub || k.toLowerCase().includes(sub)
      )
    );

    if (deliveryKey && parsedData[deliveryKey]) {
      deliveryInfo = parsedData[deliveryKey];
    }

    // Fallback if neither was explicitly named
    if (!orderInfo && !deliveryInfo) {
      const remainingKeys = Object.keys(parsedData).filter(
        (k) =>
          !['success', 'message', 'error', 'code', 'status', 'product_id', 'supplier_id', 'balance'].includes(
            k.toLowerCase()
          )
      );

      if (remainingKeys.length > 0) {
        if (remainingKeys.length === 1) {
          deliveryInfo = parsedData[remainingKeys[0]];
        } else {
          deliveryInfo = remainingKeys.map((k) => `${k}: ${safeStringify(parsedData[k])}`).join('\n');
        }
      } else {
        deliveryInfo = parsedData;
      }
    }
  } else if (Array.isArray(parsedData)) {
    deliveryInfo = parsedData;
  } else {
    deliveryInfo = String(parsedData);
  }

  const deliveryString = safeStringify(deliveryInfo);

  return (
    <div className={`space-y-3.5 max-w-full overflow-hidden ${className}`}>
      {/* ORDER SECTION */}
      {orderInfo && (
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-sky-500/30 space-y-2 shadow-md">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 flex items-center space-x-1.5 shrink-0">
              <Package className="w-3.5 h-3.5 text-sky-400" />
              <span>ORDER</span>
            </span>

            <button
              onClick={() => handleCopy(orderInfo!, 'order-info')}
              className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-bold flex items-center space-x-1 transition-all border border-sky-500/30 shrink-0"
            >
              {copiedKey === 'order-info' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copier ORDER</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80">
            <span className="font-mono text-xs font-black text-sky-300 break-all select-all">
              {orderInfo}
            </span>
          </div>
        </div>
      )}

      {/* DELIVERY SECTION */}
      {deliveryString && (
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-emerald-500/30 space-y-2 shadow-md">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5 shrink-0">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>DELIVERY</span>
            </span>

            {deliveryString.startsWith('http://') || deliveryString.startsWith('https://') ? (
              <a
                href={deliveryString}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-bold flex items-center space-x-1 transition-all border border-sky-500/30 shrink-0"
              >
                <span>Ouvrir le lien</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <button
                onClick={() => handleCopy(deliveryString, 'delivery-info')}
                className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center space-x-1.5 transition-all border border-emerald-500/30 shrink-0"
              >
                {copiedKey === 'delivery-info' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier DELIVERY</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 overflow-x-auto">
            {Array.isArray(deliveryInfo) ? (
              <div className="space-y-2">
                {deliveryInfo.map((item, idx) => {
                  const itemStr = safeStringify(item);
                  const itemCopyId = `deliv-item-${idx}`;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <span className="font-mono text-xs font-bold text-emerald-300 break-all select-all">
                        #{idx + 1}: {itemStr}
                      </span>
                      <button
                        onClick={() => handleCopy(itemStr, itemCopyId)}
                        className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[10px] font-bold shrink-0"
                      >
                        {copiedKey === itemCopyId ? 'Copié !' : 'Copier'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <pre className="text-xs font-mono font-bold text-emerald-300 whitespace-pre-wrap break-all max-w-full leading-relaxed select-all">
                {deliveryString}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
