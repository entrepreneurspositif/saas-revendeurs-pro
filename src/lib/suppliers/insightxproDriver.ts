import { ISupplierDriver, PurchaseParams, PurchaseResult, StandardSupplierProduct } from './types';
import dns from 'dns';

export class InsightXProDriver implements ISupplierDriver {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = (apiUrl || 'https://api.insightxpro.store').replace(/\/+$/, '');
    this.apiKey = apiKey;
    try {
      dns.setDefaultResultOrder('ipv4first');
    } catch (e) {}
  }

  private getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      'X-API-Key': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    };
  }

  async fetchProducts(): Promise<StandardSupplierProduct[]> {
    try {
      const res = await fetch(`${this.apiUrl}/api/v1/products`, {
        headers: this.getHeaders(),
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Erreur API InsightXPro HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      const rawProducts: any[] = Array.isArray(data) ? data : (data.products || []);

      return rawProducts.map((item) => ({
        externalId: String(item.id || item.product_id),
        name: item.name || 'Produit InsightXPro',
        description: item.description_text || item.description || '',
        productType: item.productType || 'account',
        costPrice: Number(item.price_usdt ?? item.price ?? item.base_price_usdt ?? 0),
        currency: 'USD',
        stock: item.unlimited ? 999999 : Number(item.stock ?? 0),
        sold: Number(item.sold ?? 0),
        image: item.image || null,
        emoji: item.emoji || null,
        isAvailable: item.available !== false && (item.unlimited || Number(item.stock) > 0),
        rawPayload: item,
      }));
    } catch (error: any) {
      console.error('InsightXPro fetchProducts failed:', error);
      throw error;
    }
  }

  async fetchBalance(): Promise<number> {
    try {
      const res = await fetch(`${this.apiUrl}/api/v1/balance`, {
        headers: this.getHeaders(),
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.balance_usdt !== undefined) {
          return Number(data.balance_usdt);
        }
      }
      return 0;
    } catch (error) {
      console.error('InsightXPro fetchBalance failed:', error);
      return 0;
    }
  }

  async purchase(params: PurchaseParams): Promise<PurchaseResult> {
    try {
      const headers = this.getHeaders();

      const payload: Record<string, any> = {
        product_id: Number(params.productId),
        quantity: params.quantity || 1,
        idempotency_key: params.idempotencyKey || `order-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      };

      const res = await fetch(`${this.apiUrl}/api/v1/orders`, {
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

      if (!res.ok || resJson.error || !resJson.order) {
        return {
          success: false,
          message: resJson.error || `Échec d'achat fournisseur (HTTP ${res.status})`,
          errorCode: resJson.code || 'SUPPLIER_ERROR',
        };
      }

      const order = resJson.order;
      const deliveredCodes = order.codes || order.delivered_codes || order.coupons || [];

      return {
        success: order.status === 'completed',
        orderRef: String(order.order_id || order.id || Date.now()),
        deliveredCredentials: Array.isArray(deliveredCodes) && deliveredCodes.length === 1 ? deliveredCodes[0] : deliveredCodes,
        message: 'Produit acheté avec succès auprès du fournisseur InsightXPro',
      };
    } catch (error: any) {
      console.error('InsightXPro purchase failed:', error);
      return {
        success: false,
        message: error.message || 'Erreur réseau lors de la communication avec InsightXPro',
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
        message: `Connexion réussie à InsightXPro (${products.length} produits récupérés, solde direct $${balance.toFixed(2)})`,
        balance: balance,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Échec de connexion à InsightXPro: ${error.message}`,
      };
    }
  }
}
