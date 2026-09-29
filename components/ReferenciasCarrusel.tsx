"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Referencia {
    id: string;
    tipo: 'imagen' | 'video';
    url: string;
    titulo: string;
    descripcion: string;
}

export default function ReferenciasCarrusel() {
    // 👇 AQUÍ AGREGAS TUS FOTOS/VIDEOS REALES
    const referencias: Referencia[] = [
        {
            id: "1",
            tipo: "imagen",
            url: "/referencias/trabajo-1.jpg",
            titulo: "Reconstrucción NP300",
            descripcion: "Cliente de Monterrey"
        },
        {
            id: "2",
            tipo: "video",
            url: "/referencias/video-1.mp4",
            titulo: "Diagnóstico Hilux 2015",
            descripcion: "Taller en CDMX"
        },
        {
            id: "3",
            tipo: "imagen",
            url: "/referencias/trabajo-2.jpg",
            titulo: "Diferencial Ranger",
            descripcion: "Flotilla en Guadalajara"
        },
        {
            id: "4",
            tipo: "imagen",
            url: "/referencias/trabajo-3.jpg",
            titulo: "Caja S10 Max",
            descripcion: "Taller en Puebla"
        },
        {
            id: "5",
            tipo: "video",
            url: "/referencias/video-2.mp4",
            titulo: "Ensamble de transmisión",
            descripcion: "Cliente de Querétaro"
        },
        {
            id: "6",
            tipo: "imagen",
            url: "/referencias/trabajo-4.jpg",
            titulo: "Diferencial D21",
            descripcion: "Taller en Toluca"
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % referencias.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + referencias.length) % referencias.length);
    };

    const currentRef = referencias[currentIndex];

    return (
        <section className="relative z-10 py-20 border-t border-white/5 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-8">
                
                {/* ===== TÍTULO ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-light text-white/90 mb-3">
                        Nuestro trabajo <span className="text-[#ef4444]">real</span>
                    </h2>
                    <p className="text-white/40 text-sm md:text-base">
                        Más de 3,000 transmisiones reparadas y vendidas en los últimos 4 años
                    </p>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#ef4444] to-transparent mx-auto mt-6" />
                </motion.div>

                {/* ===== CARRUSEL PRINCIPAL ===== */}
                <div className="relative">
                    
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4 }}
                        className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black cursor-pointer"
                        onClick={() => setIsModalOpen(true)}
                    >
                        {currentRef.tipo === 'imagen' ? (
                            <img
                                src={currentRef.url}
                                alt={currentRef.titulo}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    // Fallback si no hay imagen real
                                    e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect fill="%231a1a1a" width="800" height="450"/><text x="400" y="225" fill="%23444" font-size="30" text-anchor="middle" font-family="Arial">📷 Referencia</text></svg>';
                                }}
                            />
                        ) : (
                            <video
                                src={currentRef.url}
                                className="w-full h-full object-cover"
                                muted
                                loop
                                playsInline
                                autoPlay
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        )}

                        {/* Overlay con info */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 pointer-events-none">
                            <h3 className="text-xl sm:text-2xl font-light text-white mb-1">
                                {currentRef.titulo}
                            </h3>
                            <p className="text-white/60 text-sm">
                                {currentRef.descripcion}
                            </p>
                        </div>

                        {/* Badge de tipo */}
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 text-[10px] text-white/80 tracking-wider uppercase">
                            {currentRef.tipo === 'video' ? '🎥 Video' : '📷 Foto'}
                        </div>
                    </motion.div>

                    {/* Botones de navegación */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white flex items-center justify-center transition-all"
                        aria-label="Anterior"
                    >
                        ◀
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white flex items-center justify-center transition-all"
                        aria-label="Siguiente"
                    >
                        ▶
                    </button>

                    {/* Indicadores de posición */}
                    <div className="absolute bottom-4 right-6 flex gap-1.5">
                        {referencias.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1.5 rounded-full transition-all ${
                                    idx === currentIndex ? 'w-6 bg-[#ef4444]' : 'w-1.5 bg-white/30'
                                }`}
                                aria-label={`Ir a referencia ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* ===== MINIATURAS ===== */}
                <div className="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
                    {referencias.map((ref, idx) => (
                        <button
                            key={ref.id}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                idx === currentIndex 
                                    ? 'border-[#ef4444] shadow-lg shadow-[#ef4444]/20' 
                                    : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
                            }`}
                        >
                            {ref.tipo === 'imagen' ? (
                                <img
                                    src={ref.url}
                                    alt={ref.titulo}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23222" width="100" height="100"/></svg>';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full bg-black flex items-center justify-center text-2xl">
                                    ▶
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* ===== CTA ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-10 text-center"
                >
                    <p className="text-white/40 text-sm mb-4">
                        ¿Quieres ver más trabajos o tienes una duda técnica?
                    </p>
                    <a
                        href="https://wa.me/5573382923?text=Hola,%20vi%20sus%20referencias%20y%20quiero%20cotizar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80] rounded-lg hover:bg-[#4ade80]/20 transition text-sm"
                    >
                        💬 Contactar por WhatsApp
                    </a>
                </motion.div>
            </div>

            {/* ===== MODAL DE VISTA COMPLETA ===== */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-4 sm:inset-8 z-50 flex items-center justify-center"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
                                {currentRef.tipo === 'imagen' ? (
                                    <img
                                        src={currentRef.url}
                                        alt={currentRef.titulo}
                                        className="w-full h-auto rounded-2xl"
                                    />
                                ) : (
                                    <video
                                        src={currentRef.url}
                                        className="w-full h-auto rounded-2xl"
                                        controls
                                        autoPlay
                                    />
                                )}
                                
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
                                >
                                    ✕
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </section>
    );
}