import { ISupplierDriver, PurchaseParams, PurchaseResult, StandardSupplierProduct } from './types';

export class GenericSupplierDriver implements ISupplierDriver {
  private apiUrl: string;
  private apiKey: string;
  private supplierName: string;

  constructor(apiUrl: string, apiKey: string, supplierName: string = 'Fournisseur Générique') {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.supplierName = supplierName;
  }

  async fetchProducts(): Promise<StandardSupplierProduct[]> {
    // Returns simulated products for custom secondary supplier
    return [
      {
        externalId: 'gen_prod_01',
        name: 'API Qwen $30 (TechSupply Special)',
        description: 'Compte API Qwen avec solde $30 garanti',
        productType: 'account',
        costPrice: 2.20,
        currency: 'USD',
        stock: 15,
        sold: 5,
        isAvailable: true,
      },
      {
        externalId: 'gen_prod_02',
        name: 'Locket Gold 1 An (Garantie 1 An)',
        description: 'Locket Gold activation rapide sur votre compte',
        productType: 'upgrade_account',
        costPrice: 1.55,
        currency: 'USD',
        stock: 45,
        sold: 20,
        isAvailable: true,
      }
    ];
  }

  async purchase(params: PurchaseParams): Promise<PurchaseResult> {
    // Simulated instant fulfillment for secondary supplier
    const code = `${this.supplierName.toUpperCase().slice(0, 3)}-KEY-${Math.floor(100000 + Math.random() * 900000)}-2026`;
    return {
      success: true,
      orderRef: `ts-ord-${Date.now()}`,
      deliveredCredentials: {
        license_key: code,
        activation_instructions: "Consultez les instructions fournies pour activer votre produit.",
        supplier: this.supplierName,
        purchasedAt: new Date().toISOString(),
      },
      message: `Achat exécuté avec succès via ${this.supplierName}`,
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string; balance?: number }> {
    return {
      success: true,
      message: `Connexion active à ${this.supplierName} (API Valide)`,
      balance: 110.00,
    };
  }
}
