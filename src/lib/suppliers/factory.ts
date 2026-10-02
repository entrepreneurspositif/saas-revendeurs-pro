import { ISupplierDriver } from './types';
import { CanbosoDriver } from './canbosoDriver';
import { GenericSupplierDriver } from './genericDriver';

export function createSupplierDriver(supplier: {
  type: string;
  apiUrl: string;
  apiKey: string;
  name?: string;
}): ISupplierDriver {
  if (supplier.type.toLowerCase() === 'canboso' || supplier.apiUrl.includes('canboso')) {
    return new CanbosoDriver(supplier.apiUrl, supplier.apiKey);
  }
  return new GenericSupplierDriver(supplier.apiUrl, supplier.apiKey, supplier.name || 'Fournisseur');
}
