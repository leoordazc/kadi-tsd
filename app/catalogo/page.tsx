"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
    // 👇 AGREGAMOS ESTAS PROPIEDADES PARA QUE TYPESCRIPT NO MARQUE ERROR
    año_inicio?: number;
    año_fin?: number;
}

const PRIORIDAD_BUSQUEDA: string[] = [
    "spark classic",
    "chevrolet beat",
    "grand i10",
    "tsuru",
    "nissan 2.4",
    "aveo ng",
];

export default function CatalogoPage() {
    const { addToCart } = useCart();
    const [selectedMarca, setSelectedMarca] = useState<string | null>(null);
    const [selectedModelo, setSelectedModelo] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    
    // Estados de los nuevos filtros
    const [selectedAnio, setSelectedAnio] = useState<string | null>(null);
    const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
    const [selectedEstado, setSelectedEstado] = useState<string | null>(null);
    const [precioMax, setPrecioMax] = useState<number | null>(null);

    const gridRef = useRef<HTMLDivElement>(null);

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
                    .limit(150);

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

    const productosOrdenados = useMemo(() => {
        if (productos.length === 0) return [];

        const prioritarios: Producto[] = [];
        const resto: Producto[] = [];

        productos.forEach((producto) => {
            const nombreLower = producto.nombre.toLowerCase();
            const modeloStr = (producto.modelo_vehiculo || []).join(" ").toLowerCase();
            const marcaStr = (producto.marca_vehiculo || []).join(" ").toLowerCase();

            const esPrioritario = PRIORIDAD_BUSQUEDA.some((termino) =>
                nombreLower.includes(termino) ||
                modeloStr.includes(termino) ||
                marcaStr.includes(termino)
            );

            if (esPrioritario) {
                prioritarios.push(producto);
            } else {
                resto.push(producto);
            }
        });

        prioritarios.sort((a, b) => {
            const nombreA = `${a.nombre} ${(a.modelo_vehiculo || []).join(" ")} ${(a.marca_vehiculo || []).join(" ")}`.toLowerCase();
            const nombreB = `${b.nombre} ${(b.modelo_vehiculo || []).join(" ")} ${(b.marca_vehiculo || []).join(" ")}`.toLowerCase();

            const indexA = PRIORIDAD_BUSQUEDA.findIndex((t) => nombreA.includes(t));
            const indexB = PRIORIDAD_BUSQUEDA.findIndex((t) => nombreB.includes(t));

            return indexA - indexB;
        });

        return [...prioritarios, ...resto];
    }, [productos]);

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

    // Lista de años disponibles extraída de los productos
    const aniosDisponibles = useMemo(() => {
        const aniosSet = new Set<number>();
        productos.forEach(p => {
            if (p.año_inicio && p.año_fin) {
                for (let i = p.año_inicio; i <= p.año_fin; i++) {
                    aniosSet.add(i);
                }
            }
        });
        return Array.from(aniosSet).sort((a, b) => b - a);
    }, [productos]);

    const filteredProductos = useMemo(() => {
        let result = productosOrdenados;

        if (selectedMarca) {
            result = result.filter(p => p.marca_vehiculo?.includes(selectedMarca));
        }
        if (selectedModelo) {
            result = result.filter(p => p.modelo_vehiculo?.includes(selectedModelo));
        }
        if (selectedAnio) {
            const anioNum = parseInt(selectedAnio);
            result = result.filter(p => {
                if (!p.año_inicio || !p.año_fin) return true; 
                return anioNum >= p.año_inicio && anioNum <= p.año_fin;
            });
        }

        if (selectedEstado) {
            result = result.filter(p => p.tipo.toLowerCase() === selectedEstado.toLowerCase());
        }
        if (precioMax) {
            result = result.filter(p => p.precio <= precioMax);
        }
        if (selectedCategoria) {
             result = result.filter(p => p.nombre.toLowerCase().includes(selectedCategoria.toLowerCase()));
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => 
                p.nombre.toLowerCase().includes(query) ||
                p.codigo_caja.toLowerCase().includes(query)
            );
        }
        
        return result;
    }, [productosOrdenados, selectedMarca, selectedModelo, selectedAnio, selectedCategoria, selectedEstado, precioMax, searchQuery]);

    const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
    const paginatedProductos = filteredProductos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        if (gridRef.current && !loading) {
            const yOffset = -80;
            const y = gridRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    }, [currentPage]);

    function getMarcaIcono(marca: string): string {
        const iconos: Record<string, string> = {
            nissan: "🇯🇵", toyota: "🇯🇵", ford: "🇺🇸", chevrolet: "🇺🇸",
            volkswagen: "🇩🇪", renault: "🇫🇷", mitsubishi: "🇯🇵",
            seat: "🇪🇸", honda: "🇯🇵", mazda: "🇯🇵", fiat: "🇮🇹",
            audi: "🇩🇪", mercedes: "🇩🇪", hyundai: "🇰🇷", suzuki: "🇯🇵"
        };
        return iconos[marca.toLowerCase()] || "🚗";
    }

    if (loading) {
        return (
            <main
                className="min-h-screen text-white flex items-center justify-center"
                style={{ backgroundColor: "var(--bg-primary)" }}
            >
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: "var(--kadi-gold)", borderTopColor: "transparent" }}
                    />
                    <p className="text-white/40 text-sm">Cargando catálogo...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main
                className="min-h-screen text-white flex items-center justify-center"
                style={{ backgroundColor: "var(--bg-primary)" }}
            >
                <div className="text-center">
                    <p className="text-red-400 mb-4">Error: {error}</p>
                    <Link
                        href="/"
                        className="hover:underline transition-colors"
                        style={{ color: "var(--kadi-gold)" }}
                    >
                        Volver al inicio
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main
            className="min-h-screen text-white"
            style={{ backgroundColor: "var(--bg-primary)" }}
        >
            <header
                className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5"
                style={{ backgroundColor: "rgba(15, 18, 21, 0.75)" }}
            >
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="text-white/60 hover:text-white transition-colors flex-shrink-0"
                            title="Volver al inicio"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>

                        <h1 className="text-lg sm:text-xl font-light text-white/90 flex-shrink-0">
                            Catálogo
                        </h1>

                        <div className="relative flex-1 max-w-md ml-auto">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Buscar por nombre o código..."
                                className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 pl-9 text-sm text-white/80 placeholder-white/30 focus:outline-none transition"
                                style={{
                                    borderColor: searchQuery ? "rgba(212, 175, 55, 0.5)" : "rgba(255,255,255,0.1)",
                                }}
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

                {/* ===== SELECTOR DE VEHÍCULO Y FILTROS ===== */}
                <div className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <select
                        value={selectedMarca || ""}
                        onChange={(e) => { setSelectedMarca(e.target.value || null); setSelectedModelo(null); setSelectedAnio(null); setCurrentPage(1); }}
                        className="bg-[#1a1d22] border border-white/10 rounded-lg p-2.5 text-sm text-white/80 focus:outline-none focus:border-[var(--kadi-gold)]"
                      >
                        <option value="">Marca (Todas)</option>
                        {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                      </select>

                      <select
                        value={selectedModelo || ""}
                        onChange={(e) => { setSelectedModelo(e.target.value || null); setCurrentPage(1); }}
                        disabled={!selectedMarca}
                        className="bg-[#1a1d22] border border-white/10 rounded-lg p-2.5 text-sm text-white/80 focus:outline-none focus:border-[var(--kadi-gold)] disabled:opacity-50"
                      >
                        <option value="">Modelo (Todos)</option>
                        {modelos.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>

                      <select
                        value={selectedAnio || ""}
                        onChange={(e) => { setSelectedAnio(e.target.value || null); setCurrentPage(1); }}
                        className="bg-[#1a1d22] border border-white/10 rounded-lg p-2.5 text-sm text-white/80 focus:outline-none focus:border-[var(--kadi-gold)]"
                      >
                        <option value="">Año (Todos)</option>
                        {aniosDisponibles.map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <select
                        value={selectedEstado || ""}
                        onChange={(e) => { setSelectedEstado(e.target.value || null); setCurrentPage(1); }}
                        className="bg-[#1a1d22] border border-white/10 rounded-lg p-2.5 text-sm text-white/80 focus:outline-none focus:border-[var(--kadi-gold)]"
                      >
                        <option value="">Estado (Todos)</option>
                        <option value="nueva">Nueva</option>
                        <option value="reconstruida">Reconstruida</option>
                        <option value="usada">Usada</option>
                      </select>

                      <select
                        value={precioMax || ""}
                        onChange={(e) => { setPrecioMax(Number(e.target.value) || null); setCurrentPage(1); }}
                        className="bg-[#1a1d22] border border-white/10 rounded-lg p-2.5 text-sm text-white/80 focus:outline-none focus:border-[var(--kadi-gold)]"
                      >
                        <option value="">Precio (Cualquiera)</option>
                        <option value="5000">Hasta $5,000</option>
                        <option value="10000">Hasta $10,000</option>
                        <option value="20000">Hasta $20,000</option>
                        <option value="50000">Hasta $50,000</option>
                      </select>

                      <button
                        onClick={() => {
                            setSelectedMarca(null);
                            setSelectedModelo(null);
                            setSelectedAnio(null);
                            setSelectedEstado(null);
                            setPrecioMax(null);
                            setSelectedCategoria(null);
                            setSearchQuery("");
                            setCurrentPage(1);
                        }}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-2.5 text-sm text-white/60 transition-colors"
                      >
                        Limpiar Filtros
                      </button>
                    </div>

                  </div>
                </div>

                {/* ===== GRID DE PRODUCTOS ===== */}
                <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {paginatedProductos.map((producto) => (
                        <Link
                            key={producto.id}
                            href={`/catalogo/${producto.codigo_caja}`}
                            className="group rounded-lg border border-white/5 overflow-hidden transition-all flex flex-col"
                            style={{ backgroundColor: "var(--bg-card)" }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.3)";
                                e.currentTarget.style.boxShadow = "0 8px 25px rgba(212, 175, 55, 0.08)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
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

                                <span
                                    className="absolute top-2 left-2 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-medium"
                                    style={{
                                        backgroundColor:
                                            producto.tipo === 'Reconstruida' ? 'var(--kadi-gold)' :
                                            producto.tipo === 'Nueva' ? 'var(--kadi-blue)' :
                                            'var(--text-secondary)',
                                        color:
                                            producto.tipo === 'Usada' ? '#0f1215' :
                                            producto.tipo === 'Reconstruida' ? '#0f1215' :
                                            'white',
                                    }}
                                >
                                    {producto.tipo}
                                </span>
                            </div>

                            <div className="p-2.5 sm:p-3 flex flex-col flex-1">
                                <div className="mb-1">
                                    <span className="text-white font-bold text-lg sm:text-xl">
                                        ${producto.precio.toLocaleString()}
                                    </span>
                                </div>

                                <div className="mb-1.5">
                                    <span
                                        className="text-[10px] sm:text-xs font-medium"
                                        style={{ color: "var(--kadi-gold)" }}
                                    >
                                        Envío gratis
                                    </span>
                                </div>

                                <h3 className="text-white/80 text-xs sm:text-sm leading-tight line-clamp-2 mb-1 transition-colors">
                                    {producto.nombre}
                                </h3>

                                <p className="text-white/30 text-[10px] mt-auto">
                                    Código: {producto.codigo_caja}
                                </p>

                                <p
                                    className={`text-[10px] mt-0.5`}
                                    style={{
                                        color: producto.stock > 2 ? "var(--kadi-blue-bright)" : "var(--kadi-gold)"
                                    }}
                                >
                                    {producto.stock > 2 ? '✓ Stock disponible' : `⚠️ Quedan ${producto.stock}`}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

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