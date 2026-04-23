"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Toast from "@/components/Toast"; // 👈 Importar

interface RefaccionesSearchProps {
  onSearch?: (query: string) => void;
  onAddToCart?: (product: any) => void;
}

export default function RefaccionesSearch({ onSearch, onAddToCart }: RefaccionesSearchProps) {
    const [query, setQuery] = useState("");
    const [resultados, setResultados] = useState<any[]>([]);
    const [buscando, setBuscando] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [showTips, setShowTips] = useState(false);
    const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null);


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
            .limit(6); // 👈 Límite claro para no saturar

        setBuscando(false);
        if (error) {
            console.error("Error buscando refacciones:", error);
            return;
        }

        // 👇 Filtro para evitar duplicados por ID
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
            className="relative z-10 py-16 border-t border-white/5 overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-[#ef4444]/5 to-transparent" />
            
            <div className="max-w-4xl mx-auto px-4 relative z-10">
                
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="w-16 h-16 bg-[#ef4444]/10 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                        <span className="text-3xl">🔍</span>
                    </motion.div>
                    
                    <h3 className="text-3xl font-light text-white/90 mb-2">
                        ¿Solo necesitas el <span className="text-[#ef4444]">"engranaje"</span>?
                    </h3>
                    
                    <p className="text-white/40 text-sm max-w-xl mx-auto">
                        ¿Ya tienes el housing y requieres bronces, baleros, sincronizadores o satélites?
                        Busca la pieza exacta por nombre o síntoma.
                    </p>
                </div>

                <motion.div
                    className="relative"
                    animate={{ scale: isFocused ? 1.02 : 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <form onSubmit={handleSubmit} className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Ej: bronces para NP300, baleros, satélites..."
                            className="w-full bg-black/60 border border-white/10 rounded-xl py-4 px-5 pr-12 text-white/90 placeholder-white/20 focus:outline-none focus:border-[#ef4444]/50 transition-all"
                        />
                        
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-[#ef4444] rounded-lg flex items-center justify-center hover:bg-[#ef4444]/80 transition-colors"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </form>

                    <motion.div
                        className="absolute -bottom-px left-0 right-0 h-px"
                        animate={{
                            x: isFocused ? ["-100%", "100%"] : "0%",
                            opacity: isFocused ? [0, 1, 0] : 0
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: isFocused ? Infinity : 0,
                            ease: "linear"
                        }}
                        style={{
                            background: "linear-gradient(90deg, transparent, #ef4444, transparent)"
                        }}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 flex flex-wrap gap-2 justify-center"
                >
                    {suggestions.map((suggestion, i) => (
                        <button
                            key={i}
                            onClick={() => setQuery(suggestion)}
                            className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/40 hover:text-white/70 hover:border-[#ef4444]/30 transition-colors"
                        >
                            {suggestion}
                        </button>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8 text-center"
                >
                    <div className="inline-flex items-center gap-2 text-xs text-white/30 border border-white/5 rounded-full px-4 py-2">
                        <span className="w-2 h-2 bg-[#ef4444] rounded-full animate-pulse" />
                        <span>Más de 500 refacciones disponibles · Envío a todo México</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    onHoverStart={() => setShowTips(true)}
                    onHoverEnd={() => setShowTips(false)}
                    className="absolute -top-12 right-0 bg-black/90 border border-[#ef4444]/30 rounded-lg p-3 text-xs text-white/70 max-w-xs"
                    style={{ display: showTips ? "block" : "none" }}
                >
                    💡 Tip de NIA: Los bronces desgastados son la causa #1 de que la transmisión "raspe". ¿Tu cliente describe ese síntoma?
                </motion.div>

                {buscando && (
                    <div className="text-center py-6">
                        <div className="inline-block w-6 h-6 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
                        <p className="text-white/40 text-sm mt-2">Buscando refacciones...</p>
                    </div>
                )}

                {resultados.length > 0 && (
                    <div className="mt-10">
                        <h4 className="text-white/50 text-sm mb-4 text-center">
                            Resultados encontrados ({resultados.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resultados.map((producto) => (
                                <div
                                    key={producto.id}
                                    className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl border border-white/5 p-5"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-white/90 font-medium text-base">
                                            {producto.nombre}
                                        </h4>
                                        <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-white/50">
                                            {producto.tipo}
                                        </span>
                                    </div>
                                    <p className="text-white/30 text-xs mb-3">
                                        Código: {producto.codigo_caja}
                                    </p>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-white/30 text-[10px]">Precio</p>
                                            <p className="text-white/90 text-lg font-light">
                                                ${producto.precio.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white/30 text-[10px]">Stock</p>
                                            <p className="text-green-400 text-sm">{producto.stock} uds</p>
                                        </div>
                                    </div>
                                    <button
    onClick={() => onAddToCart?.(producto)}
    className="mt-4 w-full bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white py-2 rounded-lg text-sm font-medium hover:from-[#ef4444]/90 hover:to-[#f97316]/90 transition-all active:scale-95 shadow-lg shadow-[#ef4444]/20 relative overflow-hidden group"
>
    <span className="relative z-10 flex items-center justify-center gap-2">
        🛒 Comprar
    </span>
    <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-active:translate-x-0 transition-transform duration-300 ease-out" />
</button>

                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!buscando && resultados.length === 0 && query && (
                    <div className="text-center py-6 text-white/40 text-sm">
                        No encontramos refacciones para "{query}". Prueba con otro nombre o código.
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
        </motion.section>
    );
}