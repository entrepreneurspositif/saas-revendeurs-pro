import { ISupplierDriver, PurchaseParams, PurchaseResult, StandardSupplierProduct } from './types';
import dns from 'dns';

export class HubxStoreDriver implements ISupplierDriver {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    let cleanUrl = (apiUrl || '').trim().replace(/\/+$/, '');
    if (!cleanUrl.includes('/api/public/reseller/v1')) {
      cleanUrl = `${cleanUrl}/api/public/reseller/v1`;
    }
    this.apiUrl = cleanUrl;
    this.apiKey = apiKey;
    try {
      dns.setDefaultResultOrder('ipv4first');
    } catch (e) {}
  }

  private getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
      ...extraHeaders,
    };
  }

  async fetchProducts(): Promise<StandardSupplierProduct[]> {
    try {
      const res = await fetch(`${this.apiUrl}/products`, {
        headers: this.getHeaders(),
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Erreur API HubxStore HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      const rawProducts: any[] = Array.isArray(data) ? data : (data.products || []);

      return rawProducts.map((item) => ({
        externalId: String(item.id || item.slug),
        name: item.name || 'Produit HubxStore',
        description: item.description || '',
        productType: item.fulfillment_type || 'account',
        costPrice: Number(item.price_usdt ?? item.price ?? 0),
        currency: 'USD',
        stock: Number(item.stock ?? 0),
        sold: Number(item.sold ?? 0),
        image: item.image || null,
        emoji: item.emoji || null,
        isAvailable: item.active !== false && Number(item.stock ?? 0) > 0,
        rawPayload: item,
      }));
    } catch (error: any) {
      console.error('HubxStore fetchProducts failed:', error);
      throw error;
    }
  }

  async fetchBalance(): Promise<number> {
    try {
      const res = await fetch(`${this.apiUrl}/balance`, {
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
      console.error('HubxStore fetchBalance failed:', error);
      return 0;
    }
  }

  async purchase(params: PurchaseParams): Promise<PurchaseResult> {
    try {
      const headers = this.getHeaders();
      const payload: Record<string, any> = {
        product_id: params.productId,
        quantity: params.quantity || 1,
        external_order_id: params.idempotencyKey || `order-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      };

      const res = await fetch(`${this.apiUrl}/orders`, {
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

      if (!res.ok || resJson.ok === false || resJson.error) {
        return {
          success: false,
          message: resJson.error || `Échec d'achat fournisseur (HTTP ${res.status})`,
          errorCode: resJson.code || 'SUPPLIER_ERROR',
        };
      }

      const order = resJson.order || resJson;
      const deliveredCodes = resJson.delivered_codes || resJson.codes || order.delivered_codes || order.codes || [];

      return {
        success: true,
        orderRef: String(order.id || order.order_id || Date.now()),
        deliveredCredentials: Array.isArray(deliveredCodes) && deliveredCodes.length === 1 ? deliveredCodes[0] : deliveredCodes,
        message: 'Produit acheté avec succès auprès du fournisseur HubxStore',
      };
    } catch (error: any) {
      console.error('HubxStore purchase failed:', error);
      return {
        success: false,
        message: error.message || 'Erreur réseau lors de la communication avec HubxStore',
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
        message: `Connexion réussie à HubxStore (${products.length} produits récupérés, solde direct $${balance.toFixed(2)})`,
        balance: balance,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Échec de connexion à HubxStore: ${error.message}`,
      };
    }
  }
}
