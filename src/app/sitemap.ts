import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export const dynamic = 'force-dynamic';

const getCachedSitemapProducts = unstable_cache(
  async () => {
    try {
      return await prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      });
    } catch (e) {
      console.error('Error fetching sitemap products:', e);
      return [];
    }
  },
  ['sitemap-products-list'],
  { revalidate: 3600 }
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://abonnementspro.com';

  // Base static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/otp`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/exclusifs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    const products = await getCachedSitemapProducts();

    const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }));

    return [...routes, ...productUrls];
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    return routes;
  }
}
