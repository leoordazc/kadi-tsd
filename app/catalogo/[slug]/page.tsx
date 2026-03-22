import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "../../../components/AddToCartButton";




// ✅ METADATOS DINÁMICOS (SEO)
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: product } = await supabase
    .from("productos")
    .select("*")
    .eq("codigo_caja", params.slug)
    .single();

  if (!product) return { title: "Producto no encontrado" };

  const symptoms = product.descripcion?.split(" ").slice(0, 10).join(" ") || "";

  return {
    title: `${product.nombre} | Garantía 12 meses | KADI TSyD`,
    description: `Compra tu ${product.nombre} verificada. Solución técnica para fallas de ${symptoms}. Envío gratis a todo México y soporte técnico experto.`,
    openGraph: {
      title: `${product.nombre} | KADI TSyD`,
      description: `Transmisión manual verificada. Stock: ${product.stock} unidades.`,
      images: product.imagen_url ? [product.imagen_url] : [],
      type: "product",
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { data: product, error } = await supabase
    .from("productos")
    .select("*")
    .eq("codigo_caja", params.slug)
    .single();

  if (error || !product) notFound();

  // ✅ JSON-LD (DATOS ESTRUCTURADOS)
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.nombre,
    image: product.imagen_url || "/placeholder.png",
    description: product.descripcion || `Transmisión manual verificada para ${product.modelo_vehiculo?.join(", ")}.`,
    brand: {
      "@type": "Brand",
      name: "KADI TSyD",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "MXN",
      price: product.precio,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "KADI TSyD",
      },
    },
    ...(product.especificaciones && {
      additionalProperty: Object.entries(product.especificaciones).map(([key, value]) => ({
        name: key,
        value: value,
      })),
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Imagen */}
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <img
                src={product.imagen_url || "/placeholder.png"}
                alt={`${product.nombre} verificada por KADI TSyD - transmisión manual para ${product.modelo_vehiculo?.join(", ")}`}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Info */}
            <div>
              <h1 className="text-3xl font-light mb-2">{product.nombre}</h1>
              <p className="text-white/40 text-sm mb-4">Código: {product.codigo_caja}</p>

              <div className="flex items-center gap-3 mb-6">
                <span className={`text-xs px-3 py-1 rounded-full ${
                  product.tipo === "Reconstruida" ? "bg-green-500/20 text-green-400" :
                  product.tipo === "Nueva" ? "bg-blue-500/20 text-blue-400" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {product.tipo}
                </span>
                <span className="text-xs text-white/30">
                  Stock: {product.stock} {product.stock === 1 ? "unidad" : "unidades"}
                </span>
              </div>

              <p className="text-white/60 leading-relaxed mb-6">
                {product.descripcion || `Transmisión manual verificada para ${product.modelo_vehiculo?.join(", ")}. Ideal si tu vehículo presenta síntomas como ruido en reversa, dificultad al meter cambios o vibración en carretera.`}
              </p>

              <div className="border-t border-white/10 pt-6 mb-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-white/30 text-sm">Precio</p>
                    <p className="text-4xl font-light">${product.precio.toLocaleString()}</p>
                    <p className="text-white/20 text-xs mt-1">IVA incluido · Envío gratis</p>
                  </div>
                  <AddToCartButton product={product} />
                </div>
              </div>

              {/* Especificaciones técnicas */}
              {product.especificaciones && (
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-sm font-medium text-white/70 mb-3">Especificaciones técnicas</h3>
                  <ul className="space-y-2">
                    {Object.entries(product.especificaciones).map(([key, value]) => (
                      <li key={key} className="text-sm text-white/40">
                        <span className="text-white/60 capitalize">{key.replace(/_/g, " ")}:</span> {String(value)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}