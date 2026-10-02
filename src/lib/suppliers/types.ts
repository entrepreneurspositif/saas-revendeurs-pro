export interface StandardSupplierProduct {
  externalId: string;
  name: string;
  description?: string;
  productType?: string;
  costPrice: number;
  currency: string;
  stock: number;
  sold: number;
  image?: string;
  emoji?: string;
  isAvailable: boolean;
  rawPayload?: any;
}

export interface PurchaseParams {
  productId: string;
  quantity: number;
  idempotencyKey: string;
  customerAccounts?: string;
  extraData?: Record<string, any>;
}

export interface PurchaseResult {
  success: boolean;
  orderRef?: string;
  deliveredCredentials?: string | object;
  message?: string;
  errorCode?: string;
}

export interface ISupplierDriver {
  fetchProducts(): Promise<StandardSupplierProduct[]>;
  fetchBalance?(): Promise<number>;
  purchase(params: PurchaseParams): Promise<PurchaseResult>;
  testConnection(): Promise<{ success: boolean; message: string; balance?: number }>;
}
