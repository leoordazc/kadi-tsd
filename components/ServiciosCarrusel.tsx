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
        color: "#1e4a8c", // Azul metálico KADI
        href: "/catalogo",
    },
    {
        id: "2",
        imagen: "/images/reparacion-especializada.jpg",
        title: "Reparación especializada",
        desc: "Reconstrucción mayor con limpieza química total, ajuste de tolerancias y reemplazo de componentes críticos.",
        cta: "Cotizar reparación",
        color: "#D4AF37", // Dorado KADI
    },
    {
        id: "3",
        imagen: "/images/mantenimiento-preventivo.jpg",
        title: "Mantenimiento preventivo",
        desc: "Cambio de aceite, inspección de retenes, soportes y juego en flechas. Alarga la vida de tu inversión.",
        cta: "Agendar cita",
        color: "#2a5ca8", // Azul acero brillante
    },
];

export default function ServiciosCarrusel() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [logoOpacity, setLogoOpacity] = useState(1);
    const dragX = useMotionValue(0);

    const handleDragStart = () => {
        setIsDragging(true);
        setLogoOpacity(0); // Se desvanece al arrastrar
    };

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

        setTimeout(() => setLogoOpacity(1), 600);
    };

    const goNext = () => {
        setLogoOpacity(0);
        setActiveIndex((prev) => Math.min(prev + 1, servicios.length - 1));
        setTimeout(() => setLogoOpacity(1), 600);
    };

    const goPrev = () => {
        setLogoOpacity(0);
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        setTimeout(() => setLogoOpacity(1), 600);
    };

    const goTo = (idx: number) => {
        setLogoOpacity(0);
        setActiveIndex(idx);
        setTimeout(() => setLogoOpacity(1), 600);
    };

    return (
        <section className="relative z-10 py-16 border-t border-white/5 overflow-hidden">
            
            {/* ===== LOGO MEDIA LUNA DE FONDO (se mueve en X con el scroll) ===== */}
<motion.div
    className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-0 overflow-hidden"
    animate={{ 
        opacity: logoOpacity,
        x: activeIndex * -120,  // ← se desplaza a la izquierda conforme avanzas
    }}
    transition={{ 
        opacity: { duration: 0.5, ease: "easeOut" },
        x: { type: "spring", stiffness: 100, damping: 25 },
    }}
    style={{
        left: "-15%",
        width: "clamp(320px, 45vw, 680px)",
        height: "clamp(320px, 45vw, 680px)",
        borderRadius: "0 50% 50% 0",         // ← esquinas redondeadas (media luna)
        overflow: "hidden",
        boxShadow: "40px 0 80px rgba(212, 175, 55, 0.08)",
    }}
>
    <img
        src="/logo.png"
        alt=""
        className="w-full h-full object-cover"
        style={{
            opacity: 0.14,
            filter: "grayscale(30%) brightness(1.3)",
        }}
    />
</motion.div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                
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
                        onDragStart={handleDragStart}
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
                                        className={`group rounded-[32px] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.5)] transition-all duration-500 ease-out overflow-hidden w-[300px] sm:w-[360px] ${
                                            servicio.href ? 'cursor-pointer' : 'cursor-default'
                                        }`}
                                        style={{ backgroundColor: "var(--bg-card)" }}
                                    >
                                        {/* ===== IMAGEN DEL PRODUCTO ===== */}
                                        <div
                                            className="relative h-56 sm:h-64 rounded-[24px] mb-4 overflow-hidden"
                                            style={{ backgroundColor: "var(--bg-primary)" }}
                                        >
                                            <img 
                                                src={servicio.imagen}
                                                alt={servicio.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    const parent = e.currentTarget.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = `
                                                            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#23272e] to-[#2c3138]">
                                                                <span class="text-6xl opacity-30">🔧</span>
                                                            </div>
                                                        `;
                                                    }
                                                }}
                                            />
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
                        onClick={goPrev}
                        disabled={activeIndex === 0}
                        className={`absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full backdrop-blur-sm text-white flex items-center justify-center transition-all z-[60] ${
                            activeIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:bg-black/80'
                        }`}
                        style={{ backgroundColor: "rgba(15, 18, 21, 0.6)" }}
                        aria-label="Anterior"
                    >
                        ◀
                    </button>

                    {/* Botón siguiente */}
                    <button
                        onClick={goNext}
                        disabled={activeIndex === servicios.length - 1}
                        className={`absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full backdrop-blur-sm text-white flex items-center justify-center transition-all z-[60] ${
                            activeIndex === servicios.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:bg-black/80'
                        }`}
                        style={{ backgroundColor: "rgba(15, 18, 21, 0.6)" }}
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
                            onClick={() => goTo(idx)}
                            className={`h-1.5 rounded-full transition-all ${
                                idx === activeIndex 
                                    ? 'w-8' 
                                    : 'w-2 bg-white/20 hover:bg-white/40'
                            }`}
                            style={idx === activeIndex ? { backgroundColor: "var(--kadi-gold)" } : {}}
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