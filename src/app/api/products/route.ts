import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const adminMode = searchParams.get('admin') === 'true';

    const manualOnly = searchParams.get('manualOnly') === 'true';

    const whereClause: any = {};

    if (!adminMode) {
      whereClause.isActive = true;
    }

    if (manualOnly) {
      whereClause.activeSupplierProductId = null;
    }

    if (category && category !== 'Tous') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        activeSupplierProduct: {
          include: {
            supplier: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formattedProducts = products.map((p) => {
      const suppProd = p.activeSupplierProduct;
      const costPrice = suppProd ? suppProd.costPrice : 0;
      const margin = p.sellingPrice - costPrice;
      const marginPercent = costPrice > 0 ? ((margin / costPrice) * 100).toFixed(1) : '100';
      const stock = suppProd ? suppProd.stock : 999;
      const isSupplierActive = suppProd ? (suppProd.supplier?.isActive ?? false) : true;

      // Base public fields
      const publicProduct: Record<string, any> = {
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        category: p.category,
        sellingPrice: p.sellingPrice,
        currency: p.currency,
        isActive: p.isActive,
        badge: p.badge,
        imageUrl: p.imageUrl,
        deliveryType: p.deliveryType || (p.category === 'Méthode' ? 'AUTOMATIC' : 'MANUAL'),
        isMethod: p.category === 'Méthode' || p.deliveryType === 'AUTOMATIC',
        updatedAt: p.updatedAt,
        stock: stock,
        isAvailable: p.isActive && stock > 0 && isSupplierActive,
      };

      // ONLY include supplier & wholesale financial details if adminMode is TRUE
      if (adminMode) {
        publicProduct.deliveryType = p.deliveryType || (p.category === 'Méthode' ? 'AUTOMATIC' : 'MANUAL');
        publicProduct.methodContent = p.methodContent || null;
        publicProduct.costPrice = costPrice;
        publicProduct.profitMargin = parseFloat(margin.toFixed(2));
        publicProduct.profitMarginPercent = parseFloat(marginPercent);
        publicProduct.activeSupplier = suppProd?.supplier
          ? {
              id: suppProd.supplier.id,
              name: suppProd.supplier.name,
              type: suppProd.supplier.type,
              isActive: suppProd.supplier.isActive,
              reliabilityScore: suppProd.supplier.reliabilityScore,
            }
          : null;
        publicProduct.activeSupplierProduct = suppProd
          ? {
              id: suppProd.id,
              externalId: suppProd.externalId,
              name: suppProd.name,
              costPrice: suppProd.costPrice,
              stock: suppProd.stock,
              productType: suppProd.productType,
            }
          : null;
      }

      return publicProduct;
    });

    return NextResponse.json({ success: true, products: formattedProducts });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      category,
      description,
      sellingPrice,
      badge,
      imageUrl,
      activeSupplierProductId,
      deliveryType,
      methodContent,
    } = body;

    if (!title || sellingPrice === undefined) {
      return NextResponse.json(
        { success: false, message: 'Le titre et le prix de vente sont requis' },
        { status: 400 }
      );
    }

    const cleanTitle = title.trim();
    const slugBase = cleanTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const slug = `${slugBase}-${Date.now().toString(36)}`;
    const parsedPrice = parseFloat(Number(sellingPrice).toFixed(2));
    const effectiveCategory = category?.trim() || 'Général';
    const isAutoDelivery =
      deliveryType === 'AUTOMATIC' ||
      effectiveCategory.toLowerCase().includes('méthode') ||
      effectiveCategory.toLowerCase().includes('methode');

    const productData: any = {
      title: cleanTitle,
      slug,
      category: effectiveCategory,
      description: description?.trim() || null,
      sellingPrice: parsedPrice,
      badge: badge?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      deliveryType: isAutoDelivery ? 'AUTOMATIC' : 'MANUAL',
      methodContent: methodContent?.trim() || null,
      isActive: true,
    };

    if (activeSupplierProductId) {
      const suppProd = await prisma.supplierProduct.findUnique({
        where: { id: activeSupplierProductId },
      });
      if (suppProd) {
        productData.activeSupplierProductId = suppProd.id;
        productData.activeSupplierId = suppProd.supplierId;
      }
    }

    const newProduct = await prisma.product.create({
      data: productData,
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      sellingPrice,
      isActive,
      category,
      activeSupplierProductId,
      title,
      description,
      badge,
      imageUrl,
      deliveryType,
      methodContent,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID de produit requis' }, { status: 400 });
    }

    const updateData: any = {};

    if (sellingPrice !== undefined) updateData.sellingPrice = parseFloat(Number(sellingPrice).toFixed(2));
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (category !== undefined) updateData.category = category;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (badge !== undefined) updateData.badge = badge;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl?.trim() || null;
    if (deliveryType !== undefined) updateData.deliveryType = deliveryType;
    if (methodContent !== undefined) updateData.methodContent = methodContent ? methodContent.trim() : null;

    if (activeSupplierProductId) {
      const suppProd = await prisma.supplierProduct.findUnique({
        where: { id: activeSupplierProductId },
      });
      if (suppProd) {
        updateData.activeSupplierProductId = suppProd.id;
        updateData.activeSupplierId = suppProd.supplierId;
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        activeSupplierProduct: {
          include: { supplier: true },
        },
      },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID de produit requis' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
