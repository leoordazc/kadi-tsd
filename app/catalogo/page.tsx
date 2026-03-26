"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";

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
            nissan: "🚗", toyota: "🚙", ford: "🛻", chevrolet: "🚛",
            volkswagen: "🚘", renault: "🚙", mitsubishi: "🚗",
            seat: "🚗", honda: "🚗", mazda: "🚗"
        };
        return iconos[marca.toLowerCase()] || "🔧";
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
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/75 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 group">
                            <motion.span className="text-[#ef4444] text-xl group-hover:-translate-x-1 transition-transform">
                                ←
                            </motion.span>
                            <span className="text-white/70 group-hover:text-white">Volver al inicio</span>
                        </Link>
                        <h1 className="text-2xl font-light">Catálogo <span className="text-[#ef4444]">KADI</span></h1>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar..."
                            className="bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-sm text-white/70"
                        />
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {marcas.length > 0 && (
                    <div className="mb-12">
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => {
                                    setSelectedMarca(null);
                                    setSelectedModelo(null);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-full border transition-all ${
                                    !selectedMarca ? 'bg-[#ef4444] border-[#ef4444] text-white' : 'border-white/10 text-white/50'
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
                                    }}
                                    className={`px-4 py-2 rounded-full border transition-all ${
                                        selectedMarca === marca.id ? 'border-[#ef4444] text-white' : 'border-white/10 text-white/50'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span>{marca.icono}</span>
                                        <span>{marca.nombre}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {selectedMarca && modelos.length > 0 && (
                    <div className="mb-12">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedModelo(null)}
                                className={`px-3 py-1 rounded-full text-sm border ${
                                    !selectedModelo ? 'bg-[#ef4444]/20 border-[#ef4444] text-white' : 'border-white/10 text-white/40'
                                }`}
                            >
                                Todos
                            </button>
                            {modelos.map((modelo) => (
                                <button
                                    key={modelo}
                                    onClick={() => setSelectedModelo(modelo)}
                                    className={`px-3 py-1 rounded-full text-sm border ${
                                        selectedModelo === modelo ? 'bg-[#ef4444]/20 border-[#ef4444] text-white' : 'border-white/10 text-white/40'
                                    }`}
                                >
                                    {modelo.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedProductos.map((producto) => (
                        <div
                            key={producto.id}
                            className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-white/5 p-6 hover:border-[#ef4444]/30 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-medium text-white/90 group-hover:text-[#ef4444] transition">
                                        {producto.nombre}
                                    </h3>
                                    <p className="text-xs text-white/30">Código: {producto.codigo_caja}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    producto.tipo === 'Reconstruida' ? 'bg-green-500/20 text-green-400' :
                                    producto.tipo === 'Nueva' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                    {producto.tipo}
                                </span>
                            </div>

                            {producto.descripcion && (
                                <p className="text-white/40 text-sm mb-4 line-clamp-2">
                                    {producto.descripcion}
                                </p>
                            )}

                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs text-white/30">Precio</p>
                                    <p className="text-2xl font-light text-white/90">${producto.precio.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-white/30">Stock</p>
                                    <p className={`text-lg ${producto.stock > 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {producto.stock} uds
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    console.log("🟢 Agregando:", producto.nombre);
                                    addToCart(producto);
                                }}
                                className="w-full bg-[#ef4444] text-white py-2 rounded-lg hover:bg-[#ef4444]/90 transition-colors"
                            >
                                Comprar
                            </button>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-12">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg border border-white/10 disabled:opacity-30"
                        >
                            ←
                        </button>
                        <span className="px-4 py-2 text-white/60">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg border border-white/10 disabled:opacity-30"
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
            </div>
        </main>
    );
}