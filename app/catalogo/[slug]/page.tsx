import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductoDetalle from "./ProductoDetalle";

// 1. Generar el título y la descripción para Google
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  // 👇 IMPORTANTE: En Next.js 15, params es una Promesa, hay que hacer await
  const { slug } = await params;

  const { data: producto } = await supabase
    .from('productos')
    .select('nombre, descripcion')
    .eq('codigo_caja', slug)
    .single();

  if (!producto) {
    return { title: 'Producto no encontrado | KADI TS&D' };
  }

  return {
    title: `${producto.nombre} | KADI TS&D`,
    description: producto.descripcion?.substring(0, 160) || `Compra ${producto.nombre} con garantía por escrito y envío a todo México.`,
  };
}

// 2. Buscar el producto y renderizarlo en el servidor
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  // 👇 IMPORTANTE: Hacemos await a los params
  const { slug } = await params;

  console.log("🔎 Buscando en SSR el producto con slug:", slug);

  const { data: producto, error } = await supabase
    .from('productos')
    .select('*')
    .eq('codigo_caja', slug)
    .single();

  if (error) {
    console.error("❌ Error de Supabase buscando producto:", error.message);
  }

  if (!producto) {
    console.log("⚠️ Producto no encontrado en la BD, lanzando 404");
    notFound(); 
  }

  // Le pasamos el producto al componente de cliente
  return <ProductoDetalle productoInicial={producto} slug={slug} />;
}