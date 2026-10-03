import { ISupplierDriver } from './types';
import { CanbosoDriver } from './canbosoDriver';
import { InsightXProDriver } from './insightxproDriver';
import { GenericSupplierDriver } from './genericDriver';

export function createSupplierDriver(supplier: {
  type: string;
  apiUrl: string;
  apiKey: string;
  name?: string;
}): ISupplierDriver {
  const typeLower = (supplier.type || '').toLowerCase();
  const urlLower = (supplier.apiUrl || '').toLowerCase();
  const nameLower = (supplier.name || '').toLowerCase();
  const keyLower = (supplier.apiKey || '').toLowerCase();

  if (
    typeLower === 'insightxpro' ||
    typeLower === 'insight' ||
    urlLower.includes('insightxpro') ||
    urlLower.includes('insight.store') ||
    nameLower.includes('insight') ||
    keyLower.startsWith('isk_')
  ) {
    return new InsightXProDriver(supplier.apiUrl, supplier.apiKey);
  }

  if (typeLower === 'canboso' || urlLower.includes('canboso') || nameLower.includes('canboso')) {
    return new CanbosoDriver(supplier.apiUrl, supplier.apiKey);
  }

  return new GenericSupplierDriver(supplier.apiUrl, supplier.apiKey, supplier.name || 'Fournisseur');
}
