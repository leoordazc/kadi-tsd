"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { ShieldCheck, Wrench, Truck, ArrowRight } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Servicio {
    id: string;
    icon: LucideIcon;
    title: string;
    desc: string;
    cta: string;
    color: string;
    gradient: string;
    href?: string;
}

const servicios: Servicio[] = [
    {
        id: "1",
        icon: ShieldCheck,
        title: "Garantía por escrito",
        desc: "3 meses respaldados en cada reparación. Si falla, respondemos.",
        cta: "Conoce más",
        color: "#4ade80",
        gradient: "from-[#4ade80]/20 to-[#22d3ee]/10",
    },
    {
        id: "2",
        icon: Wrench,
        title: "Especialistas en estándar",
        desc: "Solo transmisiones manuales y diferenciales. No tocamos automáticas.",
        cta: "Ver catálogo",
        color: "#ef4444",
        gradient: "from-[#ef4444]/20 to-[#f97316]/10",
        href: "/catalogo",
    },
    {
        id: "3",
        icon: Truck,
        title: "Envío nacional",
        desc: "Paquetería segura y rastreable a todo México.",
        cta: "Ver cobertura",
        color: "#D4AF37",
        gradient: "from-[#D4AF37]/20 to-[#ef4444]/10",
    },
];

export default function ServiciosCarrusel() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragX = useMotionValue(0);

    const handleDragEnd = (event: any, info: PanInfo) => {
        setIsDragging(false);
        
        const swipeThreshold = 50;
        const offset = info.offset.x;
        const velocity = info.velocity.x;
        
        // Determinar dirección por offset o velocidad
        const swipeDirection = offset < -swipeThreshold || velocity < -500 ? 1 : 
                              offset > swipeThreshold || velocity > 500 ? -1 : 0;
        
        if (swipeDirection === 1) {
            // Swipe hacia la izquierda → siguiente tarjeta
            setActiveIndex((prev) => Math.min(prev + 1, servicios.length - 1));
        } else if (swipeDirection === -1) {
            // Swipe hacia la derecha → tarjeta anterior
            setActiveIndex((prev) => Math.max(prev - 1, 0));
        }
    };

    return (
        <section className="relative z-10 py-16 border-t border-white/5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                
                {/* ===== TÍTULO ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h2 className="text-3xl font-light text-white/90 mb-2">
                        ¿Qué necesitas hoy?
                    </h2>
                    <p className="text-white/40 text-sm">
                        Desliza para explorar nuestros servicios
                    </p>
                </motion.div>

                {/* ===== CARRUSEL 3D ===== */}
                <div className="relative h-[420px] sm:h-[450px] flex items-center justify-center perspective-[1500px]">
                    
                    {/* Contenedor con drag */}
                    <motion.div
                        className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={handleDragEnd}
                        style={{ x: dragX }}
                    >
                        {servicios.map((servicio, index) => {
                            const offset = index - activeIndex;
                            const absOffset = Math.abs(offset);
                            
                            // Solo mostramos tarjetas cercanas al centro
                            if (absOffset > 2) return null;
                            
                            // Calcular propiedades visuales según distancia al centro
                            const scale = absOffset === 0 ? 1 : absOffset === 1 ? 0.8 : 0.6;
                            const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.6 : 0.3;
                            const translateX = offset * 320; // px entre tarjetas
                            const translateZ = -absOffset * 150; // profundidad
                            const rotateY = offset * -15; // rotación en Y
                            const zIndex = 50 - absOffset;
                            
                            const Icon = servicio.icon;
                            
                            return (
                                <motion.div
                                    key={servicio.id}
                                    className="absolute"
                                    initial={false}
                                    animate={{
                                        x: translateX,
                                        scale: scale,
                                        opacity: opacity,
                                        rotateY: rotateY,
                                        zIndex: zIndex,
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 25,
                                    }}
                                    style={{
                                        transformStyle: "preserve-3d",
                                        transform: `translateZ(${translateZ}px)`,
                                        pointerEvents: absOffset === 0 ? "auto" : "none",
                                    }}
                                >
                                    {/* Tarjeta */}
                                    <div 
                                        onClick={() => {
                                            if (servicio.href && !isDragging) {
                                                window.location.href = servicio.href;
                                            }
                                        }}
                                        className={`group bg-[#1a1a1a] rounded-[32px] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.5)] transition-all duration-500 ease-out overflow-hidden w-[280px] sm:w-[320px] ${
                                            servicio.href ? 'cursor-pointer' : 'cursor-default'
                                        }`}
                                    >
                                        {/* Área visual superior */}
                                        <div 
                                            className={`relative h-44 sm:h-48 rounded-[24px] mb-4 overflow-hidden bg-gradient-to-br ${servicio.gradient} flex items-center justify-center border border-white/5`}
                                        >
                                            {/* Icono flotante grande */}
                                            <motion.div
                                                animate={absOffset === 0 ? { 
                                                    y: [0, -6, 0],
                                                } : {}}
                                                transition={{ 
                                                    duration: 3, 
                                                    repeat: Infinity, 
                                                    ease: "easeInOut" 
                                                }}
                                            >
                                               <Icon 
    className="w-20 h-20 drop-shadow-2xl" 
    style={{ 
        color: servicio.color,
        strokeWidth: 1.5
    } as React.CSSProperties}
/>
                                            </motion.div>

                                            {/* Glow de fondo */}
                                            <div 
                                                className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full blur-3xl opacity-30"
                                                style={{ backgroundColor: servicio.color }}
                                            />
                                            <div 
                                                className="absolute -top-4 -left-4 w-24 h-24 rounded-full blur-2xl opacity-20"
                                                style={{ backgroundColor: servicio.color }}
                                            />
                                        </div>

                                        {/* Contenido inferior */}
                                        <div className="px-3 pb-2">
                                            <h3 className="text-lg font-semibold text-white/95 mb-2 leading-tight">
                                                {servicio.title}
                                            </h3>
                                            <p className="text-sm text-white/50 leading-relaxed mb-4">
                                                {servicio.desc}
                                            </p>

                                            {/* CTA con flecha */}
                                            <div 
                                                className="flex items-center gap-1 text-sm font-medium transition-colors"
                                                style={{ color: servicio.color }}
                                            >
                                                {servicio.cta}
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Botón anterior */}
                    <button
                        onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
                        disabled={activeIndex === 0}
                        className={`absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white flex items-center justify-center transition-all z-[60] ${
                            activeIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'
                        }`}
                        aria-label="Anterior"
                    >
                        ◀
                    </button>

                    {/* Botón siguiente */}
                    <button
                        onClick={() => setActiveIndex((prev) => Math.min(prev + 1, servicios.length - 1))}
                        disabled={activeIndex === servicios.length - 1}
                        className={`absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white flex items-center justify-center transition-all z-[60] ${
                            activeIndex === servicios.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'
                        }`}
                        aria-label="Siguiente"
                    >
                        ▶
                    </button>
                </div>

                {/* ===== INDICADORES ===== */}
                <div className="flex justify-center gap-2 mt-8">
                    {servicios.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`h-1.5 rounded-full transition-all ${
                                idx === activeIndex 
                                    ? 'w-8 bg-[#ef4444]' 
                                    : 'w-2 bg-white/20 hover:bg-white/40'
                            }`}
                            aria-label={`Ir a tarjeta ${idx + 1}`}
                        />
                    ))}
                </div>

                {/* Hint de drag */}
                <p className="text-center text-white/20 text-xs mt-6 tracking-wider">
                    ← Desliza o usa las flechas para explorar →
                </p>
            </div>
        </section>
    );
}