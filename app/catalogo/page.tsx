"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import Toast from "@/components/Toast";

interface Producto {
    id: string;
    nombre: string;
    codigo_caja: string;
    tipo: 'Reconstruida' | 'Usada' | 'Nueva';
    precio: number;
    stock: number;
    descripcion?: string;
    marca_vehiculo?: string[];
    modelo_vehiculo?: string[];
    imagen_url?: string;
}

export default function CatalogoPage() {
    const { addToCart } = useCart();
    const [selectedMarca, setSelectedMarca] = useState<string | null>(null);
    const [selectedModelo, setSelectedModelo] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null);
    const [showBrands, setShowBrands] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('productos')
                    .select('*')
                    .eq('activo', true)
                    .gt('stock', 0)
                    .order('nombre')
                    .limit(50);

                if (error) throw error;
                setProductos(data || []);
            } catch (err: any) {
                console.error('Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProductos();
    }, []);

    const marcas = useMemo(() => {
        const marcasSet = new Set<string>();
        productos.forEach(p => {
            p.marca_vehiculo?.forEach(m => marcasSet.add(m));
        });
        return Array.from(marcasSet).map(marca => ({
            id: marca,
            nombre: marca.charAt(0).toUpperCase() + marca.slice(1),
            icono: getMarcaIcono(marca)
        }));
    }, [productos]);

    const modelos = useMemo(() => {
        if (!selectedMarca) return [];
        const modelosSet = new Set<string>();
        productos
            .filter(p => p.marca_vehiculo?.includes(selectedMarca))
            .forEach(p => {
                p.modelo_vehiculo?.forEach(m => modelosSet.add(m));
            });
        return Array.from(modelosSet);
    }, [productos, selectedMarca]);

    const filteredProductos = useMemo(() => {
        let result = productos;
        
        if (selectedMarca) {
            result = result.filter(p => p.marca_vehiculo?.includes(selectedMarca));
        }
        if (selectedModelo) {
            result = result.filter(p => p.modelo_vehiculo?.includes(selectedModelo));
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => 
                p.nombre.toLowerCase().includes(query) ||
                p.codigo_caja.toLowerCase().includes(query)
            );
        }
        
        return result;
    }, [productos, selectedMarca, selectedModelo, searchQuery]);

    const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
    const paginatedProductos = filteredProductos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    function getMarcaIcono(marca: string): string {
        const iconos: Record<string, string> = {
            nissan: "", toyota: "", ford: "", chevrolet: "",
            volkswagen: "", renault: "", mitsubishi: "",
            seat: "", honda: "", mazda: "", fiat: "",
            audi: "", mercedes: "", hyundai: "", suzuki: ""
        };
        return iconos[marca.toLowerCase()] || "";
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/40 text-sm">Cargando catálogo...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Error: {error}</p>
                    <Link href="/" className="text-[#ef4444] hover:underline">Volver al inicio</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white">
            {/* ===== HEADER MINIMALISTA ===== */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/75 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-3">
                        {/* Flecha de regreso */}
                        <Link 
                            href="/" 
                            className="text-white/60 hover:text-white transition-colors flex-shrink-0"
                            title="Volver al inicio"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>

                        {/* Título */}
                        <h1 className="text-lg sm:text-xl font-light text-white/90 flex-shrink-0">
                            Catálogo
                        </h1>

                        {/* Buscador */}
                        <div className="relative flex-1 max-w-md ml-auto">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar..."
                                className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 pl-9 text-sm text-white/80 placeholder-white/30 focus:outline-none focus:border-[#ef4444]/50 transition"
                            />
                            <svg 
                                className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
                
                {/* ===== FILTRO DE MARCAS COMPACTO CON BOTÓN ===== */}
                {marcas.length > 0 && (
                    <div className="mb-4 sm:mb-6">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowBrands(!showBrands)}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 transition text-sm"
                            >
                                <span> Filtrar</span>
                                {selectedMarca && (
                                    <span className="bg-[#ef4444] text-white text-[10px] px-1.5 rounded-full">
                                        1
                                    </span>
                                )}
                                <svg className={`w-3 h-3 transition-transform ${showBrands ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Chips de filtros activos */}
                            {selectedMarca && (
                                <button
                                    onClick={() => {
                                        setSelectedMarca(null);
                                        setSelectedModelo(null);
                                        setCurrentPage(1);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg text-[#ef4444] text-xs hover:bg-[#ef4444]/20 transition"
                                >
                                    {selectedMarca}
                                    <span>✕</span>
                                </button>
                            )}
                        </div>

                        {showBrands && (
                            <div className="mt-3 p-3 sm:p-4 bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-white/40 text-xs">Selecciona una marca</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedMarca(null);
                                            setSelectedModelo(null);
                                            setCurrentPage(1);
                                            setShowBrands(false);
                                        }}
                                        className={`px-3 py-2 rounded-lg text-sm transition-all text-left ${
                                            !selectedMarca 
                                                ? 'bg-[#ef4444] text-white' 
                                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                        }`}
                                    >
                                        Todas
                                    </button>
                                    {marcas.map((marca) => (
                                        <button
                                            key={marca.id}
                                            onClick={() => {
                                                setSelectedMarca(marca.id);
                                                setSelectedModelo(null);
                                                setCurrentPage(1);
                                                setShowBrands(false);
                                            }}
                                            className={`px-3 py-2 rounded-lg text-sm transition-all text-left ${
                                                selectedMarca === marca.id 
                                                    ? 'bg-[#ef4444] text-white' 
                                                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                                            }`}
                                        >
                                            <span className="mr-2">{marca.icono}</span>
                                            {marca.nombre}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Filtro de modelos (solo si hay marca seleccionada) */}
                {selectedMarca && modelos.length > 0 && (
                    <div className="mb-4 sm:mb-6">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedModelo(null)}
                                className={`px-3 py-1 rounded-full text-xs border ${
                                    !selectedModelo ? 'bg-[#ef4444]/20 border-[#ef4444] text-white' : 'border-white/10 text-white/40'
                                }`}
                            >
                                Todos
                            </button>
                            {modelos.map((modelo) => (
                                <button
                                    key={modelo}
                                    onClick={() => setSelectedModelo(modelo)}
                                    className={`px-3 py-1 rounded-full text-xs border ${
                                        selectedModelo === modelo ? 'bg-[#ef4444]/20 border-[#ef4444] text-white' : 'border-white/10 text-white/40'
                                    }`}
                                >
                                    {modelo.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== GRID DE PRODUCTOS ESTILO MERCADO LIBRE ===== */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {paginatedProductos.map((producto) => (
                        <Link
                            key={producto.id}
                            href={`/catalogo/${producto.codigo_caja}`}
                            className="group bg-[#1a1a1a] rounded-lg border border-white/5 overflow-hidden hover:border-[#ef4444]/30 hover:shadow-lg hover:shadow-[#ef4444]/5 transition-all flex flex-col"
                        >
                            {/* Imagen - Cuadrada como en ML */}
                            <div className="relative w-full aspect-square overflow-hidden bg-white">
                                {producto.imagen_url ? (
                                    <Image
                                        src={producto.imagen_url}
                                        alt={producto.nombre}
                                        fill
                                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-black/20">
                                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}

                                {/* Etiqueta de tipo */}
                                <span className={`absolute top-2 left-2 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                    producto.tipo === 'Reconstruida' ? 'bg-green-500 text-white' :
                                    producto.tipo === 'Nueva' ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-black'
                                }`}>
                                    {producto.tipo}
                                </span>
                            </div>

                            {/* Info del producto */}
                            <div className="p-2.5 sm:p-3 flex flex-col flex-1">
                                {/* Precio (destacado como en ML) */}
                                <div className="mb-1">
                                    <span className="text-white font-bold text-lg sm:text-xl">
                                        ${producto.precio.toLocaleString()}
                                    </span>
                                </div>

                                {/* Envío gratis (badge como ML) */}
                                <div className="mb-1.5">
                                    <span className="text-green-400 text-[10px] sm:text-xs font-medium">
                                        Envío gratis
                                    </span>
                                </div>

                                {/* Nombre */}
                                <h3 className="text-white/80 text-xs sm:text-sm leading-tight line-clamp-2 mb-1 group-hover:text-[#ef4444] transition">
                                    {producto.nombre}
                                </h3>

                                {/* Código */}
                                <p className="text-white/30 text-[10px] mt-auto">
                                    Código: {producto.codigo_caja}
                                </p>

                                {/* Stock */}
                                <p className={`text-[10px] mt-0.5 ${
                                    producto.stock > 2 ? 'text-green-400' : 'text-yellow-400'
                                }`}>
                                    {producto.stock > 2 ? '✓ Stock disponible' : `⚠️ Quedan ${producto.stock}`}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8 sm:mt-12">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 rounded-lg border border-white/10 disabled:opacity-30 text-sm hover:bg-white/5 transition"
                        >
                            ←
                        </button>
                        <span className="px-4 py-2 text-white/60 text-sm">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 rounded-lg border border-white/10 disabled:opacity-30 text-sm hover:bg-white/5 transition"
                        >
                            →
                        </button>
                    </div>
                )}

                {filteredProductos.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-white/40">No hay productos con estos filtros</p>
                    </div>
                )}

                {/* Toast de notificación */}
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