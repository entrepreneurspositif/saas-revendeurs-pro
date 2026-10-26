import { ISupplierDriver, PurchaseParams, PurchaseResult, StandardSupplierProduct } from './types';
import dns from 'dns';

export class CanbosoDriver implements ISupplierDriver {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl.replace(/\/+$/, '');
    this.apiKey = apiKey;
    try {
      dns.setDefaultResultOrder('ipv4first');
    } catch (e) {}
  }

  private getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      'x-api-key': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    };
  }

  async fetchProducts(): Promise<StandardSupplierProduct[]> {
    try {
      const res = await fetch(`${this.apiUrl}/api/v2/telegram-buyer/products`, {
        headers: this.getHeaders(),
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Erreur API Canboso HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      const rawProducts: any[] = Array.isArray(data) ? data : (data.products || []);

      return rawProducts.map((item) => {
        const rawAvailable = item.availability?.available;
        let stock = 0;
        if (typeof rawAvailable === 'number' && !isNaN(rawAvailable)) {
          stock = Math.max(0, Math.floor(rawAvailable));
        } else if (typeof item.stock === 'number' && !isNaN(item.stock)) {
          stock = Math.max(0, Math.floor(item.stock));
        } else {
          // If null or undefined, stock is 0 (out of stock / manual upgrade)
          stock = 0;
        }

        return {
          externalId: String(item.productId || item.id),
          name: item.name || 'Produit Sans Nom',
          description: item.description || '',
          productType: item.productType || 'account',
          costPrice: Number(item.price?.amount ?? item.price ?? 0),
          currency: item.price?.currency || 'USD',
          stock: stock,
          sold: Number(item.availability?.sold ?? item.sold ?? 0),
          image: item.image || null,
          emoji: item.emoji || null,
          isAvailable: stock > 0,
          rawPayload: item,
        };
      });
    } catch (error: any) {
      console.error('Canboso fetchProducts failed:', error);
      throw error;
    }
  }

  async fetchBalance(): Promise<number> {
    try {
      const res = await fetch(`${this.apiUrl}/api/v2/telegram-buyer/balance`, {
        headers: this.getHeaders(),
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        if (data && (data.balanceUsd !== undefined || data.balance !== undefined)) {
          return Number(data.balanceUsd ?? data.balance ?? 0);
        }
      }
      return 0;
    } catch (error) {
      console.error('Canboso fetchBalance failed:', error);
      return 0;
    }
  }

  async purchase(params: PurchaseParams): Promise<PurchaseResult> {
    try {
      const headers = this.getHeaders({
        'Idempotency-Key': params.idempotencyKey || `order-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      });

      const payload: Record<string, any> = {
        product_id: params.productId,
        quantity: params.quantity || 1,
      };

      if (params.customerAccounts) {
        payload.customer_accounts = params.customerAccounts;
      }

      const res = await fetch(`${this.apiUrl}/api/v2/telegram-buyer/purchase`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const resText = await res.text();
      let resJson: any = {};
      try {
        resJson = JSON.parse(resText);
      } catch (e) {
        resJson = { raw: resText };
      }

      if (!res.ok || resJson.success === false) {
        const rawMsg = resJson.message || resJson.error || `Échec d'achat fournisseur (HTTP ${res.status})`;
        const isOutOfStock = /stock|exceeds available stock|out of stock|quantité demandée/i.test(rawMsg);
        return {
          success: false,
          message: isOutOfStock
            ? `Rupture de stock chez le fournisseur Canboso : ${rawMsg}`
            : rawMsg,
          errorCode: isOutOfStock ? 'OUT_OF_STOCK' : (resJson.code || 'SUPPLIER_ERROR'),
          isOutOfStock,
        };
      }

      return {
        success: true,
        orderRef: resJson.orderId || resJson.purchaseId || resJson.transaction_id || `canboso-${Date.now()}`,
        deliveredCredentials: resJson.data || resJson.credentials || resJson.items || resJson,
        message: resJson.message || 'Produit acheté avec succès auprès du fournisseur Canboso',
      };
    } catch (error: any) {
      console.error('Canboso purchase failed:', error);
      return {
        success: false,
        message: error.message || 'Erreur réseau lors de la communication avec Canboso',
        errorCode: 'NETWORK_ERROR',
      };
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; balance?: number }> {
    try {
      const balance = await this.fetchBalance();
      const products = await this.fetchProducts();
      return {
        success: true,
        message: `Connexion réussie à Canboso (${products.length} produits récupérés, solde direct $${balance.toFixed(2)})`,
        balance: balance,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Échec de connexion à Canboso: ${error.message}`,
      };
    }
  }
}
