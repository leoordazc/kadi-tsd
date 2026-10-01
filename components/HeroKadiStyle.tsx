"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Wrench, Truck, ArrowRight } from "lucide-react";

interface HeroKadiStyleProps {
  onConoceKadi: () => void;
}

const features = [
  {
    icon: ShieldCheck,
    title: "Garantía por escrito",
    desc: "3 meses respaldados en cada reparación.",
    cta: "Conoce más",
    color: "#4ade80",
    gradient: "from-[#4ade80]/20 to-[#22d3ee]/10",
  },
  {
    icon: Wrench,
    title: "Especialistas en estándar",
    desc: "Solo transmisiones manuales y diferenciales.",
    cta: "Ver catálogo",
    color: "#ef4444",
    gradient: "from-[#ef4444]/20 to-[#f97316]/10",
  },
  {
    icon: Truck,
    title: "Envío nacional",
    desc: "Paquetería segura y rastreable.",
    cta: "Ver cobertura",
    color: "#D4AF37",
    gradient: "from-[#D4AF37]/20 to-[#ef4444]/10",
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
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black text-white pt-[140px] pb-20">
      
      {/* Fondo con gradiente KADI */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0f0a0a] to-black" />
      
      {/* Glow dinámico */}
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
        {[...Array(15)].map((_, i) => (
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
          
          {/* Badge superior */}
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

          {/* Título */}
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

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/60 max-w-2xl mb-10 font-light"
          >
            Encuentra o diagnostica en <span className="text-[#4ade80] font-medium">segundos</span>.
          </motion.p>

          {/* Botón principal */}
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

          {/* ===== TARJETAS ESTILO GOOGLE LABS (adaptadas a KADI) ===== */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
          >
            {features.map((feature, idx) => (
              <motion.a
                key={idx}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (idx === 1) window.location.href = "/catalogo";
                }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="group relative bg-[#1a1a1a] rounded-[32px] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.4)] transition-all duration-500 ease-out overflow-hidden text-left"
              >
                {/* Área visual superior con gradiente */}
                <div 
                  className={`relative h-40 rounded-[24px] mb-4 overflow-hidden bg-gradient-to-br ${feature.gradient} flex items-center justify-center border border-white/5`}
                >
                  {/* Icono flotante grande */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <feature.icon 
                      className="w-16 h-16 drop-shadow-2xl" 
                      style={{ color: feature.color }}
                      strokeWidth={1.5}
                    />
                  </motion.div>

                  {/* Decoración sutil de fondo */}
                  <div 
                    className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-30"
                    style={{ backgroundColor: feature.color }}
                  />
                </div>

                {/* Contenido inferior */}
                <div className="px-3 pb-2">
                  <h3 className="text-lg font-semibold text-white/90 mb-2 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    {feature.desc}
                  </p>

                  {/* CTA con flecha */}
                  <div 
                    className="flex items-center gap-1 text-sm font-medium transition-colors"
                    style={{ color: feature.color }}
                  >
                    {feature.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}