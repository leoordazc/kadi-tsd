import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/perfil/', '/seguimiento/'], // No indexar paneles privados
    },
    sitemap: 'https://www.kaditsd.com.mx/sitemap.xml',
  };
}