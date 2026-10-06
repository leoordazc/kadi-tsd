"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface RefaccionesSearchProps {
  onSearch?: (query: string) => void;
  onAddToCart?: (product: any) => void;
}

export default function RefaccionesSearch({ onSearch, onAddToCart }: RefaccionesSearchProps) {
    const [query, setQuery] = useState("");
    const [resultados, setResultados] = useState<any[]>([]);
    const [buscando, setBuscando] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const suggestions = [
        "bronces para NP300",
        "baleros para D21",
        "satélites para Hilux",
        "planetarios para Ranger",
        "retenes para diferencial"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setBuscando(true);
        setResultados([]);

        const { data, error } = await supabase
            .from("productos")
            .select("*")
            .eq("activo", true)
            .gt("stock", 0)
            .or(
                `nombre.ilike.%${query}%,` +
                `descripcion.ilike.%${query}%,` +
                `categoria.ilike.%${query}%,` +
                `codigo_caja.ilike.%${query}%`
            )
            .limit(6);

        setBuscando(false);
        if (error) {
            console.error("Error buscando refacciones:", error);
            return;
        }

        const unicos = data?.filter(
            (item, index, self) => self.findIndex((p) => p.id === item.id) === index
        );

        setResultados(unicos || []);
        if (onSearch) onSearch(query);
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 py-20 border-t border-white/5 overflow-hidden"
            style={{ backgroundColor: "var(--bg-secondary)" }}  // ← gris metalizado ligeramente distinto
        >
            {/* ===== FONDO CON GRADIENTE KADI (sutil) ===== */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(circle at 20% 50%, rgba(30, 74, 140, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(212, 175, 55, 0.05) 0%, transparent 50%)",
                }}
            />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* ===== IMAGEN IZQUIERDA CON EFECTO ===== */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative flex justify-center items-center order-2 lg:order-1"
                    >
                        {/* Glow dorado + azul metálico detrás del engrane */}
                        <div
                            className="absolute w-[420px] h-[420px] rounded-full blur-[100px] opacity-60 pointer-events-none"
                            style={{
                                background: "radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, rgba(30, 74, 140, 0.15) 50%, transparent 70%)",
                            }}
                        />

                        {/* Anillos orbitales animados (dorado + azul) */}
                        <motion.div
                            className="absolute rounded-full border pointer-events-none"
                            style={{
                                width: "380px",
                                height: "380px",
                                borderColor: "rgba(212, 175, 55, 0.2)",
                            }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        >
                            <div
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                                style={{ backgroundColor: "var(--kadi-gold)" }}
                            />
                        </motion.div>

                        <motion.div
                            className="absolute rounded-full border pointer-events-none"
                            style={{
                                width: "300px",
                                height: "300px",
                                borderColor: "rgba(30, 74, 140, 0.3)",
                            }}
                            animate={{ rotate: -360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <div
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: "var(--kadi-blue-bright)" }}
                            />
                        </motion.div>

                        {/* Engrane con flotación */}
                        <motion.img
                            src="/images/sincro.png"
                            alt="Engrane de transmisión"
                            className="relative w-full max-w-md h-auto object-contain z-10"
                            style={{
                                filter: "contrast(1.1) brightness(1.1) drop-shadow(0 0 40px rgba(212, 175, 55, 0.25))",
                                mixBlendMode: "screen",
                            }}
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </motion.div>

                    {/* ===== CONTENIDO DERECHA ===== */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="order-1 lg:order-2"
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--kadi-gold)" }} />
                            <span className="text-xs font-medium text-white/70 tracking-wider uppercase">
                                Refacciones sueltas
                            </span>
                        </div>

                        {/* Título con gradiente KADI */}
                        <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-5 leading-tight">
                            ¿Solo necesitas el{" "}
                            <span
                                className="text-transparent bg-clip-text"
                                style={{
                                    backgroundImage: "linear-gradient(90deg, #1e4a8c, #2a5ca8, #D4AF37)",
                                }}
                            >
                                engranaje?
                            </span>
                        </h3>

                        {/* Subtítulo */}
                        <p className="text-lg text-white/60 leading-relaxed mb-8 max-w-lg">
                            ¿Ya tienes el housing y requieres bronces, baleros, sincronizadores o satélites? Busca la pieza exacta por nombre o síntoma.
                        </p>

                        {/* Buscador */}
                        <form onSubmit={handleSubmit} className="relative mb-5">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="Ej: bronces para NP300, baleros, satélites..."
                                className="w-full bg-white/5 border-2 rounded-2xl py-4 px-5 pr-16 text-white placeholder-white/40 text-base focus:outline-none transition-all backdrop-blur-md"
                                style={{
                                    borderColor: isFocused ? "var(--kadi-gold)" : "rgba(255,255,255,0.1)",
                                    boxShadow: isFocused ? "0 0 0 4px rgba(212, 175, 55, 0.1)" : "none",
                                }}
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                                style={{
                                    background: "linear-gradient(135deg, var(--kadi-blue), var(--kadi-blue-bright))",
                                    boxShadow: "0 4px 12px rgba(30, 74, 140, 0.4)",
                                }}
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </form>

                        {/* Sugerencias */}
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => setQuery(suggestion)}
                                    className="px-4 py-2 text-xs font-medium rounded-full transition-all"
                                    style={{
                                        backgroundColor: "rgba(255,255,255,0.05)",
                                        color: "rgba(255,255,255,0.6)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "rgba(212, 175, 55, 0.15)";
                                        e.currentTarget.style.color = "var(--kadi-gold)";
                                        e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                                        e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                                    }}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* ===== ESTADO DE BÚSQUEDA ===== */}
                {buscando && (
                    <div className="text-center py-12">
                        <div
                            className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                            style={{ borderColor: "var(--kadi-gold)", borderTopColor: "transparent" }}
                        />
                        <p className="text-white/40 text-sm mt-3">Buscando refacciones...</p>
                    </div>
                )}

                {/* ===== RESULTADOS ===== */}
                {resultados.length > 0 && (
                    <div className="mt-16">
                        <h4 className="text-white text-2xl font-semibold mb-6 text-center">
                            Resultados encontrados ({resultados.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {resultados.map((producto) => (
                                <motion.div
                                    key={producto.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    className="rounded-2xl p-5 hover:shadow-xl transition-all border border-white/5"
                                    style={{ backgroundColor: "var(--bg-card)" }}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-white font-semibold text-base leading-tight">
                                            {producto.nombre}
                                        </h4>
                                        <span
                                            className="text-[10px] px-2 py-0.5 rounded-full"
                                            style={{
                                                backgroundColor: "rgba(212, 175, 55, 0.15)",
                                                color: "var(--kadi-gold)",
                                            }}
                                        >
                                            {producto.tipo}
                                        </span>
                                    </div>
                                    <p className="text-white/40 text-xs mb-4">
                                        Código: {producto.codigo_caja}
                                    </p>
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-white/30 text-[10px] uppercase tracking-wide">Precio</p>
                                            <p className="text-white text-xl font-semibold">
                                                ${producto.precio.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white/30 text-[10px] uppercase tracking-wide">Stock</p>
                                            <p className="text-white text-sm font-medium">{producto.stock} uds</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onAddToCart?.(producto)}
                                        className="w-full py-2.5 rounded-full text-sm font-medium text-white transition-all hover:scale-[1.02]"
                                        style={{
                                            background: "linear-gradient(135deg, var(--kadi-blue), var(--kadi-blue-bright))",
                                        }}
                                    >
                                        Comprar
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== SIN RESULTADOS ===== */}
                {!buscando && resultados.length === 0 && query && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <p className="text-white/60 text-lg">
                            No encontramos refacciones para "{query}".
                        </p>
                        <p className="text-white/30 text-sm mt-2">
                            Prueba con otro nombre o código.
                        </p>
                    </motion.div>
                )}

                {/* ===== BADGE INFERIOR ===== */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 text-sm text-white/50 border border-white/10 rounded-full px-5 py-2.5 bg-white/5 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--kadi-gold)" }} />
                        <span>Más de 500 refacciones disponibles · Envío a todo México</span>
                    </div>
                </motion.div>
            </div>
        </motion.section>
    );
}