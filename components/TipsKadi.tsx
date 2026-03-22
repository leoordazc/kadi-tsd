"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Tip {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    icon: string;
    color: string;
    tags: string[];
}

const tipsData: Tip[] = [
    {
        id: 1,
        title: "¿Por qué se bota la 3ra velocidad?",
        excerpt: "Causas comunes y cómo diagnosticarlo antes de comprar.",
        content: "La tercera velocidad es una de las más exigidas en transmisiones manuales. Cuando 'se bota', generalmente es por desgaste de horquillas o seguros dañados. En el caso de NP300, es común que los bronces de 3ra se desgasten por uso de aceite incorrecto. Recomendamos siempre verificar el estado del aceite antes de asumir que es la transmisión completa.",
        icon: "⚙️",
        color: "#ef4444",
        tags: ["NP300", "diagnóstico", "3ra velocidad"]
    },
    {
        id: 2,
        title: "Aceite incorrecto = transmisión dañada",
        excerpt: "El GL-5 destruye los bronces. Te explicamos por qué.",
        content: "Usar aceite GL-5 en transmisiones manuales es un error común. El GL-5 contiene aditivos de extrema presión que son corrosivos para los metales amarillos (bronces) de los sincronizadores. Siempre usa GL-4 en transmisiones manuales. Para diferenciales, el GL-5 es el correcto. ¿La confusión? Muchos mecánicos usan el mismo aceite para todo y terminan dañando la caja.",
        icon: "🛢️",
        color: "#4ade80",
        tags: ["aceite", "GL-4", "GL-5", "bronces"]
    },
    {
        id: 3,
        title: "Mantenimiento cada 60,000 km",
        excerpt: "Lo que debes revisar para alargar la vida de tu diferencial.",
        content: "El diferencial es el gran olvidado. Recomendamos cambiar el aceite cada 60,000 km o 2 años. Revisa también los retenes (fugas) y el juego en la flecha. Un síntoma clásico de desgaste es un zumbido que aumenta con la velocidad. Si lo atiendes a tiempo, solo cambias aceite. Si lo dejas, terminas cambiando el diferencial completo.",
        icon: "🔧",
        color: "#60a5fa",
        tags: ["mantenimiento", "diferencial", "flecha"]
    },
    {
        id: 4,
        title: "Ruido al girar: ¿diferencial o transmisión?",
        excerpt: "Cómo diferenciar el origen del ruido sin desarmar.",
        content: "Si el ruido aparece al girar en curvas, es casi seguro el diferencial (satélites y planetarios). Si el ruido es constante en línea recta y cambia con la velocidad, puede ser la transmisión o los baleros de las ruedas. Un truco: en una curva cerrada a baja velocidad, si el ruido se acentúa al girar a la izquierda, el desgaste está en el lado derecho del diferencial.",
        icon: "🔊",
        color: "#f97316",
        tags: ["diagnóstico", "ruido", "diferencial"]
    },
    {
        id: 5,
        title: "La reversa no entra: causas y soluciones",
        excerpt: "No siempre es la transmisión. A veces es algo más simple.",
        content: "Cuando la reversa no entra, lo primero: revisa el clutch. Si el pedal no corta bien, el engrane sigue girando y no permite acoplar la reversa. También verifica los cables o varillaje. Si todo eso está bien, el problema puede ser el engrane de reversa o su sincronizador (en cajas que lo tienen). En D21, es común que el problema sea el collarín hidráulico.",
        icon: "🔄",
        color: "#a855f7",
        tags: ["reversa", "clutch", "D21"]
    }
];

interface TipsKadiProps {
    onTipClick?: (tip: Tip) => void;
}

export default function TipsKadi({ onTipClick }: TipsKadiProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [filter, setFilter] = useState("");

    const filteredTips = tipsData.filter(tip => 
        tip.title.toLowerCase().includes(filter.toLowerCase()) ||
        tip.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 py-16 border-t border-white/5"
        >
            <div className="max-w-6xl mx-auto px-4">
                
                {/* Encabezado */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="w-16 h-16 bg-[#ef4444]/10 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                        <span className="text-3xl">📚</span>
                    </motion.div>
                    
                    <h3 className="text-3xl font-light text-white/90 mb-2">
                        <span className="text-[#ef4444]">TIPS</span> DE KADI
                    </h3>
                    
                    <p className="text-white/40 text-sm max-w-2xl mx-auto">
                        Conocimiento técnico que solo 15 años de experiencia pueden dar.
                        Aprende a diagnosticar como un experto.
                    </p>

                    {/* Buscador de tips */}
                    <div className="max-w-md mx-auto mt-6">
                        <input
                            type="text"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Filtrar por palabra clave (NP300, aceite, ruido...)"
                            className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-4 text-white/70 text-sm placeholder-white/20 focus:outline-none focus:border-[#ef4444]/50 transition-colors"
                        />
                    </div>
                </div>

                {/* Grid de tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTips.map((tip, index) => (
                        <motion.div
                            key={tip.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-xl overflow-hidden border border-white/5 cursor-pointer"
                            onClick={() => setExpandedId(expandedId === tip.id ? null : tip.id)}
                        >
                            {/* Cabecera con color */}
                            <div 
                                className="h-1 w-full"
                                style={{ backgroundColor: tip.color }}
                            />
                            
                            <div className="p-5">
                                {/* Icono y título */}
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xl"
                                         style={{ backgroundColor: `${tip.color}20` }}>
                                        {tip.icon}
                                    </div>
                                    <h4 className="text-lg font-medium text-white/90 flex-1">
                                        {tip.title}
                                    </h4>
                                </div>

                                {/* Extracto */}
                                <p className="text-white/40 text-sm mb-3">
                                    {tip.excerpt}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {tip.tags.map((tag, i) => (
                                        <span 
                                            key={i}
                                            className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-white/30"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Contenido expandido */}
                                <AnimatePresence>
                                    {expandedId === tip.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-3 border-t border-white/5">
                                                <p className="text-white/60 text-sm leading-relaxed">
                                                    {tip.content}
                                                </p>
                                                <button 
                                                    className="mt-3 text-xs text-[#ef4444] hover:text-white transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (onTipClick) onTipClick(tip);
                                                    }}
                                                >
                                                    Consultar productos relacionados →
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Indicador de expandir */}
                                <div className="mt-2 text-right">
                                    <span className="text-xs text-white/20">
                                        {expandedId === tip.id ? "▲" : "▼"}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Mensaje de más contenido */}
                {filteredTips.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-white/30">No hay tips para "{filter}"</p>
                    </div>
                )}

                {/* Llamado a la acción final */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-8"
                >
                    <button className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors">
                        <span>Ver todos los tips técnicos</span>
                        <span>→</span>
                    </button>
                </motion.div>
            </div>
        </motion.section>
    );
}