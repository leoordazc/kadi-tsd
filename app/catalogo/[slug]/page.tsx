"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";

import Toast from "@/components/Toast"; // 👈 Importar

interface Producto {
    id: string;
    nombre: string;
    codigo_caja: string;
    tipo: 'Reconstruida' | 'Usada' | 'Nueva';
    precio: number;
    stock: number;
    descripcion?: string;
    imagen_url?: string;
    imagenes_extra?: string[];
    marca_vehiculo?: string[];
    modelo_vehiculo?: string[];
    año_inicio?: number;
    año_fin?: number;
    especificaciones?: any;
    notas_instalacion?: string;
}

export default function ProductoDetallePage() {
    const params = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const [producto, setProducto] = useState<Producto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null);

    const allImages = producto ? [
        producto.imagen_url,
        ...(producto.imagenes_extra || [])
    ].filter((img): img is string => Boolean(img) && typeof img === 'string') : [];

    useEffect(() => {
        const fetchProducto = async () => {
            try {
                console.log("🔍 Buscando producto con código:", params.slug);
                
                const { data, error } = await supabase
                    .from('productos')
                    .select('*')
                    .eq('codigo_caja', params.slug)
                    .single();

                if (error) throw error;
                if (!data) {
                    setError("Producto no encontrado");
                    return;
                }
                setProducto(data);
                if (data?.imagen_url) {
                    setSelectedImage(data.imagen_url);
                }
            } catch (err: any) {
                console.error("❌ Error:", err);
                setError(`Error: ${err.message || "Producto no encontrado"}`);
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) {
            fetchProducto();
        }
    }, [params.slug]);

    const nextImage = () => {
        if (allImages.length === 0) return;
        const nextIndex = (currentImageIndex + 1) % allImages.length;
        setCurrentImageIndex(nextIndex);
        setSelectedImage(allImages[nextIndex] || "");
    };

    const prevImage = () => {
        if (allImages.length === 0) return;
        const prevIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
        setCurrentImageIndex(prevIndex);
        setSelectedImage(allImages[prevIndex] || "");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/40 text-sm">Cargando producto...</p>
                </div>
            </div>
        );
    }

    if (error || !producto) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || "Producto no encontrado"}</p>
                    <p className="text-white/30 text-xs mb-4">Código buscado: {params.slug}</p>
                    <Link href="/catalogo" className="text-[#ef4444] hover:underline">
                        Volver al catálogo
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/75 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/catalogo" className="flex items-center gap-2 group">
                            <motion.span className="text-[#ef4444] text-xl group-hover:-translate-x-1 transition-transform">
                                ←
                            </motion.span>
                            <span className="text-white/70 group-hover:text-white">Volver al catálogo</span>
                        </Link>
                        <h1 className="text-2xl font-light">Detalle del <span className="text-[#ef4444]">producto</span></h1>
                    </div>
                </div>
            </header>

            {/* Contenido */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-2 gap-12">
                    
                    {/* COLUMNA IZQUIERDA: IMAGEN CON CARRUSEL */}
                    <div className="space-y-4">
                        {/* Imagen principal */}
                        <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
                            {selectedImage ? (
                                <>
                                    <Image
                                        src={selectedImage}
                                        alt={producto.nombre}
                                        fill
                                        className="object-contain p-4"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        priority
                                    />
                                    
                                    {allImages.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white/80 hover:text-white rounded-full w-8 h-8 flex items-center justify-center transition-all backdrop-blur-sm"
                                            >
                                                ◀
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white/80 hover:text-white rounded-full w-8 h-8 flex items-center justify-center transition-all backdrop-blur-sm"
                                            >
                                                ▶
                                            </button>
                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white/80 text-xs px-2 py-1 rounded-full">
                                                {currentImageIndex + 1} / {allImages.length}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-6xl">🔧</span>
                                </div>
                            )}
                        </div>

                        {/* Miniaturas */}
                        {allImages.length > 1 && (
                            <div className="flex gap-3 justify-center overflow-x-auto pb-2">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedImage(img);
                                            setCurrentImageIndex(idx);
                                        }}
                                        className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                                            selectedImage === img 
                                                ? 'border-[#ef4444] shadow-lg shadow-[#ef4444]/20' 
                                                : 'border-white/20 hover:border-white/50'
                                        }`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`Vista ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: INFORMACIÓN */}
                    <div>
                        <h1 className="text-3xl font-light mb-2">{producto.nombre}</h1>
                        <p className="text-white/40 text-sm mb-4">Código: {producto.codigo_caja}</p>

                        <div className="flex items-center gap-3 mb-6">
                            <span className={`text-xs px-3 py-1 rounded-full ${
                                producto.tipo === "Reconstruida" ? "bg-green-500/20 text-green-400" :
                                producto.tipo === "Nueva" ? "bg-blue-500/20 text-blue-400" :
                                "bg-yellow-500/20 text-yellow-400"
                            }`}>
                                {producto.tipo}
                            </span>
                            <span className="text-xs text-white/30">
                                Stock: {producto.stock} {producto.stock === 1 ? "unidad" : "unidades"}
                            </span>
                        </div>

                        {producto.descripcion && (
                            <p className="text-white/60 leading-relaxed mb-6">
                                {producto.descripcion}
                            </p>
                        )}

                        {(producto.marca_vehiculo && producto.marca_vehiculo.length > 0) || 
                         (producto.modelo_vehiculo && producto.modelo_vehiculo.length > 0) ? (
                            <div className="border-t border-white/10 pt-4 mb-4">
                                <h3 className="text-sm font-medium text-white/70 mb-2">📌 Compatibilidad</h3>
                                {producto.marca_vehiculo && producto.marca_vehiculo.length > 0 && (
                                    <p className="text-sm text-white/40">Marcas: {producto.marca_vehiculo.join(", ")}</p>
                                )}
                                {producto.modelo_vehiculo && producto.modelo_vehiculo.length > 0 && (
                                    <p className="text-sm text-white/40">Modelos: {producto.modelo_vehiculo.join(", ")}</p>
                                )}
                                {(producto.año_inicio || producto.año_fin) && (
                                    <p className="text-sm text-white/40">Años: {producto.año_inicio} - {producto.año_fin}</p>
                                )}
                            </div>
                        ) : null}

                        {producto.especificaciones && Object.keys(producto.especificaciones).length > 0 && (
                            <div className="border-t border-white/10 pt-4 mb-4">
                                <h3 className="text-sm font-medium text-white/70 mb-2">⚙️ Especificaciones técnicas</h3>
                                <ul className="space-y-1">
                                    {Object.entries(producto.especificaciones).map(([key, value]) => (
                                        <li key={key} className="text-sm text-white/40">
                                            <span className="text-white/60 capitalize">{key.replace(/_/g, " ")}:</span> {String(value)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {producto.notas_instalacion && (
                            <div className="border-t border-white/10 pt-4 mb-6">
                                <h3 className="text-sm font-medium text-white/70 mb-2">🔧 Notas de instalación</h3>
                                <p className="text-sm text-white/40">{producto.notas_instalacion}</p>
                            </div>
                        )}

                        <div className="border-t border-white/10 pt-6">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <p className="text-white/30 text-sm">Precio</p>
                                    <p className="text-4xl font-light">${producto.precio.toLocaleString()}</p>
                                    <p className="text-white/20 text-xs mt-1">IVA incluido · Envío gratis</p>
                                </div>
                                <button
    onClick={() => {
        addToCart(producto);
        setToast({ message: `${producto.nombre} agregado al carrito`, type: "success" });
        setTimeout(() => setToast(null), 2500);
    }}
    className="flex-1 bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white py-2.5 rounded-lg font-medium hover:from-[#ef4444]/90 hover:to-[#f97316]/90 transition-all active:scale-95 shadow-lg shadow-[#ef4444]/20 relative overflow-hidden group"
>
    <span className="relative z-10 flex items-center justify-center gap-2">
        🛒 Agregar
    </span>
    <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-active:translate-x-0 transition-transform duration-300 ease-out" />
</button>
                            </div>
                        </div>

                        <div className="mt-4">
                            <button
                                onClick={() => {
                                    const message = encodeURIComponent(
                                        `Hola, tengo una consulta sobre ${producto.nombre} (Código: ${producto.codigo_caja})`
                                    );
                                    window.open(`https://wa.me/5573382923?text=${message}`, "_blank");
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 text-white/70 hover:bg-white/10 transition text-sm"
                            >
                                📱 Consultar con un experto
                            </button>
                        </div>
                    </div>
                </div>
                {toast && (
    <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
    />
)}
            </div>
        </main>
    );
}