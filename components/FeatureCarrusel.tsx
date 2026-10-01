"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, PanInfo } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Feature {
    id: string;
    imagen: string;
    title: string;
    desc: string;
    cta: string;
    color: string;
    badge: string;
    href?: string;
}

const features: Feature[] = [
    {
        id: "1",
        imagen: "/images/poliza-garantia.jpg",
        title: "Garantía por escrito",
        desc: "3 meses respaldados con póliza firmada.",
        cta: "Conoce más",
        color: "#4ade80",
        badge: "Póliza oficial",
    },
    {
        id: "2",
        imagen: "/images/taller-kadi.jpg",
        title: "Especialistas en estándar",
        desc: "Solo transmisiones manuales y diferenciales.",
        cta: "Ver catálogo",
        color: "#ef4444",
        badge: "Ingeniería",
        href: "/catalogo",
    },
    {
        id: "3",
        imagen: "/images/guia-envio.jpg",
        title: "Envío nacional",
        desc: "Paquetería segura y rastreable.",
        cta: "Ver cobertura",
        color: "#D4AF37",
        badge: "Guía de envío",
    },
];

export default function FeatureCarrusel() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const dragX = useMotionValue(0);

    // ============================================
    // AUTO-SCROLL CADA 3 SEGUNDOS
    // ============================================
    useEffect(() => {
        if (isPaused || isDragging) return;

        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % features.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [isPaused, isDragging]);

    // ============================================
    // MANEJO DE DRAG
    // ============================================
    const handleDragStart = () => {
        setIsDragging(true);
        setIsPaused(true);
    };

    const handleDragEnd = (event: any, info: PanInfo) => {
        setIsDragging(false);

        const swipeThreshold = 50;
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        const swipeDirection =
            offset < -swipeThreshold || velocity < -500
                ? 1
                : offset > swipeThreshold || velocity > 500
                ? -1
                : 0;

        if (swipeDirection === 1) {
            setActiveIndex((prev) => (prev + 1) % features.length);
        } else if (swipeDirection === -1) {
            setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
        }

        // Reanudar auto-scroll después de 5 segundos de inactividad
        setTimeout(() => setIsPaused(false), 5000);
    };

    // ============================================
    // CÁLCULO DE POSICIONES 3D
    // ============================================
    const getPositionData = (index: number) => {
        let offset = index - activeIndex;
        const total = features.length;

        // Ajustar offset para carrusel infinito
        if (offset > total / 2) offset -= total;
        if (offset < -total / 2) offset += total;

        const absOffset = Math.abs(offset);
        const scale = absOffset === 0 ? 1 : absOffset === 1 ? 0.75 : 0.5;
        const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.5 : 0.15;
        const translateX = offset * 340;
        const translateZ = -absOffset * 150;
        const rotateY = offset * -12;
        const zIndex = 50 - absOffset;

        return { scale, opacity, translateX, translateZ, rotateY, zIndex, absOffset };
    };

    return (
        <div className="relative">
            {/* ===== TÍTULO ===== */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-8"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
                    <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                    <span className="text-xs font-medium text-white/80 tracking-wider uppercase">
                        Nuestro compromiso
                    </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-light text-white/90">
                    Lo que <span className="text-[#ef4444]">garantizamos</span>
                </h2>
            </motion.div>

            {/* ===== CARRUSEL 3D ===== */}
            <div className="relative h-[400px] sm:h-[440px] flex items-center justify-center perspective-[1500px]">
                
                <motion.div
                    className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    style={{ x: dragX }}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {features.map((feature, index) => {
                        const { scale, opacity, translateX, translateZ, rotateY, zIndex, absOffset } =
                            getPositionData(index);

                        if (absOffset > 1.5) return null;

                        return (
                            <motion.div
                                key={feature.id}
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
                                        if (feature.href && !isDragging) {
                                            window.location.href = feature.href;
                                        }
                                    }}
                                    className={`group bg-[#1a1a1a] rounded-[32px] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_25px_50px_rgb(0,0,0,0.5)] transition-all duration-500 ease-out overflow-hidden w-[300px] sm:w-[340px] ${
                                        feature.href ? "cursor-pointer" : "cursor-default"
                                    }`}
                                >
                                    {/* ===== IMAGEN ===== */}
                                    <div className="relative h-48 rounded-[24px] mb-4 overflow-hidden bg-black">
                                        <img
                                            src={feature.imagen}
                                            alt={feature.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                                const parent = e.currentTarget.parentElement;
                                                if (parent) {
                                                    parent.innerHTML = `
                                                        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
                                                            <span class="text-6xl opacity-30">📷</span>
                                                        </div>
                                                    `;
                                                }
                                            }}
                                        />

                                        {/* Overlay con gradiente */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                                        {/* Badge */}
                                        <div
                                            className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase backdrop-blur-sm border"
                                            style={{
                                                backgroundColor: `${feature.color}25`,
                                                color: feature.color,
                                                borderColor: `${feature.color}50`,
                                            }}
                                        >
                                            {feature.badge}
                                        </div>
                                    </div>

                                    {/* ===== CONTENIDO ===== */}
                                    <div className="px-3 pb-2">
                                        <h3 className="text-lg font-semibold text-white/95 mb-2 leading-tight">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-white/50 leading-relaxed mb-4">
                                            {feature.desc}
                                        </p>

                                        {/* CTA */}
                                        <div
                                            className="flex items-center gap-1 text-sm font-medium transition-colors"
                                            style={{ color: feature.color }}
                                        >
                                            {feature.cta}
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ===== BOTONES DE NAVEGACIÓN ===== */}
                <button
                    onClick={() => {
                        setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
                        setIsPaused(true);
                        setTimeout(() => setIsPaused(false), 5000);
                    }}
                    className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white flex items-center justify-center transition-all z-[60]"
                    aria-label="Anterior"
                >
                    ◀
                </button>
                <button
                    onClick={() => {
                        setActiveIndex((prev) => (prev + 1) % features.length);
                        setIsPaused(true);
                        setTimeout(() => setIsPaused(false), 5000);
                    }}
                    className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white flex items-center justify-center transition-all z-[60]"
                    aria-label="Siguiente"
                >
                    ▶
                </button>
            </div>

            {/* ===== INDICADORES ===== */}
            <div className="flex justify-center gap-2 mt-8">
                {features.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setActiveIndex(idx);
                            setIsPaused(true);
                            setTimeout(() => setIsPaused(false), 5000);
                        }}
                        className={`h-1.5 rounded-full transition-all ${
                            idx === activeIndex
                                ? "w-8 bg-[#ef4444]"
                                : "w-2 bg-white/20 hover:bg-white/40"
                        }`}
                        aria-label={`Ir a tarjeta ${idx + 1}`}
                    />
                ))}
            </div>

            {/* ===== HINT DE DRAG ===== */}
            <p className="text-center text-white/20 text-xs mt-6 tracking-wider">
                ← Desliza o espera para ver más →
            </p>
        </div>
    );
}