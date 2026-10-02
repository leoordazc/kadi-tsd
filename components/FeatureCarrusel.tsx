"use client";

import React, { useState } from "react";
import { motion, useMotionValue, PanInfo } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

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
    const dragX = useMotionValue(0);

    const handleDragEnd = (event: any, info: PanInfo) => {
        const swipeThreshold = 50;
        const offset = info.offset.x;

        if (offset < -swipeThreshold) {
            // Swipe izquierda → siguiente
            setActiveIndex((prev) => (prev + 1) % features.length);
        } else if (offset > swipeThreshold) {
            // Swipe derecha → anterior
            setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
        }
    };

    const goNext = () => {
        setActiveIndex((prev) => (prev + 1) % features.length);
    };

    const goPrev = () => {
        setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
    };

    // Calcular posición sin animación 3D pesada
    const getPositionData = (index: number) => {
        let offset = index - activeIndex;
        const total = features.length;

        if (offset > total / 2) offset -= total;
        if (offset < -total / 2) offset += total;

        const absOffset = Math.abs(offset);
        const scale = absOffset === 0 ? 1 : absOffset === 1 ? 0.85 : 0.7;
        const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.4 : 0;
        const translateX = offset * 320;
        const zIndex = 50 - absOffset;

        return { scale, opacity, translateX, zIndex, absOffset };
    };

    return (
        <div className="relative">
            {/* TÍTULO */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
                    <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                    <span className="text-xs font-medium text-white/80 tracking-wider uppercase">
                        Nuestro compromiso
                    </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-light text-white/90">
                    Lo que <span className="text-[#ef4444]">garantizamos</span>
                </h2>
            </div>

            {/* CARRUSEL */}
            <div className="relative h-[380px] sm:h-[420px] flex items-center justify-center overflow-hidden">
                <motion.div
                    className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    dragMomentum={false}
                    onDragEnd={handleDragEnd}
                    style={{ x: dragX }}
                >
                    {features.map((feature, index) => {
                        const { scale, opacity, translateX, zIndex, absOffset } =
                            getPositionData(index);

                        if (absOffset > 1) return null;

                        return (
                            <motion.div
                                key={feature.id}
                                className="absolute"
                                initial={false}
                                animate={{
                                    x: translateX,
                                    scale: scale,
                                    opacity: opacity,
                                    zIndex: zIndex,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 28,
                                }}
                                style={{
                                    pointerEvents: absOffset === 0 ? "auto" : "none",
                                    willChange: "transform, opacity",
                                }}
                            >
                                <div
                                    onClick={() => {
                                        if (feature.href) {
                                            window.location.href = feature.href;
                                        }
                                    }}
                                    className={`bg-[#1a1a1a] rounded-[32px] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden w-[280px] sm:w-[320px] ${
                                        feature.href ? "cursor-pointer" : "cursor-default"
                                    }`}
                                >
                                    {/* IMAGEN */}
                                    <div className="relative h-44 rounded-[24px] mb-4 overflow-hidden bg-black">
                                        <Image
                                            src={feature.imagen}
                                            alt={feature.title}
                                            fill
                                            sizes="320px"
                                            className="object-cover"
                                            priority={absOffset === 0}
                                            quality={75}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
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

                                    {/* CONTENIDO */}
                                    <div className="px-3 pb-2">
                                        <h3 className="text-lg font-semibold text-white/95 mb-2 leading-tight">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-white/50 leading-relaxed mb-4">
                                            {feature.desc}
                                        </p>
                                        <div
                                            className="flex items-center gap-1 text-sm font-medium"
                                            style={{ color: feature.color }}
                                        >
                                            {feature.cta}
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* BOTONES */}
                <button
                    onClick={goPrev}
                    className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white flex items-center justify-center z-[60] transition-colors"
                    aria-label="Anterior"
                >
                    ◀
                </button>
                <button
                    onClick={goNext}
                    className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white flex items-center justify-center z-[60] transition-colors"
                    aria-label="Siguiente"
                >
                    ▶
                </button>
            </div>

            {/* INDICADORES */}
            <div className="flex justify-center gap-2 mt-6">
                {features.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === activeIndex
                                ? "w-8 bg-[#ef4444]"
                                : "w-2 bg-white/20 hover:bg-white/40"
                        }`}
                        aria-label={`Ir a tarjeta ${idx + 1}`}
                    />
                ))}
            </div>

            {/* HINT */}
            <p className="text-center text-white/20 text-xs mt-6 tracking-wider">
                ← Arrastra o usa las flechas para ver más →
            </p>
        </div>
    );
}