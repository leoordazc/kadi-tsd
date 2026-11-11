import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // Se actualiza cada hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.kaditsd.com.mx';

  // 1. Rutas estáticas
  const rutasEstaticas: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalogo`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // 2. Rutas dinámicas (Fichas de producto desde Supabase)
  try {
    // 👇 CAMBIO AQUÍ: Usamos created_at en lugar de updated_at
    const { data: productos, error } = await supabase
      .from('productos')
      .select('codigo_caja, created_at')
      .eq('activo', true)
      .gt('stock', 0);

    if (error) {
      console.error('Error obteniendo productos para sitemap:', error);
      return rutasEstaticas;
    }

    const rutasProductos: MetadataRoute.Sitemap = (productos || []).map((prod) => ({
      url: `${baseUrl}/catalogo/${prod.codigo_caja}`,
      // 👇 CAMBIO AQUÍ: Usamos prod.created_at
      lastModified: prod.created_at ? new Date(prod.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...rutasEstaticas, ...rutasProductos];
  } catch (error) {
    console.error('Error generando sitemap:', error);
    return rutasEstaticas;
  }
}
