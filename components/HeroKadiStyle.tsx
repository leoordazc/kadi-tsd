"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FeatureCarrusel from "@/components/FeatureCarrusel";

interface HeroKadiStyleProps {
  onConoceKadi: () => void;
}

export default function HeroKadiStyle({ onConoceKadi }: HeroKadiStyleProps) {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden text-white pt-[140px] pb-20">
      
      {/* ===== IMAGEN DE FONDO ===== */}
<div 
  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
  style={{ 
    backgroundImage: "url('/transmision-hero-bg.jpg')",
  }}
/>

{/* ===== OVERLAY OSCURO PARA QUE EL TEXTO SE LEA ===== */}
<div 
  className="absolute inset-0"
  style={{ 
    background: "linear-gradient(to bottom, rgba(15, 18, 21, 0.85) 0%, rgba(15, 18, 21, 0.7) 50%, rgba(15, 18, 21, 0.95) 100%)",
  }}
/>

      {/* Glow dinámico (dorado + azul metálico) */}
      <motion.div
        animate={{
          x: mousePosition.x * 15,
          y: mousePosition.y * 15,
        }}
        transition={{ type: "spring", damping: 50, stiffness: 100 }}
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-60 pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(30, 74, 140, 0.10) 50%, transparent 70%)",
        }}
      />

      {/* Partículas sutiles (optimizadas: solo 8) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: "rgba(212, 175, 55, 0.4)",
              animation: `floatUp ${8 + Math.random() * 6}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="flex flex-col items-center text-center">
          
          {/* Badge superior */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--kadi-gold)" }} />
            <span className="text-xs font-medium text-white/80 tracking-wider uppercase">
              Impulsado por NIA
            </span>
          </motion.div>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight"
          >
            <span className="block text-white/90">Tu transmisión manual</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#1e4a8c] via-[#2a5ca8] to-[#D4AF37]">
              en un solo lugar.
            </span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/60 max-w-2xl mb-10 font-light"
          >
            Encuentra o diagnostica en <span className="font-medium" style={{ color: "var(--kadi-gold)" }}>segundos</span>.
          </motion.p>

          {/* Botón principal (mantiene rojo por ser CTA urgente) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mb-20"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onConoceKadi}
              className="relative group px-8 py-4 bg-transparent border-2 border-[#ef4444] text-white font-medium rounded-2xl overflow-hidden transition-all hover:bg-[#ef4444]/10 hover:shadow-[0_0_40px_rgba(239,68,68,0.3)]"
            >
              <span className="relative z-10 flex items-center gap-2 text-base">
                📖 CONOCE KADI
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#ef4444]/30 to-[#D4AF37]/30"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.4 }}
              />
            </motion.button>
          </motion.div>

          {/* ===== CARRUSEL DE FEATURES ===== */}
          <div className="w-full max-w-5xl mt-4">
            <FeatureCarrusel />
          </div>

        </div>
      </div>
    </section>
  );
}