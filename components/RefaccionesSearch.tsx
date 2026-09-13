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
            className="relative z-10 py-24 bg-white"
        >
            <div className="max-w-4xl mx-auto px-6 relative z-10">
                
                {/* Título estilo Apple */}
<div className="text-center mb-10">
    <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl md:text-6xl font-semibold text-[#1d1d1f] tracking-tight mb-6"
    >
        ¿Solo necesitas el <span className="text-[#ef4444]">engranaje</span>?
    </motion.h3>
    
    <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-xl md:text-2xl text-[#86868b] max-w-2xl mx-auto leading-relaxed"
    >
        ¿Ya tienes el housing y requieres bronces, baleros, sincronizadores o satélites? Busca la pieza exacta por nombre o síntoma.
    </motion.p>
</div>

{/* ===== IMAGEN DEL COMPONENTE (estilo iPhone) ===== */}
<motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.2 }}
    className="relative flex justify-center items-center mb-12"
>
    <motion.img
        src="/images/engrane-hero.jpg"
        alt="Engrane de transmisión"
        className="w-full max-w-2xl h-auto object-contain drop-shadow-2xl"
        animate={{ 
            y: [0, -10, 0],
            rotate: [0, 2, 0, -2, 0]
        }}
        transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
        }}
    />
    
    {/* Sombra debajo de la imagen */}
    <motion.div
        animate={{ 
            scaleX: [1, 0.95, 1],
            opacity: [0.3, 0.2, 0.3]
        }}
        transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
        }}
        className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 h-4 bg-black/20 blur-2xl rounded-full"
    />
</motion.div>

                {/* Sugerencias estilo Apple */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-wrap gap-3 justify-center"
                >
                    {suggestions.map((suggestion, i) => (
                        <button
                            key={i}
                            onClick={() => setQuery(suggestion)}
                            className="px-5 py-2.5 bg-[#f5f5f7] text-[#1d1d1f] text-sm font-medium rounded-full hover:bg-[#e8e8ed] transition-colors"
                        >
                            {suggestion}
                        </button>
                    ))}
                </motion.div>

                {/* Estado de búsqueda */}
                {buscando && (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
                        <p className="text-[#86868b] text-sm mt-3">Buscando refacciones...</p>
                    </div>
                )}

                {/* Resultados estilo Apple */}
                {resultados.length > 0 && (
                    <div className="mt-12">
                        <h4 className="text-[#1d1d1f] text-2xl font-semibold mb-6 text-center">
                            Resultados encontrados ({resultados.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {resultados.map((producto) => (
                                <motion.div
                                    key={producto.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    className="bg-[#f5f5f7] rounded-2xl p-5 hover:shadow-xl transition-all"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-[#1d1d1f] font-semibold text-base leading-tight">
                                            {producto.nombre}
                                        </h4>
                                        <span className="text-[10px] px-2 py-0.5 bg-white rounded-full text-[#86868b]">
                                            {producto.tipo}
                                        </span>
                                    </div>
                                    <p className="text-[#86868b] text-xs mb-4">
                                        Código: {producto.codigo_caja}
                                    </p>
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-[#86868b] text-[10px] uppercase tracking-wide">Precio</p>
                                            <p className="text-[#1d1d1f] text-xl font-semibold">
                                                ${producto.precio.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[#86868b] text-[10px] uppercase tracking-wide">Stock</p>
                                            <p className="text-[#1d1d1f] text-sm font-medium">{producto.stock} uds</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            onAddToCart?.(producto);
                                        }}
                                        className="w-full bg-[#0071e3] text-white py-2.5 rounded-full text-sm font-medium hover:bg-[#0077ed] transition-colors"
                                    >
                                        Comprar
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sin resultados */}
                {!buscando && resultados.length === 0 && query && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <p className="text-[#86868b] text-lg">
                            No encontramos refacciones para "{query}".
                        </p>
                        <p className="text-[#86868b] text-sm mt-2">
                            Prueba con otro nombre o código.
                        </p>
                    </motion.div>
                )}

                {/* Badge inferior estilo Apple */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-12 text-center"
                >
                    <div className="inline-flex items-center gap-2 text-sm text-[#86868b] border border-[#d2d2d7] rounded-full px-5 py-2.5">
                        <span className="w-2 h-2 bg-[#ef4444] rounded-full animate-pulse" />
                        <span>Más de 500 refacciones disponibles · Envío a todo México</span>
                    </div>
                </motion.div>
            </div>
        </motion.section>
    );
}