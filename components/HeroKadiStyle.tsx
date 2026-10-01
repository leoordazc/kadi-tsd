"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Wrench, Truck } from "lucide-react";

interface HeroKadiStyleProps {
  onConoceKadi: () => void;
}

const features = [
  {
    icon: ShieldCheck,
    title: "Garantía por escrito",
    desc: "3 meses respaldados en cada reparación.",
    color: "#4ade80",
  },
  {
    icon: Wrench,
    title: "Especialistas en estándar",
    desc: "Solo transmisiones manuales y diferenciales.",
    color: "#ef4444",
  },
  {
    icon: Truck,
    title: "Envío nacional",
    desc: "Paquetería segura y rastreable.",
    color: "#D4AF37",
  },
];

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
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black text-white pt-[140px]">
      
      {/* ===== FONDO CON GRADIENTE DINÁMICO ===== */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0f0a0a] to-black" />
      
      {/* Glow que sigue al mouse */}
      <motion.div
        animate={{
          x: mousePosition.x * 15,
          y: mousePosition.y * 15,
        }}
        transition={{ type: "spring", damping: 50, stiffness: 100 }}
        className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-[#ef4444]/20 via-[#D4AF37]/10 to-transparent rounded-full blur-[120px] opacity-60 pointer-events-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Partículas sutiles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#ef4444]/40 rounded-full"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              opacity: 0,
            }}
            animate={{
              y: [null, "-20%"],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 8 + 8,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="flex flex-col items-center text-center">
          
          {/* ===== BADGE SUPERIOR ===== */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <span className="text-xs font-medium text-white/80 tracking-wider uppercase">
              Impulsado por NIA
            </span>
          </motion.div>

          {/* ===== TÍTULO PRINCIPAL ===== */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight"
          >
            <span className="block text-white/90">Tu transmisión manual</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ef4444] via-[#f97316] to-[#D4AF37]">
              en un solo lugar.
            </span>
          </motion.h1>

          {/* ===== SUBTÍTULO ===== */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/60 max-w-2xl mb-10 font-light"
          >
            Encuentra o diagnostica en <span className="text-[#4ade80] font-medium">segundos</span>.
          </motion.p>

          {/* ===== BOTÓN PRINCIPAL (CONOCE KADI) ===== */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mb-16"
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

          {/* ===== TARJETAS DE CARACTERÍSTICAS ===== */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-4xl"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6, backgroundColor: "rgba(255,255,255,0.05)" }}
                className="flex flex-col items-center p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl transition-all duration-300"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${feature.color}15`, border: `1px solid ${feature.color}30` }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="text-base font-medium text-white/90 mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs text-white/40 text-center leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}