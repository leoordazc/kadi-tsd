"use client";

import React, { useState } from "react";
import { motion, useMotionValue, PanInfo } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Servicio {
    id: string;
    imagen: string;
    title: string;
    desc: string;
    cta: string;
    color: string;
    href?: string;
}

const servicios: Servicio[] = [
    {
        id: "1",
        imagen: "/images/venta-unidades.jpg",
        title: "Venta de unidades",
        desc: "Transmisiones y diferenciales listos para instalar. Verificadas en banco de pruebas.",
        cta: "Ver catálogo",
        color: "#ef4444",
        href: "/catalogo",
    },
    {
        id: "2",
        imagen: "/images/reparacion-especializada.jpg",
        title: "Reparación especializada",
        desc: "Reconstrucción mayor con limpieza química total, ajuste de tolerancias y reemplazo de componentes críticos.",
        cta: "Cotizar reparación",
        color: "#4ade80",
    },
    {
        id: "3",
        imagen: "/images/mantenimiento-preventivo.jpg",
        title: "Mantenimiento preventivo",
        desc: "Cambio de aceite, inspección de retenes, soportes y juego en flechas. Alarga la vida de tu inversión.",
        cta: "Agendar cita",
        color: "#60a5fa",
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
        
        const swipeDirection = offset < -swipeThreshold || velocity < -500 ? 1 : 
                              offset > swipeThreshold || velocity > 500 ? -1 : 0;
        
        if (swipeDirection === 1) {
            setActiveIndex((prev) => Math.min(prev + 1, servicios.length - 1));
        } else if (swipeDirection === -1) {
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
                <div className="relative h-[450px] sm:h-[500px] flex items-center justify-center perspective-[1500px]">
                    
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
                            
                            if (absOffset > 2) return null;
                            
                            const scale = absOffset === 0 ? 1 : absOffset === 1 ? 0.82 : 0.65;
                            const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.5 : 0.2;
                            const translateX = offset * 340;
                            const translateZ = -absOffset * 150;
                            const rotateY = offset * -12;
                            const zIndex = 50 - absOffset;
                            
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
                                    {/* ===== TARJETA ===== */}
                                    <div 
                                        onClick={() => {
                                            if (servicio.href && !isDragging) {
                                                window.location.href = servicio.href;
                                            }
                                        }}
                                        className={`group bg-[#1a1a1a] rounded-[32px] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.5)] transition-all duration-500 ease-out overflow-hidden w-[300px] sm:w-[360px] ${
                                            servicio.href ? 'cursor-pointer' : 'cursor-default'
                                        }`}
                                    >
                                        {/* ===== IMAGEN DEL PRODUCTO ===== */}
                                        <div className="relative h-56 sm:h-64 rounded-[24px] mb-4 overflow-hidden bg-black">
                                            <img 
                                                src={servicio.imagen}
                                                alt={servicio.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                onError={(e) => {
                                                    // Fallback si no carga la imagen
                                                    e.currentTarget.style.display = 'none';
                                                    const parent = e.currentTarget.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = `
                                                            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
                                                                <span class="text-6xl opacity-30">🔧</span>
                                                            </div>
                                                        `;
                                                    }
                                                }}
                                            />
                                            {/* Overlay con gradiente para mejor legibilidad */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                            
                                            {/* Badge de color */}
                                            <div 
                                                className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase backdrop-blur-sm border"
                                                style={{ 
                                                    backgroundColor: `${servicio.color}20`,
                                                    color: servicio.color,
                                                    borderColor: `${servicio.color}40`
                                                }}
                                            >
                                                {servicio.id === "1" && "Nuevas · Reconstruidas"}
                                                {servicio.id === "2" && "Reparación mayor"}
                                                {servicio.id === "3" && "Preventivo"}
                                            </div>
                                        </div>

                                        {/* ===== CONTENIDO ===== */}
                                        <div className="px-3 pb-2">
                                            <h3 className="text-xl font-semibold text-white/95 mb-2 leading-tight">
                                                {servicio.title}
                                            </h3>
                                            <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-3">
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