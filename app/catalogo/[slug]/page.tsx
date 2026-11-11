import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductoDetalle from "./ProductoDetalle";

// 1. Generar el título y la descripción para Google
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: producto } = await supabase
    .from('productos')
    .select('nombre, descripcion')
    .eq('codigo_caja', params.slug)
    .single();

  if (!producto) {
    return { title: 'Producto no encontrado | KADI TS&D' };
  }

  return {
    title: `${producto.nombre} | KADI TS&D`,
    description: producto.descripcion?.substring(0, 160) || `Compra ${producto.nombre} con garantía por escrito y envío a todo México.`,
    openGraph: {
      title: `${producto.nombre} | KADI TS&D`,
      description: producto.descripcion?.substring(0, 160) || `Compra ${producto.nombre} con garantía por escrito.`,
    }
  };
}

// 2. Buscar el producto y renderizarlo en el servidor
export default async function Page({ params }: { params: { slug: string } }) {
  const { data: producto, error } = await supabase
    .from('productos')
    .select('*')
    .eq('codigo_caja', params.slug)
    .single();

  if (error || !producto) {
    notFound(); // Muestra un 404 real de Next.js si no existe
  }

  // Le pasamos el producto ya cargado al componente de cliente
  return <ProductoDetalle productoInicial={producto} slug={params.slug} />;
}