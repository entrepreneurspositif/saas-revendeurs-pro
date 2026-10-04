import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/fatjo&prudo/'],
      },
    ],
    sitemap: 'https://revente-abonnement.vercel.app/sitemap.xml',
  };
}
